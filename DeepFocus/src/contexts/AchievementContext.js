import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config";

// Achievement context
const AchievementContext = createContext();

// Action types
const ACHIEVEMENT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ACHIEVEMENTS: "SET_ACHIEVEMENTS",
  SET_SUMMARY: "SET_SUMMARY",
  UPDATE_ACHIEVEMENT: "UPDATE_ACHIEVEMENT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SHOW_UNLOCK_NOTIFICATION: "SHOW_UNLOCK_NOTIFICATION",
  HIDE_UNLOCK_NOTIFICATION: "HIDE_UNLOCK_NOTIFICATION",
};

// Initial state
const initialState = {
  achievements: [],
  summary: null,
  unlockNotification: null,
  isLoading: false,
  error: null,
  filters: {
    type: null,
    category: null,
    rarity: null,
    unlocked: null,
    favorite: null,
  },
};

// Reducer
const achievementReducer = (state, action) => {
  switch (action.type) {
    case ACHIEVEMENT_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null };

    case ACHIEVEMENT_ACTIONS.SET_ACHIEVEMENTS:
      return { ...state, achievements: action.payload, isLoading: false };

    case ACHIEVEMENT_ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload };

    case ACHIEVEMENT_ACTIONS.UPDATE_ACHIEVEMENT:
      return {
        ...state,
        achievements: state.achievements.map((item) =>
          item.achievement._id === action.payload.achievementId
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case ACHIEVEMENT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ACHIEVEMENT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACHIEVEMENT_ACTIONS.SHOW_UNLOCK_NOTIFICATION:
      return { ...state, unlockNotification: action.payload };

    case ACHIEVEMENT_ACTIONS.HIDE_UNLOCK_NOTIFICATION:
      return { ...state, unlockNotification: null };

    default:
      return state;
  }
};

// Provider component
export const AchievementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(achievementReducer, initialState);
  const { token } = useAuth();

  // Fetch achievements
  const fetchAchievements = async (filters = {}) => {
    if (!token) return;

    dispatch({ type: ACHIEVEMENT_ACTIONS.SET_LOADING, payload: true });

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${API_BASE_URL}/api/achievements?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: ACHIEVEMENT_ACTIONS.SET_ACHIEVEMENTS,
          payload: data.data,
        });
      } else {
        throw new Error(data.message || "Failed to fetch achievements");
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      dispatch({
        type: ACHIEVEMENT_ACTIONS.SET_ERROR,
        payload: error.message,
      });
    }
  };

  // Fetch achievement summary
  const fetchSummary = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/achievements/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: ACHIEVEMENT_ACTIONS.SET_SUMMARY,
          payload: data.data,
        });
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  // Get achievement detail
  const getAchievementDetail = async (achievementId) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/achievements/${achievementId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || "Failed to fetch achievement detail");
    } catch (error) {
      console.error("Error fetching achievement detail:", error);
      throw error;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (achievementId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/achievements/${achievementId}/favorite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: ACHIEVEMENT_ACTIONS.UPDATE_ACHIEVEMENT,
          payload: {
            achievementId,
            updates: {
              isFavorite: data.isFavorite,
              userProgress: data.data,
            },
          },
        });
        return data.isFavorite;
      }
      throw new Error(data.message || "Failed to toggle favorite");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  };

  // Share achievement
  const shareAchievement = async (achievementId) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/achievements/${achievementId}/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || "Failed to share achievement");
    } catch (error) {
      console.error("Error sharing achievement:", error);
      throw error;
    }
  };

  // Check for new unlocks
  const checkUnlocks = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/achievements/check-unlocks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.unlockedCount > 0) {
        // Show notifications for newly unlocked achievements
        data.unlocked.forEach((userAchievement, index) => {
          setTimeout(() => {
            dispatch({
              type: ACHIEVEMENT_ACTIONS.SHOW_UNLOCK_NOTIFICATION,
              payload: userAchievement,
            });

            // Auto hide after 5 seconds
            setTimeout(() => {
              dispatch({ type: ACHIEVEMENT_ACTIONS.HIDE_UNLOCK_NOTIFICATION });
            }, 5000);
          }, index * 6000); // Stagger notifications
        });

        // Refresh achievements list
        await fetchAchievements();
        await fetchSummary();

        return data.unlocked;
      }

      return [];
    } catch (error) {
      console.error("Error checking unlocks:", error);
      return [];
    }
  };

  // Dismiss unlock notification
  const dismissUnlockNotification = () => {
    dispatch({ type: ACHIEVEMENT_ACTIONS.HIDE_UNLOCK_NOTIFICATION });
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchAchievements();
      fetchSummary();
    }
  }, [token]);

  const value = {
    achievements: state.achievements,
    summary: state.summary,
    unlockNotification: state.unlockNotification,
    isLoading: state.isLoading,
    error: state.error,
    fetchAchievements,
    fetchSummary,
    getAchievementDetail,
    toggleFavorite,
    shareAchievement,
    checkUnlocks,
    dismissUnlockNotification,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

// Custom hook
export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within AchievementProvider");
  }
  return context;
};

export default AchievementContext;
