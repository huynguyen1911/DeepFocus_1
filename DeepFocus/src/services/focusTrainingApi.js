/**
 * Focus Training API Service
 * Handles all API calls for AI-powered focus training feature
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/env";
import { STORAGE_KEYS } from "../config/constants";

// Create axios instance for focus training
const focusTrainingClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/focus-training`,
  timeout: 300000, // 300s (5 minutes) for AI plan generation - 4 weeks can take 2-4 minutes
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
focusTrainingClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (__DEV__) {
        console.log(
          `🎯 Focus Training API: ${config.method?.toUpperCase()} ${config.url}`
        );
      }

      return config;
    } catch (error) {
      console.error("❌ Focus Training API - Token error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
focusTrainingClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ Focus Training API Response:`, response.data);
    }
    return response.data; // Return data directly
  },
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    // Don't log 404 as errors - they're expected for "no active plan" etc
    if (__DEV__ && status !== 404) {
      console.error(`❌ Focus Training API Error:`, errorData || error.message);
    }

    // Handle specific error cases
    if (status === 401) {
      // Unauthorized - token expired
      return Promise.reject({
        message: "Session expired. Please login again.",
        code: "AUTH_EXPIRED",
      });
    }

    if (status === 404) {
      return Promise.reject({
        message: errorData?.message || "Resource not found",
        code: "NOT_FOUND",
        silent: true, // Flag for silent handling
      });
    }

    return Promise.reject({
      message: errorData?.message || error.message || "Network error",
      code: errorData?.code || "NETWORK_ERROR",
    });
  }
);

/**
 * Focus Training API Methods
 */
const focusTrainingApi = {
  /**
   * 1. Submit Initial Assessment
   * @param {Object} assessmentData - Assessment responses
   * @returns {Promise<Object>} Assessment result with AI analysis
   */
  async submitAssessment(assessmentData) {
    try {
      const response = await focusTrainingClient.post(
        "/assess",
        assessmentData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      throw error;
    }
  },

  /**
   * 2. Generate Training Plan
   * @param {Object} params - { assessmentId, startDate?, customDuration? }
   * @returns {Promise<Object>} Generated plan details
   */
  async generatePlan(params) {
    try {
      const response = await focusTrainingClient.post("/generate-plan", params);
      return response.data;
    } catch (error) {
      console.error("Failed to generate plan:", error);
      throw error;
    }
  },

  /**
   * 3. Get Active Plan
   * @returns {Promise<Object>} Active training plan
   */
  async getActivePlan() {
    try {
      const response = await focusTrainingClient.get("/plan");
      return response.data;
    } catch (error) {
      // Don't log 404 - it's expected when no active plan exists
      if (!error.silent && __DEV__) {
        console.error("Failed to get active plan:", error);
      }
      throw error;
    }
  },

  /**
   * 4. Get Training Days (for calendar)
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Array>} Training days in date range
   */
  async getTrainingDays(startDate, endDate) {
    try {
      const response = await focusTrainingClient.get("/days", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get training days:", error);
      throw error;
    }
  },

  /**
   * 5. Get Training Day by Date
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise<Object>} Training day details with challenges
   */
  async getTrainingDay(date) {
    try {
      const response = await focusTrainingClient.get(`/day/${date}`);
      return response; // Interceptor already unwrapped to { success, data: { trainingDay } }
    } catch (error) {
      console.error("Failed to get training day:", error);
      throw error;
    }
  },

  /**
   * 6. Complete Challenge
   * @param {string} dayId - Training day ID
   * @param {number} challengeIndex - Challenge index (0-based)
   * @param {Object} data - { score: 1-10 }
   * @returns {Promise<Object>} Updated training day
   */
  async completeChallenge(dayId, challengeIndex, data) {
    try {
      const response = await focusTrainingClient.post(
        `/day/${dayId}/challenge/${challengeIndex}/complete`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to complete challenge:", error);
      throw error;
    }
  },

  /**
   * 7. Submit Weekly Assessment
   * @param {Object} assessmentData - Weekly assessment responses
   * @returns {Promise<Object>} Assessment result with AI feedback
   */
  async submitWeeklyAssessment(assessmentData) {
    try {
      const response = await focusTrainingClient.post(
        "/weekly-assessment",
        assessmentData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to submit weekly assessment:", error);
      throw error;
    }
  },

  /**
   * 8. Get Progress Dashboard
   * @returns {Promise<Object>} Progress stats and history
   */
  async getProgress() {
    try {
      const response = await focusTrainingClient.get("/progress");
      return response.data;
    } catch (error) {
      console.error("Failed to get progress:", error);
      throw error;
    }
  },

  /**
   * 9. Update Plan Status
   * @param {string} action - 'pause' | 'resume' | 'cancel'
   * @returns {Promise<Object>} Updated plan
   */
  async updatePlanStatus(action) {
    try {
      const response = await focusTrainingClient.put("/plan/status", {
        action,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update plan status:", error);
      throw error;
    }
  },

  /**
   * Helper: Check if user has active plan
   * @returns {Promise<boolean>}
   */
  async hasActivePlan() {
    try {
      const response = await this.getActivePlan();
      return response?.data?.plan !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Helper: Get today's training
   * @returns {Promise<Object|null>}
   */
  async getTodayTraining() {
    try {
      // Use local date to avoid timezone issues
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}`;
      console.log("📅 Getting today training for:", today);
      const response = await this.getTrainingDay(today);
      // response = { success, data: { trainingDay } }
      return response.data; // Returns { trainingDay }
    } catch (error) {
      return null;
    }
  },

  /**
   * Helper: Get current month training days
   * @returns {Promise<Array>}
   */
  async getCurrentMonthDays() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      // Use local dates to avoid timezone issues
      const firstDay = new Date(year, month, 1);
      const startDate = `${firstDay.getFullYear()}-${String(
        firstDay.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const lastDay = new Date(year, month + 1, 0);
      const endDate = `${lastDay.getFullYear()}-${String(
        lastDay.getMonth() + 1
      ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

      const response = await this.getTrainingDays(startDate, endDate);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
};

export default focusTrainingApi;
