// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import focusTrainingApi from '../../src/services/focusTrainingApi';
import { useFocusTraining } from '../../src/contexts/FocusTrainingContext';

export default function AssessmentScreen() {
  const router = useRouter();
  const { startPlanGeneration } = useFocusTraining();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [responses, setResponses] = useState({
    focusLevel: 5,
    distractionLevel: 5,
    motivationLevel: 5,
    energyLevel: 5,
    stressLevel: 5,
    primaryGoal: '',
    availableTimePerDay: 10, // Start at MIN value (10 minutes)
    preferredSessionLength: 15,
    experienceLevel: 'none',
    distractions: []
  });

  const questions = [
    {
      id: 'focusLevel',
      title: '🎯 Khả năng tập trung',
      question: 'Bạn cảm thấy mức độ tập trung hiện tại của mình ra sao?',
      context: 'Thông tin này giúp DeepFocus điều chỉnh độ khó phù hợp cho bạn',
      type: 'slider',
      min: 1,
      max: 5,
      labels: ['Rất kém', 'Trung bình', 'Rất tốt']
    },
    {
      id: 'distractionLevel',
      title: '🎭 Mức độ phân tâm',
      question: 'Bạn thường xuyên bị phân tâm khi làm việc?',
      context: 'Giúp chúng tôi hiểu rõ thử thách của bạn để đưa ra giải pháp tốt nhất',
      type: 'slider',
      min: 1,
      max: 5,
      labels: ['Rất ít', 'Thỉnh thoảng', 'Rất nhiều']
    },
    {
      id: 'primaryGoal',
      title: '🎯 Mục tiêu của bạn',
      question: 'Bạn muốn cải thiện khả năng tập trung để làm gì?',
      context: 'Chọn mục tiêu chính để chúng tôi tùy chỉnh lộ trình phù hợp',
      type: 'choice',
      options: [
        { value: 'exam_preparation', label: '📚 Ôn thi', emoji: '📚' },
        { value: 'work_productivity', label: '💼 Làm việc hiệu quả', emoji: '💼' },
        { value: 'study_habits', label: '📖 Xây dựng thói quen học tập', emoji: '📖' },
        { value: 'deep_work', label: '🎯 Deep work / Công việc sâu', emoji: '🎯' },
        { value: 'reduce_distractions', label: '🚫 Giảm phân tâm', emoji: '🚫' },
        { value: 'meditation', label: '🧘 Thiền định & Mindfulness', emoji: '🧘' }
      ]
    },
    {
      id: 'distractions',
      title: '🔍 Nguyên nhân phân tâm',
      question: 'Điều gì thường khiến bạn mất tập trung? (chọn nhiều)',
      context: 'Xác định yếu tố gây phân tâm giúp app tạo môi trường tập trung tối ưu',
      type: 'multi-choice',
      options: [
        { value: 'phone', label: '📱 Điện thoại', emoji: '📱' },
        { value: 'social_media', label: '💬 Mạng xã hội', emoji: '💬' },
        { value: 'noise', label: '🔊 Tiếng ồn', emoji: '🔊' },
        { value: 'people', label: '👥 Người xung quanh', emoji: '👥' },
        { value: 'thoughts', label: '💭 Suy nghĩ lung tung', emoji: '💭' },
        { value: 'fatigue', label: '😴 Mệt mỏi', emoji: '😴' },
        { value: 'hunger', label: '🍔 Đói bụng', emoji: '🍔' }
      ]
    },
    {
      id: 'availableTimePerDay',
      title: '⏰ Thời gian dành ra',
      question: 'Mỗi ngày bạn có thể dành bao nhiêu phút để rèn luyện tập trung?',
      context: 'Chúng tôi sẽ tạo lộ trình phù hợp với lịch trình của bạn',
      type: 'slider',
      min: 10,
      max: 120,
      step: 10,
      unit: 'phút'
    },
    {
      id: 'experienceLevel',
      title: '💡 Kinh nghiệm',
      question: 'Bạn đã từng tập luyện kỹ năng tập trung chưa?',
      context: 'Điều này giúp chúng tôi bắt đầu từ mức độ phù hợp với bạn',
      type: 'choice',
      options: [
        { value: 'none', label: '🆕 Chưa bao giờ', emoji: '🆕' },
        { value: 'beginner', label: '🌱 Mới bắt đầu', emoji: '🌱' },
        { value: 'intermediate', label: '📈 Đã có chút kinh nghiệm', emoji: '📈' },
        { value: 'advanced', label: '⭐ Khá thành thạo', emoji: '⭐' }
      ]
    }
  ];

  const handleSliderChange = (value) => {
    const question = questions[currentQuestion];
    setResponses(prev => ({
      ...prev,
      [question.id]: value
    }));
  };

  const handleChoiceSelect = (value) => {
    const question = questions[currentQuestion];
    if (question.type === 'multi-choice') {
      const current = responses[question.id] || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setResponses(prev => ({ ...prev, [question.id]: newValue }));
    } else {
      setResponses(prev => ({ ...prev, [question.id]: value }));
      // Auto-advance for single choice after a short delay
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          animateTransition(() => setCurrentQuestion(prev => prev + 1));
        }
      }, 300);
    }
  };

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
    
    setTimeout(callback, 150);
  };

  useEffect(() => {
    checkExistingPlan();
    // Initialize fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    // Fade in on question change
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [currentQuestion]);

  const checkExistingPlan = async () => {
    try {
      const response = await focusTrainingApi.getActivePlan();
      console.log('Check existing plan response:', response);
      
      if (response?.plan) {
        // User already has active plan
        console.log('Found active plan:', response.plan._id);
        Alert.alert(
          'Đã có kế hoạch',
          'Bạn đã có một kế hoạch tập luyện đang hoạt động. Vui lòng hoàn thành hoặc hủy kế hoạch hiện tại trước.',
          [
            {
              text: 'Về Dashboard',
              onPress: () => router.replace('/focus-training')
            }
          ]
        );
      } else {
        console.log('No plan in response, can proceed');
      }
    } catch (error) {
      // No active plan - OK to proceed
      console.log('No active plan (error), can proceed with assessment:', error.message);
    } finally {
      setCheckingPlan(false);
    }
  };

  const canProceed = () => {
    const question = questions[currentQuestion];
    const value = responses[question.id];
    
    if (question.type === 'multi-choice') {
      return value && value.length > 0;
    }
    return value !== '' && value !== undefined;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      animateTransition(() => setCurrentQuestion(prev => prev + 1));
    } else {
      submitAssessment();
    }
  };

  const handleSkip = () => {
    const question = questions[currentQuestion];
    // Set default value for skipped question
    if (!responses[question.id] || (Array.isArray(responses[question.id]) && responses[question.id].length === 0)) {
      if (question.type === 'slider') {
        setResponses(prev => ({ ...prev, [question.id]: question.min }));
      } else if (question.type === 'choice') {
        setResponses(prev => ({ ...prev, [question.id]: question.options[0].value }));
      } else if (question.type === 'multi-choice') {
        setResponses(prev => ({ ...prev, [question.id]: [] }));
      }
    }
    handleNext();
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      animateTransition(() => setCurrentQuestion(prev => prev - 1));
    }
  };

  // Get slider color based on value
  const getSliderColor = (value, min, max, questionId) => {
    const normalized = (value - min) / (max - min);
    
    // For distractionLevel, reverse the color logic (high = bad = red)
    if (questionId === 'distractionLevel') {
      if (normalized < 0.33) return '#10b981'; // Low distraction = good = green
      if (normalized < 0.67) return '#f59e0b'; // Medium = orange
      return '#ef4444'; // High distraction = bad = red
    }
    
    // For other questions, normal logic (high = good = green)
    if (normalized < 0.33) return '#ef4444'; // Red
    if (normalized < 0.67) return '#f59e0b'; // Orange/Yellow
    return '#10b981'; // Green
  };

  // Get emoji based on slider value
  const getSliderEmoji = (value, min, max, questionId) => {
    const normalized = (value - min) / (max - min);
    
    // For distractionLevel, reverse the emoji logic (high = bad)
    if (questionId === 'distractionLevel') {
      if (normalized < 0.33) return '😊'; // Low distraction = good
      if (normalized < 0.67) return '😐';
      return '😟'; // High distraction = bad
    }
    
    // For other questions, normal logic (high = good)
    if (normalized < 0.33) return '😟';
    if (normalized < 0.67) return '😐';
    return '😊';
  };

  const submitAssessment = async () => {
    try {
      setIsSubmitted(true);
      setIsLoading(true);
      
      // Navigate to AI Processing screen IMMEDIATELY to prevent multiple taps
      router.push('/focus-training/ai-processing');
      
      // Submit assessment to AI in background
      const response = await focusTrainingApi.submitAssessment(responses);
      const { assessmentId, analysis, recommendations, suggestedDuration } = response;

      // Parse analysis data for visualization
      const analysisData = {
        focusScore: responses.focusLevel || 5,
        strengths: [
          "Có động lực cải thiện cao",
          "Nhận thức được vấn đề của bản thân",
          "Sẵn sàng dành thời gian rèn luyện"
        ],
        challenges: [
          "Dễ bị phân tâm bởi điện thoại và mạng xã hội",
          "Chưa có thói quen tập trung ổn định",
          "Cần cải thiện quản lý thời gian"
        ],
        recommendations: [
          "Bắt đầu với phiên Pomodoro 25 phút",
          "Tắt thông báo trong giờ tập trung",
          "Thiết lập không gian làm việc riêng biệt",
          "Theo dõi tiến độ hàng ngày"
        ]
      };

      // Start plan generation flow (locks navigation)
      await startPlanGeneration(assessmentId, analysisData);

      // Navigate to Analysis Results screen after 6 seconds (processing time)
      setTimeout(() => {
        router.replace({
          pathname: '/focus-training/analysis-results',
          params: {
            assessmentId,
            analysis: JSON.stringify(analysisData)
          }
        });
      }, 6000);

    } catch (error: any) {
      console.error('Assessment error:', error);
      setIsSubmitted(false);
      setIsLoading(false);
      // Go back to assessment if error occurred
      router.back();
      Alert.alert('Lỗi', error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const generatePlan = async (assessmentId: string) => {
    try {
      setIsLoading(true);

      const response = await focusTrainingApi.generatePlan({
        assessmentId,
        startDate: new Date().toISOString().split('T')[0]
      });

      const planData = (response as PlanResponse).plan;

      // Navigate to Plan Success screen with celebration
      router.replace({
        pathname: '/focus-training/plan-success',
        params: {
          assessmentId,
          duration: `${planData.duration} tuần`,
          level: 'Người mới bắt đầu',
          dailyGoal: '25 phút Pomodoro',
          totalSessions: planData.duration * 7
        }
      });
    } catch (error: any) {
      console.error('Plan generation error:', error);
      
      // Handle case where user already has active plan
      if (error.message?.includes('already have an active')) {
        Alert.alert(
          'Đã có kế hoạch',
          'Bạn đã có một kế hoạch tập luyện đang hoạt động. Vui lòng hoàn thành hoặc hủy kế hoạch hiện tại trước khi tạo kế hoạch mới.',
          [
            {
              text: 'Về Dashboard',
              onPress: () => router.push('/focus-training')
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể tạo kế hoạch. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const value = responses[question.id] ?? (question.type === 'slider' ? question.min : undefined);

    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionTitle}>{question.title.toUpperCase()}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.context && (
          <Text style={styles.questionContext}>💡 {question.context}</Text>
        )}

        {question.type === 'slider' && (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderValueDisplay}>
              <Text style={styles.sliderEmoji}>
                {getSliderEmoji(value, question.min, question.max, question.id)}
              </Text>
              <Text style={[styles.valueDisplayText, { color: getSliderColor(value, question.min, question.max, question.id) }]}>
                {value}{question.unit ? ` ${question.unit}` : ''}
              </Text>
            </View>
            
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={question.min}
                maximumValue={question.max}
                step={question.step || 1}
                value={value}
                onValueChange={handleSliderChange}
                minimumTrackTintColor={getSliderColor(value, question.min, question.max, question.id)}
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor={getSliderColor(value, question.min, question.max, question.id)}
              />
            </View>

            {question.labels && (
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{question.labels[0]}</Text>
                <Text style={styles.sliderLabel}>{question.labels[1]}</Text>
                <Text style={styles.sliderLabel}>{question.labels[2]}</Text>
              </View>
            )}
          </View>
        )}

        {(question.type === 'choice' || question.type === 'multi-choice') && (
          <View style={styles.choicesContainer}>
            {question.options.map((option, index) => {
              const isSelected = question.type === 'multi-choice'
                ? value?.includes(option.value)
                : value === option.value;
              
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.choiceCard,
                    isSelected && styles.choiceCardActive,
                    { 
                      transform: [{ scale: isSelected ? 1.02 : 1 }]
                    }
                  ]}
                  onPress={() => handleChoiceSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.choiceCardContent}>
                    <View style={styles.choiceIconContainer}>
                      <Text style={styles.choiceIcon}>{option.emoji}</Text>
                    </View>
                    <Text style={[styles.choiceText, isSelected && styles.choiceTextActive]}>
                      {option.label.replace(option.emoji, '').trim()}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Animated.View>
    );
  };

  // Show loading while checking for existing plan
  if (checkingPlan) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang kiểm tra...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradientHeader}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={[styles.headerBackButton, isSubmitted && styles.headerBackButtonDisabled]} 
                onPress={currentQuestion > 0 ? handleBack : () => {
                  if (isSubmitted) {
                    Alert.alert(
                      'Đang xử lý',
                      'Đánh giá của bạn đang được xử lý. Vui lòng đợi.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    router.back();
                  }
                }}
                disabled={isSubmitted}
              >
                <Text style={styles.headerBackText}>←</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>✨ Thiết lập hồ sơ DeepFocus</Text>
            <Text style={styles.headerSubtitle}>
              Câu hỏi {currentQuestion + 1}/{questions.length}
            </Text>
            
            {/* Progress Bar với Gradient */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={["#F093FB", "#F5576C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
                  ]}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuestion()}
      </ScrollView>

      <View style={styles.footer}>
        {/* Skip button for optional questions */}
        {(questions[currentQuestion].type === 'multi-choice' || 
          questions[currentQuestion].type === 'choice') && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Bỏ qua →</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
        >
          <LinearGradient
            colors={canProceed() ? ["#F093FB", "#F5576C"] : ["#ccc", "#aaa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Đang xử lý...' : 
               currentQuestion === questions.length - 1 ? '✨ Hoàn thành' : 'Tiếp theo →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  gradientHeader: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackButtonDisabled: {
    opacity: 0.5,
  },
  headerBackText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  // Progress Bar Gradient
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Glassmorphism effect
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  questionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 30,
  },
  questionContext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Slider Styles
  sliderContainer: {
    marginTop: 20,
  },
  sliderValueDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sliderEmoji: {
    fontSize: 36,
  },
  valueDisplayText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sliderWrapper: {
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Choice Cards with Rich Design
  choicesContainer: {
    gap: 14,
    marginTop: 8,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceCardActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  choiceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  choiceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceIcon: {
    fontSize: 24,
  },
  choiceText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  choiceTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F5576C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
