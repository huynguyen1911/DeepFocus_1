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

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    await loadRewardsByClass(classId);
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

  // Render empty state with icon and engaging text
  const renderEmptyState = () => {
    let icon = "🎁";
    let title = "Chưa có phần thưởng";
    let description =
      "Lớp học trầm quá? Hãy tặng sao để khích lệ học sinh ngay!";

    if (filterType === "rewards") {
      icon = "🎁";
      title = "Chưa có phần thưởng";
      description =
        "Hãy trao phần thưởng để ghi nhận những nỗ lực của các bạn!";
    } else if (filterType === "penalties") {
      icon = "⚠️";
      title = "Chưa có phạt nào";
      description = "Tuyệt vời! Các bạn học sinh đang rất ngoan.";
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyDescription}>
          {description}
        </Text>
      </View>
    );
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
      {/* Custom Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={styles.title}>
          Thưởng & Phạt
        </Text>
        <IconButton
          icon="chart-bar"
          size={24}
          onPress={handleViewSummary}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
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
          theme={{
            colors: {
              secondaryContainer: theme.colors.primary,
              onSecondaryContainer: "#FFFFFF",
            },
          }}
        />
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
          renderEmptyState()
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
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#fff",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  title: {
    fontWeight: "bold",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    elevation: 1,
  },
  segmentedButtons: {
    marginBottom: 0,
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#757575",
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
