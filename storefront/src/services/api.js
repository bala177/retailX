import axios from "axios";

// Get the store slug from environment or localStorage (no default - store selection is required)
const getStoreSlug = () => {
  const slug = localStorage.getItem("storeSlug") || import.meta.env.VITE_STORE_SLUG || null;
  return slug;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add store slug header to all requests
api.interceptors.request.use(
  (config) => {
    const slug = getStoreSlug();
    config.headers["x-store-slug"] = slug;

    // Add auth token if available
    const token = localStorage.getItem("customerToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Platform API (public endpoints)
export const platformAPI = {
  getStores: () => api.get("/stores"),
};

// Store API
export const storeAPI = {
  getInfo: () => api.get("/store/info"),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/store/products", { params }),
  getBySlug: (slug) => api.get(`/store/products/${slug}`),
  getFeatured: () => api.get("/store/products", { params: { featured: true, limit: 8 } }),
  getNewArrivals: () => api.get("/store/products", { params: { sort: "-createdAt", limit: 8 } }),
  getOnSale: () => api.get("/store/products", { params: { onSale: true, limit: 8 } }),
  getBestsellers: () => api.get("/store/products", { params: { sort: "-ratings.count", limit: 8 } }),
  getByCategory: (categorySlug) => api.get("/store/products", { params: { category: categorySlug } }),
  getRelated: (productId, limit = 4) => api.get(`/store/products/${productId}/related`, { params: { limit } }),
  search: (query) => api.get("/store/products", { params: { search: query } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/store/categories"),
  getBySlug: (slug) => api.get(`/store/categories/${slug}`),
};

// Cart API (for guest cart - stored locally, synced with server when logged in)
export const cartAPI = {
  get: () => api.get("/store/cart"),
  add: (data) => api.post("/store/cart", data),
  update: (itemId, data) => api.put(`/store/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/store/cart/${itemId}`),
  clear: () => api.delete("/store/cart"),
};

// Checkout API
export const checkoutAPI = {
  create: (data) => api.post("/store/checkout", data),
  getSession: (sessionId) => api.get(`/store/checkout/${sessionId}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get("/store/orders"),
  getById: (id) => api.get(`/store/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/store/orders/number/${orderNumber}`),
};

// Customer Auth API
export const customerAuthAPI = {
  register: (data) => api.post("/store/auth/register", data),
  login: (data) => api.post("/store/auth/login", data),
  getProfile: () => api.get("/store/auth/profile"),
  updateProfile: (data) => api.put("/store/auth/profile", data),
  changePassword: (data) => api.put("/store/auth/password", data),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/store/reviews/product/${productId}`),
  create: (data) => api.post("/store/reviews", data),
  markHelpful: (id) => api.post(`/store/reviews/${id}/helpful`),
};

// Contact & Newsletter API
export const contactAPI = {
  submit: (data) => api.post("/store/contact", data),
  subscribeNewsletter: (email) => api.post("/store/newsletter/subscribe", { email }),
  unsubscribeNewsletter: (email) => api.post("/store/newsletter/unsubscribe", { email }),
};

// Staff API
export const staffAPI = {
  getAll: () => api.get("/store/staff"),
  getById: (id) => api.get(`/store/staff/${id}`),
};

// Booking API
export const bookingAPI = {
  getAvailability: (params) => api.get("/store/bookings/availability", { params }),
  create: (data) => api.post("/store/bookings", data),
  getMyBookings: () => api.get("/store/bookings/my"),
  cancel: (id) => api.patch(`/store/bookings/${id}/cancel`),
};

// Coupon API
export const couponAPI = {
  validate: (code, orderAmount) => api.post("/store/coupons/validate", { code, orderAmount }),
  getPublic: () => api.get("/store/coupons"),
};

export default api;
