import { apiRequest } from './api.js';
import { createClient } from '@supabase/supabase-js';

const DEMO_ADMIN_TOKEN = 'hoardly-local-demo-admin';
const DEMO_STORE_KEY = 'hoardly-local-admin-data';
const transitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

function queryString(params = {}) {
  const search = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined));
  return search.size ? `?${search}` : '';
}

function isDemoAdmin() {
  return import.meta.env.DEV && localStorage.getItem('auth_token') === DEMO_ADMIN_TOKEN;
}

function initialDemoStore() {
  const categories = [
    { id: 1, name: 'Electronics', slug: 'electronics', description: 'Everyday technology.', image_url: '', parent_id: null },
    { id: 2, name: 'Apparel', slug: 'apparel', description: 'Durable everyday clothing.', image_url: '', parent_id: null },
    { id: 3, name: 'Home & Living', slug: 'home-living', description: 'Useful pieces for home.', image_url: '', parent_id: null },
  ];
  const products = [
    { id: 1, name: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-noise-cancelling-headphones', description: 'Wireless headphones for focused listening.', price: 249.99, compare_at_price: 299.99, stock_quantity: 45, sku: 'ELEC-HEAD-001', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'], category_id: 1, is_active: true, attributes: { connectivity: 'Bluetooth' }, avg_rating: 4.8, review_count: 28 },
    { id: 2, name: 'Mechanical Keyboard TKL', slug: 'mechanical-keyboard-tkl', description: 'Tenkeyless keyboard with tactile switches.', price: 129.5, compare_at_price: 149, stock_quantity: 30, sku: 'ELEC-KEYB-002', images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'], category_id: 1, is_active: true, attributes: { layout: 'TKL' }, avg_rating: 4.7, review_count: 15 },
    { id: 3, name: 'Heavyweight Organic Cotton Tee', slug: 'heavyweight-organic-cotton-tee', description: 'Relaxed fit organic cotton tee.', price: 38, compare_at_price: null, stock_quantity: 120, sku: 'APP-TEE-001', images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'], category_id: 2, is_active: true, attributes: { material: 'Organic cotton' }, avg_rating: 4.6, review_count: 42 },
  ];
  const now = new Date().toISOString();
  return {
    categories,
    products,
    orders: [
      { id: 1001, order_number: 'HRD-DEMO-1001', status: 'pending', subtotal: 249.99, discount_amount: 0, total: 249.99, created_at: now, users: { full_name: 'Demo Customer', email: 'customer@example.test' }, order_items: [{ id: 1, quantity: 1, unit_price: 249.99, total_price: 249.99, products: { name: products[0].name, slug: products[0].slug } }] },
      { id: 1002, order_number: 'HRD-DEMO-1002', status: 'confirmed', subtotal: 167.5, discount_amount: 10, total: 157.5, created_at: now, users: { full_name: 'Sample Shopper', email: 'shopper@example.test' }, order_items: [{ id: 2, quantity: 1, unit_price: 129.5, total_price: 129.5, products: { name: products[1].name, slug: products[1].slug } }] },
    ],
    discounts: [
      { id: 1, code: 'WELCOME10', type: 'percentage', value: 10, min_order_amount: 50, max_uses: 1000, current_uses: 14, is_active: true, expires_at: null, created_at: now },
      { id: 2, code: 'SAVE25', type: 'fixed', value: 25, min_order_amount: 100, max_uses: 500, current_uses: 8, is_active: true, expires_at: null, created_at: now },
    ],
  };
}

function readDemoStore() {
  try {
    const saved = localStorage.getItem(DEMO_STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    localStorage.removeItem(DEMO_STORE_KEY);
  }
  const store = initialDemoStore();
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  return store;
}

function writeDemoStore(store) {
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
}

function demoCategories(store) {
  return store.categories.map((category) => ({
    ...category,
    product_count: store.products.filter((product) => product.category_id === category.id).length,
  }));
}

function demoProducts(store) {
  return store.products.map((product) => ({
    ...product,
    categories: store.categories.find((category) => category.id === product.category_id) || null,
  }));
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
  });
}

