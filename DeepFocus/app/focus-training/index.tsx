/**
 * Focus Training Index Screen
 * Entry point - Shows current status and guides user to next action
 */
// @ts-nocheck

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import focusTrainingApi from "../../src/services/focusTrainingApi";
import { useFocusTraining } from "@/src/contexts/FocusTrainingContext";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  FadeInDown
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function FocusTrainingIndexScreen() {
  const { isBackgroundProcessing, assessmentId, completePlanGeneration, isGeneratingPlan } = useFocusTraining();
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [todayTraining, setTodayTraining] = useState(null);
  const [planData, setPlanData] = useState(null);
  
  // Animation for pending card
  const shimmerTranslate = useSharedValue(-width);
  const pulseScale = useSharedValue(1);

  // Animated styles - MUST be before any conditional returns
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslate.value }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  useEffect(() => {
    // Shimmer animation for skeleton loader
    shimmerTranslate.value = withRepeat(
      withTiming(width, { duration: 1500 }),
      -1,
      false
    );
    
    // Pulse animation for icon
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    checkStatus();
  }, []);

  // Poll for plan completion if in background processing mode
  useEffect(() => {
    if (isBackgroundProcessing && assessmentId) {
      const pollInterval = setInterval(async () => {
        try {
          console.log('🔍 Polling for plan completion...');
          const response = await focusTrainingApi.checkPlanGeneration(assessmentId);
          
          if (response.status === 'completed' && response.plan) {
            console.log('✅ Plan generation completed!');
            clearInterval(pollInterval);
            
            // Update context
            await completePlanGeneration(response.plan);
            
            // Refresh UI
            checkStatus();
            
            // TODO: Show push notification
            // scheduleNotification('✨ Kế hoạch DeepFocus của bạn đã sẵn sàng!');
          }
        } catch (error) {
          console.log('⚠️ Polling error:', error.message);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(pollInterval);
    }
  }, [isBackgroundProcessing, assessmentId]);

  // Refresh when screen comes into focus (e.g., after creating plan)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused, refreshing data...');
      checkStatus();
    }, [])
  );

  const checkStatus = async () => {
    try {
      // Don't check if plan is currently being generated
      if (isGeneratingPlan) {
        console.log('⏳ Plan is being generated, skipping status check');
        setLoading(false);
        return;
      }
      
      // Check if user has active plan
      console.log('🔍 Checking for active plan...');
      const planResponse = await focusTrainingApi.getActivePlan();
      console.log('📋 Plan response:', planResponse);
      const plan = planResponse.plan;
      
      if (plan) {
        console.log('✅ Found active plan:', plan._id, 'Status:', plan.status);
        setHasActivePlan(true);
        setPlanData(plan);
        
        // Get today's training
        const todayData = await focusTrainingApi.getTodayTraining();
        console.log('📅 Today training data:', todayData);
        
        if (todayData && todayData.trainingDay) {
          console.log('✅ Today training:', todayData.trainingDay._id);
          
          // Calculate completed challenges count
          const trainingDay = todayData.trainingDay;
          const completedCount = trainingDay.challenges?.filter(c => c.completed).length || 0;
          
          setTodayTraining({
            ...trainingDay,
            completedChallenges: completedCount
          });
        } else {
          console.log('⚠️ No training for today');
          setTodayTraining(null);
        }
      } else {
        console.log('⚠️ Plan response has no plan property');
      }
    } catch (error) {
      console.log("❌ No active plan found:", error.message);
      setHasActivePlan(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render Pending Card when plan is generating in background
  const renderPendingCard = () => (
    <View style={styles.pendingCardContainer}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.pendingCard}
      >
        <Animated.View style={[styles.pendingIconContainer, pulseStyle]}>
          <Text style={styles.pendingIcon}>🤖</Text>
        </Animated.View>
        
        <View style={styles.pendingContent}>
          <Text style={styles.pendingTitle}>AI đang phân tích dữ liệu của bạn...</Text>
          <Text style={styles.pendingSubtext}>
            Chúng tôi đang thiết kế lộ trình DeepFocus cá nhân hóa. 
            Quá trình này có thể mất vài phút.
          </Text>
        </View>

        {/* Skeleton loader with shimmer effect */}
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonBar} />
          <View style={[styles.skeletonBar, styles.skeletonBarShort]} />
          <View style={styles.skeletonBar} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>

        <View style={styles.pendingFooter}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.pendingFooterText}>
            Bạn sẽ nhận thông báo khi kế hoạch hoàn tất
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  // No active plan - Show welcome screen with animations
  if (!hasActivePlan) {
    return (
      <View style={styles.welcomeContainer}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.welcomeGradient}>
          {/* Floating Back Button - Glassmorphism */}
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <Text style={styles.floatingBackIcon}>←</Text>
          </TouchableOpacity>

          <SafeAreaView edges={['top']} style={styles.safeAreaView}>
            <ScrollView 
              style={styles.welcomeScroll}
              contentContainerStyle={styles.welcomeScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Show Pending Card if generating in background */}
              {isBackgroundProcessing && renderPendingCard()}
              
              {/* Illustration Section with Glow Effect */}
              <View style={styles.illustrationContainer}>
                {/* Glow effect behind illustration */}
                <View style={styles.illustrationGlow} />
                <LottieView
                  source={require("../../assets/animations/focus-study.json")}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
                <View style={styles.titleContainer}>
                  <Text style={styles.titleEmoji}>✨</Text>
                  <Text style={styles.welcomeMainTitle}>Focus Training</Text>
                </View>
                <Text style={styles.welcomeMainSubtitle}>
                  Xây dựng thói quen tập trung bền vững{'\n'}
                  với AI coaching cá nhân hóa
                </Text>
              </View>

            {/* Features Highlight */}
            <View style={styles.featureHighlight}>
              <View style={styles.featureRow}>
                <Text style={styles.featureEmoji}>🎯</Text>
                <Text style={styles.featureText}>Đánh giá AI cá nhân hóa</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureEmoji}>📅</Text>
                <Text style={styles.featureText}>Kế hoạch 4-8 tuần tùy chỉnh</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureEmoji}>💪</Text>
                <Text style={styles.featureText}>Thử thách hàng ngày đa dạng</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureEmoji}>📊</Text>
                <Text style={styles.featureText}>Theo dõi tiến độ chi tiết</Text>
              </View>
            </View>

            {/* How it Works - Vertical Timeline with Line Through Icons */}
            <View style={styles.timeline}>
              <Text style={styles.timelineTitle}>Cách thức hoạt động</Text>
              
              {/* Step 1 */}
              <Animated.View 
                style={styles.timelineStepRow}
                entering={FadeInDown.delay(100).duration(600)}
              >
                <View style={styles.timelineLeft}>
                  <View style={styles.stepIconCircle}>
                    <Text style={styles.stepIcon}>📝</Text>
                  </View>
                  <View style={styles.verticalLine} />
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.stepTitle}>Đánh giá</Text>
                  <Text style={styles.stepDesc}>Trả lời về thói quen tập trung</Text>
                </View>
              </Animated.View>

              {/* Step 2 */}
              <Animated.View 
                style={styles.timelineStepRow}
                entering={FadeInDown.delay(200).duration(600)}
              >
                <View style={styles.timelineLeft}>
                  <View style={styles.stepIconCircle}>
                    <Text style={styles.stepIcon}>🤖</Text>
                  </View>
                  <View style={styles.verticalLine} />
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.stepTitle}>AI phân tích</Text>
                  <Text style={styles.stepDesc}>Nhận gợi ý cá nhân hóa</Text>
                </View>
              </Animated.View>

              {/* Step 3 */}
              <Animated.View 
                style={styles.timelineStepRow}
                entering={FadeInDown.delay(300).duration(600)}
              >
                <View style={styles.timelineLeft}>
                  <View style={styles.stepIconCircle}>
                    <Text style={styles.stepIcon}>🎯</Text>
                  </View>
                  <View style={styles.verticalLine} />
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.stepTitle}>Thực hành</Text>
                  <Text style={styles.stepDesc}>Hoàn thành thử thách hàng ngày</Text>
                </View>
              </Animated.View>

              {/* Step 4 - No line after last step */}
              <Animated.View 
                style={styles.timelineStepRow}
                entering={FadeInDown.delay(400).duration(600)}
              >
                <View style={styles.timelineLeft}>
                  <View style={styles.stepIconCircle}>
                    <Text style={styles.stepIcon}>📈</Text>
                  </View>
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.stepTitle}>Tiến bộ</Text>
                  <Text style={styles.stepDesc}>Thấy sự cải thiện rõ rệt</Text>
                </View>
              </Animated.View>
            </View>
          </ScrollView>

          {/* Sticky Footer - CTA Button */}
          <View style={styles.stickyFooter}>
            <View style={styles.timeNote}>
              <Text style={styles.timeNoteText}>⏱️ Chỉ mất 2-3 phút thôi</Text>
            </View>
            <TouchableOpacity
              style={styles.welcomeCtaButton}
              onPress={() => router.push("/focus-training/assessment")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#F093FB", "#F5576C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.welcomeCtaText}>Bắt Đầu Đánh Giá</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

  // Has active plan - Show dashboard
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.aiCoachButton} 
            onPress={() => router.push('/focus-training/ai-coach')}
          >
            <Text style={styles.aiCoachButtonText}>🤖 AI Coach</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerTitle}>🎯 Focus Training</Text>
        <Text style={styles.headerSubtitle}>{planData?.title}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Today's Training Card */}
        {todayTraining ? (
          <TouchableOpacity
            style={styles.todayCard}
            onPress={() => router.push("/focus-training/day-detail")}
          >
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>
                {todayTraining.type === "rest" ? "🛌 Rest Day" : "💪 Today's Training"}
              </Text>
              <Text style={styles.todayDate}>
                {new Date(todayTraining.date).toLocaleDateString()}
              </Text>
            </View>

            {todayTraining.type === "rest" ? (
              <Text style={styles.restMessage}>
                Take it easy today. Your mind needs rest to grow stronger! 🌱
              </Text>
            ) : (
              <>
                <Text style={styles.challengeCount}>
                  {todayTraining.challenges?.length || 0} challenges
                </Text>
                <View style={styles.progressIndicator}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (todayTraining.completedChallenges /
                            todayTraining.challenges?.length) *
                          100
                        }%`,
                        backgroundColor: 
                          todayTraining.completedChallenges === todayTraining.challenges?.length
                            ? '#10b981' // Green when 100% complete
                            : todayTraining.completedChallenges > 0
                            ? '#3b82f6' // Blue when in progress
                            : '#9ca3af', // Gray when not started
                      },
                    ]}
                  />
                </View>
                <Text style={styles.completionText}>
                  {todayTraining.completedChallenges || 0} of{" "}
                  {todayTraining.challenges?.length || 0} completed
                </Text>
              </>
            )}

            <View style={styles.todayAction}>
              <Text style={styles.todayActionText}>
                {todayTraining.type === "rest" ? "View Calendar →" : "Start Training →"}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.todayCard}>
            <Text style={styles.todayTitle}>📅 No training scheduled today</Text>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <QuickStat
            icon="🔥"
            value={planData?.currentStreak || 0}
            label="Day Streak"
            onPress={() => router.push("/focus-training/progress")}
          />
          <QuickStat
            icon="⭐"
            value={planData?.totalPoints || 0}
            label="Total Points"
            onPress={() => router.push("/focus-training/progress")}
          />
          <QuickStat
            icon="📈"
            value={`${planData?.completionRate || 0}%`}
            label="Completion"
            onPress={() => router.push("/focus-training/progress")}
          />
        </View>

        {/* Navigation Menu */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="📅"
            title="Calendar"
            subtitle="View your training schedule"
            onPress={() => router.push("/focus-training/calendar")}
          />
          <MenuItem
            icon="📊"
            title="Progress"
            subtitle="See your stats and improvements"
            onPress={() => router.push("/focus-training/progress")}
          />
          <MenuItem
            icon="📝"
            title="Weekly Check-in"
            subtitle="Submit weekly assessment"
            onPress={() => router.push("/focus-training/weekly-assessment")}
          />
          <MenuItem
            icon="⚙️"
            title="Settings"
            subtitle="Manage your training plan"
            onPress={() => router.push("/focus-training/settings")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

// Step Card Component
function StepCard({ number, title, description }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Quick Stat Component
function QuickStat({ icon, value, label, onPress }) {
  return (
    <TouchableOpacity style={styles.quickStatCard} onPress={onPress}>
      <Text style={styles.quickStatIcon}>{icon}</Text>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// Menu Item Component
function MenuItem({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  // Pending Card Styles (Background Processing)
  pendingCardContainer: {
    marginBottom: 24,
  },
  pendingCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  pendingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  pendingIcon: {
    fontSize: 36,
  },
  pendingContent: {
    marginBottom: 20,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pendingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  skeletonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  skeletonBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonBarShort: {
    width: '60%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  pendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pendingFooterText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontStyle: 'italic',
  },
  // Welcome Screen Styles (inspired by AI Planner)
  welcomeContainer: {
    flex: 1,
  },
  welcomeGradient: {
    flex: 1,
  },
  safeAreaView: {
    flex: 1,
  },
  // Floating Back Button - Glassmorphism (Top-left safe area)
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    backdropFilter: 'blur(10px)',
  },
  floatingBackIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  welcomeScroll: {
    flex: 1,
  },
  welcomeScrollContent: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  // Glow effect behind illustration
  illustrationGlow: {
    position: 'absolute',
    top: '30%',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  lottieAnimation: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titleEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  welcomeMainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  welcomeMainSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
  },
  featureHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  welcomeCtaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
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
  welcomeCtaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeNote: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeNoteText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  // Vertical Timeline - Icon + Line on Left, Content on Right
  timeline: {
    paddingVertical: 20,
  },
  timelineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  timelineStepRow: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 2,
  },
  verticalLine: {
    width: 3,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
    marginBottom: 4,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 8,
  },
  stepIcon: {
    fontSize: 28,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  // Sticky Footer for CTA
  stickyFooter: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeCtaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F5576C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiCoachButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiCoachButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
  },
  content: {
    padding: 16,
  },
  featuresSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
  ctaSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  stepsSection: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6366f1",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  todayCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  todayDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  restMessage: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 24,
  },
  challengeCount: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
  },
  progressIndicator: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  completionText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  todayAction: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  todayActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366f1",
    textAlign: "center",
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuArrow: {
    fontSize: 24,
    color: "#9ca3af",
  },
});
