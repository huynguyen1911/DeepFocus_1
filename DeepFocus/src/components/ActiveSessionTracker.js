import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Text,
  useTheme,
  IconButton,
  Chip,
  ProgressBar,
} from "react-native-paper";
import { useSession } from "../contexts/SessionContext";
import { useLanguage } from "../contexts/LanguageContext";
import { router } from "expo-router";

export default function ActiveSessionTracker() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { activeSession, completeSession, cancelSession } = useSession();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeSession || !activeSession.isActive) {
      return;
    }

    // Calculate elapsed time
    const startTime = new Date(activeSession.startTime).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      setElapsed(Math.floor(elapsedMs / 1000)); // Convert to seconds
    };

    // Update immediately
    updateElapsed();

    // Update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Don't show if no active session
  if (!activeSession || !activeSession.isActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        secs
      ).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const getProgress = () => {
    if (!activeSession.targetDuration) return 0;
    const targetSeconds = activeSession.targetDuration * 60;
    return Math.min(elapsed / targetSeconds, 1);
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case "focus":
        return t("session.focus");
      case "short-break":
        return t("session.shortBreak");
      case "long-break":
        return t("session.longBreak");
      default:
        return type;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "focus":
        return theme.colors.primary;
      case "short-break":
        return theme.colors.secondary;
      case "long-break":
        return theme.colors.tertiary;
      default:
        return theme.colors.primary;
    }
  };

  const handleComplete = async () => {
    if (activeSession._id) {
      await completeSession(activeSession._id);
    }
  };

  const handleCancel = async () => {
    if (activeSession._id) {
      await cancelSession(activeSession._id);
    }
  };

  const handleViewTask = () => {
    if (activeSession.task?._id) {
      router.push(`/task-details/${activeSession.task._id}`);
    }
  };

  const handleViewClass = () => {
    if (activeSession.class?._id) {
      router.push(`/classes/${activeSession.class._id}`);
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.title}>
              {t("session.activeSession")}
            </Text>
            <Chip
              icon="timer"
              mode="flat"
              style={{
                backgroundColor: getSessionTypeColor(activeSession.type),
              }}
              textStyle={{ color: theme.colors.onPrimary }}
            >
              {getSessionTypeLabel(activeSession.type)}
            </Chip>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="check-circle"
              iconColor={theme.colors.primary}
              size={28}
              onPress={handleComplete}
            />
            <IconButton
              icon="close-circle"
              iconColor={theme.colors.error}
              size={28}
              onPress={handleCancel}
            />
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text variant="displayMedium" style={styles.timer}>
            {formatTime(elapsed)}
          </Text>
          {activeSession.targetDuration && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {t("session.target")}: {activeSession.targetDuration}{" "}
              {t("session.minutes")}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        {activeSession.targetDuration && (
          <ProgressBar
            progress={getProgress()}
            color={getSessionTypeColor(activeSession.type)}
            style={styles.progressBar}
          />
        )}

        {/* Associated Task and Class */}
        <View style={styles.associations}>
          {activeSession.task && (
            <Chip
              icon="checkbox-marked-circle-outline"
              mode="outlined"
              onPress={handleViewTask}
              style={styles.chip}
            >
              {activeSession.task.title}
            </Chip>
          )}
          {activeSession.class && (
            <Chip
              icon="google-classroom"
              mode="outlined"
              onPress={handleViewClass}
              style={styles.chip}
            >
              {activeSession.class.name}
            </Chip>
          )}
        </View>

        {/* Session Notes */}
        {activeSession.notes && (
          <View style={styles.notesContainer}>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {t("session.notes")}: {activeSession.notes}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  timer: {
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  associations: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginRight: 4,
  },
  notesContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});
