import { supabase } from '../config/supabase.js';
import { createError } from '../middleware/errorHandler.js';
import { config } from '../config/env.js';

// Fallback seed catalog for local development when database is offline
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description: 'Engineered for acoustic precision and all-day comfort. Features 30-hour battery life and multi-point Bluetooth pairing.',
    price: 249.99,
    compare_at_price: 299.99,
    stock_quantity: 45,
    sku: 'ELEC-HEAD-001',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 1,
    category_name: 'Electronics',
    category_slug: 'electronics',
    is_active: true,
    avg_rating: 4.8,
    review_count: 28,
    attributes: {
      color: 'Matte Black',
      connectivity: 'Bluetooth 5.3',
      batteryLife: '30h',
      warranty: '2 Years',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Mechanical Keyboard TKL',
    slug: 'mechanical-keyboard-tkl',
    description: 'Tenkeyless mechanical keyboard with hot-swappable switches, sound-dampening foam, and PBT keycaps.',
    price: 129.5,
    compare_at_price: 149.0,
    stock_quantity: 30,
    sku: 'ELEC-KEYB-002',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 1,
    category_name: 'Electronics',
    category_slug: 'electronics',
    is_active: true,
    avg_rating: 4.7,
    review_count: 15,
    attributes: {
      layout: 'Tenkeyless (87 Keys)',
      switchType: 'Tactile Quiet',
      backlight: 'Warm White LED',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Heavyweight Organic Cotton Tee',
    slug: 'heavyweight-organic-cotton-tee',
    description: 'Crafted from 240 GSM organic ring-spun cotton. Pre-shrunk with a relaxed modern fit.',
    price: 38.0,
    compare_at_price: null,
    stock_quantity: 120,
    sku: 'APP-TEE-001',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 2,
    category_name: 'Apparel',
    category_slug: 'apparel',
    is_active: true,
    avg_rating: 4.6,
    review_count: 42,
    attributes: {
      material: '100% Organic Cotton',
      weight: '240 GSM',
      fit: 'Relaxed Fit',
      care: 'Machine Wash Cold',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Ceramic Pour-Over Coffee Dripper',
    slug: 'ceramic-pour-over-coffee-dripper',
    description: 'Handmade ceramic dripper designed for optimal thermal stability and extraction clarity.',
    price: 32.0,
    compare_at_price: null,
    stock_quantity: 60,
    sku: 'HOME-COFF-001',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 3,
    category_name: 'Home & Living',
    category_slug: 'home-living',
    is_active: true,
    avg_rating: 4.9,
    review_count: 19,
    attributes: {
      material: 'Glazed Ceramic',
      capacity: '1 to 4 Cups',
      origin: 'Artisan Crafted',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Minimalist Aluminum Desk Lamp',
    slug: 'minimalist-aluminum-desk-lamp',
    description: 'Anodized aluminum task light featuring step-less dimming and color temperature adjustment from 2700K to 5000K.',
    price: 89.0,
    compare_at_price: 110.0,
    stock_quantity: 25,
    sku: 'HOME-LAMP-002',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 3,
    category_name: 'Home & Living',
    category_slug: 'home-living',
    is_active: true,
    avg_rating: 4.8,
    review_count: 12,
    attributes: {
      finish: 'Matte Space Gray',
      power: 'USB-C Powered',
      brightness: '800 Lumens',
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Merino Wool Daily Beanie',
    slug: 'merino-wool-daily-beanie',
    description: 'Ultra-fine 100% merino wool knit providing temperature regulation and natural moisture management.',
    price: 45.0,
    compare_at_price: null,
    stock_quantity: 80,
    sku: 'APP-BEAN-002',
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    ],
    category_id: 2,
    category_name: 'Apparel',
    category_slug: 'apparel',
    is_active: true,
    avg_rating: 4.7,
    review_count: 31,
    attributes: {
      material: '100% Extra-Fine Merino Wool',
      size: 'One Size Fits All',
    },
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_REVIEWS = [
  {
    id: 1,
    product_id: 1,
    user_id: 'sample-user-1',
    user_name: 'Marcus Vance',
    rating: 5,
    title: 'Superb sound stage and noise isolation',
    body: 'The active noise cancellation matches and exceeds expectations in busy workspace environments. Comfortable through entire 8-hour shifts.',
    is_verified_purchase: true,
    created_at: '2026-09-15T12:00:00Z',
  },
  {
    id: 2,
    product_id: 1,
    user_id: 'sample-user-2',
    user_name: 'Sarah Lin',
    rating: 4,
    title: 'Solid build quality and reliable connection',
    body: 'Pairs seamlessly between phone and laptop. Audio quality is neutral and detailed.',
    is_verified_purchase: true,
    created_at: '2026-09-18T15:30:00Z',
  },
  {
    id: 3,
    product_id: 2,
    user_id: 'sample-user-3',
    user_name: 'David Chen',
    rating: 5,
    title: 'Pleasant tactile feedback without excessive noise',
    body: 'The acoustic dampening makes this keyboard a pleasure to type on during late hours. Excellent build heft and keycap texture.',
    is_verified_purchase: true,
    created_at: '2026-09-20T09:15:00Z',
  },
];

export async function getProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 12));
    const search = req.query.search?.trim().toLowerCase() || '';
    const category = req.query.category?.trim().toLowerCase() || '';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const minRating = req.query.rating ? parseFloat(req.query.rating) : null;
    const sort = req.query.sort || 'newest';

    // Attempt Supabase query
    try {
      let query = supabase
        .from('products')
        .select('*, categories!inner(id, name, slug)', { count: 'exact' })
        .eq('is_active', true);

      if (category) {
        query = /^\d+$/.test(category) ? query.eq('category_id', Number(category)) : query.eq('categories.slug', category);
      }

      if (search) {
        const pattern = `%${search.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}%`;
        query = query.or(`name.ilike."${pattern}",description.ilike."${pattern}"`);
      }

      if (minPrice !== null && !isNaN(minPrice)) {
        query = query.gte('price', minPrice);
      }
      if (maxPrice !== null && !isNaN(maxPrice)) {
        query = query.lte('price', maxPrice);
      }
      if (minRating !== null && !isNaN(minRating)) {
        query = query.gte('avg_rating', minRating);
      }

      if (sort === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (sort === 'rating') {
        query = query.order('avg_rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;
      if (data) {
        const formatted = data.map((item) => ({
          ...item,
          category_name: item.categories?.name,
          category_slug: item.categories?.slug,
        }));
        return res.json({
          products: formatted,
          pagination: {
            page,
            limit,
            total: count ?? formatted.length,
            totalPages: Math.max(1, Math.ceil((count ?? formatted.length) / limit)),
          },
        });
      }
    } catch (error) {
      if (!config.allowDemoCatalog) throw error;
    }

    // Fallback in-memory catalog
    let filtered = [...FALLBACK_PRODUCTS];

    if (category) {
      filtered = filtered.filter(
        (p) =>
          p.category_slug.toLowerCase() === category ||
          String(p.category_id) === category
      );
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      filtered = filtered.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }
    if (minRating !== null && !isNaN(minRating)) {
      filtered = filtered.filter((p) => p.avg_rating >= minRating);
    }

    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.avg_rating - a.avg_rating);
    } else {
      filtered.sort((a, b) => b.id - a.id);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    res.json({
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw createError(404, 'The requested product could not be found. It may be discontinued or unavailable.');
      if (data) {
        return res.json({
          product: {
            ...data,
            category_name: data.categories?.name,
            category_slug: data.categories?.slug,
          },
        });
      }
    } catch (error) {
      if (!config.allowDemoCatalog || error.statusCode === 404) throw error;
    }

    const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    if (!product) {
      throw createError(404, 'The requested product could not be found. It may be discontinued or unavailable.');
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(full_name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const formatted = data.map((r) => ({
          ...r,
          user_name: r.users?.full_name || 'Verified Customer',
        }));
        return res.json({ reviews: formatted });
      }
    } catch (error) {
      if (!config.allowDemoCatalog) throw error;
    }

    const reviews = FALLBACK_REVIEWS.filter((r) => r.product_id === productId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

export async function getReviewEligibility(req, res, next) {
  try {
    const productId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(productId)) {
      throw createError(400, 'Product could not be identified. Refresh the page and try again.');
    }

    const { data, error } = await req.supabase
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('user_id', req.user.id)
      .eq('status', 'delivered')
      .eq('order_items.product_id', productId)
      .limit(1);

    if (error) throw error;
    res.json({ eligible: Boolean(data?.length) });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const productId = parseInt(req.params.id, 10);
    const { rating, title, body } = req.body;

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      throw createError(400, 'Rating is required. Please provide a rating between 1 and 5 stars.');
    }
    if (!title?.trim()) {
      throw createError(400, 'Review title is missing. Please provide a concise summary headline for your review.');
    }
    if (!body?.trim()) {
      throw createError(400, 'Review body is missing. Please write your feedback describing your experience with the item.');
    }

    const { data: purchases, error: purchaseError } = await req.supabase
      .from('orders')
      .select('id, order_items!inner(product_id)')
      .eq('user_id', req.user.id)
      .eq('status', 'delivered')
      .eq('order_items.product_id', productId)
      .limit(1);

    if (purchaseError) throw purchaseError;
    if (!purchases?.length) {
      throw createError(403, 'A delivered purchase is required before reviewing this product.');
    }

    const reviewData = {
      product_id: productId,
      user_id: req.user.id,
      rating: parseInt(rating, 10),
      title: title.trim(),
      body: body.trim(),
      is_verified_purchase: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await req.supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({
      message: 'Review submitted successfully.',
      review: {
        ...data,
        user_name: req.user.user_metadata?.full_name || 'Verified Customer',
      },
    });
  } catch (err) {
    next(err);
  }
}
