import { createError } from '../middleware/errorHandler.js';

function parseId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw createError(400, `${label} could not be identified.`);
  return id;
}

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 25));
  return { page, limit, from: (page - 1) * limit, to: page * limit - 1 };
}

export async function getAdminStats(req, res, next) {
  try {
    const { data, error } = await req.supabase.rpc('get_admin_stats');
    if (error) throw error;
    res.json({ stats: data });
  } catch (error) {
    next(error);
  }
}

export async function getAdminProducts(req, res, next) {
  try {
    const { page, limit, from, to } = pagination(req.query);
    let query = req.supabase
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (req.query.search) query = query.ilike('name', `%${String(req.query.search).trim()}%`);
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ products: data || [], pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
  } catch (error) {
    next(error);
  }
}

export async function createAdminProduct(req, res, next) {
  try {
    const { data, error } = await req.supabase.from('products').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ product: data });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProduct(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Product');
    const { data, error } = await req.supabase.from('products').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    if (!data) throw createError(404, 'Product not found.');
    res.json({ product: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminProduct(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Product');
    const { data, error } = await req.supabase.from('products').update({ is_active: false }).eq('id', id).select('id, name, is_active').single();
    if (error) throw error;
    if (!data) throw createError(404, 'Product not found.');
    res.json({ product: data, message: 'Product archived. Existing order history is unchanged.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminCategories(req, res, next) {
  try {
    const { data, error } = await req.supabase.from('categories').select('*, products(count)').order('name');
    if (error) throw error;
    res.json({ categories: (data || []).map((category) => ({ ...category, product_count: category.products?.[0]?.count || 0 })) });
  } catch (error) {
    next(error);
  }
}

export async function createAdminCategory(req, res, next) {
  try {
    const { data, error } = await req.supabase.from('categories').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCategory(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Category');
    const { data, error } = await req.supabase.from('categories').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    if (!data) throw createError(404, 'Category not found.');
    res.json({ category: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCategory(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Category');
    const { count, error: productsError } = await req.supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
    if (productsError) throw productsError;
    if (count > 0) throw createError(409, 'Move or archive this category’s products before removing the category.');
    const { error } = await req.supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Category removed.' });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrders(req, res, next) {
  try {
    const { page, limit, from, to } = pagination(req.query);
    let query = req.supabase
      .from('orders')
      .select('*, users(full_name, email), order_items(id, quantity, unit_price, total_price, products(name, slug))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ orders: data || [], pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
  } catch (error) {
    next(error);
  }
}

const nextOrderStatuses = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export async function updateAdminOrderStatus(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Order');
    const { data: current, error: currentError } = await req.supabase.from('orders').select('id, status').eq('id', id).single();
    if (currentError || !current) throw createError(404, 'Order not found.');
    if (!nextOrderStatuses[current.status]?.includes(req.body.status)) {
      throw createError(409, `An order cannot move from ${current.status} to ${req.body.status}.`);
    }
    const { data, error } = await req.supabase.from('orders').update({ status: req.body.status }).eq('id', id).eq('status', current.status).select().single();
    if (error?.code === 'PGRST116') throw createError(409, 'This order changed while you were viewing it. Reload the list and try again.');
    if (error) throw error;
    if (!data) throw createError(409, 'This order changed while you were viewing it. Reload the list and try again.');
    res.json({ order: data });
  } catch (error) {
    next(error);
  }
}

export async function getAdminDiscounts(req, res, next) {
  try {
    const { data, error } = await req.supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ discounts: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function createAdminDiscount(req, res, next) {
  try {
    const { data, error } = await req.supabase.from('discount_codes').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json({ discount: data });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminDiscount(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Discount');
    const { data, error } = await req.supabase.from('discount_codes').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    if (!data) throw createError(404, 'Discount code not found.');
    res.json({ discount: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminDiscount(req, res, next) {
  try {
    const id = parseId(req.params.id, 'Discount');
    const { error } = await req.supabase.from('discount_codes').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Discount code removed.' });
  } catch (error) {
    next(error);
  }
}