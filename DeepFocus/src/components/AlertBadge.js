import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

/**
 * AlertBadge Component - Display unread alert count
 * Phase 3 Frontend Session 2
 */
const AlertBadge = ({ count = 0, size = "medium" }) => {
  // Don't show badge if count is 0
  if (!count || count <= 0) {
    return null;
  }

  // Limit display to 99+
  const displayCount = count > 99 ? "99+" : count.toString();

  // Get size values
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: { width: 16, height: 16, minWidth: 16 },
          text: { fontSize: 9 },
        };
      case "large":
        return {
          container: { width: 24, height: 24, minWidth: 24 },
          text: { fontSize: 12 },
        };
      default: // medium
        return {
          container: { width: 20, height: 20, minWidth: 20 },
          text: { fontSize: 10 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.badge, sizeStyles.container]}>
      <Text style={[styles.badgeText, sizeStyles.text]} numberOfLines={1}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#F44336",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AlertBadge;
