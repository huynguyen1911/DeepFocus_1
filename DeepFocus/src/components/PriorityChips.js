import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * PriorityChips Component
 * Soft pill-shaped buttons for priority selection
 */
const PriorityChips = ({ value, onChange, disabled = false }) => {
  const priorities = [
    {
      key: "low",
      label: "Thấp",
      emoji: "🟢",
      grayEmoji: "⚪",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
    {
      key: "medium",
      label: "Trung bình",
      emoji: "🟡",
      grayEmoji: "⚪",
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      key: "high",
      label: "Cao",
      emoji: "🔴",
      grayEmoji: "⚪",
      color: "#FF5252",
      bgColor: "#FFEBEE",
    },
  ];

  return (
    <View style={styles.container}>
      {priorities.map((priority) => {
        const isSelected = value === priority.key;

        return (
          <TouchableOpacity
            key={priority.key}
            onPress={() => !disabled && onChange(priority.key)}
            disabled={disabled}
            style={[
              styles.chip,
              isSelected && {
                backgroundColor: priority.bgColor,
                borderColor: "transparent",
                borderWidth: 0,
              },
              !isSelected && {
                backgroundColor: "#F3F4F6",
                borderColor: "transparent",
                borderWidth: 0,
              },
              disabled && styles.chipDisabled,
            ]}
          >
            <Text style={styles.emoji}>
              {isSelected ? priority.emoji : priority.grayEmoji}
            </Text>
            <Text
              style={[
                styles.label,
                isSelected && {
                  color: priority.color,
                  fontWeight: "600",
                },
                !isSelected && {
                  color: "#9CA3AF",
                  fontWeight: "500",
                },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
  },
});

export default PriorityChips;
