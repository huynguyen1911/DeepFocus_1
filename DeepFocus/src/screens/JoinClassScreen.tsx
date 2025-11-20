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
} from "react-native-paper";
import { router } from "expo-router";
import { useClass } from "../contexts/ClassContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function JoinClassScreen() {
  const theme = useTheme();
  const { t } = useLanguage();
  const { joinClass, loading } = useClass();

  const [joinCode, setJoinCode] = useState("");
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);

  const handleJoinCodeChange = (text: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleaned.length <= 6) {
      setJoinCode(cleaned);
    }
  };

  const handleJoin = async () => {
    if (joinCode.length !== 6) {
      Alert.alert(t("common.error"), t("classes.codeInvalid"));
      return;
    }

    try {
      await joinClass(joinCode);
      setSuccessDialogVisible(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      let displayMessage = t("classes.joinError");

      if (errorMessage?.includes("invalid") || errorMessage?.includes("not found")) {
        displayMessage = t("classes.invalidCode");
      } else if (errorMessage?.includes("expired")) {
        displayMessage = t("classes.codeExpired");
      } else if (errorMessage?.includes("already")) {
        displayMessage = t("classes.alreadyMember");
      }

      Alert.alert(t("common.error"), displayMessage);
    }
  };

  const handleDone = () => {
    setSuccessDialogVisible(false);
    setJoinCode("");
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            {t("classes.joinClass")}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t("classes.joinClassDescription")}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              label={t("classes.joinCode")}
              value={joinCode}
              onChangeText={handleJoinCodeChange}
              mode="outlined"
              style={styles.input}
              placeholder="ABC123"
              autoCapitalize="characters"
              maxLength={6}
              textAlign="center"
              keyboardType="default"
            />
            <Text variant="bodySmall" style={styles.charCounter}>
              {joinCode.length}/6
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.helperText}>
            {t("classes.joinCodeHelper")}
          </Text>

          <Button
            mode="contained"
            onPress={handleJoin}
            loading={loading}
            disabled={loading || joinCode.length !== 6}
            style={styles.button}
            icon="login"
          >
            {t("classes.join")}
          </Button>

          <View style={styles.infoBox}>
            <Text variant="bodySmall" style={styles.infoText}>
              💡 {t("classes.joinClassInfo")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={successDialogVisible}
          onDismiss={handleDone}
          style={styles.dialog}
        >
          <Dialog.Icon icon="clock-outline" size={64} />
          <Dialog.Title style={styles.dialogTitle}>
            {t("classes.joinSuccess")}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogContent}>
              <Text variant="bodyMedium" style={styles.dialogText}>
                {t("classes.joinSuccessMessage")}
              </Text>
              <View style={styles.statusBox}>
                <Text variant="titleMedium" style={styles.statusText}>
                  {t("classes.statusPending")}
                </Text>
                <Text variant="bodySmall" style={styles.statusDescription}>
                  {t("classes.pendingDescription")}
                </Text>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
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
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: "bold",
  },
  charCounter: {
    textAlign: "right",
    opacity: 0.5,
    marginTop: 4,
  },
  helperText: {
    marginBottom: 24,
    opacity: 0.6,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    opacity: 0.8,
    lineHeight: 20,
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
  statusBox: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  statusText: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#F57C00",
  },
  statusDescription: {
    textAlign: "center",
    opacity: 0.7,
  },
});
