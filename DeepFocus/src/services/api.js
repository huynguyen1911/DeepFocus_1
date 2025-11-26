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
      // Don't log error here - this is a silent check during auto-login
      // AuthContext will handle the error gracefully
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

// Task API functions
export const taskAPI = {
  // Get all tasks for authenticated user
  getTasks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/tasks?${queryParams}` : "/tasks";
      const response = await apiClient.get(url);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single task by ID
  getTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await apiClient.post("/tasks", taskData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId, updates) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, updates);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Increment pomodoro count
  incrementTaskPomodoro: async (taskId, duration = 25) => {
    try {
      const response = await apiClient.post(
        `/tasks/${taskId}/increment-pomodoro`,
        { duration }
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete task
  completeTask: async (taskId) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}/complete`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get task statistics
  getTaskStats: async () => {
    try {
      const response = await apiClient.get("/tasks/stats");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

// Stats API functions
export const statsAPI = {
  // Get overall user stats
  getStats: async () => {
    try {
      const response = await apiClient.get("/stats");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Sync pomodoro completion
  syncStats: async (duration, taskId = null) => {
    try {
      const response = await apiClient.post("/stats/sync", {
        duration,
        taskId,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get daily stats for specific date
  getDailyStats: async (date) => {
    try {
      const dateStr =
        typeof date === "string" ? date : date.toISOString().split("T")[0];
      const response = await apiClient.get(`/stats/daily/${dateStr}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get weekly stats
  getWeeklyStats: async (year, week) => {
    try {
      const response = await apiClient.get(`/stats/weekly/${year}/${week}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get monthly stats
  getMonthlyStats: async (year, month) => {
    try {
      const response = await apiClient.get(`/stats/monthly/${year}/${month}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all achievements with progress
  getAchievements: async () => {
    try {
      const response = await apiClient.get("/stats/achievements");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset stats (for testing)
  resetStats: async () => {
    try {
      const response = await apiClient.delete("/stats/reset");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Role API functions
export const roleAPI = {
  // Get user roles
  getRoles: async () => {
    try {
      const response = await apiClient.get("/roles");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add a new role
  addRole: async (roleType) => {
    try {
      const response = await apiClient.post("/roles", { roleType });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Switch active role
  switchRole: async (roleType) => {
    try {
      const response = await apiClient.put("/roles/switch", { roleType });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update role-specific profile
  updateRoleProfile: async (roleType, profileData) => {
    try {
      const response = await apiClient.put(
        `/roles/${roleType}/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove a role
  removeRole: async (roleType) => {
    try {
      const response = await apiClient.delete(`/roles/${roleType}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Class Management API
export const classAPI = {
  // Create a new class (Teacher only)
  createClass: async (classData) => {
    try {
      const response = await apiClient.post("/classes", classData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get class details by ID
  getClass: async (classId) => {
    try {
      const response = await apiClient.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update class details (Teacher only)
  updateClass: async (classId, updates) => {
    try {
      const response = await apiClient.put(`/classes/${classId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete class (Teacher only)
  deleteClass: async (classId) => {
    try {
      const response = await apiClient.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all classes created by teacher
  getTeacherClasses: async () => {
    try {
      const response = await apiClient.get("/classes/teacher/my-classes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all classes joined by student
  getStudentClasses: async () => {
    try {
      const response = await apiClient.get("/classes/student/my-classes");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request to join class with join code (Student only)
  joinClass: async (joinCode) => {
    try {
      const response = await apiClient.post("/classes/join", { joinCode });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Regenerate join code for class (Teacher only)
  regenerateCode: async (classId) => {
    try {
      const response = await apiClient.post(
        `/classes/${classId}/regenerate-code`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get class members list
  getMembers: async (classId) => {
    try {
      const response = await apiClient.get(`/classes/${classId}/members`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve join request (Teacher only)
  approveRequest: async (classId, memberId) => {
    try {
      const response = await apiClient.put(
        `/classes/${classId}/members/${memberId}/approve`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject join request (Teacher only)
  rejectRequest: async (classId, memberId) => {
    try {
      const response = await apiClient.put(
        `/classes/${classId}/members/${memberId}/reject`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove member from class (Teacher only)
  removeMember: async (classId, memberId) => {
    try {
      const response = await apiClient.delete(
        `/classes/${classId}/members/${memberId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get class leaderboard
  getLeaderboard: async (classId, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/classes/${classId}/leaderboard?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update class statistics (Teacher only)
  updateStats: async (classId) => {
    try {
      const response = await apiClient.post(`/classes/${classId}/update-stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get student progress in class
  getStudentProgress: async (classId, studentId) => {
    try {
      const response = await apiClient.get(
        `/classes/${classId}/student/${studentId}/progress`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Session Management API (Phase 3)
export const sessionAPI = {
  // Create a new Pomodoro session
  createSession: async (sessionData) => {
    try {
      const response = await apiClient.post("/sessions", sessionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete a session
  completeSession: async (sessionId, notes = "") => {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}/complete`, {
        notes,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel a session
  cancelSession: async (sessionId) => {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get active session
  getActiveSession: async () => {
    try {
      const response = await apiClient.get("/sessions/active");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's sessions with pagination and filters
  getMySessions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `/sessions/my-sessions?${queryParams}`
        : "/sessions/my-sessions";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sessions for a specific class
  getClassSessions: async (classId, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `/sessions/class/${classId}?${queryParams}`
        : `/sessions/class/${classId}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get session statistics
  getSessionStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `/sessions/stats?${queryParams}`
        : "/sessions/stats";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Guardian Management API (Phase 5)
export const guardianAPI = {
  // Send link request to child
  sendLinkRequest: async (childIdentifier, relation = "parent", notes = "") => {
    try {
      const response = await apiClient.post("/guardian/link-child", {
        childIdentifier,
        relation,
        notes,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get linked children
  getLinkedChildren: async (status = "accepted") => {
    try {
      const response = await apiClient.get("/guardian/children", {
        params: { status },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get child's detailed progress
  getChildProgress: async (childId, period = "week") => {
    try {
      const response = await apiClient.get(
        `/guardian/children/${childId}/progress`,
        {
          params: { period },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get guardian dashboard summary
  getDashboardSummary: async () => {
    try {
      const response = await apiClient.get("/guardian/dashboard");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove link with child
  removeChildLink: async (childId) => {
    try {
      const response = await apiClient.delete(`/guardian/children/${childId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pending link requests (for child)
  getPendingRequests: async () => {
    try {
      const response = await apiClient.get("/guardian/link-requests");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Respond to link request (for child)
  respondToRequest: async (requestId, action) => {
    try {
      const response = await apiClient.put(
        `/guardian/link-requests/${requestId}`,
        { action }
      );
      return response.data;
    } catch (error) {
      throw error;
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
        "@deepfocus:app_language", // Clear language preference on logout
      ]);
    } catch (error) {
      console.error("❌ Clear auth data error:", error);
    }
  },
};

// Export axios instance for custom requests
export { apiClient };

export default authAPI;
