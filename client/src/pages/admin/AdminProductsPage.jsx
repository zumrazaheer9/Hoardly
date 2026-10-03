import React, { useEffect, useRef, useState } from 'react';
import { adminService } from '../../services/admin.js';
import { Alert } from '../../components/common/Alert.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { AdminPagination } from '../../components/admin/AdminPagination.jsx';

const emptyProduct = { name: '', slug: '', description: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '', images: '', category_id: '', attributes: '{}', is_active: true };
const fields = [
  ['name', 'Product name'], ['slug', 'URL slug'], ['sku', 'SKU'], ['price', 'Price'],
  ['compare_at_price', 'Compare-at price'], ['stock_quantity', 'Stock quantity'],
];

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const load = async (page = pagination.page, query = submittedSearch) => {
    const [productResponse, categoryResponse] = await Promise.all([adminService.getProducts({ search: query, page }), adminService.getCategories()]);
    setProducts(productResponse.products || []);
    setPagination(productResponse.pagination || { page: 1, totalPages: 1 });
    setCategories(categoryResponse.categories || []);
  };

  useEffect(() => {
    let active = true;
    Promise.all([adminService.getProducts(), adminService.getCategories()])
      .then(([productResponse, categoryResponse]) => {
        if (!active) return;
        setProducts(productResponse.products || []);
        setPagination(productResponse.pagination || { page: 1, totalPages: 1 });
        setCategories(categoryResponse.categories || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Products could not be loaded.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...emptyProduct,
      ...product,
      price: String(product.price),
      compare_at_price: product.compare_at_price == null ? '' : String(product.compare_at_price),
      stock_quantity: String(product.stock_quantity),
      category_id: String(product.category_id),
      images: (product.images || []).join('\n'),
      attributes: JSON.stringify(product.attributes || {}, null, 2),
    });
    setMessage('');
    setError('');
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    setError('');
    setMessage('');
    setIsUploadingImage(true);
    try {
      const { url } = await adminService.uploadProductImage(imageFile);
      setForm((current) => ({
        ...current,
        images: [...current.images.split(/\r?\n/).map((item) => item.trim()).filter(Boolean), url].join('\n'),
      }));
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      setMessage('Image uploaded. Save the product to attach it to the catalog item.');
    } catch (requestError) {
      setError(requestError.message || 'Image upload failed. Try another image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        sku: form.sku,
        description: form.description,
        price: Number(form.price),
        compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
        stock_quantity: Number(form.stock_quantity),
        category_id: Number(form.category_id),
        images: form.images.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
        attributes: JSON.parse(form.attributes || '{}'),
        is_active: Boolean(form.is_active),
      };
      if (editingId) await adminService.updateProduct(editingId, payload);
      else await adminService.createProduct(payload);
      await load();
      setForm(emptyProduct);
      setEditingId(null);
      setMessage(editingId ? 'Product updated.' : 'Product created.');
    } catch (requestError) {
      setError(requestError instanceof SyntaxError ? 'Product attributes must be valid JSON.' : requestError.message || 'Product could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const archive = async (product) => {
    if (!window.confirm(`Archive ${product.name}? It will no longer appear in the active catalog.`)) return;
    setError('');
    try {
      await adminService.archiveProduct(product.id);
      await load();
      setMessage('Product archived. Existing order history is unchanged.');
    } catch (requestError) {
      setError(requestError.message || 'Product could not be archived.');
    }
  };

  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const changePage = async (page, query = submittedSearch) => {
    setIsLoading(true);
    setError('');
    try { await load(page, query); }
    catch (requestError) { setError(requestError.message || 'Products could not be loaded.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div>
      <div className="border-b border-line pb-6"><p className="text-sm font-semibold text-content-link">Catalog</p><h1 className="mt-2 text-2xl font-bold text-content-primary">Products</h1></div>
      {error && <Alert variant="error" className="mt-5">{error}</Alert>}{message && <Alert variant="success" className="mt-5">{message}</Alert>}
      <section className="mt-6 border-b border-line pb-8" aria-labelledby="product-form-heading">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="product-form-heading" className="text-lg font-semibold text-content-primary">{editingId ? 'Edit product' : 'Add product'}</h2>{editingId && <Button variant="link" size="sm" onClick={() => { setForm(emptyProduct); setEditingId(null); }}>Cancel edit</Button>}</div>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map(([field, label]) => <label key={field} className="block text-sm font-medium text-content-primary">{label}<input required={field !== 'compare_at_price'} type={['price', 'compare_at_price', 'stock_quantity'].includes(field) ? 'number' : 'text'} min={['price', 'compare_at_price', 'stock_quantity'].includes(field) ? '0' : undefined} step={field === 'stock_quantity' ? '1' : '0.01'} value={form[field]} onChange={(event) => change(field, event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>)}
          <label className="block text-sm font-medium text-content-primary">Category<select required value={form.category_id} onChange={(event) => change('category_id', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm"><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-content-primary"><input type="checkbox" checked={Boolean(form.is_active)} onChange={(event) => change('is_active', event.target.checked)} className="h-4 w-4 accent-brand" />Visible in store</label>
          <label className="block text-sm font-medium text-content-primary sm:col-span-2 xl:col-span-3">Description<textarea required rows="3" value={form.description} onChange={(event) => change('description', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
          <div className="sm:col-span-2 xl:col-span-3"><label className="block text-sm font-medium text-content-primary">Upload an image from this device<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-content-primary" /></label><p className="mt-2 text-xs text-content-secondary">JPG, PNG, WebP, AVIF, or GIF. Supabase uploads support up to 5 MB; the local demo supports up to 350 KB.</p><Button type="button" variant="secondary" isLoading={isUploadingImage} disabled={!imageFile || isSaving} onClick={uploadImage} className="mt-3">Upload image</Button></div>
          <label className="block text-sm font-medium text-content-primary sm:col-span-2 xl:col-span-3">Image URLs, one per line<textarea rows="3" value={form.images} onChange={(event) => change('images', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /></label>
          <label className="block text-sm font-medium text-content-primary sm:col-span-2 xl:col-span-3">Attributes (JSON)<textarea rows="3" value={form.attributes} onChange={(event) => change('attributes', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 font-mono text-xs" /></label>
          <div className="sm:col-span-2 xl:col-span-3"><Button type="submit" isLoading={isSaving}>{editingId ? 'Save product' : 'Create product'}</Button></div>
        </form>
      </section>
      <section className="mt-7" aria-labelledby="products-table-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><h2 id="products-table-heading" className="text-lg font-semibold text-content-primary">Catalog inventory</h2><form onSubmit={(event) => { event.preventDefault(); setSubmittedSearch(search); changePage(1, search); }} className="flex gap-2"><label className="sr-only" htmlFor="product-search">Search products</label><input id="product-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="rounded-md border border-line bg-surface-card px-3 py-2 text-sm" /><Button type="submit" variant="secondary" disabled={isLoading}>Search</Button></form></div>
        {isLoading ? <div className="flex min-h-32 items-center justify-center"><Spinner /></div> : <div className="mt-4 overflow-x-auto border-y border-line"><table className="w-full min-w-[42rem] text-left text-sm"><thead><tr className="text-xs text-content-muted"><th className="py-3 pr-4 font-medium">Product</th><th className="py-3 pr-4 font-medium">Category</th><th className="py-3 pr-4 font-medium">Price</th><th className="py-3 pr-4 font-medium">Stock</th><th className="py-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-line">{products.map((product) => <tr key={product.id} className={!product.is_active ? 'opacity-60' : ''}><td className="py-3 pr-4"><p className="font-medium text-content-primary">{product.name}</p><p className="text-xs text-content-muted">{product.sku}</p></td><td className="py-3 pr-4 text-content-secondary">{product.categories?.name || 'Uncategorized'}</td><td className="py-3 pr-4 text-content-primary">{formatCurrency(product.price)}</td><td className="py-3 pr-4 text-content-secondary">{product.stock_quantity}</td><td className="py-3 text-right"><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => startEdit(product)}>Edit</Button>{product.is_active && <Button variant="destructive" size="sm" onClick={() => archive(product)}>Archive</Button>}</div></td></tr>)}{products.length === 0 && <tr><td colSpan="5" className="py-6 text-center text-content-secondary">No products found.</td></tr>}</tbody></table></div>}
        <AdminPagination pagination={pagination} isLoading={isLoading} onChange={changePage} />
      </section>
    </div>
  );
}
