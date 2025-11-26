import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert as RNAlert,
} from "react-native";
import {
  Text,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
  Button,
  IconButton,
} from "react-native-paper";
import { router } from "expo-router";
import { useAlert } from "../contexts/AlertContext";
import AlertItem from "../components/AlertItem";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * AlertListScreen - Notification center
 * Phase 3 Frontend Session 2
 */
export default function AlertListScreen() {
  const theme = useTheme();
  const {
    alerts,
    unreadCount,
    isLoading,
    loadAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
  } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, unread

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    const options = {};
    if (filterType === "unread") {
      options.unreadOnly = true;
    }
    await loadAlerts(options);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAlertPress = (alert) => {
    // Mark as read when pressing
    if (!alert.readAt) {
      markAlertAsRead(alert._id);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    await markAlertAsRead(alertId);
  };

  const handleDeleteAlert = (alertId) => {
    RNAlert.alert("Xóa thông báo", "Bạn có chắc chắn muốn xóa thông báo này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const success = await deleteAlert(alertId);
          if (success) {
            // Reload data after delete
            loadData();
          }
        },
      },
    ]);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      RNAlert.alert("Thông báo", "Không có thông báo chưa đọc");
      return;
    }

    RNAlert.alert(
      "Đánh dấu tất cả đã đọc",
      `Bạn có ${unreadCount} thông báo chưa đọc. Đánh dấu tất cả là đã đọc?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            const success = await markAllAlertsAsRead();
            if (success) {
              RNAlert.alert(
                "Thành công",
                "Đã đánh dấu tất cả thông báo là đã đọc"
              );
              loadData();
            }
          },
        },
      ]
    );
  };

  const getFilteredAlerts = () => {
    if (filterType === "unread") {
      return alerts.filter((a) => !a.readAt);
    }
    return alerts;
  };

  const filteredAlerts = getFilteredAlerts();

  if (isLoading && alerts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterRow}>
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
                value: "unread",
                label: `Chưa đọc (${unreadCount})`,
                icon: "bell-badge",
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {unreadCount > 0 && (
          <Button
            mode="text"
            icon="check-all"
            onPress={handleMarkAllAsRead}
            compact
            style={styles.markAllButton}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
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
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={filterType === "unread" ? "check-all" : "bell-off"}
              size={64}
              color="#BDBDBD"
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {filterType === "unread"
                ? "Không có thông báo chưa đọc"
                : "Không có thông báo"}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {filterType === "unread"
                ? "Bạn đã đọc tất cả thông báo."
                : "Bạn chưa có thông báo nào."}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text variant="bodySmall" style={styles.countText}>
              {filteredAlerts.length} thông báo
              {filterType === "all" &&
                unreadCount > 0 &&
                ` • ${unreadCount} chưa đọc`}
            </Text>
            {filteredAlerts.map((alert) => (
              <AlertItem
                key={alert._id}
                alert={alert}
                onPress={handleAlertPress}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteAlert}
              />
            ))}
          </View>
        )}
      </ScrollView>
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
  filterRow: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 4,
  },
  markAllButton: {
    alignSelf: "flex-start",
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#757575",
    textAlign: "center",
  },
});
