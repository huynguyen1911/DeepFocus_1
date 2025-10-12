import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";

// Timer states
export const TIMER_STATES = {
  IDLE: "IDLE",
  WORKING: "WORKING",
  SHORT_BREAK: "SHORT_BREAK",
};

// Actions
const POMODORO_ACTIONS = {
  START_TIMER: "START_TIMER",
  PAUSE_TIMER: "PAUSE_TIMER",
  RESET_TIMER: "RESET_TIMER",
  TICK: "TICK",
  SET_STATE: "SET_STATE",
  COMPLETE_POMODORO: "COMPLETE_POMODORO",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_ACTIVE_TASK: "SET_ACTIVE_TASK",
  CLEAR_ACTIVE_TASK: "CLEAR_ACTIVE_TASK",
};

// Default settings
const DEFAULT_SETTINGS = {
  workDuration: 10, //1500, // 25 minutes in seconds
  shortBreakDuration: 5, //300, // 5 minutes in seconds
  autoStartBreaks: true,
};

// Initial state
const initialState = {
  timerState: TIMER_STATES.IDLE,
  timeLeft: 0,
  isActive: false,
  completedPomodoros: 0,
  settings: DEFAULT_SETTINGS,
  activeTask: null, // Currently running task
};

// Reducer
const pomodoroReducer = (state, action) => {
  switch (action.type) {
    case POMODORO_ACTIONS.START_TIMER:
      return {
        ...state,
        isActive: true,
      };

    case POMODORO_ACTIONS.PAUSE_TIMER:
      return {
        ...state,
        isActive: false,
      };

    case POMODORO_ACTIONS.RESET_TIMER:
      const resetTime =
        state.timerState === TIMER_STATES.WORKING
          ? state.settings.workDuration
          : state.timerState === TIMER_STATES.SHORT_BREAK
          ? state.settings.shortBreakDuration
          : 0;
      return {
        ...state,
        timeLeft: resetTime,
        isActive: false,
      };

    case POMODORO_ACTIONS.TICK:
      const newTimeLeft = Math.max(0, state.timeLeft - 1);
      return {
        ...state,
        timeLeft: newTimeLeft,
      };

    case POMODORO_ACTIONS.SET_STATE:
      return {
        ...state,
        timerState: action.payload.state,
        timeLeft: action.payload.duration,
        isActive: action.payload.autoStart || false,
      };

    case POMODORO_ACTIONS.COMPLETE_POMODORO:
      return {
        ...state,
        completedPomodoros: state.completedPomodoros + 1,
      };

    case POMODORO_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case POMODORO_ACTIONS.SET_ACTIVE_TASK:
      return {
        ...state,
        activeTask: action.payload,
      };

    case POMODORO_ACTIONS.CLEAR_ACTIVE_TASK:
      return {
        ...state,
        activeTask: null,
      };

    default:
      return state;
  }
};

// Create context
const PomodoroContext = createContext();

