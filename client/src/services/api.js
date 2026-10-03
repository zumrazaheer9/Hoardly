const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')).replace(/\/+$/, '');

/**
 * Custom API client for backend requests.
 * Automatically injects the Authorization Bearer token if present.
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('auth_token');

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config = {
    method,
    headers: requestHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (cause) {
    const error = new Error('The store could not be reached. Check your connection and try again shortly.');
    error.cause = cause;
    throw error;
  }
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || 'A network error occurred. Please check your connection and retry.';
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.error?.details || null;
    throw error;
  }

  return data;
}
