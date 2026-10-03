import { createError } from '../middleware/errorHandler.js';

export async function applyDiscount(req, res, next) {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    if (!code) throw createError(400, 'Enter a discount code to apply it.');

    const { data: items, error: cartError } = await req.supabase
      .from('cart_items')
      .select('quantity, products(price, is_active)')
      .eq('user_id', req.user.id);
    if (cartError) throw cartError;

    const subtotal = (items || []).reduce((sum, item) => {
      if (!item.products?.is_active) return sum;
      return sum + Number(item.products.price) * item.quantity;
    }, 0);
    if (!(items || []).some((item) => item.products?.is_active)) {
      throw createError(400, 'Add an available item to your cart before applying a discount.');
    }

    const { data: discount, error: discountError } = await req.supabase
      .from('discount_codes')
      .select('id, code, type, value, min_order_amount, max_uses, current_uses, expires_at')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();
    if (discountError) throw discountError;

    if (!discount
      || (discount.expires_at && new Date(discount.expires_at) <= new Date())
      || (discount.max_uses !== null && discount.current_uses >= discount.max_uses)) {
      throw createError(400, 'This discount code is invalid or no longer available. Check the code and try again.');
    }
    if (discount.min_order_amount !== null && subtotal < Number(discount.min_order_amount)) {
      throw createError(400, `Add ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(discount.min_order_amount) - subtotal)} more to use this code.`);
    }

    const amount = discount.type === 'percentage'
      ? Math.round(subtotal * Number(discount.value)) / 100
      : Math.min(subtotal, Number(discount.value));

    res.json({
      discount: { id: discount.id, code: discount.code, amount: Math.round(amount * 100) / 100 },
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.max(0, Math.round((subtotal - amount) * 100) / 100),
    });
  } catch (error) {
    next(error);
  }
}