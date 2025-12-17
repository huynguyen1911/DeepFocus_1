/**
 * Progress Dashboard Screen
 * Shows user's training progress, stats, and assessment history
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
  RefreshControl,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import focusTrainingApi from "../../src/services/focusTrainingApi";

const { width } = Dimensions.get("window");

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setError(null);
      const response = await focusTrainingApi.getProgress();
      setProgressData(response);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load progress:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProgress}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { stats, plan, assessmentHistory, weeklyProgress } = progressData || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <Text style={styles.headerTitle}>📊 Progress Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {plan?.title || "Your Focus Training Journey"}
        </Text>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="🎯"
          label="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          color="#10b981"
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${stats?.currentStreak || 0} days`}
          color="#f59e0b"
        />
        <StatCard
          icon="⭐"
          label="Total Points"
          value={stats?.totalPoints || 0}
          color="#8b5cf6"
        />
        <StatCard
          icon="⏱️"
          label="Focus Hours"
          value={`${stats?.totalFocusHours || 0}h`}
          color="#3b82f6"
        />
      </View>

      {/* Plan Overview */}
      {plan && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Current Plan</Text>
          <View style={styles.planInfo}>
            <InfoRow label="Duration" value={`${plan.duration} weeks`} />
            <InfoRow label="Difficulty" value={plan.difficulty} />
            <InfoRow
              label="Days Remaining"
              value={`${plan.daysRemaining || 0} days`}
            />
            <InfoRow label="Status" value={plan.status} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${stats?.completionRate || 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {stats?.completedDays || 0} of {plan.totalDays} days completed
          </Text>
        </View>
      )}

      {/* Weekly Progress Chart */}
      {weeklyProgress && weeklyProgress.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Weekly Progress</Text>
          <View style={styles.chartContainer}>
            {weeklyProgress.map((week, index) => (
              <View key={index} style={styles.weekBar}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (week.completionRate / 100) * 150,
                        backgroundColor: getBarColor(week.completionRate),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weekLabel}>W{week.weekNumber}</Text>
                <Text style={styles.weekValue}>{week.completionRate}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Assessment History */}
      {assessmentHistory && assessmentHistory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Assessment History</Text>
          {assessmentHistory.map((assessment, index) => (
            <View key={index} style={styles.assessmentItem}>
              <View style={styles.assessmentHeader}>
                <Text style={styles.assessmentType}>
                  {assessment.type === "initial" ? "🎯 Initial" : "📊 Weekly"}
                </Text>
                <Text style={styles.assessmentDate}>
                  {new Date(assessment.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Focus Score:</Text>
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(assessment.focusScore) },
                  ]}
                >
                  {assessment.focusScore}/100
                </Text>
              </View>
              {assessment.improvement !== undefined && (
                <Text
                  style={[
                    styles.improvement,
                    {
                      color:
                        assessment.improvement >= 0 ? "#10b981" : "#ef4444",
                    },
                  ]}
                >
                  {assessment.improvement >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(assessment.improvement)} points
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/focus-training/day-detail")}
        >
          <Text style={styles.primaryButtonText}>Today's Training</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/focus-training/calendar")}
        >
          <Text style={styles.secondaryButtonText}>View Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {!plan && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={styles.emptyStateTitle}>No Active Plan</Text>
          <Text style={styles.emptyStateText}>
            Start your focus training journey by taking the assessment
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/focus-training/assessment")}
          >
            <Text style={styles.primaryButtonText}>Start Assessment</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// Info Row Component
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// Helper Functions
function getBarColor(percentage) {
  if (percentage >= 80) return "#10b981";
  if (percentage >= 60) return "#f59e0b";
  return "#ef4444";
}

function getScoreColor(score) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
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
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    marginTop: -20,
  },
  statCard: {
    width: (width - 36) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 6,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  planInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textTransform: "capitalize",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 200,
    paddingVertical: 16,
  },
  weekBar: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 150,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  weekLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  weekValue: {
    fontSize: 10,
    color: "#9ca3af",
  },
  assessmentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
  },
  assessmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  assessmentType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  assessmentDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  improvement: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
});
