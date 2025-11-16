import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Alert, RefreshControl, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Card, Text, useTheme, Divider, IconButton, Menu, FAB, Searchbar, SegmentedButtons, Portal, List } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Timer from '../components/Timer';
import TaskItem from '../components/TaskItem';
import DailyPomodoroProgress from '../components/DailyPomodoroProgress';
import { getGreeting } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useTasks } from '../contexts/TaskContext';
import { taskAPI, statsAPI } from '../services/api';

const HomeScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { completedPomodoros, startWorkSessionWithTask, settings } = usePomodoro();
  const { tasks, isLoading, loadTasks, updateTask } = useTasks();
  const [greeting] = useState(getGreeting());
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
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalPomodoros: 0,
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

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await taskAPI.getTaskStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, [tasks]); // Reload when tasks change

  // Load today's pomodoro count from stats API
  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        // Small delay to ensure backend has processed the sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const statsData = await statsAPI.getStats();
        
        // Find today's stats from last30Days
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const todayStats = statsData.last30Days?.find((day: any) => {
          const dayStr = new Date(day.date).toISOString().split('T')[0];
          return dayStr === todayStr;
        });

        const newCount = todayStats?.completedPomodoros || 0;
        const newWorkTime = todayStats?.totalWorkTime || 0;
        setTodayPomodoros(newCount);
        setTodayWorkTime(newWorkTime);
      } catch (error) {
        console.error('❌ Failed to load today stats:', error);
        setTodayPomodoros(0);
      }
    };

    loadTodayStats();
  }, [completedPomodoros]); // Reload when pomodoros complete

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
            Alert.alert('Hồ sơ', 'Tính năng hồ sơ đang được phát triển');
            // Remount menu after Alert to fix stuck state
            setTimeout(() => setMenuKey(prev => prev + 1), 200);
            break;
          case 'settings':
            router.push('/settings');
            // Remount menu after navigation
            setTimeout(() => setMenuKey(prev => prev + 1), 200);
            break;
          case 'logout':
            Alert.alert(
              'Đăng xuất',
              'Bạn có chắc chắn muốn đăng xuất không?',
              [
                { 
                  text: 'Hủy', 
                  style: 'cancel',
                  onPress: () => {
                    // Remount menu when cancel
                    setTimeout(() => setMenuKey(prev => prev + 1), 200);
                  }
                },
                {
                  text: 'Đăng xuất',
                  style: 'destructive',
                  onPress: async () => {
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
    
    // Reload stats
    try {
      const data = await taskAPI.getTaskStats();
      setStats(data);
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
      'Bắt đầu Pomodoro',
      `Bắt đầu làm việc cho nhiệm vụ: "${task.title}"`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Bắt đầu',
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

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimary }}>
                DeepFocus
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>
                Xin chào, {user?.username || 'User'}!
              </Text>
            </View>
            <IconButton
              icon="account-circle"
              iconColor={theme.colors.onPrimary}
              size={28}
              onPress={() => setMenuVisible(true)}
            />
          </View>
        </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Home Section - Full viewport */}
        <View style={styles.homeSection}>
          <Card style={styles.welcomeCard}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge" style={[styles.greetingText, { color: theme.colors.onSurface }]}>{greeting}</Text>
              <Text variant="headlineMedium" style={[styles.welcomeText, { color: theme.colors.primary }]}>Chào mừng {user?.username}!</Text>
              <Text variant="titleMedium" style={[styles.subtitleText, { color: theme.colors.onSurface }]}>Ứng dụng Pomodoro Timer</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>Tập trung sâu, làm việc hiệu quả với phương pháp Pomodoro</Text>
            </Card.Content>
          </Card>
          
          <View 
            ref={timerSectionRef}
            style={styles.timerSection}
            collapsable={false}
          >
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>DeepFocus - Pomodoro Timer</Text>
            <Timer />
          </View>
          
          <View style={styles.statsSection}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Thống kê của bạn</Text>
            
            {/* Daily Progress */}
            <DailyPomodoroProgress 
              completedToday={todayPomodoros} 
              goal={settings?.dailyGoal || 8} 
              totalWorkTime={todayWorkTime}
            />
            
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.totalPomodoros}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Tổng Pomodoros</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.secondary }]}>{stats.totalPomodoros * 25}m</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Thời gian tập trung</Text>
                </Card.Content>
              </Card>
            </View>
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completedTasks}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Tasks hoàn thành</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pendingTasks}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Tasks đang làm</Text>
                </Card.Content>
              </Card>
            </View>
          </View>
        </View>

        {/* Task Section - Below home section */}
        <View style={styles.taskSection}>
          <View style={styles.taskSectionHeader}>
            <Text variant="titleLarge" style={[styles.taskSectionTitle, { color: theme.colors.onBackground }]}>
              Nhiệm Vụ Của Tôi
            </Text>
          </View>
          
          <View style={styles.searchFilterContainer}>
            <Searchbar 
              placeholder="Tìm kiếm nhiệm vụ..." 
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
                  { value: "all", label: `Tất cả (${tasks.length})`, icon: "format-list-bulleted" },
                  { value: "active", label: `Đang làm (${tasks.filter((t: any) => !t.isCompleted).length})`, icon: "progress-clock" },
                  { value: "completed", label: `Hoàn thành (${tasks.filter((t: any) => t.isCompleted).length})`, icon: "check-circle" },
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

          {/* Task List */}
          <View style={styles.taskListContainer}>
            {displayTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {filterMode === "active" ? "Không có nhiệm vụ đang hoạt động" : filterMode === "completed" ? "Chưa hoàn thành nhiệm vụ nào" : debouncedSearchQuery.trim() ? `Không tìm thấy "${debouncedSearchQuery}"` : "Chưa có nhiệm vụ nào"}
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
                title="Ngày tạo" 
                leadingIcon={sortBy === 'date' ? 'check' : undefined}
              />
              <Menu.Item 
                onPress={() => handleSortChange('priority')} 
                title="Độ ưu tiên" 
                leadingIcon={sortBy === 'priority' ? 'check' : undefined}
              />
              <Menu.Item 
                onPress={() => handleSortChange('dueDate')} 
                title="Hạn chót" 
                leadingIcon={sortBy === 'dueDate' ? 'check' : undefined}
              />
              <Menu.Item 
                onPress={() => handleSortChange('pomodoros')} 
                title="Pomodoros còn lại" 
                leadingIcon={sortBy === 'pomodoros' ? 'check' : undefined}
              />
            </View>
          </View>
        </View>
      )}
      
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/add-task')} color="#fff" />
      
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
                title="Hồ sơ"
                left={props => <List.Icon {...props} icon="account" />}
                onPress={handleProfilePress}
                style={styles.menuItem}
              />
              <Divider />
              <List.Item
                title="Cài đặt"
                left={props => <List.Icon {...props} icon="cog" />}
                onPress={handleSettingsPress}
                style={styles.menuItem}
              />
              <Divider />
              <List.Item
                title="Đăng xuất"
                left={props => <List.Icon {...props} icon="logout" />}
                onPress={handleLogout}
                style={styles.menuItem}
              />
            </Card>
          </View>
        </Pressable>
      </Modal>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    backgroundColor: '#FF5252', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    elevation: 4 
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  scrollView: { flex: 1 },
  homeSection: { padding: 20, paddingBottom: 40 },
  welcomeCard: { 
    elevation: 4, 
    borderRadius: 12, 
    marginBottom: 24 
  },
  cardContent: { 
    padding: 24, 
    alignItems: 'center' 
  },
  greetingText: { 
    marginBottom: 4, 
    fontWeight: '500' 
  },
  welcomeText: { 
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  subtitleText: { 
    textAlign: 'center', 
    marginBottom: 16, 
    fontWeight: '500' 
  },
  divider: { 
    width: '50%', 
    marginVertical: 16 
  },
  descriptionText: { 
    textAlign: 'center', 
    lineHeight: 20 
  },
  timerSection: { marginBottom: 32 },
  sectionTitle: { 
    fontWeight: 'bold', 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  statsSection: { marginBottom: 20 },
  statsContainer: { 
    flexDirection: 'row', 
    gap: 16 
  },
  statCard: { 
    flex: 1, 
    elevation: 2, 
    borderRadius: 8 
  },
  statContent: { 
    alignItems: 'center', 
    padding: 16 
  },
  statNumber: { 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  taskSection: {
    backgroundColor: '#F5F5F5',
    paddingTop: 20,
    paddingBottom: 80,
    minHeight: 400,
  },
  taskSectionHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 2,
  },
  taskSectionTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchFilterContainer: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingTop: 8,
    paddingBottom: 12, 
    marginBottom: 16,
    elevation: 1,
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
    backgroundColor: '#FF5252' 
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
