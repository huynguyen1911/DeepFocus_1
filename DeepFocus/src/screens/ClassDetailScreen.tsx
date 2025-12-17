import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  IconButton,
  Chip,
  Portal,
  Dialog,
  List,
  Divider,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";
import * as Clipboard from "expo-clipboard";

export default function ClassDetailScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentRole } = useRole();
  const {
    currentClass,
    loading,
    getClassDetails,
    regenerateCode,
    approveRequest,
    rejectRequest,
    removeMember,
    deleteClass,
  } = useClass();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const isTeacher = currentRole === "teacher";
  const isCreator = isTeacher; // If teacher and can access class details, they are the creator

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadClassDetails();
    } else if (!id || id === 'undefined') {
      Alert.alert(
        t("common.error"),
        t("classes.invalidClassId") || "Invalid class ID"
      );
      router.back();
    }
  }, [id]);

  const loadClassDetails = async () => {
    if (!id || id === 'undefined') return;
    
    try {
      await getClassDetails(id);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("classes.loadError")
      );
      router.back();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClassDetails();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (currentClass?.joinCode) {
      await Clipboard.setStringAsync(currentClass.joinCode);
      Alert.alert(t("common.success"), t("classes.codeCopied"));
    }
  };

  const handleRegenerateCode = async () => {
    Alert.alert(
      t("classes.regenerateCode"),
      t("classes.regenerateConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: async () => {
            try {
              await regenerateCode(id);
              Alert.alert(t("common.success"), t("classes.regenerateSuccess"));
            } catch (error: any) {
              Alert.alert(
                t("common.error"),
                error.response?.data?.message || t("classes.regenerateError")
              );
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (memberId: string) => {
    try {
      await approveRequest(id, memberId);
      Alert.alert(t("common.success"), t("classes.approveSuccess"));
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("classes.approveError")
      );
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      await rejectRequest(id, memberId);
      Alert.alert(t("common.success"), t("classes.rejectSuccess"));
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("classes.rejectError")
      );
    }
  };

  const handleRemoveMember = (member: any) => {
    setSelectedMember(member);
    setRemoveDialogVisible(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await removeMember(id, selectedMember._id || selectedMember);
      setRemoveDialogVisible(false);
      setSelectedMember(null);
      Alert.alert(t("common.success"), t("classes.removeSuccess"));
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("classes.removeError")
      );
    }
  };

  const handleDeleteClass = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDeleteClass = async () => {
    try {
      await deleteClass(id);
      setDeleteDialogVisible(false);
      Alert.alert(t("common.success"), t("classes.deleteSuccess"));
      router.back();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("classes.deleteError")
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getApprovedMembers = () => {
    return currentClass?.members?.filter((m: any) => m.status === "active") || [];
  };

  const getPendingMembers = () => {
    return currentClass?.members?.filter((m: any) => m.status === "pending") || [];
  };

  if (loading && !currentClass) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!currentClass) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t("classes.classNotFound")}</Text>
      </View>
    );
  }

  const approvedMembers = getApprovedMembers();
  const pendingMembers = getPendingMembers();

  return (
    <View style={styles.container}>
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
        {/* Class Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.className}>
              {currentClass.name}
            </Text>
            {currentClass.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {currentClass.description}
              </Text>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  {t("classes.members")}
                </Text>
                <Text variant="titleMedium">{approvedMembers.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  {t("classes.createdDate")}
                </Text>
                <Text variant="bodyMedium">
                  {formatDate(currentClass.createdAt)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                icon="chart-bar"
                onPress={() => router.push(`/classes/statistics/${id}`)}
                style={styles.actionButton}
              >
                {t("classes.viewStatistics")}
              </Button>
              <Button
                mode="contained"
                icon="trophy"
                onPress={() => router.push(`/classes/leaderboard/${id}`)}
                style={styles.actionButton}
              >
                {t("leaderboard.title")}
              </Button>
              <Button
                mode="contained"
                icon="account-group"
                onPress={() => router.push(`/classes/members/${id}`)}
                style={styles.actionButton}
              >
                {t("members.title")}
              </Button>
            </View>
            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                icon="gift"
                onPress={() => router.push(`/rewards/${id}`)}
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
              >
                Phần Thưởng & Phạt
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Join Code Card (Teacher Only) */}
        {isTeacher && currentClass.joinCode && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("classes.joinCode")}
              </Text>
              <View style={styles.joinCodeContainer}>
                <Text variant="displaySmall" style={styles.joinCode}>
                  {currentClass.joinCode}
                </Text>
                <View style={styles.codeActions}>
                  <Button
                    mode="outlined"
                    icon="content-copy"
                    onPress={handleCopyCode}
                  >
                    {t("classes.copyCode")}
                  </Button>
                  <Button
                    mode="outlined"
                    icon="refresh"
                    onPress={handleRegenerateCode}
                  >
                    {t("classes.regenerateCode")}
                  </Button>
                </View>
              </View>
              <Text variant="bodySmall" style={styles.expiryText}>
                {t("classes.codeExpiry")}:{" "}
                {formatDate(currentClass.joinCodeExpiry)}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Pending Requests (Teacher Only) */}
        {isTeacher && pendingMembers.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t("classes.pendingRequests")} ({pendingMembers.length})
              </Text>
            </Card.Content>
            {pendingMembers.map((member: any, index: number) => (
              <View key={member._id}>
                <List.Item
                  title={member.user?.focusProfile?.fullName || t("common.unknown")}
                  description={member.user?.email}
                  left={(props) => <List.Icon {...props} icon="account-clock" />}
                  right={() => (
                    <View style={styles.memberActions}>
                      <IconButton
                        icon="check"
                        iconColor={theme.colors.primary}
                        onPress={() => handleApprove(member.user._id)}
                      />
                      <IconButton
                        icon="close"
                        iconColor={theme.colors.error}
                        onPress={() => handleReject(member.user._id)}
                      />
                    </View>
                  )}
                />
                {index < pendingMembers.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
        )}

        {/* Members List */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t("classes.members")} ({approvedMembers.length})
            </Text>
          </Card.Content>
          {approvedMembers.length === 0 ? (
            <Card.Content>
              <Text style={styles.emptyText}>{t("classes.noMembers")}</Text>
            </Card.Content>
          ) : (
            approvedMembers.map((member: any, index: number) => {
              const isCreatorMember = member.role === "teacher";
              const fullName = member.user?.focusProfile?.fullName;
              const memberName = (fullName && fullName.trim()) || t("common.unknown");
              
              if (__DEV__) {
                console.log("🔍 Rendering member:", {
                  email: member.user?.email,
                  fullNameRaw: fullName,
                  fullNameType: typeof fullName,
                  fullNameLength: fullName?.length,
                  displayName: memberName
                });
              }
              
              return (
                <View key={member._id}>
                  <List.Item
                    title={memberName}
                    description={member.user?.email}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={isCreatorMember ? "account-star" : "account"}
                      />
                    )}
                    right={() => (
                      <View style={styles.memberRight}>
                        {isCreatorMember && (
                          <Chip mode="flat" compact>
                            {t("classes.creator")}
                          </Chip>
                        )}
                        {isTeacher && !isCreatorMember && (
                          <IconButton
                            icon="delete"
                            iconColor={theme.colors.error}
                            onPress={() => handleRemoveMember(member.user)}
                          />
                        )}
                      </View>
                    )}
                  />
                  {index < approvedMembers.length - 1 && <Divider />}
                </View>
              );
            })
          )}
        </Card>

        {/* Delete Button (Creator Only) */}
        {isCreator && (
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            style={styles.deleteButton}
            onPress={handleDeleteClass}
          >
            {t("classes.deleteClass")}
          </Button>
        )}
      </ScrollView>

      {/* Delete Class Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>{t("classes.deleteClass")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("classes.deleteConfirm")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={confirmDeleteClass}
              textColor={theme.colors.error}
            >
              {t("common.delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Remove Member Dialog */}
        <Dialog
          visible={removeDialogVisible}
          onDismiss={() => setRemoveDialogVisible(false)}
        >
          <Dialog.Icon icon="account-remove" />
          <Dialog.Title>{t("classes.removeMember")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("classes.removeConfirm")}</Text>
            {selectedMember && (
              <Text variant="bodyLarge" style={styles.memberName}>
                {selectedMember.focusProfile?.fullName || selectedMember.user?.focusProfile?.fullName}
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRemoveDialogVisible(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={confirmRemoveMember}
              textColor={theme.colors.error}
            >
              {t("common.remove")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  className: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  joinCodeContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  joinCode: {
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 4,
    marginBottom: 16,
  },
  codeActions: {
    flexDirection: "row",
    gap: 8,
  },
  expiryText: {
    textAlign: "center",
    opacity: 0.6,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: "30%",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.5,
  },
  deleteButton: {
    margin: 16,
    borderColor: "red",
  },
  memberName: {
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
});
