// @ts-nocheck
/**
 * Breathing Animation Demo
 * Test component for 4-7-8 breathing exercise
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BreathingDemo() {
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [isActive, setIsActive] = useState(false);
  const breathAnim = useRef(new Animated.Value(1)).current;

  const breathingSteps = [
    { phase: 'inhale', duration: 4000, text: 'Hít vào sâu', icon: 'arrow-up-circle', scale: 1.5 },
    { phase: 'hold', duration: 7000, text: 'Giữ hơi', icon: 'pause-circle', scale: 1.5 },
    { phase: 'exhale', duration: 8000, text: 'Thở ra từ từ', icon: 'arrow-down-circle', scale: 1 }
  ];

  useEffect(() => {
    if (isActive) {
      runBreathingCycle();
    }
  }, [isActive, breathPhase]);

  const runBreathingCycle = () => {
    const currentStep = breathingSteps.find(step => step.phase === breathPhase);
    if (!currentStep) return;

    Animated.timing(breathAnim, {
      toValue: currentStep.scale,
      duration: currentStep.duration,
      useNativeDriver: true
    }).start(() => {
      // Move to next phase
      if (breathPhase === 'inhale') setBreathPhase('hold');
      else if (breathPhase === 'hold') setBreathPhase('exhale');
      else setBreathPhase('inhale');
    });
  };

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
      Animated.timing(breathAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      setIsActive(true);
    }
  };

  const currentStep = breathingSteps.find(step => step.phase === breathPhase);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🫁 Bài tập hơi thở 4-7-8</Text>
      <Text style={styles.subtitle}>Thư giãn và giảm căng thẳng</Text>

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
              breathPhase === step.phase && isActive && styles.breathingStepActive
            ]}
          >
            <Text style={[
              styles.breathingStepNumber,
              breathPhase === step.phase && isActive && styles.breathingStepNumberActive
            ]}>
              {step.duration / 1000}s
            </Text>
            <Text style={[
              styles.breathingStepLabel,
              breathPhase === step.phase && isActive && styles.breathingStepLabelActive
            ]}>
              {step.text}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={handleToggle}
      >
        <LinearGradient
          colors={isActive ? ['#F44336', '#D32F2F'] : ['#26A69A', '#00897B']}
          style={styles.toggleButtonGradient}
        >
          <MaterialCommunityIcons 
            name={isActive ? 'stop' : 'play'} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.toggleButtonText}>
            {isActive ? 'Dừng lại' : 'Bắt đầu'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Lợi ích:</Text>
        <Text style={styles.infoText}>• Giảm căng thẳng và lo âu</Text>
        <Text style={styles.infoText}>• Cải thiện giấc ngủ</Text>
        <Text style={styles.infoText}>• Tăng cường tập trung</Text>
        <Text style={styles.infoText}>• Thư giãn hệ thần kinh</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 40,
  },
  breathingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 30,
    gap: 12,
    width: '100%',
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
    textAlign: 'center',
  },
  breathingStepLabelActive: {
    color: '#26A69A',
    fontWeight: '600',
  },
  toggleButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  toggleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});
