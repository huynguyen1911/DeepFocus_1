import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AssessmentIntroScreen = ({ navigation }) => {
  const steps = [
    {
      icon: "account-circle",
      title: "Về bạn",
      desc: "Vai trò và mục tiêu của bạn",
    },
    {
      icon: "clock-outline",
      title: "Thói quen",
      desc: "Thời gian học hiện tại",
    },
    {
      icon: "brain",
      title: "Phong cách",
      desc: "Cách bạn tập trung tốt nhất",
    },
    {
      icon: "target",
      title: "Mục tiêu",
      desc: "Điều bạn muốn đạt được",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hãy cho tôi biết về bạn! 👋</Text>
          <Text style={styles.headerSubtitle}>
            Để tạo kế hoạch học phù hợp nhất, tôi cần hiểu một chút về bạn thôi
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <MaterialCommunityIcons
                  name={step.icon}
                  size={32}
                  color="#667eea"
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
              {index < steps.length - 1 && (
                <View style={styles.stepConnector} />
              )}
            </View>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color="#10b981"
          />
          <Text style={styles.infoText}>
            Thông tin của bạn được bảo mật và chỉ dùng để cá nhân hóa trải
            nghiệm
          </Text>
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("Assessment", { step: 1 })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Text style={styles.startText}>Bắt đầu thôi!</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Để sau vậy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  stepConnector: {
    position: "absolute",
    left: 48,
    bottom: -16,
    width: 2,
    height: 16,
    backgroundColor: "#E5E7EB",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  infoText: {
    fontSize: 13,
    color: "#065F46",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  startButton: {
    width: "100%",
    marginBottom: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  startGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
    color: "#6B7280",
  },
});

export default AssessmentIntroScreen;
