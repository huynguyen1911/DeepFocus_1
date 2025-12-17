// @ts-nocheck
/**
 * Weekly Review Screen - Phase 5: Weekly Review & Progress
 * Comprehensive weekly summary with stats, achievements, highlights
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

export default function WeeklyReviewScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Mock data - Replace with API calls
  const weekData = {
    weekNumber: 50,
    dateRange: '11 - 17 Th12, 2025',
    totalSessions: 28,
    completedSessions: 24,
    totalMinutes: 1140,
    avgFocusScore: 87,
    currentStreak: 7,
    bestDay: {
      date: 'Thứ 6, 15 Th12',
      score: 95,
      sessions: 5
    },
    achievements: [
      {
        id: 1,
        title: 'Tuần hoàn hảo',
        icon: 'trophy',
        color: '#FFD700'
      },
      {
        id: 2,
        title: 'Bậc thầy tập trung',
        icon: 'star',
        color: '#9C27B0'
      }
    ],
    dailyStats: [
      { day: 'T2', sessions: 3, focusScore: 82, minutes: 135 },
      { day: 'T3', sessions: 4, focusScore: 85, minutes: 180 },
      { day: 'T4', sessions: 3, focusScore: 80, minutes: 135 },
      { day: 'T5', sessions: 4, focusScore: 88, minutes: 210 },
      { day: 'T6', sessions: 5, focusScore: 95, minutes: 240 },
      { day: 'T7', sessions: 3, focusScore: 85, minutes: 150 },
      { day: 'CN', sessions: 2, focusScore: 90, minutes: 90 }
    ],
    comparison: {
      lastWeek: {
        sessions: 20,
        minutes: 900,
        avgScore: 78,
        streak: 5
      }
    },
    highlights: [
      {
        id: 1,
        icon: 'fire',
        color: '#FF6B6B',
        title: 'Streak kỷ lục',
        description: '7 ngày liên tiếp hoàn thành mục tiêu'
      },
      {
        id: 2,
        icon: 'chart-line-variant',
        color: '#4CAF50',
        title: 'Cải thiện vượt bậc',
        description: 'Điểm tập trung tăng 11.5% so với tuần trước'
      },
      {
        id: 3,
        icon: 'clock-fast',
        color: '#FF9800',
        title: 'Tổng thời gian cao nhất',
        description: '19 giờ tập trung - cao nhất trong tháng'
      },
      {
        id: 4,
        icon: 'shield-check',
        color: '#667eea',
        title: 'Ít phân tâm',
        description: 'Giảm 35% số lần phân tâm so với tuần trước'
      }
    ],
    topDistractions: [
      { name: 'Suy nghĩ', count: 8, icon: 'head-lightbulb', color: '#9C27B0' },
      { name: 'Điện thoại', count: 5, icon: 'cellphone', color: '#667eea' },
      { name: 'Tiếng ồn', count: 3, icon: 'volume-high', color: '#FF9800' }
    ]
  };

  const completionRate = Math.round((weekData.completedSessions / weekData.totalSessions) * 100);
  const sessionsDiff = weekData.totalSessions - weekData.comparison.lastWeek.sessions;
  const minutesDiff = weekData.totalMinutes - weekData.comparison.lastWeek.minutes;
  const scoreDiff = weekData.avgFocusScore - weekData.comparison.lastWeek.avgScore;

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📅 Tuần {weekData.weekNumber}</Text>
          <Text style={styles.headerSubtitle}>{weekData.dateRange}</Text>
        </View>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Overall Score Card */}
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#FFD700', '#FFA000']}
              style={styles.scoreGradient}
            >
              <MaterialCommunityIcons name="trophy-award" size={64} color="#fff" />
              <Text style={styles.scoreTitle}>Tuần xuất sắc!</Text>
              <View style={styles.scoreValueContainer}>
                <Text style={styles.scoreValue}>{weekData.avgFocusScore}</Text>
                <Text style={styles.scoreLabel}>/ 100</Text>
              </View>
              <Text style={styles.scoreDescription}>
                Điểm tập trung trung bình
              </Text>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#667eea20' }]}>
                <MaterialCommunityIcons name="check-circle" size={28} color="#667eea" />
              </View>
              <Text style={styles.statValue}>{weekData.completedSessions}/{weekData.totalSessions}</Text>
              <Text style={styles.statLabel}>Phiên hoàn thành</Text>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{completionRate}%</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
                <MaterialCommunityIcons name="fire" size={28} color="#FF6B6B" />
              </View>
              <Text style={styles.statValue}>{weekData.currentStreak}</Text>
              <Text style={styles.statLabel}>Ngày streak</Text>
              <View style={[styles.statBadge, { backgroundColor: '#FF6B6B20' }]}>
                <MaterialCommunityIcons name="trending-up" size={14} color="#FF6B6B" />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#4CAF5020' }]}>
                <MaterialCommunityIcons name="clock-outline" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.statValue}>{Math.floor(weekData.totalMinutes / 60)}h {weekData.totalMinutes % 60}m</Text>
              <Text style={styles.statLabel}>Tổng thời gian</Text>
              <View style={[styles.statBadge, { backgroundColor: '#4CAF5020' }]}>
                <Text style={[styles.statBadgeText, { color: '#4CAF50' }]}>
                  +{Math.floor(minutesDiff / 60)}h
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FF980020' }]}>
                <MaterialCommunityIcons name="chart-timeline-variant" size={28} color="#FF9800" />
              </View>
              <Text style={styles.statValue}>{weekData.totalSessions}</Text>
              <Text style={styles.statLabel}>Tổng phiên</Text>
              <View style={[styles.statBadge, { backgroundColor: '#FF980020' }]}>
                <Text style={[styles.statBadgeText, { color: '#FF9800' }]}>
                  +{sessionsDiff}
                </Text>
              </View>
            </View>
          </View>

          {/* Comparison with Last Week */}
          <View style={styles.comparisonCard}>
            <Text style={styles.sectionTitle}>📈 So với tuần trước</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
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
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonItem}>
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
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Thời gian</Text>
                <View style={styles.comparisonValueRow}>
                  <Text style={styles.comparisonValue}>+{Math.floor(minutesDiff / 60)}h</Text>
                  <MaterialCommunityIcons 
                    name="trending-up" 
                    size={20} 
                    color="#4CAF50" 
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Best Day */}
          <View style={styles.bestDayCard}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.bestDayGradient}
            >
              <View style={styles.bestDayHeader}>
                <MaterialCommunityIcons name="star" size={32} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bestDayTitle}>Ngày tốt nhất</Text>
                  <Text style={styles.bestDayDate}>{weekData.bestDay.date}</Text>
                </View>
                <View style={styles.bestDayScore}>
                  <Text style={styles.bestDayScoreValue}>{weekData.bestDay.score}</Text>
                  <Text style={styles.bestDayScoreLabel}>điểm</Text>
                </View>
              </View>
              <Text style={styles.bestDayInfo}>
                {weekData.bestDay.sessions} phiên hoàn thành với điểm số cao nhất
              </Text>
            </LinearGradient>
          </View>

          {/* Daily Performance Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>📊 Hiệu suất từng ngày</Text>
            <View style={styles.dailyChart}>
              {weekData.dailyStats.map((day, index) => {
                const maxSessions = Math.max(...weekData.dailyStats.map(d => d.sessions));
                const barHeight = (day.sessions / maxSessions) * 100;
                const isToday = index === 6; // CN
                
                return (
                  <View key={index} style={styles.dayColumn}>
                    <View style={styles.dayBarContainer}>
                      <LinearGradient
                        colors={isToday ? ['#667eea', '#764ba2'] : ['#E0E0E0', '#BDBDBD']}
                        style={[styles.dayBar, { height: `${barHeight}%` }]}
                      >
                        <Text style={[
                          styles.dayBarValue,
                          { color: isToday ? '#fff' : '#666' }
                        ]}>
                          {day.sessions}
                        </Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.dayLabel}>{day.day}</Text>
                    <Text style={styles.dayScore}>{day.focusScore}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Highlights */}
          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>✨ Điểm nổi bật</Text>
            {weekData.highlights.map(highlight => (
              <View key={highlight.id} style={styles.highlightCard}>
                <View style={[styles.highlightIcon, { backgroundColor: highlight.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={highlight.icon} 
                    size={28} 
                    color={highlight.color} 
                  />
                </View>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightDescription}>{highlight.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Achievements */}
          {weekData.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>🏆 Thành tựu đạt được</Text>
              <View style={styles.achievementsRow}>
                {weekData.achievements.map(achievement => (
                  <View key={achievement.id} style={styles.achievementBadge}>
                    <LinearGradient
                      colors={[achievement.color, achievement.color + 'DD']}
                      style={styles.achievementGradient}
                    >
                      <MaterialCommunityIcons 
                        name={achievement.icon} 
                        size={40} 
                        color="#fff" 
                      />
                    </LinearGradient>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Top Distractions */}
          <View style={styles.distractionsSection}>
            <Text style={styles.sectionTitle}>🎯 Nguồn phân tâm chính</Text>
            {weekData.topDistractions.map((distraction, index) => (
              <View key={index} style={styles.distractionRow}>
                <View style={styles.distractionRank}>
                  <Text style={styles.distractionRankText}>{index + 1}</Text>
                </View>
                <View style={[styles.distractionIcon, { backgroundColor: distraction.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={distraction.icon} 
                    size={24} 
                    color={distraction.color} 
                  />
                </View>
                <Text style={styles.distractionName}>{distraction.name}</Text>
                <Text style={styles.distractionCount}>{distraction.count} lần</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/focus-training/performance-charts')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionGradient}
              >
                <MaterialCommunityIcons name="chart-line" size={24} color="#fff" />
                <Text style={styles.actionText}>Xem chi tiết biểu đồ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/focus-training/monthly-progress')}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.actionGradient}
              >
                <MaterialCommunityIcons name="calendar-month" size={24} color="#fff" />
                <Text style={styles.actionText}>Tiến độ tháng này</Text>
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
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scoreCard: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  scoreGradient: {
    padding: 32,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginLeft: 8,
  },
  scoreDescription: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#667eea20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#667eea',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  comparisonValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  comparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  bestDayCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bestDayGradient: {
    padding: 20,
  },
  bestDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bestDayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  bestDayDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  bestDayScore: {
    alignItems: 'center',
  },
  bestDayScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  bestDayScoreLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  bestDayInfo: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
  dailyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayBarContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  dayBar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 40,
  },
  dayBarValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  dayScore: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  highlightsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  highlightCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 16,
  },
  highlightIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  achievementBadge: {
    alignItems: 'center',
    flex: 1,
  },
  achievementGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  distractionsSection: {
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
  distractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  distractionRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractionRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  distractionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractionName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  distractionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
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
