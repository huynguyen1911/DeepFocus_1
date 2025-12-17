// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import focusTrainingApi from '../../src/services/focusTrainingApi';
import AITip from '../../components/ai-tip';

const { width } = Dimensions.get('window');
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function EnhancedCalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trainingDays, setTrainingDays] = useState({});
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showAITip, setShowAITip] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentDate]);

  useEffect(() => {
    // Pulse animation for streak
    if (currentStreak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(streakAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(streakAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStreak]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get active plan
      const planResponse = await focusTrainingApi.getActivePlan();
      setPlan(planResponse.plan);

      // Get training days for current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0);
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      const daysResponse = await focusTrainingApi.getTrainingDays(startDate, endDate);

      // Map days by date
      const daysMap = {};
      daysResponse.days?.forEach((day) => {
        const d = new Date(day.date);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        daysMap[dateKey] = day;
      });
      setTrainingDays(daysMap);

      // Calculate streaks
      calculateStreaks(daysMap);

    } catch (error: any) {
      console.error('Error loading calendar:', error);
      if (error.code === 'NOT_FOUND') {
        Alert.alert(
          'Chưa có kế hoạch',
          'Bạn chưa có kế hoạch tập luyện. Hãy hoàn thành đánh giá trước!',
          [{ text: 'Đánh giá ngay', onPress: () => router.push('/focus-training/assessment') }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreaks = (daysMap) => {
    const sortedDates = Object.keys(daysMap).sort().reverse();
    let current = 0;
    let best = 0;
    let temp = 0;

    // Calculate current streak
    const today = new Date();
    for (const dateKey of sortedDates) {
      const day = daysMap[dateKey];
      const dayDate = new Date(dateKey);
      
      if (day.completed && day.type !== 'rest') {
        if (dayDate <= today) {
          current++;
        }
        temp++;
        best = Math.max(best, temp);
      } else if (day.type !== 'rest' && dayDate < today) {
        break;
      }
    }

    setCurrentStreak(current);
    setBestStreak(best);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startOffset = firstDay.getDay();

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDayStatus = (date) => {
    if (!date) return null;
    const dateKey = getDateKey(date);
    const trainingDay = trainingDays[dateKey];
    
    if (!trainingDay) return null;
    
    if (trainingDay.type === 'rest') return 'rest';
    if (trainingDay.completed) return 'completed';
    if (isToday(date)) return 'today';
    if (isFuture(date)) return 'upcoming';
    return 'missed';
  };

  const getDayIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'today': return 'target';
      case 'rest': return 'sleep';
      case 'upcoming': return 'calendar-blank';
      case 'missed': return 'close-circle-outline';
      default: return null;
    }
  };

  const getDayColors = (status) => {
    switch (status) {
      case 'completed': return ['#4CAF50', '#66BB6A'];
      case 'today': return ['#2196F3', '#42A5F5'];
      case 'rest': return ['#9E9E9E', '#BDBDBD'];
      case 'upcoming': return ['#FF9800', '#FFA726'];
      case 'missed': return ['#F44336', '#EF5350'];
      default: return ['#e0e0e0', '#e0e0e0'];
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDatePress = (date) => {
    if (!date) return;
    
    const dateKey = getDateKey(date);
    const trainingDay = trainingDays[dateKey];
    
    if (trainingDay) {
      router.push({
        pathname: '/focus-training/day-detail',
        params: { date: dateKey }
      });
    }
  };

  const renderDay = (date: Date, index: number) => {
    const status = getDayStatus(date);
    const dayNumber = date ? date.getDate() : '';
    const icon = getDayIcon(status);
    const colors = getDayColors(status);

    if (!date) {
      return <View key={index} style={styles.dayCell} />;
    }

    return (
      <TouchableOpacity
        key={index}
        style={styles.dayCellContainer}
        onPress={() => handleDatePress(date)}
        disabled={!status}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={status ? colors : ['#f9f9f9', '#f9f9f9']}
          style={[
            styles.dayCell,
            status === 'today' && styles.dayCellToday,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[
            styles.dayNumber,
            status && styles.dayNumberActive,
            status === 'today' && styles.dayNumberToday
          ]}>
            {dayNumber}
          </Text>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={16} 
              color={status ? '#fff' : '#999'}
              style={styles.dayIconStyle}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang tải lịch...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const days = getDaysInMonth();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Streak Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.streakHeader}>
          <View style={styles.streakRow}>
            <Animated.View style={[styles.streakContainer, { transform: [{ scale: streakAnim }] }]}>
              <MaterialCommunityIcons name="fire" size={32} color="#FFD700" />
              <View>
                <Text style={styles.streakNumber}>{currentStreak}</Text>
                <Text style={styles.streakLabel}>Ngày liên tiếp</Text>
              </View>
            </Animated.View>
            
            <View style={styles.bestStreakContainer}>
              <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
              <View>
                <Text style={styles.bestStreakNumber}>{bestStreak}</Text>
                <Text style={styles.bestStreakLabel}>Kỷ lục</Text>
              </View>
            </View>
          </View>

          {/* AI Coach Quick Access */}
          <TouchableOpacity 
            style={styles.aiCoachQuickButton}
            onPress={() => router.push('/focus-training/ai-coach')}
          >
            <MaterialCommunityIcons name="robot" size={20} color="#fff" />
            <Text style={styles.aiCoachQuickText}>AI Coach</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Plan Stats */}
        {plan && (
          <Animated.View style={[styles.planHeader, { opacity: fadeAnim }]}>
            <Text style={styles.planTitle}>📚 {plan.title}</Text>
            <View style={styles.planStats}>
              <View style={styles.statCard}>
                <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.statGradient}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                  <Text style={styles.statValue}>{plan.completionRate}%</Text>
                  <Text style={styles.statLabel}>Hoàn thành</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={['#2196F3', '#42A5F5']} style={styles.statGradient}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color="#fff" />
                  <Text style={styles.statValue}>{plan.completedDays || 0}</Text>
                  <Text style={styles.statLabel}>Ngày đã tập</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={['#FF9800', '#FFA726']} style={styles.statGradient}>
                  <MaterialCommunityIcons name="star" size={24} color="#fff" />
                  <Text style={styles.statValue}>{plan.totalPoints || 0}</Text>
                  <Text style={styles.statLabel}>Điểm</Text>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Calendar Navigation */}
        <View style={styles.calendarNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#667eea" />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-right" size={28} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        {/* AI Tip - Pre-Session */}
        {showAITip && (
          <AITip 
            context="calendar"
            userData={{
              currentStreak,
              totalSessions: bestStreak,
              avgFocusScore: 85,
              recentTrend: 'improving'
            }}
            onDismiss={() => setShowAITip(false)}
            style={{ marginHorizontal: 20, marginBottom: 16 }}
          />
        )}

        {/* Calendar Grid */}
        <Animated.View style={[styles.calendar, { opacity: fadeAnim }]}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((date, dayIndex) => renderDay(date, `${weekIndex}-${dayIndex}`))}
            </View>
          ))}
        </Animated.View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Chú thích</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.legendIcon}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.legendText}>Hoàn thành</Text>
            </View>
            <View style={styles.legendItem}>
              <LinearGradient colors={['#2196F3', '#42A5F5']} style={styles.legendIcon}>
                <MaterialCommunityIcons name="target" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.legendText}>Hôm nay</Text>
            </View>
            <View style={styles.legendItem}>
              <LinearGradient colors={['#9E9E9E', '#BDBDBD']} style={styles.legendIcon}>
                <MaterialCommunityIcons name="sleep" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.legendText}>Nghỉ ngơi</Text>
            </View>
            <View style={styles.legendItem}>
              <LinearGradient colors={['#FF9800', '#FFA726']} style={styles.legendIcon}>
                <MaterialCommunityIcons name="calendar-blank" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.legendText}>Sắp tới</Text>
            </View>
            <View style={styles.legendItem}>
              <LinearGradient colors={['#F44336', '#EF5350']} style={styles.legendIcon}>
                <MaterialCommunityIcons name="close-circle-outline" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.legendText}>Bỏ lỡ</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            onPress={() => router.push('/focus-training/progress')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.actionButton}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Xem tiến độ chi tiết</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              const today = new Date().toISOString().split('T')[0];
              router.push({
                pathname: '/focus-training/day-detail',
                params: { date: today }
              });
            }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.actionButton}>
              <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Bắt đầu tập luyện hôm nay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  streakHeader: {
    padding: 20,
    paddingTop: 10,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  bestStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bestStreakNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bestStreakLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
  },
  aiCoachQuickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 8,
  },
  aiCoachQuickText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  planHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  planStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  calendar: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dayCellContainer: {
    flex: 1,
    aspectRatio: 1,
  },
  dayCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayCellToday: {
    shadowColor: '#2196F3',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  dayNumberActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayNumberToday: {
    fontSize: 18,
  },
  dayIconStyle: {
    marginTop: 2,
  },
  legend: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    color: '#666',
  },
  quickActions: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
