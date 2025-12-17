// @ts-nocheck
/**
 * Performance Charts Screen - Phase 4: Performance Analytics
 * Visualize focus trends, completion rates, session stats with charts
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 220;

export default function PerformanceChartsScreen() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', '90d'
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with API calls
  const mockData = {
    '7d': {
      focusScores: [75, 82, 78, 88, 85, 90, 92],
      completionRates: [80, 85, 75, 90, 85, 95, 100],
      sessionDurations: [25, 30, 25, 45, 30, 60, 45],
      distractions: {
        phone: 8,
        noise: 5,
        thoughts: 12,
        people: 3,
        notifications: 6,
        hungry: 2,
        tired: 4,
        other: 1
      },
      labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    },
    '30d': {
      focusScores: [70, 72, 75, 78, 80, 82, 85],
      completionRates: [65, 70, 75, 80, 85, 90, 92],
      sessionDurations: [20, 25, 30, 35, 40, 45, 50],
      distractions: {
        phone: 25,
        noise: 18,
        thoughts: 35,
        people: 10,
        notifications: 22,
        hungry: 8,
        tired: 15,
        other: 5
      },
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    },
    '90d': {
      focusScores: [65, 70, 72, 75, 78, 82, 85],
      completionRates: [60, 65, 72, 78, 82, 88, 92],
      sessionDurations: [15, 20, 25, 30, 35, 42, 48],
      distractions: {
        phone: 80,
        noise: 55,
        thoughts: 110,
        people: 35,
        notifications: 70,
        hungry: 25,
        tired: 45,
        other: 18
      },
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    }
  };

  const currentData = mockData[timeRange];

  const handleTimeRangeChange = (range: string) => {
    setLoading(true);
    setTimeRange(range);
    setTimeout(() => setLoading(false), 300);
  };

  // Calculate stats
  const avgFocusScore = Math.round(
    currentData.focusScores.reduce((a, b) => a + b, 0) / currentData.focusScores.length
  );
  const avgCompletionRate = Math.round(
    currentData.completionRates.reduce((a, b) => a + b, 0) / currentData.completionRates.length
  );
  const totalSessions = currentData.focusScores.length;
  const totalMinutes = currentData.sessionDurations.reduce((a, b) => a + b, 0);

  // Trend calculation
  const focusTrend = currentData.focusScores[currentData.focusScores.length - 1] - 
                     currentData.focusScores[0];
  const completionTrend = currentData.completionRates[currentData.completionRates.length - 1] - 
                          currentData.completionRates[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Biểu đồ hiệu suất</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {[
          { value: '7d', label: '7 ngày' },
          { value: '30d', label: '30 ngày' },
          { value: '90d', label: '90 ngày' }
        ].map(range => (
          <TouchableOpacity
            key={range.value}
            onPress={() => handleTimeRangeChange(range.value)}
            style={[
              styles.timeRangeButton,
              timeRange === range.value && styles.timeRangeButtonActive
            ]}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range.value && styles.timeRangeTextActive
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : (
          <>
            {/* Stats Overview */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#667eea' }]}>
                <MaterialCommunityIcons name="brain" size={32} color="#fff" />
                <Text style={styles.statValue}>{avgFocusScore}</Text>
                <Text style={styles.statLabel}>Điểm TB</Text>
                {focusTrend !== 0 && (
                  <View style={styles.trendBadge}>
                    <MaterialCommunityIcons 
                      name={focusTrend > 0 ? "trending-up" : "trending-down"} 
                      size={16} 
                      color="#fff" 
                    />
                    <Text style={styles.trendText}>
                      {Math.abs(focusTrend)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.statBox, { backgroundColor: '#4CAF50' }]}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#fff" />
                <Text style={styles.statValue}>{avgCompletionRate}%</Text>
                <Text style={styles.statLabel}>Hoàn thành</Text>
                {completionTrend !== 0 && (
                  <View style={styles.trendBadge}>
                    <MaterialCommunityIcons 
                      name={completionTrend > 0 ? "trending-up" : "trending-down"} 
                      size={16} 
                      color="#fff" 
                    />
                    <Text style={styles.trendText}>
                      {Math.abs(completionTrend)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#FF9800' }]}>
                <MaterialCommunityIcons name="chart-timeline-variant" size={32} color="#fff" />
                <Text style={styles.statValue}>{totalSessions}</Text>
                <Text style={styles.statLabel}>Phiên</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: '#9C27B0' }]}>
                <MaterialCommunityIcons name="clock-outline" size={32} color="#fff" />
                <Text style={styles.statValue}>{totalMinutes}</Text>
                <Text style={styles.statLabel}>Phút</Text>
              </View>
            </View>

            {/* Focus Score Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Điểm tập trung</Text>
                <MaterialCommunityIcons name="brain" size={24} color="#667eea" />
              </View>
              <LineChart
                data={currentData.focusScores}
                labels={currentData.labels}
                color="#667eea"
                maxValue={100}
                showGrid
              />
            </View>

            {/* Completion Rate Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Tỷ lệ hoàn thành</Text>
                <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              </View>
              <BarChart
                data={currentData.completionRates}
                labels={currentData.labels}
                color="#4CAF50"
                maxValue={100}
              />
            </View>

            {/* Session Duration Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Thời lượng phiên (phút)</Text>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#FF9800" />
              </View>
              <AreaChart
                data={currentData.sessionDurations}
                labels={currentData.labels}
                color="#FF9800"
                maxValue={Math.max(...currentData.sessionDurations) + 10}
              />
            </View>

            {/* Distraction Analysis */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Phân tích phân tâm</Text>
                <MaterialCommunityIcons name="eye-off" size={24} color="#EF5350" />
              </View>
              <DistractionChart data={currentData.distractions} />
            </View>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Line Chart Component
function LineChart({ data, labels, color, maxValue, showGrid }: any) {
  const chartPadding = 40;
  const chartAreaWidth = CHART_WIDTH - chartPadding * 2;
  const chartAreaHeight = CHART_HEIGHT - 60;
  
  const points = data.map((value: number, index: number) => {
    const x = chartPadding + (index / (data.length - 1)) * chartAreaWidth;
    const y = chartAreaHeight - (value / maxValue) * chartAreaHeight + 20;
    return { x, y, value };
  });

  const pathData = points.map((point: any, index: number) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <View style={styles.chartContainer}>
      {/* Grid Lines */}
      {showGrid && [0, 25, 50, 75, 100].map((value, index) => {
        const y = chartAreaHeight - (value / maxValue) * chartAreaHeight + 20;
        return (
          <View key={index}>
            <View style={[styles.gridLine, { top: y }]} />
            <Text style={[styles.yAxisLabel, { top: y - 8 }]}>{value}</Text>
          </View>
        );
      })}

      {/* Line Path (simulated with Views) */}
      {points.map((point: any, index: number) => {
        if (index === 0) return null;
        const prevPoint = points[index - 1];
        const width = Math.sqrt(
          Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
        );
        const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);
        
        return (
          <View
            key={index}
            style={[
              styles.lineSegment,
              {
                left: prevPoint.x,
                top: prevPoint.y,
                width: width,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }]
              }
            ]}
          />
        );
      })}

      {/* Data Points */}
      {points.map((point: any, index: number) => (
        <View
          key={index}
          style={[
            styles.dataPoint,
            { left: point.x - 6, top: point.y - 6, backgroundColor: color }
          ]}
        >
          <View style={styles.dataPointInner} />
        </View>
      ))}

      {/* Labels */}
      <View style={styles.xAxisLabels}>
        {labels.map((label: string, index: number) => (
          <Text key={index} style={styles.xAxisLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

// Bar Chart Component
function BarChart({ data, labels, color, maxValue }: any) {
  const barWidth = (CHART_WIDTH - 80) / data.length - 8;
  const chartHeight = CHART_HEIGHT - 60;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsContainer}>
        {data.map((value: number, index: number) => {
          const barHeight = (value / maxValue) * chartHeight;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barBackground}>
                <LinearGradient
                  colors={[color, color + 'CC']}
                  style={[styles.bar, { height: barHeight, width: barWidth }]}
                >
                  <Text style={styles.barValue}>{value}%</Text>
                </LinearGradient>
              </View>
              <Text style={styles.barLabel}>{labels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Area Chart Component
function AreaChart({ data, labels, color, maxValue }: any) {
  const chartPadding = 40;
  const chartAreaWidth = CHART_WIDTH - chartPadding * 2;
  const chartAreaHeight = CHART_HEIGHT - 60;
  
  const points = data.map((value: number, index: number) => {
    const x = chartPadding + (index / (data.length - 1)) * chartAreaWidth;
    const y = chartAreaHeight - (value / maxValue) * chartAreaHeight + 20;
    return { x, y, value };
  });

  return (
    <View style={styles.chartContainer}>
      {/* Area Fill (approximated with gradient bars) */}
      {points.map((point: any, index: number) => {
        const barHeight = chartAreaHeight - point.y + 20;
        return (
          <LinearGradient
            key={index}
            colors={[color + '40', color + '10']}
            style={[
              styles.areaBar,
              {
                left: point.x - 3,
                bottom: 40,
                height: barHeight,
                width: 6
              }
            ]}
          />
        );
      })}

      {/* Line */}
      {points.map((point: any, index: number) => {
        if (index === 0) return null;
        const prevPoint = points[index - 1];
        const width = Math.sqrt(
          Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
        );
        const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);
        
        return (
          <View
            key={index}
            style={[
              styles.lineSegment,
              {
                left: prevPoint.x,
                top: prevPoint.y,
                width: width,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }]
              }
            ]}
          />
        );
      })}

      {/* Data Points */}
      {points.map((point: any, index: number) => (
        <View
          key={index}
          style={[
            styles.dataPoint,
            { left: point.x - 6, top: point.y - 6, backgroundColor: color }
          ]}
        />
      ))}

      {/* Labels */}
      <View style={styles.xAxisLabels}>
        {labels.map((label: string, index: number) => (
          <Text key={index} style={styles.xAxisLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

// Distraction Chart Component
function DistractionChart({ data }: any) {
  const distractionTypes = [
    { key: 'phone', label: 'Điện thoại', icon: 'cellphone', color: '#667eea' },
    { key: 'noise', label: 'Tiếng ồn', icon: 'volume-high', color: '#FF9800' },
    { key: 'thoughts', label: 'Suy nghĩ', icon: 'head-lightbulb', color: '#9C27B0' },
    { key: 'people', label: 'Con người', icon: 'account-multiple', color: '#4CAF50' },
    { key: 'notifications', label: 'Thông báo', icon: 'bell', color: '#EF5350' },
    { key: 'hungry', label: 'Đói', icon: 'food-apple', color: '#FF5722' },
    { key: 'tired', label: 'Mệt', icon: 'sleep', color: '#607D8B' },
    { key: 'other', label: 'Khác', icon: 'dots-horizontal', color: '#9E9E9E' }
  ];

  const totalDistractions = Object.values(data).reduce((a: any, b: any) => a + b, 0);
  const maxValue = Math.max(...Object.values(data) as number[]);

  return (
    <View style={styles.distractionContainer}>
      {distractionTypes.map(type => {
        const value = data[type.key];
        const percentage = totalDistractions > 0 ? (value / totalDistractions * 100) : 0;
        const barWidth = maxValue > 0 ? (value / maxValue * 100) : 0;

        return (
          <View key={type.key} style={styles.distractionRow}>
            <View style={styles.distractionInfo}>
              <View style={[styles.distractionIcon, { backgroundColor: type.color + '20' }]}>
                <MaterialCommunityIcons name={type.icon} size={20} color={type.color} />
              </View>
              <Text style={styles.distractionLabel}>{type.label}</Text>
            </View>
            <View style={styles.distractionBarContainer}>
              <LinearGradient
                colors={[type.color, type.color + 'CC']}
                style={[styles.distractionBar, { width: `${barWidth}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.distractionValue}>
              {value} ({percentage.toFixed(0)}%)
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeRangeButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea10',
  },
  timeRangeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  trendBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 40,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 11,
    color: '#999',
    width: 30,
    textAlign: 'right',
  },
  lineSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
  dataPointInner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT - 40,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    minHeight: 30,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
  },
  areaBar: {
    position: 'absolute',
    borderRadius: 3,
  },
  distractionContainer: {
    gap: 16,
  },
  distractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distractionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
    gap: 8,
  },
  distractionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  distractionBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  distractionBar: {
    height: '100%',
    borderRadius: 6,
  },
  distractionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 80,
    textAlign: 'right',
  },
});
