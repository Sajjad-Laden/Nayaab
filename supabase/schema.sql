-- Nayaab Store database schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '',
  category text not null,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_district text not null,
  note text not null default '',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_charge numeric(12,2) not null check (delivery_charge >= 0),
  total numeric(12,2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('cod','bkash','nagad')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending_verification','paid','failed','refunded')),
  bkash_trx_id text,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 50),
  line_total numeric(12,2) not null check (line_total >= 0)
);

alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products for select to anon, authenticated using (is_active = true or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Admin membership is not readable or writable directly from the browser.
drop policy if exists "Admins view orders" on public.orders;
create policy "Admins view orders" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins view order items" on public.order_items;
create policy "Admins view order items" on public.order_items for select to authenticated using (public.is_admin());
-- No public insert/select policies on orders or order_items. Edge Function uses service role.

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- Optional starter products (replace images/prices/stock with your real catalog).
insert into public.products(name,description,category,price,compare_at_price,stock,image_url,is_featured) values
('Studio Wireless Headphones','Comfortable everyday wireless headphones.','Electronics',1890,2290,12,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',true),
('Everyday Classic Sneakers','Versatile everyday sneakers.','Fashion',2450,null,8,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',true),
('Minimal Ceramic Table Set','A clean, minimal tableware set.','Home & Living',1250,1490,15,'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=80',true),
('Daily Glow Skincare Kit','A simple daily skincare selection.','Beauty',980,null,20,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',true)
on conflict do nothing;
insert into public.admin_users(user_id)
select id
from auth.users
where email = 'sajjad@gmail.com'
on conflict (user_id) do nothing;