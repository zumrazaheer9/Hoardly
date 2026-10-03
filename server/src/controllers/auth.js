import { createPublicClient, supabaseAdmin } from '../config/supabase.js';
import { createError } from '../middleware/errorHandler.js';
import { config } from '../config/env.js';
import { updateAuthenticatedUser } from '../services/auth.js';

export async function register(req, res, next) {
  try {
    const { email, password, full_name, phone } = req.body;

    const { data, error } = await createPublicClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: config.clientUrl,
        data: {
          full_name,
          role: 'customer',
        },
      },
    });

    if (error) {
      if (error.message && error.message.toLowerCase().includes('already registered')) {
        throw createError(409, 'An account with this email already exists. Please sign in instead.');
      }
      if (error.name === 'AuthRetryableFetchError' || error.message?.toLowerCase().includes('fetch failed')) {
        throw createError(503, 'Account creation is temporarily unavailable because the identity service could not be reached. Check the server Supabase settings and try again.');
      }
      throw createError(400, error.message || 'Registration failed. Please check your information and try again.');
    }

    if (!data.user) {
      throw createError(500, 'Unable to create account. Please try again later.');
    }

    // Upsert public user profile to ensure phone and full_name are set
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name,
        phone: phone || null,
        role: 'customer',
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('[Auth register] Profile upsert warning:', profileError.message);
    }

    // Fetch the updated profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .eq('id', data.user.id)
      .single();

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile || { full_name, role: 'customer' },
      },
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const isAdminAlias = email === 'admin';

    const { data, error } = await createPublicClient().auth.signInWithPassword({
      email: isAdminAlias ? config.adminLoginEmail : email,
      password,
    });

    if (error || !data.user) {
      throw createError(401, 'Invalid email or password. Please verify your credentials and try again.');
    }

    // Fetch user profile from public.users table
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .eq('id', data.user.id)
      .single();

    if (isAdminAlias && profile?.role !== 'admin') {
      throw createError(401, 'Invalid email or password. Please verify your credentials and try again.');
    }

    res.json({
      message: 'Signed in successfully.',
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile || { role: 'customer' },
      },
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { error } = await supabaseAdmin.auth.admin.signOut(req.authToken, 'local');
    if (error) throw error;
    res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const redirectTo = `${config.clientUrl}/reset-password`;

    const { error } = await createPublicClient().auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw createError(400, error.message || 'Unable to process password reset request. Please try again.');
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been dispatched. Please check your inbox.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { password } = req.body;

    const user = await updateAuthenticatedUser(req.authToken, { password });

    res.json({
      message: 'Password updated successfully. Please sign in with your new credentials.',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const { data: profile, error } = await req.supabase
      .from('users')
      .select('id, email, full_name, phone, role, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('[Auth getMe] Profile fetch notice:', error.message);
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        profile: profile || { role: 'customer' },
      },
    });
  } catch (err) {
    next(err);
  }
}
