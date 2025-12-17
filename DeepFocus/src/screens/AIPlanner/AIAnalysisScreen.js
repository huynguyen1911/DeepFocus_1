import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const AIAnalysisScreen = ({ route, navigation }) => {
  const { answers } = route.params;

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

    // Generate plan and navigate
    setTimeout(() => {
      const plan = generatePlanFromAnswers(answers);
      navigation.replace("PersonalizedPlan", { plan });
    }, totalTime + 500);
  }, []);

  const generatePlanFromAnswers = (answers) => {
    const role = answers[1] || "student";
    const goal = answers[2] || "focus_time";
    const currentHours = answers[3] || 2;
    const focusTime = answers[5] || "25-30";
    const targetHours = answers[7] || 15;

    // Generate recommendations
    const recommendations = [];

    const gap = targetHours - currentHours;
    if (gap > 15) {
      recommendations.push({
        type: "gradual",
        title: "Tăng dần thôi nhé",
        message: `Mục tiêu ${targetHours}h/tuần là tuyệt vời! Nhưng hãy tăng từ từ từ ${currentHours}h hiện tại để cơ thể quen dần.`,
        icon: "🌱",
      });
    }

    if (focusTime === "15-20") {
      recommendations.push({
        type: "focus_build",
        title: "Xây dựng thời gian tập trung",
        message:
          "Bắt đầu với 15-20 phút rất tốt! Sau vài tuần, thử tăng lên 25 phút nhé.",
        icon: "⏰",
      });
    } else if (focusTime === "60+") {
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

    // Assign personality
    let personality;
    if (role === "student" && goal === "exam_prep") {
      personality = {
        name: "Coach Mai",
        style: "encouraging",
        trait: "Động viên nhiệt tình, hiểu được áp lực thi cử",
      };
    } else if (goal === "build_habit") {
      personality = {
        name: "Coach Tú",
        style: "patient",
        trait: "Kiên nhẫn, tập trung vào tiến bộ dài hạn",
      };
    } else if (goal === "complete_tasks") {
      personality = {
        name: "Coach Huy",
        style: "results_driven",
        trait: "Hướng đến kết quả, thích thử thách",
      };
    } else {
      personality = {
        name: "Coach An",
        style: "balanced",
        trait: "Cân bằng, linh hoạt, dễ gần",
      };
    }

    return {
      role,
      goal,
      currentHours,
      focusTime,
      targetHours,
      recommendations,
      personality,
      createdAt: new Date().toISOString(),
    };
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
            source={require("../../assets/animations/ai-thinking.json")}
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
