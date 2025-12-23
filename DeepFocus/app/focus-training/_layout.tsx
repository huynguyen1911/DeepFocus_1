// @ts-nocheck
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusTraining } from '@/src/contexts/FocusTrainingContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Màn hình hiển thị khi đang generate plan
function GeneratingScreen() {
  const pulseAnim = useSharedValue(1);
  const shimmerAnim = useSharedValue(-width * 0.5);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );

    shimmerAnim.value = withRepeat(
      withTiming(width * 1.5, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerAnim.value }],
  }));

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.generatingContainer}>
      <SafeAreaView edges={['top']} style={styles.generatingSafeArea}>
        <View style={styles.generatingContent}>
          <Animated.View style={[styles.iconContainer, pulseStyle]}>
            <Text style={styles.icon}>🤖</Text>
          </Animated.View>
          
          <Text style={styles.generatingTitle}>
            AI đang phân tích dữ liệu của bạn...
          </Text>
          
          <Text style={styles.generatingSubtitle}>
            Chúng tôi đang thiết kế lộ trình DeepFocus cá nhân hóa. Quá trình này có thể mất vài phút.
          </Text>

          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonBar} />
            <View style={[styles.skeletonBar, styles.skeletonBarShort]} />
            <View style={styles.skeletonBar} />
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>

          <View style={styles.generatingFooter}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.generatingFooterText}>
              Bạn sẽ nhận thông báo khi kế hoạch hoàn tất
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function FocusTrainingLayout() {
  const focusTraining = useFocusTraining();
  
  // Show loading while context is initializing
  if (!focusTraining) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const { isGeneratingPlan, hasActivePlan } = focusTraining;

  console.log('🔍 FocusTraining Layout - isGeneratingPlan:', isGeneratingPlan, 'hasActivePlan:', hasActivePlan);

  // ===== QUAN TRỌNG: Nếu đang generate plan → THAY THẾ toàn bộ bằng GeneratingScreen =====
  if (isGeneratingPlan && !hasActivePlan) {
    console.log('✅ Showing GeneratingScreen - No navigation, no API calls');
    return <GeneratingScreen />;
  }

  // CASE 2 & 3: Normal flow
  console.log('📱 Showing normal Stack navigation');
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Focus Training',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="assessment"
        options={{
          title: 'Đánh Giá',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ai-processing"
        options={{
          title: 'AI Processing',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="analysis-results"
        options={{
          title: 'Kết Quả Phân Tích',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="plan-success"
        options={{
          title: 'Kế Hoạch Sẵn Sàng',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Lịch Tập Luyện',
        }}
      />
      <Stack.Screen
        name="day-detail"
        options={{
          title: 'Chi Tiết Ngày',
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          title: 'Tiến Độ',
        }}
      />
      <Stack.Screen
        name="weekly-assessment"
        options={{
          title: 'Đánh Giá Tuần',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Cài Đặt',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  // Generating Screen Styles
  generatingContainer: {
    flex: 1,
  },
  generatingSafeArea: {
    flex: 1,
  },
  generatingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 60,
  },
  generatingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  generatingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  skeletonContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    marginBottom: 40,
  },
  skeletonBar: {
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonBarShort: {
    width: '60%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  generatingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  generatingFooterText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
  },
});
