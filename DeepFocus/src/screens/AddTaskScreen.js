import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  Snackbar,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTasks } from "../contexts/TaskContext";
import { useLanguage } from "../contexts/LanguageContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import PomodoroCounter from "../components/PomodoroCounter";
import PriorityChips from "../components/PriorityChips";
import GradientButton from "../components/GradientButton";

const AddTaskScreen = () => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { addTask, updateTask, tasks } = useTasks();
  const params = useLocalSearchParams();

  // Extract route params
  const taskId = params?.taskId;
  const mode = params?.mode; // 'edit' or undefined (create mode)
  const isEditMode = mode === "edit" && taskId;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedPomodoros: "1",
    priority: "medium",
    dueDate: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load task data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoadingTask(true);

      // Find task from tasks array
      const task = tasks.find((t) => t._id === taskId || t.id === taskId);

      if (task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          estimatedPomodoros: String(task.estimatedPomodoros || 1),
          priority: task.priority || "medium",
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        });
      }

      setIsLoadingTask(false);
    }
  }, [isEditMode, taskId, tasks]);

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

  // Quick date actions
  const setQuickDate = (type) => {
    const date = new Date();

    switch (type) {
      case "today":
        handleInputChange("dueDate", date);
        break;
      case "tomorrow":
        date.setDate(date.getDate() + 1);
        handleInputChange("dueDate", date);
        break;
      case "weekend":
        // Next Saturday
        const daysUntilWeekend = 6 - date.getDay();
        date.setDate(
          date.getDate() + (daysUntilWeekend > 0 ? daysUntilWeekend : 7)
        );
        handleInputChange("dueDate", date);
        break;
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return t("addTask.selectDueDate");
    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle submit
  const handleSubmit = async () => {
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

      let result;

      if (isEditMode) {
        // Update existing task
        result = await updateTask(taskId, taskData);

        if (result.success) {
          setSnackbarMessage(t("addTask.updateSuccess"));
          setSnackbarVisible(true);

          // Navigate back after short delay
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          setSnackbarMessage(result.error || t("addTask.updateError"));
          setSnackbarVisible(true);
        }
      } else {
        // Create new task
        result = await addTask(taskData);

        if (result.success) {
          setSnackbarMessage(t("addTask.createSuccess"));
          setSnackbarVisible(true);

          // Navigate back after short delay
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          setSnackbarMessage(result.error || t("addTask.createError"));
          setSnackbarVisible(true);
        }
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
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FAFAFA" }]}
      edges={["top", "bottom"]}
    >
      {/* Floating X button */}
      <View style={styles.floatingHeader}>
        <Text variant="titleLarge" style={styles.screenTitle}>
          {isEditMode ? "Chỉnh sửa nhiệm vụ" : "Mục tiêu mới"}
        </Text>
        <IconButton
          icon="close"
          size={26}
          onPress={handleCancel}
          style={styles.closeButton}
          iconColor="#636E72"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoadingTask ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C63FF" />
              <Text style={styles.loadingText}>{t("general.loading")}</Text>
            </View>
          ) : (
            <View style={styles.formContainer}>
              {/* Title Input - Large, conversational */}
              <View style={styles.section}>
                <RNTextInput
                  value={formData.title}
                  onChangeText={(value) => handleInputChange("title", value)}
                  placeholder="Bạn muốn làm gì?"
                  placeholderTextColor="#9E9E9E"
                  style={[
                    styles.titleInput,
                    errors.title && { borderColor: "#FF5252" },
                  ]}
                  editable={!isLoading}
                  autoFocus={!isEditMode}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>

              {/* Description Input */}
              <View style={styles.section}>
                <RNTextInput
                  value={formData.description}
                  onChangeText={(value) =>
                    handleInputChange("description", value)
                  }
                  placeholder="Ghi chú thêm..."
                  placeholderTextColor="#B0B0B0"
                  style={styles.descriptionInput}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isLoading}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>

              {/* Pomodoro Estimation */}
              <View style={styles.section}>
                <Text style={styles.questionText}>Thời gian dự kiến</Text>
                <PomodoroCounter
                  value={formData.estimatedPomodoros}
                  onChange={(value) =>
                    handleInputChange("estimatedPomodoros", value)
                  }
                  disabled={isLoading}
                />
                {errors.estimatedPomodoros && (
                  <Text style={styles.errorText}>
                    {errors.estimatedPomodoros}
                  </Text>
                )}
              </View>

              {/* Priority Selection */}
              <View style={styles.section}>
                <Text style={styles.questionText}>Mức độ quan trọng?</Text>
                <PriorityChips
                  value={formData.priority}
                  onChange={(value) => handleInputChange("priority", value)}
                  disabled={isLoading}
                />
              </View>

              {/* Due Date - Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.questionText}>Khi nào làm?</Text>
                <View style={styles.dateChipsRow}>
                  <TouchableOpacity
                    style={[
                      styles.dateChip,
                      formData.dueDate &&
                        formatDate(formData.dueDate).includes(
                          formatDate(new Date())
                        ) &&
                        styles.dateChipSelected,
                    ]}
                    onPress={() => setQuickDate("today")}
                    disabled={isLoading}
                  >
                    <Text style={styles.dateChipEmoji}>☀️</Text>
                    <Text style={styles.dateChipText}>Hôm nay</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateChip}
                    onPress={() => setQuickDate("tomorrow")}
                    disabled={isLoading}
                  >
                    <Text style={styles.dateChipEmoji}>🌙</Text>
                    <Text style={styles.dateChipText}>Ngày mai</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateChip}
                    onPress={() => setQuickDate("weekend")}
                    disabled={isLoading}
                  >
                    <Text style={styles.dateChipEmoji}>🎯</Text>
                    <Text style={styles.dateChipText}>Cuối tuần</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateChip, styles.dateChipIcon]}
                    onPress={showDatePickerHandler}
                    disabled={isLoading}
                  >
                    <Text style={styles.dateChipEmoji}>📅</Text>
                  </TouchableOpacity>
                </View>

                {formData.dueDate && (
                  <View style={styles.selectedDateContainer}>
                    <Text style={styles.selectedDateText}>
                      📅 {formatDate(formData.dueDate)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleInputChange("dueDate", null)}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color="#636E72"
                      />
                    </TouchableOpacity>
                  </View>
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
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Button */}
        {!isLoadingTask && (
          <View style={styles.bottomContainer}>
            <GradientButton
              onPress={handleSubmit}
              title={isEditMode ? "💾 Cập nhật nhiệm vụ" : "✨ Tạo nhiệm vụ"}
              loading={isLoading}
              disabled={isLoading}
              style={styles.createButton}
            />
          </View>
        )}
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
        style={{ backgroundColor: "#6C63FF" }}
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
  floatingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
  },
  closeButton: {
    margin: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  loadingText: {
    marginTop: 16,
    color: "#636E72",
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 28,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3436",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 0,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 0,
  },
  descriptionInput: {
    fontSize: 15,
    color: "#636E72",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 0,
    minHeight: 80,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 12,
  },
  dateChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 0,
    gap: 4,
  },
  dateChipSelected: {
    backgroundColor: "#EDE9FE",
    borderColor: "#6C63FF",
    borderWidth: 2,
  },
  dateChipIcon: {
    flex: 0,
    width: 48,
    paddingHorizontal: 0,
  },
  dateChipEmoji: {
    fontSize: 16,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectedDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F0FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6C63FF",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  createButton: {
    width: "100%",
  },
  errorText: {
    fontSize: 12,
    color: "#FF5252",
    marginTop: 6,
    marginLeft: 4,
  },
});

export default AddTaskScreen;
