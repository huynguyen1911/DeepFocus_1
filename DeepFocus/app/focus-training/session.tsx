// @ts-nocheck
/**
 * Focus Session Screen - Phase 3: During Session Enhancements
 * Circular progress timer with AI feedback, pause/resume, interruption handling
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Circle, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const CIRCLE_RADIUS = (CIRCLE_SIZE - 20) / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function FocusSessionScreen() {
  const router = useRouter();
  const { challengeId, duration = 25, type = 'focus_session', dayId } = useLocalSearchParams();
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration) * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // AI Feedback state
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [currentAIMessage, setCurrentAIMessage] = useState('');
  const [feedbackCount, setFeedbackCount] = useState(0);
  
  // Modals
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const completionScale = useRef(new Animated.Value(0)).current;
  
  const timerRef = useRef(null);
  const totalDuration = parseInt(duration) * 60;

  // AI Feedback messages based on progress
  const aiFeedbackMessages = [
    {
      percent: 25,
      message: '🎯 Tuyệt vời! Bạn đã hoàn thành 1/4 chặng đường. Tiếp tục tập trung!',
      icon: 'rocket-launch'
    },
    {
      percent: 50,
      message: '💪 Xuất sắc! Đã đi được nửa đường rồi. Hơi thở sâu và tiếp tục nhé!',
      icon: 'star-circle'
    },
    {
      percent: 75,
      message: '🔥 Chỉ còn 25% nữa thôi! Bạn đang làm rất tốt, đừng bỏ cuộc!',
      icon: 'fire'
    },
    {
      percent: 90,
      message: '⚡ Sprint cuối cùng! Còn chút nữa là hoàn thành rồi!',
      icon: 'lightning-bolt'
    }
  ];

  // Start timer on mount
  useEffect(() => {
    // Start countdown after 1 second
    const startTimeout = setTimeout(() => {
      setIsActive(true);
    }, 1000);

    return () => clearTimeout(startTimeout);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Update progress animation
          const progress = ((totalDuration - newTime) / totalDuration) * CIRCLE_CIRCUMFERENCE;
          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false
          }).start();
          
          // Check for AI feedback triggers
          checkAIFeedback(newTime);
          
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isPaused, timeRemaining]);

  // Check completion
  useEffect(() => {
    if (timeRemaining === 0 && !isCompleted) {
      handleCompletion();
    }
  }, [timeRemaining]);

  // Pulse animation for timer
  useEffect(() => {
    if (isActive && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [isActive, isPaused]);

  const checkAIFeedback = (currentTime) => {
    const percentComplete = ((totalDuration - currentTime) / totalDuration) * 100;
    
    aiFeedbackMessages.forEach((feedback, index) => {
      if (percentComplete >= feedback.percent && feedbackCount === index) {
        showAIMessage(feedback);
        setFeedbackCount(index + 1);
      }
    });
  };

  const showAIMessage = (feedback) => {
    setCurrentAIMessage(feedback);
    setShowAIFeedback(true);
    
    Animated.sequence([
      Animated.spring(feedbackAnim, {
        toValue: 1,
        tension: 20,
        useNativeDriver: true
      }),
      Animated.delay(3000),
      Animated.timing(feedbackAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => setShowAIFeedback(false));
  };

  const handlePause = () => {
    setIsPaused(true);
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    setShowPauseMenu(false);
  };

  const handleEndSession = () => {
    Alert.alert(
      '⚠️ Kết thúc sớm?',
      'Bạn có chắc muốn kết thúc phiên tập trung này? Tiến độ sẽ không được lưu.',
      [
        {
          text: 'Tiếp tục',
          style: 'cancel',
          onPress: handleResume
        },
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: () => {
            setShowPauseMenu(false);
            router.back();
          }
        }
      ]
    );
  };

  const handleCompletion = () => {
    setIsCompleted(true);
    setIsActive(false);
    
    Animated.spring(completionScale, {
      toValue: 1,
      tension: 20,
      useNativeDriver: true
    }).start();
    
    setShowCompletionModal(true);
  };

  const handleFinish = () => {
    // Navigate to feedback screen instead of going back
    setShowCompletionModal(false);
    router.replace({
      pathname: '/focus-training/session-feedback',
      params: {
        sessionId: challengeId,
        duration: duration,
        challengeId: challengeId,
        dayId: dayId
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getSessionInfo = () => {
    const types = {
      focus_session: {
        title: 'Phiên tập trung',
        icon: 'target',
        gradient: ['#667eea', '#764ba2']
      },
      breathing: {
        title: 'Thở sâu',
        icon: 'lungs',
        gradient: ['#42A5F5', '#1E88E5']
      },
      mindfulness: {
        title: 'Chánh niệm',
        icon: 'meditation',
        gradient: ['#FFA726', '#FB8C00']
      },
      stretching: {
        title: 'Giãn cơ',
        icon: 'yoga',
        gradient: ['#26A69A', '#00897B']
      }
    };
    return types[type] || types.focus_session;
  };

  const sessionInfo = getSessionInfo();
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;
  const progressOffset = CIRCLE_CIRCUMFERENCE - ((totalDuration - timeRemaining) / totalDuration) * CIRCLE_CIRCUMFERENCE;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={sessionInfo.gradient}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handlePause}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name={sessionInfo.icon} size={24} color="#fff" />
            <Text style={styles.headerTitle}>{sessionInfo.title}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handlePause}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons name="dots-vertical" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Circular Timer */}
        <View style={styles.timerContainer}>
          <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <G rotation="-90" origin={`${CIRCLE_SIZE/2}, ${CIRCLE_SIZE/2}`}>
                {/* Background Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={12}
                  fill="transparent"
                />
                
                {/* Progress Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke="#fff"
                  strokeWidth={12}
                  fill="transparent"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            
            {/* Timer Text */}
            <View style={styles.timerTextContainer}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerSubtext}>
                {isPaused ? 'Đã tạm dừng' : 'Đang tập trung...'}
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
          </Animated.View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {!isPaused ? (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handlePause}
            >
              <MaterialCommunityIcons name="pause-circle" size={72} color="#fff" />
              <Text style={styles.controlText}>Tạm dừng</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleResume}
            >
              <MaterialCommunityIcons name="play-circle" size={72} color="#fff" />
              <Text style={styles.controlText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Focus Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#FFC107" />
            <Text style={styles.tipText}>Tắt thông báo để tập trung tối đa</Text>
          </View>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="water" size={20} color="#42A5F5" />
            <Text style={styles.tipText}>Uống nước nếu cần thiết</Text>
          </View>
        </View>

        {/* AI Feedback Toast */}
        {showAIFeedback && (
          <Animated.View 
            style={[
              styles.aiFeedbackContainer,
              {
                opacity: feedbackAnim,
                transform: [{
                  translateY: feedbackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                  })
                }]
              }
            ]}
          >
            <BlurView intensity={90} tint="light" style={styles.aiFeedbackBlur}>
              <View style={styles.aiFeedbackContent}>
                <MaterialCommunityIcons 
                  name={currentAIMessage.icon} 
                  size={28} 
                  color="#667eea" 
                />
                <Text style={styles.aiFeedbackText}>{currentAIMessage.message}</Text>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* Pause Menu Modal */}
        <Modal
          visible={showPauseMenu}
          transparent
          animationType="fade"
          onRequestClose={handleResume}
        >
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.pauseMenuContainer}>
              <LinearGradient
                colors={['#fff', '#f8f9fa']}
                style={styles.pauseMenu}
              >
                <MaterialCommunityIcons name="pause-circle-outline" size={64} color="#667eea" />
                <Text style={styles.pauseTitle}>Đã tạm dừng</Text>
                <Text style={styles.pauseSubtitle}>Nghỉ ngơi một chút nhé</Text>
                
                <View style={styles.pauseStats}>
                  <View style={styles.pauseStat}>
                    <Text style={styles.pauseStatValue}>{formatTime(totalDuration - timeRemaining)}</Text>
                    <Text style={styles.pauseStatLabel}>Đã tập trung</Text>
                  </View>
                  <View style={styles.pauseDivider} />
                  <View style={styles.pauseStat}>
                    <Text style={styles.pauseStatValue}>{formatTime(timeRemaining)}</Text>
                    <Text style={styles.pauseStatLabel}>Còn lại</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.resumeButton}
                  onPress={handleResume}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.resumeButtonGradient}
                  >
                    <MaterialCommunityIcons name="play" size={24} color="#fff" />
                    <Text style={styles.resumeButtonText}>Tiếp tục tập trung</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.endButton}
                  onPress={handleEndSession}
                >
                  <Text style={styles.endButtonText}>Kết thúc phiên</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </BlurView>
        </Modal>

        {/* Completion Modal */}
        <Modal
          visible={showCompletionModal}
          transparent
          animationType="fade"
        >
          <BlurView intensity={50} tint="dark" style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.completionContainer,
                { transform: [{ scale: completionScale }] }
              ]}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.completionModal}
              >
                <MaterialCommunityIcons name="trophy" size={80} color="#fff" />
                <Text style={styles.completionTitle}>🎉 Xuất sắc!</Text>
                <Text style={styles.completionMessage}>
                  Bạn đã hoàn thành {duration} phút tập trung!
                </Text>

                <View style={styles.completionStats}>
                  <View style={styles.completionStat}>
                    <MaterialCommunityIcons name="clock-check" size={32} color="#fff" />
                    <Text style={styles.completionStatValue}>{duration} phút</Text>
                    <Text style={styles.completionStatLabel}>Hoàn thành</Text>
                  </View>
                  <View style={styles.completionStat}>
                    <MaterialCommunityIcons name="star" size={32} color="#fff" />
                    <Text style={styles.completionStatValue}>+50</Text>
                    <Text style={styles.completionStatLabel}>Điểm</Text>
                  </View>
                  <View style={styles.completionStat}>
                    <MaterialCommunityIcons name="fire" size={32} color="#fff" />
                    <Text style={styles.completionStatValue}>+1</Text>
                    <Text style={styles.completionStatLabel}>Streak</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.finishButton}
                  onPress={handleFinish}
                >
                  <View style={styles.finishButtonInner}>
                    <Text style={styles.finishButtonText}>Hoàn tất</Text>
                    <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </BlurView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  timerCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  timerSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  aiFeedbackContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
  },
  aiFeedbackBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiFeedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  aiFeedbackText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseMenuContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  pauseMenu: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  pauseTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  pauseSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  pauseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    gap: 24,
  },
  pauseStat: {
    flex: 1,
    alignItems: 'center',
  },
  pauseStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667eea',
  },
  pauseStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pauseDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#ddd',
  },
  resumeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  resumeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  endButton: {
    paddingVertical: 12,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  completionContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  completionModal: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  completionMessage: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.9,
  },
  completionStats: {
    flexDirection: 'row',
    marginTop: 32,
    marginBottom: 24,
    gap: 24,
  },
  completionStat: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  completionStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  completionStatLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
  },
  finishButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
