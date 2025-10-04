import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, useTheme, Divider, IconButton, Menu } from 'react-native-paper';

import Timer from '../components/Timer';
import { getGreeting } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';

const HomeScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { completedPomodoros } = usePomodoro();
  const [greeting] = useState(getGreeting());
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with User Menu */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimary }}>
              DeepFocus
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>
              Xin chào, {user?.username || 'User'}!
            </Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="account-circle"
                iconColor={theme.colors.onPrimary}
                size={28}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Navigate to profile
              }}
              title="Hồ sơ"
              leadingIcon="account"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                // Navigate to settings
              }}
              title="Cài đặt"
              leadingIcon="cog"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
              title="Đăng xuất"
              leadingIcon="logout"
            />
          </Menu>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Welcome Card */}
          <Card style={styles.welcomeCard}>
            <Card.Content style={styles.cardContent}>
              <Text
                variant="titleLarge"
                style={[styles.greetingText, { color: theme.colors.onSurface }]}
              >
                {greeting}
              </Text>
              <Text
                variant="headlineMedium"
                style={[styles.welcomeText, { color: theme.colors.primary }]}
              >
                Chào mừng {user?.username}!
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.subtitleText, { color: theme.colors.onSurface }]}
              >
                Ứng dụng Pomodoro Timer
              </Text>
              <Divider style={styles.divider} />
              <Text
                variant="bodyMedium"
                style={[
                  styles.descriptionText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Tập trung sâu, làm việc hiệu quả với phương pháp Pomodoro
              </Text>
            </Card.Content>
          </Card>

          {/* Timer Section */}
          <View style={styles.timerSection}>
            <Text
              variant="titleLarge"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              DeepFocus - Pomodoro Timer
            </Text>

            <Timer />
          </View>

          {/* User Focus Profile */}
          {user?.focusProfile && (
            <View style={styles.profileSection}>
              <Text
                variant="titleLarge"
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Hồ sơ tập trung
              </Text>

              <Card style={styles.profileCard}>
                <Card.Content style={styles.profileContent}>
                  <View style={styles.profileRow}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      Cấp độ:
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      {user.focusProfile.level}
                    </Text>
                  </View>
                  <View style={styles.profileRow}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      Mục tiêu hàng ngày:
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>
                      {user.focusProfile.dailyGoal} phút
                    </Text>
                  </View>
                  <View style={styles.profileRow}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      Thời gian làm việc:
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.tertiary }}>
                      {user.focusProfile.workDuration} phút
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Text
              variant="titleLarge"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Thống kê hôm nay
            </Text>

            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text
                    variant="headlineSmall"
                    style={[styles.statNumber, { color: theme.colors.primary }]}
                  >
                    {completedPomodoros}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    Pomodoro hoàn thành
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Text
                    variant="headlineSmall"
                    style={[
                      styles.statNumber,
                      { color: theme.colors.secondary },
                    ]}
                  >
                    {completedPomodoros * 25}m
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    Thời gian tập trung
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowOpacity: 0.3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardContent: {
    padding: 24,
    alignItems: "center",
  },
  greetingText: {
    marginBottom: 4,
    fontWeight: "500",
  },
  welcomeText: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitleText: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  divider: {
    width: "50%",
    marginVertical: 16,
  },
  descriptionText: {
    textAlign: "center",
    lineHeight: 20,
  },
  timerSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  profileSection: {
    marginBottom: 32,
  },
  profileCard: {
    elevation: 2,
    borderRadius: 8,
  },
  profileContent: {
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    borderRadius: 8,
  },
  statContent: {
    alignItems: "center",
    padding: 16,
  },
  statNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});

export default HomeScreen;