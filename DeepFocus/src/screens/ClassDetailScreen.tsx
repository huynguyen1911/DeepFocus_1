import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  Text,
  useTheme,
  ActivityIndicator,
  Button,
  IconButton,
  Portal,
  Dialog,
  Divider,
  Surface,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Màu sắc cho class hero section (giống ClassListScreen)
const CLASS_COLORS = [
  ['#667eea', '#764ba2'], // Purple
  ['#f093fb', '#f5576c'], // Pink
  ['#4facfe', '#00f2fe'], // Blue
  ['#43e97b', '#38f9d7'], // Green
  ['#fa709a', '#fee140'], // Orange
  ['#30cfd0', '#330867'], // Teal
  ['#a8edea', '#fed6e3'], // Pastel
  ['#ff9a9e', '#fecfef'], // Rose
];

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

  // Helper functions
  const getClassColor = (name: string, index: number = 0) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash + index);
    const colorIndex = hash % CLASS_COLORS.length;
    return CLASS_COLORS[colorIndex];
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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
  const classColors = getClassColor(currentClass.name);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Background - Absolute Position */}
      <LinearGradient
        colors={classColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Decorative Icon - More subtle */}
        <View style={styles.heroDecoration}>
          <MaterialCommunityIcons 
            name="book-open-page-variant" 
            size={180} 
            color="rgba(255, 255, 255, 0.1)" 
          />
        </View>
      </LinearGradient>

      {/* Header Actions - Fixed on top */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {/* Settings */}}
        >
          <MaterialCommunityIcons name="cog-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Scrollable Content - Includes hero title */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* Hero Content - Will scroll with content */}
        <View style={styles.heroContent}>
          <Text variant="displaySmall" style={styles.heroTitle}>
            {currentClass.name}
          </Text>
          {isTeacher && currentClass.joinCode && (
            <Text variant="bodyLarge" style={styles.heroSubtitle}>
              Mã lớp: {currentClass.joinCode} • Ngày tạo: {formatDate(currentClass.createdAt)}
            </Text>
          )}
          {!isTeacher && (
            <Text variant="bodyLarge" style={styles.heroSubtitle}>
              {approvedMembers.length} thành viên • Ngày tạo: {formatDate(currentClass.createdAt)}
            </Text>
          )}
        </View>

        {/* White Container - Starts below hero */}
        <View style={styles.whiteContainer}>
          {/* Quick Actions Grid */}
          <Surface style={styles.actionsCard} elevation={0}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              BẢNG ĐIỀU KHIỂN
            </Text>
            
            <View style={styles.actionsGrid}>
              {/* Statistics */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/classes/statistics/${id}`)}
              >
                <MaterialCommunityIcons name="chart-bar" size={40} color="#667eea" />
                <Text variant="labelMedium" style={[styles.actionLabel, { color: '#667eea' }]}>
                  Thống Kê
                </Text>
              </TouchableOpacity>

              {/* Leaderboard */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/classes/leaderboard/${id}`)}
              >
                <MaterialCommunityIcons name="trophy" size={40} color="#FFB800" />
                <Text variant="labelMedium" style={[styles.actionLabel, { color: '#FFB800' }]}>
                  Xếp Hạng
                </Text>
              </TouchableOpacity>

              {/* Members */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/classes/members/${id}`)}
              >
                <MaterialCommunityIcons name="account-group" size={40} color="#4facfe" />
                <Text variant="labelMedium" style={[styles.actionLabel, { color: '#4facfe' }]}>
                  Thành Viên
                </Text>
              </TouchableOpacity>

              {/* Rewards */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => router.push(`/rewards/${id}`)}
              >
                <MaterialCommunityIcons name="gift" size={40} color="#FF9800" />
                <Text variant="labelMedium" style={[styles.actionLabel, { color: '#FF9800' }]}>
                  Thưởng & Phạt
                </Text>
              </TouchableOpacity>
            </View>
          </Surface>

        {/* Join Code Card (Teacher Only) */}
        {isTeacher && currentClass.joinCode && (
          <Surface style={styles.joinCodeCard} elevation={0}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              MÃ THAM GIA
            </Text>
            <View style={styles.joinCodeBox}>
              <Text variant="displaySmall" style={styles.joinCodeText}>
                {currentClass.joinCode}
              </Text>
              <View style={styles.joinCodeActions}>
                <TouchableOpacity 
                  style={styles.joinCodeButton}
                  onPress={handleCopyCode}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#667eea" />
                  <Text variant="labelMedium" style={styles.joinCodeButtonText}>
                    Sao chép
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.joinCodeButton}
                  onPress={handleRegenerateCode}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="#667eea" />
                  <Text variant="labelMedium" style={styles.joinCodeButtonText}>
                    Tạo mới
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text variant="bodySmall" style={styles.expiryText}>
              Hết hạn: {formatDate(currentClass.joinCodeExpiry)}
            </Text>
          </Surface>
        )}

        {/* Pending Requests (Teacher Only) */}
        {isTeacher && pendingMembers.length > 0 && (
          <Surface style={styles.membersCard} elevation={0}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              YÊU CẦU CHỜ DUYỆT ({pendingMembers.length})
            </Text>
            {pendingMembers.map((member: any, index: number) => (
              <View key={member._id}>
                <View style={styles.memberItem}>
                  <View style={styles.memberLeft}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FF9800' }]}>
                      <Text variant="titleMedium" style={styles.avatarText}>
                        {getInitials(member.user?.focusProfile?.fullName || 'Unknown')}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text variant="titleSmall" style={styles.memberName}>
                        {member.user?.focusProfile?.fullName || t("common.unknown")}
                      </Text>
                      <Text variant="bodySmall" style={styles.memberEmail}>
                        {member.user?.email}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={[styles.actionCircle, { backgroundColor: '#E8F5E9' }]}
                      onPress={() => handleApprove(member.user._id)}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionCircle, { backgroundColor: '#FFEBEE' }]}
                      onPress={() => handleReject(member.user._id)}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                {index < pendingMembers.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Surface>
        )}

        {/* Members List */}
        <Surface style={styles.membersCard} elevation={0}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            DANH SÁCH THÀNH VIÊN ({approvedMembers.length})
          </Text>
          {approvedMembers.length === 0 ? (
            <Text style={styles.emptyText}>{t("classes.noMembers")}</Text>
          ) : (
            approvedMembers.map((member: any, index: number) => {
              const isCreatorMember = member.role === "teacher";
              const fullName = member.user?.focusProfile?.fullName;
              const memberName = (fullName && fullName.trim()) || t("common.unknown");
              
              return (
                <View key={member._id}>
                  <View style={styles.memberItem}>
                    <View style={styles.memberLeft}>
                      {/* Avatar with Initials */}
                      <LinearGradient
                        colors={getClassColor(memberName, index)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.memberAvatar}
                      >
                        <Text variant="titleMedium" style={styles.avatarText}>
                          {getInitials(memberName)}
                        </Text>
                      </LinearGradient>
                      
                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text variant="titleSmall" style={styles.memberName}>
                            {memberName}
                          </Text>
                          {isCreatorMember && (
                            <View style={styles.creatorBadge}>
                              <Text variant="labelSmall" style={styles.creatorBadgeText}>
                                Giáo Viên
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text variant="bodySmall" style={styles.memberEmail}>
                          {member.user?.email}
                        </Text>
                      </View>
                    </View>
                    
                    {isTeacher && !isCreatorMember && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(member.user)}
                      >
                        <MaterialCommunityIcons name="delete-outline" size={22} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {index < approvedMembers.length - 1 && <Divider style={styles.divider} />}
                </View>
              );
            })
          )}
        </Surface>

        {/* Delete Button (Creator Only) */}
        {isCreator && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteClass}
          >
            <MaterialCommunityIcons name="delete-outline" size={22} color="#F44336" />
            <Text variant="labelLarge" style={styles.deleteButtonText}>
              {t("classes.deleteClass")}
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={{ height: 40 }} />
        </View>
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
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F5F5F5',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    overflow: 'hidden',
  },
  heroDecoration: {
    position: 'absolute',
    right: -30,
    top: 100,
    opacity: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  whiteContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 10,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionLabel: {
    color: '#757575',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    aspectRatio: 1.1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  actionLabel: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  joinCodeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  joinCodeBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  joinCodeText: {
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: 4,
    marginBottom: 20,
  },
  joinCodeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  joinCodeButtonText: {
    color: '#667eea',
    fontWeight: '500',
  },
  expiryText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 8,
  },
  membersCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontWeight: '600',
    color: '#212121',
  },
  memberEmail: {
    color: '#757575',
    fontSize: 13,
  },
  creatorBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creatorBadgeText: {
    color: '#1976D2',
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    padding: 8,
  },
  divider: {
    marginVertical: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9E9E9E',
    paddingVertical: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFEBEE',
    backgroundColor: '#FFFFFF',
  },
  deleteButtonText: {
    color: '#F44336',
    fontWeight: '600',
  },
});
