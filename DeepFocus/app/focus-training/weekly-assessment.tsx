/**
 * Weekly Assessment Screen
 * Quick weekly check-in with AI feedback
 */

// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import focusTrainingApi from "../../src/services/focusTrainingApi";

const QUESTIONS = [
  {
    id: "focusLevel",
    question: "How would you rate your focus this week?",
    type: "slider",
    icon: "🎯",
    min: 1,
    max: 10,
  },
  {
    id: "progressFeeling",
    question: "How do you feel about your progress?",
    type: "choice",
    icon: "📈",
    options: [
      { value: "excellent", label: "Excellent - Exceeded goals" },
      { value: "good", label: "Good - Met goals" },
      { value: "okay", label: "Okay - Some progress" },
      { value: "struggling", label: "Struggling - Need help" },
    ],
  },
  {
    id: "challengesDifficulty",
    question: "How were the challenges this week?",
    type: "choice",
    icon: "💪",
    options: [
      { value: "too_easy", label: "Too Easy" },
      { value: "just_right", label: "Just Right" },
      { value: "challenging", label: "Challenging but doable" },
      { value: "too_hard", label: "Too Hard" },
    ],
  },
  {
    id: "improvements",
    question: "What improvements have you noticed?",
    type: "text",
    icon: "✨",
    placeholder: "e.g., Better concentration, less distracted...",
  },
  {
    id: "struggles",
    question: "What are you struggling with?",
    type: "text",
    icon: "🤔",
    placeholder: "e.g., Hard to maintain streak, too tired...",
  },
];

export default function WeeklyAssessmentScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleResponse = (value) => {
    setResponses({ ...responses, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (!responses[currentQuestion.id]) {
      Alert.alert("Required", "Please answer this question to continue");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const assessmentData = {
        ...responses,
        weekNumber: 1, // TODO: Get actual week number from active plan
        submittedAt: new Date().toISOString(),
      };

      const response = await focusTrainingApi.submitWeeklyAssessment(
        assessmentData
      );
      setResult(response.data);
    } catch (error) {
      Alert.alert(
        "Submission Failed",
        error.message || "Failed to submit assessment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient colors={["#10b981", "#059669"]} style={styles.header}>
          <Text style={styles.resultIcon}>✅</Text>
          <Text style={styles.resultTitle}>Assessment Complete!</Text>
          <Text style={styles.resultSubtitle}>
            Focus Score: {result.focusScore}/100
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 AI Feedback</Text>
          <Text style={styles.feedbackText}>{result.aiFeedback}</Text>
        </View>

        {result.improvement !== undefined && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📈 Progress</Text>
            <Text
              style={[
                styles.improvementText,
                { color: result.improvement >= 0 ? "#10b981" : "#f59e0b" },
              ]}
            >
              {result.improvement >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(result.improvement)} points since last assessment
            </Text>
          </View>
        )}

        {result.recommendations && result.recommendations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💡 Recommendations</Text>
            {result.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/focus-training/progress")}
          >
            <Text style={styles.primaryButtonText}>View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/focus-training/calendar")}
          >
            <Text style={styles.secondaryButtonText}>Back to Calendar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.headerContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentStep + 1} of {QUESTIONS.length}
        </Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        <Text style={styles.questionIcon}>{currentQuestion.icon}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* Answer Input */}
        {currentQuestion.type === "slider" && (
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={currentQuestion.min}
              maximumValue={currentQuestion.max}
              step={1}
              value={responses[currentQuestion.id] || 5}
              onValueChange={(value) => handleResponse(value)}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#6366f1"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>{currentQuestion.min}</Text>
              <Text style={styles.sliderValue}>
                {responses[currentQuestion.id] || 5}
              </Text>
              <Text style={styles.sliderLabel}>{currentQuestion.max}</Text>
            </View>
          </View>
        )}

        {currentQuestion.type === "choice" && (
          <View style={styles.choicesContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.choiceButton,
                  responses[currentQuestion.id] === option.value &&
                    styles.choiceButtonSelected,
                ]}
                onPress={() => handleResponse(option.value)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    responses[currentQuestion.id] === option.value &&
                      styles.choiceTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentQuestion.type === "text" && (
          <TextInput
            style={styles.textInput}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={responses[currentQuestion.id] || ""}
            onChangeText={(text) => handleResponse(text)}
          />
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            loading && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? "Submit" : "Next →"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  questionIcon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 32,
  },
  sliderContainer: {
    paddingVertical: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366f1",
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  choiceButtonSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  choiceText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  choiceTextSelected: {
    color: "#6366f1",
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#111827",
    minHeight: 120,
    textAlignVertical: "top",
  },
  navigationButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  backButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: "#d1fae5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  improvementText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#6366f1",
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6366f1",
  },
  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "600",
  },
});
