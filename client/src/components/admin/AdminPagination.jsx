import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function AdminPagination({ pagination, isLoading, onChange }) {
  const { page = 1, totalPages = 1 } = pagination;
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Table pages" className="mt-5 flex items-center justify-end gap-3">
      <Button variant="secondary" size="sm" disabled={isLoading || page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></Button>
      <span className="text-sm text-content-secondary">Page {page} of {totalPages}</span>
      <Button variant="secondary" size="sm" disabled={isLoading || page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" aria-hidden="true" /></Button>
    </nav>
  );
}
