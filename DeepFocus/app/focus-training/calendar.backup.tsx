// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import focusTrainingApi from '../../src/services/focusTrainingApi';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trainingDays, setTrainingDays] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get active plan using new API service
      const planResponse = await focusTrainingApi.getActivePlan();
      setPlan(planResponse.plan);

      // Get training days for current month using local dates
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      
      const lastDay = new Date(year, month + 1, 0);
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      console.log('📅 Loading calendar days:', startDate, 'to', endDate);

      const daysResponse = await focusTrainingApi.getTrainingDays(startDate, endDate);

      // Map days by date using local date formatting
      const daysMap = {};
      daysResponse.days?.forEach((day) => {
        const d = new Date(day.date);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        daysMap[dateKey] = day;
      });
      setTrainingDays(daysMap);

    } catch (error: any) {
      console.error('Error loading calendar:', error);
      if (error.code === 'NOT_FOUND') {
        Alert.alert(
          'Chưa có kế hoạch',
          'Bạn chưa có kế hoạch tập luyện. Hãy hoàn thành đánh giá trước!',
          [
            {
              text: 'Đánh giá ngay',
              onPress: () => router.push('/focus-training/assessment')
            }
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startOffset = firstDay.getDay(); // 0 = Sunday

    // Add empty cells for days before month starts
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getDateKey = (date) => {
    if (!date) return null;
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      case 'completed': return '✅';
      case 'today': return '🎯';
      case 'rest': return '😴';
      case 'upcoming': return '📅';
      case 'missed': return '⭕';
      default: return '';
    }
  };

  const getDayColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'today': return '#2196F3';
      case 'rest': return '#9E9E9E';
      case 'upcoming': return '#FF9800';
      case 'missed': return '#F44336';
      default: return '#e0e0e0';
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
    
    // Format date consistently as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    const trainingDay = trainingDays[dateKey];
    
    console.log('📅 Date pressed:', dateKey, 'Training day found:', !!trainingDay);
    
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
    const color = getDayColor(status);

    return (
      <TouchableOpacity
        key={index}
        style={[styles.dayCell, !date && styles.dayCellEmpty]}
        onPress={() => handleDatePress(date)}
        disabled={!date || !status}
      >
        {date && (
          <>
            <Text style={[styles.dayNumber, { color }]}>
              {dayNumber}
            </Text>
            {icon && <Text style={styles.dayIcon}>{icon}</Text>}
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải lịch...</Text>
        </View>
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
      <ScrollView>
        {/* Header with Plan Info */}
        {plan && (
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.planStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.completionRate}%</Text>
                <Text style={styles.statLabel}>Hoàn thành</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.currentStreak}</Text>
                <Text style={styles.statLabel}>Chuỗi ngày</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{plan.totalPoints}</Text>
                <Text style={styles.statLabel}>Điểm</Text>
              </View>
            </View>
          </View>
        )}

        {/* Calendar Navigation */}
        <View style={styles.calendarNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((date, dayIndex) => renderDay(date, `${weekIndex}-${dayIndex}`))}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Chú thích:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>✅</Text>
              <Text style={styles.legendText}>Hoàn thành</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🎯</Text>
              <Text style={styles.legendText}>Hôm nay</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>😴</Text>
              <Text style={styles.legendText}>Ngày nghỉ</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>📅</Text>
              <Text style={styles.legendText}>Sắp tới</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>⭕</Text>
              <Text style={styles.legendText}>Bỏ lỡ</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/focus-training/progress')}
          >
            <Text style={styles.actionButtonText}>📊 Xem tiến độ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              const today = new Date().toISOString().split('T')[0];
              router.push({
                pathname: '/focus-training/day-detail',
                params: { date: today }
              });
            }}
          >
            <Text style={styles.actionButtonText}>🎯 Tập luyện hôm nay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  planHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekdayHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 1,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendar: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 1,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  dayCellEmpty: {
    backgroundColor: 'transparent',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayIcon: {
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendIcon: {
    fontSize: 16,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
