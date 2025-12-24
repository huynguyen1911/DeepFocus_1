import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Avatar,
  Chip,
  IconButton,
  Divider,
  SegmentedButtons,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { classAPI } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function LeaderboardScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(10);
  const [timeFilter, setTimeFilter] = useState<"week" | "month">("week");

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await classAPI.getLeaderboard(id, limit);
      
      if (response?.success) {
        setLeaderboard(response.leaderboard || []);
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("leaderboard.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [id, limit, t]);

  useEffect(() => {
    if (id) {
      loadLeaderboard();
    }
  }, [id, loadLeaderboard]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [loadLeaderboard]);

  const getRankColor = useCallback((rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return theme.colors.outline;
    }
  }, [theme.colors.outline]);

  const getRankIcon = useCallback((rank: number) => {
    switch (rank) {
      case 1:
        return "trophy";
      case 2:
        return "medal";
      case 3:
        return "medal-outline";
      default:
        return "account";
    }
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    if (minutes < 60) {
      return `${minutes}${t("common.minutes")}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}${t("common.hours")} ${mins}${t("common.minutes")}`;
  }, [t]);

  const renderLeaderboardItem = useCallback((item: any, index: number) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;

    return (
      <Card
        key={item._id || index}
        style={[
          styles.leaderboardCard,
          isTopThree && { borderLeftWidth: 4, borderLeftColor: getRankColor(rank) },
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.rankContainer}>
            <MaterialCommunityIcons
              name={getRankIcon(rank)}
              size={32}
              color={getRankColor(rank)}
            />
            <Text
              style={[
                styles.rankText,
                { color: getRankColor(rank) },
                isTopThree && styles.topRankText,
              ]}
            >
              #{rank}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Avatar.Text
              size={48}
              label={item.username?.substring(0, 2).toUpperCase() || "??"}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.userDetails}>
              <Text variant="titleMedium" style={styles.username}>
                {item.username || t("common.unknown")}
              </Text>
              <Text variant="bodySmall" style={styles.email}>
                {item.email || ""}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={20}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={styles.statValue}>
                {item.totalSessions || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t("leaderboard.sessions")}
              </Text>
            </View>

            <Divider style={styles.statDivider} />

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <Text variant="bodyMedium" style={styles.statValue}>
                {formatDuration(item.totalDuration || 0)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t("leaderboard.duration")}
              </Text>
            </View>

            <Divider style={styles.statDivider} />

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color={theme.colors.tertiary}
              />
              <Text variant="bodyMedium" style={styles.statValue}>
                {item.completedTasks || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t("leaderboard.tasks")}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }, [getRankColor, getRankIcon, formatDuration, theme.colors, t]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t("leaderboard.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="headlineSmall" style={styles.title}>
          {t("leaderboard.title")}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={timeFilter}
          onValueChange={(value) => setTimeFilter(value as "week" | "month")}
          buttons={[
            {
              value: "week",
              label: t("leaderboard.thisWeek"),
              icon: "calendar-week",
            },
            {
              value: "month",
              label: t("leaderboard.thisMonth"),
              icon: "calendar-month",
            },
          ]}
          style={styles.segmentedButtons}
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
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={["#FFF9E6", "#FFE4F0", "#E6F0FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyGradient}
            >
              <View style={styles.podiumContainer}>
                <View style={styles.podiumRank2}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={32}
                    color="#C0C0C0"
                  />
                  <View style={styles.podiumBase2}>
                    <Text style={styles.podiumNumber}>2</Text>
                  </View>
                </View>
                <View style={styles.podiumRank1}>
                  <MaterialCommunityIcons
                    name="crown-outline"
                    size={40}
                    color="#FFD700"
                  />
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={36}
                    color="#FFD700"
                  />
                  <View style={styles.podiumBase1}>
                    <Text style={styles.podiumNumber}>1</Text>
                  </View>
                </View>
                <View style={styles.podiumRank3}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={32}
                    color="#CD7F32"
                  />
                  <View style={styles.podiumBase3}>
                    <Text style={styles.podiumNumber}>3</Text>
                  </View>
                </View>
              </View>

              <Text variant="headlineSmall" style={styles.emptyTitle}>
                {t("leaderboard.emptyTitle")}
              </Text>
              <Text variant="bodyMedium" style={styles.emptyDescription}>
                {t("leaderboard.emptyDescription")}
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.leaderboardContainer}>
            {leaderboard.map((item, index) => renderLeaderboardItem(item, index))}
          </View>
        )}

        {leaderboard.length >= limit && (
          <Card style={styles.loadMoreCard}>
            <Card.Content>
              <Chip
                icon="chevron-down"
                onPress={() => setLimit(limit + 10)}
                style={styles.loadMoreChip}
              >
                {t("leaderboard.loadMore")}
              </Chip>
            </Card.Content>
          </Card>
        )}

        {/* Footer info - moved from top */}
        <View style={styles.footerInfo}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color="#999"
          />
          <Text variant="bodySmall" style={styles.footerText}>
            {t("leaderboard.description")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  segmentedButtons: {
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  // Empty state styles
  emptyContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 2,
  },
  emptyGradient: {
    padding: 40,
    alignItems: "center",
  },
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 24,
    gap: 8,
  },
  podiumRank1: {
    alignItems: "center",
    marginBottom: 8,
  },
  podiumRank2: {
    alignItems: "center",
    marginBottom: 0,
  },
  podiumRank3: {
    alignItems: "center",
    marginBottom: 0,
  },
  podiumBase1: {
    width: 60,
    height: 80,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
  },
  podiumBase2: {
    width: 55,
    height: 60,
    backgroundColor: "#C0C0C0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
  },
  podiumBase3: {
    width: 55,
    height: 50,
    backgroundColor: "#CD7F32",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
  },
  podiumNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    color: "#333",
  },
  emptyDescription: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  // Leaderboard list styles
  leaderboardContainer: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  leaderboardCard: {
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rankContainer: {
    alignItems: "center",
    width: 60,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  topRankText: {
    fontSize: 18,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
  },
  email: {
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontWeight: "bold",
  },
  statLabel: {
    color: "#666",
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  loadMoreCard: {
    margin: 16,
    marginTop: 8,
  },
  loadMoreChip: {
    alignSelf: "center",
  },
  // Footer info styles
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    flex: 1,
  },
});
