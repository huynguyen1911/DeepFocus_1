import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Alert, RefreshControl, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { Card, Text, useTheme, Divider, IconButton, Menu, FAB, Searchbar, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';

import Timer from '../components/Timer';
import TaskItem from '../components/TaskItem';
import { getGreeting } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useTasks } from '../contexts/TaskContext';

const HomeScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { completedPomodoros, startWorkSessionWithTask } = usePomodoro();
  const { tasks, isLoading, loadTasks, updateTask } = useTasks();
  const [greeting] = useState(getGreeting());
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const scrollViewRef = useRef<ScrollView>(null);
  const timerSectionRef = useRef<View>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
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
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks(false);
    setRefreshing(false);
  };

  // Memoized filtered tasks với debounced search
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

    // Sort: incomplete first, then by creation date
    return filtered.sort((a: any, b: any) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filterMode, debouncedSearchQuery]);

  // Handle start timer for a task
  const handleStartTimer = useCallback((task: any) => {
    console.log('🎯 handleStartTimer called with task:', task?.title);
    console.log('📋 startWorkSessionWithTask function:', typeof startWorkSessionWithTask);
    
    Alert.alert(
      'Bắt đầu Pomodoro',
      `Bắt đầu làm việc cho nhiệm vụ: "${task.title}"`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => console.log('❌ User cancelled'),
        },
        {
          text: 'Bắt đầu',
          onPress: () => {
            console.log('✅ User confirmed, starting timer with task...');
            // Start timer with task
            startWorkSessionWithTask(task);
            console.log('🔥 Timer started for task');
            
            // Smooth scroll to timer with optimized animation
            requestAnimationFrame(() => {
              timerSectionRef.current?.measureLayout(
                scrollViewRef.current as any,
                (x, y) => {
                  const targetY = Math.max(0, y - 20);
                  
                  // Use native smooth scroll with short duration
                  scrollViewRef.current?.scrollTo({ 
                    y: targetY,
                    animated: true // Re-enable animation but will be fast
                  });
                },
                () => {
                  // Fallback: smooth scroll to top
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
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="account-circle"
                  iconColor={theme.colors.onPrimary}
                  size={28}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
            <Menu.Item onPress={() => { setMenuVisible(false); }} title="Hồ sơ" leadingIcon="account" />
            <Menu.Item onPress={() => { setMenuVisible(false); }} title="Cài đặt" leadingIcon="cog" />
            <Menu.Item onPress={() => { setMenuVisible(false); handleLogout(); }} title="Đăng xuất" leadingIcon="logout" />
          </Menu>
        </View>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate={0.99}
        snapToInterval={undefined}
        snapToAlignment="start"
        removeClippedSubviews={false}
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
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Thống kê hôm nay</Text>
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>{completedPomodoros}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Pomodoro hoàn thành</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.secondary }]}>{completedPomodoros * 25}m</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Thời gian tập trung</Text>
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

      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/add-task')} color="#fff" />
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#FF5252', paddingHorizontal: 20, paddingVertical: 16, elevation: 4 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scrollView: { flex: 1 },
  homeSection: {
    padding: 20,
    paddingBottom: 40, // Space before task section
  },
  welcomeCard: { elevation: 4, borderRadius: 12, marginBottom: 24 },
  cardContent: { padding: 24, alignItems: "center" },
  greetingText: { marginBottom: 4, fontWeight: "500" },
  welcomeText: { textAlign: "center", fontWeight: "bold", marginBottom: 8 },
  subtitleText: { textAlign: "center", marginBottom: 16, fontWeight: "500" },
  divider: { width: "50%", marginVertical: 16 },
  descriptionText: { textAlign: "center", lineHeight: 20 },
  timerSection: { marginBottom: 32 },
  sectionTitle: { fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  statsSection: { marginBottom: 20 },
  statsContainer: { flexDirection: "row", gap: 16 },
  statCard: { flex: 1, elevation: 2, borderRadius: 8 },
  statContent: { alignItems: "center", padding: 16 },
  statNumber: { fontWeight: "bold", marginBottom: 4 },
  taskSection: {
    backgroundColor: '#F5F5F5',
    paddingTop: 20,
    paddingBottom: 80, // Giảm space cho FAB
    minHeight: 400, // Đảm bảo có đủ chiều cao để scroll
  },
  taskSectionHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 2,
  },
  taskSectionTitle: {
    fontWeight: "bold",
    textAlign: "center",
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
  segmentedButtons: { backgroundColor: "transparent" },
  taskListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10, // Giảm khoảng trống cuối danh sách
  },
  emptyContainer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60,
    minHeight: 200,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center', paddingHorizontal: 32 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#FF5252' },
});

export default HomeScreen;
