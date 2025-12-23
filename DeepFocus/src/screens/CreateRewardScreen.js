import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  useTheme,
  ActivityIndicator,
  Menu,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useReward } from "../contexts/RewardContext";
import { useClass } from "../contexts/ClassContext";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";

/**
 * CreateRewardScreen - Form to create rewards/penalties
 * Phase 3 Frontend Session 2
 */
export default function CreateRewardScreen() {
  const theme = useTheme();
  const { classId } = useLocalSearchParams();
  const { user } = useAuth();
  const { currentRole } = useRole();
  const { createReward, isLoading } = useReward();
  const { classes, loadClasses } = useClass();

  const [formData, setFormData] = useState({
    classId: classId || "",
    studentId: "",
    reason: "",
    points: "",
    category: "other",
  });

  const [errors, setErrors] = useState({});
  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [studentMenuVisible, setStudentMenuVisible] = useState(false);
  const [students, setStudents] = useState([]);

  // Check permission - only teacher/guardian can create rewards
  useEffect(() => {
    if (currentRole !== "teacher" && currentRole !== "guardian") {
      Alert.alert(
        "Không có quyền",
        "Chỉ giáo viên và phụ huynh mới có thể tạo phần thưởng.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [currentRole]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      loadStudentsForClass(formData.classId);
    }
  }, [formData.classId]);

  const loadStudentsForClass = (selectedClassId) => {
    const selectedClass = classes.find((c) => c._id === selectedClassId);
    if (selectedClass && selectedClass.members) {
      // Filter only active students
      const activeStudents = selectedClass.members.filter(
        (m) => m.status === "active" && m.userId
      );
      setStudents(activeStudents);
    } else {
      setStudents([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.classId) {
      newErrors.classId = "Vui lòng chọn lớp học";
    }

    if (!formData.studentId) {
      newErrors.studentId = "Vui lòng chọn học sinh";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Vui lòng nhập lý do";
    }

    const points = parseInt(formData.points);
    if (isNaN(points) || points === 0) {
      newErrors.points = "Điểm phải là số khác 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const rewardData = {
      classId: formData.classId,
      studentId: formData.studentId,
      reason: formData.reason.trim(),
      points: parseInt(formData.points),
      category: formData.category,
    };

    const success = await createReward(rewardData);

    if (success) {
      Alert.alert(
        "Thành công",
        formData.points > 0 ? "Đã tạo phần thưởng" : "Đã tạo phạt",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert("Lỗi", "Không thể tạo phần thưởng. Vui lòng thử lại.");
    }
  };

  const getSelectedClassName = () => {
    if (!formData.classId) return "Chọn lớp học";
    const selectedClass = classes.find((c) => c._id === formData.classId);
    return selectedClass?.name || "Chọn lớp học";
  };

  const getSelectedStudentName = () => {
    if (!formData.studentId) return "Chọn học sinh";
    const selectedStudent = students.find(
      (s) => s.userId._id === formData.studentId
    );
    return (
      selectedStudent?.userId.fullName ||
      selectedStudent?.userId.username ||
      "Chọn học sinh"
    );
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "academic":
        return "Học tập";
      case "behavior":
        return "Hành vi";
      case "attendance":
        return "Chuyên cần";
      default:
        return "Khác";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Thông tin cơ bản
            </Text>

            {/* Class Selector */}
            <Menu
              visible={classMenuVisible}
              onDismiss={() => setClassMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setClassMenuVisible(true)}
                  icon="school"
                  style={styles.selectorButton}
                  contentStyle={styles.selectorButtonContent}
                >
                  {getSelectedClassName()}
                </Button>
              }
            >
              {classes.map((classItem) => (
                <Menu.Item
                  key={classItem._id}
                  onPress={() => {
                    handleInputChange("classId", classItem._id);
                    handleInputChange("studentId", ""); // Reset student when class changes
                    setClassMenuVisible(false);
                  }}
                  title={classItem.name}
                />
              ))}
            </Menu>
            {errors.classId && (
              <Text style={styles.errorText}>{errors.classId}</Text>
            )}

            {/* Student Selector */}
            <Menu
              visible={studentMenuVisible}
              onDismiss={() => setStudentMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStudentMenuVisible(true)}
                  icon="account"
                  style={styles.selectorButton}
                  contentStyle={styles.selectorButtonContent}
                  disabled={!formData.classId}
                >
                  {getSelectedStudentName()}
                </Button>
              }
            >
              {students.length === 0 ? (
                <Menu.Item title="Không có học sinh" disabled />
              ) : (
                students.map((student) => (
                  <Menu.Item
                    key={student.userId._id}
                    onPress={() => {
                      handleInputChange("studentId", student.userId._id);
                      setStudentMenuVisible(false);
                    }}
                    title={student.userId.fullName || student.userId.username}
                  />
                ))
              )}
            </Menu>
            {errors.studentId && (
              <Text style={styles.errorText}>{errors.studentId}</Text>
            )}

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Nội dung
            </Text>

            {/* Reason Input */}
            <TextInput
              label="Lý do *"
              value={formData.reason}
              onChangeText={(value) => handleInputChange("reason", value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="VD: Hoàn thành bài tập đầy đủ, Đi học đúng giờ..."
              error={!!errors.reason}
              style={styles.input}
            />
            {errors.reason && (
              <Text style={styles.errorText}>{errors.reason}</Text>
            )}

            {/* Points Input */}
            <TextInput
              label="Điểm *"
              value={formData.points}
              onChangeText={(value) => handleInputChange("points", value)}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Số dương = thưởng, Số âm = phạt"
              error={!!errors.points}
              style={styles.input}
              right={
                <TextInput.Affix
                  text={
                    formData.points
                      ? parseInt(formData.points) > 0
                        ? "🏆 Thưởng"
                        : "⚠️ Phạt"
                      : ""
                  }
                />
              }
            />
            {errors.points && (
              <Text style={styles.errorText}>{errors.points}</Text>
            )}

            {/* Category Selector */}
            <Text variant="bodyMedium" style={styles.label}>
              Danh mục
            </Text>
            <SegmentedButtons
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              buttons={[
                {
                  value: "academic",
                  label: "Học tập",
                  icon: "book-open-variant",
                },
                {
                  value: "behavior",
                  label: "Hành vi",
                  icon: "account-heart",
                },
                {
                  value: "attendance",
                  label: "Chuyên cần",
                  icon: "calendar-check",
                },
                {
                  value: "other",
                  label: "Khác",
                  icon: "star",
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Tạo
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
  },
  selectorButton: {
    marginBottom: 12,
    justifyContent: "flex-start",
  },
  selectorButtonContent: {
    justifyContent: "flex-start",
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    color: "#757575",
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  errorText: {
    color: "#B71C1C",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 12,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
