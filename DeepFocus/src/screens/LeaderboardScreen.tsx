import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
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
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { classAPI } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LeaderboardScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(10);

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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t("leaderboard.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={styles.infoText}>
                {t("leaderboard.description")}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {leaderboard.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={64}
                color={theme.colors.outline}
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {t("leaderboard.noData")}
              </Text>
              <Text variant="bodyMedium" style={styles.emptyDescription}>
                {t("leaderboard.noDataDescription")}
              </Text>
            </Card.Content>
          </Card>
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
      </ScrollView>
    </View>
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
    paddingTop: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
  },
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
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "bold",
  },
  emptyDescription: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
  },
  loadMoreCard: {
    margin: 16,
    marginTop: 8,
  },
  loadMoreChip: {
    alignSelf: "center",
  },
});
