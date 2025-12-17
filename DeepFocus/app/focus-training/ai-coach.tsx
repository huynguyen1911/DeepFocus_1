// @ts-nocheck
/**
 * AI Coach Screen - Phase 6: AI Personality & Adaptive Coaching
 * Personalized AI coach with avatar, tips, motivation, adaptive suggestions
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AICoachScreen() {
  const router = useRouter();
  const [coachMood, setCoachMood] = useState('happy'); // happy, excited, encouraging, thoughtful
  const [selectedTab, setSelectedTab] = useState('tips'); // tips, motivation, insights, adaptive
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  // Mock user data for personalization
  const userData = {
    name: 'Bạn',
    currentStreak: 7,
    totalSessions: 68,
    avgFocusScore: 87,
    bestTimeOfDay: 'morning', // morning, afternoon, evening, night
    commonDistractions: ['phone', 'thoughts', 'noise'],
    recentTrend: 'improving', // improving, declining, stable
    lastSession: {
      score: 92,
      distractions: 1,
      duration: 45
    }
  };

  // AI Coach personality responses
  const coachPersonality = {
    greeting: getGreeting(userData),
    encouragement: getEncouragement(userData),
    tips: getContextualTips(userData),
    motivation: getMotivationalMessages(userData),
    insights: getAdaptiveInsights(userData)
  };

  function getGreeting(data: any) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Chào buổi sáng' : 
                         hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    
    if (data.currentStreak >= 7) {
      return `${timeGreeting}, ${data.name}! 🔥 Streak ${data.currentStreak} ngày - Xuất sắc!`;
    } else if (data.recentTrend === 'improving') {
      return `${timeGreeting}, ${data.name}! 📈 Bạn đang tiến bộ rất tốt!`;
    } else {
      return `${timeGreeting}, ${data.name}! 😊 Sẵn sàng tập trung chưa?`;
    }
  }

  function getEncouragement(data: any) {
    if (data.avgFocusScore >= 90) {
      return 'Bạn đang duy trì phong độ xuất sắc! Tiếp tục như vậy nhé! 💪';
    } else if (data.avgFocusScore >= 80) {
      return 'Điểm số của bạn rất tốt! Thử thách bản thân với phiên dài hơn? 🎯';
    } else if (data.avgFocusScore >= 70) {
      return 'Bạn đang trên đà tiến bộ! Hãy thử giảm thiểu phân tâm xem sao? 🌟';
    } else {
      return 'Đừng lo lắng, tập trung là kỹ năng có thể rèn luyện! Bắt đầu với phiên ngắn nhé 💙';
    }
  }

  function getContextualTips(data: any) {
    const hour = new Date().getHours();
    const tips = [];

    // Time-based tips
    if (hour >= 6 && hour < 9 && data.bestTimeOfDay === 'morning') {
      tips.push({
        id: 1,
        icon: 'weather-sunset-up',
        color: '#FF9800',
        title: 'Thời điểm vàng của bạn',
        description: 'Sáng sớm là lúc bạn tập trung tốt nhất. Hãy tận dụng!',
        priority: 'high'
      });
    }

    // Distraction-based tips
    if (data.commonDistractions.includes('phone')) {
      tips.push({
        id: 2,
        icon: 'cellphone-off',
        color: '#667eea',
        title: 'Tắt thông báo điện thoại',
        description: 'Điện thoại là nguồn phân tâm chính. Thử chế độ không làm phiền?',
        priority: 'high'
      });
    }

    if (data.commonDistractions.includes('thoughts')) {
      tips.push({
        id: 3,
        icon: 'meditation',
        color: '#9C27B0',
        title: 'Thực hành mindfulness',
        description: 'Thở sâu 5 phút trước khi bắt đầu để tĩnh tâm.',
        priority: 'medium'
      });
    }

    if (data.commonDistractions.includes('noise')) {
      tips.push({
        id: 4,
        icon: 'headphones',
        color: '#4CAF50',
        title: 'Sử dụng nhạc nền',
        description: 'Nhạc lo-fi hoặc white noise có thể giúp chặn tiếng ồn.',
        priority: 'medium'
      });
    }

    // Performance-based tips
    if (data.avgFocusScore < 70) {
      tips.push({
        id: 5,
        icon: 'clock-outline',
        color: '#FF5722',
        title: 'Bắt đầu với phiên ngắn',
        description: 'Thử kỹ thuật Pomodoro: 25 phút tập trung, 5 phút nghỉ.',
        priority: 'high'
      });
    }

    // Streak-based tips
    if (data.currentStreak >= 5) {
      tips.push({
        id: 6,
        icon: 'fire',
        color: '#FF6B6B',
        title: 'Duy trì động lực',
        description: `Streak ${data.currentStreak} ngày! Đừng để nó đứt mạch nhé!`,
        priority: 'medium'
      });
    }

    // Recent performance tips
    if (data.lastSession.score >= 90) {
      tips.push({
        id: 7,
        icon: 'trending-up',
        color: '#00897B',
        title: 'Tăng độ khó',
        description: 'Phiên trước xuất sắc! Thử tăng thời gian lên 60 phút?',
        priority: 'low'
      });
    }

    return tips.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  }

  function getMotivationalMessages(data: any) {
    const messages = [];

    // Streak messages
    if (data.currentStreak >= 7) {
      messages.push({
        id: 1,
        icon: 'trophy-award',
        color: '#FFD700',
        title: 'Tuần hoàn hảo!',
        message: `${data.currentStreak} ngày streak liên tiếp. Bạn đang xây dựng thói quen tuyệt vời! 🏆`,
        type: 'celebration'
      });
    }

    // Achievement messages
    if (data.totalSessions >= 50) {
      messages.push({
        id: 2,
        icon: 'star-circle',
        color: '#9C27B0',
        title: 'Cột mốc quan trọng',
        message: `${data.totalSessions} phiên hoàn thành! Mỗi phiên là một bước tiến! 🌟`,
        type: 'milestone'
      });
    }

    // Performance messages
    if (data.avgFocusScore >= 85) {
      messages.push({
        id: 3,
        icon: 'brain',
        color: '#667eea',
        title: 'Bậc thầy tập trung',
        message: 'Điểm trung bình 85+! Bạn đã làm chủ được sự tập trung. 🧠',
        type: 'achievement'
      });
    }

    // Encouraging messages
    if (data.recentTrend === 'improving') {
      messages.push({
        id: 4,
        icon: 'chart-line-variant',
        color: '#4CAF50',
        title: 'Xu hướng tích cực',
        message: 'Hiệu suất của bạn đang cải thiện đều đặn. Tiếp tục phát huy! 📈',
        type: 'encouragement'
      });
    }

    // Daily motivation
    messages.push({
      id: 5,
      icon: 'hand-heart',
      color: '#FF6B6B',
      title: 'Tin vào bản thân',
      message: 'Mọi hành trình vĩ đại đều bắt đầu từ một bước nhỏ. Hôm nay là ngày tuyệt vời! 💙',
      type: 'daily'
    });

    return messages;
  }

  function getAdaptiveInsights(data: any) {
    const insights = [];

    // Best time insight
    const timeLabels = {
      morning: 'buổi sáng (6h-12h)',
      afternoon: 'buổi chiều (12h-18h)',
      evening: 'buổi tối (18h-22h)',
      night: 'ban đêm (22h-6h)'
    };

    insights.push({
      id: 1,
      icon: 'clock-time-four',
      color: '#FF9800',
      title: 'Thời gian tối ưu',
      description: `Bạn tập trung tốt nhất vào ${timeLabels[data.bestTimeOfDay]}`,
      suggestion: 'Lên lịch các công việc quan trọng vào khung giờ này',
      actionable: true
    });

    // Session duration insight
    const avgDuration = 35; // Mock
    insights.push({
      id: 2,
      icon: 'timer-outline',
      color: '#4CAF50',
      title: 'Thời lượng phù hợp',
      description: `Phiên ${avgDuration} phút cho kết quả tốt nhất với bạn`,
      suggestion: 'Duy trì độ dài này để tối ưu hiệu suất',
      actionable: true
    });

    // Distraction pattern insight
    if (data.commonDistractions.length > 0) {
      insights.push({
        id: 3,
        icon: 'shield-alert',
        color: '#EF5350',
        title: 'Mẫu hình phân tâm',
        description: `Top nguồn phân tâm: ${data.commonDistractions.slice(0, 2).join(', ')}`,
        suggestion: 'Chuẩn bị môi trường trước khi bắt đầu để giảm thiểu',
        actionable: true
      });
    }

    // Performance trend insight
    if (data.recentTrend === 'improving') {
      insights.push({
        id: 4,
        icon: 'trending-up',
        color: '#00897B',
        title: 'Tiến bộ vượt bậc',
        description: 'Điểm số tăng đều trong 7 ngày qua',
        suggestion: 'Thử thách bản thân với mục tiêu cao hơn',
        actionable: true
      });
    } else if (data.recentTrend === 'declining') {
      insights.push({
        id: 5,
        icon: 'trending-down',
        color: '#FF5722',
        title: 'Cần điều chỉnh',
        description: 'Hiệu suất giảm nhẹ gần đây',
        suggestion: 'Nghỉ ngơi đầy đủ và giảm áp lực bản thân',
        actionable: true
      });
    }

    // Streak insight
    if (data.currentStreak >= 5) {
      insights.push({
        id: 6,
        icon: 'fire',
        color: '#FF6B6B',
        title: 'Thói quen bền vững',
        description: `Streak ${data.currentStreak} ngày - bạn đang xây dựng thói quen tốt`,
        suggestion: 'Đặt reminder để không bỏ lỡ ngày nào',
        actionable: true
      });
    }

    return insights;
  }

  const renderTipsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>💡 Gợi ý cho bạn</Text>
      {coachPersonality.tips.map(tip => (
        <View key={tip.id} style={styles.tipCard}>
          <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
            <MaterialCommunityIcons name={tip.icon} size={28} color={tip.color} />
          </View>
          <View style={styles.tipContent}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              {tip.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>Quan trọng</Text>
                </View>
              )}
            </View>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMotivationTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🎯 Động lực mỗi ngày</Text>
      {coachPersonality.motivation.map(msg => (
        <View key={msg.id} style={styles.motivationCard}>
          <LinearGradient
            colors={[msg.color, msg.color + 'DD']}
            style={styles.motivationGradient}
          >
            <MaterialCommunityIcons name={msg.icon} size={48} color="#fff" />
            <Text style={styles.motivationTitle}>{msg.title}</Text>
            <Text style={styles.motivationMessage}>{msg.message}</Text>
          </LinearGradient>
        </View>
      ))}
    </View>
  );

  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🧠 Phân tích thông minh</Text>
      {coachPersonality.insights.map(insight => (
        <View key={insight.id} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
              <MaterialCommunityIcons name={insight.icon} size={24} color={insight.color} />
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
          </View>
          <Text style={styles.insightDescription}>{insight.description}</Text>
          <View style={styles.insightSuggestion}>
            <MaterialCommunityIcons name="lightbulb-on" size={18} color="#FF9800" />
            <Text style={styles.insightSuggestionText}>{insight.suggestion}</Text>
          </View>
          {insight.actionable && (
            <TouchableOpacity style={styles.insightAction}>
              <Text style={styles.insightActionText}>Áp dụng ngay</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#667eea" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderAdaptiveTab = () => {
    // Import AdaptiveCoach
    const { AdaptiveCoach } = require('@/services/adaptive-coach');

    // Mock session data (replace with real data from API/storage)
    const mockSessions = [
      {
        id: '1',
        startTime: new Date('2024-01-15T09:00:00'),
        duration: 25,
        score: 92,
        distractions: ['phone', 'noise'],
        completed: true,
        timeOfDay: 'morning',
        dayOfWeek: 1
      },
      {
        id: '2',
        startTime: new Date('2024-01-15T14:00:00'),
        duration: 30,
        score: 78,
        distractions: ['thoughts', 'phone'],
        completed: true,
        timeOfDay: 'afternoon',
        dayOfWeek: 1
      },
      {
        id: '3',
        startTime: new Date('2024-01-16T09:30:00'),
        duration: 25,
        score: 95,
        distractions: [],
        completed: true,
        timeOfDay: 'morning',
        dayOfWeek: 2
      },
      {
        id: '4',
        startTime: new Date('2024-01-16T21:00:00'),
        duration: 20,
        score: 65,
        distractions: ['tired', 'phone', 'noise'],
        completed: false,
        timeOfDay: 'night',
        dayOfWeek: 2
      },
      {
        id: '5',
        startTime: new Date('2024-01-17T08:00:00'),
        duration: 30,
        score: 88,
        distractions: ['thoughts'],
        completed: true,
        timeOfDay: 'morning',
        dayOfWeek: 3
      }
    ];

    // Analyze patterns
    const userPattern = AdaptiveCoach.analyzeUserPatterns(mockSessions);
    
    // Generate recommendations
    const recommendations = AdaptiveCoach.generateRecommendations(userPattern, mockSessions);

    // Predict optimal time
    const optimalTime = AdaptiveCoach.predictOptimalTime(userPattern);

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>🎯 Học từ hành vi của bạn</Text>
        
        {/* Optimal Time Prediction */}
        <View style={styles.predictionCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA000']}
            style={styles.predictionGradient}
          >
            <MaterialCommunityIcons name="clock-star-four-points" size={48} color="#fff" />
            <Text style={styles.predictionTitle}>Thời điểm lý tưởng hôm nay</Text>
            <Text style={styles.predictionTime}>{optimalTime.hour}:00</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${optimalTime.confidence}%` }]} />
            </View>
            <Text style={styles.confidenceText}>Độ tin cậy: {optimalTime.confidence}%</Text>
          </LinearGradient>
        </View>

        {/* User Pattern Summary */}
        <View style={styles.patternSummary}>
          <Text style={styles.sectionTitle}>📊 Phân tích mẫu hành vi</Text>
          <View style={styles.patternGrid}>
            <View style={styles.patternItem}>
              <MaterialCommunityIcons name="weather-sunset-up" size={32} color="#FF9800" />
              <Text style={styles.patternLabel}>Khung giờ tốt nhất</Text>
              <Text style={styles.patternValue}>
                {userPattern.bestTimeOfDay === 'morning' ? 'Sáng sớm' :
                 userPattern.bestTimeOfDay === 'afternoon' ? 'Buổi chiều' :
                 userPattern.bestTimeOfDay === 'evening' ? 'Buổi tối' : 'Đêm khuya'}
              </Text>
            </View>
            <View style={styles.patternItem}>
              <MaterialCommunityIcons name="timer-outline" size={32} color="#4CAF50" />
              <Text style={styles.patternLabel}>Độ dài lý tưởng</Text>
              <Text style={styles.patternValue}>{userPattern.optimalDuration} phút</Text>
            </View>
            <View style={styles.patternItem}>
              <MaterialCommunityIcons name="chart-line" size={32} color="#667eea" />
              <Text style={styles.patternLabel}>Điểm trung bình</Text>
              <Text style={styles.patternValue}>{Math.round(userPattern.averageScore)}</Text>
            </View>
            <View style={styles.patternItem}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#66BB6A" />
              <Text style={styles.patternLabel}>Tỷ lệ hoàn thành</Text>
              <Text style={styles.patternValue}>{Math.round(userPattern.completionRate)}%</Text>
            </View>
          </View>
        </View>

        {/* Adaptive Recommendations */}
        <Text style={styles.sectionTitle}>💡 Đề xuất cá nhân hóa</Text>
        {recommendations.map(rec => (
          <View key={rec.id} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={[styles.recommendationIcon, { backgroundColor: rec.color + '20' }]}>
                <MaterialCommunityIcons name={rec.icon} size={28} color={rec.color} />
              </View>
              <View style={styles.recommendationTitleContainer}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <View style={styles.recommendationMeta}>
                  <View style={[
                    styles.priorityBadge,
                    { 
                      backgroundColor: rec.priority === 'high' ? '#EF5350' : 
                                      rec.priority === 'medium' ? '#FF9800' : '#9E9E9E' 
                    }
                  ]}>
                    <Text style={styles.priorityText}>
                      {rec.priority === 'high' ? 'Quan trọng' :
                       rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </Text>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#4CAF50" />
                    <Text style={styles.confidenceBadgeText}>{rec.confidence}%</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
            <View style={styles.recommendationReasoning}>
              <MaterialCommunityIcons name="information" size={16} color="#9CA3AF" />
              <Text style={styles.recommendationReasoningText}>{rec.reasoning}</Text>
            </View>
            <View style={styles.recommendationAction}>
              <MaterialCommunityIcons name="lightbulb-on" size={18} color="#FF9800" />
              <Text style={styles.recommendationActionText}>{rec.actionable}</Text>
            </View>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Áp dụng ngay</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#667eea" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Learning Progress */}
        <View style={styles.learningProgress}>
          <Text style={styles.sectionTitle}>🧠 AI đang học về bạn</Text>
          <Text style={styles.learningDescription}>
            Đã phân tích {mockSessions.length} phiên gần đây để hiểu thói quen của bạn
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, mockSessions.length * 10)}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {mockSessions.length < 10 
              ? `Cần thêm ${10 - mockSessions.length} phiên nữa để có phân tích chính xác hơn`
              : 'Đủ dữ liệu để đưa ra đề xuất tin cậy'}
          </Text>
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>🤖 AI Coach</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* AI Avatar & Greeting */}
          <View style={styles.avatarSection}>
            <Animated.View 
              style={[
                styles.avatarContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatarGradient}
              >
                <MaterialCommunityIcons name="robot" size={80} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.greetingText}>{coachPersonality.greeting}</Text>
            <Text style={styles.encouragementText}>{coachPersonality.encouragement}</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
              <Text style={styles.statValue}>{userData.currentStreak}</Text>
              <Text style={styles.statLabel}>Ngày streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="brain" size={24} color="#667eea" />
              <Text style={styles.statValue}>{userData.avgFocusScore}</Text>
              <Text style={styles.statLabel}>Điểm TB</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{userData.totalSessions}</Text>
              <Text style={styles.statLabel}>Tổng phiên</Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            {[
              { value: 'tips', label: 'Gợi ý', icon: 'lightbulb' },
              { value: 'motivation', label: 'Động lực', icon: 'heart' },
              { value: 'insights', label: 'Phân tích', icon: 'chart-line' },
              { value: 'adaptive', label: 'Cá nhân hóa', icon: 'auto-fix' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setSelectedTab(tab.value)}
                style={[
                  styles.tabButton,
                  selectedTab === tab.value && styles.tabButtonActive
                ]}
              >
                <MaterialCommunityIcons 
                  name={tab.icon} 
                  size={20} 
                  color={selectedTab === tab.value ? '#fff' : '#999'} 
                />
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.value && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {selectedTab === 'tips' && renderTipsTab()}
          {selectedTab === 'motivation' && renderMotivationTab()}
          {selectedTab === 'insights' && renderInsightsTab()}
          {selectedTab === 'adaptive' && renderAdaptiveTab()}

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push('/focus-training/calendar')}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.startGradient}
            >
              <MaterialCommunityIcons name="play-circle" size={28} color="#fff" />
              <Text style={styles.startText}>Bắt đầu phiên tập trung</Text>
            </LinearGradient>
          </TouchableOpacity>

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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  encouragementText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#EF535020',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF5350',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  motivationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  motivationGradient: {
    padding: 24,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  motivationMessage: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  insightDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  insightSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FF980010',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  insightSuggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  insightActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#667eea',
  },
  startButton: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  // Adaptive Tab Styles
  predictionCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  predictionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  predictionTitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
    fontWeight: '600',
  },
  predictionTime: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '700',
    marginTop: 8,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  confidenceText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
  },
  patternSummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  patternItem: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  patternLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  patternValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  recommendationIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendationTitleContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  recommendationMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  recommendationDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  recommendationReasoning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  recommendationReasoningText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  recommendationActionText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '600',
    lineHeight: 20,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  learningProgress: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  learningDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  progressText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
