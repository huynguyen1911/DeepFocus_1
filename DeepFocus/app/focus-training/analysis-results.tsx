// @ts-nocheck
/**
 * Analysis Results Screen - The Analysis Dashboard
 * Visual presentation of AI analysis with cards and charts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  BackHandler,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import focusTrainingApi from '../../src/services/focusTrainingApi';
import LottieView from 'lottie-react-native';
import { useFocusTraining } from '../../src/contexts/FocusTrainingContext';import { getTipSequence } from '@/constants/focusTips';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
const { width } = Dimensions.get('window');

export default function AnalysisResultsScreen() {
  const params = useLocalSearchParams();
  const { completePlanGeneration, navigateAwayFromGeneration } = useFocusTraining();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tips] = useState(getTipSequence(5));
  
  // Parse data from params
  const analysisData = params.analysis ? JSON.parse(params.analysis) : null;
  const assessmentId = params.assessmentId;
  const focusScore = analysisData?.focusScore || 5;
  const strengths = analysisData?.strengths || [];
  const challenges = analysisData?.challenges || [];
  const recommendations = analysisData?.recommendations || [];

  // Calculate gauge chart values
  const maxScore = 10;
  const scorePercentage = (focusScore / maxScore) * 100;
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 7) return '#10b981'; // Green
    if (score >= 4) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 7) return 'Tốt - Tiếp tục phát huy';
    if (score >= 4) return 'Trung bình - Có tiềm năng lớn';
    return 'Cần cải thiện - Đừng lo, chúng tôi sẽ giúp bạn';
  };

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isGenerating, tips.length]);

  const handleGoHome = () => {
    navigateAwayFromGeneration();
    // Navigate to Home tab (first tab in tab navigator)
    router.replace('/(tabs)');
  };

  const scoreColor = getScoreColor(focusScore);

  // Block back button when generating plan
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isGenerating) {
          // Prevent back navigation when generating
          Alert.alert(
            'Đang tạo kế hoạch',
            'Vui lòng đợi kế hoạch được tạo xong.',
            [{ text: 'OK' }]
          );
          return true; // Block back
        }
        return false; // Allow back
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [isGenerating])
  );

  const handleCreatePlan = async () => {
    try {
      setIsGenerating(true);

      const response = await focusTrainingApi.generatePlan({
        assessmentId,
        startDate: new Date().toISOString().split('T')[0]
      });

      const planData = response.plan;

      // Complete plan generation in Context (unlocks navigation)
      await completePlanGeneration(planData);

      // Navigate to Plan Success screen with celebration
      router.replace({
        pathname: '/focus-training/plan-success',
        params: {
          assessmentId,
          duration: `${planData.duration} tuần`,
          level: 'Người mới bắt đầu',
          dailyGoal: '25 phút Pomodoro',
          totalSessions: planData.duration * 7
        }
      });
    } catch (error: any) {
      console.error('Plan generation error:', error);
      
      if (error.message?.includes('already have an active')) {
        Alert.alert(
          'Đã có kế hoạch',
          'Bạn đã có một kế hoạch tập luyện đang hoạt động.',
          [
            {
              text: 'Về Dashboard',
              onPress: () => router.replace('/focus-training')
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể tạo kế hoạch. Vui lòng thử lại.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.backButton, isGenerating && styles.backButtonDisabled]}
              onPress={() => {
                if (isGenerating) {
                  Alert.alert(
                    'Đang tạo kế hoạch',
                    'Vui lòng đợi kế hoạch được tạo xong.',
                    [{ text: 'OK' }]
                  );
                } else {
                  router.back();
                }
              }}
              disabled={isGenerating}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ năng lực của bạn</Text>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Gauge Chart */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Điểm tập trung hiện tại</Text>
          
          {/* Circular Gauge */}
          <View style={styles.gaugeContainer}>
            <Svg width={180} height={180}>
              {/* Background circle */}
              <Circle
                cx="90"
                cy="90"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx="90"
                cy="90"
                r="70"
                stroke={scoreColor}
                strokeWidth="16"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            </Svg>
            <View style={styles.scoreCenter}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {focusScore.toFixed(1)}
              </Text>
              <Text style={styles.scoreMax}>/ {maxScore}</Text>
            </View>
          </View>

          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {getScoreLabel(focusScore)}
          </Text>
        </View>

        {/* Analysis Cards */}
        <View style={styles.cardsSection}>
          {/* Strengths Card */}
          {strengths.length > 0 && (
            <View style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: '#d1fae5' }]}>
                <Text style={styles.cardIcon}>🔥</Text>
                <Text style={[styles.cardTitle, { color: '#065f46' }]}>
                  Điểm mạnh
                </Text>
              </View>
              <View style={styles.cardContent}>
                {strengths.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Challenges Card */}
          {challenges.length > 0 && (
            <View style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.cardIcon}>⚠️</Text>
                <Text style={[styles.cardTitle, { color: '#991b1b' }]}>
                  Thách thức
                </Text>
              </View>
              <View style={styles.cardContent}>
                {challenges.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations Card */}
          {recommendations.length > 0 && (
            <View style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: '#e0e7ff' }]}>
                <Text style={styles.cardIcon}>💡</Text>
                <Text style={[styles.cardTitle, { color: '#3730a3' }]}>
                  Lời khuyên
                </Text>
              </View>
              <View style={styles.cardContent}>
                {recommendations.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleCreatePlan}
          activeOpacity={0.8}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={isGenerating ? ["#ccc", "#aaa"] : ["#F093FB", "#F5576C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {isGenerating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.ctaText}>Đang tạo kế hoạch...</Text>
              </View>
            ) : (
              <Text style={styles.ctaText}>🎯 Tạo kế hoạch hành động ngay</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Full Screen Loading Overlay with Background Processing */}
      <Modal
        visible={isGenerating}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.loadingGradient}
          >
            <View style={styles.loadingContent}>
              <LottieView
                source={require("../../assets/animations/ai-thinking.json")}
                autoPlay
                loop
                style={styles.loadingAnimation}
              />
              <Text style={styles.loadingTitle}>AI đang thiết kế lộ trình chi tiết cho bạn</Text>
              <Text style={styles.loadingSubtitle}>
                Việc này có thể mất vài phút. Bạn có thể về trang chủ và tiếp tục sử dụng app.
              </Text>
              
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

              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />

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
                  AI sẽ tiếp tục xử lý nền, bạn sẽ nhận thông báo khi hoàn tất
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '600',
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gaugeContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  scoreCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '600',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardsSection: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F5576C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  tipCarousel: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
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
