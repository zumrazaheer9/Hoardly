import { apiRequest } from './api.js';

export const cartService = {
  getCart: () => apiRequest('/cart'),
  addItem: (productId, quantity = 1) => apiRequest('/cart', { method: 'POST', body: { product_id: productId, quantity } }),
  updateItem: (itemId, quantity) => apiRequest(`/cart/${itemId}`, { method: 'PUT', body: { quantity } }),
  removeItem: (itemId) => apiRequest(`/cart/${itemId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/cart', { method: 'DELETE' }),
  applyDiscount: (code) => apiRequest('/cart/apply-discount', { method: 'POST', body: { code } }),
};
