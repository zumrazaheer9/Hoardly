import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function CartItem({ item, onUpdate, onRemove }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const product = item.products || {};

  const updateQuantity = async (quantity) => {
    if (quantity < 1 || quantity === item.quantity) return;
    setIsUpdating(true);
    setError('');
    try {
      await onUpdate(item.id, quantity);
    } catch (requestError) {
      setError(requestError.message || 'Could not update this item. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const remove = async () => {
    setIsUpdating(true);
    setError('');
    try {
      await onRemove(item.id);
    } catch (requestError) {
      setError(requestError.message || 'Could not remove this item. Please try again.');
      setIsUpdating(false);
    }
  };

  return (
    <article className="grid gap-4 border-b border-line py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
      <Link to={`/products/${product.slug}`} className="aspect-square overflow-hidden rounded-md bg-surface-muted"><img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" /></Link>
      <div className="min-w-0"><p className="text-xs font-medium text-content-muted">{product.category_name || 'Hoardly collection'}</p><Link to={`/products/${product.slug}`} className="mt-1 block text-base font-semibold text-content-primary hover:text-content-link">{product.name}</Link><p className="mt-2 text-sm font-semibold text-content-primary">{formatCurrency(product.price)}</p><div className="mt-4 inline-flex items-center rounded-md border border-line"><button type="button" disabled={isUpdating || item.quantity <= 1} onClick={() => updateQuantity(item.quantity - 1)} className="inline-flex min-h-10 min-w-10 items-center justify-center text-content-secondary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Decrease quantity of ${product.name}`}><Minus className="h-4 w-4" aria-hidden="true" /></button><span className="w-9 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span><button type="button" disabled={isUpdating || item.quantity >= product.stock_quantity} onClick={() => updateQuantity(item.quantity + 1)} className="inline-flex min-h-10 min-w-10 items-center justify-center text-content-secondary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Increase quantity of ${product.name}`}><Plus className="h-4 w-4" aria-hidden="true" /></button></div>{error && <p className="mt-2 text-xs text-feedback-error">{error}</p>}</div>
      <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end"><p className="text-base font-bold text-content-primary">{formatCurrency(Number(product.price || 0) * item.quantity)}</p><Button variant="ghost" size="sm" isLoading={isUpdating} onClick={remove} className="text-feedback-error hover:bg-destructive/10 hover:text-feedback-error"><Trash2 className="h-4 w-4" aria-hidden="true" /><span>Remove</span></Button></div>
    </article>
  );
}
