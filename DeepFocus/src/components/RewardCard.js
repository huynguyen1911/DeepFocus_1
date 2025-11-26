import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, Chip, IconButton, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * RewardCard Component - Display reward/penalty item
 * Phase 3 Frontend Session 2
 */
const RewardCard = ({ reward, onDelete, showActions = false }) => {
  const theme = useTheme();

  // Determine if this is a reward (positive) or penalty (negative)
  const isReward = reward.points > 0;

  // Get color based on reward/penalty
  const getPointsColor = () => {
    return isReward ? "#4CAF50" : "#F44336"; // Green for reward, Red for penalty
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (reward.category) {
      case "academic":
        return "book-open-variant";
      case "behavior":
        return "account-heart";
      case "attendance":
        return "calendar-check";
      default:
        return "star";
    }
  };

  // Get category label
  const getCategoryLabel = () => {
    switch (reward.category) {
      case "academic":
        return "Học tập";
      case "behavior":
        return "Hành vi";
      case "attendance":
        return "Chuyên cần";
      default:
        return "Khác";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get student name (from populated data or ID)
  const getStudentName = () => {
    if (reward.student?.fullName) return reward.student.fullName;
    if (reward.student?.username) return reward.student.username;
    return "Học sinh";
  };

  // Get giver name (from populated data or ID)
  const getGiverName = () => {
    if (reward.giver?.fullName) return reward.giver.fullName;
    if (reward.giver?.username) return reward.giver.username;
    return "Giáo viên";
  };

  return (
    <Card style={[styles.card, { borderLeftColor: getPointsColor() }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name={isReward ? "trophy" : "alert-circle"}
              size={24}
              color={getPointsColor()}
            />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={styles.studentName}>
                {getStudentName()}
              </Text>
              <Text variant="bodySmall" style={styles.giverName}>
                Từ: {getGiverName()}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text
              variant="headlineSmall"
              style={[styles.points, { color: getPointsColor() }]}
            >
              {isReward ? "+" : ""}
              {reward.points}
            </Text>
            <Text variant="bodySmall" style={styles.pointsLabel}>
              điểm
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text variant="bodyMedium" style={styles.reason}>
            {reward.reason}
          </Text>
        </View>

        <View style={styles.footer}>
          <Chip
            icon={getCategoryIcon()}
            mode="outlined"
            compact
            style={styles.categoryChip}
          >
            {getCategoryLabel()}
          </Chip>

          <Text variant="bodySmall" style={styles.timestamp}>
            {formatDate(reward.createdAt)}
          </Text>

          {showActions && onDelete && (
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => onDelete(reward._id)}
              style={styles.deleteButton}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  studentName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  giverName: {
    color: "#757575",
  },
  headerRight: {
    alignItems: "center",
    marginLeft: 12,
  },
  points: {
    fontWeight: "bold",
  },
  pointsLabel: {
    color: "#757575",
    fontSize: 11,
  },
  content: {
    marginBottom: 12,
  },
  reason: {
    lineHeight: 20,
    color: "#424242",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  categoryChip: {
    height: 28,
  },
  timestamp: {
    color: "#9E9E9E",
    flex: 1,
    textAlign: "right",
  },
  deleteButton: {
    margin: 0,
  },
});

export default RewardCard;
