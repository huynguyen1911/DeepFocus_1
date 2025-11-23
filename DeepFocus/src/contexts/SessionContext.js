import React, { createContext, useContext, useReducer, useEffect } from "react";
import { sessionAPI } from "../services/api";
import { useAuth } from "./AuthContext";

// Session action types
const SESSION_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ACTIVE_SESSION: "SET_ACTIVE_SESSION",
  SET_SESSIONS: "SET_SESSIONS",
  ADD_SESSION: "ADD_SESSION",
  UPDATE_SESSION: "UPDATE_SESSION",
  CLEAR_ACTIVE_SESSION: "CLEAR_ACTIVE_SESSION",
  SET_STATS: "SET_STATS",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_PAGINATION: "SET_PAGINATION",
};

// Initial state
const initialState = {
  activeSession: null,
  sessions: [],
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
};

// Session reducer
const sessionReducer = (state, action) => {
  switch (action.type) {
    case SESSION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case SESSION_ACTIONS.SET_ACTIVE_SESSION:
      return {
        ...state,
        activeSession: action.payload,
        isLoading: false,
        error: null,
      };

    case SESSION_ACTIONS.CLEAR_ACTIVE_SESSION:
      return {
        ...state,
        activeSession: null,
        isLoading: false,
      };

    case SESSION_ACTIONS.SET_SESSIONS:
      return {
        ...state,
        sessions: action.payload,
        isLoading: false,
        error: null,
      };

    case SESSION_ACTIONS.ADD_SESSION:
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        activeSession: action.payload,
        isLoading: false,
        error: null,
      };

    case SESSION_ACTIONS.UPDATE_SESSION:
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session._id === action.payload._id ? action.payload : session
        ),
        activeSession:
          state.activeSession?._id === action.payload._id
            ? action.payload
            : state.activeSession,
        isLoading: false,
        error: null,
      };

    case SESSION_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload,
        isLoading: false,
        error: null,
      };

    case SESSION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case SESSION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case SESSION_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};

// Create context
const SessionContext = createContext();

// Session Provider component
export const SessionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: SESSION_ACTIONS.CLEAR_ERROR });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // Load active session on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadActiveSession();
    }
  }, [isAuthenticated]);

  // Load active session
  const loadActiveSession = async () => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });
      const response = await sessionAPI.getActiveSession();

      if (response.success && response.data?.session) {
        dispatch({
          type: SESSION_ACTIONS.SET_ACTIVE_SESSION,
          payload: response.data.session,
        });
      } else {
        dispatch({ type: SESSION_ACTIONS.CLEAR_ACTIVE_SESSION });
      }
    } catch (error) {
      // No active session is not an error - just means user isn't in a session
      if (error.status !== 404) {
        console.error("❌ Load active session failed:", error.message);
      }
      dispatch({ type: SESSION_ACTIONS.CLEAR_ACTIVE_SESSION });
    }
  };

  // Start a new session
  const startSession = async (sessionData) => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });

      const response = await sessionAPI.createSession(sessionData);

      if (response.success && response.data?.session) {
        dispatch({
          type: SESSION_ACTIONS.ADD_SESSION,
          payload: response.data.session,
        });
        return { success: true, session: response.data.session };
      }

      throw new Error("Failed to create session");
    } catch (error) {
      console.error("❌ Start session failed:", error.message);
      dispatch({
        type: SESSION_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to start session",
      });
      return { success: false, error: error.message };
    }
  };

  // Complete current session
  const completeSession = async (sessionId, notes = "") => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });

      const response = await sessionAPI.completeSession(sessionId, notes);

      if (response.success && response.data?.session) {
        dispatch({
          type: SESSION_ACTIONS.UPDATE_SESSION,
          payload: response.data.session,
        });
        dispatch({ type: SESSION_ACTIONS.CLEAR_ACTIVE_SESSION });
        return { success: true, session: response.data.session };
      }

      throw new Error("Failed to complete session");
    } catch (error) {
      console.error("❌ Complete session failed:", error.message);
      dispatch({
        type: SESSION_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to complete session",
      });
      return { success: false, error: error.message };
    }
  };

  // Cancel current session
  const cancelSession = async (sessionId) => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });

      const response = await sessionAPI.cancelSession(sessionId);

      if (response.success && response.data?.session) {
        dispatch({
          type: SESSION_ACTIONS.UPDATE_SESSION,
          payload: response.data.session,
        });
        dispatch({ type: SESSION_ACTIONS.CLEAR_ACTIVE_SESSION });
        return { success: true, session: response.data.session };
      }

      throw new Error("Failed to cancel session");
    } catch (error) {
      console.error("❌ Cancel session failed:", error.message);
      dispatch({
        type: SESSION_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to cancel session",
      });
      return { success: false, error: error.message };
    }
  };

  // Load user's sessions with pagination
  const loadSessions = async (params = {}) => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });

      const response = await sessionAPI.getMySessions(params);

      if (response.success && response.data) {
        dispatch({
          type: SESSION_ACTIONS.SET_SESSIONS,
          payload: response.data.sessions || [],
        });

        if (response.data.pagination) {
          dispatch({
            type: SESSION_ACTIONS.SET_PAGINATION,
            payload: response.data.pagination,
          });
        }

        return { success: true, data: response.data };
      }

      throw new Error("Failed to load sessions");
    } catch (error) {
      console.error("❌ Load sessions failed:", error.message);
      dispatch({
        type: SESSION_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to load sessions",
      });
      return { success: false, error: error.message };
    }
  };

  // Load sessions for a specific class
  const loadClassSessions = async (classId, params = {}) => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });

      const response = await sessionAPI.getClassSessions(classId, params);

      if (response.success && response.data) {
        dispatch({
          type: SESSION_ACTIONS.SET_SESSIONS,
          payload: response.data.sessions || [],
        });

        if (response.data.pagination) {
          dispatch({
            type: SESSION_ACTIONS.SET_PAGINATION,
            payload: response.data.pagination,
          });
        }

        return { success: true, data: response.data };
      }

      throw new Error("Failed to load class sessions");
    } catch (error) {
      console.error("❌ Load class sessions failed:", error.message);
      dispatch({
        type: SESSION_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to load class sessions",
      });
      return { success: false, error: error.message };
    }
  };

  // Load session statistics
  const loadStats = async (params = {}) => {
    try {
      dispatch({ type: SESSION_ACTIONS.SET_LOADING, payload: true });

      const response = await sessionAPI.getSessionStats(params);

      if (response.success && response.data?.stats) {
        dispatch({
          type: SESSION_ACTIONS.SET_STATS,
          payload: response.data.stats,
        });
        return { success: true, stats: response.data.stats };
      }

      throw new Error("Failed to load statistics");
    } catch (error) {
      console.error("❌ Load stats failed:", error.message);
      dispatch({
        type: SESSION_ACTIONS.SET_ERROR,
        payload: error.message || "Failed to load statistics",
      });
      return { success: false, error: error.message };
    }
  };

  // Refresh active session data
  const refreshActiveSession = async () => {
    await loadActiveSession();
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: SESSION_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    activeSession: state.activeSession,
    sessions: state.sessions,
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,

    // Methods
    startSession,
    completeSession,
    cancelSession,
    loadSessions,
    loadClassSessions,
    loadStats,
    refreshActiveSession,
    clearError,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

// Custom hook to use session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};

export default SessionContext;
