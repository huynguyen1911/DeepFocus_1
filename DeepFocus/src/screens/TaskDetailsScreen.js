import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Text,
  useTheme,
  Snackbar,
  ActivityIndicator,
  Chip,
  IconButton,
  ProgressBar,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTasks } from "../contexts/TaskContext";
import { useLanguage } from "../contexts/LanguageContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const TaskDetailsScreen = () => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { updateTask, deleteTask, completeTask, tasks } = useTasks();
  const params = useLocalSearchParams();

  const taskId = params?.id || params?.taskId;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedPomodoros: "1",
    completedPomodoros: 0,
    priority: "medium",
    dueDate: null,
    isCompleted: false,
    createdAt: null,
  });

  const [originalTask, setOriginalTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load task data
  useEffect(() => {
    if (taskId) {
      setIsLoadingTask(true);

      const task = tasks.find((t) => t._id === taskId || t.id === taskId);

      if (task) {
        const taskData = {
          title: task.title || "",
          description: task.description || "",
          estimatedPomodoros: String(task.estimatedPomodoros || 1),
          completedPomodoros: task.completedPomodoros || 0,
          priority: task.priority || "medium",
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          isCompleted: task.isCompleted || false,
          createdAt: task.createdAt ? new Date(task.createdAt) : null,
        };
        setFormData(taskData);
        setOriginalTask(task);
      }

      setIsLoadingTask(false);
    }
  }, [taskId, tasks]);

  // Track changes
  useEffect(() => {
    if (originalTask) {
      const changed =
        formData.title !== originalTask.title ||
        formData.description !== (originalTask.description || "") ||
        formData.estimatedPomodoros !==
          String(originalTask.estimatedPomodoros) ||
        formData.priority !== originalTask.priority ||
        formData.dueDate?.getTime() !==
          (originalTask.dueDate
            ? new Date(originalTask.dueDate).getTime()
            : null);

      setHasChanges(changed);
    }
  }, [formData, originalTask]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("addTask.titleRequired");
    }

    const pomodoros = parseInt(formData.estimatedPomodoros);
    if (isNaN(pomodoros) || pomodoros < 1) {
      newErrors.estimatedPomodoros = t("addTask.pomodorosMinimum");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange("dueDate", selectedDate);
    }
  };

  // Show date picker with keyboard dismiss
  const showDatePickerHandler = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return t("taskDetails.notSet");
    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format datetime for created at
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const estimated = parseInt(formData.estimatedPomodoros) || 1;
    const completed = formData.completedPomodoros || 0;
    return Math.min((completed / estimated) * 100, 100);
  };

  // Get priority color
  const getPriorityColor = () => {
    switch (formData.priority) {
      case "high":
        return "#D32F2F";
      case "medium":
        return "#F57C00";
      case "low":
        return "#388E3C";
      default:
        return "#757575";
    }
  };

  // Get priority label
  const getPriorityLabel = () => {
    switch (formData.priority) {
      case "high":
        return t("tasks.priorityHigh");
      case "medium":
        return t("tasks.priorityMedium");
      case "low":
        return t("tasks.priorityLow");
      default:
        return t("tasks.priorityMedium");
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        estimatedPomodoros: parseInt(formData.estimatedPomodoros),
        priority: formData.priority,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : undefined,
      };

      const result = await updateTask(taskId, taskData);

      if (result.success) {
        setSnackbarMessage(t("taskDetails.saveSuccess"));
        setSnackbarVisible(true);
        setHasChanges(false);

        // Update original task
        setOriginalTask((prev) => ({
          ...prev,
          ...taskData,
        }));
      } else {
        setSnackbarMessage(result.error || t("taskDetails.saveError"));
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage(t("errors.generic"));
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      t("taskDetails.confirmDelete"),
      t("taskDetails.confirmDeleteMessage"),
      [
        {
          text: t("tasks.cancel"),
          style: "cancel",
        },
        {
          text: t("taskDetails.delete"),
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await deleteTask(taskId);

              if (result.success) {
                setSnackbarMessage(t("taskDetails.deleteSuccess"));
                setSnackbarVisible(true);

                setTimeout(() => {
                  router.back();
                }, 1000);
              } else {
                setSnackbarMessage(
                  result.error || t("taskDetails.deleteError")
                );
                setSnackbarVisible(true);
              }
            } catch (error) {
              setSnackbarMessage(t("errors.generic"));
              setSnackbarVisible(true);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle toggle complete
  const handleToggleComplete = async () => {
    setIsLoading(true);

    try {
      const result = await completeTask(taskId);

      if (result.success) {
        // Get the NEW status from the server response
        const newStatus = result.data.isCompleted;

        // Update formData with the new status
        setFormData((prev) => ({
          ...prev,
          isCompleted: newStatus,
        }));

        // Use the new status for the message
        setSnackbarMessage(
          newStatus
            ? t("taskDetails.markedComplete")
            : t("taskDetails.markedIncomplete")
        );
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage(result.error || t("taskDetails.statusError"));
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage(t("errors.generic"));
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        t("taskDetails.unsavedChanges"),
        t("taskDetails.unsavedChangesMessage"),
        [
          {
            text: t("taskDetails.stay"),
            style: "cancel",
          },
          {
            text: t("taskDetails.exit"),
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoadingTask) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{t("general.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!originalTask) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{t("taskDetails.taskNotFound")}</Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            {t("taskDetails.goBack")}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card - Status and Progress */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.headerContainer}>
                <View style={styles.statusContainer}>
                  <Chip
                    icon={
                      formData.isCompleted ? "check-circle" : "clock-outline"
                    }
                    mode="flat"
                    style={[
                      styles.statusChip,
                      formData.isCompleted
                        ? { backgroundColor: "#E8F5E9" }
                        : { backgroundColor: "#FFF3E0" },
                    ]}
                    textStyle={
                      formData.isCompleted
                        ? { color: "#2E7D32" }
                        : { color: "#E65100" }
                    }
                  >
                    {formData.isCompleted
                      ? t("tasks.completed")
                      : t("tasks.inProgress")}
                  </Chip>

                  <Chip
                    icon="flag"
                    mode="flat"
                    style={[
                      styles.priorityChip,
                      { backgroundColor: `${getPriorityColor()}15` },
                    ]}
                    textStyle={{ color: getPriorityColor() }}
                  >
                    {getPriorityLabel()}
                  </Chip>
                </View>

                {/* Circular Progress */}
                <View style={styles.progressCircleContainer}>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressPercentage}>
                      {Math.round(progressPercentage)}%
                    </Text>
                    <Text style={styles.progressLabel}>
                      {t("tasks.completed")}
                    </Text>
                  </View>
                  <View style={styles.progressCircleOuter}>
                    <View
                      style={[
                        styles.progressCircleFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: formData.isCompleted
                            ? "#4CAF50"
                            : theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Pomodoro Stats */}
                <View style={styles.pomodoroStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formData.completedPomodoros}
                    </Text>
                    <Text style={styles.statLabel}>
                      {t("taskDetails.completed")}
                    </Text>
                  </View>
                  <Divider style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formData.estimatedPomodoros}
                    </Text>
                    <Text style={styles.statLabel}>
                      {t("taskDetails.estimated")}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Basic Info Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("taskDetails.basicInfo")}
              </Text>

              {/* Title Input */}
              <TextInput
                label={t("addTask.titleLabel")}
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.title}
                disabled={isLoading}
                left={<TextInput.Icon icon="format-title" />}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}

              {/* Description Input */}
              <TextInput
                label={t("taskDetails.description")}
                value={formData.description}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
                disabled={isLoading}
                left={<TextInput.Icon icon="text" />}
              />

              {/* Estimated Pomodoros */}
              <TextInput
                label={t("addTask.pomodorosLabel")}
                value={formData.estimatedPomodoros}
                onChangeText={(value) =>
                  handleInputChange("estimatedPomodoros", value)
                }
                mode="outlined"
                style={styles.input}
                keyboardType="number-pad"
                error={!!errors.estimatedPomodoros}
                disabled={isLoading}
                left={<TextInput.Icon icon="timer-sand" />}
              />
              {errors.estimatedPomodoros && (
                <Text style={styles.errorText}>
                  {errors.estimatedPomodoros}
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Priority & Date Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("taskDetails.settings")}
              </Text>

              {/* Priority Selection */}
              <Text variant="titleSmall" style={styles.fieldLabel}>
                {t("tasks.priority")}
              </Text>
              <View style={styles.priorityButtons}>
                <Button
                  mode={formData.priority === "low" ? "contained" : "outlined"}
                  onPress={() => handleInputChange("priority", "low")}
                  icon="arrow-down"
                  style={[
                    styles.priorityButton,
                    formData.priority === "low" && {
                      backgroundColor: "#388E3C",
                    },
                  ]}
                  disabled={isLoading}
                >
                  {t("tasks.priorityLow")}
                </Button>
                <Button
                  mode={
                    formData.priority === "medium" ? "contained" : "outlined"
                  }
                  onPress={() => handleInputChange("priority", "medium")}
                  icon="minus"
                  style={[
                    styles.priorityButton,
                    formData.priority === "medium" && {
                      backgroundColor: "#F57C00",
                    },
                  ]}
                  disabled={isLoading}
                >
                  {t("tasks.priorityMedium")}
                </Button>
                <Button
                  mode={formData.priority === "high" ? "contained" : "outlined"}
                  onPress={() => handleInputChange("priority", "high")}
                  icon="arrow-up"
                  style={[
                    styles.priorityButton,
                    formData.priority === "high" && {
                      backgroundColor: "#D32F2F",
                    },
                  ]}
                  disabled={isLoading}
                >
                  {t("tasks.priorityHigh")}
                </Button>
              </View>

              {/* Due Date Picker */}
              <Text variant="titleSmall" style={styles.fieldLabel}>
                {t("tasks.dueDate")}
              </Text>
              <Button
                mode="outlined"
                onPress={showDatePickerHandler}
                icon="calendar"
                style={styles.dateButton}
                disabled={isLoading}
              >
                {formatDate(formData.dueDate)}
              </Button>

              {formData.dueDate && (
                <Button
                  mode="text"
                  onPress={() => handleInputChange("dueDate", null)}
                  icon="close"
                  textColor="#757575"
                  style={styles.clearDateButton}
                  disabled={isLoading}
                >
                  {t("addTask.clearDueDate")}
                </Button>
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={formData.dueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </Card.Content>
          </Card>

          {/* Metadata Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("taskDetails.detailedInfo")}
              </Text>

              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>
                  {t("taskDetails.createdDate")}:
                </Text>
                <Text style={styles.metadataValue}>
                  {formatDateTime(formData.createdAt)}
                </Text>
              </View>

              <Divider style={styles.metadataDivider} />

              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>{t("tasks.status")}:</Text>
                <Chip
                  icon={formData.isCompleted ? "check-circle" : "clock-outline"}
                  compact
                  style={
                    formData.isCompleted
                      ? { backgroundColor: "#E8F5E9" }
                      : { backgroundColor: "#FFF3E0" }
                  }
                  textStyle={
                    formData.isCompleted
                      ? { color: "#2E7D32", fontSize: 12 }
                      : { color: "#E65100", fontSize: 12 }
                  }
                >
                  {formData.isCompleted
                    ? t("tasks.completed")
                    : t("tasks.inProgress")}
                </Chip>
              </View>

              <Divider style={styles.metadataDivider} />

              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>
                  {t("taskDetails.pomodoroProgress")}:
                </Text>
                <Text style={styles.metadataValue}>
                  {formData.completedPomodoros} / {formData.estimatedPomodoros}
                </Text>
              </View>

              <ProgressBar
                progress={progressPercentage / 100}
                style={styles.progressBar}
                color={formData.isCompleted ? "#4CAF50" : theme.colors.primary}
              />

              {/* Pomodoro History */}
              {originalTask?.pomodoroSessions &&
                originalTask.pomodoroSessions.length > 0 && (
                  <>
                    <Divider style={styles.metadataDivider} />
                    <Text style={styles.metadataLabel}>
                      {t("taskDetails.pomodoroHistory")}:
                    </Text>
                    <View style={styles.historyContainer}>
                      {originalTask.pomodoroSessions
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((session, index) => (
                          <View key={index} style={styles.historyItem}>
                            <Text style={styles.historyDate}>
                              {new Date(session.completedAt).toLocaleString(
                                language === "vi" ? "vi-VN" : "en-US",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </Text>
                            <Chip
                              icon="timer"
                              compact
                              style={styles.historyChip}
                            >
                              {session.duration} {t("taskDetails.minutes")}
                            </Chip>
                          </View>
                        ))}
                      {originalTask.pomodoroSessions.length > 5 && (
                        <Text style={styles.historyMore}>
                          +{originalTask.pomodoroSessions.length - 5}{" "}
                          {t("taskDetails.moreSessions")}
                        </Text>
                      )}
                    </View>
                  </>
                )}
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("taskDetails.actions")}
              </Text>

              {/* Toggle Complete Button */}
              <Button
                mode="contained"
                onPress={handleToggleComplete}
                icon={formData.isCompleted ? "close-circle" : "check-circle"}
                style={[
                  styles.actionButton,
                  formData.isCompleted
                    ? { backgroundColor: "#F57C00" }
                    : { backgroundColor: "#4CAF50" },
                ]}
                loading={isLoading}
                disabled={isLoading}
              >
                {formData.isCompleted
                  ? t("taskDetails.markIncomplete")
                  : t("taskDetails.markComplete")}
              </Button>

              {/* Save Button */}
              <Button
                mode="contained"
                onPress={handleSave}
                icon="content-save"
                style={styles.actionButton}
                loading={isLoading}
                disabled={isLoading || !hasChanges}
              >
                {t("taskDetails.saveChanges")}
              </Button>

              {/* Delete Button */}
              <Button
                mode="outlined"
                onPress={handleDelete}
                icon="delete"
                style={styles.deleteButton}
                textColor="#D32F2F"
                disabled={isLoading}
              >
                {t("taskDetails.deleteTask")}
              </Button>

              {/* Cancel Button */}
              <Button
                mode="text"
                onPress={handleCancel}
                icon="arrow-left"
                style={styles.cancelButton}
                disabled={isLoading}
              >
                {t("taskDetails.goBack")}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: t("general.close"),
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#757575",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  headerContainer: {
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statusChip: {
    borderRadius: 20,
  },
  priorityChip: {
    borderRadius: 20,
  },
  progressCircleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressCircleOuter: {
    width: 140,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressCircleFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1976D2",
  },
  progressLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  pomodoroStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    alignSelf: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976D2",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  priorityButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
  },
  dateButton: {
    marginBottom: 8,
  },
  clearDateButton: {
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  metadataValue: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "600",
  },
  metadataDivider: {
    marginVertical: 8,
  },
  progressBar: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
  },
  historyContainer: {
    marginTop: 8,
    gap: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  historyDate: {
    fontSize: 13,
    color: "#616161",
  },
  historyChip: {
    height: 28,
  },
  historyMore: {
    fontSize: 12,
    color: "#9E9E9E",
    fontStyle: "italic",
    marginTop: 4,
    textAlign: "center",
  },
  actionButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 12,
    borderColor: "#D32F2F",
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default TaskDetailsScreen;
