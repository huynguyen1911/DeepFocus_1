import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  useTheme,
  Text,
  Portal,
  Dialog,
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

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("classes.nameRequired"));
      return;
    }

    try {
      const result = await createClass({
        name: name.trim(),
        description: description.trim(),
      });

      if (result?.success) {
        setCreatedClass(result.class);
        setSuccessDialogVisible(true);
      } else {
        throw new Error(result?.error || t("classes.createError"));
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || error.message || t("classes.createError")
      );
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
            loading={loading}
            disabled={loading || !name.trim()}
            style={styles.button}
          >
            {t("classes.create")}
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={successDialogVisible}
          onDismiss={handleDone}
          style={styles.dialog}
        >
          <Dialog.Icon icon="check-circle" size={64} />
          <Dialog.Title style={styles.dialogTitle}>
            {t("classes.createSuccess")}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <Text variant="bodyMedium" style={styles.dialogText}>
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
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCopyCode}>{t("classes.copyCode")}</Button>
            <Button onPress={handleDone} mode="contained">
              {t("common.done")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  dialog: {
    maxWidth: 400,
    alignSelf: "center",
  },
  dialogTitle: {
    textAlign: "center",
  },
  dialogContent: {
    alignItems: "center",
  },
  dialogText: {
    textAlign: "center",
    marginBottom: 16,
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
  },
});
