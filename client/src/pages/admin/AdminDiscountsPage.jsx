import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.js';
import { Alert } from '../../components/common/Alert.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const emptyDiscount = { code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true };

export function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState(emptyDiscount);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await adminService.getDiscounts();
    setDiscounts(response.discounts || []);
  };

  useEffect(() => {
    let active = true;
    adminService.getDiscounts()
      .then((response) => { if (active) setDiscounts(response.discounts || []); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Discount codes could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      min_order_amount: form.min_order_amount === '' ? null : Number(form.min_order_amount),
      max_uses: form.max_uses === '' ? null : Number(form.max_uses),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    try {
      if (editingId) await adminService.updateDiscount(editingId, payload);
      else await adminService.createDiscount(payload);
      await load();
      setForm(emptyDiscount);
      setEditingId(null);
      setMessage(editingId ? 'Discount code updated.' : 'Discount code created.');
    } catch (requestError) {
      setError(requestError.message || 'Discount code could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const edit = (discount) => {
    setEditingId(discount.id);
    setForm({
      code: discount.code,
      type: discount.type,
      value: String(discount.value),
      min_order_amount: discount.min_order_amount == null ? '' : String(discount.min_order_amount),
      max_uses: discount.max_uses == null ? '' : String(discount.max_uses),
      expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().slice(0, 16) : '',
      is_active: discount.is_active,
    });
  };

  const remove = async (discount) => {
    if (!window.confirm(`Remove discount code ${discount.code}?`)) return;
    setError('');
    try {
      await adminService.deleteDiscount(discount.id);
      await load();
      setMessage(`Discount code ${discount.code} removed.`);
    } catch (requestError) {
      setError(requestError.message || 'Discount code could not be removed.');
    }
  };

  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div>
      <div className="border-b border-line pb-6"><p className="text-sm font-semibold text-content-link">Promotions</p><h1 className="mt-2 text-2xl font-bold text-content-primary">Discount codes</h1></div>
      {error && <Alert variant="error" className="mt-5">{error}</Alert>}{message && <Alert variant="success" className="mt-5">{message}</Alert>}
      <form onSubmit={submit} className="mt-6 grid gap-4 border-b border-line pb-7 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex items-center justify-between sm:col-span-2 xl:col-span-3"><h2 className="text-lg font-semibold text-content-primary">{editingId ? 'Edit code' : 'Create code'}</h2>{editingId && <Button type="button" variant="link" size="sm" onClick={() => { setForm(emptyDiscount); setEditingId(null); }}>Cancel edit</Button>}</div>
        <label className="block text-sm font-medium text-content-primary">Code<input required minLength="3" maxLength="40" value={form.code} onChange={(event) => change('code', event.target.value.toUpperCase())} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm uppercase" /></label>
        <label className="block text-sm font-medium text-content-primary">Discount type<select value={form.type} onChange={(event) => change('type', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm"><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
        <label className="block text-sm font-medium text-content-primary">{form.type === 'percentage' ? 'Percent' : 'Amount'}<input required type="number" min="0.01" step="0.01" max={form.type === 'percentage' ? '100' : undefined} value={form.value} onChange={(event) => change('value', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="block text-sm font-medium text-content-primary">Minimum order amount<input type="number" min="0" step="0.01" value={form.min_order_amount} onChange={(event) => change('min_order_amount', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="block text-sm font-medium text-content-primary">Maximum uses<input type="number" min="1" step="1" value={form.max_uses} onChange={(event) => change('max_uses', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="block text-sm font-medium text-content-primary">Expires at<input type="datetime-local" value={form.expires_at} onChange={(event) => change('expires_at', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-content-primary"><input type="checkbox" checked={form.is_active} onChange={(event) => change('is_active', event.target.checked)} className="h-4 w-4 accent-brand" />Active</label>
        <div className="sm:col-span-2 xl:col-span-3"><Button type="submit" isLoading={isSaving}>{editingId ? 'Save code' : 'Create code'}</Button></div>
      </form>
      {isLoading ? <div className="flex min-h-36 items-center justify-center"><Spinner /></div> : <div className="mt-6 overflow-x-auto border-y border-line"><table className="w-full min-w-[48rem] text-left text-sm"><thead><tr className="text-xs text-content-muted"><th className="py-3 pr-4 font-medium">Code</th><th className="py-3 pr-4 font-medium">Offer</th><th className="py-3 pr-4 font-medium">Usage</th><th className="py-3 pr-4 font-medium">Expires</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-line">{discounts.map((discount) => <tr key={discount.id}><td className="py-3 pr-4 font-semibold text-content-primary">{discount.code}</td><td className="py-3 pr-4 text-content-secondary">{discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}{discount.min_order_amount != null && <span className="block text-xs text-content-muted">Min. {formatCurrency(discount.min_order_amount)}</span>}</td><td className="py-3 pr-4 text-content-secondary">{discount.current_uses}{discount.max_uses == null ? '' : ` / ${discount.max_uses}`}</td><td className="py-3 pr-4 text-content-secondary">{discount.expires_at ? formatDate(discount.expires_at) : 'No expiry'}</td><td className="py-3 pr-4 text-content-secondary">{discount.is_active ? 'Active' : 'Inactive'}</td><td className="py-3 text-right"><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => edit(discount)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => remove(discount)}>Remove</Button></div></td></tr>)}{discounts.length === 0 && <tr><td colSpan="6" className="py-6 text-center text-content-secondary">No discount codes yet.</td></tr>}</tbody></table></div>}
    </div>
  );
}