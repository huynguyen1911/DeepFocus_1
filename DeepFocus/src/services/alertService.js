import { apiClient } from "./api";

/**
 * Alert Service - API functions for notification/alert management
 * Phase 3 Frontend Session 1
 */

export const alertService = {
  /**
   * Get alerts for the current user
   * @param {Object} options - Query options
   * @param {boolean} [options.unreadOnly=false] - Only fetch unread alerts
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.type] - Filter by alert type (info, success, warning, alert)
   * @param {number} [options.minPriority] - Filter by minimum priority (0-10)
   * @returns {Promise<Object>} Alerts list with pagination and unread count
   */
  getAlerts: async (options = {}) => {
    try {
      const params = new URLSearchParams();

      if (options.unreadOnly) params.append("unreadOnly", "true");
      if (options.page) params.append("page", options.page);
      if (options.limit) params.append("limit", options.limit);
      if (options.type) params.append("type", options.type);
      if (options.minPriority !== undefined)
        params.append("minPriority", options.minPriority);

      const queryString = params.toString();
      const url = `/alerts${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);

      if (__DEV__) {
        console.log(
          `🔔 Fetched ${response.data.data.length} alerts (unread: ${
            response.data.unreadCount || 0
          })`
        );
      }

      return response.data;
    } catch (error) {
      console.error("❌ Get alerts error:", error.message);
      throw error;
    }
  },

  /**
   * Mark a single alert as read
   * @param {string} alertId - Alert ID to mark as read
   * @returns {Promise<Object>} Updated alert object
   */
  markAlertAsRead: async (alertId) => {
    try {
      const response = await apiClient.put(`/alerts/${alertId}/read`);

      if (__DEV__) {
        console.log(`✅ Alert ${alertId} marked as read`);
      }

      return response.data;
    } catch (error) {
      console.error("❌ Mark alert as read error:", error.message);
      throw error;
    }
  },

  /**
   * Mark all alerts as read for the current user
   * @returns {Promise<Object>} Number of alerts updated
   */
  markAllAlertsAsRead: async () => {
    try {
      const response = await apiClient.put("/alerts/read-all");

      if (__DEV__) {
        console.log(
          `✅ Marked ${response.data.data.modifiedCount} alerts as read`
        );
      }

      return response.data;
    } catch (error) {
      console.error("❌ Mark all alerts as read error:", error.message);
      throw error;
    }
  },

  /**
   * Delete a single alert
   * @param {string} alertId - Alert ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteAlert: async (alertId) => {
    try {
      const response = await apiClient.delete(`/alerts/${alertId}`);

      if (__DEV__) {
        console.log(`🗑️ Alert ${alertId} deleted`);
      }

      return response.data;
    } catch (error) {
      console.error("❌ Delete alert error:", error.message);
      throw error;
    }
  },

  /**
   * Cleanup old alerts (>90 days) - Admin only
   * @returns {Promise<Object>} Number of alerts deleted
   */
  cleanupOldAlerts: async () => {
    try {
      const response = await apiClient.delete("/alerts/cleanup");

      if (__DEV__) {
        console.log(
          `🧹 Cleaned up ${response.data.data.deletedCount} old alerts`
        );
      }

      return response.data;
    } catch (error) {
      console.error("❌ Cleanup alerts error:", error.message);
      throw error;
    }
  },

  /**
   * Get unread alert count (lightweight endpoint)
   * @returns {Promise<number>} Unread alert count
   */
  getUnreadCount: async () => {
    try {
      // Use the main getAlerts endpoint with unreadOnly flag and limit=1 to get count only
      const response = await apiClient.get("/alerts?unreadOnly=true&limit=1");

      const count = response.data.unreadCount || 0;

      if (__DEV__) {
        console.log(`🔢 Unread alerts: ${count}`);
      }

      return count;
    } catch (error) {
      console.error("❌ Get unread count error:", error.message);
      // Return 0 on error to prevent UI crashes
      return 0;
    }
  },
};

export default alertService;
