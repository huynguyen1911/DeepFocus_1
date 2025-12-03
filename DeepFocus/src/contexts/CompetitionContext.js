import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config";

// Competition context
const CompetitionContext = createContext();

// Action types
const COMPETITION_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_COMPETITIONS: "SET_COMPETITIONS",
  SET_MY_COMPETITIONS: "SET_MY_COMPETITIONS",
  SET_CURRENT_COMPETITION: "SET_CURRENT_COMPETITION",
  SET_LEADERBOARD: "SET_LEADERBOARD",
  UPDATE_ENTRY: "UPDATE_ENTRY",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Initial state
const initialState = {
  competitions: [],
  myCompetitions: [],
  currentCompetition: null,
  leaderboard: null,
  isLoading: false,
  error: null,
  filters: {
    status: "active",
    scope: null,
    type: null,
    featured: null,
  },
};

// Reducer
const competitionReducer = (state, action) => {
  switch (action.type) {
    case COMPETITION_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null };

    case COMPETITION_ACTIONS.SET_COMPETITIONS:
      return { ...state, competitions: action.payload, isLoading: false };

    case COMPETITION_ACTIONS.SET_MY_COMPETITIONS:
      return { ...state, myCompetitions: action.payload };

    case COMPETITION_ACTIONS.SET_CURRENT_COMPETITION:
      return { ...state, currentCompetition: action.payload, isLoading: false };

    case COMPETITION_ACTIONS.SET_LEADERBOARD:
      return { ...state, leaderboard: action.payload };

    case COMPETITION_ACTIONS.UPDATE_ENTRY:
      return {
        ...state,
        myCompetitions: state.myCompetitions.map((comp) =>
          comp.competition._id === action.payload.competitionId
            ? { ...comp, ...action.payload.updates }
            : comp
        ),
      };

    case COMPETITION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case COMPETITION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Provider component
export const CompetitionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(competitionReducer, initialState);
  const { token } = useAuth();

  // Fetch competitions
  const fetchCompetitions = async (filters = {}) => {
    if (!token) return;

    dispatch({ type: COMPETITION_ACTIONS.SET_LOADING, payload: true });

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${API_BASE_URL}/api/competitions?${queryParams}`,
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
          type: COMPETITION_ACTIONS.SET_COMPETITIONS,
          payload: data.data,
        });
      } else {
        throw new Error(data.message || "Failed to fetch competitions");
      }
    } catch (error) {
      console.error("Error fetching competitions:", error);
      dispatch({
        type: COMPETITION_ACTIONS.SET_ERROR,
        payload: error.message,
      });
    }
  };

  // Fetch my competitions
  const fetchMyCompetitions = async (status = null) => {
    if (!token) return;

    try {
      const queryParams = status ? `?status=${status}` : "";
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/my-competitions${queryParams}`,
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
          type: COMPETITION_ACTIONS.SET_MY_COMPETITIONS,
          payload: data.data,
        });
      }
    } catch (error) {
      console.error("Error fetching my competitions:", error);
    }
  };

  // Get competition detail
  const getCompetitionDetail = async (competitionId) => {
    if (!token) return null;

    dispatch({ type: COMPETITION_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}`,
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
          type: COMPETITION_ACTIONS.SET_CURRENT_COMPETITION,
          payload: data.data,
        });
        return data.data;
      }
      throw new Error(data.message || "Failed to fetch competition detail");
    } catch (error) {
      console.error("Error fetching competition detail:", error);
      dispatch({
        type: COMPETITION_ACTIONS.SET_ERROR,
        payload: error.message,
      });
      throw error;
    }
  };

  // Create competition
  const createCompetition = async (competitionData) => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/competitions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(competitionData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchCompetitions();
        await fetchMyCompetitions();
        return data.data;
      }
      throw new Error(data.message || "Failed to create competition");
    } catch (error) {
      console.error("Error creating competition:", error);
      throw error;
    }
  };

  // Join competition
  const joinCompetition = async (competitionId, teamData = null) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamData }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchCompetitions();
        await fetchMyCompetitions();
        return data.data;
      }
      throw new Error(data.message || "Failed to join competition");
    } catch (error) {
      console.error("Error joining competition:", error);
      throw error;
    }
  };

  // Leave competition
  const leaveCompetition = async (competitionId, reason = null) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchCompetitions();
        await fetchMyCompetitions();
        return true;
      }
      throw new Error(data.message || "Failed to leave competition");
    } catch (error) {
      console.error("Error leaving competition:", error);
      throw error;
    }
  };

  // Get leaderboard
  const getLeaderboard = async (competitionId, options = {}) => {
    if (!token) return null;

    try {
      const queryParams = new URLSearchParams(options).toString();
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}/leaderboard?${queryParams}`,
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
          type: COMPETITION_ACTIONS.SET_LEADERBOARD,
          payload: data.data,
        });
        return data.data;
      }
      throw new Error(data.message || "Failed to fetch leaderboard");
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  };

  // Update progress (called after session/task completion)
  const updateProgress = async (competitionId, progressData) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}/progress`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ progressData }),
        }
      );

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: COMPETITION_ACTIONS.UPDATE_ENTRY,
          payload: {
            competitionId,
            updates: { progress: data.entry.progress },
          },
        });
        return data.entry;
      }
      throw new Error(data.message || "Failed to update progress");
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };

  // Claim prize
  const claimPrize = async (competitionId) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}/claim-prize`,
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
        await fetchMyCompetitions();
        return data.prize;
      }
      throw new Error(data.message || "Failed to claim prize");
    } catch (error) {
      console.error("Error claiming prize:", error);
      throw error;
    }
  };

  // End competition (creator only)
  const endCompetition = async (competitionId) => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/competitions/${competitionId}/end`,
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
        await fetchCompetitions();
        await fetchMyCompetitions();
        return data.data;
      }
      throw new Error(data.message || "Failed to end competition");
    } catch (error) {
      console.error("Error ending competition:", error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchCompetitions({ status: "active" });
      fetchMyCompetitions("active");
    }
  }, [token]);

  const value = {
    competitions: state.competitions,
    myCompetitions: state.myCompetitions,
    currentCompetition: state.currentCompetition,
    leaderboard: state.leaderboard,
    isLoading: state.isLoading,
    error: state.error,
    fetchCompetitions,
    fetchMyCompetitions,
    getCompetitionDetail,
    createCompetition,
    joinCompetition,
    leaveCompetition,
    getLeaderboard,
    updateProgress,
    claimPrize,
    endCompetition,
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
};

// Custom hook
export const useCompetitions = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error("useCompetitions must be used within CompetitionProvider");
  }
  return context;
};

export default CompetitionContext;
