create or replace function public.get_admin_stats()
returns jsonb as $$
declare
  v_stats jsonb;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_orders', (select count(*) from public.orders),
    'pending_orders', (select count(*) from public.orders where status = 'pending'),
    'total_revenue', coalesce((select sum(total) from public.orders where status <> 'cancelled'), 0),
    'active_products', (select count(*) from public.products where is_active),
    'total_users', (select count(*) from public.users where role = 'customer')
  ) into v_stats;

  return v_stats;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.get_admin_stats() from public;
grant execute on function public.get_admin_stats() to authenticated;