import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Text,
  ProgressBar,
  Badge,
  useTheme,
} from "react-native-paper";
import { usePomodoro, TIMER_STATES } from "../contexts/PomodoroContext";
import { useLanguage } from "../contexts/LanguageContext";
import { formatTime } from "../utils/helpers";
import TaskSelector from "./TaskSelector";
import PomodoroCompletionModal from "./PomodoroCompletionModal";
import GradientButton from "./GradientButton";

const Timer = () => {
  const theme = useTheme();
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const {
    timerState,
    timeLeft,
    isActive,
    completedPomodoros,
    activeTask,
    showCompletionModal,
    pendingBreakType,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    startWorkSession,
    startWorkSessionWithTask,
    getInitialDuration,
    clearActiveTask,
    handleStartBreakFromModal,
    handleCloseCompletionModal,
  } = usePomodoro();
  const { t } = useLanguage();

  // Handle task selection
  const handleSelectTask = (task) => {
    if (task) {
      // Start work session with selected task (replaces current task if any)
      startWorkSessionWithTask(task);
    } else {
      // Clear active task and start without task
      clearActiveTask();
      startWorkSession();
    }
    setShowTaskSelector(false);
  };

  // Handle task swap (from idle state with active task)
  const handleSwapTask = () => {
    // Don't clear task yet - let user select new one first
    setShowTaskSelector(true);
  };

  // Get state label
  const getStateLabel = () => {
    switch (timerState) {
      case TIMER_STATES.WORKING:
        return t("home.focus");
      case TIMER_STATES.SHORT_BREAK:
        return t("home.shortBreak");
      case TIMER_STATES.LONG_BREAK:
        return t("home.longBreak");
      default:
        return t("home.ready");
    }
  };

  // Get state color
  const getStateColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORKING:
        return "#6C63FF";
      case TIMER_STATES.SHORT_BREAK:
        return "#66BB6A";
      case TIMER_STATES.LONG_BREAK:
        return "#5C6BC0";
      default:
        return "#9E9E9E";
    }
  };

  // Calculate progress
  const getProgress = () => {
    const totalTime = getInitialDuration();
    if (totalTime === 0) {
      console.log("⚠️ Progress: totalTime is 0, returning 0");
      return 0;
    }
    const progress = (totalTime - timeLeft) / totalTime;
    console.log(`📊 Progress calculation:`, {
      timerState,
      totalTime,
      timeLeft,
      progress: progress.toFixed(3),
    });
    return Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
  };

  // Render control buttons
  const renderControls = () => {
    if (timerState === TIMER_STATES.IDLE) {
      // Check if there's an active task from previous session
      if (activeTask) {
        // Show continue button for active task
        return (
          <View style={styles.buttonColumn}>
            <GradientButton
              onPress={() => startWorkSessionWithTask(activeTask)}
              title={t("home.resumeWork")}
              icon="play"
              style={styles.button}
            />
            <View style={styles.buttonRow}>
              <GradientButton
                mode="outlined"
                onPress={handleSwapTask}
                title={t("timer.swapTask")}
                icon="swap-horizontal"
                style={[styles.button, styles.buttonHalf]}
              />
              <GradientButton
                mode="outlined"
                onPress={() => {
                  clearActiveTask();
                }}
                title={t("tasks.delete")}
                icon="close"
                style={[styles.button, styles.buttonHalf]}
              />
            </View>
          </View>
        );
      }

      // No active task - show task selector button
      return (
        <View style={styles.buttonColumn}>
          <GradientButton
            onPress={() => setShowTaskSelector(true)}
            title={t("timer.selectTaskAndStart")}
            icon="format-list-checks"
            style={styles.button}
          />
          <GradientButton
            mode="outlined"
            onPress={startWorkSession}
            title={t("timer.startWithoutTask")}
            icon="play"
            style={styles.button}
          />
        </View>
      );
    }

    if (isActive) {
      // Timer running - show pause and reset
      return (
        <View style={styles.buttonRow}>
          <GradientButton
            onPress={pauseTimer}
            title={t("home.pause")}
            icon="pause"
            style={[styles.button, styles.buttonHalf]}
          />
          <GradientButton
            mode="outlined"
            onPress={resetTimer}
            title={t("home.reset")}
            icon="refresh"
            style={[styles.button, styles.buttonHalf]}
          />
        </View>
      );
    }

    // Timer paused - show resume, reset, skip
    return (
      <View style={styles.buttonColumn}>
        <GradientButton
          onPress={startTimer}
          title={t("home.resume")}
          icon="play"
          style={styles.button}
        />
        <View style={styles.buttonRow}>
          <GradientButton
            mode="outlined"
            onPress={resetTimer}
            title={t("home.reset")}
            icon="refresh"
            style={[styles.button, styles.buttonHalf]}
          />
          <GradientButton
            mode="outlined"
            onPress={skipTimer}
            title={t("general.skip")}
            icon="skip-next"
            style={[styles.button, styles.buttonHalf]}
          />
        </View>
      </View>
    );
  };

  return (
    <Card style={styles.card} elevation={4}>
      <Card.Content style={styles.cardContent}>
        {/* State Label */}
        <View style={styles.header}>
          <Title style={[styles.stateLabel, { color: getStateColor() }]}>
            {getStateLabel()}
          </Title>
          {timerState === TIMER_STATES.WORKING && (
            <Badge
              size={32}
              style={[styles.badge, { backgroundColor: getStateColor() }]}
            >
              #{completedPomodoros + 1}
            </Badge>
          )}
        </View>

        {/* Active Task Display */}
        {activeTask && (
          <View style={styles.taskContainer}>
            <Text style={styles.taskLabel}>
              {timerState === TIMER_STATES.WORKING
                ? t("timer.workingOnLabel")
                : timerState === TIMER_STATES.IDLE
                ? t("timer.currentTaskLabel")
                : t("timer.onBreakLabel")}
            </Text>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {activeTask.title}
            </Text>
            {activeTask.estimatedPomodoros > 0 && (
              <View style={styles.taskProgressContainer}>
                <Text style={styles.taskProgressText}>
                  🍅 {activeTask.completedPomodoros}/
                  {activeTask.estimatedPomodoros} Pomodoros
                </Text>
                <ProgressBar
                  progress={Math.min(
                    1,
                    activeTask.completedPomodoros /
                      activeTask.estimatedPomodoros
                  )}
                  color={
                    activeTask.completedPomodoros /
                      activeTask.estimatedPomodoros >=
                    0.75
                      ? "#4CAF50"
                      : theme.colors.primary
                  }
                  style={styles.taskProgressBar}
                />
              </View>
            )}
          </View>
        )}

        {/* Timer Display */}
        <Text style={[styles.timerText, { color: getStateColor() }]}>
          {timerState === TIMER_STATES.IDLE
            ? formatTime(getInitialDuration()) // Show initial duration when idle
            : formatTime(timeLeft)}
        </Text>

        {/* Total Duration Display */}
        {timerState !== TIMER_STATES.IDLE && (
          <Text style={styles.durationText}>
            / {formatTime(getInitialDuration())}
          </Text>
        )}

        {/* Progress Bar */}
        {timerState !== TIMER_STATES.IDLE && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={getProgress()}
              color={getStateColor()}
              style={styles.progressBar}
            />
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controls}>{renderControls()}</View>

        {/* Pomodoro Counter */}
        {completedPomodoros > 0 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {t("stats.completedPomodorosCount", {
                count: completedPomodoros,
              })}
            </Text>
          </View>
        )}
      </Card.Content>

      {/* Task Selector Modal */}
      <TaskSelector
        visible={showTaskSelector}
        onClose={() => setShowTaskSelector(false)}
        onSelectTask={handleSelectTask}
      />

      {/* Pomodoro Completion Modal */}
      <PomodoroCompletionModal
        visible={showCompletionModal}
        onStartBreak={handleStartBreakFromModal}
        onClose={handleCloseCompletionModal}
        isLongBreak={pendingBreakType === "long"}
        completedPomodoros={completedPomodoros}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  cardContent: {
    padding: 24,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  stateLabel: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  badge: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskContainer: {
    width: "100%",
    backgroundColor: "#F3F0FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#6C63FF",
    elevation: 1,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  taskLabel: {
    fontSize: 12,
    color: "#636E72",
    marginBottom: 4,
    fontWeight: "500",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    lineHeight: 22,
  },
  taskProgressContainer: {
    marginTop: 8,
    gap: 4,
  },
  taskProgressText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#424242",
  },
  taskProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  timerText: {
    fontSize: 80,
    fontWeight: "300",
    textAlign: "center",
    marginVertical: 24,
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
  },
  durationText: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    color: "#636E72",
    marginTop: -20,
    marginBottom: 12,
    fontVariant: ["tabular-nums"],
  },
  progressContainer: {
    width: "100%",
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0", // Background track color
  },
  controls: {
    width: "100%",
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  buttonColumn: {
    gap: 12,
    width: "100%",
  },
  button: {
    borderRadius: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  counterContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    width: "100%",
  },
  counterText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    color: "#757575",
  },
});

export default Timer;
