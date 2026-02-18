-- ============================================
-- Migration 003: RPC Functions + RLS Cleanup
-- Atomic order acceptance, status advancement, admin stats
-- ============================================

-- ============================================
-- 1. RPC: accept_order (atomic with row lock)
-- ============================================
create or replace function public.accept_order(
  p_order_id uuid,
  p_repartidor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  -- Lock the order row to prevent race conditions
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Pedido no encontrado');
  end if;

  if v_order.status != 'pendiente' then
    return jsonb_build_object('success', false, 'error', 'Pedido ya fue tomado por otro repartidor');
  end if;

  -- Assign order to repartidor
  update public.orders
  set status = 'asignado',
      repartidor_id = p_repartidor_id,
      accepted_at = now()
  where id = p_order_id;

  -- Set repartidor as occupied
  update public.repartidores
  set status = 'ocupado'
  where id = p_repartidor_id;

  return jsonb_build_object('success', true);
end;
$$;

-- ============================================
-- 2. RPC: advance_order_status (state machine)
-- ============================================
create or replace function public.advance_order_status(
  p_order_id uuid,
  p_repartidor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Pedido no encontrado');
  end if;

  if v_order.repartidor_id != p_repartidor_id then
    return jsonb_build_object('success', false, 'error', 'Este pedido no te pertenece');
  end if;

  -- State machine: asignado -> en_camino -> entregado
  if v_order.status = 'asignado' then
    update public.orders
    set status = 'en_camino'
    where id = p_order_id;

    return jsonb_build_object('success', true, 'new_status', 'en_camino');

  elsif v_order.status = 'en_camino' then
    update public.orders
    set status = 'entregado',
        delivered_at = now()
    where id = p_order_id;

    -- Repartidor becomes available again
    update public.repartidores
    set status = 'disponible'
    where id = p_repartidor_id;

    -- Payment is created automatically by the existing handle_order_delivered trigger

    return jsonb_build_object('success', true, 'new_status', 'entregado');

  else
    return jsonb_build_object('success', false, 'error', 'No se puede avanzar desde el estado actual: ' || v_order.status::text);
  end if;
end;
$$;

-- ============================================
-- 3. RPC: get_admin_stats
-- ============================================
create or replace function public.get_admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today_orders integer;
  v_today_revenue integer;
  v_active_repartidores integer;
  v_total_delivered integer;
  v_total_orders integer;
  v_delivery_rate numeric;
begin
  -- Orders created today
  select count(*) into v_today_orders
  from public.orders
  where created_at::date = current_date;

  -- Revenue today (sum of comision_plataforma for delivered orders today)
  select coalesce(sum(comision_plataforma * cantidad_bidones), 0) into v_today_revenue
  from public.orders
  where created_at::date = current_date
    and status = 'entregado';

  -- Active repartidores (disponible or ocupado)
  select count(*) into v_active_repartidores
  from public.repartidores
  where status in ('disponible', 'ocupado');

  -- Delivery rate
  select count(*) into v_total_delivered
  from public.orders
  where status = 'entregado';

  select count(*) into v_total_orders
  from public.orders
  where status != 'cancelado';

  if v_total_orders > 0 then
    v_delivery_rate := round((v_total_delivered::numeric / v_total_orders::numeric) * 100);
  else
    v_delivery_rate := 0;
  end if;

  return jsonb_build_object(
    'today_orders', v_today_orders,
    'today_revenue', v_today_revenue,
    'active_repartidores', v_active_repartidores,
    'delivery_rate', v_delivery_rate
  );
end;
$$;

-- ============================================
-- 4. RLS Cleanup: Consolidate order policies
-- ============================================

-- Drop overlapping policies from migration 001 and 002
drop policy if exists "Clients can view own orders" on public.orders;
drop policy if exists "Orders can be updated by assigned repartidor or admin" on public.orders;
drop policy if exists "Repartidores can view pending orders" on public.orders;
drop policy if exists "Repartidores can accept pending orders" on public.orders;
drop policy if exists "Admins can view all orders" on public.orders;

-- Recreate clean policies
-- 1. Clientes see their own orders
create policy "orders_select_cliente"
  on public.orders for select using (
    auth.uid() = cliente_id
  );

-- 2. Repartidores see pending orders + orders assigned to them
create policy "orders_select_repartidor"
  on public.orders for select using (
    auth.uid() in (select user_id from public.repartidores)
    and (
      status = 'pendiente'
      or repartidor_id in (select id from public.repartidores where user_id = auth.uid())
    )
  );

-- 3. Admins see everything
create policy "orders_select_admin"
  on public.orders for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Admins can update orders
create policy "orders_update_admin"
  on public.orders for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Keep the existing insert policy from 001 (Clients can create orders)
-- Keep the existing insert policy from 001 unchanged

-- ============================================
-- 5. Enable realtime for payments table
-- ============================================
alter publication supabase_realtime add table public.payments;
