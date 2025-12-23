import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * PomodoroCounter Component
 * Visual counter for Pomodoro estimation with tomato icons
 */
const PomodoroCounter = ({ value, onChange, disabled = false }) => {
  const pomodoros = parseInt(value) || 1;

  const increment = () => {
    if (!disabled && pomodoros < 10) {
      onChange(String(pomodoros + 1));
    }
  };

  const decrement = () => {
    if (!disabled && pomodoros > 1) {
      onChange(String(pomodoros - 1));
    }
  };

  // Calculate estimated time
  const estimatedMinutes = pomodoros * 25;
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  const timeText =
    hours > 0 ? `Khoảng ${hours}h ${minutes}m` : `Khoảng ${minutes} phút`;

  return (
    <View style={styles.container}>
      <View style={styles.counterRow}>
        <TouchableOpacity
          onPress={decrement}
          disabled={disabled || pomodoros <= 1}
          style={[
            styles.button,
            (disabled || pomodoros <= 1) && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              (disabled || pomodoros <= 1) && styles.buttonTextDisabled,
            ]}
          >
            −
          </Text>
        </TouchableOpacity>

        <View style={styles.tomatoContainer}>
          {[...Array(pomodoros)].map((_, index) => (
            <Text key={index} style={styles.tomato}>
              🍅
            </Text>
          ))}
          <Text style={styles.count}>{pomodoros}</Text>
        </View>

        <TouchableOpacity
          onPress={increment}
          disabled={disabled || pomodoros >= 10}
          style={[
            styles.button,
            (disabled || pomodoros >= 10) && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              (disabled || pomodoros >= 10) && styles.buttonTextDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.timeEstimate}>{timeText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE9FE",
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#6C63FF",
    lineHeight: 36,
  },
  buttonTextDisabled: {
    color: "#BDBDBD",
  },
  tomatoContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
    justifyContent: "center",
    gap: 4,
  },
  tomato: {
    fontSize: 24,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6C63FF",
    marginLeft: 8,
  },
  timeEstimate: {
    marginTop: 12,
    fontSize: 14,
    color: "#636E72",
    fontWeight: "500",
  },
});

export default PomodoroCounter;
