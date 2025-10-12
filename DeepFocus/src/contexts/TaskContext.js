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

      const newTask = await taskAPI.createTask(taskData);
      dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: newTask });

      // Update storage
      const updatedTasks = [newTask, ...state.tasks];
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Added task: ${newTask.title}`);
      return { success: true, data: newTask };
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
      // Optimistic update
      const originalTasks = [...state.tasks];
      const optimisticTask = state.tasks.find((t) => t._id === taskId);
      if (optimisticTask) {
        dispatch({
          type: TASK_ACTIONS.UPDATE_TASK,
          payload: { ...optimisticTask, ...updates },
        });
      }

      const updatedTask = await taskAPI.updateTask(taskId, updates);
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: updatedTask });

      // Update storage
      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? updatedTask : t
      );
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Updated task: ${updatedTask.title}`);
      return { success: true, data: updatedTask };
    } catch (error) {
      // Rollback on error
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: originalTasks });

      const errorMessage = error.message || "Không thể cập nhật task";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Update task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      // Optimistic delete
      const originalTasks = [...state.tasks];
      dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: taskId });

      await taskAPI.deleteTask(taskId);

      // Update storage
      const updatedTasks = state.tasks.filter((t) => t._id !== taskId);
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Deleted task: ${taskId}`);
      return { success: true };
    } catch (error) {
      // Rollback on error
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: originalTasks });

      const errorMessage = error.message || "Không thể xóa task";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Delete task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Complete task
  const completeTask = async (taskId) => {
    try {
      const updatedTask = await taskAPI.completeTask(taskId);
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: updatedTask });

      // Update storage
      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? updatedTask : t
      );
      await saveTasksToStorage(updatedTasks);

      console.log(`✅ Completed task: ${updatedTask.title}`);
      return { success: true, data: updatedTask };
    } catch (error) {
      const errorMessage = error.message || "Không thể đánh dấu hoàn thành";
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      console.error("❌ Complete task error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Increment pomodoro count
  const incrementPomodoroCount = async (taskId) => {
    try {
      const updatedTask = await taskAPI.incrementTaskPomodoro(taskId);
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: updatedTask });

      // Update storage
      const updatedTasks = state.tasks.map((t) =>
        t._id === taskId ? updatedTask : t
      );
      await saveTasksToStorage(updatedTasks);

      console.log(
        `🍅 Incremented pomodoro: ${updatedTask.title} (${updatedTask.completedPomodoros}/${updatedTask.estimatedPomodoros})`
      );
      return { success: true, data: updatedTask };
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