// Provider component
export const PomodoroProvider = ({ children, onPomodoroComplete }) => {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);
  const intervalRef = useRef(null);

  // Timer countdown effect
  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: POMODORO_ACTIONS.TICK });
      }, 1000);

      console.log(
        `⏱️ Timer running: ${state.timerState}, ${state.timeLeft}s left`
      );
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.timeLeft, state.timerState]);

  // Handle timer completion
  useEffect(() => {
    if (state.timeLeft === 0 && state.isActive) {
      console.log(`✅ ${state.timerState} session completed!`);

      if (state.timerState === TIMER_STATES.WORKING) {
        // Work session completed
        dispatch({ type: POMODORO_ACTIONS.COMPLETE_POMODORO });
        console.log(`🎉 Pomodoro #${state.completedPomodoros + 1} completed!`);

        // Call callback to update task if provided
        if (onPomodoroComplete && state.activeTask) {
          console.log(
            `📝 Updating task pomodoro count for: ${state.activeTask.title}`
          );
          onPomodoroComplete(state.activeTask);
        }

        // Auto-start short break
        if (state.settings.autoStartBreaks) {
          startShortBreak();
        } else {
          dispatch({ type: POMODORO_ACTIONS.PAUSE_TIMER });
        }
      } else if (state.timerState === TIMER_STATES.SHORT_BREAK) {
        // Short break completed - return to idle
        dispatch({
          type: POMODORO_ACTIONS.SET_STATE,
          payload: {
            state: TIMER_STATES.IDLE,
            duration: 0,
            autoStart: false,
          },
        });
        // Clear active task when returning to idle
        dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_TASK });
        console.log("💤 Break completed, returning to idle");
      }
    }
  }, [
    state.timeLeft,
    state.isActive,
    state.timerState,
    state.activeTask,
    onPomodoroComplete,
  ]);

  // Start timer
  const startTimer = () => {
    if (state.timeLeft > 0) {
      dispatch({ type: POMODORO_ACTIONS.START_TIMER });
      console.log(`▶️ Starting timer from ${state.timeLeft}s`);
    }
  };

  // Pause timer
  const pauseTimer = () => {
    dispatch({ type: POMODORO_ACTIONS.PAUSE_TIMER });
    console.log("⏸️ Timer paused");
  };

  // Reset timer
  const resetTimer = () => {
    dispatch({ type: POMODORO_ACTIONS.RESET_TIMER });
    console.log(`🔄 Timer reset to ${state.timerState}`);
  };

  // Skip current timer
  const skipTimer = () => {
    if (state.timerState === TIMER_STATES.WORKING) {
      startShortBreak();
    } else if (state.timerState === TIMER_STATES.SHORT_BREAK) {
      dispatch({
        type: POMODORO_ACTIONS.SET_STATE,
        payload: {
          state: TIMER_STATES.IDLE,
          duration: 0,
          autoStart: false,
        },
      });
    }
    console.log("⏭️ Timer skipped");
  };

  // Start work session
  const startWorkSession = () => {
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.WORKING,
        duration: state.settings.workDuration,
        autoStart: true,
      },
    });
    console.log(`🔥 Starting work session: ${state.settings.workDuration}s`);
  };

  // Start work session with task
  const startWorkSessionWithTask = (task) => {
    dispatch({
      type: POMODORO_ACTIONS.SET_ACTIVE_TASK,
      payload: task,
    });
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.WORKING,
        duration: state.settings.workDuration,
        autoStart: true,
      },
    });
    console.log(`🔥 Starting work session for task: ${task.title}`);
  };

  // Clear active task
  const clearActiveTask = () => {
    dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_TASK });
    console.log("🧹 Active task cleared");
  };

  // Start short break
  const startShortBreak = () => {
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.SHORT_BREAK,
        duration: state.settings.shortBreakDuration,
        autoStart: state.settings.autoStartBreaks,
      },
    });
    console.log(
      `☕ Starting short break: ${state.settings.shortBreakDuration}s`
    );
  };

  // Update settings
  const updateSettings = (newSettings) => {
    dispatch({
      type: POMODORO_ACTIONS.UPDATE_SETTINGS,
      payload: newSettings,
    });
    console.log("⚙️ Settings updated:", newSettings);
  };

  // Get initial duration for current state
  const getInitialDuration = () => {
    switch (state.timerState) {
      case TIMER_STATES.WORKING:
        return state.settings.workDuration;
      case TIMER_STATES.SHORT_BREAK:
        return state.settings.shortBreakDuration;
      default:
        return 0;
    }
  };

  const value = {
    // State
    timerState: state.timerState,
    timeLeft: state.timeLeft,
    isActive: state.isActive,
    completedPomodoros: state.completedPomodoros,
    settings: state.settings,
    activeTask: state.activeTask,

    // Functions
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    startWorkSession,
    startWorkSessionWithTask,
    startShortBreak,
    updateSettings,
    getInitialDuration,
    clearActiveTask,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

// Custom hook
export const usePomodoro = () => {
  const context = useContext(PomodoroContext);

  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }

  return context;
};

export default PomodoroContext;
