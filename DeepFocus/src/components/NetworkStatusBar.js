import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import NetInfo from "@react-native-community/netinfo";

/**
 * Network Status Bar Component
 * Shows connection status at top of screen
 */
const NetworkStatusBar = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBar, setShowBar] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected;
      setIsConnected(connected);

      if (!connected) {
        // Show offline bar immediately
        setShowBar(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else if (showBar) {
        // Show "back online" briefly, then hide
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();

        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowBar(false);
          });
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [showBar]);

  if (!showBar) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        isConnected ? styles.online : styles.offline,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.text}>
        {isConnected ? "✓ Đã kết nối" : "⚠️ Không có kết nối internet"}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  offline: {
    backgroundColor: "#FF5252",
  },
  online: {
    backgroundColor: "#4CAF50",
  },
  text: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default NetworkStatusBar;
