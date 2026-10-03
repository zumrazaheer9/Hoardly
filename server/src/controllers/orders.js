import { createError } from '../middleware/errorHandler.js';
import { sendOrderConfirmationEmail } from '../services/email.js';

const addressFields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code', 'country'];

function validateAddress(address) {
  if (!address || typeof address !== 'object') throw createError(400, 'Delivery address is required. Please complete all required address fields.');
  for (const field of addressFields) {
    if (!String(address[field] || '').trim()) throw createError(400, `Delivery ${field.replaceAll('_', ' ')} is required. Please complete the address and try again.`);
  }
  return Object.fromEntries([...addressFields, 'address_line2'].map((field) => [field, String(address[field] || '').trim() || null]));
}

export async function createOrder(req, res, next) {
  try {
    const shippingAddress = validateAddress(req.body.shipping_address);
    const { data: order, error } = await req.supabase.rpc('place_order', {
      p_shipping_address: shippingAddress,
      p_discount_code: req.body.discount_code || null,
    });

    if (error) {
      if (error.code === 'P0001' || error.code === '22023') {
        throw createError(400, error.message);
      }
      throw error;
    }
    try {
      await sendOrderConfirmationEmail(req.user.email, order);
    } catch (emailError) {
      console.warn('[Order confirmation email] Delivery failed:', emailError.message);
    }
    res.status(201).json({ order, message: 'Your order has been placed.' });
  } catch (error) { next(error); }
}

export async function getOrders(req, res, next) {
  try {
    const { data, error } = await req.supabase.from('orders').select('*, order_items(id, quantity, unit_price, total_price, products(id, name, slug, images))').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ orders: data || [] });
  } catch (error) { next(error); }
}

export async function getOrder(req, res, next) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(orderId)) throw createError(400, 'Order could not be identified. Refresh the page and try again.');
    const { data, error } = await req.supabase.from('orders').select('*, order_items(id, quantity, unit_price, total_price, products(id, name, slug, images))').eq('id', orderId).eq('user_id', req.user.id).single();
    if (error || !data) throw createError(404, 'That order was not found. Check your order history and try again.');
    res.json({ order: data });
  } catch (error) { next(error); }
}
