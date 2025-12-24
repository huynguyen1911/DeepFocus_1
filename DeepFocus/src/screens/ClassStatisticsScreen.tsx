import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  IconButton,
  Avatar,
} from "react-native-paper";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useSession } from "../contexts/SessionContext";
import { useLanguage } from "../contexts/LanguageContext";
import { classAPI } from "../services/api";
import { LineChart, BarChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function ClassStatisticsScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadClassSessions, sessions, isLoading } = useSession();

  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any>(null);
  const [dateRange, setDateRange] = useState("week");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, dateRange]);

  const loadData = async () => {
    await Promise.all([
      loadLeaderboard(),
      loadSessions(),
    ]);
  };

  const loadLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const response = await classAPI.getLeaderboard(id, 10);
      
      if (response.success && response.data?.leaderboard) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error: any) {
      console.error("Load leaderboard failed:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("statistics.loadError")
      );
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const loadSessions = async () => {
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      await loadClassSessions(id, params);
    } catch (error: any) {
      console.error("Load sessions failed:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    const now = new Date();
    
    switch (value) {
      case "week":
        setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case "month":
        setStartDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
      case "all":
        setStartDate(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));
        setEndDate(now);
        break;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Prepare chart data
  const getSessionsChartData = () => {
    if (!sessions || sessions.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    // Group sessions by date
    const sessionsByDate: { [key: string]: number } = {};
    sessions.forEach((session: any) => {
      const date = new Date(session.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      sessionsByDate[date] = (sessionsByDate[date] || 0) + 1;
    });

    const labels = Object.keys(sessionsByDate).slice(-7); // Last 7 days
    const data = labels.map((label) => sessionsByDate[label] || 0);

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const getDurationChartData = () => {
    if (!sessions || sessions.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      };
    }

    // Group duration by date
    const durationByDate: { [key: string]: number } = {};
    sessions.forEach((session: any) => {
      const date = new Date(session.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      durationByDate[date] = (durationByDate[date] || 0) + (session.duration || 0);
    });

    const labels = Object.keys(durationByDate).slice(-7); // Last 7 days
    const data = labels.map((label) => Math.round(durationByDate[label]) || 0);

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(103, 80, 164, ${opacity})`,
    labelColor: (opacity = 1) => theme.dark 
      ? `rgba(255, 255, 255, ${opacity})` 
      : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary,
    },
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header Card with Back Button */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={28}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text variant="headlineSmall" style={styles.title}>
                  Thống Kế
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Hiệu suất lớp học
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

      {/* Filter Chips - Horizontal Scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsContainer}
        style={styles.filterChipsScroll}
      >
        <Chip
          selected={dateRange === "week"}
          onPress={() => handleDateRangeChange("week")}
          style={[styles.filterChip, dateRange === "week" && { backgroundColor: theme.colors.primaryContainer }]}
          textStyle={dateRange === "week" && { color: theme.colors.onPrimaryContainer }}
        >
          7 Ngày
        </Chip>
        <Chip
          selected={dateRange === "month"}
          onPress={() => handleDateRangeChange("month")}
          style={[styles.filterChip, dateRange === "month" && { backgroundColor: theme.colors.primaryContainer }]}
          textStyle={dateRange === "month" && { color: theme.colors.onPrimaryContainer }}
        >
          30 Ngày
        </Chip>
        <Chip
          selected={dateRange === "all"}
          onPress={() => handleDateRangeChange("all")}
          style={[styles.filterChip, dateRange === "all" && { backgroundColor: theme.colors.primaryContainer }]}
          textStyle={dateRange === "all" && { color: theme.colors.onPrimaryContainer }}
        >
          Tất cả
        </Chip>
      </ScrollView>

      {/* Section 1: Top 3 Students Podium */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="trophy" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitleText}>
                Học Sinh Xuất Sắc
              </Text>
            </View>
            <IconButton
              icon="refresh"
              size={20}
              onPress={loadLeaderboard}
              disabled={loadingLeaderboard}
            />
          </View>

          {loadingLeaderboard ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 32 }} />
          ) : leaderboard.length > 0 ? (
            <>
              {/* Top 3 Podium */}
              <View style={styles.podiumContainer}>
                {/* Rank 2 - Left */}
                {leaderboard[1] && (
                  <View style={styles.podiumItem}>
                    <Avatar.Text
                      size={56}
                      label={leaderboard[1].userId?.username?.substring(0, 2).toUpperCase() || "??"}
                      style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}
                    />
                    <Text variant="bodySmall" style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[1].userId?.username || "Unknown"}
                    </Text>
                    <View style={[styles.podiumRank, { backgroundColor: "#C0C0C0" }]}>
                      <Text variant="titleMedium" style={styles.podiumRankText}>2</Text>
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDuration(leaderboard[1].totalDuration)}
                    </Text>
                  </View>
                )}

                {/* Rank 1 - Center (Bigger) */}
                {leaderboard[0] && (
                  <View style={[styles.podiumItem, styles.podiumWinner]}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={28}
                      color="#FFD700"
                      style={styles.crownIcon}
                    />
                    <Avatar.Text
                      size={72}
                      label={leaderboard[0].userId?.username?.substring(0, 2).toUpperCase() || "??"}
                      style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
                    />
                    <Text variant="bodyMedium" style={[styles.podiumName, { fontWeight: "bold" }]} numberOfLines={1}>
                      {leaderboard[0].userId?.username || "Unknown"}
                    </Text>
                    <View style={[styles.podiumRank, { backgroundColor: "#FFD700" }]}>
                      <Text variant="titleLarge" style={[styles.podiumRankText, { fontWeight: "bold" }]}>1</Text>
                    </View>
                    <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                      {formatDuration(leaderboard[0].totalDuration)}
                    </Text>
                  </View>
                )}

                {/* Rank 3 - Right */}
                {leaderboard[2] && (
                  <View style={styles.podiumItem}>
                    <Avatar.Text
                      size={56}
                      label={leaderboard[2].userId?.username?.substring(0, 2).toUpperCase() || "??"}
                      style={[styles.avatar, { backgroundColor: theme.colors.tertiaryContainer }]}
                    />
                    <Text variant="bodySmall" style={styles.podiumName} numberOfLines={1}>
                      {leaderboard[2].userId?.username || "Unknown"}
                    </Text>
                    <View style={[styles.podiumRank, { backgroundColor: "#CD7F32" }]}>
                      <Text variant="titleMedium" style={styles.podiumRankText}>3</Text>
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDuration(leaderboard[2].totalDuration)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Rest of the Leaderboard (if more than 3) */}
              {leaderboard.length > 3 && (
                <View style={styles.restLeaderboard}>
                  {leaderboard.slice(3).map((student, index) => (
                    <View key={student.userId?._id || index} style={styles.leaderboardRow}>
                      <View style={styles.leaderboardLeft}>
                        <Text variant="bodyMedium" style={styles.leaderboardRank}>
                          {index + 4}
                        </Text>
                        <Avatar.Text
                          size={40}
                          label={student.userId?.username?.substring(0, 2).toUpperCase() || "??"}
                          style={{ backgroundColor: theme.colors.surfaceVariant }}
                        />
                        <Text variant="bodyMedium" style={styles.leaderboardName}>
                          {student.userId?.username || "Unknown"}
                        </Text>
                      </View>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDuration(student.totalDuration)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="account-school-outline"
                size={64}
                color={theme.colors.surfaceDisabled}
              />
              <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                Lớp học chưa bắt đầu sôi động
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Chưa có ai luyện tập tuần này
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Section 2: Sessions Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitleText}>
              Phiên Theo Thời Gian
            </Text>
          </View>
          {sessions && sessions.length > 0 ? (
            <LineChart
              data={getSessionsChartData()}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={48}
                color={theme.colors.surfaceDisabled}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Chưa có dữ liệu
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Section 3: Duration Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitleText}>
              Thời Lượng Theo Thời Gian
            </Text>
          </View>
          {sessions && sessions.length > 0 ? (
            <BarChart
              data={getDurationChartData()}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="m"
              fromZero
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="chart-bar"
                size={48}
                color={theme.colors.surfaceDisabled}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Chưa có dữ liệu
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Section 4: Session Type Distribution */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.sectionTitleText}>
              Phân Loại Phiên
            </Text>
          </View>
          {sessions && sessions.length > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="brain" size={32} color={theme.colors.primary} />
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginTop: 8 }}>
                  {sessions.filter((s: any) => s.type === "focus").length}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Tập trung
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="coffee" size={32} color={theme.colors.secondary} />
                <Text variant="headlineMedium" style={{ color: theme.colors.secondary, marginTop: 8 }}>
                  {sessions.filter((s: any) => s.type === "short-break").length}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Nghỉ ngắn
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="sleep" size={32} color={theme.colors.tertiary} />
                <Text variant="headlineMedium" style={{ color: theme.colors.tertiary, marginTop: 8 }}>
                  {sessions.filter((s: any) => s.type === "long-break").length}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Nghỉ dài
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="chart-donut"
                size={48}
                color={theme.colors.surfaceDisabled}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Chưa có dữ liệu
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    margin: 16,
    marginBottom: 4,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backButton: {
    marginRight: 8,
    marginTop: -4,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  
  // Filter Chips Styles
  filterChipsScroll: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  filterChipsContainer: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleText: {
    fontWeight: "600",
  },

  // Podium Styles
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingVertical: 24,
    gap: 16,
  },
  podiumItem: {
    alignItems: "center",
    flex: 1,
    maxWidth: 100,
  },
  podiumWinner: {
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 8,
  },
  crownIcon: {
    position: "absolute",
    top: -10,
    zIndex: 1,
  },
  podiumName: {
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  podiumRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  podiumRankText: {
    color: "white",
    fontWeight: "bold",
  },

  // Rest of Leaderboard Styles
  restLeaderboard: {
    marginTop: 16,
    gap: 12,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  leaderboardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  leaderboardRank: {
    width: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  leaderboardName: {
    flex: 1,
  },

  // Chart Styles
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  // Stats Row Styles
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },

  // Empty State Styles
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 8,
  },
});
