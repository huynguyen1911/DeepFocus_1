import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Alert, RefreshControl, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, useTheme, Divider, IconButton, Menu, FAB, Searchbar, SegmentedButtons, Portal, List } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Timer from '../components/Timer';
import TaskItem from '../components/TaskItem';
import DailyPomodoroProgress from '../components/DailyPomodoroProgress';
import TeacherDashboard from '../components/TeacherDashboard';
import { getGreeting } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useTasks } from '../contexts/TaskContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from '../contexts/AlertContext';
import { useRole } from '../contexts/RoleContext';
import AlertBadge from '../components/AlertBadge';
import { taskAPI, statsAPI } from '../services/api';
import AITip from '../../components/ai-tip';

const HomeScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { completedPomodoros, startWorkSessionWithTask, settings } = usePomodoro();
  const { tasks, isLoading, loadTasks, updateTask } = useTasks();
  const { t, language, resetLanguage } = useLanguage();
  const { unreadCount } = useAlert();
  const { currentRole } = useRole();
  const [greeting] = useState(getGreeting(language));
  
  // Check if user is Teacher/Guardian
  const isTeacher = currentRole === 'teacher';
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuKey, setMenuKey] = useState(0); // Force remount menu to fix stuck state
  const [pendingAction, setPendingAction] = useState<'profile' | 'settings' | 'logout' | null>(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const iconButtonRef = useRef<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const scrollViewRef = useRef<ScrollView>(null);
  const timerSectionRef = useRef<View>(null);
  const [showAITip, setShowAITip] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalPomodoros: 0,
    totalWorkTime: 0,
    pendingTasks: 0,
  });
  const [todayPomodoros, setTodayPomodoros] = useState(0);
  const [todayWorkTime, setTodayWorkTime] = useState(0); // Total work time today in minutes
  const [sortBy, setSortBy] = useState("date"); // date, priority, pomodoros, dueDate
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load stats from both APIs
  useEffect(() => {
    const loadAllStats = async () => {
      try {
        // Small delay to ensure backend has processed the sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Load task stats (for task counts)
        const taskStats = await taskAPI.getTaskStats();
        
        // Load pomodoro stats (for pomodoro counts)
        const statsData = await statsAPI.getStats();
        
        // Find today's stats from last30Days
        // Use local date to avoid timezone issues
        const today = new Date();
        const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const todayStats = statsData.last30Days?.find((day: any) => {
          const date = new Date(day.date);
          const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return dayStr === localTodayStr;
        });

        const newTodayCount = todayStats?.completedPomodoros || 0;
        const newTodayWorkTime = todayStats?.totalWorkTime || 0;
        
        // Combine both stats (statsData.overall contains the overall statistics)
        setStats({
          totalTasks: taskStats.totalTasks || 0,
          completedTasks: taskStats.completedTasks || 0,
          pendingTasks: taskStats.pendingTasks || 0,
          totalPomodoros: statsData.overall?.totalPomodoros || 0,
          totalWorkTime: statsData.overall?.totalWorkTime || 0,
        });
        
        setTodayPomodoros(newTodayCount);
        setTodayWorkTime(newTodayWorkTime);
      } catch (error) {
        console.error('❌ Failed to load stats:', error);
      }
    };

    loadAllStats();
  }, [tasks, completedPomodoros]); // Reload when tasks or pomodoros change

  // Load sort preference from AsyncStorage
  useEffect(() => {
    const loadSortPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('@deepfocus:sortBy');
        if (saved) {
          setSortBy(saved);
        }
      } catch (error) {
        console.error('Failed to load sort preference:', error);
      }
    };

    loadSortPreference();
  }, []);

  // Save sort preference to AsyncStorage
  const handleSortChange = async (newSort: string) => {
    setSortBy(newSort);
    setSortMenuVisible(false);
    
    try {
      await AsyncStorage.setItem('@deepfocus:sortBy', newSort);
    } catch (error) {
      console.error('Failed to save sort preference:', error);
    }
  };

  const handleProfilePress = () => {
    setPendingAction('profile');
    setMenuVisible(false);
  };

  const handleSettingsPress = () => {
    setPendingAction('settings');
    setMenuVisible(false);
  };

  const handleLogout = () => {
    setPendingAction('logout');
    setMenuVisible(false);
  };

  // Execute pending action after menu is dismissed
  useEffect(() => {
    if (!menuVisible && pendingAction) {
      // Clear pending action immediately to prevent re-execution
      const action = pendingAction;
      setPendingAction(null);
      
      // Small delay to ensure menu is fully dismissed
      setTimeout(() => {
        switch (action) {
          case 'profile':
            router.push('/profile');
            break;
          case 'settings':
            router.push('/settings');
            // Remount menu after navigation
            setTimeout(() => setMenuKey(prev => prev + 1), 200);
            break;
          case 'logout':
            Alert.alert(
              t('settings.logout'),
              t('settings.logoutConfirm'),
              [
                { 
                  text: t('general.cancel'), 
                  style: 'cancel',
                  onPress: () => {
                    // Remount menu when cancel
                    setTimeout(() => setMenuKey(prev => prev + 1), 200);
                  }
                },
                {
                  text: t('settings.logout'),
                  style: 'destructive',
                  onPress: async () => {
                    resetLanguage(); // Reset to Vietnamese before logout
                    await logout();
                  },
                },
              ]
            );
            break;
        }
      }, 150);
    }
  }, [menuVisible, pendingAction, logout]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks(false);
    
    // Reload stats from both APIs
    try {
      const taskStats = await taskAPI.getTaskStats();
      const statsData = await statsAPI.getStats();
      
      // Find today's stats
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todayStats = statsData.last30Days?.find((day: any) => {
        const dayStr = new Date(day.date).toISOString().split('T')[0];
        return dayStr === todayStr;
      });
      
      setStats({
        totalTasks: taskStats.totalTasks || 0,
        completedTasks: taskStats.completedTasks || 0,
        pendingTasks: taskStats.pendingTasks || 0,
        totalPomodoros: statsData.overall?.totalPomodoros || 0,
        totalWorkTime: statsData.overall?.totalWorkTime || 0,
      });
      
      setTodayPomodoros(todayStats?.completedPomodoros || 0);
      setTodayWorkTime(todayStats?.totalWorkTime || 0);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
    
    setRefreshing(false);
  };

  // Memoized filtered and sorted tasks
  const displayTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filter mode
    if (filterMode === "active") {
      filtered = filtered.filter((task: any) => !task.isCompleted);
    } else if (filterMode === "completed") {
      filtered = filtered.filter((task: any) => task.isCompleted);
    }

    // Apply search (using debounced query)
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((task: any) => 
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort based on sortBy selection
    return filtered.sort((a: any, b: any) => {
      // Always show incomplete tasks first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      // Then apply selected sort
      switch (sortBy) {
        case 'priority':
          // High → Medium → Low
          const priorityOrder: any = { high: 0, medium: 1, low: 2 };
          const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
          if (priorityDiff !== 0) return priorityDiff;
          // If same priority, sort by date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'dueDate':
          // Soonest due date first (null at end)
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

        case 'pomodoros':
          // Most remaining pomodoros first
          const aRemaining = a.estimatedPomodoros - a.completedPomodoros;
          const bRemaining = b.estimatedPomodoros - b.completedPomodoros;
          const pomoDiff = bRemaining - aRemaining;
          if (pomoDiff !== 0) return pomoDiff;
          // If same remaining, sort by date
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'date':
        default:
          // Newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [tasks, filterMode, debouncedSearchQuery, sortBy]);

  // Handle start timer for a task
  const handleStartTimer = useCallback((task: any) => {
    Alert.alert(
      t('timer.startPomodoro'),
      t('home.startTaskConfirm', { title: task.title }),
      [
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
        {
          text: t('timer.start'),
          onPress: () => {
            // Start timer with task
            startWorkSessionWithTask(task);
            
            // Smooth scroll to timer
            requestAnimationFrame(() => {
              timerSectionRef.current?.measureLayout(
                scrollViewRef.current as any,
                (x, y) => {
                  const targetY = Math.max(0, y - 20);
                  scrollViewRef.current?.scrollTo({ 
                    y: targetY,
                    animated: true
                  });
                },
                () => {
                  // Fallback: scroll to top
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }
              );
            });
          },
        },
      ]
    );
  }, [startWorkSessionWithTask]);

  // Memoized render function
  const renderTaskItem = useCallback(({ item }: { item: any }) => (
    <TaskItem 
      task={item} 
      onPress={() => router.push(`/task-details/${item._id || item.id}`)} 
      onStartTimer={handleStartTimer} 
    />
  ), [handleStartTimer]);

  // If Teacher/Guardian role, show Teacher Dashboard instead
  if (isTeacher) {
    return <TeacherDashboard />;
  }

  // Student role: show normal Pomodoro home screen
  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: '#FAFAFA' }}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text variant="headlineSmall" style={{ color: '#6C63FF', fontWeight: 'bold' }}>
                {greeting}
              </Text>
              <Text variant="bodyMedium" style={{ color: '#636E72', marginTop: 2 }}>
                {t('home.hello', { name: user?.username || 'User' })} 👋
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ position: 'relative' }}>
                <IconButton
                  icon="bell-outline"
                  iconColor="#636E72"
                  size={24}
                  onPress={() => router.push('/alerts')}
                  style={{ margin: 0 }}
                />
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: 6, right: 6 }}>
                    <AlertBadge count={unreadCount} size="small" />
                  </View>
                )}
              </View>
              <IconButton
                icon="account-circle-outline"
                iconColor="#636E72"
                size={24}
                onPress={() => setMenuVisible(true)}
                style={{ margin: 0 }}
              />
            </View>
          </View>
        </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6C63FF']} />
        }
      >
        {/* Hero Section - Timer First */}
        <View style={styles.heroSection}>
          <View 
            ref={timerSectionRef}
            style={styles.timerSection}
            collapsable={false}
          >
            <Timer />
          </View>
          
          {/* Daily Progress - Compact */}
          <View style={styles.progressSection}>
            <DailyPomodoroProgress 
              completedToday={todayPomodoros} 
              goal={settings?.dailyGoal || 8} 
              totalWorkTime={todayWorkTime}
            />
          </View>

          {/* Gamification - Compact */}
          <View style={styles.gamificationSection}>
            <View style={styles.gamificationRow}>
              <TouchableOpacity 
                style={styles.gamificationChip}
                onPress={() => router.push('/achievements')}
              >
                <Text style={styles.chipEmoji}>🏆</Text>
                <Text style={[styles.chipText, { color: '#6C63FF' }]}>Achievements</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gamificationChip}
                onPress={() => router.push('/competitions')}
              >
                <Text style={styles.chipEmoji}>⚔️</Text>
                <Text style={[styles.chipText, { color: '#6C63FF' }]}>Competitions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Task Section - Clean and Simple */}
        <View style={styles.taskSection}>
          <View style={styles.taskSectionHeader}>
            <Text variant="headlineSmall" style={[styles.taskSectionTitle, { color: '#1E293B', fontWeight: 'bold' }]}>
              {t('home.myTasks')}
            </Text>
          </View>
          
          <View style={styles.searchFilterContainer}>
            <Searchbar 
              placeholder={t('tasks.searchTasks')} 
              onChangeText={setSearchQuery} 
              value={searchQuery} 
              style={styles.searchBar} 
              iconColor={theme.colors.primary}
              autoCorrect={false}
              autoCapitalize="none"
            />
            
            <View style={styles.filterRow}>
              <SegmentedButtons 
                value={filterMode} 
                onValueChange={setFilterMode} 
                buttons={[
                  { value: "all", label: `${t('tasks.all')} (${tasks.length})`, icon: "format-list-bulleted" },
                  { value: "active", label: `${t('tasks.active')} (${tasks.filter((t: any) => !t.isCompleted).length})`, icon: "progress-clock" },
                  { value: "completed", label: `${t('tasks.completed')} (${tasks.filter((t: any) => t.isCompleted).length})`, icon: "check-circle" },
                ]} 
                style={styles.segmentedButtons} 
              />
              
              <IconButton
                icon="sort"
                size={24}
                onPress={() => setSortMenuVisible(!sortMenuVisible)}
                style={styles.sortButton}
              />
            </View>
          </View>

          {/* AI Tip - Compact */}
          {showAITip && (
            <View style={styles.aiTipContainer}>
              <AITip 
                context="dashboard"
                userData={{
                  currentStreak: 5,
                  totalSessions: stats.totalPomodoros,
                  avgFocusScore: 82,
                  recentTrend: 'improving'
                }}
                onDismiss={() => setShowAITip(false)}
              />
            </View>
          )}

          {/* Task List */}
          <View style={styles.taskListContainer}>
            {displayTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {filterMode === "active" ? t('tasks.noActiveTasks') : filterMode === "completed" ? t('tasks.noCompletedTasks') : debouncedSearchQuery.trim() ? t('tasks.noSearchResults', { query: debouncedSearchQuery }) : t('tasks.noTasks')}
                </Text>
              </View>
            ) : (
              displayTasks.map((task: any) => (
                <View key={task._id || task.id}>
                  {renderTaskItem({ item: task })}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sort Menu - Outside ScrollView to avoid z-index issues */}
      {sortMenuVisible && (
        <View style={styles.sortMenuBackdrop}>
          {/* Backdrop - Click to close */}
          <View 
            style={styles.backdrop}
            onTouchEnd={() => setSortMenuVisible(false)}
          />
          
          {/* Menu content */}
          <View style={styles.sortMenuContainer}>
            <View style={styles.sortMenu}>
              <Text style={styles.sortMenuTitle}>Sắp xếp theo</Text>
              <Divider />
              
              <Menu.Item 
                onPress={() => handleSortChange('date')} 
                title={t('tasks.sortByDate')} 
                leadingIcon={sortBy === 'date' ? 'check' : undefined}
              />
              <Menu.Item 
                onPress={() => handleSortChange('priority')} 
                title={t('tasks.sortByPriority')} 
                leadingIcon={sortBy === 'priority' ? 'check' : undefined}
              />
              <Menu.Item 
                onPress={() => handleSortChange('dueDate')} 
                title={t('tasks.sortByDueDate')} 
                leadingIcon={sortBy === 'dueDate' ? 'check' : undefined}
              />
              <Menu.Item 
                onPress={() => handleSortChange('pomodoros')} 
                title={t('tasks.sortByPomodoros')} 
                leadingIcon={sortBy === 'pomodoros' ? 'check' : undefined}
              />
            </View>
          </View>
        </View>
      )}
      
      <FAB 
        icon="plus" 
        style={[styles.fab, { backgroundColor: '#6C63FF' }]} 
        onPress={() => router.push('/add-task')} 
        color="#fff"
        mode="elevated"
      />
      
      {/* Custom Menu Modal - more reliable than React Native Paper Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <Card style={styles.menuCard}>
              <List.Item
                title={t('navigation.profile')}
                left={props => <List.Icon {...props} icon="account" />}
                onPress={handleProfilePress}
                style={styles.menuItem}
              />
              <Divider />
              <List.Item
                title={t('navigation.settings')}
                left={props => <List.Icon {...props} icon="cog" />}
                onPress={handleSettingsPress}
                style={styles.menuItem}
              />
              <Divider />
              <List.Item
                title={t('settings.logout')}
                left={props => <List.Icon {...props} icon="logout" />}
                onPress={handleLogout}
                style={styles.menuItem}
              />
            </Card>
          </View>
        </Pressable>
      </Modal>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, 
    paddingTop: 8,
    paddingBottom: 16, 
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderBottomWidth: 0,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greetingContainer: {
    flex: 1,
  },
  scrollView: { flex: 1, backgroundColor: '#FAFAFA' },
  heroSection: { 
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 8,
  },
  timerSection: { 
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  progressSection: { 
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  gamificationSection: { 
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  gamificationRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  gamificationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F0FF',
    borderWidth: 1,
    borderColor: '#E8E4FF',
    elevation: 1,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  taskSection: {
    backgroundColor: '#FAFAFA',
    paddingTop: 12,
    paddingBottom: 20,
    minHeight: 300,
  },
  taskSectionHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  taskSectionTitle: {
    textAlign: 'left',
  },
  searchFilterContainer: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingTop: 12,
    paddingBottom: 12, 
    marginBottom: 8,
  },
  aiTipContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: { 
    elevation: 2, 
    borderRadius: 8,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    minHeight: 48,
  },
  sortButton: {
    marginLeft: 'auto',
  },
  sortMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sortMenuContainer: {
    position: 'absolute',
    top: 220,
    right: 16,
    zIndex: 1000,
  },
  sortMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  sortMenuTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#666',
  },
  segmentedButtons: { 
    backgroundColor: 'transparent',
    flex: 1,
    maxWidth: '85%',
  },
  taskListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  emptyContainer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60,
    minHeight: 200,
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#757575', 
    textAlign: 'center', 
    paddingHorizontal: 32 
  },
  fab: { 
    position: 'absolute', 
    right: 16, 
    bottom: 16, 
    backgroundColor: '#6C63FF',
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: 60,
    marginRight: 16,
  },
  menuCard: {
    minWidth: 200,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 4,
  },
});

export default HomeScreen;
