-- Aguaya - Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS PROFILE (extends auth.users)
-- ============================================
create type user_role as enum ('cliente', 'repartidor', 'admin');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  phone text,
  name text not null,
  role user_role not null default 'cliente',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================
-- REPARTIDORES (driver profiles)
-- ============================================
create type repartidor_status as enum ('disponible', 'ocupado', 'offline');

create table public.repartidores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  status repartidor_status not null default 'offline',
  lat double precision default -33.4489,
  lng double precision default -70.6693,
  rating numeric(2,1) default 5.0,
  total_entregas integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.repartidores enable row level security;

create policy "Repartidores are viewable by everyone"
  on public.repartidores for select using (true);

create policy "Repartidores can update own profile"
  on public.repartidores for update using (auth.uid() = user_id);

-- ============================================
-- ORDERS
-- ============================================
create type order_status as enum ('pendiente', 'asignado', 'en_camino', 'entregado', 'cancelado');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.profiles(id) on delete cascade not null,
  repartidor_id uuid references public.repartidores(id) on delete set null,
  cantidad_bidones integer not null check (cantidad_bidones >= 1 and cantidad_bidones <= 10),
  precio_unitario integer not null default 4500,
  total integer not null,
  comision_plataforma integer not null default 500,
  address text not null,
  lat double precision,
  lng double precision,
  status order_status not null default 'pendiente',
  scheduled_at timestamptz,
  accepted_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Clients can view own orders"
  on public.orders for select using (
    auth.uid() = cliente_id
    or auth.uid() in (select user_id from public.repartidores where id = repartidor_id)
    or auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Clients can create orders"
  on public.orders for insert with check (auth.uid() = cliente_id);

create policy "Orders can be updated by assigned repartidor or admin"
  on public.orders for update using (
    auth.uid() in (select user_id from public.repartidores where id = repartidor_id)
    or auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- ============================================
-- PAYMENTS (settlements to repartidores)
-- ============================================
create type payment_status as enum ('pendiente', 'pagado');

create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  repartidor_id uuid references public.repartidores(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  monto_bruto integer not null,
  comision integer not null,
  monto_neto integer not null,
  status payment_status not null default 'pendiente',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Repartidores can view own payments"
  on public.payments for select using (
    auth.uid() in (select user_id from public.repartidores where id = repartidor_id)
    or auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Only admins can update payments"
  on public.payments for update using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- ============================================
-- PLATFORM CONFIG
-- ============================================
create table public.platform_config (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.platform_config enable row level security;

create policy "Config is viewable by everyone"
  on public.platform_config for select using (true);

create policy "Only admins can update config"
  on public.platform_config for update using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Default config values
insert into public.platform_config (key, value) values
  ('precio_bidon', '4500'),
  ('comision_plataforma', '500'),
  ('pago_repartidor', '3000'),
  ('descuento_3_bidones', '5'),
  ('descuento_5_bidones', '10');

-- ============================================
-- ZONES (coverage areas)
-- ============================================
create table public.zones (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  active boolean default true,
  precio_base integer default 4500,
  created_at timestamptz not null default now()
);

alter table public.zones enable row level security;

create policy "Zones viewable by everyone"
  on public.zones for select using (true);

-- Default zones
insert into public.zones (name) values
  ('Providencia'),
  ('Las Condes'),
  ('Ñuñoa'),
  ('Vitacura'),
  ('Santiago Centro');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'cliente')
  );

  -- If role is repartidor, create repartidor profile
  if coalesce(new.raw_user_meta_data->>'role', 'cliente') = 'repartidor' then
    insert into public.repartidores (user_id) values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create payment when order is delivered
create or replace function public.handle_order_delivered()
returns trigger as $$
begin
  if new.status = 'entregado' and old.status != 'entregado' and new.repartidor_id is not null then
    insert into public.payments (repartidor_id, order_id, monto_bruto, comision, monto_neto)
    values (
      new.repartidor_id,
      new.id,
      new.total,
      new.comision_plataforma * new.cantidad_bidones,
      new.total - (new.comision_plataforma * new.cantidad_bidones)
    );

    -- Increment repartidor delivery count
    update public.repartidores
    set total_entregas = total_entregas + 1, updated_at = now()
    where id = new.repartidor_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_order_delivered
  after update on public.orders
  for each row execute procedure public.handle_order_delivered();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_repartidores_updated_at before update on public.repartidores
  for each row execute procedure public.update_updated_at();

create trigger update_orders_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();

-- ============================================
-- REALTIME (enable for live order updates)
-- ============================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.repartidores;
