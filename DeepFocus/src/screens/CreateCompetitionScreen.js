import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useCompetitions } from "../contexts/CompetitionContext";
import { useLanguage } from "../contexts/LanguageContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const CreateCompetitionScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { createCompetition } = useCompetitions();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "individual",
    scope: "global",
    goalMetric: "total_pomodoros",
    goalTarget: "",
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    maxParticipants: "",
    prizes: [],
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const goalMetricOptions = [
    { value: "total_pomodoros", label: "Total Pomodoros", icon: "🍅" },
    { value: "total_focus_time", label: "Total Focus Time", icon: "⏰" },
    { value: "daily_consistency", label: "Daily Consistency", icon: "📅" },
    { value: "task_completion", label: "Tasks Completed", icon: "✅" },
    { value: "streak_length", label: "Streak Length", icon: "🔥" },
  ];

  const handleCreate = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a competition title");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (!formData.goalTarget || parseInt(formData.goalTarget) <= 0) {
      Alert.alert("Error", "Please enter a valid goal target");
      return;
    }

    if (formData.endDate <= formData.startDate) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    try {
      setIsCreating(true);

      const competitionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        scope: formData.scope,
        timing: {
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        },
        goal: {
          metric: formData.goalMetric,
          target: parseInt(formData.goalTarget),
          unit: formData.goalMetric.includes("time") ? "hours" : "count",
        },
        rules: {
          maxParticipants: formData.maxParticipants
            ? parseInt(formData.maxParticipants)
            : undefined,
          allowLateJoin: true,
        },
        prizes:
          formData.prizes.length > 0
            ? formData.prizes
            : [
                { rank: 1, title: "1st Place", points: 100, badge: "🥇" },
                { rank: 2, title: "2nd Place", points: 50, badge: "🥈" },
                { rank: 3, title: "3rd Place", points: 25, badge: "🥉" },
              ],
        visibility: "public",
        status: "draft",
      };

      const result = await createCompetition(competitionData);

      Alert.alert("Success! 🎉", "Competition created successfully", [
        {
          text: "View Competition",
          onPress: () => router.replace(`/competitions/${result._id}`),
        },
      ]);
    } catch (error) {
      console.error("Error creating competition:", error);
      Alert.alert("Error", error.message || "Failed to create competition");
    } finally {
      setIsCreating(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Create New Competition</Text>
      <Text style={styles.headerSubtitle}>
        Set up a competition to challenge and motivate participants
      </Text>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Competition Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., November Focus Challenge"
            value={formData.title}
            onChangeText={(text) => updateFormData("title", text)}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the competition goals and rules..."
            value={formData.description}
            onChangeText={(text) => updateFormData("description", text)}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>
      </View>

      {/* Competition Type Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competition Type</Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.type === "individual" && styles.optionCardActive,
            ]}
            onPress={() => updateFormData("type", "individual")}
          >
            <Text style={styles.optionIcon}>👤</Text>
            <Text style={styles.optionLabel}>Individual</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.type === "team" && styles.optionCardActive,
            ]}
            onPress={() => updateFormData("type", "team")}
          >
            <Text style={styles.optionIcon}>👥</Text>
            <Text style={styles.optionLabel}>Team</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scope Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scope</Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.scope === "global" && styles.optionCardActive,
            ]}
            onPress={() => updateFormData("scope", "global")}
          >
            <Text style={styles.optionIcon}>🌍</Text>
            <Text style={styles.optionLabel}>Global</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.scope === "class" && styles.optionCardActive,
            ]}
            onPress={() => updateFormData("scope", "class")}
          >
            <Text style={styles.optionIcon}>🎓</Text>
            <Text style={styles.optionLabel}>Class</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              formData.scope === "private" && styles.optionCardActive,
            ]}
            onPress={() => updateFormData("scope", "private")}
          >
            <Text style={styles.optionIcon}>🔒</Text>
            <Text style={styles.optionLabel}>Private</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Goal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competition Goal</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Metric *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {goalMetricOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.metricCard,
                    formData.goalMetric === option.value &&
                      styles.metricCardActive,
                  ]}
                  onPress={() => updateFormData("goalMetric", option.value)}
                >
                  <Text style={styles.metricIcon}>{option.icon}</Text>
                  <Text style={styles.metricLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 100"
            value={formData.goalTarget}
            onChangeText={(text) =>
              updateFormData("goalTarget", text.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Timing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timing</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(formData.startDate)}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={formData.startDate}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === "ios");
                if (selectedDate) {
                  updateFormData("startDate", selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === "ios");
                if (selectedDate) {
                  updateFormData("endDate", selectedDate);
                }
              }}
              minimumDate={formData.startDate}
            />
          )}
        </View>
      </View>

      {/* Optional Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optional Settings</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Participants (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Leave empty for unlimited"
            value={formData.maxParticipants}
            onChangeText={(text) =>
              updateFormData("maxParticipants", text.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreate}
          disabled={isCreating}
        >
          <Text style={styles.buttonText}>
            {isCreating ? "Creating..." : "🚀 Create Competition"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={isCreating}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DDD",
  },
  optionCardActive: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  metricCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DDD",
    minWidth: 100,
    marginRight: 8,
  },
  metricCardActive: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  dateButton: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  dateIcon: {
    fontSize: 20,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#DDD",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
});

export default CreateCompetitionScreen;
