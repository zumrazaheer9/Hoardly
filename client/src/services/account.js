import { apiRequest } from './api.js';

export const accountService = {
  getProfile: () => apiRequest('/users/profile'),
  updateProfile: (profile) => apiRequest('/users/profile', { method: 'PUT', body: profile }),
  updatePassword: (password) => apiRequest('/users/password', { method: 'PUT', body: { password } }),
  getAddresses: () => apiRequest('/users/addresses'),
  createAddress: (address) => apiRequest('/users/addresses', { method: 'POST', body: address }),
  updateAddress: (id, address) => apiRequest(`/users/addresses/${id}`, { method: 'PUT', body: address }),
  deleteAddress: (id) => apiRequest(`/users/addresses/${id}`, { method: 'DELETE' }),
  setDefaultAddress: (id) => apiRequest(`/users/addresses/${id}/default`, { method: 'PATCH' }),
};