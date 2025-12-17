// @ts-nocheck
/**
 * Break Screen - Phase 3: During Session Enhancements
 * Relaxation content, breathing exercises, stretching guides during break time
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.5;
const CIRCLE_RADIUS = (CIRCLE_SIZE - 20) / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function BreakScreen() {
  const router = useRouter();
  const { duration = 5, breakType = 'short' } = useLocalSearchParams(); // duration in minutes
  
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration) * 60);
  const [selectedActivity, setSelectedActivity] = useState('relax');
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  
  const totalDuration = parseInt(duration) * 60;

  // Activities during break
  const activities = [
    {
      id: 'relax',
      title: 'Thư giãn',
      icon: 'meditation',
      gradient: ['#42A5F5', '#1E88E5'],
      description: 'Nghỉ ngơi, uống nước, nhìn xa'
    },
    {
      id: 'breathe',
      title: 'Thở sâu',
      icon: 'lungs',
      gradient: ['#26A69A', '#00897B'],
      description: 'Bài tập hơi thở 4-7-8'
    },
    {
      id: 'stretch',
      title: 'Giãn cơ',
      icon: 'yoga',
      gradient: ['#FFA726', '#FB8C00'],
      description: 'Các động tác giãn cơ nhẹ nhàng'
    },
    {
      id: 'walk',
      title: 'Đi bộ',
      icon: 'walk',
      gradient: ['#66BB6A', '#4CAF50'],
      description: 'Đi lại trong phòng hoặc ra ngoài'
    }
  ];

  // Breathing exercise steps
  const breathingSteps = [
    { phase: 'inhale', duration: 4, text: 'Hít vào sâu', icon: 'arrow-up-circle' },
    { phase: 'hold', duration: 7, text: 'Giữ hơi', icon: 'pause-circle' },
    { phase: 'exhale', duration: 8, text: 'Thở ra từ từ', icon: 'arrow-down-circle' }
  ];

  // Stretching exercises
  const stretchingExercises = [
    {
      name: 'Xoay cổ',
      icon: 'head',
      description: 'Xoay cổ nhẹ nhàng theo chiều kim đồng hồ và ngược lại, mỗi bên 5 vòng'
    },
    {
      name: 'Giãn vai',
      icon: 'human-handsup',
      description: 'Nâng vai lên đến tai, giữ 3 giây rồi thả xuống. Lặp lại 5 lần'
    },
    {
      name: 'Vươn vai',
      icon: 'arm-flex',
      description: 'Đan tay lại và đẩy ra phía trước, giữ 10-15 giây'
    },
    {
      name: 'Xoay cổ tay',
      icon: 'hand-wave',
      description: 'Xoay cổ tay và mắt cá theo cả hai chiều, mỗi bên 10 vòng'
    }
  ];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        const progress = ((totalDuration - newTime) / totalDuration) * CIRCLE_CIRCUMFERENCE;
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false
        }).start();
        
        if (newTime <= 0) {
          handleBreakComplete();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Breathing animation
  useEffect(() => {
    if (selectedActivity === 'breathe') {
      runBreathingCycle();
    }
  }, [selectedActivity, breathPhase]);

  const runBreathingCycle = () => {
    const currentStep = breathingSteps.find(step => step.phase === breathPhase);
    if (!currentStep) return;

    const animationValues = {
      inhale: { scale: 1.3, duration: 4000 },
      hold: { scale: 1.3, duration: 7000 },
      exhale: { scale: 1, duration: 8000 }
    };

    const config = animationValues[breathPhase];
    
    Animated.timing(breathAnim, {
      toValue: config.scale,
      duration: config.duration,
      useNativeDriver: true
    }).start(() => {
      // Move to next phase
      if (breathPhase === 'inhale') setBreathPhase('hold');
      else if (breathPhase === 'hold') setBreathPhase('exhale');
      else setBreathPhase('inhale');
    });
  };

  const handleBreakComplete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    router.back();
  };

  const handleSkipBreak = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    router.back();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentActivity = activities.find(a => a.id === selectedActivity);
  const progressOffset = CIRCLE_CIRCUMFERENCE - ((totalDuration - timeRemaining) / totalDuration) * CIRCLE_CIRCUMFERENCE;

  const renderActivityContent = () => {
    switch (selectedActivity) {
      case 'relax':
        return (
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>💆 Thư giãn thoải mái</Text>
            <View style={styles.relaxTips}>
              {[
                { icon: 'water', text: 'Uống một ly nước' },
                { icon: 'eye', text: 'Nhìn vào khoảng cách xa (20-20-20)' },
                { icon: 'sofa', text: 'Ngả lưng nghỉ ngơi' },
                { icon: 'window-open', text: 'Hít thở không khí trong lành' }
              ].map((tip, index) => (
                <View key={index} style={styles.relaxTip}>
                  <MaterialCommunityIcons name={tip.icon} size={24} color="#42A5F5" />
                  <Text style={styles.relaxTipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 'breathe':
        const currentStep = breathingSteps.find(step => step.phase === breathPhase);
        return (
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>🫁 Bài tập hơi thở 4-7-8</Text>
            
            <View style={styles.breathingContainer}>
              <Animated.View 
                style={[
                  styles.breathingCircle,
                  { transform: [{ scale: breathAnim }] }
                ]}
              >
                <LinearGradient
                  colors={['#26A69A', '#00897B']}
                  style={styles.breathingGradient}
                >
                  <MaterialCommunityIcons 
                    name={currentStep?.icon} 
                    size={48} 
                    color="#fff" 
                  />
                  <Text style={styles.breathingPhaseText}>{currentStep?.text}</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            <View style={styles.breathingSteps}>
              {breathingSteps.map((step, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.breathingStep,
                    breathPhase === step.phase && styles.breathingStepActive
                  ]}
                >
                  <Text style={[
                    styles.breathingStepNumber,
                    breathPhase === step.phase && styles.breathingStepNumberActive
                  ]}>
                    {step.duration}s
                  </Text>
                  <Text style={[
                    styles.breathingStepLabel,
                    breathPhase === step.phase && styles.breathingStepLabelActive
                  ]}>
                    {step.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 'stretch':
        return (
          <ScrollView style={styles.activityContent}>
            <Text style={styles.activityTitle}>🧘 Động tác giãn cơ</Text>
            <View style={styles.stretchingList}>
              {stretchingExercises.map((exercise, index) => (
                <View key={index} style={styles.stretchingCard}>
                  <View style={styles.stretchingHeader}>
                    <View style={styles.stretchingIconContainer}>
                      <MaterialCommunityIcons 
                        name={exercise.icon} 
                        size={28} 
                        color="#FFA726" 
                      />
                    </View>
                    <Text style={styles.stretchingName}>{exercise.name}</Text>
                  </View>
                  <Text style={styles.stretchingDescription}>{exercise.description}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      
      case 'walk':
        return (
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>🚶 Đi bộ nhẹ nhàng</Text>
            <View style={styles.walkTips}>
              {[
                { icon: 'walk', text: 'Đi bộ trong phòng 2-3 phút', color: '#66BB6A' },
                { icon: 'stairs', text: 'Lên xuống cầu thang nếu có thể', color: '#66BB6A' },
                { icon: 'window-open', text: 'Ra ban công hít thở không khí', color: '#66BB6A' },
                { icon: 'tree', text: 'Nhìn cây xanh để thư giãn mắt', color: '#66BB6A' }
              ].map((tip, index) => (
                <View key={index} style={styles.walkTip}>
                  <LinearGradient
                    colors={['#66BB6A', '#4CAF50']}
                    style={styles.walkTipIcon}
                  >
                    <MaterialCommunityIcons name={tip.icon} size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.walkTipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              {breakType === 'long' ? '☕ Nghỉ dài' : '⏱️ Nghỉ ngắn'}
            </Text>
            <Text style={styles.headerSubtitle}>Thư giãn và nạp năng lượng</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSkipBreak}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerSection}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            <G rotation="-90" origin={`${CIRCLE_SIZE/2}, ${CIRCLE_SIZE/2}`}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={CIRCLE_RADIUS}
                stroke="#E0E0E0"
                strokeWidth={8}
                fill="transparent"
              />
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={CIRCLE_RADIUS}
                stroke="#42A5F5"
                strokeWidth={8}
                fill="transparent"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>còn lại</Text>
          </View>
        </View>

        {/* Activity Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.activitySelector}
          contentContainerStyle={styles.activitySelectorContent}
        >
          {activities.map(activity => (
            <TouchableOpacity
              key={activity.id}
              onPress={() => setSelectedActivity(activity.id)}
              style={[
                styles.activityButton,
                selectedActivity === activity.id && styles.activityButtonActive
              ]}
            >
              <LinearGradient
                colors={selectedActivity === activity.id ? activity.gradient : ['#f5f5f5', '#f5f5f5']}
                style={styles.activityButtonGradient}
              >
                <MaterialCommunityIcons 
                  name={activity.icon} 
                  size={24} 
                  color={selectedActivity === activity.id ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.activityButtonText,
                  selectedActivity === activity.id && styles.activityButtonTextActive
                ]}>
                  {activity.title}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity Content */}
        <View style={styles.activityContentContainer}>
          {renderActivityContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  timerTextContainer: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateY: -20 }],
  },
  timerText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#333',
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activitySelector: {
    maxHeight: 80,
    marginVertical: 16,
  },
  activitySelectorContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  activityButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
  },
  activityButtonActive: {
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  activityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activityButtonTextActive: {
    color: '#fff',
  },
  activityContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  relaxTips: {
    gap: 16,
  },
  relaxTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  relaxTipText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  breathingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  breathingGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  breathingPhaseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  breathingSteps: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  breathingStep: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  breathingStepActive: {
    backgroundColor: '#E0F2F1',
    borderWidth: 2,
    borderColor: '#26A69A',
  },
  breathingStepNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#999',
  },
  breathingStepNumberActive: {
    color: '#26A69A',
  },
  breathingStepLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  breathingStepLabelActive: {
    color: '#26A69A',
    fontWeight: '600',
  },
  stretchingList: {
    gap: 12,
  },
  stretchingCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  stretchingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  stretchingIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stretchingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stretchingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  walkTips: {
    gap: 16,
  },
  walkTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walkTipIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkTipText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
