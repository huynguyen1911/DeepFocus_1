import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  ActivityIndicator,
  Text,
  Chip,
  IconButton,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useGuardian } from "@/src/contexts/GuardianContext";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function GuardianDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    linkedChildren,
    dashboardData,
    loading,
    error,
    loadLinkedChildren,
    loadDashboard,
  } = useGuardian();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([loadLinkedChildren("accepted"), loadDashboard()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải dữ liệu...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Text style={{ color: theme.colors.error, marginBottom: 16 }}>
          {error}
        </Text>
        <Button mode="contained" onPress={loadInitialData}>
          Thử lại
        </Button>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Family Summary Card */}
        {dashboardData && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Tổng quan gia đình</Title>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Tổng Pomodoros</Text>
                  <Text style={styles.summaryValue}>
                    {dashboardData.totalWeekPomodoros}
                  </Text>
                  <Text style={styles.summarySubtext}>tuần này</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Trung bình</Text>
                  <Text style={styles.summaryValue}>
                    {dashboardData.averagePomodoros.toFixed(1)}
                  </Text>
                  <Text style={styles.summarySubtext}>mỗi con</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Số con em</Text>
                  <Text style={styles.summaryValue}>
                    {dashboardData.childrenCount}
                  </Text>
                  <Text style={styles.summarySubtext}>đã liên kết</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Children List */}
        {linkedChildren.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Chưa có con em nào được liên kết
            </ThemedText>
            <Button
              mode="contained"
              onPress={() => router.push("/guardian/link-child")}
              style={{ marginTop: 16 }}
            >
              Liên kết con em
            </Button>
          </View>
        ) : (
          <View style={styles.childrenContainer}>
            {linkedChildren.map((child) => (
              <Card key={child._id} style={styles.childCard}>
                <Card.Content>
                  <View style={styles.childHeader}>
                    <View style={{ flex: 1 }}>
                      <Title>{child.username}</Title>
                      <Paragraph>
                        {child.email || child.phone || ""}
                      </Paragraph>
                    </View>
                    {child.currentStreak > 0 && (
                      <Chip icon="fire" style={styles.streakChip}>
                        {child.currentStreak} ngày
                      </Chip>
                    )}
                  </View>

                  {/* Today's Progress */}
                  <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>Hôm nay</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(
                              (child.todayPomodoros / (child.dailyGoal || 8)) *
                                100,
                              100
                            )}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {child.todayPomodoros} / {child.dailyGoal || 8} Pomodoros
                    </Text>
                  </View>

                  {/* Week Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{child.weekPomodoros}</Text>
                      <Text style={styles.statLabel}>Tuần này</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{child.classesCount}</Text>
                      <Text style={styles.statLabel}>Lớp học</Text>
                    </View>
                  </View>

                  {/* Recent Alert */}
                  {child.recentAlert && (
                    <View style={styles.alertSection}>
                      <Text style={styles.alertText} numberOfLines={2}>
                        📢 {child.recentAlert}
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    <Button
                      mode="outlined"
                      onPress={() =>
                        router.push(`/guardian/child-detail/${child._id}`)
                      }
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      Xem chi tiết
                    </Button>
                    <IconButton
                      icon="gift"
                      mode="contained"
                      onPress={() => {
                        // TODO: Navigate to give reward
                        console.log("Give reward to", child._id);
                      }}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB for adding child */}
      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => router.push("/guardian/link-child")}
        label="Liên kết"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 4,
  },
  summarySubtext: {
    fontSize: 11,
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  childrenContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  childCard: {
    marginBottom: 16,
    elevation: 2,
  },
  childHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  streakChip: {
    marginTop: 4,
  },
  progressSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  alertSection: {
    backgroundColor: "#FFF3E0",
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  alertText: {
    fontSize: 12,
    color: "#E65100",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
