import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAchievements } from "../contexts/AchievementContext";
import { useLanguage } from "../contexts/LanguageContext";

const AchievementListScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    achievements,
    summary,
    isLoading,
    fetchAchievements,
    fetchSummary,
    toggleFavorite,
  } = useAchievements();

  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    const filters = {};
    if (filter === "unlocked") filters.unlocked = "true";
    if (filter === "locked") filters.unlocked = "false";
    if (filter === "favorites") filters.favorite = "true";

    await Promise.all([fetchAchievements(filters), fetchSummary()]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (achievementId) => {
    try {
      await toggleFavorite(achievementId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAchievementPress = (achievementId) => {
    router.push(`/achievements/${achievementId}`);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "#FFD700";
      case "epic":
        return "#9B59B6";
      case "rare":
        return "#3498DB";
      default:
        return "#95A5A6";
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "💎";
      case "epic":
        return "🔮";
      case "rare":
        return "⭐";
      default:
        return "🏅";
    }
  };

  const renderAchievement = ({ item }) => {
    const { achievement, isUnlocked, progress, isFavorite } = item;
    const isLocked = !isUnlocked;

    return (
      <TouchableOpacity
        style={[
          styles.achievementCard,
          isLocked && styles.achievementCardLocked,
        ]}
        onPress={() => handleAchievementPress(achievement._id)}
      >
        <View style={styles.achievementHeader}>
          <View style={styles.iconContainer}>
            <Text style={[styles.icon, isLocked && styles.iconLocked]}>
              {achievement.icon}
            </Text>
            {isUnlocked && (
              <View style={styles.unlockedBadge}>
                <Text style={styles.unlockedBadgeText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.achievementInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, isLocked && styles.titleLocked]}>
                {achievement.name.en}
              </Text>
              {getRarityIcon(achievement.rarity) && (
                <Text style={styles.rarityIcon}>
                  {getRarityIcon(achievement.rarity)}
                </Text>
              )}
            </View>

            <Text
              style={[styles.description, isLocked && styles.descriptionLocked]}
            >
              {achievement.description.en}
            </Text>

            <View style={styles.footer}>
              <View
                style={[
                  styles.rarityBadge,
                  {
                    backgroundColor: getRarityColor(achievement.rarity) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rarityText,
                    { color: getRarityColor(achievement.rarity) },
                  ]}
                >
                  {achievement.rarity.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.points}>{achievement.points} pts</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(achievement._id)}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progress.currentValue} / {progress.threshold} (
              {Math.round(progress.percentage)}%)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Achievement Progress</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary?.unlocked || 0}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary?.inProgress || 0}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary?.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {summary?.byRarity && (
          <View style={styles.rarityBreakdown}>
            {Object.entries(summary.byRarity).map(
              ([rarity, count]) =>
                count > 0 && (
                  <View key={rarity} style={styles.rarityItem}>
                    <Text style={styles.rarityItemIcon}>
                      {getRarityIcon(rarity)}
                    </Text>
                    <Text style={styles.rarityItemCount}>{count}</Text>
                  </View>
                )
            )}
          </View>
        )}
      </View>

      <View style={styles.filterContainer}>
        {["all", "unlocked", "locked", "favorites"].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption && styles.filterTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.achievement._id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No achievements found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  rarityBreakdown: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  rarityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  rarityItemIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  rarityItemCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
  },
  achievementCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    position: "relative",
    marginRight: 12,
  },
  icon: {
    fontSize: 48,
  },
  iconLocked: {
    opacity: 0.5,
  },
  unlockedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unlockedBadgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  achievementInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  titleLocked: {
    color: "#999",
  },
  rarityIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  descriptionLocked: {
    color: "#AAA",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  points: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#EEE",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default AchievementListScreen;
