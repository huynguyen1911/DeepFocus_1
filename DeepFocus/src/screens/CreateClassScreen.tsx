import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            {t("classes.createClass")}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t("classes.createClassDescription")}
          </Text>

          <TextInput
            label={t("classes.className")}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder={t("classes.classNamePlaceholder")}
            maxLength={100}
          />

          <TextInput
            label={t("classes.description")}
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            placeholder={t("classes.descriptionPlaceholder")}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text variant="bodySmall" style={styles.helperText}>
            {t("classes.createClassHelper")}
          </Text>

          <Button
            mode="contained"
            onPress={handleCreate}
            loading={isCreating || loading}
            disabled={isCreating || loading || !name.trim()}
            style={styles.button}
          >
            {t("classes.create")}
          </Button>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  helperText: {
    marginBottom: 24,
    opacity: 0.6,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
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
