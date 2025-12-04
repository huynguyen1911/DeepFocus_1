import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Menu, Text, Badge, ActivityIndicator } from "react-native-paper";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Colors } from "../../constants/theme";

const RoleSwitcher = () => {
  const { roles, currentRole, switchRole, addRole, loading } = useRole();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [menuVisible, setMenuVisible] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Get available role types that user doesn't have yet
  const availableRoleTypes = ["student", "teacher", "guardian"];
  const existingRoleTypes = roles.map((r) => r.type);
  const addableRoles = availableRoleTypes.filter(
    (type) => !existingRoleTypes.includes(type)
  );

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case "student":
        return "🧑‍🎓";
      case "teacher":
        return "👨‍🏫";
      case "guardian":
        return "👨‍👩‍👧";
      default:
        return "👤";
    }
  };

  const getRoleLabel = (roleType) => {
    return t(`roles.${roleType}`) || roleType;
  };

  const handleSwitchRole = async (roleType) => {
    if (roleType === currentRole) {
      closeMenu();
      return;
    }

    setSwitching(true);
    closeMenu();
    const result = await switchRole(roleType);
    setSwitching(false);

    if (!result.success) {
      // Error already handled by RoleContext
      console.error("Failed to switch role:", result.error);
    }
  };

  const handleAddRole = async (roleType) => {
    setSwitching(true);
    closeMenu();
    const result = await addRole(roleType);
    setSwitching(false);

    if (!result.success) {
      console.error("Failed to add role:", result.error);
    }
  };

  const currentRoleData = roles.find((r) => r.type === currentRole);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );
  }

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity
            style={styles.anchor}
            onPress={openMenu}
            disabled={switching}
          >
            <View
              style={[
                styles.roleButton,
                { backgroundColor: theme.background, borderColor: theme.tint },
              ]}
            >
              <Text style={styles.roleIcon}>{getRoleIcon(currentRole)}</Text>
              <Text style={[styles.roleText, { color: theme.text }]}>
                {getRoleLabel(currentRole)}
              </Text>
              {currentRoleData?.isPrimary && (
                <Badge
                  style={[styles.primaryBadge, { backgroundColor: theme.tint }]}
                  size={8}
                />
              )}
            </View>
          </TouchableOpacity>
        }
        contentStyle={[
          styles.menuContent,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={[styles.menuHeader, { borderBottomColor: theme.icon }]}>
          <Text style={[styles.menuTitle, { color: theme.icon }]}>
            {t("roles.switchRole")}
          </Text>
        </View>

        {roles.map((role) => (
          <Menu.Item
            key={role.type}
            onPress={() => handleSwitchRole(role.type)}
            title={getRoleLabel(role.type)}
            leadingIcon={() => (
              <Text style={styles.menuIcon}>{getRoleIcon(role.type)}</Text>
            )}
            trailingIcon={
              role.type === currentRole
                ? "check"
                : role.isPrimary
                ? "star"
                : undefined
            }
            style={[
              styles.menuItem,
              role.type === currentRole && {
                backgroundColor: theme.tint + "20",
              },
            ]}
            titleStyle={[
              styles.menuItemTitle,
              { color: theme.text },
              role.type === currentRole && {
                color: theme.tint,
                fontWeight: "600",
              },
            ]}
            disabled={switching}
          />
        ))}

        {addableRoles.length > 0 && (
          <>
            <View
              style={[styles.menuDivider, { backgroundColor: theme.icon }]}
            />
            <View
              style={[
                styles.menuHeader,
                { borderBottomWidth: 0, paddingVertical: 8 },
              ]}
            >
              <Text style={[styles.menuTitle, { color: theme.icon }]}>
                {t("roles.addNewRole") || "Thêm Role Mới"}
              </Text>
            </View>
            {addableRoles.map((roleType) => (
              <Menu.Item
                key={`add-${roleType}`}
                onPress={() => handleAddRole(roleType)}
                title={getRoleLabel(roleType)}
                leadingIcon={() => (
                  <Text style={styles.menuIcon}>{getRoleIcon(roleType)}</Text>
                )}
                trailingIcon="plus"
                style={styles.menuItem}
                titleStyle={[styles.menuItemTitle, { color: theme.text }]}
                disabled={switching}
              />
            ))}
          </>
        )}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  anchor: {
    borderRadius: 8,
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryBadge: {
    marginLeft: 6,
  },
  menuContent: {
    borderRadius: 8,
    minWidth: 200,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemTitle: {
    fontSize: 14,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  menuDivider: {
    height: 1,
    marginVertical: 8,
  },
});

export default RoleSwitcher;
