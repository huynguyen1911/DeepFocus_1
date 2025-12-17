import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Button, Divider, IconButton } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useClass } from '../contexts/ClassContext';
import { useGuardian } from '../contexts/GuardianContext';
import { useAlert } from '../contexts/AlertContext';
import { classAPI, statsAPI } from '../services/api';
import AlertBadge from './AlertBadge';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Header Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content>
          <Text variant="headlineMedium" style={[styles.greeting, { color: theme.colors.primary }]}>
            {greeting}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {language === 'vi' 
              ? 'Quản lý lớp học và theo dõi tiến độ học sinh'
              : 'Manage classes and track student progress'}
          </Text>
        </Card.Content>
      </Card>

      {/* Quick Stats Overview */}
      <View style={styles.statsGrid}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}
          onPress={() => router.push('/classes')}
        >
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📚</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>
            {language === 'vi' ? 'Lớp học' : 'Classes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}
          onPress={() => router.push('/classes')}
        >
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>👥</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>
            {language === 'vi' ? 'Học sinh' : 'Students'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}
          onPress={() => router.push('/alerts')}
        >
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <AlertBadge count={unreadCount} size="small" />
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{unreadCount}</Text>
          <Text style={styles.statLabel}>
            {language === 'vi' ? 'Thông báo' : 'Alerts'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}
          onPress={() => {
            if (stats.pendingRequests > 0) {
              // Navigate to first class with pending requests
              const classWithRequests = classes.find((cls: any) => cls.pendingJoinRequests?.length > 0);
              if (classWithRequests) {
                router.push(`/classes/${classWithRequests._id}`);
              }
            }
          }}
        >
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📝</Text>
            {stats.pendingRequests > 0 && (
              <View style={styles.badge}>
                <AlertBadge count={stats.pendingRequests} size="small" />
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>
            {language === 'vi' ? 'Yêu cầu' : 'Requests'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Title 
          title={language === 'vi' ? '⚡ Hành động nhanh' : '⚡ Quick Actions'} 
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => router.push('/classes/create')}
            icon="plus"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            {language === 'vi' ? 'Tạo lớp học mới' : 'Create New Class'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => router.push('/competitions/create')}
            icon="trophy"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            {language === 'vi' ? 'Tạo thử thách mới' : 'Create New Challenge'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/classes')}
            icon="chart-line"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            {language === 'vi' ? 'Xem Analytics' : 'View Analytics'}
          </Button>
        </Card.Content>
      </Card>

      {/* Recent Classes */}
      <Card style={styles.card}>
        <Card.Title 
          title={language === 'vi' ? '📚 Lớp học gần đây' : '📚 Recent Classes'} 
          titleStyle={styles.cardTitle}
          right={(props) => (
            <Button onPress={() => router.push('/classes')}>
              {language === 'vi' ? 'Xem tất cả' : 'View All'}
            </Button>
          )}
        />
        <Card.Content>
          {classes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {language === 'vi' 
                  ? 'Chưa có lớp học nào. Tạo lớp học đầu tiên!' 
                  : 'No classes yet. Create your first class!'}
              </Text>
              <Button 
                mode="contained" 
                onPress={() => router.push('/classes/create')}
                style={{ marginTop: 12 }}
              >
                {language === 'vi' ? 'Tạo lớp học' : 'Create Class'}
              </Button>
            </View>
          ) : (
            classes
              .filter((classItem: any) => classItem && (classItem._id || classItem.id))
              .slice(0, 3)
              .map((classItem: any) => (
              <TouchableOpacity
                key={classItem._id || classItem.id}
                style={styles.classItem}
                onPress={() => {
                  const classId = classItem._id || classItem.id;
                  if (classId && classId !== 'undefined') {
                    router.push(`/classes/${classId}`);
                  } else {
                    console.warn('⚠️ Invalid class ID:', classItem);
                  }
                }}
              >
                <View style={styles.classInfo}>
                  <Text variant="titleMedium" style={styles.className}>
                    {classItem.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.classDetails}>
                    {classItem.studentCount || 0} {language === 'vi' ? 'học sinh' : 'students'}
                    {classItem.pendingJoinRequests?.length > 0 && (
                      <Text style={styles.pendingText}>
                        {' • '}{classItem.pendingJoinRequests.length} {language === 'vi' ? 'yêu cầu' : 'pending'}
                      </Text>
                    )}
                  </Text>
                </View>
                <IconButton icon="chevron-right" size={24} />
              </TouchableOpacity>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Info Card */}
      <Card style={[styles.card, styles.infoCard]}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.infoText}>
            💡 <Text style={styles.infoBold}>{language === 'vi' ? 'Mẹo' : 'Tip'}:</Text>{' '}
            {language === 'vi'
              ? 'Với vai trò Teacher/Guardian, bạn có thể giám sát tiến độ học tập của học sinh, tạo thử thách và quản lý lớp học. Nếu muốn tự học tập, hãy chuyển sang vai trò Student.'
              : 'As a Teacher/Guardian, you can monitor student progress, create challenges, and manage classes. If you want to study yourself, switch to Student role.'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  greeting: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontWeight: '600',
    marginBottom: 4,
  },
  classDetails: {
    color: '#666',
  },
  pendingText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
  },
  infoText: {
    lineHeight: 22,
    color: '#424242',
  },
  infoBold: {
    fontWeight: 'bold',
  },
});

export default TeacherDashboard;
