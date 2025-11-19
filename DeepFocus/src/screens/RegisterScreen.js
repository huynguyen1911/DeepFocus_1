import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
  Checkbox,
  Snackbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const RegisterScreen = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { register, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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

  // Validate username format - cho phép tiếng Việt có dấu và khoảng trắng
  const validateUsername = (username) => {
    const trimmed = username.trim();
    // Cho phép chữ cái (bao gồm tiếng Việt), số, khoảng trắng, tối thiểu 2 ký tự
    return trimmed.length >= 2;
  };

  // Validate password strength
  const validatePasswordStrength = (password) => {
    // At least 6 characters with letters and numbers
    const minLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    return minLength && hasLetter && hasNumber;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t("register.usernameRequired");
    } else if (!validateUsername(formData.username)) {
      newErrors.username = t("register.usernameMinLength");
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t("register.emailRequired");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("auth.invalidEmail");
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("register.passwordRequired");
    } else if (!validatePasswordStrength(formData.password)) {
      newErrors.password = t("register.passwordStrength");
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("register.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordsNotMatch");
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.terms = t("auth.mustAgreeTerms");
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

  // Handle register
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const result = await register(userData);

      if (result.success) {
        // Navigation handled by AuthContext
        console.log("✅ Registration successful, navigating to home");
      } else {
        // Handle specific error codes
        if (result.error && result.error.includes("Email đã tồn tại")) {
          setSnackbarMessage(t("auth.emailExists"));
        } else {
          setSnackbarMessage(result.error || t("auth.registerError"));
        }
        setSnackbarVisible(true);
      }
    } catch (error) {
      // Network error or unexpected error
      setSnackbarMessage(t("auth.networkError"));
      setSnackbarVisible(true);
    }
  };

  // Handle navigation to login
  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  // Get password strength indicator
  const getPasswordStrengthText = () => {
    if (!formData.password) return "";

    const length = formData.password.length;
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (length < 6) return t("register.passwordWeak");
    if (!hasLetter || !hasNumber) return t("register.passwordMedium");
    if (hasSpecial && length >= 8) return t("register.passwordStrong");
    return t("register.passwordFair");
  };

  const getPasswordStrengthColor = () => {
    if (!formData.password || formData.password.length < 6) return "#f44336";
    if (!validatePasswordStrength(formData.password)) return "#ff9800";
    if (
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) &&
      formData.password.length >= 8
    )
      return "#4caf50";
    return "#2196f3";
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
              {t("register.title")}
            </Title>
            <Paragraph style={styles.subtitle}>
              {t("register.subtitle")}
            </Paragraph>
          </View>

          {/* Register Form */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.formTitle}>{t("auth.register")}</Title>

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

              {/* Username Input */}
              <TextInput
                label={t("auth.username")}
                value={formData.username}
                onChangeText={(value) => handleInputChange("username", value)}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                autoComplete="username"
                error={!!errors.username}
                disabled={isLoading}
                left={<TextInput.Icon icon="account" />}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username}
              </HelperText>

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
              {/* Password Strength Indicator */}
              {formData.password && (
                <HelperText
                  type="info"
                  visible={!!formData.password}
                  style={[
                    styles.passwordStrength,
                    { color: getPasswordStrengthColor() },
                  ]}
                >
                  {getPasswordStrengthText()}
                </HelperText>
              )}
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              {/* Confirm Password Input */}
              <TextInput
                label={t("auth.confirmPassword")}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                error={!!errors.confirmPassword}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <Checkbox
                  status={agreeToTerms ? "checked" : "unchecked"}
                  color={theme.colors.primary}
                />
                <Paragraph style={styles.checkboxText}>
                  {t("auth.agreeTerms")}
                </Paragraph>
              </TouchableOpacity>
              <HelperText type="error" visible={!!errors.terms}>
                {errors.terms}
              </HelperText>

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                disabled={isLoading || !agreeToTerms}
                loading={isLoading}
              >
                {isLoading
                  ? t("auth.registering")
                  : t("register.createAccount")}
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Paragraph style={styles.dividerText}>
                  {t("login.or")}
                </Paragraph>
                <Divider style={styles.divider} />
              </View>

              {/* Login Link */}
              <Button
                mode="outlined"
                onPress={handleNavigateToLogin}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                disabled={isLoading}
              >
                {t("auth.haveAccount")} {t("auth.loginNow")}
              </Button>
            </Card.Content>
          </Card>
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
        duration={4000}
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
  passwordStrength: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: "#FF5252",
    fontWeight: "500",
  },
  registerButton: {
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
  loginButton: {
    marginBottom: 8,
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

export default RegisterScreen;
