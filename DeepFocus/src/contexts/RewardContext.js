import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { rewardService } from "../services/rewardService";
import { useAuth } from "./AuthContext";

// Reward actions
const REWARD_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_REWARDS: "SET_REWARDS",
  ADD_REWARD: "ADD_REWARD",
  DELETE_REWARD: "DELETE_REWARD",
  SET_SUMMARY: "SET_SUMMARY",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Initial state
const initialState = {
  rewards: [],
  summary: null, // { students: [{ studentId, studentName, totalPoints, rewardCount }] }
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Reducer
const rewardReducer = (state, action) => {
  switch (action.type) {
    case REWARD_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case REWARD_ACTIONS.SET_REWARDS:
      return {
        ...state,
        rewards: action.payload.rewards,
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null,
      };

    case REWARD_ACTIONS.ADD_REWARD:
      return {
        ...state,
        rewards: [action.payload, ...state.rewards],
        isLoading: false,
        error: null,
      };

    case REWARD_ACTIONS.DELETE_REWARD:
      return {
        ...state,
        rewards: state.rewards.filter(
          (reward) => reward._id !== action.payload
        ),
        isLoading: false,
        error: null,
      };

    case REWARD_ACTIONS.SET_SUMMARY:
      return {
        ...state,
        summary: action.payload,
        isLoading: false,
        error: null,
      };

    case REWARD_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case REWARD_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const RewardContext = createContext();

// Provider component
export const RewardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(rewardReducer, initialState);
  const { isAuthenticated } = useAuth();

  /**
   * Create a new reward or penalty
   */
  const createReward = useCallback(
    async (rewardData) => {
      if (!isAuthenticated) {
        dispatch({
          type: REWARD_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để tạo phần thưởng",
        });
        return null;
      }

      dispatch({ type: REWARD_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await rewardService.createReward(rewardData);
        const newReward = response.data;

        dispatch({ type: REWARD_ACTIONS.ADD_REWARD, payload: newReward });
        console.log("✅ Reward created successfully:", newReward._id);

        return newReward;
      } catch (error) {
        const errorMsg = error.message || "Không thể tạo phần thưởng";
        dispatch({ type: REWARD_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Create reward error:", errorMsg);
        return null;
      }
    },
    [isAuthenticated]
  );

  /**
   * Load rewards for a specific class
   */
  const loadRewardsByClass = useCallback(
    async (classId, options = {}) => {
      if (!isAuthenticated) {
        dispatch({
          type: REWARD_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để xem phần thưởng",
        });
        return;
      }

      dispatch({ type: REWARD_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await rewardService.getRewardsByClass(
          classId,
          options
        );

        dispatch({
          type: REWARD_ACTIONS.SET_REWARDS,
          payload: {
            rewards: response.data,
            pagination: response.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalItems: response.data.length,
            },
          },
        });

        console.log(
          `✅ Loaded ${response.data.length} rewards for class ${classId}`
        );
      } catch (error) {
        const errorMsg = error.message || "Không thể tải danh sách phần thưởng";
        dispatch({ type: REWARD_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Load rewards error:", errorMsg);
      }
    },
    [isAuthenticated]
  );

  /**
   * Load reward summary (leaderboard) for a class
   */
  const loadRewardSummary = useCallback(
    async (classId) => {
      if (!isAuthenticated) {
        dispatch({
          type: REWARD_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để xem thống kê",
        });
        return;
      }

      dispatch({ type: REWARD_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await rewardService.getRewardSummary(classId);

        dispatch({
          type: REWARD_ACTIONS.SET_SUMMARY,
          payload: response.data,
        });

        console.log("✅ Loaded reward summary for class:", classId);
      } catch (error) {
        const errorMsg = error.message || "Không thể tải thống kê phần thưởng";
        dispatch({ type: REWARD_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Load reward summary error:", errorMsg);
      }
    },
    [isAuthenticated]
  );

  /**
   * Delete a reward
   */
  const deleteReward = useCallback(
    async (rewardId) => {
      if (!isAuthenticated) {
        dispatch({
          type: REWARD_ACTIONS.SET_ERROR,
          payload: "Vui lòng đăng nhập để xóa phần thưởng",
        });
        return false;
      }

      dispatch({ type: REWARD_ACTIONS.SET_LOADING, payload: true });

      try {
        await rewardService.deleteReward(rewardId);

        dispatch({ type: REWARD_ACTIONS.DELETE_REWARD, payload: rewardId });
        console.log("✅ Reward deleted successfully:", rewardId);

        return true;
      } catch (error) {
        const errorMsg = error.message || "Không thể xóa phần thưởng";
        dispatch({ type: REWARD_ACTIONS.SET_ERROR, payload: errorMsg });
        console.error("❌ Delete reward error:", errorMsg);
        return false;
      }
    },
    [isAuthenticated]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch({ type: REWARD_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value
  const value = {
    rewards: state.rewards,
    summary: state.summary,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,
    createReward,
    loadRewardsByClass,
    loadRewardSummary,
    deleteReward,
    clearError,
  };

  return (
    <RewardContext.Provider value={value}>{children}</RewardContext.Provider>
  );
};

// Custom hook to use reward context
export const useReward = () => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error("useReward must be used within a RewardProvider");
  }
  return context;
};

export default RewardContext;
