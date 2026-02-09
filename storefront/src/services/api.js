import axios from "axios";

// Get the store slug from environment or localStorage (no default - store selection is required)
const getStoreSlug = () => {
  const slug = localStorage.getItem("storeSlug") || import.meta.env.VITE_STORE_SLUG || null;
  return slug;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Resolve image URLs - handles both absolute URLs and relative upload paths
export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // For relative paths like /uploads/heroes/..., prepend the API origin
  const origin = API_URL.replace(/\/api\/v1$/, "");
  return `${origin}${url}`;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s timeout - Render free tier cold starts can take 20-30s
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add store slug header to all requests
api.interceptors.request.use(
  (config) => {
    const slug = getStoreSlug();
    if (slug) {
      config.headers["x-store-slug"] = slug;
    }

    // Add auth token if available - use the same key as AuthContext
    const token = localStorage.getItem("retailx_customer_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("retailx_refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem("retailx_customer_token", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("retailx_customer_token");
        localStorage.removeItem("retailx_refresh_token");
        localStorage.removeItem("retailx_user");
      }
    }

    return Promise.reject(error);
  },
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

// Cart API - matches backend storeRoutes.js exactly
export const cartAPI = {
  get: () => api.get("/store/cart"),
  add: (data) => api.post("/store/cart/items", data),
  update: (productId, data) => api.patch(`/store/cart/items/${productId}`, data),
  remove: (productId) => api.delete(`/store/cart/items/${productId}`),
  clear: () => api.delete("/store/cart"),
  applyDiscount: (code) => api.post("/store/cart/discount", { code }),
  removeDiscount: () => api.delete("/store/cart/discount"),
  merge: () => api.post("/store/cart/merge"),
};

// Orders API - matches backend storeRoutes.js exactly
export const ordersAPI = {
  create: (data) => api.post("/store/orders", data),
  getMyOrders: () => api.get("/store/orders/my-orders"),
  getByNumber: (orderNumber) => api.get(`/store/orders/number/${orderNumber}`),
  cancel: (id) => api.post(`/store/orders/${id}/cancel`),
};

// Customer Auth API - uses standard auth routes with x-store-slug header
export const customerAuthAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/me", data),
  changePassword: (data) => api.patch("/auth/change-password", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  logout: () => api.post("/auth/logout"),
};

// Reviews API - matches backend storeRoutes.js exactly
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/store/products/${productId}/reviews`),
  create: (productId, data) => api.post(`/store/products/${productId}/reviews`, data),
  update: (id, data) => api.patch(`/store/reviews/${id}`, data),
  delete: (id) => api.delete(`/store/reviews/${id}`),
  markHelpful: (id) => api.post(`/store/reviews/${id}/helpful`),
};

// Contact & Newsletter API - matches backend storeRoutes.js exactly
export const contactAPI = {
  submit: (data) => api.post("/store/contact", data),
  subscribeNewsletter: (email) => api.post("/store/newsletter", { email }),
  unsubscribeNewsletter: (email) => api.post("/store/newsletter/unsubscribe", { email }),
};

// Staff API
export const staffAPI = {
  getAll: () => api.get("/store/staff"),
  getById: (id) => api.get(`/store/staff/${id}`),
};

// Booking API - matches backend storeRoutes.js exactly
export const bookingAPI = {
  getAvailability: (params) => api.get("/store/bookings/availability", { params }),
  create: (data) => api.post("/store/bookings", data),
  getMyBookings: () => api.get("/store/bookings/my-bookings"),
  cancel: (id) => api.post(`/store/bookings/${id}/cancel`),
};

// Coupon API - matches backend storeRoutes.js exactly
export const couponAPI = {
  validate: (code, orderAmount) => api.post("/store/coupons/validate", { code, orderAmount }),
  getPublic: () => api.get("/store/coupons/public"),
};

export default api;
