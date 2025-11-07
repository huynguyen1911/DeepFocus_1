import React, { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { router } from "expo-router";
import {
  Card,
  Text,
  ProgressBar,
  IconButton,
  Chip,
  useTheme,
  Button,
  Divider,
} from "react-native-paper";
import { useTasks } from "../contexts/TaskContext";

const TaskItem = ({ task, onPress, onStartTimer }) => {
  const theme = useTheme();
  const { deleteTask, completeTask } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const swipeableRef = useRef(null);

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "#FF5252";
      case "medium":
        return "#FFA726";
      case "low":
        return "#66BB6A";
      default:
        return "#9E9E9E";
    }
  };

  // Get priority label
  const getPriorityLabel = () => {
    switch (task.priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "N/A";
    }
  };

  // Calculate progress
  const getProgress = () => {
    if (task.estimatedPomodoros === 0) return 0;
    return task.completedPomodoros / task.estimatedPomodoros;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Check if overdue
  const isOverdue = () => {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date() > new Date(task.dueDate);
  };

  // Modal handlers
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  // Handle long press - show action modal
  const handleLongPress = () => {
    openModal();
  };

  // Handle view details
  const handleViewDetails = () => {
    closeModal();
    router.push(`/task-details/${task._id || task.id}`);
  };

  // Handle start timer
  const handleStartTimer = () => {
    console.log("⏱️ TaskItem handleStartTimer called");
    console.log("📝 Task:", task.title);
    console.log("🔗 onStartTimer prop exists?", !!onStartTimer);

    // Close swipeable first
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    closeModal();

    if (onStartTimer) {
      console.log("✅ Calling onStartTimer prop with task");
      onStartTimer(task);
    } else {
      console.log("❌ onStartTimer prop is missing!");
    }
  };

  // Handle delete
  const handleDelete = () => {
    // Close swipeable first
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    closeModal();
    Alert.alert("Xóa nhiệm vụ", `Bạn có chắc chắn muốn xóa "${task.title}"?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const result = await deleteTask(task._id);
          if (!result.success) {
            Alert.alert("Lỗi", result.error);
          }
        },
      },
    ]);
  };

  // Handle complete toggle
  const handleToggleComplete = async () => {
    const result = await completeTask(task._id);
    if (!result.success) {
      Alert.alert("Lỗi", result.error);
    }
  };

  // Render right swipe actions (Start Timer + Delete)
  const renderRightActions = () => {
    // For completed tasks, only show delete
    if (task.isCompleted) {
      return (
        <View style={styles.swipeActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteAction}>
            <IconButton icon="delete" iconColor="white" size={24} />
            <Text style={styles.swipeActionText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // For incomplete tasks, show timer + delete
    return (
      <View style={styles.swipeActions}>
        {onStartTimer && (
          <TouchableOpacity
            onPress={() => {
              console.log("🟢 Timer swipe action pressed!");
              handleStartTimer();
            }}
            style={styles.timerAction}
          >
            <IconButton icon="timer" iconColor="white" size={24} />
            <Text style={styles.swipeActionText}>Timer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteAction}>
          <IconButton icon="delete" iconColor="white" size={24} />
          <Text style={styles.swipeActionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <Card
          style={[
            styles.card,
            { borderLeftColor: getPriorityColor(), borderLeftWidth: 4 },
            task.isCompleted && styles.completedCard,
          ]}
          onPress={onPress}
          onLongPress={handleLongPress}
        >
          <Card.Content style={styles.cardContent}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={handleToggleComplete}>
                  <IconButton
                    icon={
                      task.isCompleted
                        ? "checkbox-marked-circle"
                        : "checkbox-blank-circle-outline"
                    }
                    iconColor={
                      task.isCompleted ? theme.colors.primary : "#9E9E9E"
                    }
                    size={24}
                    style={styles.checkbox}
                  />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.title,
                      task.isCompleted && styles.completedText,
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {task.description && !task.isCompleted && (
              <Text
                variant="bodySmall"
                style={styles.description}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}

            {/* Progress Section */}
            {!task.isCompleted && (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text variant="bodySmall" style={styles.progressText}>
                    🍅 {task.completedPomodoros} / {task.estimatedPomodoros}{" "}
                    Pomodoros
                  </Text>
                  <Text variant="bodySmall" style={styles.progressPercentage}>
                    {Math.round(getProgress() * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={getProgress()}
                  color={getProgress() >= 0.75 ? "#4CAF50" : getPriorityColor()}
                  style={styles.progressBar}
                />
              </View>
            )}

            {/* Footer Row */}
            <View style={styles.footerRow}>
              <View style={styles.footerLeft}>
                <Chip
                  mode="outlined"
                  style={[
                    styles.priorityChip,
                    { borderColor: getPriorityColor() },
                  ]}
                  textStyle={[styles.chipText, { color: getPriorityColor() }]}
                  compact={false}
                >
                  {getPriorityLabel()}
                </Chip>

                {task.dueDate && (
                  <Chip
                    mode="outlined"
                    icon={isOverdue() ? "alert-circle" : "calendar"}
                    style={[styles.dateChip, isOverdue() && styles.overdueChip]}
                    textStyle={[
                      styles.chipText,
                      isOverdue() && styles.overdueText,
                    ]}
                    compact={false}
                  >
                    {formatDate(task.dueDate)}
                  </Chip>
                )}

                {task.isCompleted && task.completedAt && (
                  <Chip
                    icon="check-circle"
                    mode="flat"
                    style={styles.completedChip}
                    textStyle={styles.completedChipText}
                  >
                    Hoàn thành
                  </Chip>
                )}
              </View>

              {/* Quick Timer Button - Only for incomplete tasks */}
              {!task.isCompleted && onStartTimer && (
                <IconButton
                  icon="timer"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStartTimer();
                  }}
                  style={styles.timerButton}
                />
              )}
            </View>
          </Card.Content>
        </Card>
      </Swipeable>

      {/* Long Press Modal - Action Sheet */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Card style={styles.actionSheet}>
              <Card.Content style={styles.actionSheetContent}>
                <Text variant="titleMedium" style={styles.actionSheetTitle}>
                  {task.title}
                </Text>
                <Divider style={styles.actionDivider} />

                {/* View Details Action */}
                <Button
                  mode="text"
                  icon="eye"
                  onPress={handleViewDetails}
                  style={styles.actionButton}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  Xem chi tiết
                </Button>

                {/* Start Timer Action - Only for incomplete tasks */}
                {!task.isCompleted && onStartTimer && (
                  <Button
                    mode="text"
                    icon="timer"
                    onPress={() => {
                      console.log("🔵 Long press timer button pressed!");
                      handleStartTimer();
                    }}
                    style={styles.actionButton}
                    contentStyle={styles.actionButtonContent}
                    labelStyle={styles.actionButtonLabel}
                  >
                    Bắt đầu timer
                  </Button>
                )}

                {/* Delete Action */}
                <Button
                  mode="text"
                  icon="delete"
                  onPress={handleDelete}
                  style={styles.actionButton}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={[
                    styles.actionButtonLabel,
                    styles.deleteButtonLabel,
                  ]}
                >
                  Xóa nhiệm vụ
                </Button>

                <Divider style={styles.actionDivider} />

                {/* Cancel Button */}
                <Button
                  mode="contained"
                  onPress={closeModal}
                  style={styles.cancelButton}
                >
                  Đóng
                </Button>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    borderRadius: 8,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: "#F5F5F5",
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  checkbox: {
    margin: 0,
    marginRight: 4,
  },
  titleContainer: {
    flex: 1,
    paddingTop: 8,
  },
  title: {
    fontWeight: "600",
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#757575",
  },
  description: {
    color: "#616161",
    marginTop: 4,
    marginLeft: 36,
    lineHeight: 18,
  },
  progressSection: {
    marginTop: 12,
    marginLeft: 36,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressText: {
    color: "#616161",
    fontSize: 12,
  },
  progressPercentage: {
    color: "#616161",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginLeft: 36,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  timerButton: {
    margin: 0,
    marginRight: -8,
  },
  priorityChip: {
    height: 32,
    backgroundColor: "transparent",
  },
  dateChip: {
    height: 32,
    backgroundColor: "transparent",
    borderColor: "#9E9E9E",
  },
  overdueChip: {
    borderColor: "#FF5252",
    backgroundColor: "#FFEBEE",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    marginHorizontal: 4,
  },
  overdueText: {
    color: "#FF5252",
  },
  completedChip: {
    height: 28,
    backgroundColor: "#E8F5E9",
  },
  completedChipText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
  // Swipe Actions
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
    marginVertical: 6,
  },
  timerAction: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
  },
  deleteAction: {
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  swipeActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginTop: -8,
  },
  // Modal / Action Sheet
  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    justifyContent: "flex-end",
    flex: 1,
  },
  actionSheet: {
    borderRadius: 16,
    marginBottom: 20,
  },
  actionSheetContent: {
    paddingVertical: 8,
  },
  actionSheetTitle: {
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 12,
  },
  actionDivider: {
    marginVertical: 8,
  },
  actionButton: {
    justifyContent: "flex-start",
    paddingVertical: 4,
  },
  actionButtonContent: {
    justifyContent: "flex-start",
    paddingVertical: 8,
  },
  actionButtonLabel: {
    fontSize: 16,
    textAlign: "left",
  },
  deleteButtonLabel: {
    color: "#FF5252",
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default TaskItem;
