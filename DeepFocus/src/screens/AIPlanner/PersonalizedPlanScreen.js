import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const PersonalizedPlanScreen = ({ route, navigation }) => {
  const { plan } = route.params;

  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(
    [...Array(4)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Celebration animation
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Stagger card animations
      Animated.stagger(
        150,
        cardsAnim.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
          })
        )
      ).start();
    });
  }, []);

  const handleStartJourney = async () => {
    try {
      // Save personalized plan to AsyncStorage
      await AsyncStorage.setItem("aiPlan", JSON.stringify(plan));

      Alert.alert(
        "Kế hoạch đã được lưu! 🎉",
        "Bạn có thể xem lại kế hoạch này bất cứ lúc nào trong tab AI Planner.",
        [
          {
            text: "OK",
            onPress: () => {
              // Go back to AI Planner home (Welcome screen)
              navigation.navigate("Welcome");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving AI plan:", error);
      Alert.alert("Lỗi", "Không thể lưu kế hoạch. Vui lòng thử lại.");
    }
  };

  const getPlanSummary = () => {
    const { role, goal, currentHours, targetHours } = plan;

    let summary = "";
    if (role === "student") {
      summary = "Là học sinh/sinh viên";
    } else if (role === "teacher") {
      summary = "Là giáo viên";
    } else if (role === "guardian") {
      summary = "Là phụ huynh";
    } else {
      summary = "Là người đi làm";
    }

    const goalText = getGoalText(goal);
    summary += `, muốn ${goalText.toLowerCase()}`;

    return summary;
  };

  const getGoalText = (goal) => {
    switch (goal) {
      case "focus_time":
        return "Tăng thời gian tập trung";
      case "time_management":
        return "Quản lý thời gian tốt hơn";
      case "complete_tasks":
        return "Hoàn thành nhiều việc hơn";
      case "build_habit":
        return "Xây dựng thói quen tốt";
      case "exam_prep":
        return "Chuẩn bị thi cử";
      default:
        return "Học tập hiệu quả";
    }
  };

  const getFocusTimeText = (focusTime) => {
    switch (focusTime) {
      case "15-20":
        return "15-20 phút";
      case "25-30":
        return "25 phút (Pomodoro chuẩn)";
      case "45-60":
        return "45-60 phút (Deep Work)";
      case "60+":
        return "60+ phút (Ultra Focus)";
      default:
        return "25 phút";
    }
  };

  const getCoachIntroMessage = (plan) => {
    const { personality, targetHours } = plan;

    if (personality.style === "encouraging") {
      return `Chào bạn! Mình là ${personality.name}. Mình sẽ cùng bạn chinh phục mục tiêu ${targetHours}h/tuần nhé! Tin mình đi, bạn làm được mà!`;
    } else if (personality.style === "patient") {
      return `Xin chào! Mình là ${personality.name}. Xây dựng thói quen tốt cần thời gian, và mình sẽ đồng hành cùng bạn từng bước một.`;
    } else if (personality.style === "results_driven") {
      return `Hey! ${personality.name} đây. Mục tiêu ${targetHours}h/tuần à? Challenge accepted! Cùng làm thật nhiều việc nhé!`;
    } else {
      return `Chào bạn! Mình là ${personality.name}. Rất vui được đồng hành cùng bạn trên hành trình học tập này!`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Confetti Animation */}
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
          },
        ]}
        pointerEvents="none"
      >
        <LottieView
          source={require("../../assets/animations/confetti.json")}
          autoPlay
          loop={false}
          style={styles.confettiAnimation}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.headerTitle}>Kế hoạch của bạn đây!</Text>
          <Text style={styles.headerSubtitle}>
            Được thiết kế riêng dựa trên thói quen và mục tiêu của bạn
          </Text>
        </Animated.View>

        {/* Quick Summary */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: cardsAnim[0],
              transform: [{ scale: cardsAnim[0] }],
            },
          ]}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <Text style={styles.summaryTitle}>Tóm tắt về bạn</Text>
            <Text style={styles.summaryText}>{getPlanSummary()}</Text>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.currentHours}h</Text>
                <Text style={styles.statLabel}>Hiện tại</Text>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color="#FFF"
              />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.targetHours}h</Text>
                <Text style={styles.statLabel}>Mục tiêu</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Your Coach */}
        <Animated.View
          style={[
            styles.coachCard,
            {
              opacity: cardsAnim[1],
              transform: [{ scale: cardsAnim[1] }],
            },
          ]}
        >
          <View style={styles.coachHeader}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>🤖</Text>
            </View>
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{plan.personality.name}</Text>
              <Text style={styles.coachTrait}>{plan.personality.trait}</Text>
            </View>
          </View>
          <View style={styles.coachMessage}>
            <Text style={styles.coachMessageText}>
              "{getCoachIntroMessage(plan)}"
            </Text>
          </View>
        </Animated.View>

        {/* Recommended Focus Time */}
        <Animated.View
          style={[
            styles.focusCard,
            {
              opacity: cardsAnim[2],
              transform: [{ scale: cardsAnim[2] }],
            },
          ]}
        >
          <View style={styles.focusHeader}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={32}
              color="#667eea"
            />
            <Text style={styles.focusTitle}>Thời gian tập trung đề xuất</Text>
          </View>
          <View style={styles.focusTimeBox}>
            <Text style={styles.focusTimeValue}>
              {getFocusTimeText(plan.focusTime)}
            </Text>
          </View>
          <Text style={styles.focusDesc}>
            Dựa trên thói quen hiện tại của bạn, đây là khoảng thời gian tối ưu
            để bắt đầu
          </Text>
        </Animated.View>

        {/* Recommendations */}
        {plan.recommendations && plan.recommendations.length > 0 && (
          <Animated.View
            style={[
              styles.recommendationsSection,
              {
                opacity: cardsAnim[3],
                transform: [{ scale: cardsAnim[3] }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>💡 Gợi ý cho bạn</Text>
            {plan.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Text style={styles.recIcon}>{rec.icon}</Text>
                <View style={styles.recContent}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recMessage}>{rec.message}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>🚀 Bước tiếp theo</Text>
          <View style={styles.stepsList}>
            <StepItem number="1" text="Tạo tài khoản để lưu tiến độ" />
            <StepItem number="2" text="Thêm nhiệm vụ đầu tiên của bạn" />
            <StepItem number="3" text="Bắt đầu phiên Pomodoro đầu tiên" />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartJourney}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#F093FB", "#F5576C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Text style={styles.startText}>Bắt đầu hành trình! 🎯</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper component
const StepItem = ({ number, text }) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confettiAnimation: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  summaryCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    opacity: 0.9,
  },
  summaryText: {
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 28,
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  coachCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coachHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  coachAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  coachAvatarText: {
    fontSize: 28,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  coachTrait: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  coachMessage: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#667eea",
  },
  coachMessageText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    fontStyle: "italic",
  },
  focusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 12,
    flex: 1,
  },
  focusTimeBox: {
    backgroundColor: "#EEF2FF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#667eea",
  },
  focusTimeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#667eea",
  },
  focusDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  recMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  nextStepsCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#78350F",
    marginBottom: 20,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FCD34D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#78350F",
  },
  stepText: {
    fontSize: 15,
    color: "#78350F",
    flex: 1,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  startButton: {
    width: "100%",
    shadowColor: "#F5576C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  startText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default PersonalizedPlanScreen;
