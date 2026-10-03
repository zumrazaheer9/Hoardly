import { createError } from '../middleware/errorHandler.js';

const productFields = 'id, name, slug, price, compare_at_price, stock_quantity, images, avg_rating, review_count, category_id, is_active';

export async function getWishlist(req, res, next) {
  try {
    const { data, error } = await req.supabase
      .from('wishlists')
      .select(`id, product_id, created_at, products(${productFields})`)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function addWishlistItem(req, res, next) {
  try {
    const productId = Number.parseInt(req.body.product_id, 10);
    if (!Number.isInteger(productId)) {
      throw createError(400, 'A product is required. Please choose an item before saving it.');
    }

    const { data: product, error: productError } = await req.supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      throw createError(404, 'This product is no longer available. Please choose another item.');
    }

    const { data, error } = await req.supabase
      .from('wishlists')
      .upsert({ user_id: req.user.id, product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true })
      .select(`id, product_id, created_at, products(${productFields})`)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return res.status(201).json({ item: data, message: 'Item saved to your wishlist.' });
    }

    const { data: existingItem, error: existingError } = await req.supabase
      .from('wishlists')
      .select(`id, product_id, created_at, products(${productFields})`)
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .single();

    if (existingError) throw existingError;
    res.json({ item: existingItem, message: 'Item is already saved to your wishlist.' });
  } catch (error) {
    next(error);
  }
}

export async function removeWishlistItem(req, res, next) {
  try {
    const productId = Number.parseInt(req.params.productId, 10);
    if (!Number.isInteger(productId)) {
      throw createError(400, 'Saved item could not be identified. Refresh the page and try again.');
    }

    const { error } = await req.supabase
      .from('wishlists')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId);

    if (error) throw error;
    res.json({ message: 'Item removed from your wishlist.' });
  } catch (error) {
    next(error);
  }
}
