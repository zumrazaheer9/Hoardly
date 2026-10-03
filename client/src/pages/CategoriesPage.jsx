import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productsService } from '../services/products.js';
import { Alert } from '../components/common/Alert.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productsService.getCategories()
      .then((response) => setCategories(response.categories || []))
      .catch((requestError) => setError(requestError.message || 'Categories could not be loaded. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl"><p className="text-sm font-semibold text-content-link">Shop by category</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">A home for the things you need.</h1><p className="mt-3 text-base leading-7 text-content-secondary">Explore the collections built around real routines, not endless scrolling.</p></div>
      <div className="mt-8">
        {isLoading && <div className="flex min-h-64 items-center justify-center"><Spinner size="lg" /><span className="ml-3 text-sm text-content-secondary">Loading categories...</span></div>}
        {error && <Alert variant="error" title="Could not load categories">{error}</Alert>}
        {!isLoading && !error && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <Link key={category.id} to={`/products?category=${category.slug}`} className="group overflow-hidden rounded-lg border border-line bg-surface-card shadow-xs transition-shadow duration-normal hover:shadow-md"><div className="aspect-[16/10] overflow-hidden bg-surface-muted">{category.image_url && <img src={category.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105" />}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-semibold text-content-primary">{category.name}</h2><ArrowRight className="h-4 w-4 shrink-0 text-content-muted transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" /></div><p className="mt-2 text-sm leading-6 text-content-secondary">{category.description}</p><p className="mt-4 text-sm font-semibold text-content-link">{category.product_count} products</p></div></Link>)}</div>}
      </div>
    </div>
  );
}
