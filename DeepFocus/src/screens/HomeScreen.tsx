import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme, Divider } from 'react-native-paper';

import CustomButton from '../components/CustomButton';
import TimerCard from '../components/TimerCard';
import { getGreeting } from '../utils/helpers';

const HomeScreen = () => {
  const theme = useTheme();
  const [greeting] = useState(getGreeting());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                Chào mừng đến với DeepFocus!
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
              Timer Pomodoro
            </Text>

            <TimerCard
              time="25:00"
              title="Pomodoro"
              isActive={true}
              style={styles.timerCard}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Bắt đầu"
                onPress={() => console.log("Start timer")}
                mode="contained"
                style={styles.startButton}
              />
              <CustomButton
                title="Tạm dừng"
                onPress={() => console.log("Pause timer")}
                mode="outlined"
                style={styles.pauseButton}
              />
            </View>
          </View>

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
                    0
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
                    0m
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
  timerCard: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  startButton: {
    flex: 1,
  },
  pauseButton: {
    flex: 1,
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