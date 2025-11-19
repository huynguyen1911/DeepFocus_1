import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
  ActivityIndicator,
  useTheme,
  Divider,
  Snackbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const LoginScreen = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { login, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t("login.emailRequired");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("auth.invalidEmail");
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("login.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.passwordTooShort");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (result.success) {
        // Navigation handled by AuthContext
        console.log("✅ Login successful, navigating to home");
      } else {
        // Handle specific error codes
        if (
          result.error &&
          result.error.includes("Email hoặc mật khẩu không chính xác")
        ) {
          setSnackbarMessage(t("auth.invalidCredentials"));
        } else {
          setSnackbarMessage(result.error || t("auth.loginError"));
        }
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setSnackbarMessage(t("auth.networkError"));
      setSnackbarVisible(true);
    }
  };

  // Handle navigation to register
  const handleNavigateToRegister = () => {
    router.push("/register");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Title style={[styles.title, { color: theme.colors.primary }]}>
              DeepFocus
            </Title>
            <Paragraph style={styles.subtitle}>{t("login.subtitle")}</Paragraph>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.formTitle}>{t("auth.login")}</Title>

              {/* Global Error */}
              {error && (
                <HelperText
                  type="error"
                  visible={!!error}
                  style={styles.globalError}
                >
                  {error}
                </HelperText>
              )}

              {/* Email Input */}
              <TextInput
                label={t("auth.email")}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                disabled={isLoading}
                left={<TextInput.Icon icon="email" />}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>

              {/* Password Input */}
              <TextInput
                label={t("auth.password")}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                error={!!errors.password}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? t("auth.loggingIn") : t("auth.login")}
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Paragraph style={styles.dividerText}>
                  {t("login.or")}
                </Paragraph>
                <Divider style={styles.divider} />
              </View>

              {/* Register Link */}
              <Button
                mode="outlined"
                onPress={handleNavigateToRegister}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                disabled={isLoading}
              >
                {t("login.createAccount")}
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Paragraph style={styles.footerText}>
              {t("login.termsAgreement")}
            </Paragraph>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Snackbar for errors */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: t("general.close"),
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  globalError: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
  input: {
    marginBottom: 4,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 16,
  },
  buttonContent: {
    height: 50,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  registerButton: {
    marginBottom: 8,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 18,
  },
  linkText: {
    fontSize: 12,
    color: "#FF5252",
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  snackbar: {
    backgroundColor: "#D32F2F",
  },
});

export default LoginScreen;
