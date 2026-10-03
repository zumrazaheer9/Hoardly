import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { ordersService } from '../services/orders.js';
import { formatCurrency } from '../utils/formatters.js';

export function OrderConfirmationPage() {
  const { state } = useLocation();
  const { id } = useParams();
  const [order, setOrder] = useState(state?.order || null);
  const [isLoading, setIsLoading] = useState(!state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (state?.order) return undefined;
    let active = true;
    ordersService.getOrder(id)
      .then((response) => { if (active) setOrder(response.order); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Order details could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [id, state]);

  if (isLoading) return <div className="flex min-h-96 items-center justify-center"><Spinner size="lg" /><span className="ml-3 text-sm text-content-secondary">Loading confirmation...</span></div>;
  if (error || !order) return <div className="mx-auto max-w-2xl px-4 py-12"><Alert variant="error" title="Could not load your confirmation">{error || 'The order is unavailable.'}</Alert><Link to="/orders" className="mt-5 inline-block text-sm font-semibold text-content-link">View order history</Link></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-12 w-12 text-feedback-success" aria-hidden="true" />
      <p className="mt-6 text-sm font-semibold text-content-link">Order confirmed</p>
      <h1 className="mt-2 text-3xl font-bold text-content-primary">Thanks for your order.</h1>
      <p className="mt-4 text-sm leading-6 text-content-secondary">Order {order.order_number} has been placed. We will keep you updated as it is prepared.</p>
      <div className="mt-8 rounded-lg border border-line bg-surface-card p-5 text-left"><div className="flex justify-between text-sm text-content-secondary"><span>Order total</span><span className="font-semibold text-content-primary">{formatCurrency(order.total)}</span></div><div className="mt-3 flex justify-between text-sm text-content-secondary"><span>Payment</span><span>Cash on delivery</span></div></div>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><Link to={`/orders/${order.id}`}><Button variant="secondary">View order details</Button></Link><Link to="/products"><Button>Continue shopping</Button></Link></div>
    </div>
  );
}