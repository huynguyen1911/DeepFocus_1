// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import focusTrainingApi from '../../src/services/focusTrainingApi';

export default function AssessmentScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  
  const [responses, setResponses] = useState({
    focusLevel: 5,
    distractionLevel: 5,
    motivationLevel: 5,
    energyLevel: 5,
    stressLevel: 5,
    primaryGoal: '',
    availableTimePerDay: 30,
    preferredSessionLength: 15,
    experienceLevel: 'none',
    distractions: []
  });

  const questions = [
    {
      id: 'focusLevel',
      title: 'Khả năng tập trung hiện tại',
      question: 'Bạn đánh giá khả năng tập trung của mình như thế nào?',
      type: 'slider',
      min: 1,
      max: 10,
      labels: ['Rất kém', 'Trung bình', 'Rất tốt']
    },
    {
      id: 'distractionLevel',
      title: 'Mức độ bị phân tâm',
      question: 'Bạn thường xuyên bị phân tâm khi làm việc?',
      type: 'slider',
      min: 1,
      max: 10,
      labels: ['Rất ít', 'Thỉnh thoảng', 'Rất nhiều']
    },
    {
      id: 'primaryGoal',
      title: 'Mục tiêu chính',
      question: 'Bạn muốn cải thiện khả năng tập trung để làm gì?',
      type: 'choice',
      options: [
        { value: 'exam_preparation', label: '📚 Ôn thi' },
        { value: 'work_productivity', label: '💼 Làm việc hiệu quả' },
        { value: 'study_habits', label: '📖 Xây dựng thói quen học tập' },
        { value: 'deep_work', label: '🎯 Deep work / Công việc sâu' },
        { value: 'reduce_distractions', label: '🚫 Giảm phân tâm' },
        { value: 'meditation', label: '🧘 Thiền định & Mindfulness' }
      ]
    },
    {
      id: 'distractions',
      title: 'Nguyên nhân phân tâm',
      question: 'Điều gì thường khiến bạn mất tập trung? (chọn nhiều)',
      type: 'multi-choice',
      options: [
        { value: 'phone', label: '📱 Điện thoại' },
        { value: 'social_media', label: '💬 Mạng xã hội' },
        { value: 'noise', label: '🔊 Tiếng ồn' },
        { value: 'people', label: '👥 Người xung quanh' },
        { value: 'thoughts', label: '💭 Suy nghĩ lung tung' },
        { value: 'fatigue', label: '😴 Mệt mỏi' },
        { value: 'hunger', label: '🍔 Đói bụng' }
      ]
    },
    {
      id: 'availableTimePerDay',
      title: 'Thời gian có thể dành ra',
      question: 'Mỗi ngày bạn có thể dành bao nhiêu phút để rèn luyện tập trung?',
      type: 'slider',
      min: 10,
      max: 120,
      step: 10,
      unit: 'phút'
    },
    {
      id: 'experienceLevel',
      title: 'Kinh nghiệm',
      question: 'Bạn đã từng tập luyện kỹ năng tập trung chưa?',
      type: 'choice',
      options: [
        { value: 'none', label: '🆕 Chưa bao giờ' },
        { value: 'beginner', label: '🌱 Mới bắt đầu' },
        { value: 'intermediate', label: '📈 Đã có chút kinh nghiệm' },
        { value: 'advanced', label: '⭐ Khá thành thạo' }
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
    }
  };

  useEffect(() => {
    checkExistingPlan();
  }, []);

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
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    try {
      setIsLoading(true);
      
      // Submit assessment to AI using new API service
      const response = await focusTrainingApi.submitAssessment(responses);
      const { assessmentId, analysis, recommendations, suggestedDuration } = response;

      // Show AI analysis
      Alert.alert(
        '🤖 Kết quả phân tích',
        analysis,
        [
          {
            text: 'Tạo kế hoạch',
            onPress: () => generatePlan(assessmentId)
          },
          {
            text: 'Đóng',
            style: 'cancel'
          }
        ]
      );

    } catch (error: any) {
      console.error('Assessment error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
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

      Alert.alert(
        '✅ Kế hoạch đã sẵn sàng!',
        `Kế hoạch ${planData.totalWeeks} tuần của bạn đã được tạo.`,
        [
          {
            text: 'Xem lịch',
            onPress: () => router.push('/focus-training/calendar')
          }
        ]
      );
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
    const value = responses[question.id];

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{question.title}</Text>
        <Text style={styles.questionText}>{question.question}</Text>

        {question.type === 'slider' && (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              {Array.from({ length: question.max - question.min + 1 }).map((_, i) => {
                const val = question.min + i;
                const isSelected = val === value;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.sliderDot, isSelected && styles.sliderDotActive]}
                    onPress={() => handleSliderChange(val)}
                  >
                    <Text style={[styles.sliderDotText, isSelected && styles.sliderDotTextActive]}>
                      {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {question.labels && (
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{question.labels[0]}</Text>
                <Text style={styles.sliderLabel}>{question.labels[1]}</Text>
                <Text style={styles.sliderLabel}>{question.labels[2]}</Text>
              </View>
            )}
            {question.unit && (
              <Text style={styles.valueDisplay}>{value} {question.unit}</Text>
            )}
          </View>
        )}

        {(question.type === 'choice' || question.type === 'multi-choice') && (
          <View style={styles.choicesContainer}>
            {question.options.map(option => {
              const isSelected = question.type === 'multi-choice'
                ? value?.includes(option.value)
                : value === option.value;
              
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.choiceButton, isSelected && styles.choiceButtonActive]}
                  onPress={() => handleChoiceSelect(option.value)}
                >
                  <Text style={[styles.choiceText, isSelected && styles.choiceTextActive]}>
                    {option.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧠 Đánh giá năng lực tập trung</Text>
        <Text style={styles.headerSubtitle}>
          Câu hỏi {currentQuestion + 1}/{questions.length}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView style={styles.content}>
        {renderQuestion()}
      </ScrollView>

      <View style={styles.footer}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Đang xử lý...' : 
             currentQuestion === questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  sliderContainer: {
    marginTop: 20,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sliderDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  sliderDotActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sliderDotText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  sliderDotTextActive: {
    color: '#fff',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  valueDisplay: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  choiceButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  choiceText: {
    fontSize: 16,
    color: '#333',
  },
  choiceTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
