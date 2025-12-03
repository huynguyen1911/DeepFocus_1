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
import competitionService, { Competition } from '@/src/services/competitionService';
import { theme } from '@/src/config/theme';

type CompetitionWithEntry = {
  competition: Competition;
  userEntry: any;
  isJoined: boolean;
  canJoin: boolean;
};

export default function CompetitionsScreen() {
  const [competitions, setCompetitions] = useState<CompetitionWithEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'joined'>('all');

  useEffect(() => {
    loadCompetitions();
  }, [filter]);

  const loadCompetitions = async () => {
    try {
      let data: CompetitionWithEntry[];
      
      if (filter === 'joined') {
        const joined = await competitionService.getUserCompetitions();
        data = joined.map(j => ({
          competition: j.competition,
          userEntry: j.entry,
          isJoined: true,
          canJoin: false,
        }));
      } else {
        const filterParams = filter === 'all' ? {} : { status: filter };
        data = await competitionService.getAllCompetitions(filterParams);
      }
      
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCompetitions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'upcoming': return theme.colors.info;
      case 'completed': return theme.colors.onSurface;
      default: return theme.colors.onSurface;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'play-circle';
      case 'upcoming': return 'time';
      case 'completed': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const renderCompetition = ({ item }: { item: CompetitionWithEntry }) => {
    const { competition, isJoined, canJoin } = item;
    
    return (
      <TouchableOpacity
        style={styles.competitionCard}
        onPress={() => router.push(`/competitions/${competition._id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {competition.title}
            </Text>
            {competition.featured && (
              <Ionicons name="star" size={16} color={theme.colors.warning} />
            )}
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(competition.status) }]}>
            <Ionicons name={getStatusIcon(competition.status)} size={12} color="#fff" />
            <Text style={styles.statusText}>{competition.status}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {competition.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={16} color={theme.colors.onSurface} />
            <Text style={styles.metaText}>
              {competition.statistics.totalParticipants} participants
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="trophy" size={16} color={theme.colors.onSurface} />
            <Text style={styles.metaText}>
              {competition.goal.target} {competition.goal.unit}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={14} color={theme.colors.onSurface} />
          <Text style={styles.dateText}>
            {new Date(competition.timing.startDate).toLocaleDateString()} - {new Date(competition.timing.endDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.actionRow}>
          {isJoined ? (
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          ) : canJoin ? (
            <View style={styles.canJoinBadge}>
              <Ionicons name="add-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.canJoinText}>Can Join</Text>
            </View>
          ) : null}
          
          <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurface} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'upcoming', 'joined'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Competitions List */}
      <FlatList
        data={competitions}
        renderItem={renderCompetition}
        keyExtractor={(item) => item.competition._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={theme.colors.onSurface} />
            <Text style={styles.emptyText}>No competitions found</Text>
          </View>
        }
      />

      {/* Create Competition FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/competitions/create')}
      >
        <Ionicons name="add" size={28} color={theme.colors.onPrimary} />
      </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
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
  competitionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinedText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  canJoinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  canJoinText: {
    fontSize: 12,
    color: theme.colors.primary,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
});
