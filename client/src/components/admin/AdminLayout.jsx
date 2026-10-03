import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Boxes, ClipboardList, FolderTree, Percent, Store } from 'lucide-react';

const sections = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/discounts', label: 'Discounts', icon: Percent },
];

export function AdminLayout() {
  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:px-8">
      <aside className="border-b border-line pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5" aria-label="Admin navigation">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-content-primary"><Store className="h-4 w-4 text-brand" aria-hidden="true" /> Store administration</div>
        <nav className="flex gap-1 overflow-x-auto lg:grid lg:overflow-visible">
          {sections.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand' : 'text-content-secondary hover:bg-surface-muted hover:text-content-primary'}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</NavLink>)}
        </nav>
      </aside>
      <main className="min-w-0"><Outlet /></main>
    </div>
  );
}