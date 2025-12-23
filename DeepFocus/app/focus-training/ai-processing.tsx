// @ts-nocheck
/**
 * AI Processing Screen - The Magic Moment
 * Full-screen loading with animation and step-by-step progress
 * With Background Processing option
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeOutUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';
import { useFocusTraining } from '@/src/contexts/FocusTrainingContext';
import { getTipSequence } from '@/constants/focusTips';

const { width, height } = Dimensions.get('window');

const PROCESSING_STEPS = [
  "Đang tổng hợp câu trả lời của bạn...",
  "Đang phân tích thói quen mất tập trung...",
  "Đang đánh giá năng lực tập trung...",
  "Đang thiết kế lộ trình Deep Work...",
  "Đang cá nhân hóa lịch trình...",
  "Đang hoàn thiện kế hoạch của bạn..."
];

export default function AIProcessingScreen() {
  const router = useRouter();
  const { navigateAwayFromGeneration } = useFocusTraining();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tips] = useState(getTipSequence(5)); // Get 5 random tips
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Pulse animation for the brain icon
    pulseScale.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Change step every 2 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Rotate tips every 5 seconds
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const handleGoHome = () => {
    // Mark as background processing
    navigateAwayFromGeneration();
    // Navigate to focus training home (dashboard)
    router.replace('/focus-training');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Brain Animation */}
        <Animated.View style={[styles.animationContainer, animatedStyle]}>
          <LottieView
            source={require("../../assets/animations/ai-thinking.json")}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </Animated.View>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>🤖 AI đang phân tích</Text>
          <Text style={styles.subtitle}>Đang tạo hồ sơ năng lực cho bạn</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {PROCESSING_STEPS.map((step, index) => (
            <Animated.View
              key={index}
              entering={index === currentStep ? FadeInDown.duration(500) : undefined}
              exiting={index === currentStep - 1 ? FadeOutUp.duration(300) : undefined}
              style={[
                styles.stepItem,
                {
                  opacity: index === currentStep ? 1 : 0.3,
                  display: Math.abs(index - currentStep) <= 1 ? 'flex' : 'none'
                }
              ]}
            >
              <View style={styles.stepDot}>
                {index === currentStep && (
                  <View style={styles.stepDotActive} />
                )}
              </View>
              <Text style={[
                styles.stepText,
                index === currentStep && styles.stepTextActive
              ]}>
                {step}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Loading Bar */}
        <View style={styles.loadingBarContainer}>
          <View style={styles.loadingBarBackground}>
            <Animated.View
              style={[
                styles.loadingBarFill,
                {
                  width: `${((currentStep + 1) / PROCESSING_STEPS.length) * 100}%`
                }
              ]}
            >
              <LinearGradient
                colors={["#F093FB", "#F5576C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loadingBarGradient}
              />
            </Animated.View>
          </View>
          <Text style={styles.percentageText}>
            {Math.round(((currentStep + 1) / PROCESSING_STEPS.length) * 100)}%
          </Text>
        </View>

        {/* Focus Tips Carousel */}
        <Animated.View 
          key={currentTipIndex}
          entering={FadeInDown.duration(600)}
          exiting={FadeOutUp.duration(400)}
          style={styles.tipCarousel}
        >
          <Text style={styles.tipIcon}>{tips[currentTipIndex]?.icon}</Text>
          <Text style={styles.tipText}>
            💡 Mẹo: {tips[currentTipIndex]?.text}
          </Text>
        </Animated.View>

        {/* Background Processing Button */}
        <TouchableOpacity 
          style={styles.backgroundButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.backgroundButtonText}>
            🏠 Về trang chủ & Báo khi xong
          </Text>
          <Text style={styles.backgroundButtonSubtext}>
            AI sẽ tiếp tục xử lý nền, bạn có thể sử dụng app bình thường
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
    paddingBottom: 100,
  },
  animationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 40,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    minHeight: 80,
    marginBottom: 40,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  stepText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  stepTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingBarGradient: {
    flex: 1,
  },
  percentageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  tipCarousel: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  backgroundButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  backgroundButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  backgroundButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
