import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAchievements } from "../contexts/AchievementContext";
import { useLanguage } from "../contexts/LanguageContext";

const AchievementDetailScreen = () => {
  const router = useRouter();
  const { achievementId } = useLocalSearchParams();
  const { t } = useLanguage();
  const { getAchievementDetail, toggleFavorite, shareAchievement } =
    useAchievements();

  const [achievementData, setAchievementData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    loadAchievementDetail();
  }, [achievementId]);

  const loadAchievementDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getAchievementDetail(achievementId);
      setAchievementData(data);
    } catch (error) {
      console.error("Error loading achievement detail:", error);
      Alert.alert("Error", "Failed to load achievement details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setIsTogglingFavorite(true);
      const isFavorite = await toggleFavorite(achievementId);
      setAchievementData((prev) => ({
        ...prev,
        userProgress: {
          ...prev.userProgress,
          isFavorite,
        },
      }));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!achievementData.isUnlocked) {
      Alert.alert("Locked", "You can only share unlocked achievements");
      return;
    }

    try {
      const shareData = await shareAchievement(achievementId);
      await Share.share({
        message: shareData.shareText,
        url: shareData.shareUrl,
      });
    } catch (error) {
      console.error("Error sharing achievement:", error);
    }
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case "productivity":
        return "⚡";
      case "consistency":
        return "📅";
      case "social":
        return "👥";
      case "competition":
        return "🏆";
      case "milestone":
        return "🎯";
      case "special":
        return "✨";
      default:
        return "🏅";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading achievement...</Text>
      </View>
    );
  }

  if (!achievementData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Achievement not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { achievement, userProgress, isUnlocked, unlockableCheck } =
    achievementData;
  const isLocked = !isUnlocked;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={[styles.header, isLocked && styles.headerLocked]}>
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

        <Text style={[styles.title, isLocked && styles.titleLocked]}>
          {achievement.name.en}
        </Text>

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(achievement.rarity) + "20" },
            ]}
          >
            <Text style={styles.rarityIcon}>
              {getRarityIcon(achievement.rarity)}
            </Text>
            <Text
              style={[
                styles.rarityText,
                { color: getRarityColor(achievement.rarity) },
              ]}
            >
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(achievement.category)}
            </Text>
            <Text style={styles.categoryText}>
              {achievement.category.charAt(0).toUpperCase() +
                achievement.category.slice(1)}
            </Text>
          </View>
        </View>

        {isUnlocked && userProgress.unlockedAt && (
          <View style={styles.unlockedInfo}>
            <Text style={styles.unlockedLabel}>Unlocked on</Text>
            <Text style={styles.unlockedDate}>
              {new Date(userProgress.unlockedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text
          style={[styles.description, isLocked && styles.descriptionLocked]}
        >
          {achievement.description.en}
        </Text>
      </View>

      {/* Progress Section */}
      {!isUnlocked && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressValue}>
                {userProgress.progress.currentValue} /{" "}
                {userProgress.progress.threshold}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(userProgress.progress.percentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${userProgress.progress.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              {unlockableCheck.unlockable
                ? "🎉 Ready to unlock!"
                : `Keep going! ${
                    userProgress.progress.threshold -
                    userProgress.progress.currentValue
                  } more to go.`}
            </Text>
          </View>
        </View>
      )}

      {/* Unlock Criteria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Unlock</Text>
        <View style={styles.criteriaCard}>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Goal:</Text>
            <Text style={styles.criteriaValue}>
              {achievement.unlockCriteria.threshold}{" "}
              {achievement.unlockCriteria.metric.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Timeframe:</Text>
            <Text style={styles.criteriaValue}>
              {achievement.unlockCriteria.timeframe
                .replace(/_/g, " ")
                .toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Rewards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        <View style={styles.rewardCard}>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardIcon}>💰</Text>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardLabel}>Points</Text>
              <Text style={styles.rewardValue}>{achievement.points}</Text>
            </View>
          </View>
          {achievement.rewards?.badge && (
            <View style={styles.rewardRow}>
              <Text style={styles.rewardIcon}>🎖️</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardLabel}>Badge</Text>
                <Text style={styles.rewardValue}>
                  {achievement.rewards.badge}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Statistics */}
      {achievement.statistics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {achievement.statistics.totalUnlocked || 0}
              </Text>
              <Text style={styles.statLabel}>Players Unlocked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {achievement.statistics.unlockRate
                  ? `${Math.round(achievement.statistics.unlockRate)}%`
                  : "0%"}
              </Text>
              <Text style={styles.statLabel}>Unlock Rate</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.favoriteButton]}
          onPress={handleToggleFavorite}
          disabled={isTogglingFavorite}
        >
          <Text style={styles.buttonIcon}>
            {userProgress.isFavorite ? "❤️" : "🤍"}
          </Text>
          <Text style={styles.buttonText}>
            {userProgress.isFavorite ? "Favorited" : "Add to Favorites"}
          </Text>
        </TouchableOpacity>

        {isUnlocked && (
          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={handleShare}
          >
            <Text style={styles.buttonIcon}>📤</Text>
            <Text style={styles.buttonText}>Share Achievement</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F5F7FA",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLocked: {
    opacity: 0.8,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 16,
  },
  icon: {
    fontSize: 80,
  },
  iconLocked: {
    opacity: 0.5,
  },
  unlockedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  unlockedBadgeText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  titleLocked: {
    color: "#999",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  rarityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rarityIcon: {
    fontSize: 16,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    gap: 4,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
  },
  unlockedInfo: {
    marginTop: 12,
    alignItems: "center",
  },
  unlockedLabel: {
    fontSize: 12,
    color: "#666",
  },
  unlockedDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
  },
  descriptionLocked: {
    color: "#AAA",
  },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#EEE",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  progressHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  criteriaCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  criteriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  criteriaLabel: {
    fontSize: 14,
    color: "#666",
  },
  criteriaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  rewardCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    color: "#666",
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9800",
  },
  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
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
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF4081",
  },
  shareButton: {
    backgroundColor: "#007AFF",
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default AchievementDetailScreen;
