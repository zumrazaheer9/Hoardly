import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = url && key ? createClient(url, key) : null;

export async function persistAuthSession(session) {
  if (!session?.access_token) throw new Error('Sign-in could not be completed. Please try again.');
  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.setSession(session);
    if (error) throw error;
    localStorage.setItem('auth_token', data.session.access_token);
    return data.session.access_token;
  }
  localStorage.setItem('auth_token', session.access_token);
  return session.access_token;
}
