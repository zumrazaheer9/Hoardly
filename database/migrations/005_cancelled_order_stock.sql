begin;

create or replace function public.restore_cancelled_order_stock()
returns trigger as $$
declare
  v_item record;
begin
  if new.status = 'cancelled' and old.status in ('pending', 'confirmed') then
    for v_item in
      select product_id, sum(quantity) as quantity
      from public.order_items
      where order_id = new.id
      group by product_id
      order by product_id
    loop
      update public.products
      set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.product_id;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists tr_orders_restore_cancelled_stock on public.orders;
create trigger tr_orders_restore_cancelled_stock
  after update of status on public.orders
  for each row execute function public.restore_cancelled_order_stock();

commit;
