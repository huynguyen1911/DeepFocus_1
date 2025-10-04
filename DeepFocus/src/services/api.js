import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/env";
import { STORAGE_KEYS } from "../config/constants";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor - automatically add token to headers
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (__DEV__) {
        console.log(
          `🚀 API Request: ${config.method.toUpperCase()} ${config.url}`
        );
        if (config.data) {
          console.log("📤 Request Data:", config.data);
        }
      }

      return config;
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (__DEV__) {
      console.log(
        `✅ API Response: ${response.config.method.toUpperCase()} ${
          response.config.url
        }`
      );
      console.log("📥 Response Data:", response.data);
    }

    return response;
  },
  async (error) => {
    // Don't log errors here - let components handle error display
    // This prevents console.error from throwing and breaking Snackbar display

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log("🔒 Token expired, user logged out");
    }

    // Return formatted error
    const apiError = {
      status: error.response?.status || 0,
      message: error.response?.data?.message || "Network error occurred",
      data: error.response?.data || null,
      isNetworkError: !error.response,
    };

    return Promise.reject(apiError);
  }
);

// API functions
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user } = response.data.data;

      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log("✅ Login successful:", user.username);
      return { token, user };
    } catch (error) {
      // Don't log here - let AuthContext handle it to avoid console errors
      // Just re-throw the formatted error from interceptor
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", {
        username: userData.username.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        focusProfile: userData.focusProfile || {},
      });

      const { token, user } = response.data.data;

      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log("✅ Registration successful:", user.username);
      return { token, user };
    } catch (error) {
      // Don't log here - let AuthContext handle it to avoid console errors
      // Just re-throw the formatted error from interceptor
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile");

      const { user } = response.data.data;

      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("❌ Get profile failed:", error.message);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/auth/profile", profileData);

      const { user } = response.data.data;

      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      console.log("✅ Profile updated successfully");
      return user;
    } catch (error) {
      console.error("❌ Update profile failed:", error.message);
      throw error;
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiClient.get("/auth/verify");
      return response.data.data.user;
    } catch (error) {
      console.error("❌ Token verification failed:", error.message);
      throw error;
    }
  },

  // Logout (client-side)
  logout: async () => {
    try {
      // Optional: Call logout endpoint
      await apiClient.post("/auth/logout").catch(() => {
        // Ignore errors for logout endpoint
      });

      // Clear storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      // Still clear storage even if API call fails
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    }
  },
};

// General API utilities
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get stored token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      return null;
    }
  },

  // Get stored user data
  getStoredUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Clear all auth data
  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error("❌ Clear auth data error:", error);
    }
  },
};

// Export axios instance for custom requests
export { apiClient };

export default authAPI;
