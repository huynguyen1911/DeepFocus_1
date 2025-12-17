// @ts-nocheck
/**
 * Goals Screen - Phase 5: Goal Setting & Tracking
 * Daily/Weekly/Monthly goals with progress tracking and rewards
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: '', target: '' });
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Mock data - Replace with API
  const goalsData = {
    daily: [
      {
        id: 1,
        icon: 'check-circle',
        color: '#4CAF50',
        title: 'Hoàn thành 3 phiên',
        current: 2,
        target: 3,
        unit: 'phiên',
        status: 'in-progress'
      },
      {
        id: 2,
        icon: 'clock-outline',
        color: '#FF9800',
        title: 'Tập trung 90 phút',
        current: 75,
        target: 90,
        unit: 'phút',
        status: 'in-progress'
      },
      {
        id: 3,
        icon: 'star',
        color: '#FFD700',
        title: 'Điểm TB trên 85',
        current: 88,
        target: 85,
        unit: 'điểm',
        status: 'completed'
      }
    ],
    weekly: [
      {
        id: 4,
        icon: 'fire',
        color: '#FF6B6B',
        title: 'Duy trì streak 7 ngày',
        current: 5,
        target: 7,
        unit: 'ngày',
        status: 'in-progress'
      },
      {
        id: 5,
        icon: 'chart-timeline-variant',
        color: '#667eea',
        title: 'Hoàn thành 20 phiên',
        current: 18,
        target: 20,
        unit: 'phiên',
        status: 'in-progress'
      },
      {
        id: 6,
        icon: 'trophy',
        color: '#9C27B0',
        title: 'Mở 2 thành tựu mới',
        current: 2,
        target: 2,
        unit: 'thành tựu',
        status: 'completed'
      }
    ],
    monthly: [
      {
        id: 7,
        icon: 'calendar-check',
        color: '#4CAF50',
        title: 'Hoàn thành 25 ngày',
        current: 17,
        target: 25,
        unit: 'ngày',
        status: 'in-progress'
      },
      {
        id: 8,
        icon: 'clock-fast',
        color: '#FF9800',
        title: 'Tích lũy 50 giờ',
        current: 32,
        target: 50,
        unit: 'giờ',
        status: 'in-progress'
      },
      {
        id: 9,
        icon: 'seal',
        color: '#D32F2F',
        title: 'Điểm TB trên 90',
        current: 85,
        target: 90,
        unit: 'điểm',
        status: 'in-progress'
      }
    ]
  };

  const goalTemplates = [
    { type: 'sessions', icon: 'check-circle', color: '#4CAF50', label: 'Số phiên' },
    { type: 'minutes', icon: 'clock-outline', color: '#FF9800', label: 'Thời gian (phút)' },
    { type: 'score', icon: 'star', color: '#FFD700', label: 'Điểm trung bình' },
    { type: 'streak', icon: 'fire', color: '#FF6B6B', label: 'Streak (ngày)' },
    { type: 'achievements', icon: 'trophy', color: '#9C27B0', label: 'Thành tựu' }
  ];

  const currentGoals = goalsData[selectedPeriod];
  const completedCount = currentGoals.filter(g => g.status === 'completed').length;
  const totalCount = currentGoals.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const handleCreateGoal = () => {
    setShowCreateModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      useNativeDriver: true
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowCreateModal(false);
      scaleAnim.setValue(0);
    });
  };

  const handleSaveGoal = () => {
    // Save to backend
    console.log('Saving goal:', newGoal, selectedPeriod);
    closeModal();
    setNewGoal({ type: '', target: '' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#FF9800', '#F57C00']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎯 Mục tiêu</Text>
        <TouchableOpacity 
          onPress={handleCreateGoal}
          style={styles.addButton}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[
          { value: 'daily', label: 'Hôm nay', icon: 'calendar-today' },
          { value: 'weekly', label: 'Tuần này', icon: 'calendar-week' },
          { value: 'monthly', label: 'Tháng này', icon: 'calendar-month' }
        ].map(period => (
          <TouchableOpacity
            key={period.value}
            onPress={() => setSelectedPeriod(period.value)}
            style={[
              styles.periodButton,
              selectedPeriod === period.value && styles.periodButtonActive
            ]}
          >
            <MaterialCommunityIcons 
              name={period.icon} 
              size={20} 
              color={selectedPeriod === period.value ? '#FF9800' : '#999'} 
            />
            <Text style={[
              styles.periodText,
              selectedPeriod === period.value && styles.periodTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.overviewTitle}>Tiến độ</Text>
            <Text style={styles.overviewSubtitle}>
              {completedCount}/{totalCount} mục tiêu hoàn thành
            </Text>
          </View>
          <View style={styles.overviewPercentage}>
            <Text style={styles.overviewPercentageText}>{completionRate}%</Text>
          </View>
        </View>
        <View style={styles.overviewProgressBar}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={[styles.overviewProgressFill, { width: `${completionRate}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goals List */}
        <View style={styles.goalsSection}>
          {currentGoals.map(goal => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.status === 'completed';
            
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                    <MaterialCommunityIcons 
                      name={goal.icon} 
                      size={28} 
                      color={goal.color} 
                    />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalProgress}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                  </View>
                  {isCompleted && (
                    <View style={[styles.goalBadge, { backgroundColor: goal.color }]}>
                      <MaterialCommunityIcons name="check" size={20} color="#fff" />
                    </View>
                  )}
                </View>
                
                <View style={styles.goalProgressBar}>
                  <LinearGradient
                    colors={[goal.color, goal.color + 'CC']}
                    style={[styles.goalProgressFill, { width: `${progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                
                <View style={styles.goalFooter}>
                  <Text style={styles.goalPercentage}>{Math.round(progress)}%</Text>
                  {isCompleted ? (
                    <Text style={[styles.goalStatus, { color: goal.color }]}>Hoàn thành! 🎉</Text>
                  ) : (
                    <Text style={styles.goalRemaining}>
                      Còn {goal.target - goal.current} {goal.unit}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Suggested Goals */}
        <View style={styles.suggestedSection}>
          <Text style={styles.sectionTitle}>💡 Gợi ý mục tiêu</Text>
          
          <TouchableOpacity style={styles.suggestedCard}>
            <View style={[styles.suggestedIcon, { backgroundColor: '#667eea20' }]}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#667eea" />
            </View>
            <View style={styles.suggestedContent}>
              <Text style={styles.suggestedTitle}>Tăng thời gian tập trung</Text>
              <Text style={styles.suggestedDescription}>
                Tăng 20% thời gian so với tuần trước
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestedCard}>
            <View style={[styles.suggestedIcon, { backgroundColor: '#4CAF5020' }]}>
              <MaterialCommunityIcons name="target" size={24} color="#4CAF50" />
            </View>
            <View style={styles.suggestedContent}>
              <Text style={styles.suggestedTitle}>Cải thiện điểm số</Text>
              <Text style={styles.suggestedDescription}>
                Đạt điểm trung bình 90+ trong tuần
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestedCard}>
            <View style={[styles.suggestedIcon, { backgroundColor: '#FF6B6B20' }]}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.suggestedContent}>
              <Text style={styles.suggestedTitle}>Duy trì streak</Text>
              <Text style={styles.suggestedDescription}>
                Tập trung ít nhất 1 phiên mỗi ngày
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Rewards */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>🎁 Phần thưởng</Text>
          
          <View style={styles.rewardCard}>
            <LinearGradient
              colors={['#FFD700', '#FFA000']}
              style={styles.rewardGradient}
            >
              <MaterialCommunityIcons name="trophy-award" size={40} color="#fff" />
              <Text style={styles.rewardTitle}>Hoàn thành tất cả mục tiêu hôm nay</Text>
              <Text style={styles.rewardPoints}>+100 điểm</Text>
            </LinearGradient>
          </View>

          <View style={styles.rewardCard}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.rewardGradient}
            >
              <MaterialCommunityIcons name="star-circle" size={40} color="#fff" />
              <Text style={styles.rewardTitle}>Hoàn thành 7/7 ngày trong tuần</Text>
              <Text style={styles.rewardPoints}>+300 điểm + Huy hiệu đặc biệt</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeModal}
            />
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo mục tiêu mới</Text>
                <TouchableOpacity onPress={closeModal}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Loại mục tiêu</Text>
              <View style={styles.templateGrid}>
                {goalTemplates.map(template => (
                  <TouchableOpacity
                    key={template.type}
                    style={[
                      styles.templateButton,
                      newGoal.type === template.type && styles.templateButtonActive
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, type: template.type })}
                  >
                    <View style={[styles.templateIcon, { backgroundColor: template.color + '20' }]}>
                      <MaterialCommunityIcons 
                        name={template.icon} 
                        size={24} 
                        color={template.color} 
                      />
                    </View>
                    <Text style={styles.templateLabel}>{template.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Mục tiêu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số mục tiêu..."
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={newGoal.target}
                onChangeText={(text) => setNewGoal({ ...newGoal, target: text })}
              />

              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  (!newGoal.type || !newGoal.target) && styles.saveButtonDisabled
                ]}
                onPress={handleSaveGoal}
                disabled={!newGoal.type || !newGoal.target}
              >
                <LinearGradient
                  colors={(!newGoal.type || !newGoal.target) ? ['#ccc', '#999'] : ['#FF9800', '#F57C00']}
                  style={styles.saveGradient}
                >
                  <Text style={styles.saveText}>Tạo mục tiêu</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodButtonActive: {
    borderColor: '#FF9800',
    backgroundColor: '#FF980010',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  periodTextActive: {
    color: '#FF9800',
    fontWeight: '700',
  },
  overviewCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  overviewPercentage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF980020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewPercentageText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF9800',
  },
  overviewProgressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  overviewProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  goalsSection: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#666',
  },
  goalBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalProgressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF9800',
  },
  goalStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  goalRemaining: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  suggestedSection: {
    marginBottom: 24,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedContent: {
    flex: 1,
  },
  suggestedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  suggestedDescription: {
    fontSize: 13,
    color: '#666',
  },
  rewardsSection: {
    marginBottom: 24,
  },
  rewardCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  templateButton: {
    width: (width * 0.9 - 64) / 2,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateButtonActive: {
    borderColor: '#FF9800',
    backgroundColor: '#FF980010',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  templateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
