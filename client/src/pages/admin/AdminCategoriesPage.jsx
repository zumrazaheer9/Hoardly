import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.js';
import { Alert } from '../../components/common/Alert.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

const emptyCategory = { name: '', slug: '', description: '', image_url: '', parent_id: '' };

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await adminService.getCategories();
    setCategories(response.categories || []);
  };

  useEffect(() => {
    let active = true;
    adminService.getCategories()
      .then((response) => { if (active) setCategories(response.categories || []); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Categories could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    const payload = { ...form, description: form.description || null, image_url: form.image_url || null, parent_id: form.parent_id ? Number(form.parent_id) : null };
    try {
      if (editingId) await adminService.updateCategory(editingId, payload);
      else await adminService.createCategory(payload);
      await load();
      setForm(emptyCategory);
      setEditingId(null);
      setMessage(editingId ? 'Category updated.' : 'Category created.');
    } catch (requestError) {
      setError(requestError.message || 'Category could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (category) => {
    if (!window.confirm(`Remove ${category.name}?`)) return;
    setError('');
    try {
      await adminService.deleteCategory(category.id);
      await load();
      setMessage('Category removed.');
    } catch (requestError) {
      setError(requestError.message || 'Category could not be removed.');
    }
  };

  return (
    <div>
      <div className="border-b border-line pb-6"><p className="text-sm font-semibold text-content-link">Catalog</p><h1 className="mt-2 text-2xl font-bold text-content-primary">Categories</h1></div>
      {error && <Alert variant="error" className="mt-5">{error}</Alert>}{message && <Alert variant="success" className="mt-5">{message}</Alert>}
      <form onSubmit={submit} className="mt-6 grid gap-4 border-b border-line pb-7 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h2 className="text-lg font-semibold text-content-primary">{editingId ? 'Edit category' : 'Add category'}</h2>{editingId && <Button type="button" variant="link" size="sm" onClick={() => { setForm(emptyCategory); setEditingId(null); }}>Cancel edit</Button>}</div>
        <label className="block text-sm font-medium text-content-primary">Name<input required minLength="2" maxLength="100" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="block text-sm font-medium text-content-primary">URL slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="block text-sm font-medium text-content-primary">Image URL<input type="url" value={form.image_url} onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <label className="block text-sm font-medium text-content-primary">Parent category<select value={form.parent_id} onChange={(event) => setForm((current) => ({ ...current, parent_id: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm"><option value="">None</option>{categories.filter((category) => category.id !== editingId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="block text-sm font-medium text-content-primary sm:col-span-2">Description<textarea rows="2" maxLength="2000" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
        <div className="sm:col-span-2"><Button type="submit" isLoading={isSaving}>{editingId ? 'Save category' : 'Create category'}</Button></div>
      </form>
      {isLoading ? <div className="flex min-h-36 items-center justify-center"><Spinner /></div> : <div className="mt-6 divide-y divide-line border-y border-line">{categories.map((category) => <article key={category.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-semibold text-content-primary">{category.name}</p><p className="mt-1 text-sm text-content-secondary">/{category.slug} · {category.product_count} products</p></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => { setForm({ name: category.name, slug: category.slug, description: category.description || '', image_url: category.image_url || '', parent_id: category.parent_id || '' }); setEditingId(category.id); }}>Edit</Button><Button variant="destructive" size="sm" onClick={() => remove(category)}>Remove</Button></div></article>)}{categories.length === 0 && <p className="py-6 text-center text-sm text-content-secondary">No categories yet.</p>}</div>}
    </div>
  );
}