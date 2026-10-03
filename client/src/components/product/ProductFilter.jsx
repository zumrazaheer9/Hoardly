import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function ProductFilter({ filters, categories, onChange, onClear }) {
  const update = (name, value) => onChange({ ...filters, [name]: value, page: 1 });

  return (
    <aside className="rounded-lg border border-line bg-surface-card p-5" aria-label="Product filters">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-content-primary"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters</div>
        <Button variant="link" size="sm" onClick={onClear}>Clear all</Button>
      </div>
      <div className="mt-5 space-y-5">
        <label className="block text-sm font-medium text-content-primary">
          Category
          <select value={filters.category} onChange={(event) => update('category', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm text-content-primary">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <div>
          <p className="text-sm font-medium text-content-primary">Price range</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="sr-only" htmlFor="min-price">Minimum price</label>
            <input id="min-price" type="number" min="0" value={filters.minPrice} onChange={(event) => update('minPrice', event.target.value)} placeholder="Min" className="w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" />
            <label className="sr-only" htmlFor="max-price">Maximum price</label>
            <input id="max-price" type="number" min="0" value={filters.maxPrice} onChange={(event) => update('maxPrice', event.target.value)} placeholder="Max" className="w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" />
          </div>
        </div>
        <label className="block text-sm font-medium text-content-primary">
          Minimum rating
          <select value={filters.rating} onChange={(event) => update('rating', event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm text-content-primary">
            <option value="">Any rating</option>
            {[4, 3, 2].map((rating) => <option key={rating} value={rating}>{rating} stars and up</option>)}
          </select>
        </label>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} className="mt-5 w-full md:hidden"><X className="h-4 w-4" aria-hidden="true" /> Reset filters</Button>
    </aside>
  );
}
