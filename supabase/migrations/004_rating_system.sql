-- ============================================
-- Migration 004: Rating System
-- Clients can rate repartidores after delivery
-- ============================================

-- 1. Add rating column to orders
alter table public.orders add column rating smallint check (rating >= 1 and rating <= 5);

-- 2. RPC: rate_order (client rates a delivered order)
create or replace function public.rate_order(
  p_order_id uuid,
  p_rating smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_avg_rating numeric;
begin
  -- Validate rating
  if p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('success', false, 'error', 'La calificación debe ser entre 1 y 5');
  end if;

  -- Get and lock the order
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Pedido no encontrado');
  end if;

  -- Only the client who owns the order can rate
  if v_order.cliente_id != auth.uid() then
    return jsonb_build_object('success', false, 'error', 'No puedes calificar este pedido');
  end if;

  -- Only delivered orders can be rated
  if v_order.status != 'entregado' then
    return jsonb_build_object('success', false, 'error', 'Solo puedes calificar pedidos entregados');
  end if;

  -- Prevent re-rating
  if v_order.rating is not null then
    return jsonb_build_object('success', false, 'error', 'Ya calificaste este pedido');
  end if;

  -- Save rating on the order
  update public.orders
  set rating = p_rating
  where id = p_order_id;

  -- Recalculate repartidor average rating
  select round(avg(rating)::numeric, 1) into v_avg_rating
  from public.orders
  where repartidor_id = v_order.repartidor_id
    and rating is not null;

  update public.repartidores
  set rating = coalesce(v_avg_rating, 5.0)
  where id = v_order.repartidor_id;

  return jsonb_build_object('success', true, 'new_avg', v_avg_rating);
end;
$$;
