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
  Dimensions,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import focusTrainingApi from '../../src/services/focusTrainingApi';

const { width, height } = Dimensions.get('window');

export default function EnhancedDayDetailScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const [trainingDay, setTrainingDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingChallenge, setCompletingChallenge] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTrainingDay();
  }, [date]);

  useEffect(() => {
    if (!isLoading && trainingDay) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, trainingDay]);

  const loadTrainingDay = async () => {
    try {
      setIsLoading(true);
      
      let dateStr = Array.isArray(date) ? date[0] : date;
      if (!dateStr) {
        const today = new Date();
        dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }
      
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

  const showCelebrationAnimation = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.spring(celebrationAnim, {
        toValue: 1,
        tension: 20,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  };

  const handleStartChallenge = (challengeIndex: number) => {
    if (!trainingDay) return;
    
    const challenge = trainingDay.challenges[challengeIndex];
    
    // If it's a focus session, open session screen
    if (challenge.type === 'focus_session') {
      router.push({
        pathname: '/focus-training/session',
        params: {
          challengeId: challenge._id || challengeIndex,
          duration: challenge.duration,
          type: challenge.type,
          dayId: trainingDay._id
        }
      });
    } else {
      // For other types (breathing, mindfulness, etc.), complete directly
      handleCompleteChallenge(challengeIndex);
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

      await loadTrainingDay();
      
      const { points, dayCompleted } = response.data;
      
      if (dayCompleted) {
        showCelebrationAnimation();
        setTimeout(() => {
          Alert.alert(
            '🎉 Hoàn thành xuất sắc!',
            `Chúc mừng! Bạn đã hoàn thành tất cả thử thách hôm nay và nhận được ${points} điểm!`,
            [
              {
                text: 'Xem tiến độ',
                onPress: () => router.push('/focus-training/progress')
              },
              { text: 'Tuyệt vời!' }
            ]
          );
        }, 500);
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

  const getChallengeIcon = (type) => {
    const icons = {
      focus_session: 'target',
      breathing: 'lungs',
      mindfulness: 'meditation',
      stretching: 'yoga',
      reflection: 'thought-bubble',
    };
    return icons[type] || 'checkbox-marked-circle';
  };

  const getChallengeTypeName = (type) => {
    const names = {
      focus_session: 'Phiên tập trung',
      breathing: 'Thở thư giãn',
      mindfulness: 'Mindfulness',
      stretching: 'Duỗi người',
      reflection: 'Suy ngẫm',
    };
    return names[type] || 'Thử thách';
  };

  const getChallengeGradient = (type, completed) => {
    if (completed) return ['#4CAF50', '#66BB6A'];
    
    const gradients = {
      focus_session: ['#667eea', '#764ba2'],
      breathing: ['#42A5F5', '#1E88E5'],
      mindfulness: ['#FFA726', '#FB8C00'],
      stretching: ['#26A69A', '#00897B'],
      reflection: ['#AB47BC', '#8E24AA'],
    };
    return gradients[type] || ['#757575', '#616161'];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!trainingDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
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
  const dateObj = new Date(trainingDay.date);

  return (
    <SafeAreaView style={styles.container}>
      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <BlurView intensity={80} style={styles.celebrationOverlay}>
          <Animated.View
            style={[
              styles.celebrationContent,
              {
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Hoàn thành xuất sắc!</Text>
            <Text style={styles.celebrationText}>Bạn đã hoàn thành tất cả thử thách hôm nay!</Text>
          </Animated.View>
        </BlurView>
      </Modal>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={isRestDay ? ['#9E9E9E', '#757575'] : ['#667eea', '#764ba2']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.dateText}>
              {dateObj.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </Text>
            <View style={styles.dayTypeContainer}>
              <MaterialCommunityIcons 
                name={isRestDay ? 'sleep' : 'calendar-star'} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.dayType}>
                {isRestDay ? 'Ngày nghỉ ngơi' : `Ngày ${trainingDay.dayNumber}`}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Progress Card */}
          {!isRestDay && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Tiến độ hôm nay</Text>
                <Text style={styles.progressPercentText}>{completionPercentage}%</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>

              <View style={styles.pointsContainer}>
                <MaterialCommunityIcons name="star" size={20} color="#FFA726" />
                <Text style={styles.pointsText}>
                  {trainingDay.totalPoints} điểm
                </Text>
              </View>
            </View>
          )}

          {/* AI Encouragement */}
          {trainingDay.aiEncouragement && !isRestDay && (
            <LinearGradient
              colors={['#E8EAF6', '#F3E5F5']}
              style={styles.encouragementCard}
            >
              <View style={styles.encouragementHeader}>
                <MaterialCommunityIcons name="robot-happy" size={24} color="#667eea" />
                <Text style={styles.encouragementTitle}>AI Coach</Text>
              </View>
              <Text style={styles.encouragementText}>{trainingDay.aiEncouragement}</Text>
            </LinearGradient>
          )}

          {/* Rest Day Experience */}
          {isRestDay && (
            <View style={styles.restDayContainer}>
              <LinearGradient
                colors={['#E8EAF6', '#F3E5F5']}
                style={styles.restDayCard}
              >
                <MaterialCommunityIcons name="sleep" size={64} color="#9E9E9E" />
                <Text style={styles.restDayTitle}>Ngày nghỉ ngơi</Text>
                <Text style={styles.restDayText}>
                  Hôm nay là ngày để cơ thể và tâm trí của bạn phục hồi. 
                  Hãy thư giãn, không cần phải tập luyện!
                </Text>
              </LinearGradient>

              {/* Rest Day Tips */}
              <View style={styles.restTipsContainer}>
                <Text style={styles.restTipsTitle}>💡 Gợi ý cho ngày nghỉ</Text>
                
                <View style={styles.restTipCard}>
                  <MaterialCommunityIcons name="walk" size={24} color="#4CAF50" />
                  <View style={styles.restTipContent}>
                    <Text style={styles.restTipTitle}>Đi dạo nhẹ nhàng</Text>
                    <Text style={styles.restTipDesc}>20-30 phút ở công viên</Text>
                  </View>
                </View>

                <View style={styles.restTipCard}>
                  <MaterialCommunityIcons name="book-open-variant" size={24} color="#2196F3" />
                  <View style={styles.restTipContent}>
                    <Text style={styles.restTipTitle}>Đọc sách yêu thích</Text>
                    <Text style={styles.restTipDesc}>Thư giãn với một cuốn sách hay</Text>
                  </View>
                </View>

                <View style={styles.restTipCard}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#FF9800" />
                  <View style={styles.restTipContent}>
                    <Text style={styles.restTipTitle}>Gặp gỡ bạn bè</Text>
                    <Text style={styles.restTipDesc}>Dành thời gian cho người thân</Text>
                  </View>
                </View>

                <View style={styles.restTipCard}>
                  <MaterialCommunityIcons name="spa" size={24} color="#9C27B0" />
                  <View style={styles.restTipContent}>
                    <Text style={styles.restTipTitle}>Thư giãn toàn diện</Text>
                    <Text style={styles.restTipDesc}>Nghe nhạc, tắm nước ấm, hoặc thiền</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Challenges Section */}
          {!isRestDay && trainingDay.challenges && trainingDay.challenges.length > 0 && (
            <View style={styles.challengesSection}>
              <Text style={styles.sectionTitle}>
                🎯 Thử thách hôm nay ({trainingDay.challenges.length})
              </Text>
              
              {trainingDay.challenges.map((challenge, index) => {
                const gradient = getChallengeGradient(challenge.type, challenge.completed);
                
                return (
                  <View key={index} style={styles.challengeCardWrapper}>
                    <LinearGradient
                      colors={gradient}
                      style={styles.challengeCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {/* Challenge Header */}
                      <View style={styles.challengeCardHeader}>
                        <View style={styles.challengeTitleRow}>
                          <MaterialCommunityIcons 
                            name={getChallengeIcon(challenge.type)} 
                            size={28} 
                            color="#fff" 
                          />
                          <View style={styles.challengeTitleContainer}>
                            <Text style={styles.challengeTitle}>
                              {getChallengeTypeName(challenge.type)}
                            </Text>
                            <View style={styles.challengeMetaRow}>
                              <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.challengeMeta}>
                                {challenge.duration} phút
                              </Text>
                              <Text style={styles.challengeMetaDot}>•</Text>
                              <MaterialCommunityIcons name="gauge" size={14} color="rgba(255,255,255,0.8)" />
                              <Text style={styles.challengeMeta}>
                                Độ khó: {challenge.difficulty}/10
                              </Text>
                            </View>
                          </View>
                        </View>
                        {challenge.completed && (
                          <View style={styles.completedBadge}>
                            <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                          </View>
                        )}
                      </View>

                      {/* Challenge Description */}
                      <Text style={styles.challengeDescription}>
                        {challenge.description}
                      </Text>

                      {/* Instructions */}
                      {challenge.instructions && challenge.instructions.length > 0 && (
                        <View style={styles.instructionsContainer}>
                          <View style={styles.instructionsHeader}>
                            <MaterialCommunityIcons name="format-list-numbered" size={16} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.instructionsTitle}>Hướng dẫn</Text>
                          </View>
                          {challenge.instructions.map((instruction, i) => (
                            <View key={i} style={styles.instructionItem}>
                              <Text style={styles.instructionNumber}>{i + 1}</Text>
                              <Text style={styles.instructionText}>{instruction}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Action Button or Completed Info */}
                      {challenge.completed ? (
                        <View style={styles.completedInfoContainer}>
                          <View style={styles.completedScoreRow}>
                            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                            <Text style={styles.completedScore}>
                              Điểm: {challenge.score}/100
                            </Text>
                          </View>
                          <Text style={styles.completedTime}>
                            Hoàn thành lúc {new Date(challenge.completedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.completeButton}
                          onPress={() => handleStartChallenge(index)}
                          disabled={completingChallenge === index}
                          activeOpacity={0.8}
                        >
                          {completingChallenge === index ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <>
                              <MaterialCommunityIcons 
                                name={challenge.type === 'focus_session' ? 'play-circle' : 'check-bold'} 
                                size={20} 
                                color="#fff" 
                              />
                              <Text style={styles.completeButtonText}>
                                {challenge.type === 'focus_session' ? 'Bắt đầu phiên' : 'Hoàn thành thử thách'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          )}

          {/* Focus Tips */}
          {!isRestDay && (
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>💡 Mẹo tập trung</Text>
              
              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="bell-off" size={20} color="#F44336" />
                <Text style={styles.tipText}>Tắt thông báo điện thoại</Text>
              </View>

              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="headphones" size={20} color="#2196F3" />
                <Text style={styles.tipText}>Nghe nhạc lo-fi hoặc classical</Text>
              </View>

              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="water" size={20} color="#00BCD4" />
                <Text style={styles.tipText}>Uống đủ nước trong ngày</Text>
              </View>

              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="window-open" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Làm việc ở không gian thoáng đãng</Text>
              </View>
            </View>
          )}

          {/* Bottom Spacer */}
          <View style={{ height: 32 }} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 12,
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
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButtonHeader: {
    marginBottom: 12,
  },
  headerContent: {
    gap: 8,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayType: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercentText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  encouragementCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  encouragementText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  restDayContainer: {
    marginTop: -20,
  },
  restDayCard: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  restDayText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
  },
  restTipsContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  restTipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  restTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restTipContent: {
    marginLeft: 12,
    flex: 1,
  },
  restTipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  restTipDesc: {
    fontSize: 13,
    color: '#666',
  },
  challengesSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  challengeCardWrapper: {
    marginBottom: 16,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeCardHeader: {
    marginBottom: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  challengeTitleContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  challengeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  challengeMetaDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 6,
    borderRadius: 20,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 16,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
  },
  instructionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  completedInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  completedScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  completedScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  completedTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipsSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  celebrationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContent: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  celebrationEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
