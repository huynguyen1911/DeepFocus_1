import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, useTheme, Button, Divider, IconButton, Surface } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useClass } from '../contexts/ClassContext';
import { useGuardian } from '../contexts/GuardianContext';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { classAPI, statsAPI } from '../services/api';
import AlertBadge from './AlertBadge';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Class color gradients - reuse from ClassListScreen
const CLASS_COLORS = [
  ['#667eea', '#764ba2'], // Purple
  ['#f093fb', '#f5576c'], // Pink
  ['#4facfe', '#00f2fe'], // Blue
  ['#43e97b', '#38f9d7'], // Green  
  ['#fa709a', '#fee140'], // Orange
  ['#30cfd0', '#330867'], // Teal
  ['#a8edea', '#fed6e3'], // Pastel
  ['#ff9a9e', '#fecfef'], // Rose
];

// Helper functions - reuse from ClassListScreen
const capitalizeText = (text: string) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getClassInitials = (name: string) => {
  if (!name) return '??';
  let cleanName = name.replace(/^lớp\s+/i, '');
  const words = cleanName.trim().split(' ').filter(w => w.length > 0);
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return cleanName.substring(0, 2).toUpperCase();
};

const getClassColor = (name: string, index: number) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % CLASS_COLORS.length;
  return CLASS_COLORS[colorIndex];
};

