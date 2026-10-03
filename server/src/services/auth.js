import { config } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

// The API receives a verified access token, not a browser refresh-token session.
export async function updateAuthenticatedUser(token, attributes) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attributes),
    signal: AbortSignal.timeout(10000),
  });
  const user = await response.json();
  if (!response.ok) {
    throw createError(response.status >= 500 ? 503 : 400, user.msg || user.message || 'Account changes could not be saved. Please try again.');
  }
  return user;
}
