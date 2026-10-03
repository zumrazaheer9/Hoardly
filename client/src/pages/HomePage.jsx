import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { ArrowRight } from 'lucide-react';
import { productsService } from '../services/products.js';
import heroImage from '../assets/hero.png';

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    Promise.all([productsService.getProducts({ limit: 6 }), productsService.getCategories()])
      .then(([productsResponse, categoriesResponse]) => {
        if (!isActive) return;
        setProducts(productsResponse.products || []);
        setCategories(categoriesResponse.categories || []);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || 'The catalog is unavailable right now. Please try again shortly.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => { isActive = false; };
  }, []);

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-line bg-content-primary">
        <img src={heroImage} alt="Modern desk setup with everyday essentials" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-content-primary/70" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-white/75">Everyday, considered</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">Find the pieces that make daily life feel better.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">Hoardly brings together durable, useful goods selected for how people actually live, work, and recharge.</p>
            <Link to="/products" className="mt-8 inline-block"><Button variant="primary" size="lg">Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></Link>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        {error && <Alert variant="error" title="Could not load the home catalog">{error}</Alert>}
        <section aria-labelledby="categories-heading">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-content-link">Explore by category</p><h2 id="categories-heading" className="mt-2 text-2xl font-bold text-content-primary">Made for every corner of life</h2></div><Link to="/categories" className="hidden text-sm font-semibold text-content-link hover:underline sm:block">View all categories</Link></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {categories.map((category) => <Link to={`/products?category=${category.slug}`} key={category.id} className="group relative min-h-48 overflow-hidden rounded-lg bg-surface-muted"><img src={category.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow group-hover:scale-105" /><div className="absolute inset-0 bg-content-primary/55" /><div className="relative flex min-h-48 flex-col justify-end p-5 text-white"><p className="text-lg font-semibold">{category.name}</p><p className="mt-1 text-sm text-white/80">{category.product_count} products</p></div></Link>)}
          </div>
        </section>
        <section aria-labelledby="featured-heading">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-content-link">Just in</p><h2 id="featured-heading" className="mt-2 text-2xl font-bold text-content-primary">Featured products</h2></div><Link to="/products" className="text-sm font-semibold text-content-link hover:underline">View all products</Link></div>
          <div className="mt-6"><ProductGrid products={products} isLoading={isLoading} error={error} /></div>
        </section>
      </div>
    </div>
  );
}
