import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  HelperText,
  ActivityIndicator,
  useTheme,
  Divider,
  Checkbox,
  Snackbar,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
      style={[styles.container, { backgroundColor: "#FFFFFF" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconButton icon="arrow-left" size={24} iconColor="#666" />
          </TouchableOpacity>

          {/* Logo Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
          </View>

          {/* Header - No Box, Just Text */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("register.title")}</Text>
            <Paragraph style={styles.subtitle}>
              {t("register.subtitle")}
            </Paragraph>
          </View>

          {/* Register Form - No Card Wrapper */}
          <View style={styles.formContainer}>
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

            {/* Username Input - Soft UI */}
            <TextInput
              label={t("auth.username")}
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              mode="flat"
              style={styles.input}
              autoCapitalize="none"
              autoComplete="username"
              error={!!errors.username}
              disabled={isLoading}
              left={<TextInput.Icon icon="account" color="#9E9E9E" />}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>

            {/* Email Input - Soft UI */}
            <TextInput
              label={t("auth.email")}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              mode="flat"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              disabled={isLoading}
              left={<TextInput.Icon icon="email" color="#9E9E9E" />}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            {/* Password Input - Soft UI */}
            <TextInput
              label={t("auth.password")}
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              mode="flat"
              style={styles.input}
              secureTextEntry={!showPassword}
              error={!!errors.password}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock" color="#9E9E9E" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#9E9E9E"
                />
              }
              underlineColor="transparent"
              activeUnderlineColor="transparent"
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

            {/* Confirm Password Input - Soft UI */}
            <TextInput
              label={t("auth.confirmPassword")}
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              mode="flat"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              error={!!errors.confirmPassword}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock-check" color="#9E9E9E" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#9E9E9E"
                />
              }
              underlineColor="transparent"
              activeUnderlineColor="transparent"
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
                color="#7C4DFF"
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.checkboxText}>
                  Tôi đồng ý với{" "}
                  <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và{" "}
                  <Text style={styles.linkText}>Chính sách bảo mật</Text>
                </Text>
              </View>
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.terms}>
              {errors.terms}
            </HelperText>

            {/* Register Button - Gradient */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading || !agreeToTerms}
              activeOpacity={0.8}
              style={styles.registerButtonContainer}
            >
              <LinearGradient
                colors={
                  isLoading || !agreeToTerms
                    ? ["#BDBDBD", "#9E9E9E"]
                    : ["#7C4DFF", "#B47CFF"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {t("register.createAccount").toUpperCase()}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Paragraph style={styles.dividerText}>{t("login.or")}</Paragraph>
              <Divider style={styles.divider} />
            </View>

            {/* Login Link */}
            <TouchableOpacity
              onPress={handleNavigateToLogin}
              disabled={isLoading}
              activeOpacity={0.7}
              style={styles.loginLinkContainer}
            >
              <Paragraph style={styles.loginLinkText}>
                {t("auth.haveAccount")}{" "}
                <Paragraph style={styles.loginLinkBold}>
                  {t("auth.loginNow")}
                </Paragraph>
              </Paragraph>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7C4DFF" />
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 4,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3E5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  logoEmoji: {
    fontSize: 42,
    margin: 0,
    padding: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  gradientTitle: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#757575",
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
  },
  globalError: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
  input: {
    marginBottom: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    overflow: "hidden",
  },
  passwordStrength: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 8,
    paddingRight: 8,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#616161",
  },
  linkText: {
    color: "#7C4DFF",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  registerButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    margin: 0,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9E9E9E",
  },
  loginLinkContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 15,
    color: "#616161",
  },
  loginLinkBold: {
    fontSize: 15,
    color: "#7C4DFF",
    fontWeight: "bold",
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
