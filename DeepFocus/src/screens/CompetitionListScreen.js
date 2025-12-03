import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useCompetitions } from "../contexts/CompetitionContext";
import { useLanguage } from "../contexts/LanguageContext";

const CompetitionListScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    competitions,
    myCompetitions,
    isLoading,
    fetchCompetitions,
    fetchMyCompetitions,
  } = useCompetitions();

  const [activeTab, setActiveTab] = useState("browse"); // browse, myCompetitions
  const [filter, setFilter] = useState("active");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, filter]);

  const loadData = async () => {
    if (activeTab === "browse") {
      await fetchCompetitions({ status: filter });
    } else {
      await fetchMyCompetitions(filter === "all" ? null : filter);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCompetitionPress = (competitionId) => {
    router.push(`/competitions/${competitionId}`);
  };

  const handleCreatePress = () => {
    router.push("/competitions/create");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "upcoming":
        return "#FF9800";
      case "completed":
        return "#9E9E9E";
      default:
        return "#757575";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "🔥";
      case "upcoming":
        return "⏰";
      case "completed":
        return "✅";
      default:
        return "📋";
    }
  };

  const getScopeIcon = (scope) => {
    switch (scope) {
      case "global":
        return "🌍";
      case "class":
        return "🎓";
      case "private":
        return "🔒";
      default:
        return "📊";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const renderCompetition = ({ item }) => {
    const { competition, userEntry, isJoined, canJoin } = item;
    const daysRemaining = getDaysRemaining(competition.timing.endDate);
    const isActive = competition.status === "active";

    return (
      <TouchableOpacity
        style={styles.competitionCard}
        onPress={() => handleCompetitionPress(competition._id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.competitionTitle} numberOfLines={2}>
              {competition.title}
            </Text>
            {competition.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐</Text>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(competition.status) + "20" },
              ]}
            >
              <Text style={styles.badgeIcon}>
                {getStatusIcon(competition.status)}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(competition.status) },
                ]}
              >
                {competition.status.toUpperCase()}
              </Text>
            </View>

            <View style={styles.scopeBadge}>
              <Text style={styles.badgeIcon}>
                {getScopeIcon(competition.scope)}
              </Text>
              <Text style={styles.scopeText}>{competition.scope}</Text>
            </View>

            {competition.type === "team" && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>👥 TEAM</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {competition.description}
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Goal</Text>
            <Text style={styles.metricValue}>
              {competition.goal.target}{" "}
              {competition.goal.metric.replace(/_/g, " ")}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Participants</Text>
            <Text style={styles.metricValue}>
              {competition.statistics.totalParticipants}
              {competition.rules.maxParticipants &&
                ` / ${competition.rules.maxParticipants}`}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.timeRemaining}>
            <Text style={styles.timeIcon}>⏱️</Text>
            <Text style={styles.timeText}>
              {daysRemaining === 0
                ? "Ends today"
                : `${daysRemaining} day${
                    daysRemaining > 1 ? "s" : ""
                  } remaining`}
            </Text>
          </View>
        )}

        {userEntry && (
          <View style={styles.userProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressValue}>
                Rank #{userEntry.rank?.current || "-"}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${userEntry.progress.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {userEntry.progress.currentValue} / {userEntry.progress.target} (
              {Math.round(userEntry.progress.percentage)}%)
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {formatDate(competition.timing.startDate)} -{" "}
            {formatDate(competition.timing.endDate)}
          </Text>

          {isJoined ? (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>✓ Joined</Text>
            </View>
          ) : (
            canJoin && (
              <View style={styles.canJoinBadge}>
                <Text style={styles.canJoinText}>📝 Open</Text>
              </View>
            )
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "browse" && styles.tabActive]}
          onPress={() => setActiveTab("browse")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "browse" && styles.tabTextActive,
            ]}
          >
            Browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "myCompetitions" && styles.tabActive,
          ]}
          onPress={() => setActiveTab("myCompetitions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "myCompetitions" && styles.tabTextActive,
            ]}
          >
            My Competitions
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {["active", "upcoming", "completed", "all"].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption && styles.filterTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const displayData = activeTab === "browse" ? competitions : myCompetitions;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading competitions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayData}
        renderItem={renderCompetition}
        keyExtractor={(item) =>
          activeTab === "browse"
            ? item.competition._id
            : item.competition._id || item._id
        }
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>
              {activeTab === "browse"
                ? "No competitions available"
                : "You haven't joined any competitions yet"}
            </Text>
            {activeTab === "browse" && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreatePress}
              >
                <Text style={styles.createButtonText}>
                  + Create Competition
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {activeTab === "browse" && (
        <TouchableOpacity style={styles.fab} onPress={handleCreatePress}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#FFF",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
  },
  competitionCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  competitionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  featuredBadge: {
    marginLeft: 8,
  },
  featuredText: {
    fontSize: 20,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  badgeIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  scopeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#E3F2FD",
    gap: 4,
  },
  scopeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1976D2",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#FFF3E0",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#F57C00",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
  },
  metric: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  timeRemaining: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  timeIcon: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
  },
  userProgress: {
    padding: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007AFF",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  joinedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  canJoinBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
  },
  canJoinText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#FFF",
    fontWeight: "300",
  },
});

export default CompetitionListScreen;
