import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  Platform,
} from "react-native";
import {
  Text,
  IconButton,
  Chip,
  Snackbar,
  ActivityIndicator,
  Menu,
  FAB,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTasks } from "../contexts/TaskContext";
import { useLanguage } from "../contexts/LanguageContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import CircularProgressTask from "../components/CircularProgressTask";
import PriorityChips from "../components/PriorityChips";
import GradientButton from "../components/GradientButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Task Details Screen - View-first, Edit-later approach
 * Natural & Human-centric design
 */
const TaskDetailsScreen = () => {
  const { t, language } = useLanguage();
  const { updateTask, deleteTask, completeTask, tasks } = useTasks();
  const params = useLocalSearchParams();
  const taskId = params?.id || params?.taskId;

  // State
  const [task, setTask] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const titleInputRef = useRef(null);

  // Load task
  useEffect(() => {
    if (taskId) {
      const foundTask = tasks.find((t) => t._id === taskId || t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setTempTitle(foundTask.title || "");
        setTempDescription(foundTask.description || "");
      }
      setIsLoadingTask(false);
    }
  }, [taskId, tasks]);

  // Auto-save when field changes
  const autoSave = async (field, value) => {
    if (!task) return;

    try {
      const updateData = { [field]: value };
      const result = await updateTask(taskId, updateData);

      if (result.success) {
        setTask((prev) => ({ ...prev, [field]: value }));
      } else {
        setSnackbarMessage("Lỗi khi lưu tự động");
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  };

  // Handle title edit
  const handleTitleTap = () => {
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== task.title) {
      autoSave("title", tempTitle.trim());
    } else if (!tempTitle.trim()) {
      setTempTitle(task.title);
    }
  };

  // Handle description blur
  const handleDescriptionBlur = () => {
    if (tempDescription !== task.description) {
      autoSave("description", tempDescription);
    }
  };

  // Handle priority change
  const handlePriorityChange = (newPriority) => {
    autoSave("priority", newPriority);
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      autoSave("dueDate", selectedDate.toISOString());
    }
  };

  // Handle complete task
  const handleCompleteTask = async () => {
    try {
      const result = await completeTask(taskId);
      if (result.success) {
        // TODO: Add confetti animation here! 🎉
        // - Trigger confetti from center or button
        // - Transform tree emoji: 🌱 -> 🌳
        // - Dopamine reward for user!
        setSnackbarMessage("🎉 Hoàn thành nhiệm vụ!");
        setSnackbarVisible(true);
        setTimeout(() => router.back(), 1500);
      } else {
        setSnackbarMessage(result.error || "Lỗi khi hoàn thành");
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage("Có lỗi xảy ra");
      setSnackbarVisible(true);
    }
  };

  // Handle delete task
  const handleDeleteTask = () => {
    Alert.alert("Xóa nhiệm vụ", "Bạn có chắc chắn muốn xóa nhiệm vụ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const result = await deleteTask(taskId);
          if (result.success) {
            router.back();
          } else {
            setSnackbarMessage("Lỗi khi xóa");
            setSnackbarVisible(true);
          }
        },
      },
    ]);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa đặt";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get quick date label
  const getQuickDateLabel = () => {
    if (!task?.dueDate) return "Chưa đặt hạn";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "☀️ Hôm nay";
    if (diffDays === 1) return "🌙 Ngày mai";
    if (diffDays >= 2 && diffDays <= 7) return `📅 ${diffDays} ngày nữa`;
    return `📅 ${formatDate(task.dueDate)}`;
  };

  if (isLoadingTask) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy nhiệm vụ</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Simple Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          iconColor="#2D3436"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
              iconColor="#2D3436"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />
          }
        >
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              setMenuVisible(false);
              handleDeleteTask();
            }}
            title="Xóa nhiệm vụ"
            titleStyle={{ color: "#FF5252" }}
          />
        </Menu>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title - Editable on tap */}
        <View style={styles.heroSection}>
          {editingTitle ? (
            <RNTextInput
              ref={titleInputRef}
              value={tempTitle}
              onChangeText={setTempTitle}
              onBlur={handleTitleBlur}
              style={styles.heroTitleInput}
              placeholder="Tên nhiệm vụ..."
              placeholderTextColor="#BDBDBD"
              autoFocus
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={handleTitleTap} activeOpacity={0.7}>
              <Text style={styles.heroTitle}>{task.title}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Circular Progress - Gamification */}
        <CircularProgressTask
          completed={task.completedPomodoros || 0}
          estimated={parseInt(task.estimatedPomodoros) || 1}
        />

        {/* Properties Row - Chips */}
        <View style={styles.propertiesSection}>
          {/* Date Chip */}
          <TouchableOpacity
            style={styles.propertyChip}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.propertyChipText}>{getQuickDateLabel()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={task.dueDate ? new Date(task.dueDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Priority Selection */}
        <View style={styles.prioritySection}>
          <Text style={styles.sectionLabel}>Mức độ quan trọng</Text>
          <PriorityChips
            value={task.priority || "medium"}
            onChange={handlePriorityChange}
          />
        </View>

        {/* Description - Always visible */}
        <View style={styles.descriptionSection}>
          <View style={styles.descriptionHeader}>
            <Text style={styles.sectionLabel}>Ghi chú</Text>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#D1D5DB"
              style={styles.descriptionIcon}
            />
          </View>
          <RNTextInput
            value={tempDescription}
            onChangeText={setTempDescription}
            onBlur={handleDescriptionBlur}
            style={styles.descriptionInput}
            placeholder="Thêm ghi chú cho nhiệm vụ này..."
            placeholderTextColor="#B0B0B0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Button - Gradient */}
      {!task.isCompleted && (
        <View style={styles.bottomContainer}>
          <GradientButton
            onPress={handleCompleteTask}
            title="Hoàn thành nhiệm vụ"
            icon="check"
            mode="gradient"
            style={styles.completeButton}
          />
        </View>
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#636E72",
  },
  errorText: {
    fontSize: 16,
    color: "#FF5252",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3436",
    flex: 1,
  },
  heroTitleInput: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3436",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#6C63FF",
  },
  editIcon: {
    marginLeft: 8,
  },
  propertiesSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  propertyChip: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  propertyChipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2D3436",
  },
  prioritySection: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 12,
  },
  descriptionSection: {
    marginBottom: 28,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  descriptionIcon: {
    marginTop: 2,
  },
  descriptionInput: {
    fontSize: 15,
    color: "#636E72",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 0,
    minHeight: 100,
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
  completeButton: {
    width: "100%",
  },
});

export default TaskDetailsScreen;
