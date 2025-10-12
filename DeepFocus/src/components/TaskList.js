import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Searchbar,
  useTheme,
  SegmentedButtons,
} from "react-native-paper";
import TaskItem from "./TaskItem";
import { useTasks } from "../contexts/TaskContext";

const TaskList = ({ onTaskPress, onStartTimer }) => {
  const theme = useTheme();
  const { tasks, isLoading, loadTasks, getFilteredTasks } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, active, completed

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks(false);
    setRefreshing(false);
  };

  // Get filtered tasks
  const getDisplayTasks = () => {
    let filtered = tasks;

    // Apply filter mode
    if (filterMode === "active") {
      filtered = filtered.filter((task) => !task.isCompleted);
    } else if (filterMode === "completed") {
      filtered = filtered.filter((task) => task.isCompleted);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = getFilteredTasks({ search: searchQuery });

      // Re-apply filter mode after search
      if (filterMode === "active") {
        filtered = filtered.filter((task) => !task.isCompleted);
      } else if (filterMode === "completed") {
        filtered = filtered.filter((task) => task.isCompleted);
      }
    }

    // Sort: incomplete first, then by creation date
    return filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      );
    }

    let message = "Chưa có nhiệm vụ nào. Hãy thêm task đầu tiên!";
    if (filterMode === "active") {
      message = "Không có nhiệm vụ đang hoạt động";
    } else if (filterMode === "completed") {
      message = "Chưa hoàn thành nhiệm vụ nào";
    } else if (searchQuery.trim()) {
      message = `Không tìm thấy kết quả cho "${searchQuery}"`;
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  };

  // Render task item
  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      onPress={() => onTaskPress && onTaskPress(item)}
      onStartTimer={onStartTimer}
    />
  );

  const displayTasks = getDisplayTasks();

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm nhiệm vụ..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterMode}
          onValueChange={setFilterMode}
          buttons={[
            {
              value: "all",
              label: `Tất cả (${tasks.length})`,
              icon: "format-list-bulleted",
            },
            {
              value: "active",
              label: `Đang làm (${tasks.filter((t) => !t.isCompleted).length})`,
              icon: "progress-clock",
            },
            {
              value: "completed",
              label: `Hoàn thành (${
                tasks.filter((t) => t.isCompleted).length
              })`,
              icon: "check-circle",
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={displayTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          displayTasks.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedButtons: {
    backgroundColor: "transparent",
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80, // Space for FAB
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

export default TaskList;
