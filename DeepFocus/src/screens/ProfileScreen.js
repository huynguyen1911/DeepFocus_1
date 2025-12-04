import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Text,
  Avatar,
  Divider,
  List,
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
      return "Teacher/Guardian";
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          iconColor={theme.colors.onSurface}
        />
        <Text variant="headlineSmall" style={{ flex: 1, marginLeft: 8 }}>
          Hồ Sơ Người Dùng
        </Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.userInfoContainer}>
          <Avatar.Text
            size={80}
            label={user?.username?.substring(0, 2).toUpperCase() || "U"}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.userDetails}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.username || "User"}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {user?.email || ""}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* All Roles Section */}
      <Card style={styles.card}>
        <Card.Title
          title="Vai Trò"
          titleVariant="titleMedium"
          left={(props) => (
            <Avatar.Icon {...props} icon="account-badge" size={40} />
          )}
        />
        <Divider />
        <Card.Content style={{ paddingTop: 8 }}>
          {allRoleTypes.map((roleType) => {
            const isActive = existingRoleTypes.includes(roleType);
            const isCurrent = roleType === currentRole;

            return (
              <TouchableOpacity
                key={roleType}
                onPress={() => handleRolePress(roleType)}
                disabled={switching || isCurrent}
              >
                <List.Item
                  title={getRoleLabel(roleType)}
                  description={
                    isActive
                      ? getRoleDescription(roleType)
                      : "Nhấn để kích hoạt vai trò này"
                  }
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={getRoleIcon(roleType)}
                      color={
                        isCurrent
                          ? theme.colors.primary
                          : isActive
                          ? theme.colors.onSurfaceVariant
                          : theme.colors.outline
                      }
                    />
                  )}
                  right={(props) =>
                    isCurrent ? (
                      <List.Icon
                        {...props}
                        icon="check-circle"
                        color={theme.colors.primary}
                      />
                    ) : !isActive ? (
                      <List.Icon
                        {...props}
                        icon="plus-circle-outline"
                        color={theme.colors.outline}
                      />
                    ) : null
                  }
                  style={[
                    styles.roleItem,
                    isCurrent && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                    !isActive && {
                      opacity: 0.6,
                    },
                  ]}
                  titleStyle={[
                    isCurrent && {
                      color: theme.colors.primary,
                      fontWeight: "600",
                    },
                    !isActive && {
                      color: theme.colors.outline,
                    },
                  ]}
                  descriptionStyle={
                    !isActive && {
                      color: theme.colors.outline,
                      fontStyle: "italic",
                    }
                  }
                />
              </TouchableOpacity>
            );
          })}
        </Card.Content>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  roleItem: {
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default ProfileScreen;
