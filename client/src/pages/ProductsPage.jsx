import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productsService } from '../services/products.js';
import { ProductFilter } from '../components/product/ProductFilter.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { Button } from '../components/common/Button.jsx';

const initialFilters = { category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', page: 1 };

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const filters = useMemo(() => ({
    ...initialFilters,
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
    search: searchParams.get('search') || '',
  }), [searchParams]);

  useEffect(() => {
    productsService.getCategories().then((response) => setCategories(response.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');
    productsService.getProducts({ ...filters, limit: 9 })
      .then((response) => {
        if (!isActive) return;
        setProducts(response.products || []);
        setPagination(response.pagination || { page: 1, total: 0, totalPages: 1 });
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || 'The catalog could not be loaded. Please try again.');
      })
      .finally(() => { if (isActive) setIsLoading(false); });
    return () => { isActive = false; };
  }, [filters]);

  const updateFilters = (nextFilters) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null && !(key === 'page' && Number(value) === 1)) params.set(key, value);
    });
    navigate(`/products${params.size ? `?${params}` : ''}`);
  };

  const clearFilters = () => updateFilters({ ...initialFilters, search: filters.search });
  const resultLabel = filters.search ? `Results for “${filters.search}”` : 'All products';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-8">
        <p className="text-sm font-semibold text-content-link">The catalog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">{resultLabel}</h1>
        <p className="mt-3 text-sm text-content-secondary">Browse thoughtfully selected essentials, with clear details before you decide.</p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <ProductFilter filters={filters} categories={categories} onChange={updateFilters} onClear={clearFilters} />
        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-content-secondary">{isLoading ? 'Loading results...' : `${pagination.total} ${pagination.total === 1 ? 'product' : 'products'}`}</p>
            <label className="flex items-center gap-2 text-sm font-medium text-content-secondary">Sort by
              <select value={filters.sort} onChange={(event) => updateFilters({ ...filters, sort: event.target.value, page: 1 })} className="rounded-md border border-line bg-surface-card px-3 py-2 text-sm text-content-primary">
                <option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Highest rated</option>
              </select>
            </label>
          </div>
          <ProductGrid products={products} isLoading={isLoading} error={error} emptyTitle="No matching products" emptyDescription="Try a broader search or remove a filter to see more of the catalog." />
          {!isLoading && !error && pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Product pages">
              <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => updateFilters({ ...filters, page: pagination.page - 1 })}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</Button>
              <span className="text-sm text-content-secondary">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => updateFilters({ ...filters, page: pagination.page + 1 })}>Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></Button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
