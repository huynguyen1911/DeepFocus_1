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
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import focusTrainingApi from "../../src/services/focusTrainingApi";

const { width } = Dimensions.get("window");

export default function FocusTrainingIndexScreen() {
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [todayTraining, setTodayTraining] = useState(null);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  // Refresh when screen comes into focus (e.g., after creating plan)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused, refreshing data...');
      checkStatus();
    }, [])
  );

  const checkStatus = async () => {
    try {
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
          setTodayTraining(todayData.trainingDay);
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

  // No active plan - Show welcome screen
  if (!hasActivePlan) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.heroSection}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          
          <Text style={styles.heroIcon}>🧠</Text>
          <Text style={styles.heroTitle}>AI Focus Training</Text>
          <Text style={styles.heroSubtitle}>
            Build sustainable focus habits with AI-powered personalized training
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Features */}
          <View style={styles.featuresSection}>
            <FeatureCard
              icon="🎯"
              title="AI Assessment"
              description="Get personalized analysis of your focus level"
            />
            <FeatureCard
              icon="📅"
              title="Custom Plan"
              description="4-8 week progressive training tailored to you"
            />
            <FeatureCard
              icon="💪"
              title="Daily Challenges"
              description="Variety of exercises to build focus muscle"
            />
            <FeatureCard
              icon="📊"
              title="Track Progress"
              description="See your improvement over time"
            />
          </View>

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to get started?</Text>
            <Text style={styles.ctaSubtitle}>
              Take a quick 2-minute assessment to create your personalized plan
            </Text>
            
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push("/focus-training/assessment")}
            >
              <Text style={styles.ctaButtonText}>Start Assessment</Text>
            </TouchableOpacity>
          </View>

          {/* How it Works */}
          <View style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>How it works</Text>
            
            <StepCard
              number={1}
              title="Take Assessment"
              description="Answer questions about your focus habits"
            />
            <StepCard
              number={2}
              title="Get AI Analysis"
              description="Receive personalized recommendations"
            />
            <StepCard
              number={3}
              title="Follow Plan"
              description="Complete daily challenges at your pace"
            />
            <StepCard
              number={4}
              title="Track Progress"
              description="See your focus improve week by week"
            />
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: "#f9fafb",
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
  heroSection: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    lineHeight: 24,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    width: (width - 44) / 2,
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
