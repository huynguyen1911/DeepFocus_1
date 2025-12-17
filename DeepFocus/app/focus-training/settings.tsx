/**
 * Focus Training Settings Screen
 * Manage training plan, notifications, and preferences
 */

// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import focusTrainingApi from "../../src/services/focusTrainingApi";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReminder, setWeeklyReminder] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const response = await focusTrainingApi.getActivePlan();
      setPlan(response.plan);
    } catch (error) {
      console.error("Failed to load plan:", error);
      // No active plan - redirect to welcome screen
      setPlan(null);
      Alert.alert(
        "No Active Plan",
        "You don't have an active training plan. Would you like to create one?",
        [
          { text: "Later", onPress: () => router.replace("/focus-training") },
          { text: "Create Plan", onPress: () => router.push("/focus-training/assessment") }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePausePlan = () => {
    Alert.alert(
      "Pause Training Plan?",
      "Your progress will be saved. You can resume anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pause",
          style: "destructive",
          onPress: () => updatePlanStatus("pause"),
        },
      ]
    );
  };

  const handleResumePlan = () => {
    updatePlanStatus("resume");
  };

  const handleCancelPlan = () => {
    Alert.alert(
      "Cancel Training Plan?",
      "This action cannot be undone. Your progress will be archived.",
      [
        { text: "No, keep it", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => updatePlanStatus("cancel"),
        },
      ]
    );
  };

  const updatePlanStatus = async (action) => {
    try {
      setUpdatingStatus(true);
      await focusTrainingApi.updatePlanStatus(action);
      
      if (action === "cancel") {
        // Plan cancelled - redirect to welcome screen
        Alert.alert(
          "Plan Cancelled",
          "Your training plan has been cancelled.",
          [{ text: "OK", onPress: () => router.replace("/focus-training") }]
        );
      } else {
        // Pause/Resume - reload plan
        Alert.alert(
          "Success",
          `Plan ${action}d successfully`,
          [{ text: "OK", onPress: loadPlan }]
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update plan status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStartNewPlan = async () => {
    Alert.alert(
      "Start New Plan?",
      "Your current plan will be cancelled. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start New",
          onPress: async () => {
            try {
              await focusTrainingApi.updatePlanStatus("cancel");
              // Navigate to welcome screen first, then to assessment
              router.replace("/focus-training");
              setTimeout(() => {
                router.push("/focus-training/assessment");
              }, 500);
            } catch (error) {
              Alert.alert("Error", "Failed to cancel plan");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Active Plan</Text>
        <Text style={styles.emptyText}>
          You don't have an active training plan yet.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/focus-training/assessment")}
        >
          <Text style={styles.primaryButtonText}>Create New Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your focus training preferences
        </Text>
      </View>

      {/* Plan Status Section */}
      {plan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Current Plan</Text>

          <View style={styles.card}>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(plan.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {plan.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.planStats}>
              <Text style={styles.planStat}>
                Duration: {plan.duration} weeks
              </Text>
              <Text style={styles.planStat}>
                Difficulty: {plan.difficulty}
              </Text>
              <Text style={styles.planStat}>
                Days remaining: {plan.daysRemaining || 0}
              </Text>
            </View>

            {/* Plan Actions */}
            <View style={styles.planActions}>
              {plan.status === "active" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.warningButton]}
                  onPress={handlePausePlan}
                  disabled={updatingStatus}
                >
                  <Text style={styles.actionButtonText}>⏸️ Pause Plan</Text>
                </TouchableOpacity>
              )}

              {plan.status === "paused" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.successButton]}
                  onPress={handleResumePlan}
                  disabled={updatingStatus}
                >
                  <Text style={styles.actionButtonText}>▶️ Resume Plan</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleCancelPlan}
                disabled={updatingStatus}
              >
                <Text style={styles.actionButtonText}>❌ Cancel Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Developer Tools - Quick Reset */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Developer Tools</Text>
          <View style={styles.card}>
            {plan ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={async () => {
                    Alert.alert(
                      "⚠️ Reset Plan",
                      "This will cancel your current plan so you can create a new one with updated AI. Continue?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Reset",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await focusTrainingApi.updatePlanStatus("cancel");
                              Alert.alert("✅ Plan Cancelled", "You can now create a new plan with improved AI!", [
                                {
                                  text: "Create New Plan",
                                  onPress: () => router.replace("/focus-training/assessment")
                                }
                              ]);
                            } catch (error) {
                              Alert.alert("Error", "Failed to cancel plan");
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>🔄 Reset & Create New Plan</Text>
                </TouchableOpacity>
                <Text style={styles.devNote}>
                  Cancel current plan to test new AI improvements
                </Text>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={() => router.push("/focus-training/assessment")}
                >
                  <Text style={styles.actionButtonText}>🚀 Create New Plan</Text>
                </TouchableOpacity>
                <Text style={styles.devNote}>
                  Start assessment to create a plan with improved AI
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>

        <View style={styles.card}>
          <SettingRow
            icon="🔔"
            title="Enable Notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingRow
            icon="☀️"
            title="Daily Training Reminder"
            subtitle="Get reminded to complete today's challenges"
            value={dailyReminder}
            onValueChange={setDailyReminder}
            disabled={!notificationsEnabled}
          />
          <SettingRow
            icon="📅"
            title="Weekly Assessment Reminder"
            subtitle="Weekly check-in notifications"
            value={weeklyReminder}
            onValueChange={setWeeklyReminder}
            disabled={!notificationsEnabled}
          />
        </View>
      </View>

      {/* Training Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Training Preferences</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⏰</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Reminder Time</Text>
              <Text style={styles.menuSubtitle}>9:00 AM</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🎯</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Daily Goal</Text>
              <Text style={styles.menuSubtitle}>Complete all challenges</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Account</Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/focus-training/progress")}
          >
            <Text style={styles.menuIcon}>📊</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>View Progress</Text>
              <Text style={styles.menuSubtitle}>
                See your stats and history
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleStartNewPlan}
          >
            <Text style={styles.menuIcon}>🆕</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Start New Plan</Text>
              <Text style={styles.menuSubtitle}>Begin a fresh training plan</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>DeepFocus AI Training v1.0</Text>
        <Text style={styles.footerSubtext}>
          Powered by AI • Built with ❤️
        </Text>
      </View>
    </ScrollView>
  );
}

// Setting Row Component with Switch
function SettingRow({ icon, title, subtitle, value, onValueChange, disabled }) {
  return (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#e5e7eb", true: "#c7d2fe" }}
        thumbColor={value ? "#6366f1" : "#f3f4f6"}
      />
    </View>
  );
}

// Helper Functions
function getStatusColor(status) {
  switch (status) {
    case "active":
      return "#10b981";
    case "paused":
      return "#f59e0b";
    case "completed":
      return "#3b82f6";
    case "cancelled":
      return "#6b7280";
    default:
      return "#9ca3af";
  }
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
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  planStats: {
    padding: 16,
    gap: 8,
  },
  planStat: {
    fontSize: 14,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  planActions: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#10b981",
  },
  warningButton: {
    backgroundColor: "#f59e0b",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  disabledText: {
    color: "#9ca3af",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
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
    fontSize: 20,
    color: "#9ca3af",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9ca3af",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  devNote: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});
