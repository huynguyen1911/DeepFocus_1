import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * GradientButton Component
 * Modern button with purple gradient effect
 */
const GradientButton = ({
  onPress,
  title,
  icon,
  mode = "gradient", // 'gradient' | 'outlined'
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  if (mode === "outlined") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outlinedButton, disabled && styles.disabled, style]}
        activeOpacity={0.7}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color="#6C63FF"
            style={styles.icon}
          />
        )}
        {loading ? (
          <ActivityIndicator size="small" color="#6C63FF" />
        ) : (
          <Text style={[styles.outlinedText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, disabled && styles.disabled, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["#6C63FF", "#8F94FB", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color="#FFFFFF"
            style={styles.icon}
          />
        )}
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[styles.gradientText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  gradientText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  outlinedButton: {
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#6C63FF",
    backgroundColor: "#F3F0FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  outlinedText: {
    color: "#6C63FF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GradientButton;
