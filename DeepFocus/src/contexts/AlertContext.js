import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { alertService } from "../services/alertService";
import { useAuth } from "./AuthContext";

// Alert actions
const ALERT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ALERTS: "SET_ALERTS",
  ADD_ALERT: "ADD_ALERT",
  UPDATE_ALERT: "UPDATE_ALERT",
  DELETE_ALERT: "DELETE_ALERT",
  MARK_AS_READ: "MARK_AS_READ",
  MARK_ALL_AS_READ: "MARK_ALL_AS_READ",
  SET_UNREAD_COUNT: "SET_UNREAD_COUNT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Initial state
const initialState = {
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Reducer
const alertReducer = (state, action) => {
  switch (action.type) {
    case ALERT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ALERT_ACTIONS.SET_ALERTS:
      return {
        ...state,
        alerts: action.payload.alerts,
        unreadCount: action.payload.unreadCount || state.unreadCount,
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null,
      };

    case ALERT_ACTIONS.ADD_ALERT:
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
        unreadCount: state.unreadCount + 1,
        isLoading: false,
        error: null,
      };

    case ALERT_ACTIONS.UPDATE_ALERT:
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert._id === action.payload._id ? action.payload : alert
        ),
        isLoading: false,
        error: null,
      };

    case ALERT_ACTIONS.DELETE_ALERT:
      const deletedAlert = state.alerts.find((a) => a._id === action.payload);
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert._id !== action.payload),
        unreadCount:
          deletedAlert && !deletedAlert.readAt
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        isLoading: false,
        error: null,
      };

    case ALERT_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert._id === action.payload
            ? { ...alert, readAt: new Date().toISOString() }
            : alert
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        isLoading: false,
        error: null,
      };

    case ALERT_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        alerts: state.alerts.map((alert) => ({
          ...alert,
          readAt: alert.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
        isLoading: false,
        error: null,
      };

    case ALERT_ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };

    case ALERT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case ALERT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AlertContext = createContext();

// Provider component
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const pollingIntervalRef = useRef(null);

  /**
   * Load alerts from API
   */
  const loadAlerts = useCallback(
    async (options = {}) => {
      if (!isAuthenticated) {
        dispatch({
          type: ALERT_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để xem thông báo",
        });
        return;
      }

      dispatch({ type: ALERT_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await alertService.getAlerts(options);

        dispatch({
          type: ALERT_ACTIONS.SET_ALERTS,
          payload: {
            alerts: response.data,
            unreadCount: response.unreadCount || 0,
            pagination: response.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalItems: response.data.length,
            },
          },
        });

        console.log(
          `✅ Loaded ${response.data.length} alerts (unread: ${
            response.unreadCount || 0
          })`
        );
      } catch (error) {
        const errorMsg = error.message || "Không thể tải thông báo";
        dispatch({ type: ALERT_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Load alerts error:", errorMsg);
      }
    },
    [isAuthenticated]
  );

  /**
   * Refresh unread count only (lightweight)
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await alertService.getUnreadCount();
      dispatch({ type: ALERT_ACTIONS.SET_UNREAD_COUNT, payload: count });

      if (__DEV__) {
        console.log(`🔄 Refreshed unread count: ${count}`);
      }
    } catch (error) {
      // Silent fail for background polling
      if (__DEV__) {
        console.error("❌ Refresh unread count error:", error.message);
      }
    }
  }, [isAuthenticated]);

  /**
   * Mark a single alert as read
   */
  const markAlertAsRead = useCallback(
    async (alertId) => {
      if (!isAuthenticated) {
        dispatch({
          type: ALERT_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để đánh dấu đã đọc",
        });
        return false;
      }

      try {
        await alertService.markAlertAsRead(alertId);
        dispatch({ type: ALERT_ACTIONS.MARK_AS_READ, payload: alertId });
        console.log("✅ Alert marked as read:", alertId);
        return true;
      } catch (error) {
        const errorMsg = error.message || "Không thể đánh dấu đã đọc";
        dispatch({ type: ALERT_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Mark alert as read error:", errorMsg);
        return false;
      }
    },
    [isAuthenticated]
  );

  /**
   * Mark all alerts as read
   */
  const markAllAlertsAsRead = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({
        type: ALERT_ACTIONS.SET_ERROR,
        payload: "Vui lòng đăng nhập để đánh dấu tất cả đã đọc",
      });
      return false;
    }

    dispatch({ type: ALERT_ACTIONS.SET_LOADING, payload: true });

    try {
      await alertService.markAllAlertsAsRead();
      dispatch({ type: ALERT_ACTIONS.MARK_ALL_AS_READ });
      console.log("✅ All alerts marked as read");
      return true;
    } catch (error) {
      const errorMsg = error.message || "Không thể đánh dấu tất cả đã đọc";
      dispatch({ type: ALERT_ACTIONS.SET_ERROR, payload: errorMsg });
      console.error("❌ Mark all alerts as read error:", errorMsg);
      return false;
    }
  }, [isAuthenticated]);

  /**
   * Delete a single alert
   */
  const deleteAlert = useCallback(
    async (alertId) => {
      if (!isAuthenticated) {
        dispatch({
          type: ALERT_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để xóa thông báo",
        });
        return false;
      }

      try {
        await alertService.deleteAlert(alertId);
        dispatch({ type: ALERT_ACTIONS.DELETE_ALERT, payload: alertId });
        console.log("✅ Alert deleted:", alertId);
        return true;
      } catch (error) {
        const errorMsg = error.message || "Không thể xóa thông báo";
        dispatch({ type: ALERT_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Delete alert error:", errorMsg);
        return false;
      }
    },
    [isAuthenticated]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch({ type: ALERT_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Start real-time polling for unread count
   */
  const startPolling = useCallback(() => {
    if (!isAuthenticated) return;

    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial fetch
    refreshUnreadCount();

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // 30 seconds

    if (__DEV__) {
      console.log("🔄 Started alert polling (30s interval)");
    }
  }, [isAuthenticated, refreshUnreadCount]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;

      if (__DEV__) {
        console.log("⏹️ Stopped alert polling");
      }
    }
  }, []);

  // Auto-start/stop polling based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [isAuthenticated, user, startPolling, stopPolling]);

  // Context value
  const value = {
    alerts: state.alerts,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,
    loadAlerts,
    refreshUnreadCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
    clearError,
    startPolling,
    stopPolling,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

// Custom hook to use alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export default AlertContext;
