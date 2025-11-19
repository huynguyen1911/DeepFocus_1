import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Portal } from "react-native-paper";

/**
 * Loading Overlay Component
 * Shows a full-screen loading indicator with optional message
 *
 * @param {boolean} visible - Show/hide overlay
 * @param {string} message - Loading message to display
 */
const LoadingOverlay = ({ visible, message = "Đang tải..." }) => {
  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FF5252" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#2D3748",
    textAlign: "center",
  },
});

export default LoadingOverlay;
