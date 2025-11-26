import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  ProgressBar,
  Chip,
} from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { useReward } from "../contexts/RewardContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * RewardSummaryScreen - Leaderboard showing student points
 * Phase 3 Frontend Session 2
 */
export default function RewardSummaryScreen() {
  const theme = useTheme();
  const { classId } = useLocalSearchParams();
  const { summary, isLoading, loadRewardSummary } = useReward();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (classId) {
      loadRewardSummary(classId);
    }
  }, [classId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRewardSummary(classId);
    setRefreshing(false);
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#E0E0E0"; // Gray
    }
  };

  const getPointsColor = (points) => {
    if (points > 0) return "#4CAF50"; // Green
    if (points < 0) return "#F44336"; // Red
    return "#757575"; // Gray
  };

  // Calculate max points for progress bars
  const getMaxPoints = () => {
    if (!summary?.students || summary.students.length === 0) return 100;
    const maxPoints = Math.max(
      ...summary.students.map((s) => Math.abs(s.totalPoints))
    );
    return maxPoints || 100;
  };

  const maxPoints = getMaxPoints();

  if (isLoading && !summary) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const students = summary?.students || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={64}
              color="#BDBDBD"
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Chưa có dữ liệu
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              Chưa có học sinh nào nhận phần thưởng hoặc phạt trong lớp này.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <View style={styles.headerCard}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                🏆 Bảng Xếp Hạng
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {students.length} học sinh
              </Text>
            </View>

            {students.map((student, index) => {
              const rank = index + 1;
              const medal = getMedalIcon(rank);
              const progress = Math.abs(student.totalPoints) / maxPoints;

              return (
                <Card
                  key={student.studentId}
                  style={[
                    styles.studentCard,
                    rank <= 3 && { borderLeftColor: getRankColor(rank) },
                  ]}
                >
                  <Card.Content>
                    <View style={styles.studentHeader}>
                      <View style={styles.studentLeft}>
                        <View style={styles.rankContainer}>
                          {medal ? (
                            <Text style={styles.medalIcon}>{medal}</Text>
                          ) : (
                            <Text style={styles.rankNumber}>#{rank}</Text>
                          )}
                        </View>
                        <View style={styles.studentInfo}>
                          <Text
                            variant="titleMedium"
                            style={styles.studentName}
                          >
                            {student.studentName}
                          </Text>
                          <View style={styles.statsRow}>
                            <Chip
                              icon="trophy"
                              compact
                              style={styles.statChip}
                              textStyle={styles.statChipText}
                            >
                              {student.rewardCount || 0}
                            </Chip>
                            <Chip
                              icon="alert-circle"
                              compact
                              style={styles.statChip}
                              textStyle={styles.statChipText}
                            >
                              {student.penaltyCount || 0}
                            </Chip>
                          </View>
                        </View>
                      </View>
                      <View style={styles.studentRight}>
                        <Text
                          variant="headlineMedium"
                          style={[
                            styles.points,
                            { color: getPointsColor(student.totalPoints) },
                          ]}
                        >
                          {student.totalPoints > 0 ? "+" : ""}
                          {student.totalPoints}
                        </Text>
                        <Text variant="bodySmall" style={styles.pointsLabel}>
                          điểm
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={progress}
                        color={getPointsColor(student.totalPoints)}
                        style={styles.progressBar}
                      />
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#757575",
  },
  studentCard: {
    marginVertical: 6,
    marginHorizontal: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#E0E0E0",
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  rankContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  medalIcon: {
    fontSize: 32,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#757575",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
  },
  statChip: {
    height: 24,
    backgroundColor: "#F5F5F5",
  },
  statChipText: {
    fontSize: 11,
    marginVertical: 0,
  },
  studentRight: {
    alignItems: "center",
    marginLeft: 12,
  },
  points: {
    fontWeight: "bold",
  },
  pointsLabel: {
    color: "#757575",
    fontSize: 11,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#757575",
    textAlign: "center",
  },
});