export const adminService = {
  uploadProductImage: async (file) => {
    if (!file || !allowedImageTypes.has(file.type)) {
      throw new Error('Choose a JPG, PNG, WebP, AVIF, or GIF image.');
    }
    if (isDemoAdmin()) {
      if (file.size > 350 * 1024) throw new Error('Local demo uploads are limited to 350 KB. Use a real Supabase admin account for larger images.');
      return { url: await readAsDataUrl(file) };
    }
    if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const accessToken = localStorage.getItem('auth_token');
    if (!supabaseUrl || !supabaseAnonKey || !accessToken) {
      throw new Error('Image uploads require a signed-in admin and configured Supabase client settings.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const path = `products/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message || 'The image could not be uploaded.');
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return { url: data.publicUrl };
  },
  getStats: () => {
    if (!isDemoAdmin()) return apiRequest('/admin/stats');
    const { orders, products } = readDemoStore();
    return Promise.resolve({ stats: {
      total_orders: orders.length,
      pending_orders: orders.filter((order) => order.status === 'pending').length,
      total_revenue: orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total), 0),
      active_products: products.filter((product) => product.is_active).length,
      total_users: 2,
    } });
  },
  getProducts: (params = {}) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/products${queryString(params)}`);
    const products = demoProducts(readDemoStore()).filter((product) => !params.search || product.name.toLowerCase().includes(params.search.toLowerCase()));
    return Promise.resolve({ products, pagination: { page: 1, limit: products.length, total: products.length, totalPages: 1 } });
  },
  createProduct: (product) => {
    if (!isDemoAdmin()) return apiRequest('/admin/products', { method: 'POST', body: product });
    const store = readDemoStore();
    const created = { ...product, id: nextId(store.products), avg_rating: 0, review_count: 0 };
    store.products.push(created);
    writeDemoStore(store);
    return Promise.resolve({ product: created });
  },
  updateProduct: (id, product) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/products/${id}`, { method: 'PUT', body: product });
    const store = readDemoStore();
    const index = store.products.findIndex((item) => item.id === Number(id));
    if (index < 0) return Promise.reject(new Error('Product not found.'));
    store.products[index] = { ...store.products[index], ...product };
    writeDemoStore(store);
    return Promise.resolve({ product: store.products[index] });
  },
  archiveProduct: (id) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
    const store = readDemoStore();
    const product = store.products.find((item) => item.id === Number(id));
    if (!product) return Promise.reject(new Error('Product not found.'));
    product.is_active = false;
    writeDemoStore(store);
    return Promise.resolve({ product, message: 'Product archived.' });
  },
  getCategories: () => isDemoAdmin() ? Promise.resolve({ categories: demoCategories(readDemoStore()) }) : apiRequest('/admin/categories'),
  createCategory: (category) => {
    if (!isDemoAdmin()) return apiRequest('/admin/categories', { method: 'POST', body: category });
    const store = readDemoStore();
    const created = { ...category, id: nextId(store.categories) };
    store.categories.push(created);
    writeDemoStore(store);
    return Promise.resolve({ category: created });
  },
  updateCategory: (id, category) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/categories/${id}`, { method: 'PUT', body: category });
    const store = readDemoStore();
    const index = store.categories.findIndex((item) => item.id === Number(id));
    if (index < 0) return Promise.reject(new Error('Category not found.'));
    store.categories[index] = { ...store.categories[index], ...category };
    writeDemoStore(store);
    return Promise.resolve({ category: store.categories[index] });
  },
  deleteCategory: (id) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
    const store = readDemoStore();
    if (store.products.some((product) => product.category_id === Number(id))) return Promise.reject(new Error('Move or archive this category’s products before removing the category.'));
    store.categories = store.categories.filter((item) => item.id !== Number(id));
    writeDemoStore(store);
    return Promise.resolve({ message: 'Category removed.' });
  },
  getOrders: (params = {}) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/orders${queryString(params)}`);
    const orders = readDemoStore().orders.filter((order) => !params.status || order.status === params.status);
    return Promise.resolve({ orders, pagination: { page: 1, limit: orders.length, total: orders.length, totalPages: 1 } });
  },
  updateOrderStatus: (id, status) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } });
    const store = readDemoStore();
    const order = store.orders.find((item) => item.id === Number(id));
    if (!order) return Promise.reject(new Error('Order not found.'));
    if (!transitions[order.status]?.includes(status)) return Promise.reject(new Error(`An order cannot move from ${order.status} to ${status}.`));
    order.status = status;
    writeDemoStore(store);
    return Promise.resolve({ order });
  },
  getDiscounts: () => isDemoAdmin() ? Promise.resolve({ discounts: readDemoStore().discounts }) : apiRequest('/admin/discounts'),
  createDiscount: (discount) => {
    if (!isDemoAdmin()) return apiRequest('/admin/discounts', { method: 'POST', body: discount });
    const store = readDemoStore();
    const created = { ...discount, id: nextId(store.discounts), current_uses: 0, created_at: new Date().toISOString() };
    store.discounts.push(created);
    writeDemoStore(store);
    return Promise.resolve({ discount: created });
  },
  updateDiscount: (id, discount) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/discounts/${id}`, { method: 'PUT', body: discount });
    const store = readDemoStore();
    const index = store.discounts.findIndex((item) => item.id === Number(id));
    if (index < 0) return Promise.reject(new Error('Discount code not found.'));
    store.discounts[index] = { ...store.discounts[index], ...discount };
    writeDemoStore(store);
    return Promise.resolve({ discount: store.discounts[index] });
  },
  deleteDiscount: (id) => {
    if (!isDemoAdmin()) return apiRequest(`/admin/discounts/${id}`, { method: 'DELETE' });
    const store = readDemoStore();
    store.discounts = store.discounts.filter((item) => item.id !== Number(id));
    writeDemoStore(store);
    return Promise.resolve({ message: 'Discount code removed.' });
  },
};