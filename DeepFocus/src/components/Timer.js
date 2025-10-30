import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Text,
  Button,
  ProgressBar,
  Badge,
  useTheme,
} from "react-native-paper";
import { usePomodoro, TIMER_STATES } from "../contexts/PomodoroContext";
import { formatTime } from "../utils/helpers";
import TaskSelector from "./TaskSelector";

const Timer = () => {
  const theme = useTheme();
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const {
    timerState,
    timeLeft,
    isActive,
    completedPomodoros,
    activeTask,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    startWorkSession,
    startWorkSessionWithTask,
    getInitialDuration,
    clearActiveTask,
  } = usePomodoro();

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
        return "Tập Trung";
      case TIMER_STATES.SHORT_BREAK:
        return "Nghỉ Ngắn";
      default:
        return "Sẵn Sàng";
    }
  };

  // Get state color
  const getStateColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORKING:
        return "#FF5252";
      case TIMER_STATES.SHORT_BREAK:
        return "#66BB6A";
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
            <Button
              mode="contained"
              onPress={() => startWorkSessionWithTask(activeTask)}
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon="play"
            >
              Tiếp Tục Nhiệm Vụ
            </Button>
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleSwapTask}
                style={[styles.button, styles.buttonHalf]}
                contentStyle={styles.buttonContent}
                icon="swap-horizontal"
              >
                Đổi Task
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  clearActiveTask();
                }}
                style={[styles.button, styles.buttonHalf]}
                contentStyle={styles.buttonContent}
                icon="close"
              >
                Xóa Task
              </Button>
            </View>
          </View>
        );
      }

      // No active task - show task selector button
      return (
        <View style={styles.buttonColumn}>
          <Button
            mode="contained"
            onPress={() => setShowTaskSelector(true)}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="format-list-checks"
          >
            Chọn Nhiệm Vụ & Bắt Đầu
          </Button>
          <Button
            mode="outlined"
            onPress={startWorkSession}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="play"
          >
            Bắt Đầu Không Nhiệm Vụ
          </Button>
        </View>
      );
    }

    if (isActive) {
      // Timer running - show pause and reset
      return (
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={pauseTimer}
            style={[styles.button, styles.buttonHalf]}
            contentStyle={styles.buttonContent}
            icon="pause"
          >
            Tạm Dừng
          </Button>
          <Button
            mode="outlined"
            onPress={resetTimer}
            style={[styles.button, styles.buttonHalf]}
            contentStyle={styles.buttonContent}
            icon="refresh"
          >
            Đặt Lại
          </Button>
        </View>
      );
    }

    // Timer paused - show resume, reset, skip
    return (
      <View style={styles.buttonColumn}>
        <Button
          mode="contained"
          onPress={startTimer}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="play"
        >
          Tiếp Tục
        </Button>
        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={resetTimer}
            style={[styles.button, styles.buttonHalf]}
            contentStyle={styles.buttonContent}
            icon="refresh"
          >
            Đặt Lại
          </Button>
          <Button
            mode="outlined"
            onPress={skipTimer}
            style={[styles.button, styles.buttonHalf]}
            contentStyle={styles.buttonContent}
            icon="skip-next"
          >
            Bỏ Qua
          </Button>
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
                ? "Đang làm việc:"
                : timerState === TIMER_STATES.IDLE
                ? "Nhiệm vụ hiện tại:"
                : "Đang nghỉ:"}
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
          {formatTime(timeLeft)}
        </Text>

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
              🎯 Pomodoros Hoàn Thành: {completedPomodoros}
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
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
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
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
  },
  taskLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
    fontWeight: "500",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
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
    fontSize: 72,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 24,
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
    borderRadius: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonContent: {
    height: 50,
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
