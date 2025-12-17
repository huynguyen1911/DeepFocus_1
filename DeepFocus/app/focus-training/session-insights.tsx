// @ts-nocheck
/**
 * Session Insights Screen - Phase 4: AI Analysis & Insights
 * AI-powered analysis of session feedback with personalized recommendations
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SessionInsightsScreen() {
  const router = useRouter();
  const { feedbackData, sessionId, dayId } = useLocalSearchParams();
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [insights, setInsights] = useState(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    analyzeSession();
  }, []);

  const analyzeSession = async () => {
    try {
      setIsAnalyzing(true);
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false
      }).start();

      // Parse feedback data
      const feedback = JSON.parse(feedbackData);
      
      // Simulate AI analysis (2.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate insights based on feedback
      const generatedInsights = generateInsights(feedback);
      setInsights(generatedInsights);
      
      // Fade in insights
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
      
    } catch (error) {
      console.error('Error analyzing session:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateInsights = (feedback) => {
    const { focusRating, difficultyRating, emotion, distractions } = feedback;
    
    // Performance assessment
    let performanceLevel = '';
    let performanceIcon = '';
    let performanceColor = '';
    let performanceMessage = '';
    
    if (focusRating >= 4) {
      performanceLevel = 'Xuất sắc';
      performanceIcon = 'trophy';
      performanceColor = '#FFD700';
      performanceMessage = 'Bạn đã có một phiên tập trung tuyệt vời! Hãy duy trì phong độ này.';
    } else if (focusRating === 3) {
      performanceLevel = 'Tốt';
      performanceIcon = 'thumb-up';
      performanceColor = '#4CAF50';
      performanceMessage = 'Phiên tập trung khá ổn. Bạn có thể cải thiện hơn nữa!';
    } else {
      performanceLevel = 'Cần cải thiện';
      performanceIcon = 'alert-circle';
      performanceColor = '#FF9800';
      performanceMessage = 'Đừng lo lắng! Mỗi phiên tập trung là một bài học quý giá.';
    }

    // Recommendations based on distractions
    const recommendations = [];
    
    if (distractions.includes('phone')) {
      recommendations.push({
        icon: 'cellphone-off',
        title: 'Tắt điện thoại',
        description: 'Bật chế độ không làm phiền hoặc để điện thoại ở xa trong phiên tiếp theo',
        priority: 'high'
      });
    }
    
    if (distractions.includes('noise')) {
      recommendations.push({
        icon: 'headphones',
        title: 'Sử dụng tai nghe',
        description: 'Nghe nhạc trắng (white noise) hoặc nhạc lo-fi để chặn tiếng ồn',
        priority: 'high'
      });
    }
    
    if (distractions.includes('thoughts')) {
      recommendations.push({
        icon: 'meditation',
        title: 'Thực hành chánh niệm',
        description: 'Dành 5 phút thiền trước khi bắt đầu để làm dịu tâm trí',
        priority: 'medium'
      });
    }
    
    if (distractions.includes('tired') || emotion === 'tired') {
      recommendations.push({
        icon: 'sleep',
        title: 'Nghỉ ngơi đủ giấc',
        description: 'Đảm bảo ngủ đủ 7-8 tiếng mỗi đêm để tăng sức tập trung',
        priority: 'high'
      });
    }
    
    if (distractions.includes('hungry')) {
      recommendations.push({
        icon: 'food-apple',
        title: 'Ăn uống trước phiên',
        description: 'Ăn nhẹ healthy 30 phút trước để duy trì năng lượng',
        priority: 'medium'
      });
    }

    // Add general recommendations if no specific distractions
    if (recommendations.length === 0) {
      recommendations.push({
        icon: 'water',
        title: 'Giữ nước bên cạnh',
        description: 'Uống đủ nước giúp não hoạt động tốt hơn',
        priority: 'low'
      });
      recommendations.push({
        icon: 'window-open',
        title: 'Không gian thoáng đãng',
        description: 'Làm việc ở nơi có ánh sáng tự nhiên và không khí trong lành',
        priority: 'low'
      });
    }

    // Strengths
    const strengths = [];
    
    if (focusRating >= 4) {
      strengths.push({
        icon: 'target',
        text: 'Khả năng tập trung xuất sắc'
      });
    }
    
    if (difficultyRating >= 4 && focusRating >= 3) {
      strengths.push({
        icon: 'arm-flex',
        text: 'Dám thử thách bản thân'
      });
    }
    
    if (emotion === 'great' || emotion === 'good') {
      strengths.push({
        icon: 'emoticon-happy',
        text: 'Thái độ tích cực'
      });
    }
    
    if (distractions.length <= 2) {
      strengths.push({
        icon: 'shield-check',
        text: 'Ít bị phân tâm'
      });
    }

    // Add default strengths if none
    if (strengths.length === 0) {
      strengths.push({
        icon: 'check-circle',
        text: 'Hoàn thành phiên tập trung'
      });
    }

    // Areas for improvement
    const improvements = [];
    
    if (focusRating <= 2) {
      improvements.push({
        icon: 'target-off',
        text: 'Cải thiện khả năng tập trung',
        suggestion: 'Bắt đầu với phiên ngắn hơn (10-15 phút) và tăng dần'
      });
    }
    
    if (distractions.length >= 4) {
      improvements.push({
        icon: 'alert',
        text: 'Giảm nguồn phân tâm',
        suggestion: 'Chuẩn bị môi trường làm việc trước khi bắt đầu'
      });
    }
    
    if (emotion === 'frustrated') {
      improvements.push({
        icon: 'emoticon-sad',
        text: 'Quản lý cảm xúc',
        suggestion: 'Thực hành thở sâu khi cảm thấy căng thẳng'
      });
    }

    // Next steps
    const nextSteps = [
      {
        id: 1,
        icon: 'play-circle',
        title: 'Tiếp tục streak',
        description: 'Hoàn thành phiên tập trung tiếp theo trong 24h',
        action: 'continue'
      },
      {
        id: 2,
        icon: 'chart-line',
        title: 'Xem tiến độ',
        description: 'Theo dõi xu hướng tập trung theo thời gian',
        action: 'progress'
      },
      {
        id: 3,
        icon: 'trophy-variant',
        title: 'Kiểm tra thành tựu',
        description: 'Xem các huy hiệu đã mở khóa',
        action: 'achievements'
      }
    ];

    return {
      performance: {
        level: performanceLevel,
        icon: performanceIcon,
        color: performanceColor,
        message: performanceMessage,
        rating: focusRating
      },
      strengths,
      improvements,
      recommendations,
      nextSteps,
      stats: {
        focusScore: focusRating * 20,
        totalDistractions: distractions.length,
        emotionState: emotion
      }
    };
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'continue':
        router.push('/focus-training/calendar');
        break;
      case 'progress':
        router.push('/focus-training/performance-charts');
        break;
      case 'achievements':
        router.push('/focus-training/achievements');
        break;
    }
  };

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.analyzingContainer}
        >
          <MaterialCommunityIcons name="robot" size={80} color="#fff" />
          <Text style={styles.analyzingTitle}>Đang phân tích...</Text>
          <Text style={styles.analyzingSubtitle}>AI đang xử lý phản hồi của bạn</Text>
          
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>

          <View style={styles.analyzingSteps}>
            <Text style={styles.stepText}>✓ Đánh giá hiệu suất</Text>
            <Text style={styles.stepText}>✓ Phân tích điểm mạnh</Text>
            <Text style={styles.stepText}>✓ Tìm cơ hội cải thiện</Text>
            <Text style={styles.stepText}>✓ Tạo gợi ý cá nhân</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!insights) return null;

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
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🤖 Phân tích AI</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Performance Card */}
          <View style={styles.performanceCard}>
            <LinearGradient
              colors={[insights.performance.color, insights.performance.color + 'DD']}
              style={styles.performanceGradient}
            >
              <MaterialCommunityIcons 
                name={insights.performance.icon} 
                size={64} 
                color="#fff" 
              />
              <Text style={styles.performanceLevel}>{insights.performance.level}</Text>
              <Text style={styles.performanceMessage}>{insights.performance.message}</Text>
              
              <View style={styles.performanceScore}>
                <Text style={styles.performanceScoreNumber}>{insights.stats.focusScore}</Text>
                <Text style={styles.performanceScoreLabel}>/ 100 điểm</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Strengths */}
          {insights.strengths.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Điểm mạnh của bạn</Text>
              {insights.strengths.map((strength, index) => (
                <View key={index} style={styles.insightCard}>
                  <View style={styles.insightIconContainer}>
                    <MaterialCommunityIcons 
                      name={strength.icon} 
                      size={24} 
                      color="#4CAF50" 
                    />
                  </View>
                  <Text style={styles.insightText}>{strength.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Improvements */}
          {insights.improvements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Cơ hội cải thiện</Text>
              {insights.improvements.map((improvement, index) => (
                <View key={index} style={styles.improvementCard}>
                  <View style={styles.improvementHeader}>
                    <MaterialCommunityIcons 
                      name={improvement.icon} 
                      size={24} 
                      color="#FF9800" 
                    />
                    <Text style={styles.improvementText}>{improvement.text}</Text>
                  </View>
                  <Text style={styles.improvementSuggestion}>{improvement.suggestion}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Gợi ý cho phiên tiếp theo</Text>
            {insights.recommendations.map((rec, index) => (
              <View key={index} style={[
                styles.recommendationCard,
                rec.priority === 'high' && styles.recommendationHighPriority
              ]}>
                {rec.priority === 'high' && (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>Ưu tiên</Text>
                  </View>
                )}
                <View style={styles.recommendationHeader}>
                  <View style={styles.recommendationIconContainer}>
                    <MaterialCommunityIcons 
                      name={rec.icon} 
                      size={28} 
                      color="#667eea" 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Next Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Bước tiếp theo</Text>
            {insights.nextSteps.map(step => (
              <TouchableOpacity
                key={step.id}
                style={styles.nextStepCard}
                onPress={() => handleAction(step.action)}
              >
                <View style={styles.nextStepIconContainer}>
                  <MaterialCommunityIcons 
                    name={step.icon} 
                    size={32} 
                    color="#667eea" 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextStepTitle}>{step.title}</Text>
                  <Text style={styles.nextStepDescription}>{step.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            ))}
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
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  analyzingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 40,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  analyzingSteps: {
    marginTop: 40,
    gap: 12,
  },
  stepText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
  performanceCard: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  performanceGradient: {
    padding: 32,
    alignItems: 'center',
  },
  performanceLevel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  performanceMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.95,
  },
  performanceScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },
  performanceScoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  performanceScoreLabel: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  improvementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  improvementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  improvementSuggestion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 36,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  recommendationHighPriority: {
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  priorityBadge: {
    backgroundColor: '#FF5722',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  recommendationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  nextStepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  nextStepDescription: {
    fontSize: 14,
    color: '#666',
  },
});
