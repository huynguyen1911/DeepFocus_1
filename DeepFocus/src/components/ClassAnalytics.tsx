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

  // Check if chart has data
  const hasChartData = (data: any) => {
    if (!data || !data.datasets || data.datasets.length === 0) return false;
    const values = data.datasets[0].data;
    return values && values.length > 0 && values.some((v: number) => v > 0);
  };

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ClassAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days"); // 7days, 30days, all

  const loadClassAnalytics = async (classId: string) => {
    try {
      setLoading(true);
      
      // Call real API endpoint
      const response = await classAPI.getAnalytics(classId);
      
      if (response.success && response.data) {
        // Transform API data to match our interface
        const apiData = response.data;
        
        const transformedData: ClassAnalyticsData = {
          totalStudents: apiData.totalStudents || 0,
          activeStudents: apiData.activeStudents || 0,
          totalPomodoros: apiData.totalPomodoros || 0,
          totalWorkTime: apiData.totalWorkTime || 0,
          averagePerStudent: apiData.averagePerStudent || 0,
          topPerformers: apiData.topPerformers || [],
          weeklyActivity: (apiData.weeklyActivity || []).map((d: any) => ({
            day: language === 'vi' ? d.dayVi : d.day,
            pomodoros: d.pomodoros || 0,
            students: d.students || 0,
          })),
        };
        
        setAnalytics(transformedData);
      } else {
        // No data available - set empty analytics
        setAnalytics({
          totalStudents: 0,
          activeStudents: 0,
          totalPomodoros: 0,
          totalWorkTime: 0,
          averagePerStudent: 0,
          topPerformers: [],
          weeklyActivity: [],
        });
      }
    } catch (error) {
      console.error('❌ Failed to load class analytics:', error);
      // Set empty analytics on error
      setAnalytics({
        totalStudents: 0,
        activeStudents: 0,
        totalPomodoros: 0,
        totalWorkTime: 0,
        averagePerStudent: 0,
        topPerformers: [],
        weeklyActivity: [],
      });
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
                {hasChartData(weeklyChartData) ? (
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
                ) : (
                  <View style={styles.emptyChartContainer}>
                    <Ionicons name="bar-chart-outline" size={60} color="#E0E0E0" />
                    <Text style={styles.emptyChartText}>
                      {language === 'vi' ? 'Chưa có hoạt động nào trong tuần này' : 'No activity this week'}
                    </Text>
                  </View>
                )}
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
                {hasChartData(topPerformersChartData) ? (
                  <>
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
                  </>
                ) : (
                  <View style={styles.emptyChartContainer}>
                    <Ionicons name="trophy-outline" size={60} color="#E0E0E0" />
                    <Text style={styles.emptyChartText}>
                      {language === 'vi' ? 'Chưa có dữ liệu học sinh' : 'No student data yet'}
                    </Text>
                  </View>
                )}
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

      {/* Info Card - Lightweight Footnote */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 {language === 'vi'
            ? 'Analytics hiển thị dữ liệu tổng hợp từ tất cả học sinh trong lớp. Nhấn vào lớp học để xem chi tiết từng học sinh.'
            : 'Analytics show aggregated data from all students in the class. Click on a class to see individual student details.'}
        </Text>
      </View>
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
  // Empty Chart State
  emptyChartContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyChartText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
  // Info Container - Lightweight Footnote
  infoContainer: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ClassAnalytics;
