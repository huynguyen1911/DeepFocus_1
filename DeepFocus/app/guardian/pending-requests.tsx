import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
  Chip,
  useTheme,
} from "react-native-paper";
import { useGuardian } from "@/src/contexts/GuardianContext";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function PendingRequestsScreen() {
  const theme = useTheme();
  const { pendingRequests, loading, error, loadPendingRequests, respondToRequest } =
    useGuardian();

  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingRequests();
    setRefreshing(false);
  };

  const handleRespond = async (requestId: string, action: "accept" | "reject") => {
    setProcessingId(requestId);
    const result = await respondToRequest(requestId, action);
    setProcessingId(null);

    if (result.success) {
      // Request is automatically removed from list by GuardianContext
    } else {
      alert(result.error || "Có lỗi xảy ra");
    }
  };

  const getRelationLabel = (relation: string) => {
    switch (relation) {
      case "parent":
        return "Phụ huynh";
      case "tutor":
        return "Gia sư";
      case "guardian":
        return "Người giám hộ";
      default:
        return relation;
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang tải yêu cầu...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Text style={{ color: theme.colors.error, marginBottom: 16 }}>
          {error}
        </Text>
        <Button mode="contained" onPress={loadPendingRequests}>
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
        {pendingRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <ThemedText style={styles.emptyText}>
              Không có yêu cầu liên kết nào
            </ThemedText>
            <Text style={styles.emptySubtext}>
              Khi có người muốn liên kết với bạn, yêu cầu sẽ hiện ở đây
            </Text>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            <Text style={styles.headerText}>
              Bạn có {pendingRequests.length} yêu cầu liên kết
            </Text>
            {pendingRequests.map((request) => (
              <Card key={request._id} style={styles.requestCard}>
                <Card.Content>
                  <View style={styles.requestHeader}>
                    <View style={{ flex: 1 }}>
                      <Title>{request.guardian?.username || "Người dùng"}</Title>
                      <Paragraph>
                        {request.guardian?.email || request.guardian?.phone || ""}
                      </Paragraph>
                    </View>
                    <Chip icon="account-heart" style={styles.relationChip}>
                      {getRelationLabel(request.relation)}
                    </Chip>
                  </View>

                  {request.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Lời nhắn:</Text>
                      <Text style={styles.notesText}>"{request.notes}"</Text>
                    </View>
                  )}

                  <Text style={styles.dateText}>
                    Gửi lúc:{" "}
                    {new Date(request.requestedAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>

                  <View style={styles.actionsRow}>
                    <Button
                      mode="contained"
                      onPress={() => handleRespond(request._id, "accept")}
                      loading={processingId === request._id}
                      disabled={processingId !== null}
                      style={{ flex: 1, marginRight: 8 }}
                      icon="check"
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleRespond(request._id, "reject")}
                      loading={processingId === request._id}
                      disabled={processingId !== null}
                      style={{ flex: 1 }}
                      icon="close"
                    >
                      Từ chối
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
  requestsContainer: {
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    opacity: 0.8,
  },
  requestCard: {
    marginBottom: 16,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  relationChip: {
    marginTop: 4,
  },
  notesSection: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.7,
  },
  notesText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
  },
});
