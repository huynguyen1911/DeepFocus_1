import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
  DataTable,
  SegmentedButtons,
  Divider,
  IconButton,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useSession } from "../contexts/SessionContext";
import { useLanguage } from "../contexts/LanguageContext";
import { classAPI } from "../services/api";
import { LineChart, BarChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";

const screenWidth = Dimensions.get("window").width;

export default function ClassStatisticsScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadClassSessions, sessions, isLoading } = useSession();

  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any>(null);
  const [selectedView, setSelectedView] = useState("leaderboard");
  const [dateRange, setDateRange] = useState("week");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {t("statistics.title")}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t("statistics.classPerformance")}
          </Text>
        </Card.Content>
      </Card>

      {/* Date Range Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("statistics.dateRange")}
          </Text>
          <SegmentedButtons
            value={dateRange}
            onValueChange={handleDateRangeChange}
            buttons={[
              { value: "week", label: t("statistics.week") },
              { value: "month", label: t("statistics.month") },
              { value: "all", label: t("statistics.all") },
            ]}
            style={styles.segmentedButtons}
          />

          {/* Custom Date Range */}
          {dateRange === "custom" && (
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerRow}>
                <Text variant="bodyMedium">{t("statistics.from")}: </Text>
                <Chip onPress={() => setShowStartPicker(true)}>
                  {formatDate(startDate)}
                </Chip>
              </View>
              <View style={styles.datePickerRow}>
                <Text variant="bodyMedium">{t("statistics.to")}: </Text>
                <Chip onPress={() => setShowEndPicker(true)}>
                  {formatDate(endDate)}
                </Chip>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* View Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={selectedView}
            onValueChange={setSelectedView}
            buttons={[
              { value: "leaderboard", label: t("statistics.leaderboard"), icon: "trophy" },
              { value: "charts", label: t("statistics.charts"), icon: "chart-line" },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Leaderboard View */}
      {selectedView === "leaderboard" && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                {t("statistics.topStudents")}
              </Text>
              <IconButton
                icon="refresh"
                size={20}
                onPress={loadLeaderboard}
                disabled={loadingLeaderboard}
              />
            </View>

            {loadingLeaderboard ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : leaderboard.length > 0 ? (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={{ flex: 0.5 }}>
                    {t("statistics.rank")}
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 2 }}>
                    {t("statistics.student")}
                  </DataTable.Title>
                  <DataTable.Title numeric style={{ flex: 1 }}>
                    {t("statistics.sessions")}
                  </DataTable.Title>
                  <DataTable.Title numeric style={{ flex: 1.5 }}>
                    {t("statistics.duration")}
                  </DataTable.Title>
                </DataTable.Header>

                {leaderboard.map((student, index) => (
                  <DataTable.Row key={student.userId?._id || index}>
                    <DataTable.Cell style={{ flex: 0.5 }}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2 }}>
                      {student.userId?.username || "Unknown"}
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{ flex: 1 }}>
                      {student.totalSessions}
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={{ flex: 1.5 }}>
                      {formatDuration(student.totalDuration)}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            ) : (
              <View style={styles.emptyContainer}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t("statistics.noData")}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Charts View */}
      {selectedView === "charts" && (
        <>
          {/* Sessions Chart */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("statistics.sessionsOverTime")}
              </Text>
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
                <View style={styles.emptyContainer}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t("statistics.noData")}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Duration Chart */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("statistics.durationOverTime")}
              </Text>
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
                <View style={styles.emptyContainer}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t("statistics.noData")}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Session Type Distribution */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("statistics.sessionTypes")}
              </Text>
              {sessions && sessions.length > 0 ? (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                      {sessions.filter((s: any) => s.type === "focus").length}
                    </Text>
                    <Text variant="bodySmall">{t("statistics.focus")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                      {sessions.filter((s: any) => s.type === "short-break").length}
                    </Text>
                    <Text variant="bodySmall">{t("statistics.shortBreak")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                      {sessions.filter((s: any) => s.type === "long-break").length}
                    </Text>
                    <Text variant="bodySmall">{t("statistics.longBreak")}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t("statistics.noData")}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              loadSessions();
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
              loadSessions();
            }
          }}
        />
      )}
    </ScrollView>
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
  card: {
    margin: 16,
    marginBottom: 0,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  datePickerContainer: {
    marginTop: 16,
    gap: 12,
  },
  datePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
});
