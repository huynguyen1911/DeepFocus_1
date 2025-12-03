import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import achievementService, { UserAchievement, AchievementSummary } from '@/src/services/achievementService';
import { theme } from '@/src/config/theme';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [summary, setSummary] = useState<AchievementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'inProgress' | 'locked'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsData, summaryData] = await Promise.all([
        achievementService.getAllAchievements(),
        achievementService.getAchievementSummary(),
      ]);
      setAchievements(achievementsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getFilteredAchievements = () => {
    switch (filter) {
      case 'unlocked':
        return achievements.filter(a => a.isUnlocked);
      case 'inProgress':
        return achievements.filter(a => !a.isUnlocked && a.progress.percentage > 0);
      case 'locked':
        return achievements.filter(a => !a.isUnlocked && a.progress.percentage === 0);
      default:
        return achievements;
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

  const renderAchievement = ({ item }: { item: UserAchievement }) => (
    <TouchableOpacity
      style={[
        styles.achievementCard,
        !item.isUnlocked && styles.lockedCard,
      ]}
      onPress={() => router.push(`/achievements/${item.achievement._id}`)}
    >
      <View style={styles.cardContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getDifficultyColor(item.achievement.difficulty) }
        ]}>
          <Text style={styles.iconText}>{item.achievement.icon}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isUnlocked && styles.lockedText]}>
              {item.achievement.name}
            </Text>
            {item.isFavorite && (
              <Ionicons name="star" size={16} color={theme.colors.warning} />
            )}
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.achievement.description}
          </Text>

          {!item.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${item.progress.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {item.progress.currentValue} / {item.progress.targetValue}
              </Text>
            </View>
          )}

          {item.isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.unlockedText}>Unlocked</Text>
            </View>
          )}
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.onSurface} 
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.unlocked}</Text>
            <Text style={styles.summaryLabel}>Unlocked</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.inProgress}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalPoints}</Text>
            <Text style={styles.summaryLabel}>Points</Text>
          </View>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'unlocked', 'inProgress', 'locked'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Achievements List */}
      <FlatList
        data={getFilteredAchievements()}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.achievement._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={theme.colors.onSurface} />
            <Text style={styles.emptyText}>No achievements found</Text>
          </View>
        }
      />
    </View>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  filterTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  achievementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  lockedText: {
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginTop: 16,
  },
});
