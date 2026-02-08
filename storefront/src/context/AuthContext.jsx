import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const AUTH_TOKEN_KEY = "retailx_customer_token";
const AUTH_REFRESH_KEY = "retailx_refresh_token";
const AUTH_USER_KEY = "retailx_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'register' | 'forgot'
  const [authRedirectCallback, setAuthRedirectCallback] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (token && storedUser) {
          // Verify token is still valid
          try {
            const response = await api.get("/auth/me");
            const userData = response.data.data.user;
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
          } catch (error) {
            // Token invalid, try refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem(AUTH_REFRESH_KEY);
      if (!refresh) {
        clearAuthData();
        return false;
      }

      const response = await api.post("/auth/refresh-token", { refreshToken: refresh });
      const { accessToken, refreshToken: newRefresh, user: userData } = response.data.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      if (newRefresh) {
        localStorage.setItem(AUTH_REFRESH_KEY, newRefresh);
      }
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  }, [clearAuthData]);

  // Register new user
  const register = useCallback(
    async (userData) => {
      try {
        const response = await api.post("/auth/register", {
          email: userData.email.trim().toLowerCase(),
          password: userData.password,
          firstName: userData.firstName.trim(),
          lastName: userData.lastName.trim(),
          phone: userData.phone?.trim() || "",
        });

        const { accessToken, refreshToken, user: newUser } = response.data.data;

        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

        setUser(newUser);
        setIsAuthenticated(true);
        setShowAuthModal(false);

        toast.success(`Welcome, ${newUser.firstName}! Account created successfully.`);

        // Execute callback if exists
        if (authRedirectCallback) {
          authRedirectCallback();
          setAuthRedirectCallback(null);
        }

        return { success: true, user: newUser };
      } catch (error) {
        const message = error.response?.data?.message || "Registration failed. Please try again.";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [authRedirectCallback],
  );

  // Login user
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await api.post("/auth/login", {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

        const { accessToken, refreshToken, user: loggedInUser } = response.data.data;

        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInUser));

        setUser(loggedInUser);
        setIsAuthenticated(true);
        setShowAuthModal(false);

        toast.success(`Welcome back, ${loggedInUser.firstName}!`);

        // Execute callback if exists
        if (authRedirectCallback) {
          authRedirectCallback();
          setAuthRedirectCallback(null);
        }

        return { success: true, user: loggedInUser };
      } catch (error) {
        const message = error.response?.data?.message || "Login failed. Please check your credentials.";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [authRedirectCallback],
  );

  // Logout user
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      toast.success("You have been logged out.");
    }
  }, [clearAuthData]);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      toast.success("Password reset link sent to your email.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset email.";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await api.patch("/auth/me", profileData);
      const updatedUser = response.data.data.user;

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Profile updated successfully.");
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile.";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to change password.";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Open auth modal with optional callback
  const openAuthModal = useCallback((mode = "login", callback = null) => {
    setAuthModalMode(mode);
    setAuthRedirectCallback(() => callback);
    setShowAuthModal(true);
  }, []);

  // Close auth modal
  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setAuthRedirectCallback(null);
  }, []);

  // Require auth - shows modal if not authenticated, returns promise
  const requireAuth = useCallback(
    (callback = null) => {
      if (isAuthenticated) {
        callback?.();
        return true;
      }
      openAuthModal("login", callback);
      return false;
    },
    [isAuthenticated, openAuthModal],
  );

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    showAuthModal,
    authModalMode,

    // Actions
    register,
    login,
    logout,
    forgotPassword,
    updateProfile,
    changePassword,
    refreshToken,

    // Modal controls
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
