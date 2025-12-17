import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Illustration */}
      <Animated.View
        style={[styles.illustrationContainer, { opacity: fadeAnim }]}
      >
        <LottieView
          source={require("../../assets/animations/focus-study.json")}
          autoPlay
          loop
          style={styles.illustration}
        />
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>AI Planner</Text>
        </View>

        <Text style={styles.subtitle}>
          Để AI tạo kế hoạch tập trung{"\n"}
          dành riêng cho bạn!
        </Text>

        <View style={styles.featureBox}>
          <Text style={styles.featureText}>
            ✨ Kế hoạch cá nhân hóa dựa trên thói quen của bạn
          </Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate("AssessmentIntro")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#F093FB", "#F5576C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Bắt Đầu Đánh Giá</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.timeNote}>
          <Text style={styles.timeNoteText}>⏱️ Chỉ mất 2-3 phút thôi</Text>
        </View>

        <View style={styles.premiumNote}>
          <Text style={styles.premiumText}>
            🎁 Miễn phí trong thời gian thử nghiệm
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 26,
    opacity: 0.95,
  },
  featureBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureText: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  ctaButton: {
    width: "100%",
    marginBottom: 16,
    shadowColor: "#F5576C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  timeNote: {
    marginBottom: 24,
  },
  timeNoteText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  premiumNote: {
    marginTop: 12,
  },
  premiumText: {
    fontSize: 13,
    color: "#FFD700",
    opacity: 0.9,
  },
});

export default WelcomeScreen;
