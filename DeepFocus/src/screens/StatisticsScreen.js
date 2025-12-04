import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { SegmentedButtons, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { theme } from "../config/theme";
import { statsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useRole } from "../contexts/RoleContext";
import { formatWorkTime } from "../utils/statsUtils";
import ClassAnalytics from "../components/ClassAnalytics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 32;

export default function StatisticsScreen() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { currentRole } = useRole();
  const [loading, setLoading] = useState(true);

  // Check if user is Teacher/Guardian
  const isTeacher = currentRole === "teacher";
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState("7days"); // today, 7days, 30days, custom
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(() => new Date());
  const [customEndDate, setCustomEndDate] = useState(() => new Date());
  const [datePickerMode, setDatePickerMode] = useState("start"); // start or end

  // Helper function to translate Vietnamese day names to current language
  const translateDayName = (vietnameseDay) => {
    if (!vietnameseDay) return "";

    const dayMap = {
      "Chủ Nhật": language === "vi" ? "Chủ Nhật" : "Sunday",
      "Thứ Hai": language === "vi" ? "Thứ Hai" : "Monday",
      "Thứ Ba": language === "vi" ? "Thứ Ba" : "Tuesday",
      "Thứ Tư": language === "vi" ? "Thứ Tư" : "Wednesday",
      "Thứ Năm": language === "vi" ? "Thứ Năm" : "Thursday",
      "Thứ Sáu": language === "vi" ? "Thứ Sáu" : "Friday",
      "Thứ Bảy": language === "vi" ? "Thứ Bảy" : "Saturday",
    };

    return dayMap[vietnameseDay] || vietnameseDay;
  };

  // Load stats from API
  const loadStats = async (showLoading = true) => {
    try {
      if (!isAuthenticated) {
        console.log("⚠️ User not authenticated, skipping stats load");
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      const data = await statsAPI.getStats();
      console.log("📊 Stats loaded successfully");
      console.log("   � Overall stats:", {
        totalPomodoros: data.overall?.totalPomodoros,
        totalWorkTime: data.overall?.totalWorkTime,
        totalHours: data.overall?.totalHours,
      });
      setStats(data);
    } catch (error) {
      console.error("❌ Failed to load stats:", error.message);
      Alert.alert(t("general.error"), t("stats.loadError"), [{ text: "OK" }]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Refresh stats
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats(false);
    setRefreshing(false);
  }, [isAuthenticated]);

  // Load stats on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  // Reload stats when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        console.log("📊 Statistics screen focused, reloading stats...");
        loadStats(false);
      }
    }, [isAuthenticated])
  );

  // Filter stats data based on selected date range
  const getFilteredData = () => {
    if (!stats || !stats.last30Days || stats.last30Days.length === 0) {
      return [];
    }

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let startDate;

    switch (dateRange) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "30days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "custom":
        startDate = new Date(customStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        return stats.last30Days.filter((day) => {
          const dayDate = new Date(day.date);
          return dayDate >= startDate && dayDate <= endDate;
        });
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }

    return stats.last30Days.filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate && dayDate <= now;
    });
  };

  // Calculate filtered stats for overview cards
  const getFilteredStats = () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return {
        totalPomodoros: 0,
        totalWorkTime: 0,
        totalTasks: 0,
        averagePomodoros: 0,
      };
    }

    const totals = filteredData.reduce(
      (acc, day) => ({
        totalPomodoros: acc.totalPomodoros + (day.completedPomodoros || 0),
        totalWorkTime: acc.totalWorkTime + (day.totalWorkTime || 0),
        totalTasks: acc.totalTasks + (day.completedTasks || 0),
      }),
      { totalPomodoros: 0, totalWorkTime: 0, totalTasks: 0 }
    );

    return {
      ...totals,
      averagePomodoros:
        filteredData.length > 0
          ? totals.totalPomodoros / filteredData.length
          : 0,
    };
  };

  // Prepare chart data based on date range
  const getChartData = () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return {
        labels: [""],
        datasets: [{ data: [0] }],
      };
    }

    const labels = filteredData.map((day) => {
      const date = new Date(day.date);
      if (dateRange === "today") {
        return date.toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    });

    const data = filteredData.map((day) => day.completedPomodoros || 0);

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          strokeWidth: 2,
        },
      ],
    };
  };

  // Get chart title based on selected range
  const getChartTitle = () => {
    switch (dateRange) {
      case "today":
        return `📈 ${t("stats.today")}`;
      case "7days":
        return `📈 ${t("stats.last7Days")}`;
      case "30days":
        return `📈 ${t("stats.last30Days")}`;
      case "custom":
        const start = customStartDate.toLocaleDateString("vi-VN");
        const end = customEndDate.toLocaleDateString("vi-VN");
        return `📈 ${start} - ${end}`;
      default:
        return `📈 ${t("stats.last7Days")}`;
    }
  };

  // Handle date range change
  const handleDateRangeChange = (value) => {
    console.log("🔄 Date range changed to:", value);
    setDateRange(value);
    if (value === "custom") {
      console.log("📅 Opening date picker modal...");
      setShowDatePicker(true);
      setDatePickerMode("start");
    }
  };

  // Handle date picker change
  const handleDatePickerChange = (event, selectedDate) => {
    console.log("📅 Date picker changed:", {
      type: event?.type,
      datePickerMode,
      selectedDate: selectedDate?.toISOString(),
    });

    const currentDate =
      selectedDate ||
      (datePickerMode === "start" ? customStartDate : customEndDate);

    // Android: event.type === "dismissed" when user cancels
    if (Platform.OS === "android" && event.type === "dismissed") {
      console.log("❌ Date picker dismissed");
      setShowDatePicker(false);
      setDateRange("7days"); // Revert to previous range
      return;
    }

    if (datePickerMode === "start") {
      console.log(
        "✅ Start date selected:",
        currentDate.toLocaleDateString("vi-VN")
      );
      setCustomStartDate(currentDate);
      // Don't auto-switch, wait for user to press button
    } else {
      // End date selected
      console.log(
        "✅ End date selected:",
        currentDate.toLocaleDateString("vi-VN")
      );
      console.log("📊 Custom range set:", {
        start: customStartDate.toLocaleDateString("vi-VN"),
        end: currentDate.toLocaleDateString("vi-VN"),
      });
      setCustomEndDate(currentDate);
      setShowDatePicker(false);
      // Keep custom range selected
    }
  };

  // Close date picker (for iOS "Xong" button and overlay tap)
  const closeDatePicker = () => {
    if (datePickerMode === "start") {
      // If user closes before selecting dates, revert to previous range
      setDateRange("7days");
    }
    setShowDatePicker(false);
  };

  // Handle date picker button press ("Tiếp tục" for start date, "Xong" for end date)
  const handleIOSDatePickerDone = () => {
    if (datePickerMode === "start") {
      // Switch to end date picker
      setDatePickerMode("end");
    } else {
      // Close picker
      setShowDatePicker(false);
    }
  };

  // Get motivational message based on current streak
  const getStreakMessage = () => {
    if (!stats || !stats.overall) return t("stats.startStreak");

    const streak = stats.overall.currentStreak;
    if (streak === 0) {
      return t("stats.completeToday");
    } else if (streak === 1) {
      return t("stats.keepGoing");
    } else if (streak < 7) {
      return t("stats.streakShort", { streak });
    } else if (streak < 30) {
      return t("stats.streakMedium", { streak });
    } else {
      return t("stats.streakLong", { streak });
    }
  };

  // Get achievement count
  const getAchievementCount = () => {
    if (!stats || !stats.achievements) return 0;
    return stats.achievements.filter((a) => a.unlocked !== false).length;
  };

  // If Teacher/Guardian role, show Class Analytics instead
  if (isTeacher) {
    return <ClassAnalytics />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("general.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{t("stats.loginPrompt")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - No data yet
  const hasNoData =
    !stats || !stats.overall || stats.overall.totalPomodoros === 0;

  if (hasNoData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📊 {t("stats.statistics")}</Text>
            <Text style={styles.subtitle}>{t("stats.trackProgress")}</Text>
          </View>

          {/* Empty State */}
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>🌱</Text>
            <Text style={styles.emptyStateTitle}>{t("stats.noData")}</Text>
            <Text style={styles.emptyStateMessage}>
              {t("stats.noDataDescription")}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {t("stats.emptyStateHint")}
            </Text>
          </View>

          {/* Preview Cards with Zero */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.primaryCard]}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t("stats.pomodoros")}</Text>
            </View>

            <View style={[styles.statCard, styles.successCard]}>
              <Text style={styles.statValue}>0 🔥</Text>
              <Text style={styles.statLabel}>{t("stats.streak")}</Text>
            </View>

            <View style={[styles.statCard, styles.infoCard]}>
              <Text style={styles.statValue}>0h 0m</Text>
              <Text style={styles.statLabel}>{t("stats.focusTime")}</Text>
            </View>

            <View style={[styles.statCard, styles.warningCard]}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t("tasks.completed")}</Text>
            </View>
          </View>

          {/* Empty Chart Placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 {t("stats.chart")}</Text>
            <View style={styles.emptyChartContainer}>
              <Text style={styles.emptyChartIcon}>📊</Text>
              <Text style={styles.emptyChartText}>
                {t("stats.chartAvailableAfter")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 {t("stats.statistics")}</Text>
          <Text style={styles.subtitle}>{t("stats.trackProgress")}</Text>
        </View>

        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <SegmentedButtons
            value={dateRange}
            onValueChange={handleDateRangeChange}
            buttons={[
              {
                value: "today",
                label: t("stats.today"),
                style: styles.segmentButton,
              },
              {
                value: "7days",
                label: t("stats.last7Days"),
                style: styles.segmentButton,
              },
              {
                value: "30days",
                label: t("stats.last30Days"),
                style: styles.segmentButton,
              },
              {
                value: "custom",
                label: t("stats.custom"),
                style: styles.segmentButton,
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Filtered Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statValue}>
              {getFilteredStats().totalPomodoros}
            </Text>
            <Text style={styles.statLabel}>Pomodoros</Text>
          </View>

          <View style={[styles.statCard, styles.successCard]}>
            <Text style={styles.statValue}>
              {stats?.overall?.currentStreak || 0} 🔥
            </Text>
            <Text style={styles.statLabel}>{t("stats.streak")}</Text>
          </View>

          <View style={[styles.statCard, styles.infoCard]}>
            <Text style={styles.statValue}>
              {formatWorkTime(getFilteredStats().totalWorkTime)}
            </Text>
            <Text style={styles.statLabel}>{t("stats.focusTime")}</Text>
          </View>

          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statValue}>
              {getFilteredStats().totalTasks}
            </Text>
            <Text style={styles.statLabel}>{t("tasks.completed")}</Text>
          </View>
        </View>

        {/* Streak Message */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
          <Text style={styles.longestStreak}>
            {t("stats.longestStreak")}: {stats?.overall?.longestStreak || 0}{" "}
            {t("stats.days")}
          </Text>
        </View>

        {/* Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getChartTitle()}</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={getChartData()}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.primary,
                backgroundGradientFrom: theme.colors.primary,
                backgroundGradientTo: theme.colors.secondary,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: theme.colors.accent,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Weekly Stats */}
        {stats?.weekly && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 {t("stats.thisWeek")}</Text>
            <View style={styles.weeklyCard}>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>
                  {t("stats.totalPomodoros")}:
                </Text>
                <Text style={styles.weeklyValue}>
                  {stats.weekly.totalPomodoros}
                </Text>
              </View>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>
                  {t("stats.averagePerDay")}:
                </Text>
                <Text style={styles.weeklyValue}>
                  {Math.round(stats.weekly.averageDailyPomodoros * 10) / 10}
                </Text>
              </View>
              <View style={styles.weeklyRow}>
                <Text style={styles.weeklyLabel}>{t("stats.workTime")}:</Text>
                <Text style={styles.weeklyValue}>
                  {formatWorkTime(stats.weekly.totalWorkTime)}
                </Text>
              </View>
              {stats.weekly.mostProductiveDay && (
                <View style={styles.weeklyRow}>
                  <Text style={styles.weeklyLabel}>
                    {t("stats.mostProductiveDay")}:
                  </Text>
                  <Text style={styles.weeklyValue}>
                    {translateDayName(stats.weekly.mostProductiveDay)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Monthly Stats */}
        {stats?.monthly && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📆 {t("stats.thisMonth")}</Text>
            <View style={styles.monthlyCard}>
              <View style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>
                  {t("stats.totalPomodoros")}:
                </Text>
                <Text style={styles.monthlyValue}>
                  {stats.monthly.totalPomodoros}
                </Text>
              </View>
              <View style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>{t("stats.workTime")}:</Text>
                <Text style={styles.monthlyValue}>
                  {formatWorkTime(stats.monthly.totalWorkTime)}
                </Text>
              </View>
              <View style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>{t("tasks.completed")}:</Text>
                <Text style={styles.monthlyValue}>
                  {stats.monthly.completedTasks}
                </Text>
              </View>
              <View style={styles.monthlyRow}>
                <Text style={styles.monthlyLabel}>
                  {t("stats.averagePerDay")}:
                </Text>
                <Text style={styles.monthlyValue}>
                  {Math.round(stats.monthly.averageDailyPomodoros * 10) / 10}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievements Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 {t("stats.achievements")}</Text>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementText}>
              {t("stats.unlockedCount", {
                count: getAchievementCount(),
                total: 10,
              })}
            </Text>
            <Text style={styles.achievementHint}>
              {t("stats.achievementsHint")}
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Custom Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDatePicker}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackground}
              onPress={closeDatePicker}
            />
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>
                  {datePickerMode === "start"
                    ? t("stats.selectStartDate")
                    : t("stats.selectEndDate")}
                </Text>
                <Pressable onPress={closeDatePicker}>
                  <Text style={styles.datePickerClose}>✕</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={
                  datePickerMode === "start" ? customStartDate : customEndDate
                }
                mode="date"
                display="spinner"
                onChange={handleDatePickerChange}
                minimumDate={
                  datePickerMode === "end" ? customStartDate : undefined
                }
                maximumDate={new Date()}
                style={styles.datePicker}
                textColor="#000000"
              />

              <View style={styles.datePickerButtons}>
                <Button
                  mode="contained"
                  onPress={handleIOSDatePickerDone}
                  style={styles.datePickerButton}
                >
                  {datePickerMode === "start"
                    ? t("general.continue")
                    : t("general.done")}
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryCard: {
    backgroundColor: theme.colors.primary,
  },
  successCard: {
    backgroundColor: theme.colors.secondary,
  },
  infoCard: {
    backgroundColor: theme.colors.accent,
  },
  warningCard: {
    backgroundColor: theme.colors.tertiary,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
  },
  streakCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakEmoji: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
    marginBottom: 4,
  },
  longestStreak: {
    fontSize: 12,
    color: "#B45309",
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    borderRadius: 16,
  },
  weeklyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weeklyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  weeklyLabel: {
    fontSize: 14,
    color: "#4A5568",
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  monthlyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  monthlyLabel: {
    fontSize: 14,
    color: "#4A5568",
  },
  monthlyValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.secondary,
  },
  achievementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  achievementHint: {
    fontSize: 12,
    color: "#718096",
  },
  bottomSpacing: {
    height: 40,
  },
  dateRangeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: "#F5F7FA",
  },
  segmentButton: {
    borderColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    minHeight: 400,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  datePickerClose: {
    fontSize: 24,
    color: "#718096",
    fontWeight: "600",
  },
  datePicker: {
    width: "100%",
  },
  datePickerButtons: {
    marginTop: 16,
    alignItems: "center",
  },
  datePickerButton: {
    minWidth: 120,
    backgroundColor: theme.colors.primary,
  },
  emptyStateContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyChartContainer: {
    backgroundColor: "#F7FAFC",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyChartIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyChartText: {
    fontSize: 14,
    color: "#A0AEC0",
    textAlign: "center",
  },
});
