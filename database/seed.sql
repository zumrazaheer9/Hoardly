-- Seed data for categories, products, discount codes, and sample user profiles

-- 1. Categories
insert into public.categories (id, name, slug, description, image_url) values
  (1, 'Electronics', 'electronics', 'High quality electronics and smart gadgets', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),
  (2, 'Apparel', 'apparel', 'Minimal and durable clothing for everyday life', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'),
  (3, 'Home & Living', 'home-living', 'Modern home accessories and sustainable decor', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

alter sequence public.categories_id_seq restart with 4;

-- 2. Products
insert into public.products (id, name, slug, description, price, compare_at_price, stock_quantity, sku, images, category_id, is_active, avg_rating, review_count, attributes) values
  (
    1,
    'Wireless Noise-Cancelling Headphones',
    'wireless-noise-cancelling-headphones',
    'Engineered for acoustic precision and all-day comfort. Features 30-hour battery life and multi-point Bluetooth pairing.',
    249.99,
    299.99,
    45,
    'ELEC-HEAD-001',
    array['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    1,
    true,
    4.8,
    28,
    '{"color": "Matte Black", "connectivity": "Bluetooth 5.3", "batteryLife": "30h"}'::jsonb
  ),
  (
    2,
    'Mechanical Mechanical Keyboard',
    'mechanical-keyboard-tkl',
    'Tenkeyless mechanical keyboard with hot-swappable switches, sound-dampening foam, and PBT keycaps.',
    129.50,
    149.00,
    30,
    'ELEC-KEYB-002',
    array['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
    1,
    true,
    4.7,
    15,
    '{"layout": "TKL", "switchType": "Tactile Quiet", "backlight": "Warm White"}'::jsonb
  ),
  (
    3,
    'Heavyweight Organic Cotton Tee',
    'heavyweight-organic-cotton-tee',
    'Crafted from 240 GSM organic ring-spun cotton. Pre-shrunk with a relaxed modern fit.',
    38.00,
    null,
    120,
    'APP-TEE-001',
    array['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    2,
    true,
    4.6,
    42,
    '{"material": "100% Organic Cotton", "weight": "240 GSM", "fit": "Relaxed"}'::jsonb
  ),
  (
    4,
    'Ceramic Pour-Over Coffee Dripper',
    'ceramic-pour-over-coffee-dripper',
    'Handmade ceramic dripper designed for optimal thermal stability and extraction clarity.',
    32.00,
    null,
    60,
    'HOME-COFF-001',
    array['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
    3,
    true,
    4.9,
    19,
    '{"material": "Glazed Stoneware", "capacity": "1-4 Cups", "dishwasherSafe": true}'::jsonb
  )
on conflict (id) do nothing;

alter sequence public.products_id_seq restart with 5;

-- 3. Discount Codes
insert into public.discount_codes (id, code, type, value, min_order_amount, max_uses, current_uses, is_active) values
  (1, 'WELCOME10', 'percentage', 10.00, 50.00, 1000, 0, true),
  (2, 'SAVE25', 'fixed', 25.00, 100.00, 500, 0, true)
on conflict (id) do nothing;

alter sequence public.discount_codes_id_seq restart with 3;
