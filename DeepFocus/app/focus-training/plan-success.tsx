// @ts-nocheck
/**
 * Plan Success Screen - The Success
 * Celebration screen with confetti and plan preview
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useFocusTraining } from '../../src/contexts/FocusTrainingContext';

const { width } = Dimensions.get('window');

export default function PlanSuccessScreen() {
  const params = useLocalSearchParams();
  const confettiRef = useRef(null);
  const { setActivePlan } = useFocusTraining();
  const [showConfetti, setShowConfetti] = useState(true);
  
  const planData = {
    duration: params.duration || '3 tuần',
    level: params.level || 'Người mới bắt đầu',
    dailyGoal: params.dailyGoal || '25 phút Pomodoro',
    totalSessions: params.totalSessions || 21,
  };

  useEffect(() => {
    // Trigger confetti animation
    if (confettiRef.current) {
      confettiRef.current.play();
    }
    
    // Mark plan as active in Context
    setActivePlan(true);
    
  }, []);

  const handleStartJourney = () => {
    // Pop back to focus-training index (root of stack)
    // This will clear assessment and plan-success from stack
    router.back();
    router.back();
  };

  const handleViewCalendar = () => {
    // Pop back to index, then push calendar
    router.back();
    router.back();
    // Wait for navigation to complete
    setTimeout(() => {
      router.push('/focus-training/calendar');
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Confetti Animation - Auto hides after animation completes */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <LottieView
            ref={confettiRef}
            source={require("../../assets/animations/confetti.json")}
            loop={false}
            style={styles.confettiAnimation}
            onAnimationFinish={() => setShowConfetti(false)}
          />
        </View>
      )}

      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Success Icon & Title */}
            <View style={styles.heroSection}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✨</Text>
              </View>
              <Text style={styles.mainTitle}>Kế hoạch đã sẵn sàng!</Text>
              <Text style={styles.subtitle}>
                Chúc mừng! Lộ trình cá nhân hóa của bạn đã được tạo
              </Text>
            </View>

          {/* Plan Preview Card */}
          <View style={styles.planPreviewCard}>
            <Text style={styles.previewTitle}>🎯 Tổng quan lộ trình</Text>
            
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Thời gian</Text>
                <Text style={styles.previewValue}>{planData.duration}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Cấp độ</Text>
                <Text style={styles.previewValue}>{planData.level}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.goalSection}>
              <Text style={styles.goalLabel}>Mục tiêu mỗi ngày</Text>
              <View style={styles.goalBadge}>
                <Text style={styles.goalIcon}>⏱️</Text>
                <Text style={styles.goalText}>{planData.dailyGoal}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{planData.totalSessions}</Text>
                <Text style={styles.statLabel}>Buổi tập</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Thử thách/tuần</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Cá nhân hóa</Text>
              </View>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Thông báo nhắc nhở thông minh</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Theo dõi tiến độ hàng ngày</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Nhận huy hiệu & phần thưởng</Text>
            </View>
          </View>

            {/* CTA Buttons */}
            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartJourney}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#F093FB", "#F5576C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    🚀 Bắt đầu hành trình ngay
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleViewCalendar}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  📅 Xem lịch tập luyện
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'none',
  },
  confettiAnimation: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 56,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  planPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  previewLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  goalSection: {
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F5576C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  ctaSection: {
    gap: 12,
    paddingBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F5576C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
