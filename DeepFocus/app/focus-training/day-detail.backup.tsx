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
import { useRouter, useLocalSearchParams } from 'expo-router';
import focusTrainingApi from '../../src/services/focusTrainingApi';

export default function DayDetailScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const [trainingDay, setTrainingDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingChallenge, setCompletingChallenge] = useState(null);

  useEffect(() => {
    loadTrainingDay();
  }, [date]);

  const loadTrainingDay = async () => {
    try {
      setIsLoading(true);
      
      // Handle date parameter and ensure consistent format (YYYY-MM-DD)
      let dateStr = Array.isArray(date) ? date[0] : date;
      if (!dateStr) {
        const today = new Date();
        dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }
      
      console.log('📅 Loading training day for date:', dateStr);
      const response = await focusTrainingApi.getTrainingDay(dateStr);
      
      if (response?.data?.trainingDay) {
        setTrainingDay(response.data.trainingDay);
      } else {
        throw new Error('No training scheduled for this date');
      }
    } catch (error: any) {
      console.error('Error loading training day:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải thông tin ngày tập luyện');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeIndex: number) => {
    if (!trainingDay) return;
    
    try {
      setCompletingChallenge(challengeIndex);
      
      const response = await focusTrainingApi.completeChallenge(
        trainingDay._id,
        challengeIndex,
        { score: 85 }
      );

      // Reload training day
      await loadTrainingDay();
      
      const { points, dayCompleted } = response.data;
      
      if (dayCompleted) {
        Alert.alert(
          '🎉 Hoàn thành!',
          `Chúc mừng! Bạn đã hoàn thành tất cả thử thách hôm nay và nhận được ${points} điểm!`,
          [
            {
              text: 'Xem tiến độ',
              onPress: () => router.push('/focus-training/progress')
            },
            {
              text: 'OK'
            }
          ]
        );
      } else {
        Alert.alert('✅ Hoàn thành', `Bạn đã nhận được +${points - trainingDay.totalPoints} điểm!`);
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành thử thách');
    } finally {
      setCompletingChallenge(null);
    }
  };

  const getChallengeTypeIcon = (type) => {
    switch (type) {
      case 'focus_session': return '🎯';
      case 'breathing': return '🧘';
      case 'mindfulness': return '🌟';
      case 'stretching': return '🤸';
      case 'reflection': return '💭';
      default: return '📝';
    }
  };

  const getChallengeTypeName = (type) => {
    switch (type) {
      case 'focus_session': return 'Phiên tập trung';
      case 'breathing': return 'Thở thư giãn';
      case 'mindfulness': return 'Mindfulness';
      case 'stretching': return 'Duỗi người';
      case 'reflection': return 'Suy ngẫm';
      default: return 'Thử thách';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trainingDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có thử thách cho ngày này</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isRestDay = trainingDay.type === 'rest';
  const completionPercentage = trainingDay.completionPercentage || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.dateText}>
              {new Date(trainingDay.date).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </Text>
            <Text style={styles.dayType}>
              {isRestDay ? '😴 Ngày nghỉ ngơi' : `📅 Ngày ${trainingDay.dayNumber}`}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {!isRestDay && (
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Tiến độ hôm nay</Text>
              <Text style={styles.progressPercent}>{completionPercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${completionPercentage}%` }]}
              />
            </View>
            <Text style={styles.pointsText}>
              🌟 Điểm hiện tại: {trainingDay.totalPoints}
            </Text>
          </View>
        )}

        {/* AI Encouragement */}
        {trainingDay.aiEncouragement && (
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementTitle}>💬 Lời động viên từ AI Coach</Text>
            <Text style={styles.encouragementText}>{trainingDay.aiEncouragement}</Text>
          </View>
        )}

        {/* Rest Day Message */}
        {isRestDay && (
          <View style={styles.restDayCard}>
            <Text style={styles.restDayIcon}>😴</Text>
            <Text style={styles.restDayTitle}>Ngày nghỉ ngơi</Text>
            <Text style={styles.restDayText}>
              Hôm nay là ngày để cơ thể và tâm trí của bạn phục hồi. 
              Hãy thư giãn, không cần phải tập luyện!
            </Text>
            <Text style={styles.restDayTip}>
              💡 Mẹo: Hãy dành thời gian làm những điều bạn yêu thích, 
              gặp gỡ bạn bè, hoặc đơn giản là nghỉ ngơi.
            </Text>
          </View>
        )}

        {/* Challenges */}
        {!isRestDay && trainingDay.challenges && (
          <View style={styles.challengesSection}>
            <Text style={styles.sectionTitle}>
              🎯 Thử thách hôm nay ({trainingDay.challenges.length})
            </Text>
            
            {trainingDay.challenges.map((challenge, index) => (
              <View 
                key={index} 
                style={[
                  styles.challengeCard,
                  challenge.completed && styles.challengeCardCompleted
                ]}
              >
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={styles.challengeIcon}>
                      {getChallengeTypeIcon(challenge.type)}
                    </Text>
                    <View style={styles.challengeTitleContainer}>
                      <Text style={styles.challengeTitle}>
                        {getChallengeTypeName(challenge.type)}
                      </Text>
                      <Text style={styles.challengeDuration}>
                        ⏱️ {challenge.duration} phút • Độ khó: {challenge.difficulty}/10
                      </Text>
                    </View>
                  </View>
                  {challenge.completed && (
                    <Text style={styles.completedBadge}>✅ Hoàn thành</Text>
                  )}
                </View>

                <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text>

                {challenge.instructions && challenge.instructions.length > 0 && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>📋 Hướng dẫn:</Text>
                    {challenge.instructions.map((instruction, i) => (
                      <Text key={i} style={styles.instructionItem}>
                        {i + 1}. {instruction}
                      </Text>
                    ))}
                  </View>
                )}

                {challenge.completed ? (
                  <View style={styles.completedInfo}>
                    <Text style={styles.completedScore}>
                      ⭐ Điểm: {challenge.score}/100
                    </Text>
                    <Text style={styles.completedTime}>
                      Hoàn thành lúc: {new Date(challenge.completedAt).toLocaleTimeString('vi-VN')}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleCompleteChallenge(index)}
                    disabled={completingChallenge === index}
                  >
                    {completingChallenge === index ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.completeButtonText}>
                        ✓ Hoàn thành thử thách
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Tips Section */}
        {!isRestDay && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 Mẹo để tập trung tốt hơn</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>🔕 Tắt thông báo điện thoại</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>🎧 Nghe nhạc tập trung (lo-fi, classical)</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>💧 Uống đủ nước</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>🪟 Làm việc ở nơi sáng, thông thoáng</Text>
            </View>
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    fontSize: 24,
    color: '#4CAF50',
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dayType: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  pointsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  encouragementCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  encouragementText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  restDayCard: {
    margin: 20,
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  restDayIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  restDayText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  restDayTip: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    lineHeight: 20,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  challengesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  challengeCardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  challengeHeader: {
    marginBottom: 15,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeTitleContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeDuration: {
    fontSize: 14,
    color: '#666',
  },
  completedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  challengeDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  instructionsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  completedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  completedScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  completedTime: {
    fontSize: 12,
    color: '#999',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    padding: 20,
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: '#666',
  },
});
