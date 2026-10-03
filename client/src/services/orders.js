import { apiRequest } from './api.js';

export const ordersService = {
	createOrder: (shippingAddress, discountCode) => apiRequest('/orders', {
		method: 'POST',
		body: { shipping_address: shippingAddress, discount_code: discountCode },
	}),
	getOrders: () => apiRequest('/orders'),
	getOrder: (id) => apiRequest(`/orders/${id}`),
	getAddresses: () => apiRequest('/users/addresses'),
};
