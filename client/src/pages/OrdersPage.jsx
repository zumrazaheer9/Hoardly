import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ordersService } from '../services/orders.js';
import { Alert } from '../components/common/Alert.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    ordersService.getOrders()
      .then((response) => { if (active) setOrders(response.orders || []); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Order history could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) return <div className="mx-auto max-w-7xl px-4 py-16 text-center"><h1 className="text-3xl font-bold text-content-primary">Your orders</h1><Link to="/login" className="mt-5 inline-block text-sm font-semibold text-content-link hover:underline">Sign in to view orders</Link></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8"><div><p className="text-sm font-semibold text-content-link">Your account</p><h1 className="mt-2 text-3xl font-bold text-content-primary">Order history</h1></div><Link to="/account" className="text-sm font-semibold text-content-link hover:underline">Profile and addresses</Link></div>
      <div className="mt-8">
        {isLoading && <div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div>}
        {error && <Alert variant="error">{error}</Alert>}
        {!isLoading && !error && (!orders.length
          ? <p className="rounded-lg border border-dashed border-line-strong p-8 text-center text-sm text-content-secondary">No orders yet. Your completed purchases will appear here.</p>
          : <div className="divide-y divide-line border-y border-line">{orders.map((order) => <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><Link to={`/orders/${order.id}`} className="font-semibold text-content-primary hover:text-content-link">{order.order_number}</Link><p className="mt-1 text-sm text-content-secondary">Placed {formatDate(order.created_at)}</p><p className="mt-1 text-sm capitalize text-content-secondary">{order.order_items?.length || 0} items · {order.status}</p></div><div className="flex items-center gap-4"><p className="font-semibold text-content-primary">{formatCurrency(order.total)}</p><Link to={`/orders/${order.id}`}><Button variant="secondary" size="sm">View details</Button></Link></div></article>)}</div>)}
      </div>
    </div>
  );
}