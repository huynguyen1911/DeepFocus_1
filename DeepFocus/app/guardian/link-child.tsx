import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  useTheme,
  Snackbar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useGuardian } from "@/src/contexts/GuardianContext";
import { ThemedView } from "@/components/themed-view";

export default function LinkChildScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { sendLinkRequest } = useGuardian();

  const [childIdentifier, setChildIdentifier] = useState("");
  const [relation, setRelation] = useState("parent");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const handleSendRequest = async () => {
    if (!childIdentifier.trim()) {
      setSnackbar({
        visible: true,
        message: "Vui lòng nhập tên tài khoản hoặc email",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const result = await sendLinkRequest(childIdentifier, relation, notes);
    setLoading(false);

    if (result.success) {
      setSnackbar({
        visible: true,
        message: "Đã gửi yêu cầu liên kết thành công!",
        type: "success",
      });
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      setSnackbar({
        visible: true,
        message: result.error || "Có lỗi xảy ra, vui lòng thử lại",
        type: "error",
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineSmall" style={styles.title}>
          Liên kết con em
        </Text>
        <Text style={styles.description}>
          Nhập tên tài khoản hoặc email của con em để gửi yêu cầu liên kết.
          Con em sẽ nhận được thông báo và có thể chấp nhận hoặc từ chối.
        </Text>

        <TextInput
          label="Tên tài khoản hoặc Email"
          value={childIdentifier}
          onChangeText={setChildIdentifier}
          mode="outlined"
          style={styles.input}
          placeholder="ví dụ: nguyen_van_a hoặc email@example.com"
          autoCapitalize="none"
          disabled={loading}
        />

        <Text style={styles.label}>Quan hệ</Text>
        <SegmentedButtons
          value={relation}
          onValueChange={setRelation}
          buttons={[
            {
              value: "parent",
              label: "Phụ huynh",
              icon: "account-heart",
            },
            {
              value: "tutor",
              label: "Gia sư",
              icon: "teach",
            },
            {
              value: "guardian",
              label: "Người giám hộ",
              icon: "account-supervisor",
            },
          ]}
          style={styles.segmented}
          disabled={loading}
        />

        <TextInput
          label="Ghi chú (không bắt buộc)"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          style={styles.input}
          placeholder="Ví dụ: Tôi là mẹ của em"
          multiline
          numberOfLines={3}
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleSendRequest}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Gửi yêu cầu
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Hủy
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{
          backgroundColor:
            snackbar.type === "success"
              ? theme.colors.primary
              : theme.colors.error,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  segmented: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  cancelButton: {
    marginTop: 8,
  },
});
