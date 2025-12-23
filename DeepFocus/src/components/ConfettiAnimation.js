import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

/**
 * Simple Confetti Animation Component
 * TODO: Implement full confetti animation with particles
 * For now, just a placeholder for future enhancement
 */
const ConfettiAnimation = ({ visible, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) onComplete();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* TODO: Add actual confetti particles here */}
        {/* Can use react-native-confetti-cannon or custom implementation */}
        <View style={styles.placeholder}>
          {/* Emoji confetti as simple placeholder */}
          {["🎉", "🌟", "✨", "🎊", "🌈"].map((emoji, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.emoji,
                {
                  left: Math.random() * width,
                  top: Math.random() * height * 0.5,
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 100],
                      }),
                    },
                  ],
                },
              ]}
            >
              {emoji}
            </Animated.Text>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
  },
  emoji: {
    position: "absolute",
    fontSize: 32,
  },
});

export default ConfettiAnimation;
