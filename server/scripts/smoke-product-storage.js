import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  STORAGE_SMOKE_ADMIN_EMAIL: process.env.STORAGE_SMOKE_ADMIN_EMAIL,
  STORAGE_SMOKE_ADMIN_PASSWORD: process.env.STORAGE_SMOKE_ADMIN_PASSWORD,
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length) {
  throw new Error(`Storage smoke test requires: ${missing.join(', ')}`);
}

const supabase = createClient(required.SUPABASE_URL, required.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
const objectPath = `smoke/storage-check-${Date.now()}.png`;
let uploaded = false;

try {
  const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
    email: required.STORAGE_SMOKE_ADMIN_EMAIL,
    password: required.STORAGE_SMOKE_ADMIN_PASSWORD,
  });
  if (signInError || !session.user) throw signInError || new Error('Admin sign-in did not return a user.');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (profileError) throw profileError;
  if (profile?.role !== 'admin') throw new Error('The smoke-test account does not have the admin role.');

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(objectPath, onePixelPng, {
      cacheControl: '60',
      contentType: 'image/png',
      upsert: false,
    });
  if (uploadError) throw uploadError;
  uploaded = true;

  const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(objectPath);
  const response = await fetch(publicData.publicUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Uploaded image was not publicly readable (${response.status}).`);
  if (!response.headers.get('content-type')?.startsWith('image/')) {
    throw new Error('Uploaded object did not return an image content type.');
  }

  console.log('Product image storage upload, public read, and admin RLS checks passed.');
} finally {
  if (uploaded) {
    const { error: removeError } = await supabase.storage.from('product-images').remove([objectPath]);
    if (removeError) console.error(`Smoke object cleanup failed: ${removeError.message}`);
  }
  await supabase.auth.signOut();
}
