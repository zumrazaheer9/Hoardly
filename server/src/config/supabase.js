import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Public client (respects RLS — used for user-facing operations)
export function createPublicClient() {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export const supabase = createPublicClient();

// Service-role client (bypasses RLS — used for admin operations only)
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);
