import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  Text,
  Searchbar,
  Divider,
  IconButton,
  Chip,
  useTheme,
  ProgressBar,
} from "react-native-paper";
import { useTasks } from "../contexts/TaskContext";
import { useLanguage } from "../contexts/LanguageContext";

const TaskSelector = ({ visible, onClose, onSelectTask }) => {
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { tasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("priority"); // 'priority' or 'dueDate'

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    // Only show incomplete tasks
    let filtered = tasks.filter((task) => !task.isCompleted);

    // Apply search
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortMode === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff =
          (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        if (priorityDiff !== 0) return priorityDiff;
        // Same priority, sort by date
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        // Sort by due date
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });
  }, [tasks, searchQuery, sortMode]);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#F44336";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return t("tasks.priorityHigh");
      case "medium":
        return t("tasks.priorityMedium");
      case "low":
        return t("tasks.priorityLow");
      default:
        return t("tasks.priorityUnknown");
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (task) => {
    if (task.estimatedPomodoros === 0) return 0;
    return (task.completedPomodoros / task.estimatedPomodoros) * 100;
  };

  // Render task item
  const renderTaskItem = ({ item }) => {
    const progressPercentage = getProgressPercentage(item);
    const isNearComplete = progressPercentage >= 75;

    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          { borderLeftColor: getPriorityColor(item.priority) },
        ]}
        onPress={() => onSelectTask(item)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Chip
            mode="flat"
            style={[
              styles.priorityChip,
              { backgroundColor: getPriorityColor(item.priority) + "20" },
            ]}
            textStyle={[
              styles.priorityText,
              { color: getPriorityColor(item.priority) },
            ]}
            compact={false}
          >
            {getPriorityLabel(item.priority)}
          </Chip>
        </View>

        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.pomodoroContainer}>
            <Text style={styles.pomodoroText}>
              🍅 {item.completedPomodoros}/{item.estimatedPomodoros}
            </Text>
            <ProgressBar
              progress={Math.min(1, progressPercentage / 100)}
              color={isNearComplete ? "#4CAF50" : theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          {item.dueDate && (
            <Text style={styles.dueDateText}>
              📅{" "}
              {new Date(item.dueDate).toLocaleDateString(
                language === "vi" ? "vi-VN" : "en-US"
              )}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {t("taskSelector.selectTask")}
            </Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder={t("tasks.searchTasks")}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {/* Sort Buttons */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>{t("taskSelector.sortBy")}:</Text>
            <View style={styles.sortButtons}>
              <Chip
                mode={sortMode === "priority" ? "flat" : "outlined"}
                selected={sortMode === "priority"}
                onPress={() => setSortMode("priority")}
                style={styles.sortChip}
              >
                {t("tasks.priority")}
              </Chip>
              <Chip
                mode={sortMode === "dueDate" ? "flat" : "outlined"}
                selected={sortMode === "dueDate"}
                onPress={() => setSortMode("dueDate")}
                style={styles.sortChip}
              >
                {t("tasks.dueDate")}
              </Chip>
            </View>
          </View>

          <Divider />
        </View>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? t("tasks.noSearchResults", { query: searchQuery })
                : t("taskSelector.noTasks")}
            </Text>
            <Text style={styles.emptySubtext}>
              {t("taskSelector.createTaskHint")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item._id || item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.noTaskButton}
            onPress={() => onSelectTask(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.noTaskText}>
              ⏭️ {t("taskSelector.startWithoutTask")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 48,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortChip: {
    height: 32,
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    height: 32,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 12,
  },
  taskFooter: {
    gap: 8,
  },
  pomodoroContainer: {
    gap: 4,
  },
  pomodoroText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#424242",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  dueDateText: {
    fontSize: 12,
    color: "#757575",
    fontStyle: "italic",
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#424242",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  noTaskButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  noTaskText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#424242",
  },
});

export default TaskSelector;
