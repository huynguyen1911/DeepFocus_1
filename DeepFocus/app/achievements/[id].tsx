import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import achievementService, { UserAchievement } from '@/src/services/achievementService';
import { theme } from '@/src/config/theme';

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [achievement, setAchievement] = useState<UserAchievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievement();
  }, [id]);

  const loadAchievement = async () => {
    try {
      const data = await achievementService.getAchievementDetail(id);
      setAchievement(data);
    } catch (error) {
      console.error('Error loading achievement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!achievement) return;
    try {
      const updated = await achievementService.toggleFavorite(id);
      setAchievement(updated);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (!achievement) return;
    try {
      const result = await achievementService.shareAchievement(id);
      await Share.share({
        message: `I unlocked "${achievement.achievement.name}" achievement in DeepFocus! 🏆\n${result.shareUrl}`,
      });
    } catch (error) {
      console.error('Error sharing achievement:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return theme.colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!achievement) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Achievement not found</Text>
      </View>
    );
  }

  const { achievement: ach, isUnlocked, progress, isFavorite, unlockedAt } = achievement;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconButton}>
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>
          {isUnlocked && (
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Ionicons name="share-social" size={24} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Achievement Icon */}
      <View style={styles.iconSection}>
        <View
          style={[
            styles.largeIcon,
            { backgroundColor: getDifficultyColor(ach.difficulty) },
            !isUnlocked && styles.lockedIcon,
          ]}
        >
          <Text style={styles.largeIconText}>{ach.icon}</Text>
        </View>
        <Text style={styles.achievementName}>{ach.name}</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{ach.difficulty.toUpperCase()}</Text>
        </View>
      </View>

      {/* Status */}
      {isUnlocked ? (
        <View style={styles.statusCard}>
          <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
          <Text style={styles.statusTitle}>Unlocked!</Text>
          {unlockedAt && (
            <Text style={styles.statusDate}>
              {new Date(unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progress</Text>
          <View style={styles.progressBarLarge}>
            <View
              style={[styles.progressFillLarge, { width: `${progress.percentage}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {progress.currentValue} / {progress.targetValue} ({progress.percentage}%)
          </Text>
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{ach.description}</Text>
      </View>

      {/* Requirements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <View style={styles.requirementCard}>
          <Ionicons name="flag" size={20} color={theme.colors.primary} />
          <Text style={styles.requirementText}>
            {ach.requirements.condition} {ach.requirements.value} {ach.requirements.metric}
          </Text>
        </View>
      </View>

      {/* Rewards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards</Text>
        <View style={styles.rewardCard}>
          <Ionicons name="star" size={20} color={theme.colors.warning} />
          <Text style={styles.rewardText}>{ach.rewards.points} Points</Text>
        </View>
        {ach.rewards.badges && ach.rewards.badges.length > 0 && (
          <View style={styles.rewardCard}>
            <Ionicons name="ribbon" size={20} color={theme.colors.secondary} />
            <Text style={styles.rewardText}>{ach.rewards.badges.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{ach.category}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: theme.colors.surface,
  },
  largeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  largeIconText: {
    fontSize: 64,
  },
  achievementName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  statusCard: {
    margin: 16,
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginTop: 8,
  },
  statusDate: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  progressCard: {
    margin: 16,
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    ...theme.shadows.small,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.onSurface,
    lineHeight: 24,
  },
  requirementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    gap: 12,
  },
  requirementText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    flex: 1,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSecondary,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
  },
});
