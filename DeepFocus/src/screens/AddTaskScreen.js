import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Text,
  SegmentedButtons,
  useTheme,
  Snackbar,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTasks } from "../contexts/TaskContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddTaskScreen = () => {
  const theme = useTheme();
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
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    const pomodoros = parseInt(formData.estimatedPomodoros);
    if (isNaN(pomodoros) || pomodoros < 1) {
      newErrors.estimatedPomodoros = "Số pomodoro phải ít nhất là 1";
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
    Keyboard.dismiss(); // Dismiss keyboard trước
    setShowDatePicker(true);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Chọn ngày hết hạn";
    return date.toLocaleDateString("vi-VN", {
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
          setSnackbarMessage("✅ Đã cập nhật nhiệm vụ thành công!");
          setSnackbarVisible(true);

          // Navigate back after short delay
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          setSnackbarMessage(result.error || "Không thể cập nhật nhiệm vụ");
          setSnackbarVisible(true);
        }
      } else {
        // Create new task
        result = await addTask(taskData);

        if (result.success) {
          setSnackbarMessage("✅ Đã tạo nhiệm vụ thành công!");
          setSnackbarVisible(true);

          // Navigate back after short delay
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          setSnackbarMessage(result.error || "Không thể tạo nhiệm vụ");
          setSnackbarVisible(true);
        }
      }
    } catch (error) {
      setSnackbarMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
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
          {isLoadingTask ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text variant="headlineSmall" style={styles.formTitle}>
                  {isEditMode ? "Chỉnh Sửa Nhiệm Vụ" : "Tạo Nhiệm Vụ Mới"}
                </Text>

                {/* Title Input */}
                <TextInput
                  label="Tiêu đề *"
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
                  label="Mô tả (tùy chọn)"
                  value={formData.description}
                  onChangeText={(value) =>
                    handleInputChange("description", value)
                  }
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  disabled={isLoading}
                  left={<TextInput.Icon icon="text" />}
                />

                {/* Estimated Pomodoros */}
                <TextInput
                  label="Số Pomodoro dự kiến *"
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

                {/* Priority Selection */}
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Độ ưu tiên
                </Text>
                <SegmentedButtons
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                  buttons={[
                    {
                      value: "low",
                      label: "Thấp",
                      icon: "arrow-down",
                      style:
                        formData.priority === "low"
                          ? { backgroundColor: "#E8F5E9" }
                          : {},
                    },
                    {
                      value: "medium",
                      label: "Trung bình",
                      icon: "minus",
                      style:
                        formData.priority === "medium"
                          ? { backgroundColor: "#FFF3E0" }
                          : {},
                    },
                    {
                      value: "high",
                      label: "Cao",
                      icon: "arrow-up",
                      style:
                        formData.priority === "high"
                          ? { backgroundColor: "#FFEBEE" }
                          : {},
                    },
                  ]}
                  style={styles.segmentedButtons}
                  disabled={isLoading}
                />

                {/* Due Date Picker */}
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Ngày hết hạn (tùy chọn)
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
                    Xóa ngày hết hạn
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

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={styles.cancelButton}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isEditMode ? "Cập Nhật" : "Lưu"}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Đóng",
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
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  formTitle: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 12,
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 8,
  },
  clearDateButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default AddTaskScreen;
