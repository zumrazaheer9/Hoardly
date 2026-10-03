import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function CartSummary({ subtotal, itemCount, discountAmount = 0, showCheckout = true }) {
  const total = Math.max(0, subtotal - discountAmount);
  return (
    <aside className="rounded-lg border border-line bg-surface-card p-5 shadow-xs" aria-label="Order summary">
      <h2 className="text-lg font-semibold text-content-primary">Order summary</h2>
      <div className="mt-5 space-y-3 border-b border-line pb-5 text-sm"><div className="flex justify-between gap-4 text-content-secondary"><span>Items ({itemCount})</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between gap-4 text-content-secondary"><span>Shipping</span><span>Calculated at checkout</span></div></div>
      {discountAmount > 0 && <div className="mt-4 flex justify-between gap-4 text-sm text-feedback-success"><span>Discount</span><span>-{formatCurrency(discountAmount)}</span></div>}
      <div className="mt-5 flex justify-between gap-4 text-base font-bold text-content-primary"><span>{discountAmount > 0 ? 'Total' : 'Subtotal'}</span><span>{formatCurrency(total)}</span></div>
      {showCheckout && <Link to="/checkout" className="mt-6 block"><Button size="lg" className="w-full">Continue to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></Link>}
      {showCheckout && <Link to="/products" className="mt-5 block text-center text-sm font-semibold text-content-link hover:underline">Continue shopping</Link>}
    </aside>
  );
}
