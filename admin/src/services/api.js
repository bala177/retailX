import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh-token", { refreshToken }),
  changePassword: (data) => api.patch("/auth/change-password", data),
  updateProfile: (data) => api.patch("/auth/profile", data),
};

// Tenant APIs (Platform Admin)
export const tenantAPI = {
  getAll: (params) => api.get("/platform/tenants", { params }),
  getById: (id) => api.get(`/platform/tenants/${id}`),
  create: (data) => api.post("/platform/tenants", data),
  update: (id, data) => api.patch(`/platform/tenants/${id}`, data),
  delete: (id) => api.delete(`/platform/tenants/${id}`),
  getStats: (id) => api.get(`/platform/tenants/${id}/stats`),
};

// Store APIs (Tenant-specific)
export const createStoreAPI = (tenantSlug) => ({
  // Products
  products: {
    getAll: (params) => api.get(`/store/${tenantSlug}/products`, { params }),
    getById: (id) => api.get(`/store/${tenantSlug}/products/${id}`),
    create: (data) => api.post(`/store/${tenantSlug}/products`, data),
    update: (id, data) => api.patch(`/store/${tenantSlug}/products/${id}`, data),
    delete: (id) => api.delete(`/store/${tenantSlug}/products/${id}`),
  },

  // Categories
  categories: {
    getAll: (params) => api.get(`/store/${tenantSlug}/categories`, { params }),
    getById: (id) => api.get(`/store/${tenantSlug}/categories/${id}`),
    create: (data) => api.post(`/store/${tenantSlug}/categories`, data),
    update: (id, data) => api.patch(`/store/${tenantSlug}/categories/${id}`, data),
    delete: (id) => api.delete(`/store/${tenantSlug}/categories/${id}`),
  },

  // Orders
  orders: {
    getAll: (params) => api.get(`/store/${tenantSlug}/orders`, { params }),
    getById: (id) => api.get(`/store/${tenantSlug}/orders/${id}`),
    updateStatus: (id, status) => api.patch(`/store/${tenantSlug}/orders/${id}/status`, { status }),
  },

  // Customers
  customers: {
    getAll: (params) => api.get(`/store/${tenantSlug}/customers`, { params }),
    getById: (id) => api.get(`/store/${tenantSlug}/customers/${id}`),
  },

  // Dashboard Stats
  stats: {
    get: () => api.get(`/store/${tenantSlug}/stats`),
  },
});

// Super Admin APIs (RetailX Platform Control)
export const superAdminAPI = {
  // Dashboard
  getDashboard: () => api.get("/super-admin/dashboard"),
  getSettings: () => api.get("/super-admin/settings"),

  // Store Management
  stores: {
    getAll: (params) => api.get("/super-admin/stores", { params }),
    getById: (id) => api.get(`/super-admin/stores/${id}`),
    updateFeatures: (id, features) => api.patch(`/super-admin/stores/${id}/features`, { features }),
    updateBookingSettings: (id, bookingSettings) => api.patch(`/super-admin/stores/${id}/booking-settings`, { bookingSettings }),
    updateStatus: (id, status, reason) => api.patch(`/super-admin/stores/${id}/status`, { status, reason }),
    updatePlan: (id, plan, expiresAt) => api.patch(`/super-admin/stores/${id}/plan`, { plan, expiresAt }),
    setupService: (id) => api.post(`/super-admin/stores/${id}/setup-service`),
    setupProducts: (id, paymentEnabled) => api.post(`/super-admin/stores/${id}/setup-products`, { paymentEnabled }),
    delete: (id, confirmSlug) => api.delete(`/super-admin/stores/${id}`, { data: { confirmSlug } }),
  },

  // User Management
  users: {
    getAll: (params) => api.get("/super-admin/users", { params }),
    createStoreOwner: (data) => api.post("/super-admin/users/store-owner", data),
    updateRole: (id, role, tenantId) => api.patch(`/super-admin/users/${id}/role`, { role, tenantId }),
    updateStatus: (id, status, reason) => api.patch(`/super-admin/users/${id}/status`, { status, reason }),
  },
};

export default api;
