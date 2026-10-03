import { supabase } from '../config/supabase.js';
import { createError } from '../middleware/errorHandler.js';
import { config } from '../config/env.js';

const FALLBACK_CATEGORIES = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    description: 'High quality electronics and smart gadgets engineered for precision and durability.',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    product_count: 2,
  },
  {
    id: 2,
    name: 'Apparel',
    slug: 'apparel',
    description: 'Minimal and durable clothing crafted from sustainable premium fabrics for daily wear.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    product_count: 2,
  },
  {
    id: 3,
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Modern home accessories and sustainable decor designed for balanced living spaces.',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    product_count: 2,
  },
];

export async function getCategories(req, res, next) {
  try {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, products(count)')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) {
        const formatted = data.map((c) => ({
          ...c,
          product_count: c.products?.[0]?.count || 0,
        }));
        return res.json({ categories: formatted });
      }
    } catch (error) {
      if (!config.allowDemoCatalog) throw error;
    }

    res.json({ categories: FALLBACK_CATEGORIES });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw createError(404, 'Category not found. The category requested does not exist.');
      if (data) {
        return res.json({ category: data });
      }
    } catch (error) {
      if (!config.allowDemoCatalog || error.statusCode === 404) throw error;
    }

    const cat = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
    if (!cat) {
      throw createError(404, 'Category not found. The category requested does not exist.');
    }

    res.json({ category: cat });
  } catch (err) {
    next(err);
  }
}
