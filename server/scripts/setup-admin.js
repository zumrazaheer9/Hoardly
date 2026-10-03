import { z } from 'zod';
import { config } from '../src/config/env.js';
import { supabaseAdmin } from '../src/config/supabase.js';

async function setupAdmin() {
  const email = z.string().email().parse(config.adminLoginEmail);
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 8) throw new Error('Set ADMIN_INITIAL_PASSWORD to a password of at least 8 characters before running this command.');

  const { data: profile, error: lookupError } = await supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle();
  if (lookupError) throw lookupError;

  let user;
  if (profile) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    if (error) throw error;
    if (data.user.email?.toLowerCase() !== email) throw new Error('Profile and authentication emails differ. Correct the account mapping before continuing.');
    const updated = await supabaseAdmin.auth.admin.updateUserById(profile.id, { password, email_confirm: true });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: 'Hoardly Admin' },
    });
    if (error) throw error;
    user = data.user;
  }

  const { data: saved, error } = await supabaseAdmin.from('users')
    .upsert({ id: user.id, email, full_name: 'Hoardly Admin', role: 'admin' }, { onConflict: 'id' })
    .select('role').single();
  if (error) throw error;
  if (saved.role !== 'admin') throw new Error('Administrator permissions could not be assigned.');
  console.log('Store administrator configured. Sign in with the username admin.');
}

setupAdmin().catch((error) => {
  console.error('Administrator setup failed:', error.message);
  process.exitCode = 1;
});