// Get user initials for avatar
const getUserInitials = (name: string) => {
  if (!name) return 'GV'; // Default: Giáo Viên
  const words = name.trim().split(' ').filter(w => w.length > 0);
  
  if (words.length >= 2) {
    // Get first letter of first and last word
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  activeStudents: number;
  pendingRequests: number;
  totalCompetitions: number;
  thisWeekActivity: number;
}

const TeacherDashboard = () => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { classes, loadClasses } = useClass();
  const { pendingRequests } = useGuardian();
  const { unreadCount } = useAlert();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    activeStudents: 0,
    pendingRequests: 0,
    totalCompetitions: 0,
    thisWeekActivity: 0,
  });

  const greeting = language === 'vi' 
    ? '👨‍🏫 Chào mừng, Giáo viên!'
    : '👨‍🏫 Welcome, Teacher!';

  const calculateStatsFromClasses = () => {
    try {
      // Calculate stats from classes
      const totalClasses = classes.length;
      const totalStudents = classes.reduce((sum: number, cls: any) => sum + (cls.studentCount || 0), 0);
      const activeStudents = classes.reduce((sum: number, cls: any) => sum + (cls.activeStudents || 0), 0);
      
      // Get pending join requests from all classes
      const allPendingRequests = classes.reduce((sum: number, cls: any) => {
        return sum + (cls.pendingJoinRequests?.length || 0);
      }, 0);

      setStats({
        totalClasses,
        totalStudents,
        activeStudents,
        pendingRequests: allPendingRequests,
        totalCompetitions: 0, // TODO: Add competition count
        thisWeekActivity: 0, // TODO: Add activity tracking
      });
    } catch (error) {
      console.error('❌ Failed to calculate teacher stats:', error);
    }
  };

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 Teacher Home screen focused, refreshing classes...');
      loadClasses();
    }, [])
  );

  // Recalculate stats when classes change
  useEffect(() => {
    calculateStatsFromClasses();
  }, [classes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Clean Header with Bell & Avatar Icons */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {language === 'vi' ? 'Chào mừng, Giáo viên!' : 'Welcome, Teacher!'}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {language === 'vi' 
                ? 'Quản lý lớp học và theo dõi tiến độ học sinh'
                : 'Manage classes and track student progress'}
            </Text>
          </View>
          
          <View style={styles.headerIcons}>
            {/* Bell Icon with Badge */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/alerts')}
            >
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={24} 
                color={unreadCount > 0 ? '#F57C00' : '#757575'} 
              />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Avatar with Initials */}
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
            >
              <LinearGradient
                colors={['#6C63FF', '#8F94FB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{getUserInitials(user?.username)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Stats - 2x2 Grid với Vector Icons nhất quán */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {/* Lớp học - Purple */}
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#F3F0FF' }]}
              onPress={() => router.push('/classes')}
            >
              <MaterialCommunityIcons name="school-outline" size={32} color="#6C63FF" />
              <Text style={styles.statValue}>{stats.totalClasses}</Text>
              <Text style={styles.statLabel}>
                {language === 'vi' ? 'Lớp học' : 'Classes'}
              </Text>
            </TouchableOpacity>

            {/* Học sinh - Blue */}
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}
              onPress={() => router.push('/classes')}
            >
              <MaterialCommunityIcons name="account-group-outline" size={32} color="#2196F3" />
              <Text style={styles.statValue}>{stats.totalStudents}</Text>
              <Text style={styles.statLabel}>
                {language === 'vi' ? 'Học sinh' : 'Students'}
              </Text>
            </TouchableOpacity>

            {/* Yêu cầu - Orange */}
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}
              onPress={() => {
                if (stats.pendingRequests > 0) {
                  const classWithRequests = classes.find((cls: any) => cls.pendingJoinRequests?.length > 0);
                  if (classWithRequests) {
                    router.push(`/classes/${classWithRequests._id}`);
                  }
                }
              }}
            >
              <MaterialCommunityIcons 
                name="clipboard-text-clock-outline" 
                size={32} 
                color="#F57C00" 
              />
              <Text style={styles.statValue}>{stats.pendingRequests}</Text>
              <Text style={styles.statLabel}>
                {language === 'vi' ? 'Yêu cầu' : 'Requests'}
              </Text>
              {stats.pendingRequests > 0 && (
                <View style={styles.statBadgeSmall}>
                  <View style={styles.redDot} />
                </View>
              )}
            </TouchableOpacity>

            {/* Hoạt động - Green */}
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}
              onPress={() => router.push('/classes')}
            >
              <MaterialCommunityIcons name="chart-line" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{stats.thisWeekActivity}</Text>
              <Text style={styles.statLabel}>
                {language === 'vi' ? 'Hoạt động' : 'Activity'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Quick Actions - Horizontal Layout */}
      <View style={styles.actionsContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {language === 'vi' ? 'Hành động nhanh' : 'Quick Actions'}
        </Text>
        
        {/* Primary Action - Gradient Button */}
        <TouchableOpacity
          onPress={() => router.push('/classes/create')}
          style={styles.primaryActionWrapper}
        >
          <LinearGradient
            colors={['#6C63FF', '#8F94FB', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryAction}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>
              {language === 'vi' ? 'Tạo lớp học mới' : 'Create New Class'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary Actions - Soft Fill Buttons với bo tròn mềm mại */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: '#F3F0FF' }]}
            onPress={() => router.push('/competitions/create')}
          >
            <MaterialCommunityIcons name="trophy-outline" size={20} color="#8B7FD9" />
            <Text style={[styles.secondaryActionText, { color: '#8B7FD9' }]}>
              {language === 'vi' ? 'Tạo thử thách' : 'Create Challenge'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: '#E3F2FD' }]}
            onPress={() => router.push('/classes')}
          >
            <MaterialCommunityIcons name="chart-line" size={20} color="#5BA8D9" />
            <Text style={[styles.secondaryActionText, { color: '#5BA8D9' }]}>
              {language === 'vi' ? 'Analytics' : 'Analytics'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Classes - Premium Cards with Gradient Avatars */}
      <View style={styles.classesContainer}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {language === 'vi' ? 'Lớp học gần đây' : 'Recent Classes'}
          </Text>
          <Button 
            mode="text" 
            onPress={() => router.push('/classes')}
            compact
            textColor="#6C63FF"
          >
            {language === 'vi' ? 'Xem tất cả' : 'View All'}
          </Button>
        </View>

        {classes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="google-classroom" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              {language === 'vi' 
                ? 'Chưa có lớp học nào. Tạo lớp học đầu tiên!' 
                : 'No classes yet. Create your first class!'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/classes/create')}
              style={styles.emptyActionWrapper}
            >
              <LinearGradient
                colors={['#6C63FF', '#8F94FB', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyAction}
              >
                <Text style={styles.emptyActionText}>
                  {language === 'vi' ? 'Tạo lớp học' : 'Create Class'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          classes
            .filter((classItem: any) => classItem && (classItem._id || classItem.id))
            .slice(0, 3)
            .map((classItem: any, index: number) => {
              const initials = getClassInitials(classItem.name);
              const colors = getClassColor(classItem.name, index);
              const memberCount = classItem.studentCount || 0;
              const pendingCount = classItem.pendingJoinRequests?.length || 0;

              return (
                <TouchableOpacity
                  key={classItem._id || classItem.id}
                  onPress={() => {
                    const classId = classItem._id || classItem.id;
                    if (classId && classId !== 'undefined') {
                      router.push(`/classes/${classId}`);
                    } else {
                      console.warn('⚠️ Invalid class ID:', classItem);
                    }
                  }}
                >
                  <Surface style={styles.classCard} elevation={1}>
                    {/* Gradient Avatar */}
                    <LinearGradient
                      colors={colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.classAvatar}
                    >
                      <Text style={styles.avatarText}>{initials}</Text>
                    </LinearGradient>

                    {/* Class Info */}
                    <View style={styles.classInfo}>
                      <Text variant="titleMedium" style={styles.className}>
                        {capitalizeText(classItem.name)}
                      </Text>
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons name="account-group" size={14} color="#757575" />
                        <Text variant="bodySmall" style={styles.metaText}>
                          {memberCount} {language === 'vi' ? 'thành viên' : 'members'}
                        </Text>
                      </View>
                      {pendingCount > 0 && (
                        <View style={styles.pendingBadge}>
                          <MaterialCommunityIcons name="clock-outline" size={12} color="#F57C00" />
                          <Text style={styles.pendingText}>
                            {pendingCount} {language === 'vi' ? 'yêu cầu' : 'pending'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Chevron */}
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
                  </Surface>
                </TouchableOpacity>
              );
            })
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#6C63FF" />
        <Text variant="bodyMedium" style={styles.infoText}>
          {language === 'vi'
            ? 'Với vai trò Teacher/Guardian, bạn có thể giám sát tiến độ học tập của học sinh, tạo thử thách và quản lý lớp học. Nếu muốn tự học tập, hãy chuyển sang vai trò Student.'
              : 'As a Teacher/Guardian, you can monitor student progress, create challenges, and manage classes. If you want to study yourself, switch to Student role.'}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  
  // Clean Header with Bell & Avatar Icons
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 4,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
    lineHeight: 30,
  },
  subtitle: {
    color: '#757575',
    fontSize: 14,
    lineHeight: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 6,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Premium Stats - 2x2 Grid
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
  },
  statBadgeSmall: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },

  // Quick Actions
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  primaryActionWrapper: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    elevation: 0,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Recent Classes - Premium Cards
  classesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  classAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#757575',
    marginLeft: 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    fontSize: 15,
  },
  emptyActionWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyAction: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default TeacherDashboard;
