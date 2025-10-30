import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

/**
 * Component that shows offline indicator when network is unavailable
 * Displays at the bottom of the screen
 */
const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // Show offline indicator
      setVisible(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Coming back online - show brief "back online" message
      setVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setWasOffline(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const getMessage = () => {
    if (!isOnline) {
      return "📡 Chế độ Offline - Dữ liệu sẽ đồng bộ khi có mạng";
    }
    return "✅ Đã kết nối lại - Đang đồng bộ dữ liệu...";
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={() => {
        if (isOnline) {
          setVisible(false);
          setWasOffline(false);
        }
      }}
      duration={isOnline ? 3000 : Snackbar.DURATION_INDEFINITE}
      style={[
        styles.snackbar,
        { backgroundColor: isOnline ? "#4CAF50" : "#FF9800" },
      ]}
      action={
        !isOnline
          ? undefined
          : {
              label: "OK",
              onPress: () => {
                setVisible(false);
                setWasOffline(false);
              },
            }
      }
    >
      <Text style={styles.text}>{getMessage()}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  text: {
    color: "white",
    fontWeight: "500",
  },
});

export default OfflineIndicator;
