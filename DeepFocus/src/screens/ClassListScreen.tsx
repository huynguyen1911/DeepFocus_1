import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  Card,
  Text,
  FAB,
  useTheme,
  ActivityIndicator,
  Chip,
  IconButton,
} from "react-native-paper";
import { router } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function ClassListScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { currentRole } = useRole();
  const { classes, loading, loadClasses } = useClass();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadClasses();
  }, [currentRole]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const handleFABPress = () => {
    if (currentRole === "teacher") {
      router.push("/classes/create");
    } else if (currentRole === "student") {
      router.push("/classes/join");
    }
  };

  const handleClassPress = (classId: string) => {
    router.push(`/classes/${classId}`);
  };

  const getMemberStatus = (members: any[]) => {
    const approved = members?.filter((m) => m.status === "active").length || 0;
    const pending = members?.filter((m) => m.status === "pending").length || 0;
    return { approved, pending };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading && classes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
        {classes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {t("classes.noClasses")}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {t("classes.noClassesDescription")}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {classes.map((classItem: any) => {
              const { approved, pending } = getMemberStatus(
                classItem.members
              );
              const isTeacher = currentRole === "teacher";

              return (
                <Card
                  key={classItem._id}
                  style={styles.classCard}
                  onPress={() => handleClassPress(classItem._id)}
                >
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <Text variant="titleMedium" style={styles.className}>
                          {classItem.name}
                        </Text>
                        {isTeacher && (
                          <Chip
                            mode="flat"
                            compact
                            style={styles.creatorChip}
                            textStyle={styles.chipText}
                          >
                            {t("classes.creator")}
                          </Chip>
                        )}
                      </View>
                      <IconButton
                        icon="chevron-right"
                        size={24}
                        onPress={() => handleClassPress(classItem._id)}
                      />
                    </View>

                    {classItem.description && (
                      <Text
                        variant="bodyMedium"
                        numberOfLines={2}
                        style={styles.description}
                      >
                        {classItem.description}
                      </Text>
                    )}

                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text variant="labelSmall" style={styles.statLabel}>
                          {t("classes.members")}
                        </Text>
                        <Text variant="bodyLarge" style={styles.statValue}>
                          {approved}
                        </Text>
                      </View>

                      {isTeacher && pending > 0 && (
                        <View style={styles.statItem}>
                          <Text variant="labelSmall" style={styles.statLabel}>
                            {t("classes.pendingRequests")}
                          </Text>
                          <Text
                            variant="bodyLarge"
                            style={[
                              styles.statValue,
                              { color: theme.colors.error },
                            ]}
                          >
                            {pending}
                          </Text>
                        </View>
                      )}

                      <View style={styles.statItem}>
                        <Text variant="labelSmall" style={styles.statLabel}>
                          {isTeacher
                            ? t("classes.createdDate")
                            : t("classes.joinedDate")}
                        </Text>
                        <Text variant="bodyMedium" style={styles.statValue}>
                          {formatDate(classItem.createdAt)}
                        </Text>
                      </View>
                    </View>

                    {isTeacher && classItem.joinCode && (
                      <View style={styles.joinCodeContainer}>
                        <Text variant="labelSmall" style={styles.joinCodeLabel}>
                          {t("classes.joinCode")}:
                        </Text>
                        <Text variant="titleMedium" style={styles.joinCode}>
                          {classItem.joinCode}
                        </Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <FAB
        icon={currentRole === "teacher" ? "plus" : "login"}
        label={
          currentRole === "teacher"
            ? t("classes.createClass")
            : t("classes.joinClass")
        }
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleFABPress}
      />
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
  },
  classCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  className: {
    fontWeight: "bold",
  },
  creatorChip: {
    height: 24,
  },
  chipText: {
    fontSize: 11,
  },
  description: {
    marginBottom: 12,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: "600",
  },
  joinCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    gap: 8,
  },
  joinCodeLabel: {
    opacity: 0.6,
  },
  joinCode: {
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
