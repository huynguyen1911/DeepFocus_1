import React from "react";
import { PomodoroProvider } from "./PomodoroContext";
import { useTasks } from "./TaskContext";

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
      } else {
        console.error(`❌ Failed to update task: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error updating task pomodoro:", error);
    }
  };

  return (
    <PomodoroProvider onPomodoroComplete={handlePomodoroComplete}>
      {children}
    </PomodoroProvider>
  );
};

export default ConnectedPomodoroProvider;
