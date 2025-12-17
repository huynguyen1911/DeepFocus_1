# PHASE 1 IMPLEMENTATION: ONBOARDING & ASSESSMENT

## Natural, Human-Centered Design

---

## 📱 SCREEN IMPLEMENTATIONS

### 1. WelcomeScreen.js

```jsx
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
          source={require("../assets/animations/focus-study.json")}
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
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.title}>DeepFocus</Text>
        </View>

        <Text style={styles.subtitle}>
          Học tập hiệu quả hơn{"\n"}
          với AI Pomodoro Coach
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

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
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
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    color: "#FFFFFF",
    opacity: 0.7,
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
```

---

### 2. AssessmentIntroScreen.js

```jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AssessmentIntroScreen = ({ navigation }) => {
  const steps = [
    {
      icon: "account-circle",
      title: "Về bạn",
      desc: "Vai trò và mục tiêu của bạn",
    },
    {
      icon: "clock-outline",
      title: "Thói quen",
      desc: "Thời gian học hiện tại",
    },
    {
      icon: "brain",
      title: "Phong cách",
      desc: "Cách bạn tập trung tốt nhất",
    },
    {
      icon: "target",
      title: "Mục tiêu",
      desc: "Điều bạn muốn đạt được",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hãy cho tôi biết về bạn! 👋</Text>
          <Text style={styles.headerSubtitle}>
            Để tạo kế hoạch học phù hợp nhất, tôi cần hiểu một chút về bạn thôi
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <MaterialCommunityIcons
                  name={step.icon}
                  size={32}
                  color="#667eea"
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
              {index < steps.length - 1 && (
                <View style={styles.stepConnector} />
              )}
            </View>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color="#10b981"
          />
          <Text style={styles.infoText}>
            Thông tin của bạn được bảo mật và chỉ dùng để cá nhân hóa trải
            nghiệm
          </Text>
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("Assessment", { step: 1 })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Text style={styles.startText}>Bắt đầu thôi!</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Để sau vậy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  stepConnector: {
    position: "absolute",
    left: 48,
    bottom: -16,
    width: 2,
    height: 16,
    backgroundColor: "#E5E7EB",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  infoText: {
    fontSize: 13,
    color: "#065F46",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
    marginBottom: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  startGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
    color: "#6B7280",
  },
});

export default AssessmentIntroScreen;
```

---

### 3. AssessmentScreen.js (Multi-step with natural content)

