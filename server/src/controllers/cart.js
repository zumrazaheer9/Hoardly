import { createError } from '../middleware/errorHandler.js';

const productFields = 'id, name, slug, price, compare_at_price, stock_quantity, images, is_active';

async function findAvailableProduct(client, productId) {
  const { data, error } = await client
    .from('products')
    .select(productFields)
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw createError(404, 'This product is no longer available. Please choose another item.');
  }

  return data;
}

function validateQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError(400, 'Quantity must be at least 1. Please choose a valid quantity.');
  }
  return quantity;
}

export async function getCart(req, res, next) {
  try {
    const { data, error } = await req.supabase
      .from('cart_items')
      .select(`id, product_id, quantity, created_at, updated_at, products(${productFields})`)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const productId = Number.parseInt(req.body.product_id, 10);
    const quantity = validateQuantity(req.body.quantity || 1);
    if (!Number.isInteger(productId)) {
      throw createError(400, 'A product is required. Please choose an item before adding it.');
    }

    const product = await findAvailableProduct(req.supabase, productId);
    const { data: existingItem, error: existingError } = await req.supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingError) throw existingError;
    const nextQuantity = (existingItem?.quantity || 0) + quantity;
    if (nextQuantity > product.stock_quantity) {
      throw createError(400, `Only ${product.stock_quantity} units are available. Please reduce the quantity and try again.`);
    }

    const query = existingItem
      ? req.supabase.from('cart_items').update({ quantity: nextQuantity }).eq('id', existingItem.id).eq('user_id', req.user.id)
      : req.supabase.from('cart_items').insert({ user_id: req.user.id, product_id: productId, quantity: nextQuantity });

    const { data, error } = await query
      .select(`id, product_id, quantity, created_at, updated_at, products(${productFields})`)
      .single();

    if (error) throw error;
    res.status(existingItem ? 200 : 201).json({ item: data, message: 'Item added to your cart.' });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const itemId = Number.parseInt(req.params.id, 10);
    const quantity = validateQuantity(req.body.quantity);
    if (!Number.isInteger(itemId)) {
      throw createError(400, 'Cart item could not be identified. Refresh the page and try again.');
    }

    const { data: currentItem, error: currentError } = await req.supabase
      .from('cart_items')
      .select('id, product_id')
      .eq('id', itemId)
      .eq('user_id', req.user.id)
      .single();

    if (currentError || !currentItem) {
      throw createError(404, 'That cart item was not found. Refresh your cart and try again.');
    }

    const product = await findAvailableProduct(req.supabase, currentItem.product_id);
    if (quantity > product.stock_quantity) {
      throw createError(400, `Only ${product.stock_quantity} units are available. Please reduce the quantity and try again.`);
    }

    const { data, error } = await req.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', req.user.id)
      .select(`id, product_id, quantity, created_at, updated_at, products(${productFields})`)
      .single();

    if (error) throw error;
    res.json({ item: data, message: 'Cart quantity updated.' });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const itemId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(itemId)) {
      throw createError(400, 'Cart item could not be identified. Refresh the page and try again.');
    }

    const { error } = await req.supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Item removed from your cart.' });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    const { error } = await req.supabase.from('cart_items').delete().eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
}
