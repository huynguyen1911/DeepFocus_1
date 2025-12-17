// @ts-nocheck
/**
 * AI Tips Component - Phase 6: Contextual Tips System
 * Reusable component for displaying contextual AI tips throughout the app
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AITipProps {
  context?: 'pre-session' | 'post-session' | 'dashboard' | 'break' | 'calendar';
  userData?: any;
  onDismiss?: () => void;
  style?: any;
}

export default function AITip({ context = 'dashboard', userData = {}, onDismiss, style }: AITipProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();

    // Auto-cycle tips every 10 seconds
    const timer = setInterval(() => {
      handleNextTip();
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const tips = getContextualTips(context, userData);

  const handleNextTip = () => {
    if (tips.length > 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      });
    }
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  if (!isVisible || tips.length === 0) return null;

  const currentTip = tips[currentTipIndex];

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim
        }
      ]}
    >
      <LinearGradient
        colors={currentTip.gradient || ['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={currentTip.icon} size={24} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.tipLabel}>💡 AI Coach gợi ý</Text>
            <Text style={styles.tipTitle}>{currentTip.title}</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.tipDescription}>{currentTip.description}</Text>

        {currentTip.action && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={currentTip.action.onPress}
          >
            <Text style={styles.actionText}>{currentTip.action.label}</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {tips.length > 1 && (
          <View style={styles.pagination}>
            {tips.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentTipIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

function getContextualTips(context: string, userData: any) {
  const hour = new Date().getHours();
  const tips: any[] = [];

  switch (context) {
    case 'pre-session':
      tips.push({
        icon: 'meditation',
        title: 'Chuẩn bị tâm trí',
        description: 'Thử thở sâu 5 lần trước khi bắt đầu để tăng sự tập trung.',
        gradient: ['#9C27B0', '#7B1FA2']
      });

      if (userData?.commonDistractions?.includes('phone')) {
        tips.push({
          icon: 'cellphone-off',
          title: 'Tắt thông báo',
          description: 'Điện thoại là nguồn phân tâm chính. Bật chế độ không làm phiền?',
          gradient: ['#667eea', '#764ba2'],
          action: {
            label: 'Hướng dẫn',
            onPress: () => console.log('Show DND guide')
          }
        });
      }

      if (hour >= 14 && hour < 16) {
        tips.push({
          icon: 'coffee',
          title: 'Sau buổi trưa',
          description: 'Uống một ly nước hoặc đi bộ 2 phút để tỉnh táo hơn.',
          gradient: ['#FF9800', '#F57C00']
        });
      }
      break;

    case 'post-session':
      if (userData?.lastSession?.score >= 90) {
        tips.push({
          icon: 'trophy',
          title: 'Xuất sắc!',
          description: 'Điểm cao tuyệt vời! Thử tăng độ khó lên 50 phút cho lần sau?',
          gradient: ['#FFD700', '#FFA000']
        });
      } else if (userData?.lastSession?.score < 70) {
        tips.push({
          icon: 'heart',
          title: 'Đừng nản chí',
          description: 'Mỗi phiên đều là bài học. Thử giảm thời gian xuống 15-20 phút?',
          gradient: ['#FF6B6B', '#EF5350']
        });
      }

      tips.push({
        icon: 'water',
        title: 'Nghỉ ngơi đúng cách',
        description: 'Uống nước, duỗi người và tránh xa màn hình trong lúc nghỉ.',
        gradient: ['#4CAF50', '#66BB6A']
      });
      break;

    case 'dashboard':
      if (userData?.currentStreak >= 7) {
        tips.push({
          icon: 'fire',
          title: 'Streak tuyệt vời!',
          description: `${userData.currentStreak} ngày liên tiếp! Đừng để nó đứt mạch nhé!`,
          gradient: ['#FF6B6B', '#EF5350']
        });
      }

      if (hour >= 6 && hour < 9) {
        tips.push({
          icon: 'weather-sunset-up',
          title: 'Sáng sớm hiệu quả',
          description: 'Đây là thời điểm tốt để tập trung. Bắt đầu ngay nhé!',
          gradient: ['#FF9800', '#F57C00']
        });
      } else if (hour >= 22) {
        tips.push({
          icon: 'sleep',
          title: 'Đã muộn rồi',
          description: 'Nghỉ ngơi đầy đủ giúp tăng hiệu suất ngày mai. Chúc ngủ ngon!',
          gradient: ['#5E35B1', '#4527A0']
        });
      }

      if (userData?.recentTrend === 'declining') {
        tips.push({
          icon: 'heart-pulse',
          title: 'Cần nghỉ ngơi',
          description: 'Hiệu suất giảm có thể do mệt mỏi. Nghỉ 1 ngày để hồi phục?',
          gradient: ['#EF5350', '#D32F2F']
        });
      }
      break;

    case 'break':
      tips.push({
        icon: 'stretch',
        title: 'Duỗi người',
        description: 'Đứng lên, duỗi tay chân giúp máu lưu thông tốt hơn.',
        gradient: ['#00897B', '#00695C']
      });

      tips.push({
        icon: 'eye',
        title: 'Nghỉ mắt',
        description: 'Nhìn xa 20 giây để giảm mỏi mắt (quy tắc 20-20-20).',
        gradient: ['#1976D2', '#1565C0']
      });
      break;

    case 'calendar':
      if (userData?.totalSessions < 10) {
        tips.push({
          icon: 'rocket-launch',
          title: 'Mới bắt đầu?',
          description: 'Bắt đầu với 15-20 phút mỗi ngày để xây dựng thói quen.',
          gradient: ['#667eea', '#764ba2']
        });
      }

      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 1) { // Monday
        tips.push({
          icon: 'calendar-week',
          title: 'Đầu tuần mới',
          description: 'Lên kế hoạch cho cả tuần để duy trì động lực!',
          gradient: ['#4CAF50', '#66BB6A']
        });
      }
      break;
  }

  // Default tip if no specific tips
  if (tips.length === 0) {
    tips.push({
      icon: 'lightbulb-on',
      title: 'Mẹo hay',
      description: 'Tập trung đều đặn mỗi ngày tốt hơn dồn vào một lần.',
      gradient: ['#667eea', '#764ba2']
    });
  }

  return tips;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  tipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
    marginBottom: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    opacity: 0.95,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
});
