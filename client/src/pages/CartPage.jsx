import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { CartItem } from '../components/cart/CartItem.jsx';
import { CartSummary } from '../components/cart/CartSummary.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { Button } from '../components/common/Button.jsx';

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const { items, count, subtotal, isLoading, error, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isAuthenticated) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><ShoppingBag className="mx-auto h-8 w-8 text-content-muted" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold text-content-primary">Your cart is waiting.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-content-secondary">Sign in to keep the products you choose in one place.</p><Link to="/login" className="mt-6 inline-block"><Button>Sign in to continue</Button></Link></div>;
  }

  if (isLoading && !items.length) return <div className="flex min-h-96 items-center justify-center"><Spinner size="lg" /><span className="ml-3 text-sm text-content-secondary">Loading your cart...</span></div>;

  if (!items.length) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><ShoppingBag className="mx-auto h-8 w-8 text-content-muted" aria-hidden="true" /><h1 className="mt-5 text-3xl font-bold text-content-primary">Your cart is empty.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-content-secondary">Discover practical, well-made goods and add the ones that fit your day.</p><Link to="/products" className="mt-6 inline-block"><Button>Start shopping</Button></Link></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-7"><div><p className="text-sm font-semibold text-content-link">Your selection</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">Shopping cart</h1></div><Button variant="link" size="sm" onClick={clearCart} className="text-feedback-error">Clear cart</Button></div>
      {error && <Alert variant="error" title="Your cart needs attention" className="mt-6">{error}</Alert>}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]"><section>{items.map((item) => <CartItem key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeFromCart} />)}</section><CartSummary subtotal={subtotal} itemCount={count} /></div>
    </div>
  );
}
