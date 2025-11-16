import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../config/theme";

/**
 * DailyPomodoroProgress Component
 * Shows daily pomodoro progress with motivational messages
 */
export default function DailyPomodoroProgress({
  completedToday = 0,
  goal = 8,
  totalWorkTime = 0, // Total work time in minutes
}) {
  // Calculate progress percentage
  const progress = Math.min((completedToday / goal) * 100, 100);

  // Get motivational message based on progress
  const getMessage = () => {
    if (completedToday === 0) {
      return {
        emoji: "🌱",
        message: "Hãy bắt đầu ngày mới!",
        color: "#94A3B8",
      };
    } else if (progress < 25) {
      return {
        emoji: "🔥",
        message: "Khởi đầu tốt! Tiếp tục nào!",
        color: "#3B82F6",
      };
    } else if (progress < 50) {
      return {
        emoji: "💪",
        message: "Bạn đang làm rất tốt!",
        color: "#8B5CF6",
      };
    } else if (progress < 75) {
      return {
        emoji: "⚡",
        message: "Xuất sắc! Gần đến mục tiêu rồi!",
        color: "#F59E0B",
      };
    } else if (progress < 100) {
      return {
        emoji: "🌟",
        message: "Tuyệt vời! Chỉ còn một chút nữa!",
        color: "#10B981",
      };
    } else {
      return {
        emoji: "🎉",
        message: "Hoàn thành mục tiêu hôm nay!",
        color: "#EF4444",
      };
    }
  };

  const { emoji, message, color } = getMessage();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>Hôm Nay</Text>
          <Text style={[styles.message, { color }]}>{message}</Text>
        </View>
      </View>

      {/* Progress Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.completedText}>
          <Text style={styles.completedNumber}>{completedToday}</Text>
          <Text style={styles.goalText}> / {goal} pomodoros</Text>
        </Text>
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      {/* Time Estimate */}
      <Text style={styles.timeEstimate}>
        ⏱️ Thời gian: {Math.floor(totalWorkTime / 60)}h {totalWorkTime % 60}m
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  completedText: {
    fontSize: 14,
  },
  completedNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  goalText: {
    fontSize: 16,
    color: "#718096",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
    transition: "width 0.3s ease",
  },
  timeEstimate: {
    fontSize: 12,
    color: "#718096",
    textAlign: "right",
  },
});
