import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, error } = useWishlist();

  if (!isAuthenticated) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><Heart className="mx-auto h-8 w-8 text-content-muted" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold text-content-primary">Keep your favorites close.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-content-secondary">Sign in to save products and revisit them whenever you are ready.</p><Link to="/login" className="mt-6 inline-block"><Button>Sign in to continue</Button></Link></div>;
  }

  const products = items.map((item) => item.products).filter(Boolean);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="border-b border-line pb-8"><p className="text-sm font-semibold text-content-link">Your collection</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">Saved items</h1><p className="mt-3 text-sm text-content-secondary">A personal list of products worth coming back to.</p></div>{error && <Alert variant="error" title="Could not load saved items" className="mt-6">{error}</Alert>}<div className="mt-8"><ProductGrid products={products} isLoading={isLoading} error={error} emptyTitle="No saved items yet" emptyDescription="Browse the catalog and use the heart on any product you want to revisit." /></div></div>
  );
}
