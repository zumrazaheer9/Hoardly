-- Keep privilege assignment server-controlled and add atomic commerce operations.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.sync_user_email()
returns trigger as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_user_email();

with ranked_defaults as (
  select id, row_number() over (partition by user_id order by created_at, id) as position
  from public.addresses
  where is_default
)
update public.addresses as address
set is_default = false
from ranked_defaults
where address.id = ranked_defaults.id and ranked_defaults.position > 1;

create unique index if not exists idx_addresses_one_default_per_user
  on public.addresses(user_id) where is_default;

create or replace function public.set_default_address(p_address_id integer)
returns public.addresses as $$
declare
  v_user_id uuid := auth.uid();
  v_address public.addresses;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  update public.addresses set is_default = false where user_id = v_user_id;
  update public.addresses
  set is_default = true
  where id = p_address_id and user_id = v_user_id
  returning * into v_address;

  if not found then
    raise exception 'Address not found.' using errcode = 'P0002';
  end if;

  return v_address;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.set_default_address(integer) from public;
grant execute on function public.set_default_address(integer) to authenticated;

create or replace function public.place_order(
  p_shipping_address jsonb,
  p_discount_code text default null
)
returns jsonb as $$
declare
  v_user_id uuid := auth.uid();
  v_item record;
  v_discount public.discount_codes;
  v_subtotal numeric(10, 2) := 0;
  v_cart_count integer := 0;
  v_discount_amount numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_order public.orders;
  v_updated integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '28000';
  end if;

  if p_shipping_address is null or jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'A delivery address is required.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(array['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code', 'country']) as field_name
    where nullif(trim(p_shipping_address->>field_name), '') is null
  ) then
    raise exception 'Complete all required delivery address fields.' using errcode = '22023';
  end if;

  perform 1 from public.cart_items where user_id = v_user_id for update;

  for v_item in
    select ci.id, ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity, p.is_active
    from public.cart_items as ci
    join public.products as p on p.id = ci.product_id
    where ci.user_id = v_user_id
    order by p.id
    for update of ci, p
  loop
    v_cart_count := v_cart_count + 1;
    if not v_item.is_active or v_item.quantity > v_item.stock_quantity then
      raise exception 'Insufficient stock for %.', v_item.name using errcode = 'P0001';
    end if;
    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  end loop;

  if v_cart_count = 0 then
    raise exception 'Your cart is empty.' using errcode = 'P0001';
  end if;
  v_subtotal := round(v_subtotal, 2);

  if nullif(trim(p_discount_code), '') is not null then
    select * into v_discount
    from public.discount_codes
    where code = upper(trim(p_discount_code))
    for update;

    if not found
      or not v_discount.is_active
      or (v_discount.expires_at is not null and v_discount.expires_at <= now())
      or (v_discount.max_uses is not null and v_discount.current_uses >= v_discount.max_uses) then
      raise exception 'This discount code is invalid or no longer available.' using errcode = 'P0001';
    end if;

    if v_discount.min_order_amount is not null and v_subtotal < v_discount.min_order_amount then
      raise exception 'Your order does not meet the minimum amount for this discount.' using errcode = 'P0001';
    end if;

    if v_discount.type = 'percentage' then
      v_discount_amount := round(v_subtotal * v_discount.value / 100, 2);
    else
      v_discount_amount := least(v_subtotal, v_discount.value);
    end if;
  end if;

  v_total := greatest(0, v_subtotal - v_discount_amount);

  insert into public.orders (
    user_id, order_number, subtotal, discount_amount, total, payment_method,
    shipping_address, discount_code_id
  ) values (
    v_user_id,
    'HRD-' || upper(replace(gen_random_uuid()::text, '-', '')),
    v_subtotal,
    v_discount_amount,
    v_total,
    'cod',
    p_shipping_address,
    v_discount.id
  ) returning * into v_order;

  for v_item in
    select ci.product_id, ci.quantity, p.price
    from public.cart_items as ci
    join public.products as p on p.id = ci.product_id
    where ci.user_id = v_user_id
    order by p.id
  loop
    update public.products
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.product_id and stock_quantity >= v_item.quantity;
    get diagnostics v_updated = row_count;
    if v_updated <> 1 then
      raise exception 'Product stock changed while placing the order.' using errcode = 'P0001';
    end if;

    insert into public.order_items (order_id, product_id, quantity, unit_price, total_price)
    values (
      v_order.id,
      v_item.product_id,
      v_item.quantity,
      v_item.price,
      round(v_item.price * v_item.quantity, 2)
    );
  end loop;

  if v_discount.id is not null then
    update public.discount_codes
    set current_uses = current_uses + 1
    where id = v_discount.id;
  end if;

  delete from public.cart_items where user_id = v_user_id;
  return to_jsonb(v_order);
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.place_order(jsonb, text) from public;
grant execute on function public.place_order(jsonb, text) to authenticated;

create or replace function public.refresh_product_rating()
returns trigger as $$
declare
  v_product_id integer;
begin
  v_product_id := case when tg_op = 'DELETE' then old.product_id else new.product_id end;

  update public.products
  set avg_rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = v_product_id), 0),
      review_count = (select count(*) from public.reviews where product_id = v_product_id)
  where id = v_product_id;

  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    update public.products
    set avg_rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = old.product_id), 0),
        review_count = (select count(*) from public.reviews where product_id = old.product_id)
    where id = old.product_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists tr_reviews_refresh_product_rating on public.reviews;
create trigger tr_reviews_refresh_product_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

update public.products
set avg_rating = 0, review_count = 0;

update public.products as product
set avg_rating = coalesce(aggregate.rating, 0),
    review_count = coalesce(aggregate.review_count, 0)
from (
  select product_id, round(avg(rating)::numeric, 2) as rating, count(*) as review_count
  from public.reviews
  group by product_id
) as aggregate
where product.id = aggregate.product_id;