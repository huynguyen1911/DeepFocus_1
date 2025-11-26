import React, { createContext, useContext, useState, useCallback } from "react";
import { guardianAPI } from "../services/api";

const GuardianContext = createContext();

export const GuardianProvider = ({ children }) => {
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load linked children
   * @param {string} status - Link status filter (default: 'accepted')
   */
  const loadLinkedChildren = useCallback(async (status = "accepted") => {
    setLoading(true);
    setError(null);
    try {
      const response = await guardianAPI.getLinkedChildren(status);
      setLinkedChildren(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load children";
      setError(errorMessage);
      console.error("❌ Error loading linked children:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send link request to child
   * @param {string} childIdentifier - Child's username or email
   * @param {string} relation - Relation type
   * @param {string} notes - Optional notes
   */
  const sendLinkRequest = useCallback(
    async (childIdentifier, relation = "parent", notes = "") => {
      setLoading(true);
      setError(null);
      try {
        const response = await guardianAPI.sendLinkRequest(
          childIdentifier,
          relation,
          notes
        );
        return { success: true, data: response.data };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to send link request";
        setError(errorMessage);
        console.error("❌ Error sending link request:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load pending requests (for child)
   */
  const loadPendingRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guardianAPI.getPendingRequests();
      setPendingRequests(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load pending requests";
      setError(errorMessage);
      console.error("❌ Error loading pending requests:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Respond to link request (for child)
   * @param {string} requestId - Request ID
   * @param {string} action - 'accept' or 'reject'
   */
  const respondToRequest = useCallback(async (requestId, action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await guardianAPI.respondToRequest(requestId, action);

      // Update pending requests list
      setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to respond to request";
      setError(errorMessage);
      console.error("❌ Error responding to request:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove child link
   * @param {string} childId - Child user ID
   */
  const removeChildLink = useCallback(async (childId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await guardianAPI.removeChildLink(childId);

      // Update linked children list
      setLinkedChildren((prev) =>
        prev.filter((child) => child.childId !== childId)
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove link";
      setError(errorMessage);
      console.error("❌ Error removing link:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load guardian dashboard
   */
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guardianAPI.getDashboardSummary();
      setDashboardData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load dashboard";
      setError(errorMessage);
      console.error("❌ Error loading dashboard:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get child's detailed progress
   * @param {string} childId - Child user ID
   * @param {string} period - Time period ('week', 'month', 'all')
   */
  const getChildProgress = useCallback(async (childId, period = "week") => {
    setLoading(true);
    setError(null);
    try {
      const response = await guardianAPI.getChildProgress(childId, period);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load child progress";
      setError(errorMessage);
      console.error("❌ Error loading child progress:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    linkedChildren,
    pendingRequests,
    dashboardData,
    loading,
    error,

    // Actions
    loadLinkedChildren,
    sendLinkRequest,
    loadPendingRequests,
    respondToRequest,
    removeChildLink,
    loadDashboard,
    getChildProgress,
    clearError,
  };

  return (
    <GuardianContext.Provider value={value}>
      {children}
    </GuardianContext.Provider>
  );
};

/**
 * Hook to use Guardian context
 */
export const useGuardian = () => {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error("useGuardian must be used within GuardianProvider");
  }
  return context;
};

export default GuardianContext;
