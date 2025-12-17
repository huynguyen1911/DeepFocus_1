// @ts-nocheck
/**
 * Achievements Screen - Phase 4: Achievement System
 * Display unlocked badges, milestones, and celebration animations
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function AchievementsScreen() {
  const router = useRouter();
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Achievement definitions
  const achievements = [
    {
      id: 'first_session',
      title: 'Bước đầu tiên',
      description: 'Hoàn thành phiên tập trung đầu tiên',
      icon: 'rocket-launch',
      color: ['#667eea', '#764ba2'],
      unlocked: true,
      unlockedAt: '2025-12-15',
      progress: 1,
      target: 1,
      reward: '+50 điểm'
    },
    {
      id: 'streak_3',
      title: 'Kiên trì 3 ngày',
      description: 'Duy trì streak 3 ngày liên tiếp',
      icon: 'fire',
      color: ['#FF6B6B', '#FF5252'],
      unlocked: true,
      unlockedAt: '2025-12-17',
      progress: 3,
      target: 3,
      reward: '+100 điểm'
    },
    {
      id: 'streak_7',
      title: 'Tuần hoàn hảo',
      description: 'Duy trì streak 7 ngày liên tiếp',
      icon: 'trophy',
      color: ['#FFD700', '#FFA000'],
      unlocked: false,
      progress: 3,
      target: 7,
      reward: '+200 điểm'
    },
    {
      id: 'focus_master',
      title: 'Bậc thầy tập trung',
      description: 'Đạt điểm tập trung 90+ trong 5 phiên',
      icon: 'star',
      color: ['#9C27B0', '#7B1FA2'],
      unlocked: false,
      progress: 2,
      target: 5,
      reward: '+300 điểm'
    },
    {
      id: 'early_bird',
      title: 'Chim sớm',
      description: 'Hoàn thành phiên trước 8h sáng',
      icon: 'weather-sunset-up',
      color: ['#FF9800', '#F57C00'],
      unlocked: true,
      unlockedAt: '2025-12-16',
      progress: 1,
      target: 1,
      reward: '+75 điểm'
    },
    {
      id: 'night_owl',
      title: 'Cú đêm',
      description: 'Hoàn thành phiên sau 22h',
      icon: 'owl',
      color: ['#5E35B1', '#4527A0'],
      unlocked: false,
      progress: 0,
      target: 1,
      reward: '+75 điểm'
    },
    {
      id: 'marathon',
      title: 'Marathon tập trung',
      description: 'Hoàn thành phiên 60 phút',
      icon: 'run',
      color: ['#00897B', '#00695C'],
      unlocked: false,
      progress: 0,
      target: 1,
      reward: '+150 điểm'
    },
    {
      id: 'zen_master',
      title: 'Thiền sư',
      description: 'Hoàn thành 10 bài tập thở sâu',
      icon: 'meditation',
      color: ['#26A69A', '#00897B'],
      unlocked: false,
      progress: 4,
      target: 10,
      reward: '+250 điểm'
    },
    {
      id: 'month_warrior',
      title: 'Chiến binh tháng',
      description: 'Hoàn thành 30 ngày tập luyện',
      icon: 'calendar-check',
      color: ['#1976D2', '#1565C0'],
      unlocked: false,
      progress: 5,
      target: 30,
      reward: '+500 điểm'
    },
    {
      id: 'distraction_free',
      title: 'Không phân tâm',
      description: 'Hoàn thành 5 phiên với 0 phân tâm',
      icon: 'shield-check',
      color: ['#43A047', '#388E3C'],
      unlocked: false,
      progress: 1,
      target: 5,
      reward: '+200 điểm'
    },
    {
      id: 'perfect_score',
      title: 'Điểm tuyệt đối',
      description: 'Đạt điểm 100/100 trong 1 phiên',
      icon: 'seal',
      color: ['#D32F2F', '#C62828'],
      unlocked: false,
      progress: 0,
      target: 1,
      reward: '+300 điểm'
    },
    {
      id: 'century',
      title: 'Thế kỷ',
      description: 'Hoàn thành 100 phiên tập trung',
      icon: 'certificate',
      color: ['#F57C00', '#E65100'],
      unlocked: false,
      progress: 12,
      target: 100,
      reward: '+1000 điểm'
    },
  ];

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowDetail(true);
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      useNativeDriver: true
    }).start();
  };

  const closeDetail = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowDetail(false);
      setSelectedAchievement(null);
      scaleAnim.setValue(0);
    });
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + parseInt(a.reward.replace(/\D/g, '')), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Thành tựu</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unlockedCount}/{achievements.length}</Text>
          <Text style={styles.statLabel}>Đã mở khóa</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Tổng điểm</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Unlocked Achievements */}
        <Text style={styles.sectionTitle}>✨ Đã mở khóa</Text>
        <View style={styles.achievementsGrid}>
          {achievements.filter(a => a.unlocked).map(achievement => (
            <TouchableOpacity
              key={achievement.id}
              style={styles.achievementCard}
              onPress={() => handleAchievementPress(achievement)}
            >
              <LinearGradient
                colors={achievement.color}
                style={styles.achievementGradient}
              >
                <MaterialCommunityIcons 
                  name={achievement.icon} 
                  size={40} 
                  color="#fff" 
                />
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <View style={styles.unlockedBadge}>
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* In Progress */}
        <Text style={styles.sectionTitle}>🎯 Đang tiến hành</Text>
        <View style={styles.achievementsList}>
          {achievements
            .filter(a => !a.unlocked && a.progress > 0)
            .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))
            .map(achievement => {
              const progressPercent = (achievement.progress / achievement.target) * 100;
              return (
                <TouchableOpacity
                  key={achievement.id}
                  style={styles.progressCard}
                  onPress={() => handleAchievementPress(achievement)}
                >
                  <View style={styles.progressCardHeader}>
                    <View style={[styles.progressIcon, { backgroundColor: achievement.color[0] + '20' }]}>
                      <MaterialCommunityIcons 
                        name={achievement.icon} 
                        size={32} 
                        color={achievement.color[0]} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.progressTitle}>{achievement.title}</Text>
                      <Text style={styles.progressDescription}>{achievement.description}</Text>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBg}>
                          <LinearGradient
                            colors={achievement.color}
                            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {achievement.progress}/{achievement.target}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* Locked */}
        <Text style={styles.sectionTitle}>🔒 Chưa mở khóa</Text>
        <View style={styles.achievementsGrid}>
          {achievements
            .filter(a => !a.unlocked && a.progress === 0)
            .map(achievement => (
            <TouchableOpacity
              key={achievement.id}
              style={styles.achievementCard}
              onPress={() => handleAchievementPress(achievement)}
            >
              <View style={styles.lockedGradient}>
                <MaterialCommunityIcons 
                  name={achievement.icon} 
                  size={40} 
                  color="#999" 
                />
                <Text style={styles.lockedTitle}>{achievement.title}</Text>
                <View style={styles.lockedBadge}>
                  <MaterialCommunityIcons name="lock" size={16} color="#999" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      {selectedAchievement && (
        <Modal
          visible={showDetail}
          transparent
          animationType="fade"
          onRequestClose={closeDetail}
        >
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeDetail}
            />
            <Animated.View 
              style={[
                styles.detailContainer,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <LinearGradient
                colors={selectedAchievement.unlocked ? selectedAchievement.color : ['#757575', '#616161']}
                style={styles.detailGradient}
              >
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeDetail}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                <MaterialCommunityIcons 
                  name={selectedAchievement.icon} 
                  size={80} 
                  color="#fff" 
                />
                
                <Text style={styles.detailTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.detailDescription}>{selectedAchievement.description}</Text>

                {selectedAchievement.unlocked ? (
                  <View style={styles.detailUnlocked}>
                    <MaterialCommunityIcons name="check-circle" size={32} color="#fff" />
                    <Text style={styles.detailUnlockedText}>Đã mở khóa</Text>
                    <Text style={styles.detailDate}>
                      {new Date(selectedAchievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.detailProgress}>
                    <Text style={styles.detailProgressText}>
                      Tiến độ: {selectedAchievement.progress}/{selectedAchievement.target}
                    </Text>
                    <View style={styles.detailProgressBar}>
                      <View 
                        style={[
                          styles.detailProgressFill,
                          { width: `${(selectedAchievement.progress / selectedAchievement.target) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}

                <View style={styles.detailReward}>
                  <MaterialCommunityIcons name="gift" size={24} color="#fff" />
                  <Text style={styles.detailRewardText}>Phần thưởng: {selectedAchievement.reward}</Text>
                </View>
              </LinearGradient>
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    width: (width - 52) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementsList: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressCardHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  progressIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  progressDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
    minWidth: 50,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  detailContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailGradient: {
    padding: 32,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.95,
  },
  detailUnlocked: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  detailUnlockedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  detailDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  detailProgress: {
    marginTop: 24,
    width: '100%',
  },
  detailProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  detailProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  detailProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  detailReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  detailRewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
