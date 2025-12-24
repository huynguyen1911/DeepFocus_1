import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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
  Snackbar,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
            <Text style={styles.title}>DeepFocus</Text>
            <Paragraph style={styles.subtitle}>{t("login.subtitle")}</Paragraph>
          </View>

          {/* Login Form - No Card Wrapper */}
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
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            {/* Login Button - Gradient */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              style={styles.loginButtonContainer}
            >
              <LinearGradient
                colors={
                  isLoading ? ["#BDBDBD", "#9E9E9E"] : ["#7C4DFF", "#B47CFF"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {t("auth.login").toUpperCase()}
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

            {/* Register Link */}
            <TouchableOpacity
              onPress={handleNavigateToRegister}
              disabled={isLoading}
              activeOpacity={0.7}
              style={styles.registerLinkContainer}
            >
              <Paragraph style={styles.registerLinkText}>
                {t("login.createAccount")}
              </Paragraph>
            </TouchableOpacity>
          </View>

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
          <ActivityIndicator size="large" color="#7C4DFF" />
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
  loginButtonContainer: {
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
  registerLinkContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  registerLinkText: {
    fontSize: 15,
    color: "#7C4DFF",
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    color: "#9E9E9E",
    lineHeight: 18,
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
