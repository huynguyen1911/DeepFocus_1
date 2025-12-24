import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Avatar,
  Chip,
  IconButton,
  Button,
  Menu,
  Portal,
  Dialog,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ClassMembersScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentRole } = useRole();
  const {
    currentClass,
    loading,
    getClassDetails,
    approveRequest,
    rejectRequest,
    removeMember,
  } = useClass();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const isTeacher = currentRole === "teacher";

  const loadMembers = useCallback(async () => {
    if (!id || id === 'undefined') {
      Alert.alert(
        t("common.error"),
        t("classes.invalidClassId") || "Invalid class ID"
      );
      router.back();
      return;
    }
    
    try {
      await getClassDetails(id);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("members.loadError")
      );
      router.back();
    }
  }, [id, getClassDetails, t]);

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  }, [loadMembers]);

  const handleApprove = useCallback(async (memberId: string) => {
    try {
      await approveRequest(id, memberId);
      Alert.alert(t("common.success"), t("members.approveSuccess"));
      await loadMembers();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("members.approveError")
      );
    }
  }, [id, approveRequest, loadMembers, t]);

  const handleReject = useCallback(async (memberId: string) => {
    Alert.alert(
      t("members.rejectRequest"),
      t("members.rejectConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await rejectRequest(id, memberId);
              Alert.alert(t("common.success"), t("members.rejectSuccess"));
              await loadMembers();
            } catch (error: any) {
              Alert.alert(
                t("common.error"),
                error.message || t("members.rejectError")
              );
            }
          },
        },
      ]
    );
  }, [id, rejectRequest, loadMembers, t]);

  const handleRemove = useCallback(async () => {
    if (!selectedMember) return;

    try {
      await removeMember(id, selectedMember._id);
      Alert.alert(t("common.success"), t("members.removeSuccess"));
      setRemoveDialogVisible(false);
      setSelectedMember(null);
      await loadMembers();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("members.removeError")
      );
    }
  }, [id, selectedMember, removeMember, loadMembers, t]);

  const openRemoveDialog = useCallback((member: any) => {
    setSelectedMember(member);
    setRemoveDialogVisible(true);
    setMenuVisible(null);
  }, []);

  const openMenu = useCallback((memberId: string) => setMenuVisible(memberId), []);
  const closeMenu = useCallback(() => setMenuVisible(null), []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return theme.colors.primary;
      case "pending":
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  }, [theme.colors]);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "active":
        return t("members.statusActive");
      case "pending":
        return t("members.statusPending");
      default:
        return status;
    }
  }, [t]);

  const getInitials = useCallback((user: any) => {
    const fullName = user.focusProfile?.fullName;
    const username = user.username;
    
    if (fullName) {
      // Handle "Không xác định" specifically
      if (fullName.toLowerCase().includes('không xác định') || fullName.toLowerCase().includes('unknown')) {
        return "KX";
      }
      
      const names = fullName.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    
    // Default fallback for truly unknown users
    return "KX";
  }, []);

  const capitalizeWords = useCallback((text: string) => {
    if (!text) return text;
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  const renderMemberItem = (member: any, isPending: boolean = false) => {
    const user = member.user || member.userId || member;
    const canManage = isTeacher && member.role !== "teacher";
    const isOnline = member.status === "active";

    return (
      <Card key={member._id} style={styles.memberCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.memberInfo}>
            {/* Avatar with Online Indicator */}
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={50}
                label={getInitials(user)}
                style={{ backgroundColor: theme.colors.primary }}
              />
              {isOnline && !isPending && (
                <View style={styles.onlineIndicator} />
              )}
            </View>

            {/* Member Details */}
            <View style={styles.memberDetails}>
              <Text variant="titleMedium" style={styles.memberName}>
                {capitalizeWords(user.focusProfile?.fullName || user.username || t("common.unknown"))}
              </Text>
              {user.email && (
                <Text variant="bodySmall" style={styles.memberEmail}>
                  {user.email}
                </Text>
              )}
            </View>

            {/* Role Badge */}
            <View style={styles.badgeContainer}>
              {member.role === "teacher" && (
                <Chip
                  compact
                  mode="flat"
                  style={styles.roleChip}
                  textStyle={styles.roleChipText}
                >
                  {t("members.roleTeacher")}
                </Chip>
              )}
            </View>
          </View>

          {/* Actions */}
          {isPending && isTeacher ? (
            <View style={styles.actionsContainer}>
              <IconButton
                icon="check"
                iconColor={theme.colors.primary}
                size={24}
                onPress={() => handleApprove(member._id)}
              />
              <IconButton
                icon="close"
                iconColor={theme.colors.error}
                size={24}
                onPress={() => handleReject(member._id)}
              />
            </View>
          ) : canManage ? (
            <Menu
              visible={menuVisible === member._id}
              onDismiss={closeMenu}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => openMenu(member._id)}
                />
              }
            >
              <Menu.Item
                leadingIcon="account-remove"
                onPress={() => openRemoveDialog(member)}
                title={t("members.removeMember")}
              />
            </Menu>
          ) : null}
        </Card.Content>
      </Card>
    );
  };

  const approvedMembers = useMemo(
    () => currentClass?.members?.filter((m: any) => m.status === "active") || [],
    [currentClass?.members]
  );

  const pendingMembers = useMemo(
    () => currentClass?.members?.filter((m: any) => m.status === "pending") || [],
    [currentClass?.members]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          {t("members.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="headlineSmall" style={styles.title}>
          {t("members.title")}
        </Text>
        <View style={{ width: 48 }} />
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
        {/* Pending Requests */}
        {isTeacher && pendingMembers.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t("members.pendingRequests")} ({pendingMembers.length})
            </Text>
            {pendingMembers.map((member: any) => renderMemberItem(member, true))}
          </View>
        )}

        {/* Active Members */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("members.membersList")} ({approvedMembers.length})
          </Text>
          {approvedMembers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={64}
                  color={theme.colors.outline}
                />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  {t("members.noMembers")}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            approvedMembers.map((member: any) => renderMemberItem(member, false))
          )}
        </View>
      </ScrollView>

      {/* Remove Member Dialog */}
      <Portal>
        <Dialog
          visible={removeDialogVisible}
          onDismiss={() => {
            setRemoveDialogVisible(false);
            setSelectedMember(null);
          }}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>{t("members.removeMember")}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {t("members.removeConfirm", {
                name: selectedMember?.userId?.focusProfile?.fullName || 
                      selectedMember?.userId?.username || 
                      t("common.thisMember"),
              })}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setRemoveDialogVisible(false);
                setSelectedMember(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              onPress={handleRemove}
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
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  section: {
    padding: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 16,
  },
  memberCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberDetails: {
    flex: 1,
    justifyContent: "center",
  },
  memberName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },
  memberEmail: {
    color: "#666",
    fontSize: 13,
  },
  badgeContainer: {
    marginLeft: 8,
  },
  roleChip: {
    height: 28,
    backgroundColor: "#E3F2FD",
    paddingVertical: 0,
  },
  roleChipText: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 6,
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: "bold",
    color: "#666",
  },
});
