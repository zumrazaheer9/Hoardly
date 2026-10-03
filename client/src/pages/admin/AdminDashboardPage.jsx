import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, ClipboardList, DollarSign, Users } from 'lucide-react';
import { adminService } from '../../services/admin.js';
import { Alert } from '../../components/common/Alert.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const cards = [
  { key: 'total_orders', label: 'Orders', icon: ClipboardList, format: (value) => value ?? 0 },
  { key: 'total_revenue', label: 'Revenue', icon: DollarSign, format: (value) => formatCurrency(value ?? 0) },
  { key: 'active_products', label: 'Active products', icon: Boxes, format: (value) => value ?? 0 },
  { key: 'total_users', label: 'Customers', icon: Users, format: (value) => value ?? 0 },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([adminService.getStats(), adminService.getOrders({ limit: 6 })])
      .then(([statsResponse, ordersResponse]) => {
        if (!active) return;
        setStats(statsResponse.stats);
        setOrders(ordersResponse.orders || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Admin overview could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <div className="border-b border-line pb-6"><p className="text-sm font-semibold text-content-link">Store operations</p><h1 className="mt-2 text-2xl font-bold text-content-primary">Overview</h1><p className="mt-2 text-sm text-content-secondary">Current orders, sales, products, and customers.</p></div>
      {error && <Alert variant="error" className="mt-6">{error}</Alert>}
      {isLoading ? <div className="flex min-h-52 items-center justify-center"><Spinner size="lg" /></div> : <>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store statistics">{cards.map(({ key, label, icon: Icon, format }) => <article key={key} className="border-b border-line py-4"><div className="flex items-center justify-between"><p className="text-sm text-content-secondary">{label}</p><Icon className="h-4 w-4 text-content-muted" aria-hidden="true" /></div><p className="mt-2 text-2xl font-bold text-content-primary">{format(stats?.[key])}</p></article>)}</section>
        <section className="mt-10" aria-labelledby="recent-orders-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="recent-orders-heading" className="text-lg font-semibold text-content-primary">Recent orders</h2><p className="mt-1 text-sm text-content-secondary">{stats?.pending_orders ?? 0} awaiting confirmation</p></div><Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-content-link hover:underline">Manage orders <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
          <div className="mt-4 overflow-x-auto border-y border-line"><table className="w-full min-w-[40rem] text-left text-sm"><thead><tr className="text-xs text-content-muted"><th className="py-3 pr-4 font-medium">Order</th><th className="py-3 pr-4 font-medium">Customer</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 text-right font-medium">Total</th></tr></thead><tbody className="divide-y divide-line">{orders.map((order) => <tr key={order.id}><td className="py-3 pr-4 font-medium text-content-primary">{order.order_number}</td><td className="py-3 pr-4 text-content-secondary">{order.users?.full_name || order.users?.email || 'Customer'}</td><td className="py-3 pr-4 capitalize text-content-secondary">{order.status}</td><td className="py-3 text-right font-medium text-content-primary">{formatCurrency(order.total)}</td></tr>)}{orders.length === 0 && <tr><td colSpan="4" className="py-6 text-center text-content-secondary">No orders yet.</td></tr>}</tbody></table></div>
        </section>
      </>}
    </div>
  );
}