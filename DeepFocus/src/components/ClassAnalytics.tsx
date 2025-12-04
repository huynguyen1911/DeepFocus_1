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
import { Card, Button, Divider, SegmentedButtons, useTheme } from "react-native-paper";
import { LineChart, BarChart } from "react-native-chart-kit";
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
    await loadClasses();
    if (selectedClassId) {
      await loadClassAnalytics(selectedClassId);
    }
    setRefreshing(false);
  }, [selectedClassId]);

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
  const weeklyChartData = analytics ? {
    labels: analytics.weeklyActivity.map(d => d.day),
    datasets: [
      {
        data: analytics.weeklyActivity.map(d => d.pomodoros),
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  } : null;

  const topPerformersChartData = analytics ? {
    labels: analytics.topPerformers.map(p => p.studentName.split(' ')[0]),
    datasets: [
      {
        data: analytics.topPerformers.map(p => p.pomodoros),
      },
    ],
  } : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Class Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.selectorLabel}>
            {language === 'vi' ? '📚 Chọn lớp học' : '📚 Select Class'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
            {classes.map((classItem: any) => (
              <TouchableOpacity
                key={classItem._id}
                style={[
                  styles.classChip,
                  selectedClassId === classItem._id && styles.classChipSelected,
                ]}
                onPress={() => setSelectedClassId(classItem._id)}
              >
                <Text
                  style={[
                    styles.classChipText,
                    selectedClassId === classItem._id && styles.classChipTextSelected,
                  ]}
                >
                  {classItem.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Time Range Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: '7days', label: language === 'vi' ? '7 ngày' : '7 days' },
              { value: '30days', label: language === 'vi' ? '30 ngày' : '30 days' },
              { value: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
            ]}
          />
        </Card.Content>
      </Card>

      {analytics && (
        <>
          {/* Overview Stats */}
          <Card style={styles.card}>
            <Card.Title
              title={language === 'vi' ? '📊 Tổng quan' : '📊 Overview'}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{analytics.totalStudents}</Text>
                  <Text style={styles.statLabel}>
                    {language === 'vi' ? 'Tổng HS' : 'Total Students'}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                    {analytics.activeStudents}
                  </Text>
                  <Text style={styles.statLabel}>
                    {language === 'vi' ? 'Đang hoạt động' : 'Active'}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#FF9800' }]}>
                    {analytics.totalPomodoros}
                  </Text>
                  <Text style={styles.statLabel}>
                    {language === 'vi' ? 'Pomodoros' : 'Pomodoros'}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#9C27B0' }]}>
                    {analytics.averagePerStudent}
                  </Text>
                  <Text style={styles.statLabel}>
                    {language === 'vi' ? 'TB/HS' : 'Avg/Student'}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>
                  {language === 'vi' ? '⏱️ Tổng thời gian học' : '⏱️ Total Study Time'}
                </Text>
                <Text style={styles.timeValue}>
                  {formatWorkTime(analytics.totalWorkTime)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Weekly Activity Chart */}
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
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#1976D2',
                    },
                  }}
                  bezier
                  style={styles.chart}
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
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  style={styles.chart}
                />
                <Divider style={styles.divider} />
                {analytics.topPerformers.map((performer, index) => (
                  <View key={performer.studentId} style={styles.performerRow}>
                    <View style={styles.performerRank}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.performerInfo}>
                      <Text style={styles.performerName}>{performer.studentName}</Text>
                      <Text style={styles.performerStats}>
                        {performer.pomodoros} pomodoros • {formatWorkTime(performer.workTime)}
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
                onPress={() => router.push(`/classes/${selectedClassId}`)}
                icon="eye"
                style={styles.actionButton}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectorLabel: {
    marginBottom: 12,
    fontWeight: '600' as any,
    fontSize: 16,
  },
  classScroll: {
    marginHorizontal: -8,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  classChipSelected: {
    backgroundColor: '#1976D2',
  },
  classChipText: {
    color: '#666',
    fontWeight: '500',
  },
  classChipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
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
    backgroundColor: '#4CAF50',
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
