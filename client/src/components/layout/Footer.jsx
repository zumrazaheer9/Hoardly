import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-bold text-content-primary">Hoardly</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-content-secondary">Thoughtfully selected goods for the spaces, routines, and people that matter.</p>
        </div>
        <div><p className="text-sm font-semibold text-content-primary">Shop</p><div className="mt-3 space-y-2 text-sm"><Link className="block text-content-secondary hover:text-content-link" to="/products">All products</Link><Link className="block text-content-secondary hover:text-content-link" to="/categories">Categories</Link></div></div>
        <div><p className="text-sm font-semibold text-content-primary">Account</p><div className="mt-3 space-y-2 text-sm"><Link className="block text-content-secondary hover:text-content-link" to="/login">Sign in</Link><Link className="block text-content-secondary hover:text-content-link" to="/register">Create account</Link></div></div>
        <div><p className="text-sm font-semibold text-content-primary">Support</p><p className="mt-3 text-sm leading-6 text-content-secondary">Questions about an item? Contact our support team before you order.</p></div>
      </div>
      <div className="border-t border-line"><div className="mx-auto max-w-7xl px-4 py-5 text-xs text-content-muted sm:px-6 lg:px-8">© 2026 Hoardly. All rights reserved.</div></div>
    </footer>
  );
}
