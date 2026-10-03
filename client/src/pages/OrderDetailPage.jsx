import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersService } from '../services/orders.js';
import { Alert } from '../components/common/Alert.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const orderSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    ordersService.getOrder(id)
      .then((response) => { if (active) setOrder(response.order); })
      .catch((requestError) => { if (active) setError(requestError.message || 'This order could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (isLoading) return <div className="flex min-h-96 items-center justify-center"><Spinner size="lg" /><span className="ml-3 text-sm text-content-secondary">Loading order...</span></div>;
  if (error || !order) return <div className="mx-auto max-w-3xl px-4 py-10"><Alert variant="error" title="Could not load order">{error || 'The requested order is unavailable.'}</Alert><Link to="/orders" className="mt-5 inline-block text-sm font-semibold text-content-link">Return to order history</Link></div>;

  const shippingAddress = order.shipping_address || {};
  const statusIndex = orderSteps.indexOf(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-7"><div><p className="text-sm font-semibold text-content-link">Order details</p><h1 className="mt-2 text-3xl font-bold text-content-primary">{order.order_number}</h1><p className="mt-2 text-sm text-content-secondary">Placed {formatDate(order.created_at)}</p></div><Link to="/orders"><Button variant="secondary">Back to orders</Button></Link></div>
      <section className="mt-8" aria-labelledby="status-heading"><h2 id="status-heading" className="text-lg font-semibold capitalize text-content-primary">{order.status}</h2>{order.status === 'cancelled' ? <p className="mt-3 text-sm text-feedback-error">This order was cancelled.</p> : <ol className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{orderSteps.map((step, index) => <li key={step} className={`border-t-2 pt-3 text-sm capitalize ${index <= statusIndex ? 'border-brand font-semibold text-content-primary' : 'border-line text-content-muted'}`}>{step}</li>)}</ol>}</section>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="items-heading"><h2 id="items-heading" className="text-lg font-semibold text-content-primary">Items</h2><div className="mt-4 divide-y divide-line border-y border-line">{(order.order_items || []).map((item) => <article key={item.id} className="flex gap-4 py-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface-muted">{item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><Link to={`/products/${item.products?.slug}`} className="font-medium text-content-primary hover:text-content-link">{item.products?.name || 'Product'}</Link><p className="mt-1 text-sm text-content-secondary">Quantity: {item.quantity}</p></div><p className="text-sm font-semibold text-content-primary">{formatCurrency(item.total_price)}</p></article>)}</div></section>
        <aside className="space-y-6"><section className="rounded-md border border-line bg-surface-card p-5"><h2 className="font-semibold text-content-primary">Order summary</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3 text-content-secondary"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>{Number(order.discount_amount) > 0 && <div className="flex justify-between gap-3 text-feedback-success"><dt>Discount</dt><dd>-{formatCurrency(order.discount_amount)}</dd></div>}<div className="flex justify-between gap-3 border-t border-line pt-3 font-bold text-content-primary"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div><div className="flex justify-between gap-3 text-content-secondary"><dt>Payment</dt><dd>Cash on delivery</dd></div></dl></section><section className="rounded-md border border-line bg-surface-card p-5"><h2 className="font-semibold text-content-primary">Delivery address</h2><address className="mt-3 text-sm not-italic leading-6 text-content-secondary">{shippingAddress.full_name}<br />{shippingAddress.address_line1}{shippingAddress.address_line2 ? <><br />{shippingAddress.address_line2}</> : null}<br />{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}<br />{shippingAddress.country}<br />{shippingAddress.phone}</address></section></aside>
      </div>
    </div>
  );
}