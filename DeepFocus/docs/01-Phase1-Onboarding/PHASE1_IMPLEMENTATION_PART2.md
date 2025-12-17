# PHASE 1 IMPLEMENTATION - PART 2

## AI Analysis & Personalized Plan Screens

---

### 4. AIAnalysisScreen.js (Natural processing with personality)

```jsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { generatePersonalizedPlan } from "../store/actions/userActions";

const { width } = Dimensions.get("window");

const AIAnalysisScreen = ({ route, navigation }) => {
  const { answers } = route.params;
  const dispatch = useDispatch();

  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Natural, conversational phases
  const analysisPhases = [
    {
      text: "Đang tìm hiểu về bạn...",
      emoji: "🤔",
      duration: 1500,
    },
    {
      text: "Phân tích thói quen học tập...",
      emoji: "📊",
      duration: 2000,
    },
    {
      text: "AI đang nghĩ cách tốt nhất...",
      emoji: "🤖",
      duration: 1800,
    },
    {
      text: "Tạo kế hoạch cá nhân hóa...",
      emoji: "✨",
      duration: 2200,
    },
    {
      text: "Gần xong rồi...",
      emoji: "🎯",
      duration: 1500,
    },
  ];

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Run through phases
    let totalTime = 0;
    analysisPhases.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(index);
        setProgress((index + 1) / analysisPhases.length);
      }, totalTime);
      totalTime += phase.duration;
    });

    // Generate plan in background
    setTimeout(() => {
      dispatch(generatePersonalizedPlan(answers))
        .then((plan) => {
          navigation.replace("PersonalizedPlan", { plan });
        })
        .catch((error) => {
          console.error("Error generating plan:", error);
          // Fallback to default plan
          navigation.replace("PersonalizedPlan", {
            plan: getDefaultPlan(answers),
          });
        });
    }, totalTime + 500);
  }, []);

  const getDefaultPlan = (answers) => {
    // Fallback plan based on answers
    const role = answers[1] || "student";
    const goal = answers[2] || "focus_time";
    const currentHours = answers[3] || 2;
    const focusTime = answers[5] || "25-30";
    const targetHours = answers[7] || 15;

    return {
      role,
      goal,
      currentHours,
      focusTime,
      targetHours,
      recommendations: generateRecommendations(answers),
      personality: getPersonality(answers),
    };
  };

  const generateRecommendations = (answers) => {
    const recommendations = [];

    // Smart recommendations based on answers
    const currentHours = answers[3] || 2;
    const targetHours = answers[7] || 15;
    const gap = targetHours - currentHours;

    if (gap > 15) {
      recommendations.push({
        type: "gradual",
        title: "Tăng dần thôi nhé",
        message: `Mục tiêu ${targetHours}h/tuần là tuyệt vời! Nhưng hãy tăng từ từ từ ${currentHours}h hiện tại để cơ thể quen dần.`,
        icon: "🌱",
      });
    }

    const focusLength = answers[5];
    if (focusLength === "15-20") {
      recommendations.push({
        type: "focus_build",
        title: "Xây dựng thời gian tập trung",
        message:
          "Bắt đầu với 15-20 phút rất tốt! Sau vài tuần, thử tăng lên 25 phút nhé.",
        icon: "⏰",
      });
    } else if (focusLength === "60+") {
      recommendations.push({
        type: "break_reminder",
        title: "Đừng quên nghỉ ngơi",
        message:
          "Focus 60+ phút là ấn tượng! Nhưng nhớ nghỉ 10-15 phút để não bộ xử lý thông tin.",
        icon: "☕",
      });
    }

    const methods = answers[6] || [];
    if (methods.includes("none")) {
      recommendations.push({
        type: "method_intro",
        title: "Khám phá Pomodoro",
        message:
          "Pomodoro sẽ giúp bạn học hiệu quả hơn rất nhiều. Hãy thử nhé!",
        icon: "🍅",
      });
    }

    return recommendations;
  };

  const getPersonality = (answers) => {
    // Assign AI coach personality based on user profile
    const role = answers[1];
    const goal = answers[2];

    if (role === "student" && goal === "exam_prep") {
      return {
        name: "Coach Mai",
        style: "encouraging",
        trait: "Động viên nhiệt tình, hiểu được áp lực thi cử",
      };
    } else if (goal === "build_habit") {
      return {
        name: "Coach Tú",
        style: "patient",
        trait: "Kiên nhẫn, tập trung vào tiến bộ dài hạn",
      };
    } else if (goal === "complete_tasks") {
      return {
        name: "Coach Huy",
        style: "results_driven",
        trait: "Hướng đến kết quả, thích thử thách",
      };
    } else {
      return {
        name: "Coach An",
        style: "balanced",
        trait: "Cân bằng, linh hoạt, dễ gần",
      };
    }
  };

  const currentAnalysis = analysisPhases[currentPhase];

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../assets/animations/ai-thinking.json")}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        {/* Phase Indicator */}
        <View style={styles.phaseContainer}>
          <Text style={styles.phaseEmoji}>{currentAnalysis?.emoji}</Text>
          <Text style={styles.phaseText}>{currentAnalysis?.text}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>

        {/* Fun fact */}
        <View style={styles.funFactBox}>
          <Text style={styles.funFactLabel}>💡 Bạn có biết?</Text>
          <Text style={styles.funFactText}>{getFunFact(currentPhase)}</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

// Random fun facts for different phases
const getFunFact = (phase) => {
  const facts = [
    "Não bộ chỉ chiếm 2% trọng lượng cơ thể nhưng tiêu thụ 20% năng lượng!",
    "Pomodoro được đặt tên từ cái đồng hồ hình quả cà chua của người sáng lập.",
    "Nghỉ giải lao 5 phút giúp não xử lý và ghi nhớ thông tin tốt hơn.",
    "Học 25 phút rồi nghỉ hiệu quả hơn học 2 tiếng liên tục.",
    "DeepFocus đã giúp hơn 10,000 học sinh học tập hiệu quả hơn!",
  ];
  return facts[phase % facts.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: width * 0.85,
    alignItems: "center",
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  phaseContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  phaseEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  phaseText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  progressBarContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 32,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  funFactBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  funFactLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  funFactText: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 22,
    opacity: 0.9,
  },
});

export default AIAnalysisScreen;
```

---

### 5. PersonalizedPlanScreen.js (Reveal with celebration)

```jsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useDispatch } from "react-redux";
import { savePlanToProfile } from "../store/actions/userActions";

const { width } = Dimensions.get("window");

const PersonalizedPlanScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const dispatch = useDispatch();

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

  const handleStartJourney = () => {
    dispatch(savePlanToProfile(plan));
    navigation.navigate("MainApp");
  };

  const getPlanSummary = () => {
    const { role, goal, currentHours, targetHours, focusTime } = plan;

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
          source={require("../assets/animations/confetti.json")}
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

// Get personalized coach message
const getCoachIntroMessage = (plan) => {
  const { personality, goal, targetHours } = plan;

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
```

---

_Tiếp tục với Redux actions, assets và installation guide..._
