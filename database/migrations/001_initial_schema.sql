-- Migration: 001_initial_schema.sql
-- Description: Complete initial schema with tables, constraints, indexes, triggers, and RLS policies

-- 1. Extensions
create extension if not exists "uuid-ossp";

-- 2. Users Table (synchronized with auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Categories Table
create table if not exists public.categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id int references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 4. Products Table
create table if not exists public.products (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku text not null unique,
  images text[] not null default '{}',
  category_id int not null references public.categories(id) on delete restrict,
  is_active boolean not null default true,
  avg_rating numeric(3, 2) not null default 0 check (avg_rating >= 0 and avg_rating <= 5),
  review_count int not null default 0 check (review_count >= 0),
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Cart Items Table
create table if not exists public.cart_items (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  product_id int not null references public.products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_cart_user_product unique (user_id, product_id)
);

-- 6. Discount Codes Table
create table if not exists public.discount_codes (
  id serial primary key,
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10, 2) not null check (value > 0),
  min_order_amount numeric(10, 2) check (min_order_amount >= 0),
  max_uses int check (max_uses > 0),
  current_uses int not null default 0 check (current_uses >= 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 7. Orders Table
create table if not exists public.orders (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete restrict,
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  total numeric(10, 2) not null check (total >= 0),
  payment_method text not null default 'cod',
  shipping_address jsonb not null,
  discount_code_id int references public.discount_codes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Order Items Table
create table if not exists public.order_items (
  id serial primary key,
  order_id int not null references public.orders(id) on delete cascade,
  product_id int not null references public.products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  total_price numeric(10, 2) not null check (total_price >= 0)
);

-- 9. Addresses Table
create table if not exists public.addresses (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  label text not null default 'home' check (label in ('home', 'work', 'other')),
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 10. Wishlists Table
create table if not exists public.wishlists (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  product_id int not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_wishlist_user_product unique (user_id, product_id)
);

-- 11. Reviews Table
create table if not exists public.reviews (
  id serial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  product_id int not null references public.products(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_review_user_product unique (user_id, product_id)
);

-- Indexes for performance
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_cart_items_user on public.cart_items(user_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger tr_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

create trigger tr_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

create trigger tr_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger tr_reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

-- Trigger to sync auth.users to public.users
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
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;

-- Helper to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- RLS Policies: users
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));

-- RLS Policies: categories
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- RLS Policies: products
create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- RLS Policies: cart_items
create policy "Users can manage own cart items"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies: discount_codes
create policy "Active discount codes are viewable by authenticated users"
  on public.discount_codes for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (public.is_admin());

-- RLS Policies: orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- RLS Policies: order_items
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert order items for own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- RLS Policies: addresses
create policy "Users can manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies: wishlists
create policy "Users can manage own wishlists"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies: reviews
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users or admins can delete reviews"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin());
