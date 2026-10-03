import { apiRequest } from './api.js';

export const authService = {
  async register({ email, password, full_name, phone }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { email, password, full_name, phone },
    });
  },

  async login({ email, password }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async logout() {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  async forgotPassword(email) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(password) {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { password },
    });
  },

  async getMe() {
    return apiRequest('/auth/me');
  },
};
