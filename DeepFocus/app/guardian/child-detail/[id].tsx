import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  SegmentedButtons,
  ActivityIndicator,
  Text,
  Chip,
  useTheme,
  Divider,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useGuardian } from "@/src/contexts/GuardianContext";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { getChildProgress } = useGuardian();

  const [period, setPeriod] = useState("week");
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProgress();
  }, [period]);

  const loadProgress = async () => {
    setLoading(true);
    setError("");
    const result = await getChildProgress(id as string, period);
    setLoading(false);

    if (result.success) {
      setProgressData(result.data);
    } else {
      setError(result.error || "Không thể tải dữ liệu");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải chi tiết...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </ThemedView>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {progressData && (
          <>
            {/* Period Selector */}
            <View style={styles.periodSelector}>
              <SegmentedButtons
                value={period}
                onValueChange={setPeriod}
                buttons={[
                  { value: "week", label: "Tuần" },
                  { value: "month", label: "Tháng" },
                  { value: "all", label: "Tất cả" },
                ]}
              />
            </View>

            {/* Overall Stats Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Tổng quan</Title>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {progressData.totalPomodoros}
                    </Text>
                    <Text style={styles.statLabel}>Pomodoros</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {progressData.totalMinutes}
                    </Text>
                    <Text style={styles.statLabel}>Phút</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {progressData.completionRate}%
                    </Text>
                    <Text style={styles.statLabel}>Hoàn thành</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {progressData.currentStreak}
                    </Text>
                    <Text style={styles.statLabel}>Chuỗi ngày</Text>
                  </View>
                </View>

                {/* Trend Indicator */}
                {progressData.trend && (
                  <View style={styles.trendContainer}>
                    <Text style={styles.trendText}>
                      {getTrendIcon(progressData.trend)}{" "}
                      {progressData.trend === "up"
                        ? "Tiến bộ so với kỳ trước"
                        : progressData.trend === "down"
                        ? "Giảm so với kỳ trước"
                        : "Ổn định so với kỳ trước"}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Classes Section */}
            {progressData.classes && progressData.classes.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Title>Lớp học ({progressData.classes.length})</Title>
                  {progressData.classes.map((classItem: any, index: number) => (
                    <View key={index}>
                      {index > 0 && <Divider style={{ marginVertical: 12 }} />}
                      <View style={styles.classItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.className}>
                            {classItem.name}
                          </Text>
                          <Text style={styles.classTeacher}>
                            {classItem.teacher}
                          </Text>
                          <View style={styles.classStats}>
                            <Chip
                              icon="trophy"
                              style={styles.rankChip}
                              compact
                            >
                              #{classItem.rank}/{classItem.totalMembers}
                            </Chip>
                            <Text style={styles.pointsText}>
                              {classItem.points} điểm
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}

            {/* Recent Rewards Section */}
            {progressData.recentRewards &&
              progressData.recentRewards.length > 0 && (
                <Card style={styles.card}>
                  <Card.Content>
                    <Title>
                      Phần thưởng gần đây ({progressData.recentRewards.length})
                    </Title>
                    {progressData.recentRewards.map(
                      (reward: any, index: number) => (
                        <View key={index}>
                          {index > 0 && (
                            <Divider style={{ marginVertical: 12 }} />
                          )}
                          <View style={styles.rewardItem}>
                            <Text style={styles.rewardEmoji}>
                              {reward.emoji || "🎁"}
                            </Text>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.rewardTitle}>
                                {reward.title}
                              </Text>
                              <Text style={styles.rewardDate}>
                                {new Date(reward.date).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Text>
                            </View>
                            <Chip icon="star" compact>
                              {reward.points}
                            </Chip>
                          </View>
                        </View>
                      )
                    )}
                  </Card.Content>
                </Card>
              )}

            {/* Empty state for no data */}
            {progressData.totalPomodoros === 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.emptyText}>
                    Chưa có dữ liệu trong khoảng thời gian này
                  </Text>
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
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
    padding: 20,
  },
  periodSelector: {
    padding: 16,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statBox: {
    width: "48%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  trendContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  trendText: {
    fontSize: 14,
    textAlign: "center",
  },
  classItem: {
    flexDirection: "row",
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  classTeacher: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  classStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankChip: {
    marginRight: 8,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: "600",
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardEmoji: {
    fontSize: 32,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  rewardDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    paddingVertical: 20,
  },
});
