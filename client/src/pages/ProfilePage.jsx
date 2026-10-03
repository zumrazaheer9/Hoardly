import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountService } from '../services/account.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

const emptyProfile = { full_name: '', email: '', phone: '' };
const emptyAddress = { label: 'home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '', is_default: false };
const addressFields = [
  ['label', 'Label'], ['full_name', 'Full name'], ['phone', 'Phone'],
  ['address_line1', 'Address line 1'], ['address_line2', 'Address line 2'],
  ['city', 'City'], ['state', 'State or province'], ['postal_code', 'Postal code'], ['country', 'Country'],
];

export function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, syncProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [password, setPassword] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressDraft, setAddressDraft] = useState(emptyAddress);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login', { replace: true, state: { from: { pathname: '/account' } } });
  }, [authLoading, isAuthenticated, navigate]);

  const refreshAddresses = async () => {
    const response = await accountService.getAddresses();
    setAddresses(response.addresses || []);
  };

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    Promise.all([accountService.getProfile(), accountService.getAddresses()])
      .then(([profileResponse, addressResponse]) => {
        if (!active) return;
        setProfile(profileResponse.profile);
        setAddresses(addressResponse.addresses || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Your account could not be loaded. Try again.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSavingProfile(true);
    try {
      const response = await accountService.updateProfile(profile);
      const updatedProfile = { ...response.profile, email: response.emailChangeRequested ? profile.email : response.profile.email };
      setProfile(updatedProfile);
      syncProfile(response.profile);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message || 'Your profile could not be saved. Review the details and try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSavingProfile(true);
    try {
      await accountService.updatePassword(password);
      setPassword('');
      setMessage('Password updated. Use the new password the next time you sign in.');
    } catch (requestError) {
      setError(requestError.message || 'Your password could not be updated. Review the requirements and try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSavingAddress(true);
    try {
      if (editingAddress) await accountService.updateAddress(editingAddress, addressDraft);
      else await accountService.createAddress(addressDraft);
      await refreshAddresses();
      setAddressDraft(emptyAddress);
      setEditingAddress(null);
      setMessage(editingAddress ? 'Address updated.' : 'Address saved.');
    } catch (requestError) {
      setError(requestError.message || 'This address could not be saved. Review the details and try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address.id);
    setAddressDraft(Object.fromEntries(Object.keys(emptyAddress).map((key) => [key, address[key] ?? emptyAddress[key]])));
  };

  const makeDefault = async (id) => {
    setError('');
    try {
      await accountService.setDefaultAddress(id);
      await refreshAddresses();
      setMessage('Default address updated.');
    } catch (requestError) {
      setError(requestError.message || 'The default address could not be changed. Try again.');
    }
  };

  const removeAddress = async (id) => {
    setError('');
    try {
      await accountService.deleteAddress(id);
      await refreshAddresses();
      setDeleteAddressId(null);
      setMessage('Address removed.');
    } catch (requestError) {
      setError(requestError.message || 'This address could not be removed. Try again.');
    }
  };

  if (authLoading || isLoading) return <div className="flex min-h-96 items-center justify-center"><Spinner size="lg" /><span className="ml-3 text-sm text-content-secondary">Loading account...</span></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-7">
        <div><p className="text-sm font-semibold text-content-link">Your account</p><h1 className="mt-2 text-3xl font-bold text-content-primary">Profile and addresses</h1></div>
        <Link to="/orders" className="text-sm font-semibold text-content-link hover:underline">View order history</Link>
      </div>
      {error && <Alert variant="error" className="mt-6">{error}</Alert>}
      {message && <Alert variant="success" className="mt-6">{message}</Alert>}

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-10">
          <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="text-xl font-bold text-content-primary">Personal details</h2>
            <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
              {[['full_name', 'Full name', 'name'], ['email', 'Email address', 'email'], ['phone', 'Phone', 'tel']].map(([field, label, autoComplete]) => <label key={field} className="block text-sm font-medium text-content-primary">{label}<input type={field === 'email' ? 'email' : 'text'} autoComplete={autoComplete} required={field !== 'phone'} value={profile[field] || ''} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm focus:border-line-focus focus:outline-none focus:ring-2 focus:ring-brand/20" /></label>)}
              <div className="sm:col-span-2"><Button type="submit" isLoading={isSavingProfile}>Save profile</Button></div>
            </form>
          </section>

          <section aria-labelledby="password-heading" className="border-t border-line pt-8">
            <h2 id="password-heading" className="text-xl font-bold text-content-primary">Change password</h2>
            <form onSubmit={savePassword} className="mt-5 max-w-lg">
              <label className="block text-sm font-medium text-content-primary">New password<input type="password" autoComplete="new-password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm focus:border-line-focus focus:outline-none focus:ring-2 focus:ring-brand/20" /></label>
              <p className="mt-2 text-xs text-content-secondary">Use at least 8 characters, with an uppercase letter, a lowercase letter, and a number.</p>
              <Button type="submit" variant="secondary" isLoading={isSavingProfile} className="mt-4">Update password</Button>
            </form>
          </section>
        </div>

        <section aria-labelledby="addresses-heading">
          <h2 id="addresses-heading" className="text-xl font-bold text-content-primary">Saved addresses</h2>
          <div className="mt-5 space-y-3">
            {addresses.length === 0 && <p className="text-sm text-content-secondary">No saved addresses yet.</p>}
            {addresses.map((address) => <article key={address.id} className="rounded-md border border-line bg-surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold capitalize text-content-primary">{address.label}{address.is_default ? ' · Default' : ''}</p><p className="mt-2 text-sm leading-6 text-content-secondary">{address.full_name}<br />{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br />{address.city}, {address.state} {address.postal_code}<br />{address.country}<br />{address.phone}</p></div>
                <div className="flex flex-wrap gap-2"><Button variant="ghost" size="sm" onClick={() => editAddress(address)}>Edit</Button>{!address.is_default && <Button variant="secondary" size="sm" onClick={() => makeDefault(address.id)}>Set default</Button>}<Button variant="destructive" size="sm" onClick={() => setDeleteAddressId(address.id)}>Remove</Button></div></div>
              {deleteAddressId === address.id && <div className="mt-4 border-t border-line pt-3"><p className="text-sm text-content-secondary">Remove this saved address?</p><div className="mt-3 flex gap-2"><Button variant="destructive" size="sm" onClick={() => removeAddress(address.id)}>Remove address</Button><Button variant="secondary" size="sm" onClick={() => setDeleteAddressId(null)}>Keep address</Button></div></div>}
            </article>)}
          </div>

          <form onSubmit={saveAddress} className="mt-6 border-t border-line pt-6">
            <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-content-primary">{editingAddress ? 'Edit address' : 'Add an address'}</h3>{editingAddress && <Button type="button" variant="link" size="sm" onClick={() => { setEditingAddress(null); setAddressDraft(emptyAddress); }}>Cancel edit</Button>}</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">{addressFields.map(([field, label]) => <label key={field} className={`block text-sm font-medium text-content-primary ${field === 'address_line1' || field === 'address_line2' ? 'sm:col-span-2' : ''}`}>{label}{field === 'label' ? <select value={addressDraft.label} onChange={(event) => setAddressDraft((current) => ({ ...current, label: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm"><option value="home">Home</option><option value="work">Work</option><option value="other">Other</option></select> : <input required={field !== 'address_line2'} value={addressDraft[field] || ''} onChange={(event) => setAddressDraft((current) => ({ ...current, [field]: event.target.value }))} className="mt-2 block w-full rounded-md border border-line bg-surface-card px-3 py-2 text-sm" />}</label>)}</div>
            <label className="mt-4 flex items-center gap-2 text-sm text-content-primary"><input type="checkbox" checked={addressDraft.is_default} onChange={(event) => setAddressDraft((current) => ({ ...current, is_default: event.target.checked }))} className="h-4 w-4 accent-brand" />Set as default address</label>
            <Button type="submit" isLoading={isSavingAddress} className="mt-4">{editingAddress ? 'Save address' : 'Add address'}</Button>
          </form>
        </section>
      </div>
    </div>
  );
}