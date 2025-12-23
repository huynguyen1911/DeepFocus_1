import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

/**
 * Circular Progress with Emoji Gamification
 * 🌱 0-30%: Seed (Starting)
 * 🌿 31-70%: Growing plant
 * 🌳 71-100%: Full tree
 */
const CircularProgressTask = ({ completed, estimated, size = 160 }) => {
  const progress = Math.min((completed / estimated) * 100, 100);

  // Gamification: Choose emoji based on progress
  const getProgressEmoji = () => {
    if (progress >= 71) return "🌳"; // Full tree
    if (progress >= 31) return "🌿"; // Growing plant
    return "🌱"; // Seed
  };

  // Status text
  const getStatusText = () => {
    if (progress === 100) return "Hoàn thành rồi!";
    if (progress >= 71) return "Sắp xong rồi";
    if (progress >= 31) return "Đang nuôi dưỡng";
    return "Vừa mới bắt đầu";
  };

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        {/* Background circle */}
        <View style={[styles.circle, { width: size, height: size }]}>
          {/* Progress ring - Simple implementation */}
          <View
            style={[
              styles.progressRing,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 12,
                borderColor: "#F0F0F0",
              },
            ]}
          />

          {/* Filled progress */}
          <View
            style={[
              styles.progressFill,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 12,
                borderColor: progress >= 71 ? "#4CAF50" : "#6C63FF",
                borderTopColor: "transparent",
                borderRightColor: progress < 50 ? "transparent" : undefined,
                transform: [{ rotate: `${(progress / 100) * 360}deg` }],
              },
            ]}
          />

          {/* Center content */}
          <View style={styles.centerContent}>
            <Text style={styles.emoji}>{getProgressEmoji()}</Text>
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      {/* Pomodoro stats below */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{completed}</Text>
          <Text style={styles.statLabel}>Đã hoàn thành</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{estimated}</Text>
          <Text style={styles.statLabel}>Dự kiến</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  circleWrapper: {
    position: "relative",
    marginBottom: 24,
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressRing: {
    position: "absolute",
  },
  progressFill: {
    position: "absolute",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  centerContent: {
    alignItems: "center",
    zIndex: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#636E72",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6C63FF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
});

export default CircularProgressTask;
