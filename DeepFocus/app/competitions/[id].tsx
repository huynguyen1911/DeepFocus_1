import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import competitionService, { Competition, CompetitionEntry, LeaderboardEntry } from '@/src/services/competitionService';
import { theme } from '@/src/config/theme';

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [userEntry, setUserEntry] = useState<CompetitionEntry | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [detailData, leaderboardData] = await Promise.all([
        competitionService.getCompetitionDetail(id),
        competitionService.getLeaderboard(id, { limit: 10 }),
      ]);

      setCompetition(detailData.competition);
      setUserEntry(detailData.userEntry);
      setIsJoined(detailData.isJoined);
      setCanJoin(detailData.canJoin);
      setLeaderboard(leaderboardData.entries);
    } catch (error) {
      console.error('Error loading competition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!canJoin) return;
    
    Alert.alert(
      'Join Competition',
      'Are you sure you want to join this competition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            try {
              await competitionService.joinCompetition(id);
              loadData(); // Reload data
              Alert.alert('Success', 'You have joined the competition!');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to join competition');
            }
          },
        },
      ]
    );
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Competition',
      'Are you sure you want to leave this competition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await competitionService.leaveCompetition(id);
              loadData(); // Reload data
              Alert.alert('Success', 'You have left the competition');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to leave competition');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'upcoming': return theme.colors.info;
      case 'completed': return theme.colors.onSurface;
      default: return theme.colors.onSurface;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!competition) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Competition not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{competition.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(competition.status) }]}>
            <Text style={styles.statusText}>{competition.status}</Text>
          </View>
        </View>
        <Text style={styles.description}>{competition.description}</Text>
      </View>

      {/* User Progress (if joined) */}
      {isJoined && userEntry && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userEntry.score}</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>#{userEntry.rank || '—'}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userEntry.progress.percentage}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${userEntry.progress.percentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {userEntry.progress.currentValue} / {userEntry.progress.target} {competition.goal.unit}
            </Text>
          </View>
        </View>
      )}

      {/* Competition Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color={theme.colors.primary} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {new Date(competition.timing.startDate).toLocaleDateString()} - {new Date(competition.timing.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="trophy" size={20} color={theme.colors.primary} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Goal</Text>
            <Text style={styles.detailValue}>
              {competition.goal.target} {competition.goal.unit} ({competition.goal.metric})
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people" size={20} color={theme.colors.primary} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Participants</Text>
            <Text style={styles.detailValue}>
              {competition.statistics.totalParticipants} participants
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="globe" size={20} color={theme.colors.primary} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Scope</Text>
            <Text style={styles.detailValue}>{competition.scope}</Text>
          </View>
        </View>
      </View>

      {/* Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {leaderboard.map((entry, index) => (
          <View
            key={index}
            style={[
              styles.leaderboardItem,
              entry.isCurrentUser && styles.currentUserItem,
            ]}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{entry.rank}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{entry.user.name}</Text>
              <Text style={styles.userScore}>
                {entry.score} pts • {entry.progress.percentage}%
              </Text>
            </View>
            {entry.isCurrentUser && (
              <Ionicons name="person" size={20} color={theme.colors.primary} />
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {isJoined ? (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
            <Text style={styles.leaveButtonText}>Leave Competition</Text>
          </TouchableOpacity>
        ) : canJoin ? (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Join Competition</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.cannotJoinContainer}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.onSurface} />
            <Text style={styles.cannotJoinText}>Cannot join this competition</Text>
          </View>
        )}
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
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: theme.colors.onSurface,
    lineHeight: 24,
  },
  progressSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    ...theme.shadows.small,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: theme.colors.primaryContainer,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  userScore: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  actionSection: {
    padding: 16,
    paddingBottom: 32,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  leaveButton: {
    backgroundColor: theme.colors.error,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cannotJoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    gap: 8,
  },
  cannotJoinText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
  },
});
