import { apiRequest } from './api.js';

export const productsService = {
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.minPrice) searchParams.append('minPrice', params.minPrice);
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);
    if (params.rating) searchParams.append('rating', params.rating);
    if (params.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return apiRequest(endpoint);
  },

  async getProductBySlug(slug) {
    return apiRequest(`/products/${slug}`);
  },

  async getProductReviews(productId) {
    return apiRequest(`/products/${productId}/reviews`);
  },

  async getReviewEligibility(productId) {
    return apiRequest(`/products/${productId}/review-eligibility`);
  },

  async createReview(productId, reviewData) {
    return apiRequest(`/products/${productId}/reviews`, {
      method: 'POST',
      body: reviewData,
    });
  },

  async getCategories() {
    return apiRequest('/categories');
  },
};