```jsx
import React, { useState } from "react";
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
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

const AssessmentScreen = ({ route, navigation }) => {
  const { step: initialStep } = route.params;
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [answers, setAnswers] = useState({});
  const [slideAnim] = useState(new Animated.Value(0));

  const totalSteps = 7;

  // Natural, conversational questions
  const questions = [
    {
      id: 1,
      type: "single",
      question: "Trước tiên, bạn là ai?",
      subtitle: "Để tôi biết nên gọi bạn là gì 😊",
      options: [
        {
          id: "student",
          icon: "🎓",
          label: "Học sinh/Sinh viên",
          desc: "Đang học phổ thông hoặc đại học",
        },
        {
          id: "teacher",
          icon: "👨‍🏫",
          label: "Giáo viên",
          desc: "Muốn giúp học sinh của mình",
        },
        {
          id: "guardian",
          icon: "👨‍👩‍👧",
          label: "Phụ huynh",
          desc: "Theo dõi con em học tập",
        },
        {
          id: "other",
          icon: "💼",
          label: "Người đi làm",
          desc: "Muốn tăng năng suất công việc",
        },
      ],
    },
    {
      id: 2,
      type: "single",
      question: "Điều gì khiến bạn đến với DeepFocus?",
      subtitle: "Mục tiêu chính của bạn là gì nhỉ?",
      options: [
        {
          id: "focus_time",
          icon: "⏰",
          label: "Tăng thời gian tập trung",
          desc: "Muốn học/làm lâu hơn mỗi ngày",
        },
        {
          id: "time_management",
          icon: "📅",
          label: "Quản lý thời gian tốt hơn",
          desc: "Sắp xếp công việc hiệu quả",
        },
        {
          id: "complete_tasks",
          icon: "✅",
          label: "Hoàn thành nhiều việc hơn",
          desc: "Tăng năng suất hàng ngày",
        },
        {
          id: "build_habit",
          icon: "🎯",
          label: "Xây dựng thói quen tốt",
          desc: "Học/làm đều đặn mỗi ngày",
        },
        {
          id: "exam_prep",
          icon: "📚",
          label: "Chuẩn bị thi cử",
          desc: "Có kỳ thi quan trọng sắp tới",
        },
      ],
    },
    {
      id: 3,
      type: "slider",
      question: "Hiện tại bạn học/làm bao lâu mỗi ngày?",
      subtitle: "Trung bình thôi, không cần chính xác đâu",
      min: 0,
      max: 12,
      step: 0.5,
      unit: "giờ",
      defaultValue: 2,
      labels: {
        0: "0h",
        3: "3h",
        6: "6h",
        9: "9h",
        12: "12h+",
      },
      emoji: "⏱️",
    },
    {
      id: 4,
      type: "multiple",
      question: "Khi nào bạn tập trung tốt nhất?",
      subtitle: "Chọn tất cả thời điểm phù hợp (có thể nhiều đáp án)",
      options: [
        {
          id: "early_morning",
          icon: "🌅",
          label: "Sáng sớm",
          time: "5-8h",
        },
        {
          id: "morning",
          icon: "☀️",
          label: "Buổi sáng",
          time: "8-12h",
        },
        {
          id: "afternoon",
          icon: "🌤️",
          label: "Buổi chiều",
          time: "13-17h",
        },
        {
          id: "evening",
          icon: "🌆",
          label: "Buổi tối",
          time: "18-22h",
        },
        {
          id: "night",
          icon: "🌙",
          label: "Đêm muộn",
          time: "22h+",
        },
        {
          id: "anytime",
          icon: "🤷",
          label: "Bất kỳ lúc nào",
          time: "Linh hoạt",
        },
      ],
    },
    {
      id: 5,
      type: "single",
      question: "Bạn có thể tập trung liên tục trong bao lâu?",
      subtitle: "Trước khi cần nghỉ ngơi/chuyển đổi",
      options: [
        {
          id: "15-20",
          icon: "⚡",
          label: "15-20 phút",
          desc: "Ngắn và nhanh",
        },
        {
          id: "25-30",
          icon: "🍅",
          label: "25-30 phút",
          desc: "Pomodoro chuẩn",
          recommended: true,
        },
        {
          id: "45-60",
          icon: "💪",
          label: "45-60 phút",
          desc: "Deep work",
        },
        {
          id: "60+",
          icon: "🚀",
          label: "Hơn 60 phút",
          desc: "Ultra focus mode",
        },
      ],
    },
    {
      id: 6,
      type: "multiple",
      question: "Bạn đang dùng phương pháp gì để học/làm?",
      subtitle: "Chia sẻ để tôi hiểu bạn hơn",
      options: [
        {
          id: "pomodoro",
          icon: "🍅",
          label: "Pomodoro",
          desc: "25 phút focus, 5 phút break",
        },
        {
          id: "time_blocking",
          icon: "📅",
          label: "Time blocking",
          desc: "Chia thời gian theo khối",
        },
        {
          id: "todo_list",
          icon: "📝",
          label: "To-do lists",
          desc: "Danh sách công việc",
        },
        {
          id: "eisenhower",
          icon: "🎯",
          label: "Ma trận Eisenhower",
          desc: "Ưu tiên theo tầm quan trọng",
        },
        {
          id: "none",
          icon: "🤷",
          label: "Chưa có phương pháp",
          desc: "Làm tự nhiên thôi",
        },
      ],
    },
    {
      id: 7,
      type: "slider",
      question: "Bạn muốn dành bao nhiêu thời gian với DeepFocus?",
      subtitle: "Mỗi tuần, để đạt được mục tiêu của bạn",
      min: 3,
      max: 40,
      step: 1,
      unit: "giờ/tuần",
      defaultValue: 15,
      labels: {
        3: "3h",
        10: "10h",
        20: "20h",
        30: "30h",
        40: "40h+",
      },
      emoji: "🎯",
      notes: {
        5: "Nhẹ nhàng thôi",
        15: "Vừa phải, tốt đấy",
        25: "Nghiêm túc rồi đó!",
        35: "Wow, quyết tâm quá!",
      },
    },
  ];

  const currentQuestion = questions.find((q) => q.id === currentStep);

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentStep]: value });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(0);
      });
    } else {
      // Go to analysis
      navigation.navigate("AIAnalysis", { answers });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = () => {
    return answers[currentStep] !== undefined && answers[currentStep] !== null;
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "single":
        return (
          <SingleChoice
            question={currentQuestion}
            onSelect={handleAnswer}
            selected={answers[currentStep]}
          />
        );
      case "multiple":
        return (
          <MultipleChoice
            question={currentQuestion}
            onSelect={handleAnswer}
            selected={answers[currentStep] || []}
          />
        );
      case "slider":
        return (
          <SliderQuestion
            question={currentQuestion}
            onSelect={handleAnswer}
            value={answers[currentStep]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          {[...Array(totalSteps)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index < currentStep && styles.progressDotActive,
                index === currentStep - 1 && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          Câu {currentStep}/{totalSteps}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.subtitle && (
            <Text style={styles.questionSubtitle}>
              {currentQuestion.subtitle}
            </Text>
          )}
        </View>

        {/* Answer Options */}
        <Animated.View
          style={{
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          }}
        >
          {renderQuestion()}
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#6B7280"
            />
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                canProceed() ? ["#667eea", "#764ba2"] : ["#D1D5DB", "#9CA3AF"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextBtnText}>
                {currentStep === totalSteps ? "Xong rồi!" : "Tiếp theo"}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Single Choice Component
const SingleChoice = ({ question, onSelect, selected }) => {
  return (
    <View style={styles.optionsContainer}>
      {question.options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionCard,
            selected === option.id && styles.optionCardSelected,
          ]}
          onPress={() => onSelect(option.id)}
          activeOpacity={0.7}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>{option.icon}</Text>
          </View>
          <View style={styles.optionContent}>
            <View style={styles.optionHeader}>
              <Text
                style={[
                  styles.optionLabel,
                  selected === option.id && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Phổ biến</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionDesc}>{option.desc || option.time}</Text>
          </View>
          {selected === option.id && (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#667eea"
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Multiple Choice Component
const MultipleChoice = ({ question, onSelect, selected }) => {
  const handleToggle = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    onSelect(newSelected);
  };

  return (
    <View style={styles.optionsContainer}>
      {question.options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => handleToggle(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>{option.icon}</Text>
            </View>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDesc}>
                {option.desc || option.time}
              </Text>
            </View>
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && (
                <MaterialCommunityIcons name="check" size={18} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Slider Component
const SliderQuestion = ({ question, onSelect, value }) => {
  const [currentValue, setCurrentValue] = useState(
    value || question.defaultValue
  );

  const handleChange = (val) => {
    setCurrentValue(val);
    onSelect(val);
  };

  const getNote = () => {
    if (!question.notes) return null;
    const noteKeys = Object.keys(question.notes)
      .map(Number)
      .sort((a, b) => a - b);
    for (let i = noteKeys.length - 1; i >= 0; i--) {
      if (currentValue >= noteKeys[i]) {
        return question.notes[noteKeys[i]];
      }
    }
    return null;
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderValueBox}>
        <Text style={styles.sliderEmoji}>{question.emoji}</Text>
        <View>
          <Text style={styles.sliderValue}>
            {currentValue.toFixed(question.step >= 1 ? 0 : 1)}
          </Text>
          <Text style={styles.sliderUnit}>{question.unit}</Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={question.min}
        maximumValue={question.max}
        step={question.step}
        value={currentValue}
        onValueChange={handleChange}
        minimumTrackTintColor="#667eea"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#667eea"
      />

      <View style={styles.sliderLabels}>
        {Object.entries(question.labels).map(([key, label]) => (
          <Text key={key} style={styles.sliderLabel}>
            {label}
          </Text>
        ))}
      </View>

      {getNote() && (
        <View style={styles.sliderNote}>
          <Text style={styles.sliderNoteText}>💭 {getNote()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "#667eea",
  },
  progressDotCurrent: {
    width: 24,
    backgroundColor: "#667eea",
  },
  progressText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  scrollContent: {
    padding: 24,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: "#667eea",
    backgroundColor: "#F5F7FF",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  optionLabelSelected: {
    color: "#667eea",
  },
  recommendedBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
  },
  optionDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  sliderValueBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  sliderEmoji: {
    fontSize: 40,
  },
  sliderValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#667eea",
    lineHeight: 52,
  },
  sliderUnit: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  sliderNote: {
    marginTop: 24,
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#667eea",
  },
  sliderNoteText: {
    fontSize: 14,
    color: "#4338CA",
    lineHeight: 20,
  },
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  nextBtn: {
    flex: 2,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextGradient: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AssessmentScreen;
```

---

_Tiếp tục với AIAnalysisScreen và PersonalizedPlanScreen trong file tiếp theo..._
