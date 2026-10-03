import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { productSearchUrl } from '../../utils/catalogNavigation.js';

/**
 * Debounced search bar for the navbar.
 * Fires a navigation to /products?search=<query> after a delay.
 */
export function SearchBar({ className = '' }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const query = draft?.key === location.key ? draft.value : searchParams.get('search') || '';
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const executeSearch = useCallback(
    (value) => {
      navigate(productSearchUrl(value, location.pathname === '/products' ? location.search : ''));
    },
    [navigate, location.pathname, location.search]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setDraft({ key: location.key, value });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      executeSearch(value);
    }, 400);
  };

  const handleClear = () => {
    setDraft({ key: location.key, value: '' });
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    executeSearch('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    executeSearch(query);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [location.key]);

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search products"
      className={`relative flex items-center ${className}`}
    >
      <div className="absolute left-3 pointer-events-none text-content-muted">
        <Search className="w-4 h-4" aria-hidden="true" />
      </div>
      <input
        ref={inputRef}
        type="search"
        name="search"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        aria-label="Search products by name or description"
        className="w-full pl-9 pr-8 py-2 text-sm bg-surface-muted border border-line rounded-md placeholder:text-content-muted text-content-primary focus:border-line-focus focus:ring-2 focus:ring-brand/20 outline-none transition-all duration-fast"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded-sm text-content-muted hover:text-content-primary cursor-pointer"
          aria-label="Clear search query"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
