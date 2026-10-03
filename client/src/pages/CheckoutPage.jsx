import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { cartService } from '../services/cart.js';
import { ordersService } from '../services/orders.js';
import { CartSummary } from '../components/cart/CartSummary.jsx';
import { Button } from '../components/common/Button.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

const initialAddress = { full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '' };
const labels = { full_name: 'Full name', phone: 'Phone', address_line1: 'Address line 1', address_line2: 'Address line 2', city: 'City', state: 'State or province', postal_code: 'Postal code', country: 'Country' };

export function CheckoutPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { count, subtotal, items, isLoading: cartLoading, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(initialAddress);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [error, setError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login', { replace: true, state: { from: { pathname: '/checkout' } } });
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    ordersService.getAddresses()
      .then((response) => {
        if (!active) return;
        const savedAddresses = response.addresses || [];
        setAddresses(savedAddresses);
        const preferred = savedAddresses.find((item) => item.is_default) || savedAddresses[0];
        if (preferred) {
          setSelectedAddress(String(preferred.id));
          setAddress(Object.fromEntries(Object.keys(initialAddress).map((key) => [key, preferred[key] || ''])));
        }
      })
      .catch((requestError) => { if (active) setAddressError(requestError.message); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const selectAddress = (value) => {
    setSelectedAddress(value);
    const saved = addresses.find((item) => String(item.id) === value);
    setAddress(saved
      ? Object.fromEntries(Object.keys(initialAddress).map((key) => [key, saved[key] || '']))
      : initialAddress);
  };

  const applyCode = async (event) => {
    event.preventDefault();
    setDiscountError('');
    setIsApplyingDiscount(true);
    try {
      const response = await cartService.applyDiscount(discountCode);
      setDiscount({ ...response.discount, subtotal: response.subtotal });
      setDiscountCode(response.discount.code);
    } catch (requestError) {
      setDiscount(null);
      setDiscountError(requestError.message || 'This code could not be applied. Check it and try again.');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsPlacing(true);
    try {
      const response = await ordersService.createOrder(address, appliedDiscount > 0 ? discount.code : null);
      await refreshCart();
      navigate(`/orders/${response.order.id}/confirmation`, { state: { order: response.order } });
    } catch (requestError) {
      setError(requestError.message || 'Could not place your order. Review your delivery details and try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (authLoading || (isAuthenticated && cartLoading)) {
    return <div className="flex min-h-96 items-center justify-center"><Spinner size="lg" /><span className="ml-3 text-sm text-content-secondary">Preparing checkout...</span></div>;
  }
  if (!isAuthenticated) return null;
  if (!items.length) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="text-3xl font-bold text-content-primary">Your cart is empty.</h1><Link to="/products" className="mt-5 inline-block text-sm font-semibold text-content-link">Browse products</Link></div>;
  }

  const appliedDiscount = discount && Math.abs(Number(discount.subtotal || subtotal) - subtotal) < 0.01 ? Number(discount.amount) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-8"><p className="text-sm font-semibold text-content-link">Secure checkout</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">Delivery details</h1></div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={submit} className="rounded-lg border border-line bg-surface-card p-6">
          <h2 className="text-lg font-semibold text-content-primary">Where should we deliver?</h2>
          {addresses.length > 0 && <label className="mt-5 block text-sm font-medium text-content-primary">Saved address<select value={selectedAddress} onChange={(event) => selectAddress(event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm"><option value="">Use a different address</option>{addresses.map((item) => <option key={item.id} value={item.id}>{item.label}: {item.address_line1}, {item.city}{item.is_default ? ' (default)' : ''}</option>)}</select></label>}
          {addressError && <Alert variant="warning" className="mt-4">Saved addresses could not be loaded. You can still enter a delivery address below.</Alert>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{Object.entries(labels).map(([name, label]) => <label key={name} className={`block text-sm font-medium text-content-primary ${name === 'address_line1' || name === 'address_line2' ? 'sm:col-span-2' : ''}`}>{label}<input required={name !== 'address_line2'} autoComplete={name === 'full_name' ? 'name' : name === 'phone' ? 'tel' : name === 'address_line1' ? 'address-line1' : name === 'postal_code' ? 'postal-code' : 'on'} value={address[name]} onChange={(event) => { setSelectedAddress(''); setAddress((current) => ({ ...current, [name]: event.target.value })); }} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm focus:border-line-focus focus:outline-none focus:ring-2 focus:ring-brand/20" /></label>)}</div>
          <div className="mt-6 border-t border-line pt-5"><h3 className="text-sm font-semibold text-content-primary">Payment</h3><p className="mt-2 text-sm text-content-secondary">Cash on delivery</p></div>
          <div className="mt-6 border-t border-line pt-5"><h3 className="text-sm font-semibold text-content-primary">Discount code</h3><div className="mt-3 flex gap-2"><label className="sr-only" htmlFor="discount-code">Discount code</label><input id="discount-code" value={discountCode} onChange={(event) => { setDiscountCode(event.target.value.toUpperCase()); setDiscount(null); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyCode(event); } }} className="min-w-0 flex-1 rounded-md border border-line bg-surface-card px-3 py-2 text-sm" autoComplete="off" /><Button type="button" variant="secondary" isLoading={isApplyingDiscount} onClick={applyCode}>Apply</Button></div>{discountError && <Alert variant="error" className="mt-3">{discountError}</Alert>}{appliedDiscount > 0 && <p className="mt-3 text-sm text-feedback-success">{discount.code} applied: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(appliedDiscount)} off.</p>}</div>
          {error && <Alert variant="error" className="mt-5">{error}</Alert>}
          <Button type="submit" size="lg" isLoading={isPlacing} className="mt-6 w-full">Place order (Cash on Delivery)</Button>
          <Link to="/account" className="mt-4 block text-sm text-content-link hover:underline">Manage saved addresses</Link>
        </form>
        <CartSummary subtotal={subtotal} discountAmount={appliedDiscount} itemCount={count} showCheckout={false} />
      </div>
    </div>
  );
}
