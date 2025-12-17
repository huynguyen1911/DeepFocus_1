// @ts-nocheck
/**
 * Monthly Progress Screen - Phase 5: Monthly Tracking
 * Calendar heatmap, monthly stats, trend analysis, comparisons
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MonthlyProgressScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(11); // December (0-indexed)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [selectedMonth]);

  // Mock data - Replace with API
  const monthData = {
    month: 'Tháng 12, 2025',
    totalDays: 31,
    completedDays: 17,
    totalSessions: 68,
    totalMinutes: 3240,
    avgFocusScore: 85,
    bestStreak: 9,
    achievements: 5,
    
    // Calendar heatmap data (31 days)
    heatmapData: [
      { day: 1, sessions: 3, score: 82 },
      { day: 2, sessions: 2, score: 78 },
      { day: 3, sessions: 4, score: 88 },
      { day: 4, sessions: 3, score: 85 },
      { day: 5, sessions: 0, score: 0 },
      { day: 6, sessions: 2, score: 75 },
      { day: 7, sessions: 3, score: 90 },
      { day: 8, sessions: 4, score: 92 },
      { day: 9, sessions: 3, score: 85 },
      { day: 10, sessions: 4, score: 88 },
      { day: 11, sessions: 3, score: 82 },
      { day: 12, sessions: 4, score: 85 },
      { day: 13, sessions: 3, score: 80 },
      { day: 14, sessions: 4, score: 88 },
      { day: 15, sessions: 5, score: 95 },
      { day: 16, sessions: 3, score: 85 },
      { day: 17, sessions: 2, score: 90 },
      { day: 18, sessions: 0, score: 0 },
      { day: 19, sessions: 0, score: 0 },
      { day: 20, sessions: 0, score: 0 },
      { day: 21, sessions: 0, score: 0 },
      { day: 22, sessions: 0, score: 0 },
      { day: 23, sessions: 0, score: 0 },
      { day: 24, sessions: 0, score: 0 },
      { day: 25, sessions: 0, score: 0 },
      { day: 26, sessions: 0, score: 0 },
      { day: 27, sessions: 0, score: 0 },
      { day: 28, sessions: 0, score: 0 },
      { day: 29, sessions: 0, score: 0 },
      { day: 30, sessions: 0, score: 0 },
      { day: 31, sessions: 0, score: 0 },
    ],

    weeklyProgress: [
      { week: 'Tuần 1', sessions: 18, avgScore: 84, minutes: 810 },
      { week: 'Tuần 2', sessions: 22, avgScore: 86, minutes: 990 },
      { week: 'Tuần 3', sessions: 28, avgScore: 87, minutes: 1140 },
      { week: 'Tuần 4', sessions: 0, avgScore: 0, minutes: 0 }
    ],

    comparison: {
      lastMonth: {
        sessions: 55,
        avgScore: 78,
        minutes: 2475,
        completedDays: 14
      }
    },

    milestones: [
      {
        id: 1,
        icon: 'trophy',
        color: '#FFD700',
        title: '50+ phiên trong tháng',
        achieved: true
      },
      {
        id: 2,
        icon: 'fire',
        color: '#FF6B6B',
        title: 'Streak 7+ ngày',
        achieved: true
      },
      {
        id: 3,
        icon: 'star',
        color: '#9C27B0',
        title: 'Điểm TB > 85',
        achieved: true
      },
      {
        id: 4,
        icon: 'clock-fast',
        color: '#FF9800',
        title: '50+ giờ tập trung',
        achieved: true
      },
      {
        id: 5,
        icon: 'calendar-check',
        color: '#4CAF50',
        title: 'Hoàn thành 20+ ngày',
        achieved: false
      },
      {
        id: 6,
        icon: 'seal',
        color: '#D32F2F',
        title: '100 phiên trong tháng',
        achieved: false
      }
    ],

    categoryBreakdown: [
      { name: 'Học tập', sessions: 28, percentage: 41, color: '#667eea' },
      { name: 'Làm việc', sessions: 24, percentage: 35, color: '#4CAF50' },
      { name: 'Dự án cá nhân', sessions: 12, percentage: 18, color: '#FF9800' },
      { name: 'Khác', sessions: 4, percentage: 6, color: '#9E9E9E' }
    ]
  };

  const getHeatmapColor = (score: number) => {
    if (score === 0) return '#E0E0E0';
    if (score < 70) return '#FFE0B2';
    if (score < 80) return '#FFCC80';
    if (score < 90) return '#FFB74D';
    return '#FF9800';
  };

  const completionRate = Math.round((monthData.completedDays / monthData.totalDays) * 100);
  const sessionsDiff = monthData.totalSessions - monthData.comparison.lastMonth.sessions;
  const scoreDiff = monthData.avgFocusScore - monthData.comparison.lastMonth.avgScore;
  const hoursDiff = Math.floor((monthData.totalMinutes - monthData.comparison.lastMonth.minutes) / 60);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 {monthData.month}</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Overview Stats */}
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.overviewGradient}
            >
              <Text style={styles.overviewTitle}>Tổng quan tháng</Text>
              <View style={styles.overviewStats}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewValue}>{monthData.totalSessions}</Text>
                  <Text style={styles.overviewLabel}>Phiên</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewValue}>{Math.floor(monthData.totalMinutes / 60)}h</Text>
                  <Text style={styles.overviewLabel}>Thời gian</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewValue}>{monthData.avgFocusScore}</Text>
                  <Text style={styles.overviewLabel}>Điểm TB</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Calendar Heatmap */}
          <View style={styles.heatmapCard}>
            <Text style={styles.sectionTitle}>📊 Lịch tập trung</Text>
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendText}>Ít</Text>
              <View style={styles.legendColors}>
                {[0, 70, 80, 90, 95].map((score, index) => (
                  <View 
                    key={index}
                    style={[styles.legendColor, { backgroundColor: getHeatmapColor(score) }]} 
                  />
                ))}
              </View>
              <Text style={styles.legendText}>Nhiều</Text>
            </View>
            <View style={styles.heatmapGrid}>
              {monthData.heatmapData.map((data, index) => (
                <TouchableOpacity
                  key={data.day}
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: getHeatmapColor(data.score) }
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.heatmapDay,
                    { color: data.score === 0 ? '#999' : '#fff' }
                  ]}>
                    {data.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.heatmapInfo}>
              {monthData.completedDays}/{monthData.totalDays} ngày hoàn thành ({completionRate}%)
            </Text>
          </View>

          {/* Weekly Breakdown */}
          <View style={styles.weeklyCard}>
            <Text style={styles.sectionTitle}>📈 Tiến độ từng tuần</Text>
            {monthData.weeklyProgress.map((week, index) => {
              if (week.sessions === 0) return null;
              const maxSessions = Math.max(...monthData.weeklyProgress.map(w => w.sessions));
              const barWidth = (week.sessions / maxSessions) * 100;
              
              return (
                <View key={index} style={styles.weekRow}>
                  <Text style={styles.weekLabel}>{week.week}</Text>
                  <View style={styles.weekBarContainer}>
                    <LinearGradient
                      colors={['#4CAF50', '#66BB6A']}
                      style={[styles.weekBar, { width: `${barWidth}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <View style={styles.weekStats}>
                    <Text style={styles.weekValue}>{week.sessions}</Text>
                    <Text style={styles.weekScore}>{week.avgScore}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Comparison */}
          <View style={styles.comparisonCard}>
            <Text style={styles.sectionTitle}>📊 So với tháng trước</Text>
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonItem}>
                <View style={[styles.comparisonIcon, { backgroundColor: '#667eea20' }]}>
                  <MaterialCommunityIcons name="chart-timeline-variant" size={28} color="#667eea" />
                </View>
                <Text style={styles.comparisonLabel}>Số phiên</Text>
                <View style={styles.comparisonValueRow}>
                  <Text style={styles.comparisonValue}>{sessionsDiff > 0 ? '+' : ''}{sessionsDiff}</Text>
                  <MaterialCommunityIcons 
                    name={sessionsDiff > 0 ? "trending-up" : "trending-down"} 
                    size={20} 
                    color={sessionsDiff > 0 ? "#4CAF50" : "#EF5350"} 
                  />
                </View>
              </View>

              <View style={styles.comparisonItem}>
                <View style={[styles.comparisonIcon, { backgroundColor: '#FF980020' }]}>
                  <MaterialCommunityIcons name="brain" size={28} color="#FF9800" />
                </View>
                <Text style={styles.comparisonLabel}>Điểm TB</Text>
                <View style={styles.comparisonValueRow}>
                  <Text style={styles.comparisonValue}>{scoreDiff > 0 ? '+' : ''}{scoreDiff}</Text>
                  <MaterialCommunityIcons 
                    name={scoreDiff > 0 ? "trending-up" : "trending-down"} 
                    size={20} 
                    color={scoreDiff > 0 ? "#4CAF50" : "#EF5350"} 
                  />
                </View>
              </View>

              <View style={styles.comparisonItem}>
                <View style={[styles.comparisonIcon, { backgroundColor: '#4CAF5020' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.comparisonLabel}>Thời gian</Text>
                <View style={styles.comparisonValueRow}>
                  <Text style={styles.comparisonValue}>+{hoursDiff}h</Text>
                  <MaterialCommunityIcons 
                    name="trending-up" 
                    size={20} 
                    color="#4CAF50" 
                  />
                </View>
              </View>

              <View style={styles.comparisonItem}>
                <View style={[styles.comparisonIcon, { backgroundColor: '#9C27B020' }]}>
                  <MaterialCommunityIcons name="calendar-check" size={28} color="#9C27B0" />
                </View>
                <Text style={styles.comparisonLabel}>Ngày hoàn thành</Text>
                <View style={styles.comparisonValueRow}>
                  <Text style={styles.comparisonValue}>
                    +{monthData.completedDays - monthData.comparison.lastMonth.completedDays}
                  </Text>
                  <MaterialCommunityIcons 
                    name="trending-up" 
                    size={20} 
                    color="#4CAF50" 
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.milestonesCard}>
            <Text style={styles.sectionTitle}>🎯 Mục tiêu tháng</Text>
            <View style={styles.milestonesGrid}>
              {monthData.milestones.map(milestone => (
                <View 
                  key={milestone.id} 
                  style={[
                    styles.milestoneItem,
                    !milestone.achieved && styles.milestoneItemLocked
                  ]}
                >
                  <View style={[
                    styles.milestoneIcon,
                    { backgroundColor: milestone.achieved ? milestone.color + '20' : '#E0E0E0' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={milestone.icon} 
                      size={28} 
                      color={milestone.achieved ? milestone.color : '#999'} 
                    />
                  </View>
                  <Text style={[
                    styles.milestoneTitle,
                    !milestone.achieved && styles.milestoneTitleLocked
                  ]}>
                    {milestone.title}
                  </Text>
                  {milestone.achieved && (
                    <View style={styles.milestoneCheck}>
                      <MaterialCommunityIcons name="check" size={16} color="#fff" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categoryCard}>
            <Text style={styles.sectionTitle}>📂 Phân loại hoạt động</Text>
            {monthData.categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryBarContainer}>
                  <View 
                    style={[
                      styles.categoryBar,
                      { width: `${category.percentage}%`, backgroundColor: category.color }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryValue}>
                  {category.sessions} ({category.percentage}%)
                </Text>
              </View>
            ))}
          </View>

          {/* Key Insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>💡 Nhận xét chính</Text>
            
            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.insightText}>
                Bạn đã cải thiện <Text style={styles.insightHighlight}>+{sessionsDiff} phiên</Text> so với tháng trước
              </Text>
            </View>

            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
              <Text style={styles.insightText}>
                Streak dài nhất: <Text style={styles.insightHighlight}>{monthData.bestStreak} ngày</Text>
              </Text>
            </View>

            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              <Text style={styles.insightText}>
                Đạt <Text style={styles.insightHighlight}>{monthData.achievements} thành tựu</Text> mới trong tháng
              </Text>
            </View>

            <View style={styles.insightItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#9C27B0" />
              <Text style={styles.insightText}>
                Hoàn thành <Text style={styles.insightHighlight}>{completionRate}% ngày</Text> trong tháng
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/focus-training/weekly-review')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionGradient}
              >
                <MaterialCommunityIcons name="calendar-week" size={24} color="#fff" />
                <Text style={styles.actionText}>Xem tuần này</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/focus-training/goals')}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionGradient}
              >
                <MaterialCommunityIcons name="target" size={24} color="#fff" />
                <Text style={styles.actionText}>Đặt mục tiêu mới</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
  },
  overviewCard: {
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  overviewGradient: {
    padding: 24,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  overviewDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  heatmapCard: {
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
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  legendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  heatmapCell: {
    width: (width - 80) / 7 - 6,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapDay: {
    fontSize: 12,
    fontWeight: '700',
  },
  heatmapInfo: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  weeklyCard: {
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
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 70,
  },
  weekBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  weekBar: {
    height: '100%',
    borderRadius: 6,
  },
  weekStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 70,
    justifyContent: 'flex-end',
  },
  weekValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  weekScore: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  comparisonCard: {
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
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  comparisonItem: {
    width: (width - 64) / 2,
    alignItems: 'center',
  },
  comparisonIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  comparisonLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  comparisonValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  milestonesCard: {
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
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  milestoneItem: {
    width: (width - 64) / 2,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  milestoneItemLocked: {
    opacity: 0.6,
  },
  milestoneIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  milestoneTitleLocked: {
    color: '#999',
  },
  milestoneCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCard: {
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 100,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 80,
    textAlign: 'right',
  },
  insightsCard: {
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
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  insightHighlight: {
    fontWeight: '700',
    color: '#333',
  },
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
