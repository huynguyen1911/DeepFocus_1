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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { SegmentedButtons, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
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

    // Calculate date range in days
    const daysDiff = filteredData.length;

    const labels = filteredData.map((day) => {
      const date = new Date(day.date);

      // Smart label formatting based on range
      if (dateRange === "today") {
        // Show hours for today
        return date.toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (daysDiff > 60) {
        // For long ranges (>60 days), show month/year
        return date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "2-digit",
        });
      } else if (daysDiff > 30) {
        // For medium ranges (30-60 days), show day/month
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "short",
        });
      } else {
        // For short ranges (≤30 days), show day/month
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
      }
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

  // Get comparison insights
  const getComparisonInsight = () => {
    if (!stats || !stats.last30Days || stats.last30Days.length < 14) {
      return null;
    }

    const thisWeekData = getFilteredData();
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 13);
    lastWeekStart.setHours(0, 0, 0, 0);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    lastWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekData = stats.last30Days.filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= lastWeekStart && dayDate <= lastWeekEnd;
    });

    if (lastWeekData.length === 0 || thisWeekData.length === 0) return null;

    const thisWeekTotal = thisWeekData.reduce(
      (sum, day) => sum + (day.totalWorkTime || 0),
      0
    );
    const lastWeekTotal = lastWeekData.reduce(
      (sum, day) => sum + (day.totalWorkTime || 0),
      0
    );

    const diff = thisWeekTotal - lastWeekTotal;
    const percentChange = lastWeekTotal > 0 ? (diff / lastWeekTotal) * 100 : 0;

    if (Math.abs(percentChange) < 5) {
      return {
        icon: "📊",
        trend: "stable",
        message: "Phong độ ổn định",
        detail: "Bạn đang duy trì mức độ tập trung đều đặn. Tiếp tục nhé!",
      };
    } else if (percentChange > 0) {
      return {
        icon: "📈",
        trend: "up",
        message: `Phong độ tăng ${Math.round(percentChange)}%`,
        detail: `Bạn đã tập trung nhiều hơn tuần trước ${formatWorkTime(
          diff
        )}. Tiếp tục phát huy nhé!`,
      };
    } else {
      return {
        icon: "📉",
        trend: "down",
        message: `Giảm ${Math.abs(
          Math.round(percentChange)
        )}% so với tuần trước`,
        detail: `Đừng nản lòng! Mỗi ngày đều là cơ hội mới để cải thiện.`,
      };
    }
  };

  // Get time of day insight
  const getTimeOfDayInsight = () => {
    // Simple placeholder - in real app, would analyze actual session times
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Bạn tập trung tốt nhất vào buổi sáng ☀️";
    } else if (hour < 18) {
      return "Bạn tập trung tốt nhất vào buổi chiều 🌤️";
    } else {
      return "Bạn tập trung tốt nhất vào buổi tối 🌙";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Clean Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("stats.statistics")}</Text>
          <Text style={styles.subtitle}>Phong độ tập trung của bạn</Text>
        </View>

        {/* Floating Pill Segmented Control */}
        <View style={styles.dateRangeContainer}>
          <View style={styles.pillContainer}>
            <Pressable
              style={[
                styles.pillButton,
                dateRange === "today" && styles.pillButtonActive,
              ]}
              onPress={() => handleDateRangeChange("today")}
            >
              <Text
                style={[
                  styles.pillText,
                  dateRange === "today" && styles.pillTextActive,
                ]}
              >
                Hôm Nay
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pillButton,
                dateRange === "7days" && styles.pillButtonActive,
              ]}
              onPress={() => handleDateRangeChange("7days")}
            >
              <Text
                style={[
                  styles.pillText,
                  dateRange === "7days" && styles.pillTextActive,
                ]}
              >
                7 Ngày
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pillButton,
                dateRange === "30days" && styles.pillButtonActive,
              ]}
              onPress={() => handleDateRangeChange("30days")}
            >
              <Text
                style={[
                  styles.pillText,
                  dateRange === "30days" && styles.pillTextActive,
                ]}
              >
                30 Ngày
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pillButton,
                dateRange === "custom" && styles.pillButtonActive,
              ]}
              onPress={() => handleDateRangeChange("custom")}
            >
              <Text
                style={[
                  styles.pillText,
                  dateRange === "custom" && styles.pillTextActive,
                ]}
              >
                Tùy chỉnh...
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Hero Card - Main Focus Time Metric */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>Tổng thời gian tập trung</Text>
            <Text style={styles.heroSubLabel}>
              {getChartTitle().replace("📈 ", "")}
            </Text>
          </View>

          {/* Empty State when 0m */}
          {getFilteredStats().totalWorkTime === 0 ? (
            <View style={styles.heroEmptyState}>
              <Text style={styles.heroEmptyIcon}>🌱</Text>
              <Text style={styles.heroEmptyValue}>0m</Text>
              <Text style={styles.heroEmptyMessage}>
                Hôm nay chưa bắt đầu, khởi động thôi!
              </Text>
            </View>
          ) : (
            <Text style={styles.heroValue}>
              {formatWorkTime(getFilteredStats().totalWorkTime)}
            </Text>
          )}

          {/* Secondary Stats Row - Badge Style */}
          <View style={styles.secondaryStatsRow}>
            <View style={styles.secondaryStatBadge}>
              <Text style={styles.secondaryIcon}>🔥</Text>
              <Text style={styles.secondaryValue}>
                {stats?.overall?.currentStreak || 0}
              </Text>
              <Text style={styles.secondaryLabel}>Chuỗi</Text>
            </View>

            <View style={styles.secondaryStatBadge}>
              <Text style={styles.secondaryIcon}>🎖️</Text>
              <Text style={styles.secondaryValue}>
                {getFilteredStats().totalTasks}
              </Text>
              <Text style={styles.secondaryLabel}>Hoàn thành</Text>
            </View>

            <View style={styles.secondaryStatBadge}>
              <Text style={styles.secondaryIcon}>🍅</Text>
              <Text style={styles.secondaryValue}>
                {getFilteredStats().totalPomodoros}
              </Text>
              <Text style={styles.secondaryLabel}>Pomodoros</Text>
            </View>
          </View>
        </View>

        {/* Vibrant Streak Card with Fire Gradient */}
        {stats?.overall?.currentStreak > 0 && (
          <LinearGradient
            colors={["#FF6B35", "#F7931E", "#FDC830"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakGradientCard}
          >
            {/* Decorative circles overlay for texture */}
            <View style={styles.streakCirclesOverlay}>
              <View style={[styles.streakCircle, styles.streakCircle1]} />
              <View style={[styles.streakCircle, styles.streakCircle2]} />
              <View style={[styles.streakCircle, styles.streakCircle3]} />
            </View>

            <Animated.Text style={styles.streakFireIcon}>🔥</Animated.Text>
            <Text style={styles.streakGradientTitle}>
              Tuyệt vời! {stats.overall.currentStreak} ngày liên tiếp!
            </Text>
            <Text style={styles.streakGradientSubtitle}>
              Tiếp tục phát huy! 🔥
            </Text>

            {/* Glassmorphism record badge */}
            <View style={styles.streakRecordBadge}>
              <Text style={styles.streakGradientRecord}>
                Kỷ lục: {stats?.overall?.longestStreak || 0} ngày
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Comparison Insight Card */}
        {getComparisonInsight() && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>
              {getComparisonInsight().icon}
            </Text>
            <Text style={styles.insightMessage}>
              {getComparisonInsight().message}
            </Text>
            <Text style={styles.insightDetail}>
              {getComparisonInsight().detail}
            </Text>
          </View>
        )}

        {/* Time of Day Insight - Pill Shape */}
        <View style={styles.tipPillCard}>
          <Text style={styles.tipPillText}>{getTimeOfDayInsight()}</Text>
        </View>

        {/* Transparent Chart with Smooth Curves */}
        {getFilteredData().length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Biểu đồ tiến độ</Text>
            <View style={styles.transparentChartContainer}>
              <LineChart
                data={getChartData()}
                width={CHART_WIDTH - 32}
                height={200}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(100, 100, 100, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "#6C63FF",
                    fill: "#FFFFFF",
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#E8E4FF",
                    strokeWidth: 1,
                  },
                }}
                bezier
                style={styles.transparentChart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
              />
            </View>
          </View>
        )}

        {/* Achievement Preview with Progress Bar */}
        <View style={styles.achievementSection}>
          <Text style={styles.achievementSectionTitle}>🏆 Thành Tựu</Text>
          <View style={styles.achievementPreviewCard}>
            <Text style={styles.achievementPreviewTitle}>
              Đã mở khóa: {getAchievementCount()}/10 thành tựu
            </Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={["#6C63FF", "#E879F9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarGradient,
                  { width: `${(getAchievementCount() / 10) * 100}%` },
                ]}
              />
              {/* Gift icon at the end */}
              <View style={styles.progressGiftIcon}>
                <Text style={styles.giftIconText}>🎁</Text>
              </View>
            </View>
            <Text style={styles.achievementPreviewHint}>
              (Xem chi tiết trong phần Thành Tựu)
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
    backgroundColor: "#FFFFFF",
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

  // Clean Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1A202C",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#718096",
    marginTop: 4,
    fontWeight: "400",
  },

  // Floating Pill Segmented Control
  dateRangeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  pillContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 100,
    padding: 4,
    gap: 4,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  pillButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  pillTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },

  // Hero Card Styles
  heroCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 15,
    color: "#718096",
    fontWeight: "500",
  },
  heroSubLabel: {
    fontSize: 13,
    color: "#A0AEC0",
    marginTop: 2,
  },
  heroValue: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#6C63FF",
    letterSpacing: -1,
    marginBottom: 12,
  },

  // Hero Empty State
  heroEmptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  heroEmptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  heroEmptyValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#CBD5E0",
    marginBottom: 8,
  },
  heroEmptyMessage: {
    fontSize: 15,
    color: "#6C63FF",
    fontWeight: "500",
    fontStyle: "italic",
  },

  // Mini Chart in Hero Card
  miniChartContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  miniChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 70,
    gap: 3,
  },
  miniBar: {
    flex: 1,
    backgroundColor: "#E8E4FF",
    borderRadius: 4,
    minHeight: 10,
  },

  // Secondary Stats Row - Badge Style
  secondaryStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  secondaryStatBadge: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 90,
  },
  secondaryStat: {
    alignItems: "center",
  },
  secondaryIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  secondaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 2,
  },
  secondaryLabel: {
    fontSize: 12,
    color: "#A0AEC0",
    fontWeight: "500",
  },

  // Vibrant Streak Card with Gradient
  streakGradientCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  // Decorative circles overlay for texture
  streakCirclesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  streakCircle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 1000,
  },
  streakCircle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },
  streakCircle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -20,
  },
  streakCircle3: {
    width: 60,
    height: 60,
    top: 50,
    left: 30,
  },
  streakFireIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  streakGradientTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  streakGradientSubtitle: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    opacity: 0.95,
  },
  // Glassmorphism record badge
  streakRecordBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  streakGradientRecord: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Comparison Insight Card
  insightCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#F7FAFC",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#6C63FF",
  },
  insightIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  insightMessage: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 6,
  },
  insightDetail: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },

  // Time of Day Tip Card - Pill Shape
  tipPillCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#FFF9C4",
    borderRadius: 100,
    alignSelf: "center",
    maxWidth: "90%",
  },
  tipPillText: {
    fontSize: 14,
    color: "#7C3AED",
    textAlign: "center",
    fontWeight: "500",
    fontStyle: "italic",
  },

  // Legacy tip card (kept for compatibility)
  tipCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#EBF8FF",
    borderRadius: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#2C5282",
    textAlign: "center",
    fontWeight: "500",
  },

  // Transparent Chart Section
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  transparentChartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transparentChart: {
    borderRadius: 16,
    marginLeft: -16,
  },

  // Achievement Section with Progress Bar
  achievementSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  achievementSectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  achievementPreviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementPreviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
  },
  progressBarGradient: {
    height: "100%",
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6C63FF",
    borderRadius: 4,
  },
  // Gift icon at the end of progress bar
  progressGiftIcon: {
    position: "absolute",
    right: -4,
    top: -12,
    width: 32,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  giftIconText: {
    fontSize: 18,
  },
  achievementPreviewHint: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
    fontStyle: "italic",
  },

  bottomSpacing: {
    height: 40,
  },

  // Modal Styles
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

  // Empty State Styles
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

  // Legacy styles for compatibility (can be removed if not used elsewhere)
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
