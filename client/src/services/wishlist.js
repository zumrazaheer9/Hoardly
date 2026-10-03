import { apiRequest } from './api.js';

export const wishlistService = {
  getWishlist: () => apiRequest('/wishlist'),
  addItem: (productId) => apiRequest('/wishlist', { method: 'POST', body: { product_id: productId } }),
  removeItem: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'DELETE' }),
};
