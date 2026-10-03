import React from 'react';
import { ProductCard } from './ProductCard.jsx';
import { Spinner } from '../common/Spinner.jsx';
import { Alert } from '../common/Alert.jsx';

export function ProductGrid({ products, isLoading, error, emptyTitle = 'No products found', emptyDescription = 'Try clearing a filter or exploring another category.' }) {
  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center" role="status">
        <Spinner size="lg" />
        <span className="ml-3 text-sm text-content-secondary">Loading products...</span>
      </div>
    );
  }

  if (error) return <Alert variant="error" title="Could not load products">{error}</Alert>;

  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-card px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-content-primary">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-content-secondary">{emptyDescription}</p>
      </div>
    );
  }

  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
