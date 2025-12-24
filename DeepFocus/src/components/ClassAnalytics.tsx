import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Divider, SegmentedButtons, useTheme } from "react-native-paper";
import { LineChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import { useLanguage } from "../contexts/LanguageContext";
import { useClass } from "../contexts/ClassContext";
import { classAPI, statsAPI } from "../services/api";
import { formatWorkTime } from "../utils/statsUtils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 48;

interface ClassAnalyticsData {
  totalStudents: number;
  activeStudents: number;
  totalPomodoros: number;
  totalWorkTime: number;
  averagePerStudent: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    pomodoros: number;
    workTime: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    pomodoros: number;
    students: number;
  }>;
}

const ClassAnalytics = () => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { classes, loadClasses } = useClass();
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to get ranking color (Gold/Silver/Bronze)
  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return '#4CAF50';
    }
  };

  // Helper function to get stat icon
  const getStatIcon = (type: string) => {
    switch (type) {
      case 'students': return 'people';
      case 'active': return 'checkmark-circle';
      case 'pomodoros': return 'timer';
      case 'average': return 'analytics';
      default: return 'stats-chart';
    }
  };

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ClassAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days"); // 7days, 30days, all

  const loadClassAnalytics = async (classId: string) => {
    try {
      setLoading(true);
      // TODO: Create API endpoint for class analytics
      // const data = await classAPI.getClassAnalytics(classId, timeRange);
      
      // Mock data for now
      const mockData: ClassAnalyticsData = {
        totalStudents: 25,
        activeStudents: 20,
        totalPomodoros: 450,
        totalWorkTime: 11250, // in minutes
        averagePerStudent: 18,
        topPerformers: [
          { studentId: '1', studentName: 'Nguyễn Văn A', pomodoros: 45, workTime: 1125 },
          { studentId: '2', studentName: 'Trần Thị B', pomodoros: 40, workTime: 1000 },
          { studentId: '3', studentName: 'Lê Văn C', pomodoros: 38, workTime: 950 },
        ],
        weeklyActivity: [
          { day: language === 'vi' ? 'T2' : 'Mon', pomodoros: 65, students: 18 },
          { day: language === 'vi' ? 'T3' : 'Tue', pomodoros: 70, students: 20 },
          { day: language === 'vi' ? 'T4' : 'Wed', pomodoros: 62, students: 19 },
          { day: language === 'vi' ? 'T5' : 'Thu', pomodoros: 68, students: 21 },
          { day: language === 'vi' ? 'T6' : 'Fri', pomodoros: 75, students: 22 },
          { day: language === 'vi' ? 'T7' : 'Sat', pomodoros: 55, students: 15 },
          { day: language === 'vi' ? 'CN' : 'Sun', pomodoros: 55, students: 16 },
        ],
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('❌ Failed to load class analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0]._id);
    }
  }, [classes]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassAnalytics(selectedClassId);
    }
  }, [selectedClassId, timeRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadClasses();
      if (selectedClassId) {
        await loadClassAnalytics(selectedClassId);
      }
    } catch (error) {
      console.error('❌ Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedClassId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {language === 'vi' ? 'Đang tải...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (classes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {language === 'vi' ? '📚 Chưa có lớp học' : '📚 No Classes Yet'}
        </Text>
        <Text style={styles.emptyText}>
          {language === 'vi'
            ? 'Tạo lớp học đầu tiên để xem analytics'
            : 'Create your first class to view analytics'}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/classes/create')}
          style={{ marginTop: 16 }}
        >
          {language === 'vi' ? 'Tạo lớp học' : 'Create Class'}
        </Button>
      </View>
    );
  }

  const selectedClass = classes.find((c: any) => c._id === selectedClassId);

  // Chart data
  const weeklyChartData = analytics && analytics.weeklyActivity && analytics.weeklyActivity.length > 0 ? {
    labels: analytics.weeklyActivity.map(d => d.day),
    datasets: [
      {
        data: analytics.weeklyActivity.map(d => d.pomodoros),
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  } : null;

  const topPerformersChartData = analytics && analytics.topPerformers && analytics.topPerformers.length > 0 ? {
    labels: analytics.topPerformers.map(p => p.studentName?.split(' ')[0] || 'N/A'),
    datasets: [
      {
        data: analytics.topPerformers.map(p => p.pomodoros || 0),
      },
    ],
  } : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>
          {language === 'vi' ? 'Thống Kê' : 'Analytics'}
        </Text>

        {/* Class Selector - Filter Chips Style */}
        <View style={styles.chipContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.isArray(classes) && classes
              .filter((classItem: any) => {
                if (!classItem) return false;
                const id = classItem._id || classItem.id;
                return id && id !== 'undefined' && id !== null;
              })
              .map((classItem: any) => {
                const classId = classItem._id || classItem.id;
                const isSelected = selectedClassId === classId;
                return (
                  <TouchableOpacity
                    key={classId}
                    style={[
                      styles.classChip,
                      isSelected && styles.classChipSelected,
                    ]}
                    onPress={() => {
                      if (classId && classId !== 'undefined') {
                        setSelectedClassId(classId);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.classChipText,
                        isSelected && styles.classChipTextSelected,
                      ]}
                    >
                      {classItem.name || 'Unnamed Class'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>

      {/* Time Range Selector - Purple Theme */}
      <View style={styles.timeRangeContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: '7days', label: language === 'vi' ? '7 ngày' : '7 days' },
            { value: '30days', label: language === 'vi' ? '30 ngày' : '30 days' },
            { value: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
          ]}
          style={styles.segmentedButtons}
          theme={{
            colors: {
              secondaryContainer: '#7C4DFF',
              onSecondaryContainer: '#FFFFFF',
            },
          }}
        />
      </View>

      {analytics && (
        <>
          {/* Hero Card - Total Study Time */}
          <Card style={[styles.card, styles.heroCard]}>
            <LinearGradient
              colors={['#7C4DFF', '#9575CD', '#B39DDB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Ionicons name="time-outline" size={40} color="#FFFFFF" style={styles.heroIcon} />
              <Text style={styles.heroValue}>
                {formatWorkTime(analytics.totalWorkTime || 0)}
              </Text>
              <Text style={styles.heroLabel}>
                {language === 'vi' ? 'Tổng thời gian học tập trung' : 'Total Focused Study Time'}
              </Text>
            </LinearGradient>
          </Card>

          {/* Mini Stats Grid 2x2 */}
          <View style={styles.miniStatsContainer}>
            <View style={styles.miniStatCard}>
              <Ionicons name={getStatIcon('students')} size={24} color="#1976D2" />
              <Text style={styles.miniStatValue}>{analytics.totalStudents || 0}</Text>
              <Text style={styles.miniStatLabel}>
                {language === 'vi' ? 'Tổng HS' : 'Total'}
              </Text>
            </View>
            <View style={styles.miniStatCard}>
              <Ionicons name={getStatIcon('active')} size={24} color="#4CAF50" />
              <Text style={[styles.miniStatValue, { color: '#4CAF50' }]}>
                {analytics.activeStudents || 0}
              </Text>
              <Text style={styles.miniStatLabel}>
                {language === 'vi' ? 'Hoạt động' : 'Active'}
              </Text>
            </View>
            <View style={styles.miniStatCard}>
              <Ionicons name={getStatIcon('pomodoros')} size={24} color="#FF9800" />
              <Text style={[styles.miniStatValue, { color: '#FF9800' }]}>
                {analytics.totalPomodoros || 0}
              </Text>
              <Text style={styles.miniStatLabel}>
                {language === 'vi' ? 'Pomodoros' : 'Pomodoros'}
              </Text>
            </View>
            <View style={styles.miniStatCard}>
              <Ionicons name={getStatIcon('average')} size={24} color="#9C27B0" />
              <Text style={[styles.miniStatValue, { color: '#9C27B0' }]}>
                {analytics.averagePerStudent || 0}
              </Text>
              <Text style={styles.miniStatLabel}>
                {language === 'vi' ? 'TB/HS' : 'Avg/Student'}
              </Text>
            </View>
          </View>

          {/* Weekly Activity Chart - Smooth & Clean */}
          {weeklyChartData && (
            <Card style={styles.card}>
              <Card.Title
                title={language === 'vi' ? '📈 Hoạt động trong tuần' : '📈 Weekly Activity'}
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <LineChart
                  data={weeklyChartData}
                  width={CHART_WIDTH}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, 0.6)`,
                    style: { borderRadius: 16 },
                    propsForBackgroundLines: {
                      strokeWidth: 0,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  fillShadowGradient="#7C4DFF"
                  fillShadowGradientOpacity={0.3}
                />
              </Card.Content>
            </Card>
          )}

          {/* Top Performers */}
          {topPerformersChartData && (
            <Card style={styles.card}>
              <Card.Title
                title={language === 'vi' ? '🏆 Top 3 học sinh xuất sắc' : '🏆 Top 3 Performers'}
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <BarChart
                  data={topPerformersChartData}
                  width={CHART_WIDTH}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, 0.6)`,
                    style: { borderRadius: 16 },
                    barPercentage: 0.7,
                  }}
                  style={styles.chart}
                />
                <Divider style={styles.divider} />
                {analytics.topPerformers && analytics.topPerformers.length > 0 && analytics.topPerformers.map((performer, index) => (
                  <View key={performer.studentId || index} style={styles.performerRow}>
                    <View style={[styles.performerRank, { backgroundColor: getRankColor(index) }]}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.performerInfo}>
                      <Text style={styles.performerName}>{performer.studentName || 'Unknown'}</Text>
                      <Text style={styles.performerStats}>
                        {performer.pomodoros || 0} pomodoros • {formatWorkTime(performer.workTime || 0)}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Actions */}
          <Card style={styles.card}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={() => {
                  if (selectedClassId) {
                    router.push(`/classes/${selectedClassId}`);
                  }
                }}
                icon="eye"
                style={styles.actionButton}
                disabled={!selectedClassId}
              >
                {language === 'vi' ? 'Xem chi tiết lớp' : 'View Class Details'}
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push('/classes')}
                icon="school"
                style={styles.actionButton}
              >
                {language === 'vi' ? 'Quản lý tất cả lớp' : 'Manage All Classes'}
              </Button>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Info Card */}
      <Card style={[styles.card, styles.infoCard]}>
        <Card.Content>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoBold}>{language === 'vi' ? 'Lưu ý' : 'Note'}:</Text>{' '}
            {language === 'vi'
              ? 'Analytics hiển thị dữ liệu tổng hợp từ tất cả học sinh trong lớp. Nhấn vào lớp học để xem chi tiết từng học sinh.'
              : 'Analytics show aggregated data from all students in the class. Click on a class to see individual student details.'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // Page Title
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Class Selector - Filter Chips
  chipContainer: {
    marginBottom: 16,
  },
  classChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25, // Pill shape
    backgroundColor: '#E8E8E8',
    marginHorizontal: 4,
  },
  classChipSelected: {
    backgroundColor: '#7C4DFF', // Purple brand color
  },
  classChipText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  classChipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  // Time Range Selector
  timeRangeContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  segmentedButtons: {
    borderRadius: 12,
  },
  // Hero Card - Total Study Time
  heroCard: {
    overflow: 'hidden',
    elevation: 4,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  heroIcon: {
    marginBottom: 12,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
  // Mini Stats Grid 2x2
  miniStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  miniStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 8,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  // Performers
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  performerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  performerStats: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
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

export default ClassAnalytics;
