import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import competitionService, { Competition } from '@/src/services/competitionService';
import { useClass } from '@/src/contexts/ClassContext';
import { useRole } from '@/src/contexts/RoleContext';
import { theme } from '@/src/config/theme';

type CompetitionWithEntry = {
  competition: Competition;
  userEntry: any;
  isJoined: boolean;
  canJoin: boolean;
};

export default function CompetitionsScreen() {
  const { classes, loadClasses } = useClass();
  const { currentRole } = useRole();
  const [competitions, setCompetitions] = useState<CompetitionWithEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'joined' | 'draft'>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  useEffect(() => {
    if (currentRole === 'teacher') {
      loadClasses();
    }
  }, [currentRole]);

  useEffect(() => {
    loadCompetitions();
  }, [filter, selectedClassId]);

  const loadCompetitions = async () => {
    try {
      let data: CompetitionWithEntry[];
      
      if (filter === 'joined') {
        const joined = await competitionService.getUserCompetitions();
        console.log('📊 Joined competitions:', joined.length);
        data = joined.map(j => ({
          competition: j.competition,
          userEntry: j.entry,
          isJoined: true,
          canJoin: false,
        }));
      } else {
        const filterParams: any = filter === 'all' ? {} : { status: filter };
        
        // Add class filter if selected
        if (selectedClassId && selectedClassId !== 'all') {
          filterParams.class = selectedClassId;
        }
        
        console.log('🔍 Loading competitions with filters:', filterParams);
        data = await competitionService.getAllCompetitions(filterParams);
        console.log('📊 Loaded competitions:', data.length, data);
      }
      
      setCompetitions(data);
    } catch (error) {
      console.error('❌ Error loading competitions:', error);
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
      case 'draft': return '#9E9E9E';
      case 'completed': return theme.colors.onSurface;
      default: return theme.colors.onSurface;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'play-circle';
      case 'upcoming': return 'time';
      case 'draft': return 'create-outline';
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

        {/* Show class name if it's a class competition */}
        {competition.class && (
          <View style={styles.classRow}>
            <Ionicons name="school" size={14} color={theme.colors.primary} />
            <Text style={styles.classText}>
              {competition.class.name || 'Class Competition'}
            </Text>
          </View>
        )}

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
        {(currentRole === 'teacher' 
          ? ['all', 'active', 'upcoming', 'draft', 'joined'] 
          : ['all', 'active', 'upcoming', 'joined']
        ).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Class Filter (for teachers) */}
      {currentRole === 'teacher' && classes.length > 0 && (
        <View style={styles.classFilterSection}>
          <Text style={styles.classFilterLabel}>
            <Ionicons name="school" size={16} color={theme.colors.onSurface} /> Filter by Class
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classFilterScroll}
          >
            <TouchableOpacity
              style={[
                styles.classFilterChip,
                selectedClassId === 'all' && styles.classFilterChipActive,
              ]}
              onPress={() => setSelectedClassId('all')}
            >
              <Text style={[
                styles.classFilterChipText,
                selectedClassId === 'all' && styles.classFilterChipTextActive,
              ]}>
                All Classes
              </Text>
            </TouchableOpacity>
            {classes.map((cls: any) => {
              const classId = cls._id || cls.id;
              const isSelected = selectedClassId === classId;
              return (
                <TouchableOpacity
                  key={classId}
                  style={[
                    styles.classFilterChip,
                    isSelected && styles.classFilterChipActive,
                  ]}
                  onPress={() => setSelectedClassId(classId)}
                >
                  <Text style={[
                    styles.classFilterChipText,
                    isSelected && styles.classFilterChipTextActive,
                  ]}>
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

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
            <Ionicons name="trophy-outline" size={80} color={theme.colors.primary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyTitle}>No Competitions Yet</Text>
            <Text style={styles.emptySubtitle}>
              {currentRole === 'teacher' 
                ? 'Create your first competition to motivate students'
                : 'Check back later for new competitions to join'}
            </Text>
            {currentRole === 'teacher' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/competitions/create')}
              >
                <Ionicons name="add-circle" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.emptyButtonText}>Create Competition</Text>
              </TouchableOpacity>
            )}
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
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  classText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classFilterSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  classFilterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  classFilterScroll: {
    gap: 8,
    paddingRight: 16,
  },
  classFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  classFilterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  classFilterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  classFilterChipTextActive: {
    color: theme.colors.onPrimary,
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
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onPrimary,
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
