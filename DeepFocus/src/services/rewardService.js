import { apiClient } from "./api";

/**
 * Reward Service - API functions for reward/penalty management
 * Phase 3 Frontend Session 1
 */

export const rewardService = {
  /**
   * Create a new reward or penalty
   * @param {Object} rewardData - Reward/penalty data
   * @param {string} rewardData.classId - Class ID
   * @param {string} rewardData.studentId - Student ID receiving reward
   * @param {string} rewardData.reason - Reason for reward/penalty
   * @param {number} rewardData.points - Points (positive for reward, negative for penalty)
   * @param {string} [rewardData.category] - Category (academic, behavior, attendance)
   * @returns {Promise<Object>} Created reward object
   */
  createReward: async (rewardData) => {
    try {
      const response = await apiClient.post("/rewards", rewardData);

      if (__DEV__) {
        console.log("🏆 Reward created:", response.data.data);
      }

      return response.data;
    } catch (error) {
      console.error("❌ Create reward error:", error.message);
      throw error;
    }
  },

  /**
   * Get all rewards for a specific class
   * @param {string} classId - Class ID
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.studentId] - Filter by student ID
   * @param {string} [options.category] - Filter by category
   * @returns {Promise<Object>} Rewards list with pagination
   */
  getRewardsByClass: async (classId, options = {}) => {
    try {
      const params = new URLSearchParams();

      if (options.page) params.append("page", options.page);
      if (options.limit) params.append("limit", options.limit);
      if (options.studentId) params.append("studentId", options.studentId);
      if (options.category) params.append("category", options.category);

      const queryString = params.toString();
      const url = `/classes/${classId}/rewards${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiClient.get(url);

      if (__DEV__) {
        console.log(
          `📋 Fetched ${response.data.data.length} rewards for class ${classId}`
        );
      }

      return response.data;
    } catch (error) {
      console.error("❌ Get rewards error:", error.message);
      throw error;
    }
  },

  /**
   * Get reward summary (total points) for students in a class
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Summary with student points
   */
  getRewardSummary: async (classId) => {
    try {
      const response = await apiClient.get(
        `/classes/${classId}/rewards/summary`
      );

      if (__DEV__) {
        console.log(
          `📊 Reward summary for class ${classId}:`,
          response.data.data
        );
      }

      return response.data;
    } catch (error) {
      console.error("❌ Get reward summary error:", error.message);
      throw error;
    }
  },

  /**
   * Delete a reward (only by creator or admin)
   * @param {string} rewardId - Reward ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteReward: async (rewardId) => {
    try {
      const response = await apiClient.delete(`/rewards/${rewardId}`);

      if (__DEV__) {
        console.log(`🗑️ Reward ${rewardId} deleted`);
      }

      return response.data;
    } catch (error) {
      console.error("❌ Delete reward error:", error.message);
      throw error;
    }
  },
};

export default rewardService;
