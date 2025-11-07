import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from "react";

// Timer states
export const TIMER_STATES = {
  IDLE: "IDLE",
  WORKING: "WORKING",
  SHORT_BREAK: "SHORT_BREAK",
  LONG_BREAK: "LONG_BREAK",
};

// Actions
const POMODORO_ACTIONS = {
  START_TIMER: "START_TIMER",
  PAUSE_TIMER: "PAUSE_TIMER",
  RESET_TIMER: "RESET_TIMER",
  TICK: "TICK",
  SET_STATE: "SET_STATE",
  COMPLETE_POMODORO: "COMPLETE_POMODORO",
  RESET_COMPLETED_POMODOROS: "RESET_COMPLETED_POMODOROS",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_ACTIVE_TASK: "SET_ACTIVE_TASK",
  UPDATE_ACTIVE_TASK: "UPDATE_ACTIVE_TASK",
  CLEAR_ACTIVE_TASK: "CLEAR_ACTIVE_TASK",
  SET_COMPLETION_MODAL: "SET_COMPLETION_MODAL",
  SET_PENDING_BREAK: "SET_PENDING_BREAK",
};

// Default settings
const DEFAULT_SETTINGS = {
  workDuration: 10, //1500, // 25 minutes in seconds
  shortBreakDuration: 5, //300, // 5 minutes in seconds
  longBreakDuration: 10, //600, // 10 minutes in seconds
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

// Initial state
const initialState = {
  timerState: TIMER_STATES.IDLE,
  timeLeft: 0,
  isActive: false,
  completedPomodoros: 0, // Total pomodoros completed (never reset, for display)
  pomodorosInCurrentCycle: 0, // Pomodoros in current cycle (reset after long break)
  settings: DEFAULT_SETTINGS,
  activeTask: null, // Currently running task
  showCompletionModal: false,
  pendingBreakType: null, // 'short' or 'long'
  workSessionJustCompleted: false,
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
          : state.timerState === TIMER_STATES.LONG_BREAK
          ? state.settings.longBreakDuration
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
        pomodorosInCurrentCycle: state.pomodorosInCurrentCycle + 1,
      };

    case POMODORO_ACTIONS.RESET_COMPLETED_POMODOROS:
      // Only reset cycle counter, keep total count
      return {
        ...state,
        pomodorosInCurrentCycle: 0,
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

    case POMODORO_ACTIONS.UPDATE_ACTIVE_TASK:
      return {
        ...state,
        activeTask: action.payload,
      };

    case POMODORO_ACTIONS.CLEAR_ACTIVE_TASK:
      return {
        ...state,
        activeTask: null,
      };

    case POMODORO_ACTIONS.SET_COMPLETION_MODAL:
      return {
        ...state,
        showCompletionModal: action.payload.visible,
        workSessionJustCompleted: action.payload.sessionCompleted || false,
      };

    case POMODORO_ACTIONS.SET_PENDING_BREAK:
      return {
        ...state,
        pendingBreakType: action.payload,
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

  // Use refs to store values needed in completion handler without triggering re-runs
  const stateRef = useRef(state);
  const onPomodoroCompleteRef = useRef(onPomodoroComplete);

  // Update refs when values change
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    onPomodoroCompleteRef.current = onPomodoroComplete;
  }, [onPomodoroComplete]);

  // Define helper functions with useCallback
  const startWorkSession = useCallback(() => {
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.WORKING,
        duration: stateRef.current.settings.workDuration,
        autoStart: true,
      },
    });
    console.log(
      `🔥 Starting work session: ${stateRef.current.settings.workDuration}s`
    );
  }, []);

  const startShortBreak = useCallback((forceAutoStart = false) => {
    const autoStart =
      forceAutoStart || stateRef.current.settings.autoStartBreaks;
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.SHORT_BREAK,
        duration: stateRef.current.settings.shortBreakDuration,
        autoStart: autoStart,
      },
    });
    console.log(
      `☕ Starting short break: ${stateRef.current.settings.shortBreakDuration}s (autoStart: ${autoStart})`
    );
  }, []);

  const startLongBreak = useCallback((forceAutoStart = false) => {
    const autoStart =
      forceAutoStart || stateRef.current.settings.autoStartBreaks;
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.LONG_BREAK,
        duration: stateRef.current.settings.longBreakDuration,
        autoStart: autoStart,
      },
    });
    console.log(
      `🌟 Starting long break: ${stateRef.current.settings.longBreakDuration}s (autoStart: ${autoStart})`
    );
  }, []);

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
    const handleCompletion = async () => {
      // Only trigger when timer hits 0 AND is still active
      if (state.timeLeft === 0 && state.isActive) {
        console.log(`✅ ${state.timerState} session completed!`);

        // IMMEDIATELY pause timer to prevent re-triggering
        dispatch({ type: POMODORO_ACTIONS.PAUSE_TIMER });

        if (state.timerState === TIMER_STATES.WORKING) {
          // Work session completed - use current state from ref
          const currentState = stateRef.current;
          const newCompletedPomodoros = currentState.completedPomodoros + 1;
          console.log(`🎉 Pomodoro #${newCompletedPomodoros} completed!`);

          // Update completed count
          dispatch({ type: POMODORO_ACTIONS.COMPLETE_POMODORO });

          // Call callback to update task if provided
          if (onPomodoroCompleteRef.current && currentState.activeTask) {
            console.log(
              `📝 Updating task pomodoro count for: ${currentState.activeTask.title}`
            );
            // Convert work duration from seconds to minutes
            const durationInMinutes = Math.round(
              currentState.settings.workDuration / 60
            );

            // Call callback and check if task was completed
            const result = await onPomodoroCompleteRef.current(
              currentState.activeTask,
              durationInMinutes
            );

            // Update activeTask with the latest data from result
            if (result && result.updatedTask) {
              console.log("🔄 Syncing activeTask with updated data");
              dispatch({
                type: POMODORO_ACTIONS.UPDATE_ACTIVE_TASK,
                payload: result.updatedTask,
              });
            }

            // If task reached its goal and was auto-completed, clear it from timer
            if (result && result.taskCompleted) {
              console.log(
                "🧹 Task reached goal and completed, clearing from timer"
              );
              dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_TASK });
            }
          }

          // Determine break type
          // Use pomodorosInCurrentCycle from state (reset after long break)
          const newPomodorosInCycle = currentState.pomodorosInCurrentCycle + 1;
          const isLongBreak =
            newPomodorosInCycle >=
            currentState.settings.pomodorosUntilLongBreak;

          console.log(
            `🔍 autoStartBreaks setting: ${currentState.settings.autoStartBreaks}`
          );
          console.log(
            `🔍 Break type: ${
              isLongBreak ? "LONG" : "SHORT"
            } (${newPomodorosInCycle}/${
              currentState.settings.pomodorosUntilLongBreak
            } in cycle)`
          );

          if (currentState.settings.autoStartBreaks) {
            // Auto-start break
            console.log("🚀 AUTO-STARTING break...");
            if (isLongBreak) {
              startLongBreak();
            } else {
              startShortBreak();
            }
          } else {
            // Show modal to let user choose
            console.log("🎯 SHOWING MODAL for user to choose...");
            dispatch({
              type: POMODORO_ACTIONS.SET_PENDING_BREAK,
              payload: isLongBreak ? "long" : "short",
            });
            dispatch({
              type: POMODORO_ACTIONS.SET_COMPLETION_MODAL,
              payload: { visible: true, sessionCompleted: true },
            });
          }
        } else if (
          state.timerState === TIMER_STATES.SHORT_BREAK ||
          state.timerState === TIMER_STATES.LONG_BREAK
        ) {
          // Break completed - return to idle
          const currentState = stateRef.current;
          const wasLongBreak = state.timerState === TIMER_STATES.LONG_BREAK;

          // Keep the active task so user can continue working on it
          dispatch({
            type: POMODORO_ACTIONS.SET_STATE,
            payload: {
              state: TIMER_STATES.IDLE,
              duration: 0,
              autoStart: false,
            },
          });

          // Reset pomodoro counter after long break to start new cycle
          if (wasLongBreak) {
            console.log(
              "🔄 Long break completed, resetting pomodoro counter for new cycle"
            );
            dispatch({
              type: POMODORO_ACTIONS.RESET_COMPLETED_POMODOROS,
            });
          }

          // Auto-start next pomodoro if enabled
          if (
            currentState.settings.autoStartPomodoros &&
            currentState.activeTask
          ) {
            console.log("🔄 Auto-starting next pomodoro...");
            startWorkSession();
          } else {
            console.log(
              "💤 Break completed, returning to idle (task preserved)"
            );
          }
        }
      }
    };

    handleCompletion();
  }, [
    state.timeLeft,
    state.isActive,
    state.timerState,
    startLongBreak,
    startShortBreak,
    startWorkSession,
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
    // Clear active task when user manually resets
    dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_TASK });
    console.log(`🔄 Timer reset to ${state.timerState}, task cleared`);
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

  // Update active task (for syncing with TaskContext updates)
  const updateActiveTask = (updatedTask) => {
    dispatch({
      type: POMODORO_ACTIONS.UPDATE_ACTIVE_TASK,
      payload: updatedTask,
    });
    console.log("🔄 Active task updated:", updatedTask?.title);
  };

  // Handle start break from modal
  const handleStartBreakFromModal = () => {
    dispatch({
      type: POMODORO_ACTIONS.SET_COMPLETION_MODAL,
      payload: { visible: false, sessionCompleted: false },
    });

    // Force autoStart when user explicitly clicks "Start Break" button
    if (state.pendingBreakType === "long") {
      startLongBreak(true); // Force autoStart = true
    } else {
      startShortBreak(true); // Force autoStart = true
    }
  };

  // Handle close completion modal
  const handleCloseCompletionModal = () => {
    dispatch({
      type: POMODORO_ACTIONS.SET_COMPLETION_MODAL,
      payload: { visible: false, sessionCompleted: false },
    });
    dispatch({
      type: POMODORO_ACTIONS.SET_STATE,
      payload: {
        state: TIMER_STATES.IDLE,
        duration: 0,
        autoStart: false,
      },
    });
  };

  // Update settings
  const updateSettings = (newSettings) => {
    console.log("⚙️ Updating settings to:", newSettings);
    console.log(`  ⌛ workDuration: ${newSettings.workDuration}s`);
    console.log(`  ☕ shortBreakDuration: ${newSettings.shortBreakDuration}s`);
    console.log(`  🌟 longBreakDuration: ${newSettings.longBreakDuration}s`);
    console.log(
      `  🔢 pomodorosUntilLongBreak: ${newSettings.pomodorosUntilLongBreak}`
    );
    console.log(`  🚀 autoStartBreaks: ${newSettings.autoStartBreaks}`);
    console.log(`  🔄 autoStartPomodoros: ${newSettings.autoStartPomodoros}`);
    console.log(`  🔔 notifications: ${newSettings.notifications}`);

    dispatch({
      type: POMODORO_ACTIONS.UPDATE_SETTINGS,
      payload: newSettings,
    });
  };

  // Get initial duration for current state
  const getInitialDuration = () => {
    switch (state.timerState) {
      case TIMER_STATES.WORKING:
        return state.settings.workDuration;
      case TIMER_STATES.SHORT_BREAK:
        return state.settings.shortBreakDuration;
      case TIMER_STATES.LONG_BREAK:
        return state.settings.longBreakDuration;
      case TIMER_STATES.IDLE:
        // When idle, show work duration as the initial time
        return state.settings.workDuration;
      default:
        return state.settings.workDuration;
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
    showCompletionModal: state.showCompletionModal,
    pendingBreakType: state.pendingBreakType,
    workSessionJustCompleted: state.workSessionJustCompleted,

    // Functions
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    startWorkSession,
    startWorkSessionWithTask,
    startShortBreak,
    startLongBreak,
    updateSettings,
    getInitialDuration,
    clearActiveTask,
    updateActiveTask,
    handleStartBreakFromModal,
    handleCloseCompletionModal,
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
