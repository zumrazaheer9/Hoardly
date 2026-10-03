import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.js';
import { Alert } from '../../components/common/Alert.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { AdminPagination } from '../../components/admin/AdminPagination.jsx';

const transitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async (filter = status, page = pagination.page) => {
    const response = await adminService.getOrders({ limit: 25, status: filter, page });
    setOrders(response.orders || []);
    setPagination(response.pagination || { page: 1, totalPages: 1 });
  };

  useEffect(() => {
    let active = true;
    adminService.getOrders({ limit: 25 })
      .then((response) => { if (active) { setOrders(response.orders || []); setPagination(response.pagination || { page: 1, totalPages: 1 }); } })
      .catch((requestError) => { if (active) setError(requestError.message || 'Orders could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const updateStatus = async (order, nextStatus) => {
    if (!window.confirm(`Change order ${order.order_number} from ${order.status} to ${nextStatus}?`)) return;
    setUpdatingId(order.id);
    setError('');
    setMessage('');
    try {
      await adminService.updateOrderStatus(order.id, nextStatus);
      await load();
      setMessage(`Order ${order.order_number} updated to ${nextStatus}.`);
    } catch (requestError) {
      setError(requestError.message || 'Order status could not be updated.');
    } finally {
      setUpdatingId(null);
    }
  };

  const changePage = async (page, filter = status) => {
    setIsLoading(true);
    setError('');
    try { await load(filter, page); }
    catch (requestError) { setError(requestError.message || 'Orders could not be loaded.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6"><div><p className="text-sm font-semibold text-content-link">Fulfillment</p><h1 className="mt-2 text-2xl font-bold text-content-primary">Orders</h1></div><label className="text-sm font-medium text-content-secondary">Filter status<select value={status} disabled={isLoading} onChange={(event) => { const value = event.target.value; setStatus(value); changePage(1, value); }} className="ml-2 rounded-md border border-line bg-surface-card px-3 py-2 text-sm text-content-primary"><option value="">All statuses</option>{['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((value) => <option key={value}>{value}</option>)}</select></label></div>
      {error && <Alert variant="error" className="mt-5">{error}</Alert>}{message && <Alert variant="success" className="mt-5">{message}</Alert>}
      {isLoading ? <div className="flex min-h-52 items-center justify-center"><Spinner size="lg" /></div> : <div className="mt-5 overflow-x-auto border-y border-line"><table className="w-full min-w-[58rem] text-left text-sm"><thead><tr className="text-xs text-content-muted"><th className="py-3 pr-4 font-medium">Order</th><th className="py-3 pr-4 font-medium">Customer</th><th className="py-3 pr-4 font-medium">Placed</th><th className="py-3 pr-4 font-medium">Items</th><th className="py-3 pr-4 font-medium">Total</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 font-medium">Update</th></tr></thead><tbody className="divide-y divide-line">{orders.map((order) => <tr key={order.id}><td className="py-3 pr-4 font-medium text-content-primary">{order.order_number}</td><td className="py-3 pr-4 text-content-secondary">{order.users?.full_name || order.users?.email || 'Customer'}</td><td className="py-3 pr-4 text-content-secondary">{formatDate(order.created_at)}</td><td className="py-3 pr-4 text-content-secondary">{order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td><td className="py-3 pr-4 font-medium text-content-primary">{formatCurrency(order.total)}</td><td className="py-3 pr-4 capitalize text-content-secondary">{order.status}</td><td className="py-3"><label className="sr-only" htmlFor={`status-${order.id}`}>Update status for {order.order_number}</label><select id={`status-${order.id}`} disabled={updatingId === order.id || transitions[order.status]?.length === 0} value="" onChange={(event) => updateStatus(order, event.target.value)} className="rounded-md border border-line bg-surface-card px-2 py-1.5 text-xs disabled:opacity-50"><option value="">Change to...</option>{(transitions[order.status] || []).map((nextStatus) => <option key={nextStatus} value={nextStatus}>{nextStatus}</option>)}</select></td></tr>)}{orders.length === 0 && <tr><td colSpan="7" className="py-8 text-center text-content-secondary">No orders match this filter.</td></tr>}</tbody></table></div>}
      <AdminPagination pagination={pagination} isLoading={isLoading} onChange={changePage} />
    </div>
  );
}
