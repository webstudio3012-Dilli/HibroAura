-- HibroAura — Supabase setup. Paste into Supabase → SQL Editor → Run (safe to re-run).

-- 1. Owner allow-list + helper ------------------------------------------------
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

drop policy if exists "admin reads admins" on public.admins;
create policy "admin reads admins" on public.admins for select using (user_id = auth.uid());

-- 2. Site settings (logo, hero, offer, contact, images ...) as key → JSON ------
create table if not exists public.site_settings (
  key text primary key, value jsonb, updated_at timestamptz not null default now());
alter table public.site_settings enable row level security;
drop policy if exists "public reads settings" on public.site_settings;
drop policy if exists "admin writes settings" on public.site_settings;
create policy "public reads settings" on public.site_settings for select using (true);
create policy "admin writes settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- 3. Products -----------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (category in ('hair','skin')),
  description text check (char_length(description) <= 2000),
  benefits text check (char_length(benefits) <= 2000),
  ingredients text check (char_length(ingredients) <= 2000),
  size text check (char_length(size) <= 40),
  price numeric(10,2) not null default 0 check (price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  image_url text, hover_image_url text,
  available boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());
alter table public.products enable row level security;
drop policy if exists "public reads products" on public.products;
drop policy if exists "admin writes products" on public.products;
create policy "public reads products" on public.products for select using (true);
create policy "admin writes products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- 4. Testimonials: anyone may submit PENDING ones; only approved are public ----
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  text text not null check (char_length(text) between 10 and 600),
  rating int check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now());
alter table public.testimonials enable row level security;
drop policy if exists "public reads approved" on public.testimonials;
drop policy if exists "public submits pending" on public.testimonials;
drop policy if exists "admin manages testimonials" on public.testimonials;
create policy "public reads approved" on public.testimonials for select using (status = 'approved' or public.is_admin());
create policy "public submits pending" on public.testimonials for insert to anon, authenticated with check (status = 'pending');
create policy "admin manages testimonials" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

-- 5. Customer enquiries (logged when a customer opens a WhatsApp order) --------
-- NOT confirmed orders: the customer still has to press Send in WhatsApp.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text check (char_length(customer_name) <= 60),
  phone text check (char_length(phone) <= 20),
  product_name text check (char_length(product_name) <= 120),
  quantity int check (quantity between 1 and 100),
  total numeric(10,2),
  address text check (char_length(address) <= 300),
  created_at timestamptz not null default now());
alter table public.enquiries enable row level security;
drop policy if exists "public logs enquiry" on public.enquiries;
drop policy if exists "admin manages enquiries" on public.enquiries;
create policy "public logs enquiry" on public.enquiries for insert to anon, authenticated with check (true);
create policy "admin manages enquiries" on public.enquiries for all using (public.is_admin()) with check (public.is_admin());

-- 6. Image storage: public read, owner-only write, JPG/PNG/WebP up to 3 MB -----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "public reads media" on storage.objects;
drop policy if exists "admin writes media" on storage.objects;
create policy "public reads media" on storage.objects for select using (bucket_id = 'site-media');
create policy "admin writes media" on storage.objects for all
  using (bucket_id = 'site-media' and public.is_admin()) with check (bucket_id = 'site-media' and public.is_admin());

-- 7. After creating the owner in Authentication → Users, run this once:
--    insert into public.admins (user_id) select id from auth.users where email = 'pooja_aura@hibroaura.app';
