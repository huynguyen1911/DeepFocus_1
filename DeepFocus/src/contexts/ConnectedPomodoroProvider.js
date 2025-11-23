import React, { useEffect, useRef } from "react";
import { PomodoroProvider, usePomodoro, TIMER_STATES } from "./PomodoroContext";
import { useTasks } from "./TaskContext";
import { useSession } from "./SessionContext";

/**
 * Bridge component that syncs Pomodoro sessions with Session API
 * Automatically creates and completes sessions when timer runs
 */
const SessionBridge = () => {
  const { timerState, isActive, timeLeft, activeTask } = usePomodoro();
  const { startSession, completeSession, activeSession } = useSession();
  const sessionCreatedRef = useRef(false);
  const lastTimerStateRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Create session when work timer starts
  useEffect(() => {
    const shouldCreateSession =
      timerState === TIMER_STATES.WORKING &&
      isActive &&
      !sessionCreatedRef.current &&
      !activeSession;

    if (shouldCreateSession) {
      console.log("📊 Creating session for work timer");
      createSessionForTimer();
    }

    lastTimerStateRef.current = timerState;
  }, [timerState, isActive]);

  // Complete session when work timer completes (timeLeft hits 0)
  useEffect(() => {
    const workSessionCompleted =
      lastTimerStateRef.current === TIMER_STATES.WORKING &&
      timerState !== TIMER_STATES.WORKING &&
      sessionIdRef.current;

    if (workSessionCompleted) {
      console.log("📊 Work session completed, completing session");
      completeCurrentSession();
    }
  }, [timerState]);

  const createSessionForTimer = async () => {
    try {
      // Get session type
      const sessionType =
        timerState === TIMER_STATES.WORKING
          ? "focus"
          : timerState === TIMER_STATES.SHORT_BREAK
          ? "short-break"
          : "long-break";

      // Get target duration from timeLeft (in minutes)
      const targetDuration = Math.ceil(timeLeft / 60);

      // Create session data
      const sessionData = {
        type: sessionType,
        targetDuration,
        task: activeTask?._id || null,
        class: activeTask?.class || null, // If task has associated class
      };

      const result = await startSession(sessionData);

      if (result.success && result.session) {
        sessionIdRef.current = result.session._id;
        sessionCreatedRef.current = true;
        console.log("✅ Session created:", result.session._id);
      }
    } catch (error) {
      console.error("❌ Failed to create session:", error);
    }
  };

  const completeCurrentSession = async () => {
    if (!sessionIdRef.current) return;

    try {
      const result = await completeSession(sessionIdRef.current);

      if (result.success) {
        console.log("✅ Session completed:", sessionIdRef.current);
      }
    } catch (error) {
      console.error("❌ Failed to complete session:", error);
    } finally {
      // Reset session tracking
      sessionIdRef.current = null;
      sessionCreatedRef.current = false;
    }
  };

  return null;
};

/**
 * Inner component that syncs activeTask when tasks change
 * Must be inside PomodoroProvider to access usePomodoro hook
 */
const TaskSyncBridge = ({ tasks }) => {
  const { activeTask, updateActiveTask } = usePomodoro();

  useEffect(() => {
    // If there's an active task, check if it has a temp ID that needs updating
    if (activeTask && activeTask._id && activeTask._id.startsWith("temp_")) {
      // Find the real task by title (since temp task might have been replaced)
      const realTask = tasks.find(
        (t) => t.title === activeTask.title && !t._id.startsWith("temp_")
      );

      if (realTask && realTask._id !== activeTask._id) {
        console.log(
          `🔄 Syncing activeTask: ${activeTask._id} → ${realTask._id}`
        );
        updateActiveTask(realTask);
      }
    } else if (activeTask && activeTask._id) {
      // If activeTask has real ID, update it with latest data from tasks
      const updatedTask = tasks.find((t) => t._id === activeTask._id);
      if (
        updatedTask &&
        updatedTask.completedPomodoros !== activeTask.completedPomodoros
      ) {
        console.log(
          `🔄 Updating activeTask with latest data: ${activeTask.title}`
        );
        updateActiveTask(updatedTask);
      }
    }
  }, [tasks, activeTask, updateActiveTask]);

  return null;
};

/**
 * Wrapper component that provides tasks to TaskSyncBridge and SessionBridge
 */
const TaskSyncWrapper = ({ children }) => {
  const { tasks } = useTasks();
  return (
    <>
      <SessionBridge />
      <TaskSyncBridge tasks={tasks} />
      {children}
    </>
  );
};

/**
 * Inner component that has access to both contexts
 */
const PomodoroTaskBridge = ({ children, onPomodoroComplete }) => {
  return (
    <PomodoroProvider onPomodoroComplete={onPomodoroComplete}>
      <TaskSyncWrapper>{children}</TaskSyncWrapper>
    </PomodoroProvider>
  );
};

/**
 * Wrapper for PomodoroProvider that connects to TaskContext
 * This allows Pomodoro to update tasks without circular dependency
 */
export const ConnectedPomodoroProvider = ({ children }) => {
  const { incrementPomodoroCount } = useTasks();

  // Callback when a pomodoro is completed
  const handlePomodoroComplete = async (task, duration = 25) => {
    if (!task || !task._id) {
      console.log("⚠️ No task to update");
      return;
    }

    try {
      console.log(`📝 Incrementing pomodoro for task: ${task.title}`);
      console.log(
        `   Current: ${task.completedPomodoros} → New: ${
          task.completedPomodoros + 1
        } (${duration} minutes)`
      );

      const result = await incrementPomodoroCount(task._id, duration);

      if (result.success) {
        console.log(`✅ Task pomodoro updated successfully!`);

        // Get the updated task data
        const updatedTask = result.data;

        // Return the updated task to sync with PomodoroContext
        if (updatedTask && updatedTask.isCompleted) {
          console.log(`🎉 Task auto-completed! It will be cleared from timer.`);
          // Return a flag to indicate task should be cleared
          return { taskCompleted: true, updatedTask };
        }

        // Return updated task for syncing
        return { taskCompleted: false, updatedTask };
      } else {
        console.error(`❌ Failed to update task: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error updating task pomodoro:", error);
    }

    return { taskCompleted: false };
  };

  return (
    <PomodoroTaskBridge onPomodoroComplete={handlePomodoroComplete}>
      {children}
    </PomodoroTaskBridge>
  );
};

export default ConnectedPomodoroProvider;
