import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Avatar,
  ActivityIndicator,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { roles, currentRole, switchRole, addRole, loading } = useRole();
  const { t } = useLanguage();
  const [switching, setSwitching] = useState(false);

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case "student":
        return "school";
      case "teacher":
        return "human-male-board";
      case "guardian":
        return "account-group";
      default:
        return "account";
    }
  };

  const getRoleLabel = (roleType) => {
    if (roleType === "teacher") {
      return "Giáo viên / Phụ huynh";
    }
    if (roleType === "student") {
      return "Học Sinh";
    }
    return t(`roles.${roleType}`) || roleType;
  };

  const getRoleDescription = (roleType) => {
    switch (roleType) {
      case "student":
        return "Tập trung học tập với Pomodoro Timer";
      case "teacher":
        return "Quản lý lớp học và giám sát học sinh";
      default:
        return "";
    }
  };

  const handleSwitchRole = async (roleType) => {
    if (roleType === currentRole) {
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Chuyển Vai Trò",
      `Bạn có chắc muốn chuyển sang vai trò ${getRoleLabel(roleType)}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Chuyển",
          onPress: async () => {
            setSwitching(true);
            const result = await switchRole(roleType);
            setSwitching(false);

            if (result.success) {
              Alert.alert(
                "Thành Công",
                `Đã chuyển sang vai trò ${getRoleLabel(roleType)}`,
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleAddRole = async (roleType) => {
    Alert.alert(
      "Thêm Vai Trò",
      `Bạn có muốn thêm vai trò ${getRoleLabel(roleType)}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Thêm",
          onPress: async () => {
            setSwitching(true);
            const result = await addRole(roleType);
            setSwitching(false);

            if (result.success) {
              Alert.alert(
                "Thành Công",
                `Đã thêm vai trò ${getRoleLabel(roleType)}`,
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const allRoleTypes = ["student", "teacher"];
  const existingRoleTypes = roles.map((r) => r.type);

  const handleRolePress = async (roleType) => {
    const roleExists = existingRoleTypes.includes(roleType);

    if (roleExists) {
      // Switch to existing role
      handleSwitchRole(roleType);
    } else {
      // Add and switch to new role
      handleAddRole(roleType);
    }
  };

  const formatUserName = (name) => {
    if (!name) return "User";
    // Capitalize each word
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getUserInitials = (name) => {
    if (!name) return "TE";
    const words = name
      .trim()
      .split(" ")
      .filter((word) => word.length > 0);

    if (words.length === 1) {
      // Single word: take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words: take first letter of first and last word
      const firstInitial = words[0].charAt(0).toUpperCase();
      const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
      return firstInitial + lastInitial;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F2F2F7" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Clean Header */}
        <View
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.headerButton}
            android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: false }}
          >
            <Text
              style={[styles.headerButtonText, { color: theme.colors.primary }]}
            >
              ‹
            </Text>
          </Pressable>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Hồ Sơ
          </Text>
          <Pressable
            onPress={() => {
              Alert.alert("Chỉnh sửa", "Tính năng đang phát triển");
            }}
            style={styles.headerButton}
            android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: false }}
          >
            <Text
              style={[styles.headerButtonText, { color: theme.colors.primary }]}
            >
              Sửa
            </Text>
          </Pressable>
        </View>

        {/* Hero Section - Avatar + Name + Email */}
        <View style={styles.heroSection}>
          <Avatar.Text
            size={100}
            label={getUserInitials(user?.username)}
            style={{
              backgroundColor: theme.colors.primary,
              marginBottom: 16,
              borderWidth: 3,
              borderColor: "#fff",
            }}
            labelStyle={{ fontWeight: "700", fontSize: 36 }}
          />
          <Text variant="headlineMedium" style={styles.userName}>
            {formatUserName(user?.username) || "Test User 1"}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}
          >
            {user?.email || "test1@example.com"}
          </Text>
        </View>

        {/* Role Section Header */}
        <Text variant="labelSmall" style={styles.sectionHeader}>
          VAI TRÒ HIỆN TẠI
        </Text>

        {/* Role Selection List */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          {allRoleTypes.map((roleType, index) => {
            const isActive = existingRoleTypes.includes(roleType);
            const isCurrent = roleType === currentRole;

            return (
              <React.Fragment key={roleType}>
                <Pressable
                  onPress={() => handleRolePress(roleType)}
                  disabled={switching || isCurrent}
                  android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                  style={({ pressed }) => [
                    styles.roleRow,
                    pressed && { backgroundColor: "rgba(0,0,0,0.03)" },
                  ]}
                >
                  <View style={styles.roleRowLeft}>
                    <Text style={styles.roleIcon}>
                      {roleType === "student" ? "🎓" : "🧑‍🏫"}
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={[
                        styles.roleLabel,
                        isCurrent && {
                          color: theme.colors.primary,
                          fontWeight: "500",
                        },
                        !isActive && { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {getRoleLabel(roleType)}
                    </Text>
                  </View>
                  {isCurrent && (
                    <Text
                      style={[
                        styles.checkmark,
                        { color: theme.colors.primary },
                      ]}
                    >
                      ✓
                    </Text>
                  )}
                </Pressable>
                {index < allRoleTypes.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: "#E5E5EA" }]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 32,
    fontWeight: "400",
    lineHeight: 32,
  },
  headerTitle: {
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  userName: {
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#666",
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  roleRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  roleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  roleLabel: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 22,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
});

export default ProfileScreen;
