import React from "react";
import { View, StyleSheet, Modal } from "react-native";
import { Card, Button, Text, useTheme } from "react-native-paper";
import { useLanguage } from "../contexts/LanguageContext";

const PomodoroCompletionModal = ({
  visible,
  onStartBreak,
  onClose,
  isLongBreak,
  completedPomodoros,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const breakDuration = isLongBreak
    ? t("completion.longBreakDuration")
    : t("completion.shortBreakDuration");
  const breakType = isLongBreak
    ? t("completion.longBreak")
    : t("completion.shortBreak");
  const breakEmoji = isLongBreak ? "🌟" : "☕";

  // Motivational quotes
  const quotes = [
    t("completion.quote1"),
    t("completion.quote2"),
    t("completion.quote3"),
    t("completion.quote4"),
    t("completion.quote5"),
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Card style={[styles.card, { elevation: 8 }]}>
            <Card.Content style={styles.content}>
              {/* Celebration Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.celebrationIcon}>🎉</Text>
              </View>

              {/* Title */}
              <Text
                style={[styles.title, { color: theme.colors.primary }]}
                variant="headlineMedium"
              >
                {t("completion.excellent")}
              </Text>

              {/* Subtitle */}
              <Text style={styles.subtitle} variant="titleMedium">
                {t("completion.pomodoroComplete")}
              </Text>

              {/* Stats Container */}
              <View
                style={[
                  styles.statsContainer,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <Text style={styles.statsLabel} variant="bodyMedium">
                  {t("completion.totalToday")}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsNumber} variant="displaySmall">
                    {completedPomodoros}
                  </Text>
                  <Text style={styles.statsUnit} variant="titleLarge">
                    🍅
                  </Text>
                </View>
              </View>

              {/* Motivational Quote */}
              <Text style={styles.quote} variant="bodyMedium">
                "{randomQuote}"
              </Text>

              {/* Break Info */}
              <View
                style={[
                  styles.breakInfoContainer,
                  { backgroundColor: isLongBreak ? "#E8EAF6" : "#FFF3E0" },
                ]}
              >
                <Text style={styles.breakEmoji}>{breakEmoji}</Text>
                <Text style={styles.breakInfo} variant="titleMedium">
                  {t("completion.timeForBreak")} {breakType}
                </Text>
                <Text style={styles.breakDuration} variant="bodyLarge">
                  ({breakDuration})
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={onStartBreak}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: isLongBreak ? "#5C6BC0" : "#66BB6A" },
                  ]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon={isLongBreak ? "star" : "coffee"}
                >
                  {t("completion.startBreak")}
                </Button>
                <Button
                  mode="text"
                  onPress={onClose}
                  style={styles.secondaryButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={[
                    styles.buttonLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {t("completion.skipBreak")}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  celebrationIcon: {
    fontSize: 72,
    textAlign: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
    color: "#616161",
  },
  statsContainer: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  statsLabel: {
    marginBottom: 8,
    color: "#616161",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsNumber: {
    fontWeight: "bold",
    color: "#FF5252",
  },
  statsUnit: {
    fontSize: 32,
  },
  quote: {
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
    color: "#757575",
    paddingHorizontal: 16,
  },
  breakInfoContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  breakEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  breakInfo: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    color: "#424242",
  },
  breakDuration: {
    textAlign: "center",
    color: "#616161",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PomodoroCompletionModal;
