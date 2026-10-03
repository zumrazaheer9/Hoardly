import React from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating = 0, reviewCount, showValue = true, size = 'sm' }) {
  const iconClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const label = `${Number(rating).toFixed(1)} out of 5 stars${reviewCount !== undefined ? ` from ${reviewCount} reviews` : ''}`;

  return (
    <div className="flex items-center gap-1.5" aria-label={label}>
      <Star className={`${iconClass} fill-feedback-warning text-feedback-warning`} aria-hidden="true" />
      {showValue && <span className="text-sm font-semibold text-content-primary">{Number(rating).toFixed(1)}</span>}
      {reviewCount !== undefined && <span className="text-sm text-content-muted">({reviewCount})</span>}
    </div>
  );
}
