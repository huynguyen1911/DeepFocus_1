import React, { useEffect } from "react";
import { PomodoroProvider, usePomodoro } from "./PomodoroContext";
import { useTasks } from "./TaskContext";

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
 * Wrapper component that provides tasks to TaskSyncBridge
 */
const TaskSyncWrapper = ({ children }) => {
  const { tasks } = useTasks();
  return (
    <>
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
