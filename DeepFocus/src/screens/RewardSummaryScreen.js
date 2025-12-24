import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  ProgressBar,
  Chip,
  IconButton,
  SegmentedButtons,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
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
  const [filterType, setFilterType] = useState("rewards"); // rewards, penalties

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

  // Filter and sort students based on selected tab
  const getFilteredStudents = () => {
    const allStudents = summary?.students || [];

    if (filterType === "rewards") {
      // Show students with positive points, sorted descending
      return allStudents
        .filter((s) => s.totalPoints > 0)
        .sort((a, b) => b.totalPoints - a.totalPoints);
    } else {
      // Show students with negative points, sorted by most penalties (most negative first)
      return allStudents
        .filter((s) => s.totalPoints < 0)
        .sort((a, b) => a.totalPoints - b.totalPoints);
    }
  };

  const filteredStudents = getFilteredStudents();

  // Render empty state based on tab
  const renderEmptyState = () => {
    const isRewardsTab = filterType === "rewards";
    const icon = isRewardsTab ? "🎁" : "⚠️";
    const title = isRewardsTab ? "Chưa có ngôi sao nào" : "Lớp rất ngoan!";
    const description = isRewardsTab
      ? "Chưa có ngôi sao nào được trao."
      : "Lớp học rất ngoan, chưa ai bị nhắc nhở!";

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyDescription}>
          {description}
        </Text>
      </View>
    );
  };

  if (isLoading && !summary) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={styles.title}>
          Thống Kê Thi Đua
        </Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={[
            {
              value: "rewards",
              label: "Khen Thưởng",
              icon: "trophy",
            },
            {
              value: "penalties",
              label: "Nhắc Nhở",
              icon: "alert-circle",
            },
          ]}
          style={styles.segmentedButtons}
          theme={{
            colors: {
              secondaryContainer: theme.colors.primary,
              onSecondaryContainer: "#FFFFFF",
            },
          }}
        />
      </View>

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
        {filteredStudents.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.listContainer}>
            <View style={styles.headerCard}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                {filterType === "rewards"
                  ? "🏆 Top Khen Thưởng"
                  : "⚠️ Top Nhắc Nhở"}
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {filteredStudents.length} học sinh
              </Text>
            </View>

            {filteredStudents.map((student, index) => {
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
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#fff",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  title: {
    fontWeight: "bold",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    elevation: 1,
  },
  segmentedButtons: {
    marginBottom: 0,
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    lineHeight: 22,
  },
});
