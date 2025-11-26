import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * AlertItem Component - Display alert/notification with swipe actions
 * Phase 3 Frontend Session 2
 */
const AlertItem = ({ alert, onPress, onMarkAsRead, onDelete }) => {
  const theme = useTheme();
  const swipeableRef = useRef(null);

  // Check if alert is unread
  const isUnread = !alert.readAt;

  // Get icon based on alert type
  const getTypeIcon = () => {
    switch (alert.type) {
      case "info":
        return "information";
      case "success":
        return "check-circle";
      case "warning":
        return "alert";
      case "alert":
        return "alert-circle";
      default:
        return "bell";
    }
  };

  // Get color based on alert type
  const getTypeColor = () => {
    switch (alert.type) {
      case "info":
        return "#2196F3"; // Blue
      case "success":
        return "#4CAF50"; // Green
      case "warning":
        return "#FF9800"; // Orange
      case "alert":
        return "#F44336"; // Red
      default:
        return "#757575"; // Gray
    }
  };

  // Get priority badge color
  const getPriorityColor = () => {
    if (alert.priority >= 8) return "#F44336"; // High priority - Red
    if (alert.priority >= 5) return "#FF9800"; // Medium priority - Orange
    return "#9E9E9E"; // Low priority - Gray
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";

    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render right swipe actions (delete)
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsContainer}>
        {isUnread && (
          <Animated.View
            style={[
              styles.swipeAction,
              styles.markReadAction,
              { transform: [{ translateX: trans }] },
            ]}
          >
            <TouchableOpacity
              style={styles.swipeActionButton}
              onPress={() => {
                onMarkAsRead && onMarkAsRead(alert._id);
                swipeableRef.current?.close();
              }}
            >
              <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
              <Text style={styles.swipeActionText}>Đã đọc</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        <Animated.View
          style={[
            styles.swipeAction,
            styles.deleteAction,
            { transform: [{ translateX: trans }] },
          ]}
        >
          <TouchableOpacity
            style={styles.swipeActionButton}
            onPress={() => {
              onDelete && onDelete(alert._id);
              swipeableRef.current?.close();
            }}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Xóa</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Card
        style={[
          styles.card,
          isUnread && styles.unreadCard,
          { borderLeftColor: getTypeColor() },
        ]}
        onPress={() => {
          onPress && onPress(alert);
          if (isUnread && onMarkAsRead) {
            onMarkAsRead(alert._id);
          }
        }}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getTypeColor() + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={getTypeIcon()}
                  size={20}
                  color={getTypeColor()}
                />
              </View>
              {isUnread && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.headerRight}>
              {alert.priority >= 5 && (
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor() },
                  ]}
                />
              )}
            </View>
          </View>

          <Text
            variant="titleMedium"
            style={[styles.title, isUnread && styles.unreadText]}
          >
            {alert.title}
          </Text>

          <Text variant="bodyMedium" style={styles.message} numberOfLines={2}>
            {alert.message}
          </Text>

          <Text variant="bodySmall" style={styles.timestamp}>
            {getRelativeTime(alert.createdAt)}
          </Text>
        </Card.Content>
      </Card>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 12,
    elevation: 1,
    borderLeftWidth: 4,
    backgroundColor: "#FFFFFF",
  },
  unreadCard: {
    backgroundColor: "#F9F9F9",
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    marginBottom: 6,
  },
  unreadText: {
    fontWeight: "bold",
  },
  message: {
    color: "#616161",
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    color: "#9E9E9E",
    fontSize: 11,
  },
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  markReadAction: {
    backgroundColor: "#4CAF50",
  },
  deleteAction: {
    backgroundColor: "#F44336",
  },
  swipeActionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default AlertItem;
