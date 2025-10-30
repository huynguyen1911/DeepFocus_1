import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { taskAPI } from "../services/api";
import { useAuth } from "./AuthContext";

// Storage key
const STORAGE_KEY = "@deepfocus:tasks";

// Task actions
const TASK_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_TASKS: "SET_TASKS",
  ADD_TASK: "ADD_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Initial state
const initialState = {
  tasks: [],
  isLoading: false,
  error: null,
};

// Reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case TASK_ACTIONS.SET_TASKS:
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        error: null,
      };

    case TASK_ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        isLoading: false,
        error: null,
      };

    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        ),
        isLoading: false,
        error: null,
      };

    case TASK_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task._id !== action.payload),
        isLoading: false,
        error: null,
      };

    case TASK_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case TASK_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const TaskContext = createContext();

// Provider component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load tasks from storage
  const loadTasksFromStorage = async () => {
    try {
      const tasksJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });
        console.log(`📦 Loaded ${tasks.length} tasks from storage`);
      }
    } catch (error) {
      console.error("❌ Load tasks from storage error:", error);
    }
  };

  // Save tasks to storage
  const saveTasksToStorage = async (tasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      console.log(`💾 Saved ${tasks.length} tasks to storage`);
    } catch (error) {
      console.error("❌ Save tasks to storage error:", error);
    }
  };

  // Load tasks from API
  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) {
        dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      }

      const tasks = await taskAPI.getTasks();
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });

      // Save to storage for offline access
      await saveTasksToStorage(tasks);

      console.log(`✅ Loaded ${tasks.length} tasks from API`);
      return { success: true, data: tasks };
    } catch (error) {
      const errorMessage = error.message || "Không thể tải danh sách tasks";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Load tasks error:", errorMessage);

      // Try to load from storage if API fails
      await loadTasksFromStorage();

      return { success: false, error: errorMessage };
    }
  };

  // Add new task
  const addTask = async (taskData) => {
    try {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });

      // Create temporary ID for offline mode
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create optimistic task
      const optimisticTask = {
        _id: tempId,
        ...taskData,
        completedPomodoros: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: user?._id || null,
      };

      // Add to UI immediately
      dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: optimisticTask });

      // Save to storage for offline support
      const updatedTasks = [optimisticTask, ...state.tasks];
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Added task (offline): ${optimisticTask.title}`);

      // Try to sync with server
      try {
        const serverTask = await taskAPI.createTask(taskData);

        // Replace temp task with server task
        dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: serverTask });

        // Update storage - replace temp ID with real ID
        const syncedTasks = state.tasks.map((t) =>
          t._id === tempId ? serverTask : t
        );
        await saveTasksToStorage(syncedTasks);

        console.log(`✅ Synced new task with server: ${serverTask.title}`);
        return { success: true, data: serverTask };
      } catch (syncError) {
        // Network error - but we already saved offline
        console.log(
          "⚠️ Could not sync new task with server (offline mode):",
          syncError.message
        );

        // Return success with offline data
        return { success: true, data: optimisticTask, offline: true };
      }
    } catch (error) {
      const errorMessage = error.message || "Không thể tạo task";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Add task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      // Find current task
      const currentTask = state.tasks.find((t) => t._id === taskId);
      if (!currentTask) {
        throw new Error("Task not found");
      }

      // Optimistic update - update locally first
      const optimisticTask = {
        ...currentTask,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update UI immediately
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: optimisticTask });

      // Save to storage for offline support
      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? optimisticTask : t
      );
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Updated task (offline): ${optimisticTask.title}`);

      // Try to sync with server
      try {
        const serverTask = await taskAPI.updateTask(taskId, updates);

        // Update with server response
        dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: serverTask });

        // Update storage with server data
        const syncedTasks = state.tasks.map((t) =>
          t._id === taskId ? serverTask : t
        );
        await saveTasksToStorage(syncedTasks);

        console.log(`✅ Synced update with server: ${serverTask.title}`);
        return { success: true, data: serverTask };
      } catch (syncError) {
        // Network error - but we already updated offline
        console.log(
          "⚠️ Could not sync update with server (offline mode):",
          syncError.message
        );

        // Return success with offline data
        return { success: true, data: optimisticTask, offline: true };
      }
    } catch (error) {
      const errorMessage = error.message || "Không thể cập nhật task";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Update task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      // Find task to delete
      const taskToDelete = state.tasks.find((t) => t._id === taskId);
      if (!taskToDelete) {
        throw new Error("Task not found");
      }

      // Optimistic delete - remove from UI immediately
      dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: taskId });

      // Save to storage for offline support
      const updatedTasks = state.tasks.filter((t) => t._id !== taskId);
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Deleted task (offline): ${taskToDelete.title}`);

      // Try to sync with server
      try {
        await taskAPI.deleteTask(taskId);
        console.log(`✅ Synced deletion with server`);
        return { success: true };
      } catch (syncError) {
        // Network error - but we already deleted offline
        console.log(
          "⚠️ Could not sync deletion with server (offline mode):",
          syncError.message
        );

        // Return success - deletion is saved locally
        return { success: true, offline: true };
      }
    } catch (error) {
      const errorMessage = error.message || "Không thể xóa task";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Delete task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Complete task
  const completeTask = async (taskId) => {
    try {
      // Find current task
      const currentTask = state.tasks.find((t) => t._id === taskId);
      if (!currentTask) {
        throw new Error("Task not found");
      }

      // Optimistic update - mark as completed locally first
      const optimisticTask = {
        ...currentTask,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update UI immediately
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: optimisticTask });

      // Save to storage for offline support
      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? optimisticTask : t
      );
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Completed task (offline): ${optimisticTask.title}`);

      // Try to sync with server
      try {
        const serverTask = await taskAPI.completeTask(taskId);

        // Update with server response
        dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: serverTask });

        // Update storage with server data
        const syncedTasks = state.tasks.map((t) =>
          t._id === taskId ? serverTask : t
        );
        await saveTasksToStorage(syncedTasks);

        console.log(`✅ Synced completion with server: ${serverTask.title}`);
        return { success: true, data: serverTask };
      } catch (syncError) {
        // Network error - but we already updated offline
        console.log(
          "⚠️ Could not sync completion with server (offline mode):",
          syncError.message
        );

        // Return success with offline data
        return { success: true, data: optimisticTask, offline: true };
      }
    } catch (error) {
      const errorMessage = error.message || "Không thể đánh dấu hoàn thành";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Complete task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Increment pomodoro count
  const incrementPomodoroCount = async (taskId, duration = 25) => {
    try {
      // Find current task
      const currentTask = state.tasks.find((t) => t._id === taskId);
      if (!currentTask) {
        throw new Error("Task not found");
      }

      // Optimistic update - increment locally first
      const optimisticTask = {
        ...currentTask,
        completedPomodoros: currentTask.completedPomodoros + 1,
        updatedAt: new Date().toISOString(),
      };

      // Update UI immediately
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: optimisticTask });

      // Save to storage for offline support
      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? optimisticTask : t
      );
      await saveTasksToStorage(updatedTasks);

      console.log(
        `🍅 Incremented pomodoro (offline): ${optimisticTask.title} (${optimisticTask.completedPomodoros}/${optimisticTask.estimatedPomodoros})`
      );

      // Try to sync with server
      try {
        const serverTask = await taskAPI.incrementTaskPomodoro(
          taskId,
          duration
        );

        // Update with server response
        dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: serverTask });

        // Update storage with server data
        const syncedTasks = state.tasks.map((t) =>
          t._id === taskId ? serverTask : t
        );
        await saveTasksToStorage(syncedTasks);

        console.log(`✅ Synced with server: ${serverTask.title}`);

        // Auto-complete task if goal reached
        if (
          !serverTask.isCompleted &&
          serverTask.completedPomodoros >= serverTask.estimatedPomodoros &&
          serverTask.estimatedPomodoros > 0
        ) {
          console.log(`🎉 Task reached pomodoro goal! Auto-completing...`);
          await completeTask(taskId);
        }

        return { success: true, data: serverTask };
      } catch (syncError) {
        // Network error - but we already updated offline
        console.log(
          "⚠️ Could not sync with server (offline mode):",
          syncError.message
        );

        // Check goal with optimistic data
        if (
          !optimisticTask.isCompleted &&
          optimisticTask.completedPomodoros >=
            optimisticTask.estimatedPomodoros &&
          optimisticTask.estimatedPomodoros > 0
        ) {
          console.log(
            `🎉 Task reached pomodoro goal (offline)! Auto-completing...`
          );
          await completeTask(taskId);
        }

        // Return success with offline data
        return { success: true, data: optimisticTask, offline: true };
      }
    } catch (error) {
      const errorMessage = error.message || "Không thể cập nhật pomodoro";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Increment pomodoro error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get task by ID
  const getTaskById = (taskId) => {
    return state.tasks.find((task) => task._id === taskId);
  };

  // Get tasks by filter
  const getFilteredTasks = (filter = {}) => {
    let filtered = [...state.tasks];

    if (filter.isCompleted !== undefined) {
      filtered = filtered.filter(
        (task) => task.isCompleted === filter.isCompleted
      );
    }

    if (filter.priority) {
      filtered = filtered.filter((task) => task.priority === filter.priority);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: TASK_ACTIONS.CLEAR_ERROR });
  };

  // Auto-load tasks when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("👤 User authenticated, loading tasks...");
      loadTasks();
    } else {
      // Clear tasks when logged out
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: [] });
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated, user]);

  // Load from storage on mount
  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  const value = {
    // State
    tasks: state.tasks,
    isLoading: state.isLoading,
    error: state.error,

    // Functions
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    incrementPomodoroCount,
    getTaskById,
    getFilteredTasks,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Custom hook
export const useTasks = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }

  return context;
};

export default TaskContext;
