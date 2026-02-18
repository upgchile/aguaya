-- Fix: Add phone + safe role casting + search_path for trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role public.user_role;
begin
  -- Safe role casting
  begin
    _role := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when others then
    _role := 'cliente';
  end;

  insert into public.profiles (id, email, phone, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(_role, 'cliente')
  );

  -- If role is repartidor, create repartidor profile
  if coalesce(new.raw_user_meta_data->>'role', 'cliente') = 'repartidor' then
    insert into public.repartidores (user_id) values (new.id);
  end if;

  return new;
end;
$$;

-- Fix: Repartidores need to see pending orders to accept them
create policy "Repartidores can view pending orders"
  on public.orders for select using (
    auth.uid() in (select user_id from public.repartidores)
    and status in ('pendiente', 'asignado', 'en_camino')
  );

-- Fix: Repartidores can accept/update orders assigned to them
create policy "Repartidores can accept pending orders"
  on public.orders for update using (
    auth.uid() in (select user_id from public.repartidores)
  );

-- Fix: Admins can insert payments
create policy "Admins can insert payments"
  on public.payments for insert with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Fix: Admins can view all orders
create policy "Admins can view all orders"
  on public.orders for select using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Fix: Admins can manage users
create policy "Admins can view all profiles"
  on public.profiles for select using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Fix: Admins can update all profiles
create policy "Admins can update all profiles"
  on public.profiles for update using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );
