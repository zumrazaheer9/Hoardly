import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Button } from '../common/Button.jsx';
import { ShoppingBag, ShoppingCart, Heart, User, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { SearchBar } from '../product/SearchBar.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useWishlist } from '../../contexts/WishlistContext.jsx';

export function Navbar() {
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-content-primary hover:opacity-90 transition-opacity"
          aria-label="Hoardly homepage"
        >
          <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-content-on-action shadow-xs">
            <ShoppingBag className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span>Hoardly</span>
        </Link>

        {/* Navigation Links */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors"
          >
            Products
          </Link>
          <Link
            to="/categories"
            className="text-sm font-medium text-content-secondary hover:text-content-primary transition-colors"
          >
            Categories
          </Link>
        </nav>

        <SearchBar className="hidden min-w-0 max-w-md flex-1 xl:flex" />

        <div className="ml-auto flex items-center gap-3">
          <Link to="/wishlist" className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-content-primary hover:bg-surface-muted" aria-label={`Saved items${wishlistCount ? `, ${wishlistCount} saved` : ''}`}><Heart className="h-5 w-5" aria-hidden="true" />{wishlistCount > 0 && <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-content-on-action">{wishlistCount}</span>}</Link>
          <Link to="/cart" className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-content-primary hover:bg-surface-muted" aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ''}`}><ShoppingCart className="h-5 w-5" aria-hidden="true" />{cartCount > 0 && <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-content-on-action">{cartCount}</span>}</Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand hover:bg-brand/15">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Admin
                </Link>
              )}
              <Link to="/account" className="flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary" aria-label="Open your account">
                <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-content-primary border border-line">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="hidden max-w-24 truncate xl:inline-block font-medium text-content-primary">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                aria-label="Sign out of account"
              >
                <LogOut className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden xl:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Create account
                </Button>
              </Link>
            </div>
          )}
          <button type="button" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-content-primary hover:bg-surface-muted md:hidden" onClick={() => setIsMenuOpen((isOpen) => !isOpen)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className="mx-auto hidden max-w-7xl px-6 pb-3 md:block xl:hidden"><SearchBar /></div>
      {isMenuOpen && (
        <div className="border-t border-line bg-surface-card px-4 py-4 md:hidden">
          <SearchBar className="mb-4" />
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {[
              ['/', 'Home'],
              ['/products', 'Products'],
              ['/categories', 'Categories'],
              ['/wishlist', 'Saved items'],
              ['/cart', 'Shopping cart'],
              ...(isAuthenticated ? [['/account', 'My account'], ['/orders', 'Order history']] : []),
              ...(isAdmin ? [['/admin', 'Admin dashboard']] : []),
            ].map(([to, label]) => <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-content-secondary hover:bg-surface-muted hover:text-content-primary">{label}</Link>)}
          </nav>
        </div>
      )}
    </header>
  );
}
