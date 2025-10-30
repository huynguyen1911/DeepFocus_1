import React from "react";
import { PomodoroProvider, usePomodoro } from "./PomodoroContext";
import { useTasks } from "./TaskContext";

/**
 * Inner component that has access to both contexts
 */
const PomodoroTaskBridge = ({ children, onPomodoroComplete }) => {
  return (
    <PomodoroProvider onPomodoroComplete={onPomodoroComplete}>
      {children}
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

        // Check if task was auto-completed (reached goal)
        const updatedTask = result.data;
        if (updatedTask && updatedTask.isCompleted) {
          console.log(`🎉 Task auto-completed! It will be cleared from timer.`);
          // Return a flag to indicate task should be cleared
          return { taskCompleted: true };
        }
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
