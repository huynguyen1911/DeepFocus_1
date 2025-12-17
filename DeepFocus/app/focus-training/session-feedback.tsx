// @ts-nocheck
/**
 * Session Feedback Screen - Phase 4: Post-Session Feedback
 * Rich feedback form with ratings, emotions, notes after completing focus session
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SessionFeedbackScreen() {
  const router = useRouter();
  const { sessionId, duration, challengeId, dayId } = useLocalSearchParams();
  
  // Feedback state
  const [focusRating, setFocusRating] = useState(0); // 1-5
  const [difficultyRating, setDifficultyRating] = useState(0); // 1-5
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [distractions, setDistractions] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
  }, []);

  const emotions = [
    { id: 'great', emoji: '😊', label: 'Tuyệt vời', color: '#4CAF50' },
    { id: 'good', emoji: '🙂', label: 'Tốt', color: '#66BB6A' },
    { id: 'okay', emoji: '😐', label: 'Bình thường', color: '#FFA726' },
    { id: 'tired', emoji: '😓', label: 'Mệt mỏi', color: '#FF7043' },
    { id: 'frustrated', emoji: '😤', label: 'Khó chịu', color: '#EF5350' },
  ];

  const distractionTypes = [
    { id: 'phone', icon: 'cellphone', label: 'Điện thoại' },
    { id: 'noise', icon: 'volume-high', label: 'Tiếng ồn' },
    { id: 'people', icon: 'account-group', label: 'Người khác' },
    { id: 'thoughts', icon: 'thought-bubble', label: 'Suy nghĩ' },
    { id: 'notifications', icon: 'bell', label: 'Thông báo' },
    { id: 'hungry', icon: 'food-apple', label: 'Đói/khát' },
    { id: 'tired', icon: 'sleep', label: 'Buồn ngủ' },
    { id: 'other', icon: 'dots-horizontal', label: 'Khác' },
  ];

  const handleRatingPress = (type: 'focus' | 'difficulty', value: number) => {
    if (type === 'focus') {
      setFocusRating(value);
    } else {
      setDifficultyRating(value);
    }
  };

  const handleEmotionPress = (emotionId: string) => {
    setSelectedEmotion(emotionId);
  };

  const handleDistractionToggle = (distractionId: string) => {
    if (distractions.includes(distractionId)) {
      setDistractions(distractions.filter(d => d !== distractionId));
    } else {
      setDistractions([...distractions, distractionId]);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (focusRating === 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng đánh giá mức độ tập trung');
      return;
    }
    if (!selectedEmotion) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn cảm xúc của bạn');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const feedbackData = {
        focusRating,
        difficultyRating,
        emotion: selectedEmotion,
        distractions,
        notes,
        duration: parseInt(duration),
        completedAt: new Date().toISOString()
      };

      // Save feedback to backend
      const focusTrainingApi = require('../../src/services/focusTrainingApi').default;
      
      if (dayId && challengeId) {
        // Complete challenge with feedback
        await focusTrainingApi.completeChallenge(
          dayId,
          parseInt(challengeId),
          {
            score: focusRating * 20, // Convert 1-5 to 20-100
            feedback: feedbackData
          }
        );
      }

      // Show success and navigate to insights
      Alert.alert(
        '✅ Cảm ơn bạn!',
        'Phản hồi của bạn đã được lưu. Hãy xem phân tích AI!',
        [
          {
            text: 'Xem phân tích',
            onPress: () => router.push({
              pathname: '/focus-training/session-insights',
              params: {
                feedbackData: JSON.stringify(feedbackData),
                sessionId,
                dayId
              }
            })
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Lỗi', 'Không thể lưu phản hồi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Bỏ qua phản hồi?',
      'Phản hồi giúp chúng tôi hiểu bạn tốt hơn và đưa ra gợi ý phù hợp.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ qua',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const canSubmit = focusRating > 0 && selectedEmotion;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Bỏ qua</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📝 Phản hồi phiên tập trung</Text>
            <Text style={styles.headerSubtitle}>Chia sẻ trải nghiệm của bạn</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Focus Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🎯 Bạn tập trung được như thế nào?
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(value => (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleRatingPress('focus', value)}
                  style={[
                    styles.ratingButton,
                    focusRating >= value && styles.ratingButtonActive
                  ]}
                >
                  <MaterialCommunityIcons
                    name={focusRating >= value ? 'star' : 'star-outline'}
                    size={36}
                    color={focusRating >= value ? '#FFD700' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Rất kém</Text>
              <Text style={styles.ratingLabel}>Xuất sắc</Text>
            </View>
          </View>

          {/* Difficulty Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💪 Mức độ khó của phiên này?
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(value => (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleRatingPress('difficulty', value)}
                  style={[
                    styles.difficultyButton,
                    difficultyRating >= value && styles.difficultyButtonActive
                  ]}
                >
                  <Text style={[
                    styles.difficultyNumber,
                    difficultyRating >= value && styles.difficultyNumberActive
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Rất dễ</Text>
              <Text style={styles.ratingLabel}>Rất khó</Text>
            </View>
          </View>

          {/* Emotion Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              😊 Cảm xúc của bạn hiện tại?
            </Text>
            <View style={styles.emotionsContainer}>
              {emotions.map(emotion => (
                <TouchableOpacity
                  key={emotion.id}
                  onPress={() => handleEmotionPress(emotion.id)}
                  style={[
                    styles.emotionButton,
                    selectedEmotion === emotion.id && {
                      borderColor: emotion.color,
                      borderWidth: 3,
                      backgroundColor: emotion.color + '15'
                    }
                  ]}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={[
                    styles.emotionLabel,
                    selectedEmotion === emotion.id && { 
                      color: emotion.color,
                      fontWeight: '700'
                    }
                  ]}>
                    {emotion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distractions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🚫 Bạn bị phân tâm bởi gì?
            </Text>
            <Text style={styles.sectionSubtitle}>Chọn tất cả những gì áp dụng</Text>
            <View style={styles.distractionsGrid}>
              {distractionTypes.map(distraction => (
                <TouchableOpacity
                  key={distraction.id}
                  onPress={() => handleDistractionToggle(distraction.id)}
                  style={[
                    styles.distractionChip,
                    distractions.includes(distraction.id) && styles.distractionChipActive
                  ]}
                >
                  <MaterialCommunityIcons
                    name={distraction.icon}
                    size={20}
                    color={distractions.includes(distraction.id) ? '#667eea' : '#666'}
                  />
                  <Text style={[
                    styles.distractionLabel,
                    distractions.includes(distraction.id) && styles.distractionLabelActive
                  ]}>
                    {distraction.label}
                  </Text>
                  {distractions.includes(distraction.id) && (
                    <MaterialCommunityIcons name="check-circle" size={16} color="#667eea" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📝 Ghi chú thêm (tùy chọn)
            </Text>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder="Chia sẻ suy nghĩ, cảm nhận hoặc bất cứ điều gì bạn muốn..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <LinearGradient
              colors={canSubmit ? ['#4CAF50', '#66BB6A'] : ['#ccc', '#999']}
              style={styles.submitButtonGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                  <Text style={styles.submitButtonText}>Gửi phản hồi</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  ratingButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  ratingButtonActive: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9E6',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#999',
  },
  difficultyButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  difficultyButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#EEF0FF',
  },
  difficultyNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ccc',
  },
  difficultyNumberActive: {
    color: '#667eea',
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  emotionButton: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  emotionEmoji: {
    fontSize: 36,
  },
  emotionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  distractionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  distractionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  distractionChipActive: {
    borderColor: '#667eea',
    backgroundColor: '#EEF0FF',
  },
  distractionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  distractionLabelActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  notesContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  notesInput: {
    fontSize: 15,
    color: '#333',
    minHeight: 100,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
