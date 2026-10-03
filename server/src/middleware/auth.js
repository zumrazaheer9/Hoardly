import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { createError } from './errorHandler.js';

/**
 * Authentication middleware.
 * Extracts the Supabase JWT from the Authorization header,
 * verifies it, and attaches the user to req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authentication required. Please sign in to continue.');
    }

    const token = authHeader.split(' ')[1];

    // Create a client scoped to this user's JWT (respects RLS)
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw createError(401, 'Your session has expired. Please sign in again.');
    }

    // Attach user and scoped client to request
    req.user = user;
    req.authToken = token;
    req.supabase = supabase;
    next();
  } catch (err) {
    if (err.statusCode) {
      return next(err);
    }
    next(createError(401, 'Authentication failed. Please sign in again.'));
  }
}

/**
 * Admin authorization middleware.
 * Must be used AFTER requireAuth.
 * Checks the user's role in the public.users table.
 */
export async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required.');
    }

    const { data: profile, error } = await req.supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      throw createError(403, 'Unable to verify your permissions.');
    }

    if (profile.role !== 'admin') {
      throw createError(403, 'You do not have permission to access this resource.');
    }

    req.userRole = 'admin';
    next();
  } catch (err) {
    if (err.statusCode) {
      return next(err);
    }
    next(createError(403, 'Access denied.'));
  }
}
