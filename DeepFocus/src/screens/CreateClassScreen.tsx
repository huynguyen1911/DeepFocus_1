import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  useTheme,
  Text,
  IconButton,
} from "react-native-paper";
import { router } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useLanguage } from "../contexts/LanguageContext";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from "expo-clipboard";

export default function CreateClassScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { createClass, loading } = useClass();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [createdClass, setCreatedClass] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  // Debug dialog visibility
  useEffect(() => {
    console.log("📱 Dialog visibility changed:", successDialogVisible);
    console.log("📱 Created class:", createdClass?.joinCode);
  }, [successDialogVisible, createdClass]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("classes.nameRequired"));
      return;
    }

    // Prevent duplicate calls - check ref first
    if (isCreatingRef.current || isCreating) {
      console.log("⚠️ Create class already in progress, ignoring duplicate call");
      return;
    }

    try {
      isCreatingRef.current = true;
      setIsCreating(true);
      console.log("🔵 Starting class creation...");
      
      const result = await createClass({
        name: name.trim(),
        description: description.trim(),
      });

      if (result?.success) {
        console.log("✅ Class created successfully:", result.class?.id);
        setCreatedClass(result.class);
        
        // Use setTimeout to ensure state updates complete before showing dialog
        setTimeout(() => {
          console.log("📱 Showing success dialog");
          setSuccessDialogVisible(true);
        }, 100);
      } else {
        throw new Error(result?.error || t("classes.createError"));
      }
    } catch (error: any) {
      console.error("❌ Create class error:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || error.message || t("classes.createError")
      );
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
      console.log("🔵 Class creation finished");
    }
  };

  const handleCopyCode = async () => {
    if (createdClass?.joinCode) {
      await Clipboard.setStringAsync(createdClass.joinCode);
      Alert.alert(t("common.success"), t("classes.codeCopied"));
    }
  };

  const handleDone = () => {
    setSuccessDialogVisible(false);
    router.back();
  };

  const formatExpiryDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Custom Header with Close Button */}
      <View style={styles.customHeader}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => router.back()}
          style={styles.closeButton}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Vector Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
              <MaterialCommunityIcons name="school" size={64} color="#667eea" />
            </View>
          </View>

          <Text variant="headlineMedium" style={styles.title}>
            Tạo Lớp Mới
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Nhập thông tin để bắt đầu quản lý lớp học của bạn
          </Text>

          {/* Soft UI Input Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialCommunityIcons name="book-outline" size={24} color="#667eea" />
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                mode="flat"
                style={styles.input}
                placeholder="Nhập tên lớp..."
                maxLength={100}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>

            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <View style={[styles.inputIconContainer, styles.textAreaIconContainer]}>
                <MaterialCommunityIcons name="text" size={24} color="#667eea" />
              </View>
              <TextInput
                value={description}
                onChangeText={setDescription}
                mode="flat"
                style={[styles.input, styles.textArea]}
                contentStyle={styles.textAreaContent}
                placeholder="Mô tả ngắn gọn..."
                multiline
                numberOfLines={3}
                maxLength={500}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Gradient CTA Button */}
          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={!name.trim() ? ['#d0d0d0', '#b0b0b0'] : ['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.gradientButton,
                !name.trim() && styles.gradientButtonDisabled
              ]}
            >
              <Button
                mode="text"
                onPress={handleCreate}
                loading={isCreating || loading}
                disabled={isCreating || loading || !name.trim()}
                style={styles.buttonInner}
                labelStyle={styles.buttonLabel}
              >
                {isCreating || loading ? 'ĐANG TẠO...' : 'TẠO LỚP NGAY'}
              </Button>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={successDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDone}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <IconButton
              icon="check-circle"
              size={64}
              iconColor={theme.colors.primary}
              style={styles.modalIcon}
            />
            
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {t("classes.createSuccess")}
            </Text>

            <Text variant="bodyMedium" style={styles.modalText}>
              {t("classes.classCreatedMessage")}
            </Text>

            <View style={styles.joinCodeBox}>
              <Text variant="labelMedium" style={styles.joinCodeLabel}>
                {t("classes.joinCode")}
              </Text>
              <View style={styles.joinCodeRow}>
                <Text variant="displaySmall" style={styles.joinCode}>
                  {createdClass?.joinCode}
                </Text>
                <IconButton
                  icon="content-copy"
                  size={24}
                  onPress={handleCopyCode}
                />
              </View>
              <Text variant="bodySmall" style={styles.expiryText}>
                {t("classes.codeExpiry")}:{" "}
                {createdClass?.joinCodeExpiry &&
                  formatExpiryDate(createdClass.joinCodeExpiry)}
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.shareText}>
              {t("classes.shareCodeMessage")}
            </Text>

            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={handleCopyCode}
                style={styles.actionButton}
              >
                {t("classes.copyCode")}
              </Button>
              <Button 
                mode="contained" 
                onPress={handleDone}
                style={styles.actionButton}
              >
                {t("common.done")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
    textAlign: 'center',
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  textAreaWrapper: {
    minHeight: 120,
  },
  inputIconContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAreaIconContainer: {
    paddingTop: 16,
    justifyContent: 'flex-start',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingRight: 16,
  },
  textArea: {
    paddingTop: 16,
    paddingBottom: 12,
    minHeight: 120,
  },
  textAreaContent: {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  buttonContainer: {
    marginTop: 8,
  },
  gradientButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.15,
  },
  buttonInner: {
    margin: 0,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: "100%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIcon: {
    margin: 0,
  },
  modalTitle: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "bold",
  },
  modalText: {
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.8,
  },
  joinCodeBox: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  joinCodeLabel: {
    opacity: 0.6,
    marginBottom: 8,
  },
  joinCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  joinCode: {
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  expiryText: {
    marginTop: 8,
    opacity: 0.6,
  },
  shareText: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
