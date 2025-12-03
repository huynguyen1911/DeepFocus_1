import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCompetitions } from "../contexts/CompetitionContext";
import { useLanguage } from "../contexts/LanguageContext";

const CompetitionDetailScreen = () => {
  const router = useRouter();
  const { competitionId } = useLocalSearchParams();
  const { t } = useLanguage();
  const {
    currentCompetition,
    leaderboard,
    isLoading,
    getCompetitionDetail,
    getLeaderboard,
    joinCompetition,
    leaveCompetition,
    claimPrize,
    endCompetition,
  } = useCompetitions();

  const [competitionData, setCompetitionData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [competitionId]);

  const loadData = async () => {
    try {
      const [detail, leaderboardResult] = await Promise.all([
        getCompetitionDetail(competitionId),
        getLeaderboard(competitionId, { limit: 10 }),
      ]);
      setCompetitionData(detail);
      setLeaderboardData(leaderboardResult);
    } catch (error) {
      console.error("Error loading competition:", error);
      Alert.alert("Error", "Failed to load competition details");
    }
  };

  const handleJoin = async () => {
    Alert.alert(
      "Join Competition",
      "Are you sure you want to join this competition?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join",
          onPress: async () => {
            try {
              setIsJoining(true);
              await joinCompetition(competitionId);
              await loadData();
              Alert.alert("Success", "You have joined the competition!");
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Failed to join competition"
              );
            } finally {
              setIsJoining(false);
            }
          },
        },
      ]
    );
  };

  const handleLeave = async () => {
    Alert.alert(
      "Leave Competition",
      "Are you sure you want to leave this competition? Your progress will be saved but you cannot rejoin.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLeaving(true);
              await leaveCompetition(competitionId);
              await loadData();
              Alert.alert("Success", "You have left the competition");
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Failed to leave competition"
              );
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleClaimPrize = async () => {
    try {
      const prize = await claimPrize(competitionId);
      Alert.alert(
        "Prize Claimed! 🎉",
        `You received:\n• ${prize.title}\n• ${prize.points} points${
          prize.badge ? `\n• Badge: ${prize.badge}` : ""
        }`
      );
      await loadData();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to claim prize");
    }
  };

  const handleEndCompetition = async () => {
    Alert.alert(
      "End Competition",
      "Are you sure you want to end this competition? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End",
          style: "destructive",
          onPress: async () => {
            try {
              await endCompetition(competitionId);
              Alert.alert("Success", "Competition ended successfully");
              await loadData();
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Failed to end competition"
              );
            }
          },
        },
      ]
    );
  };

  const handleViewFullLeaderboard = () => {
    router.push(`/competitions/${competitionId}/leaderboard`);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (isLoading || !competitionData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading competition...</Text>
      </View>
    );
  }

  const {
    competition,
    userEntry,
    isJoined,
    canJoin,
    canJoinReason,
    topParticipants,
    isCreator,
  } = competitionData;
  const daysRemaining = getDaysRemaining(competition.timing.endDate);
  const isActive = competition.status === "active";
  const isCompleted = competition.status === "completed";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{competition.title}</Text>
          {competition.featured && <Text style={styles.featuredIcon}>⭐</Text>}
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(competition.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(competition.status) },
            ]}
          >
            {competition.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.description}>{competition.description}</Text>

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
      </View>

      {/* User Progress (if joined) */}
      {isJoined && userEntry && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.userProgressCard}>
            <View style={styles.rankRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>
                  #{userEntry.rank?.current || "-"}
                </Text>
                <Text style={styles.rankLabel}>Current Rank</Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userEntry.progress.currentValue}
                  </Text>
                  <Text style={styles.statLabel}>Progress</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round(userEntry.progress.percentage)}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
              </View>
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
              {userEntry.progress.currentValue} / {userEntry.progress.target}
            </Text>

            {userEntry.prize && !userEntry.prize.claimed && (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={handleClaimPrize}
              >
                <Text style={styles.claimButtonText}>
                  🎁 Claim Prize: {userEntry.prize.title}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Competition Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competition Details</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🎯 Goal</Text>
            <Text style={styles.detailValue}>
              {competition.goal.target}{" "}
              {competition.goal.metric.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🌍 Scope</Text>
            <Text style={styles.detailValue}>
              {competition.scope.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👥 Type</Text>
            <Text style={styles.detailValue}>
              {competition.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Start Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(competition.timing.startDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏁 End Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(competition.timing.endDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👤 Participants</Text>
            <Text style={styles.detailValue}>
              {competition.statistics.totalParticipants}
              {competition.rules.maxParticipants &&
                ` / ${competition.rules.maxParticipants}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Prizes */}
      {competition.prizes && competition.prizes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prizes</Text>
          <View style={styles.prizesCard}>
            {competition.prizes.map((prize) => (
              <View key={prize.rank} style={styles.prizeRow}>
                <View style={styles.prizeRank}>
                  <Text style={styles.prizeRankText}>#{prize.rank}</Text>
                </View>
                <View style={styles.prizeInfo}>
                  <Text style={styles.prizeTitle}>{prize.title}</Text>
                  {prize.description && (
                    <Text style={styles.prizeDescription}>
                      {prize.description}
                    </Text>
                  )}
                  <View style={styles.prizeRewards}>
                    {prize.points > 0 && (
                      <Text style={styles.prizeReward}>
                        💰 {prize.points} pts
                      </Text>
                    )}
                    {prize.badge && (
                      <Text style={styles.prizeReward}>🎖️ {prize.badge}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Leaderboard Preview */}
      {leaderboardData && leaderboardData.entries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <TouchableOpacity onPress={handleViewFullLeaderboard}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderboardCard}>
            {leaderboardData.entries.slice(0, 5).map((entry, index) => (
              <View key={entry._id} style={styles.leaderboardRow}>
                <View style={styles.leaderboardRank}>
                  <Text style={styles.leaderboardRankText}>
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
                  </Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>
                    {entry.user?.name || "Unknown"}
                  </Text>
                  <View style={styles.leaderboardProgress}>
                    <View style={styles.miniProgressBar}>
                      <View
                        style={[
                          styles.miniProgressFill,
                          { width: `${entry.progress.percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.leaderboardValue}>
                      {entry.progress.currentValue}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!isJoined && canJoin && (
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={handleJoin}
            disabled={isJoining}
          >
            <Text style={styles.buttonText}>
              {isJoining ? "Joining..." : "🚀 Join Competition"}
            </Text>
          </TouchableOpacity>
        )}

        {!isJoined && !canJoin && (
          <View style={styles.cannotJoinBadge}>
            <Text style={styles.cannotJoinText}>❌ {canJoinReason}</Text>
          </View>
        )}

        {isJoined && isActive && (
          <TouchableOpacity
            style={[styles.button, styles.leaveButton]}
            onPress={handleLeave}
            disabled={isLeaving}
          >
            <Text style={styles.leaveButtonText}>
              {isLeaving ? "Leaving..." : "Leave Competition"}
            </Text>
          </TouchableOpacity>
        )}

        {isCreator && isActive && (
          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={handleEndCompetition}
          >
            <Text style={styles.buttonText}>End Competition</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  header: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  featuredIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 12,
  },
  timeRemaining: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  userProgressCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  rankRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  rankBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  rankLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statsGrid: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#EEE",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  claimButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    alignItems: "center",
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  prizesCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  prizeRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  prizeRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  prizeRankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  prizeInfo: {
    flex: 1,
  },
  prizeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  prizeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  prizeRewards: {
    flexDirection: "row",
    gap: 12,
  },
  prizeReward: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "600",
  },
  leaderboardCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  leaderboardRank: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  leaderboardProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#EEE",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  leaderboardValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    width: 40,
    textAlign: "right",
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButton: {
    backgroundColor: "#4CAF50",
  },
  leaveButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF5252",
  },
  endButton: {
    backgroundColor: "#FF5252",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5252",
  },
  cannotJoinBadge: {
    paddingVertical: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    alignItems: "center",
  },
  cannotJoinText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D32F2F",
  },
});

export default CompetitionDetailScreen;
