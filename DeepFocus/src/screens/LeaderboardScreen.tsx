import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function LeaderboardScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(50);
  const [timeFilter, setTimeFilter] = useState<"week" | "month">("week");

  // Find current user's rank
  const currentUserRank = useMemo(() => {
    const userIndex = leaderboard.findIndex(
      (item) => item.userId === user?.userId || item.email === user?.email
    );
    return userIndex >= 0 ? userIndex + 1 : null;
  }, [leaderboard, user]);

  const currentUserData = useMemo(() => {
    if (!currentUserRank) return null;
    return leaderboard[currentUserRank - 1];
  }, [leaderboard, currentUserRank]);

  // Split top 3 and rest
  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const restOfLeaderboard = useMemo(() => leaderboard.slice(3), [leaderboard]);

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
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, [t]);

  // Render Podium (Top 3)
  const renderPodium = useCallback(() => {
    if (topThree.length === 0) return null;

    const positions = [
      topThree[1], // Rank 2 (Left)
      topThree[0], // Rank 1 (Center)
      topThree[2], // Rank 3 (Right)
    ];

    const heights = [100, 130, 80]; // Heights for rank 2, 1, 3
    const colors = ["#C0C0C0", "#FFD700", "#CD7F32"];
    const ranks = [2, 1, 3];

    return (
      <LinearGradient
        colors={["#E8D7FF", "#FFE4F0", "#E6F0FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.podiumContainer}
      >
        <View style={styles.podiumRow}>
          {positions.map((user, index) => {
            if (!user) return <View key={index} style={{ flex: 1 }} />;
            
            const rank = ranks[index];
            const isFirst = rank === 1;
            
            return (
              <View key={index} style={styles.podiumItem}>
                {/* Crown for rank 1 */}
                {isFirst && (
                  <MaterialCommunityIcons
                    name="crown"
                    size={32}
                    color="#FFD700"
                    style={styles.crownIcon}
                  />
                )}
                
                {/* Avatar */}
                <View
                  style={[
                    styles.podiumAvatar,
                    {
                      borderColor: colors[index],
                      borderWidth: 3,
                    },
                    isFirst && styles.podiumAvatarGlow,
                  ]}
                >
                  <Avatar.Text
                    size={isFirst ? 64 : 56}
                    label={user.username?.substring(0, 2).toUpperCase() || "??"}
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                </View>

                {/* Username */}
                <Text
                  variant="bodySmall"
                  style={[styles.podiumName, isFirst && styles.podiumNameFirst]}
                  numberOfLines={1}
                >
                  {user.username || "User"}
                </Text>

                {/* Stats */}
                <View style={styles.podiumStats}>
                  <Text style={[styles.podiumScore, { color: colors[index] }]}>
                    {user.totalSessions || 0} 🍅
                  </Text>
                  <Text style={styles.podiumTime}>
                    {formatDuration(user.totalDuration || 0)} ⏱️
                  </Text>
                </View>

                {/* Podium Base */}
                <View
                  style={[
                    styles.podiumBase,
                    {
                      height: heights[index],
                      backgroundColor: colors[index],
                    },
                  ]}
                >
                  <Text style={styles.podiumRank}>#{rank}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    );
  }, [topThree, theme.colors, formatDuration]);

  // Render regular list item (rank 4+)
  const renderLeaderboardItem = useCallback((item: any, index: number) => {
    const rank = index + 4; // Starting from rank 4
    const isCurrentUser = item.userId === user?.userId || item.email === user?.email;

    return (
      <Card
        key={item._id || index}
        style={[
          styles.leaderboardCard,
          isCurrentUser && styles.currentUserCard,
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.rankContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color="#999"
            />
            <Text style={styles.rankText}>#{rank}</Text>
          </View>

          <View style={styles.userInfo}>
            <Avatar.Text
              size={44}
              label={item.username?.substring(0, 2).toUpperCase() || "??"}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.userDetails}>
              <Text variant="titleSmall" style={styles.username}>
                {item.username || t("common.unknown")}
                {isCurrentUser && " (Bạn)"}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statScore}>
              {item.totalSessions || 0} 🍅
            </Text>
            <Text style={styles.statTime}>
              {formatDuration(item.totalDuration || 0)} ⏱️
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }, [theme.colors, formatDuration, t, user]);

  // Render sticky current user footer
  const renderCurrentUserFooter = useCallback(() => {
    if (!currentUserRank || !currentUserData || currentUserRank <= 3) return null;

    return (
      <View style={styles.stickyFooter}>
        <LinearGradient
          colors={[theme.colors.primary + "20", theme.colors.primary + "10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.stickyFooterGradient}
        >
          <View style={styles.stickyContent}>
            <Text style={styles.stickyRank}>#{currentUserRank}</Text>
            
            <Avatar.Text
              size={40}
              label={currentUserData.username?.substring(0, 2).toUpperCase() || "??"}
              style={{ backgroundColor: theme.colors.primary }}
            />
            
            <View style={styles.stickyUserInfo}>
              <Text variant="titleSmall" style={styles.stickyUsername}>
                {currentUserData.username || t("common.unknown")} (Bạn)
              </Text>
            </View>

            <View style={styles.stickyStats}>
              <Text style={styles.stickyScore}>
                {currentUserData.totalSessions || 0} 🍅
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }, [currentUserRank, currentUserData, theme.colors, t]);

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
              style: timeFilter === "week" ? styles.selectedButton : undefined,
              labelStyle: timeFilter === "week" ? styles.selectedButtonLabel : undefined,
            },
            {
              value: "month",
              label: t("leaderboard.thisMonth"),
              icon: "calendar-month",
              style: timeFilter === "month" ? styles.selectedButton : undefined,
              labelStyle: timeFilter === "month" ? styles.selectedButtonLabel : undefined,
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
        contentContainerStyle={{ paddingBottom: currentUserRank && currentUserRank > 3 ? 80 : 20 }}
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
              <View style={styles.podiumEmptyContainer}>
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
          <>
            {/* Top 3 Podium */}
            {renderPodium()}

            {/* Rest of leaderboard (Rank 4+) */}
            {restOfLeaderboard.length > 0 && (
              <View style={styles.leaderboardList}>
                {restOfLeaderboard.map((item, index) => renderLeaderboardItem(item, index))}
              </View>
            )}

            {/* Load more button */}
            {leaderboard.length >= limit && (
              <View style={styles.loadMoreContainer}>
                <Chip
                  icon="chevron-down"
                  onPress={() => setLimit(limit + 50)}
                  mode="outlined"
                >
                  {t("leaderboard.loadMore")}
                </Chip>
              </View>
            )}
          </>
        )}

        {/* Footer info */}
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

      {/* Sticky current user footer */}
      {renderCurrentUserFooter()}
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
  selectedButton: {
    backgroundColor: "#6200EE",
  },
  selectedButtonLabel: {
    color: "#FFFFFF",
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
  podiumEmptyContainer: {
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

  // Podium (Top 3) styles
  podiumContainer: {
    margin: 16,
    marginTop: 8,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
  },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 20,
    paddingBottom: 0,
  },
  podiumItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  crownIcon: {
    marginBottom: 4,
  },
  podiumAvatar: {
    borderRadius: 100,
    marginBottom: 8,
    padding: 2,
  },
  podiumAvatarGlow: {
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
    color: "#333",
  },
  podiumNameFirst: {
    fontSize: 14,
    fontWeight: "bold",
  },
  podiumStats: {
    alignItems: "center",
    marginBottom: 12,
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  podiumTime: {
    fontSize: 11,
    color: "#666",
  },
  podiumBase: {
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
  },
  podiumRank: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },

  // Leaderboard list styles (Rank 4+)
  leaderboardList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  leaderboardCard: {
    elevation: 1,
    borderRadius: 12,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: "#6200EE",
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  rankContainer: {
    alignItems: "center",
    width: 45,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
  },
  statsRow: {
    alignItems: "flex-end",
    gap: 4,
  },
  statScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statTime: {
    fontSize: 12,
    color: "#666",
  },

  // Sticky footer styles
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stickyFooterGradient: {
    borderTopWidth: 2,
    borderTopColor: "#6200EE",
  },
  stickyContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  stickyRank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200EE",
    width: 45,
    textAlign: "center",
  },
  stickyUserInfo: {
    flex: 1,
  },
  stickyUsername: {
    fontWeight: "bold",
    color: "#333",
  },
  stickyStats: {
    alignItems: "flex-end",
  },
  stickyScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200EE",
  },

  // Load more & footer
  loadMoreContainer: {
    alignItems: "center",
    padding: 16,
  },
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
