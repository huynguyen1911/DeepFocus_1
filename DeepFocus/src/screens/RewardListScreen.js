import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import {
  FAB,
  Text,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
  Chip,
  Menu,
  IconButton,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useReward } from "../contexts/RewardContext";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import RewardCard from "../components/RewardCard";

/**
 * RewardListScreen - Display list of rewards/penalties for a class
 * Phase 3 Frontend Session 2
 */
export default function RewardListScreen() {
  const theme = useTheme();
  const { classId } = useLocalSearchParams();
  const { user } = useAuth();
  const { currentRole } = useRole();
  const { rewards, isLoading, loadRewardsByClass, deleteReward, clearError } =
    useReward();

  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, rewards, penalties
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId, selectedCategory]);

  const loadData = async () => {
    const options = {};
    if (selectedCategory) {
      options.category = selectedCategory;
    }
    await loadRewardsByClass(classId, options);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteReward = (rewardId) => {
    Alert.alert(
      "Xóa phần thưởng",
      "Bạn có chắc chắn muốn xóa phần thưởng này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await deleteReward(rewardId);
            if (success) {
              Alert.alert("Thành công", "Đã xóa phần thưởng");
              loadData();
            }
          },
        },
      ]
    );
  };

  const handleCreateReward = () => {
    router.push({
      pathname: "/rewards/create",
      params: { classId },
    });
  };

  const handleViewSummary = () => {
    router.push({
      pathname: "/rewards/summary",
      params: { classId },
    });
  };

  // Filter rewards based on selected type
  const getFilteredRewards = () => {
    if (filterType === "rewards") {
      return rewards.filter((r) => r.points > 0);
    } else if (filterType === "penalties") {
      return rewards.filter((r) => r.points < 0);
    }
    return rewards;
  };

  const filteredRewards = getFilteredRewards();

  // Check if user can delete (creator of reward or admin)
  const canDeleteReward = (reward) => {
    if (!user) return false;
    return (
      reward.giverId === user._id || user.roles?.some((r) => r.name === "admin")
    );
  };

  // Check if user can create rewards (only teacher/guardian, not student)
  const canCreateReward = () => {
    return currentRole === "teacher" || currentRole === "guardian";
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "academic":
        return "Học tập";
      case "behavior":
        return "Hành vi";
      case "attendance":
        return "Chuyên cần";
      default:
        return "Tất cả";
    }
  };

  if (isLoading && rewards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={[
            {
              value: "all",
              label: "Tất cả",
              icon: "format-list-bulleted",
            },
            {
              value: "rewards",
              label: "Thưởng",
              icon: "trophy",
            },
            {
              value: "penalties",
              label: "Phạt",
              icon: "alert-circle",
            },
          ]}
          style={styles.segmentedButtons}
        />

        <View style={styles.filterRow}>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Chip
                icon="filter"
                onPress={() => setCategoryMenuVisible(true)}
                mode="outlined"
                style={styles.categoryChip}
              >
                {getCategoryLabel(selectedCategory)}
              </Chip>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedCategory(null);
                setCategoryMenuVisible(false);
              }}
              title="Tất cả"
            />
            <Menu.Item
              onPress={() => {
                setSelectedCategory("academic");
                setCategoryMenuVisible(false);
              }}
              title="Học tập"
            />
            <Menu.Item
              onPress={() => {
                setSelectedCategory("behavior");
                setCategoryMenuVisible(false);
              }}
              title="Hành vi"
            />
            <Menu.Item
              onPress={() => {
                setSelectedCategory("attendance");
                setCategoryMenuVisible(false);
              }}
              title="Chuyên cần"
            />
          </Menu>

          <IconButton
            icon="chart-bar"
            mode="contained"
            onPress={handleViewSummary}
            iconColor={theme.colors.onPrimary}
            containerColor={theme.colors.primary}
            size={20}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {filteredRewards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Chưa có phần thưởng
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {filterType === "all"
                ? "Chưa có phần thưởng hoặc phạt nào trong lớp này."
                : filterType === "rewards"
                ? "Chưa có phần thưởng nào."
                : "Chưa có phạt nào."}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text variant="bodySmall" style={styles.countText}>
              {filteredRewards.length} kết quả
            </Text>
            {filteredRewards.map((reward) => (
              <RewardCard
                key={reward._id}
                reward={reward}
                showActions={canDeleteReward(reward)}
                onDelete={handleDeleteReward}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {canCreateReward() && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateReward}
          label="Tạo phần thưởng"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
    elevation: 2,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryChip: {
    flex: 1,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
  },
  countText: {
    color: "#757575",
    marginHorizontal: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#757575",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
