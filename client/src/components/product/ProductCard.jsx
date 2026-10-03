import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useWishlist } from '../../contexts/WishlistContext.jsx';
import { StarRating } from './StarRating.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const image = product.images?.[0] || product.image_url;
  const discount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : null;

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsSaving(true);
    setSaveError('');
    try {
      await toggleWishlist(product.id);
    } catch (requestError) {
      setSaveError(requestError.message || 'Could not update saved items. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-surface-card shadow-xs transition-shadow duration-normal hover:shadow-md">
      <div className="relative">
      <Link to={`/products/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-content-muted">Image unavailable</div>
          )}
          {discount && <span className="absolute left-3 top-3 rounded-sm bg-surface-card px-2 py-1 text-xs font-semibold text-feedback-success shadow-xs">Save {discount}%</span>}
        </div>
      </Link>
      <button type="button" disabled={isSaving} onClick={handleSave} className={`absolute right-3 top-3 inline-flex min-h-9 min-w-9 items-center justify-center rounded-full bg-surface-card shadow-xs hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 ${isSaved(product.id) ? 'text-feedback-error' : 'text-content-primary'}`} aria-label={isSaved(product.id) ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={isSaved(product.id)} aria-busy={isSaving}><Heart className={`h-4 w-4 ${isSaved(product.id) ? 'fill-current' : ''}`} aria-hidden="true" /></button>
      </div>
      <div className="space-y-3 p-4">
        {saveError && <p role="alert" className="text-sm text-feedback-error">{saveError}</p>}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-content-muted">{product.category_name || 'Hoardly collection'}</p>
            <Link to={`/products/${product.slug}`} className="mt-1 block text-base font-semibold leading-snug text-content-primary hover:text-content-link">
              {product.name}
            </Link>
          </div>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-content-muted transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
        <StarRating rating={product.avg_rating} reviewCount={product.review_count} />
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-content-primary">{formatCurrency(product.price)}</span>
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <span className="text-sm text-content-muted line-through">{formatCurrency(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
