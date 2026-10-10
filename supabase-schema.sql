-- ==============================================================================
-- THE TOYS VIRAGO / ROUGE NOIR — Supabase Database Schema
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text,
  phone text,
  address text,
  city text,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric not null default 0,
  status text not null default 'pending', -- pending, confirmed, dispatched, delivered
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for orders
alter table public.orders enable row level security;

-- Allow anonymous visitors (your website checkout) to insert new orders
create policy "Allow anonymous order submission"
  on public.orders
  for insert
  to anon
  with check (true);

-- Allow admins (authenticated users) to view and update orders
create policy "Allow service or authenticated read on orders"
  on public.orders
  for select
  to authenticated
  using (true);


-- 2. NEWSLETTER & VIP VAULT SUBSCRIBERS TABLE
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'website',
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for subscribers
alter table public.subscribers enable row level security;

-- Allow anonymous visitors to subscribe
create policy "Allow anonymous newsletter signup"
  on public.subscribers
  for insert
  to anon
  with check (true);


-- 3. PRODUCTS CATALOG TABLE (Optional live sync)
create table if not exists public.products (
  id text primary key,
  title text not null,
  category text not null, -- toys, lubes, bdsm, games
  tagline text,
  price numeric not null,
  original_price numeric,
  badge text,
  image text not null,
  description text,
  specs text[] default '{}',
  variants jsonb default '[]'::jsonb,
  in_stock boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for products
alter table public.products enable row level security;

-- Allow public read access to active products
create policy "Allow public read access to products"
  on public.products
  for select
  to anon, authenticated
  using (true);
