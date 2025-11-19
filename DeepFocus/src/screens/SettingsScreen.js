import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
  Linking,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Card,
  Text,
  Switch,
  Button,
  Snackbar,
  Divider,
  useTheme,
  Avatar,
  List,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const SETTINGS_STORAGE_KEY = "@deepfocus:pomodoro_settings";

const SettingsScreen = () => {
  const theme = useTheme();
  const { settings, updateSettings } = usePomodoro();
  const { user, logout } = useAuth();
  const { t, language, changeLanguage, setPreviewLanguage, resetLanguage } =
    useLanguage();
  const navigation = useNavigation();

  // Create user-specific storage key
  const userId = user?.id || user?._id || "default";
  const USER_SETTINGS_KEY = `${SETTINGS_STORAGE_KEY}_${userId}`;

  // State for settings (in minutes for display)
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(8); // ← DAILY GOAL SETTING
  const [testMode, setTestMode] = useState(false); // ← TEST MODE TOGGLE (default OFF for production)
  const [selectedLanguage, setSelectedLanguage] = useState(language); // ← Preview language selection

  // UI State
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false); // Track if settings loaded from storage
  const justSavedRef = useRef(false); // Prevent re-detection immediately after save
  const skipUntilTimestampRef = useRef(0); // Skip detection until this timestamp
  const lastSavedTestModeRef = useRef(false); // Track testMode value after save

  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    notifications: true,
    sound: true,
    vibration: true,
    dailyGoal: 8,
    testMode: false, // Match useState default for testMode
    language: "vi", // Track original language
  });

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!hasUnsavedChanges) {
          return false; // Allow default back action
        }

        // Show confirmation Alert
        Alert.alert(
          `⚠️ ${t("settings.unsavedChanges")}`,
          t("settings.unsavedChangesMessage"),
          [
            {
              text: t("settings.stayHere"),
              style: "cancel",
            },
            {
              text: t("settings.discardChanges"),
              style: "destructive",
              onPress: () => {
                // Reset to original values
                setWorkDuration(originalValues.workDuration);
                setShortBreakDuration(originalValues.shortBreakDuration);
                setLongBreakDuration(originalValues.longBreakDuration);
                setPomodorosUntilLongBreak(
                  originalValues.pomodorosUntilLongBreak
                );
                setAutoStartBreaks(originalValues.autoStartBreaks);
                setAutoStartPomodoros(originalValues.autoStartPomodoros);
                setNotifications(originalValues.notifications);
                setSound(originalValues.sound);
                setVibration(originalValues.vibration);
                setTestMode(originalValues.testMode);
                setSelectedLanguage(originalValues.language);
                setPreviewLanguage(originalValues.language);
                setHasUnsavedChanges(false);
                // Let back action proceed naturally
              },
            },
            {
              text: t("settings.saveAndExit"),
              onPress: () => {
                // Save and let navigation proceed
                setIsSaving(true);
                const newSettings = testMode
                  ? {
                      workDuration: 10,
                      shortBreakDuration: 5,
                      longBreakDuration: 10,
                      pomodorosUntilLongBreak,
                      autoStartBreaks,
                      autoStartPomodoros,
                      notifications,
                    }
                  : {
                      workDuration: Math.max(1, workDuration) * 60,
                      shortBreakDuration: Math.max(1, shortBreakDuration) * 60,
                      longBreakDuration: Math.max(1, longBreakDuration) * 60,
                      pomodorosUntilLongBreak,
                      autoStartBreaks,
                      autoStartPomodoros,
                      notifications,
                    };

                AsyncStorage.setItem(
                  USER_SETTINGS_KEY,
                  JSON.stringify(newSettings)
                )
                  .then(() => {
                    updateSettings(newSettings);
                    setHasUnsavedChanges(false);
                    setIsSaving(false);
                  })
                  .catch((error) => {
                    console.error("Error saving:", error);
                    setIsSaving(false);
                  });
              },
            },
          ]
        );
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [
      hasUnsavedChanges,
      originalValues,
      testMode,
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      pomodorosUntilLongBreak,
      autoStartBreaks,
      autoStartPomodoros,
      notifications,
      updateSettings,
    ])
  );

  // Handle tab switch - intercept when user tries to leave Settings
  // Use ref to track unsaved changes without causing re-renders
  const hasUnsavedChangesRef = useRef(false);

  // Store current values in ref to avoid stale closure in Alert callbacks
  const currentValuesRef = useRef({});

  // Sync ref with state
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
    currentValuesRef.current = {
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      pomodorosUntilLongBreak,
      autoStartBreaks,
      autoStartPomodoros,
      notifications,
      sound,
      vibration,
      dailyGoal,
      testMode,
    };
  }, [
    hasUnsavedChanges,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    notifications,
    sound,
    vibration,
    dailyGoal,
    testMode,
  ]);

  useFocusEffect(
    useCallback(() => {
      // This cleanup runs when screen is about to blur (lose focus)
      return () => {
        console.log(
          "🌀 Screen losing focus, hasUnsavedChanges:",
          hasUnsavedChangesRef.current,
          "justSavedRef:",
          justSavedRef.current
        );

        // Skip if user just saved (prevent Alert after successful save)
        if (justSavedRef.current) {
          console.log("✅ Just saved, skipping alert");
          return;
        }

        if (hasUnsavedChangesRef.current) {
          console.log("⚠️ Has unsaved changes, showing alert");

          // Use setTimeout to show Alert after blur completes
          // This ensures Alert shows on the new screen
          setTimeout(() => {
            Alert.alert(
              `⚠️ ${t("settings.unsavedChanges")}`,
              t("settings.unsavedChangesMessage"),
              [
                {
                  text: t("settings.backToSettings"),
                  onPress: () => {
                    // Navigate back to settings
                    navigation.navigate("settings");
                  },
                },
                {
                  text: t("settings.discardChanges"),
                  style: "destructive",
                  onPress: () => {
                    // Reset to original values
                    setWorkDuration(originalValues.workDuration);
                    setShortBreakDuration(originalValues.shortBreakDuration);
                    setLongBreakDuration(originalValues.longBreakDuration);
                    setPomodorosUntilLongBreak(
                      originalValues.pomodorosUntilLongBreak
                    );
                    setAutoStartBreaks(originalValues.autoStartBreaks);
                    setAutoStartPomodoros(originalValues.autoStartPomodoros);
                    setNotifications(originalValues.notifications);
                    setSound(originalValues.sound);
                    setVibration(originalValues.vibration);
                    setDailyGoal(originalValues.dailyGoal || 8);
                    setTestMode(originalValues.testMode);
                    setSelectedLanguage(originalValues.language);
                    setPreviewLanguage(originalValues.language);
                    setHasUnsavedChanges(false);
                    console.log("✅ Changes discarded");
                  },
                },
                {
                  text: t("settings.saveChanges"),
                  onPress: async () => {
                    // Save directly from ref values (to avoid stale state)
                    const vals = currentValuesRef.current;
                    console.log("📌 Saving from ref values:", vals);

                    // Save directly without updating state first
                    try {
                      setIsSaving(true);

                      const newSettings = vals.testMode
                        ? {
                            workDuration: 10,
                            shortBreakDuration: 5,
                            longBreakDuration: 10,
                            pomodorosUntilLongBreak:
                              vals.pomodorosUntilLongBreak,
                            autoStartBreaks: vals.autoStartBreaks,
                            autoStartPomodoros: vals.autoStartPomodoros,
                            notifications: vals.notifications,
                            sound: vals.sound,
                            vibration: vals.vibration,
                            dailyGoal: vals.dailyGoal,
                            testMode: true,
                          }
                        : {
                            workDuration: Math.max(1, vals.workDuration) * 60,
                            shortBreakDuration:
                              Math.max(1, vals.shortBreakDuration) * 60,
                            longBreakDuration:
                              Math.max(1, vals.longBreakDuration) * 60,
                            pomodorosUntilLongBreak:
                              vals.pomodorosUntilLongBreak,
                            autoStartBreaks: vals.autoStartBreaks,
                            autoStartPomodoros: vals.autoStartPomodoros,
                            notifications: vals.notifications,
                            sound: vals.sound,
                            vibration: vals.vibration,
                            dailyGoal: vals.dailyGoal,
                            testMode: false,
                          };

                      await AsyncStorage.setItem(
                        USER_SETTINGS_KEY,
                        JSON.stringify(newSettings)
                      );

                      updateSettings(newSettings);

                      const newOriginalValues = {
                        workDuration: vals.workDuration,
                        shortBreakDuration: vals.shortBreakDuration,
                        longBreakDuration: vals.longBreakDuration,
                        pomodorosUntilLongBreak: vals.pomodorosUntilLongBreak,
                        autoStartBreaks: vals.autoStartBreaks,
                        autoStartPomodoros: vals.autoStartPomodoros,
                        notifications: vals.notifications,
                        sound: vals.sound,
                        vibration: vals.vibration,
                        dailyGoal: vals.dailyGoal,
                        testMode: vals.testMode,
                      };

                      justSavedRef.current = true;
                      lastSavedTestModeRef.current = vals.testMode;

                      setOriginalValues(newOriginalValues);
                      setHasUnsavedChanges(false);

                      console.log("✅ Changes saved from ref");
                      setIsSaving(false);
                    } catch (error) {
                      console.error("❌ Error saving from ref:", error);
                      setIsSaving(false);
                    }
                  },
                },
              ],
              { cancelable: false }
            );
          }, 100);
        }
      };
    }, [originalValues, navigation])
  );

  // Handle navigation away (tab switch, etc.)
  useEffect(() => {
    // Only add listener if navigation supports it
    if (!navigation || typeof navigation.addListener !== "function") {
      console.log("⚠️ Navigation listener NOT available");
      return;
    }

    console.log(
      "🔗 Setting up navigation listener, hasUnsavedChanges:",
      hasUnsavedChanges
    );

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      console.log(
        "🚪 beforeRemove triggered, hasUnsavedChanges:",
        hasUnsavedChanges
      );

      if (!hasUnsavedChanges) {
        // No unsaved changes, allow navigation
        console.log("✅ No unsaved changes, allowing navigation");
        return;
      }

      // Prevent default navigation
      console.log("🛑 Preventing navigation, showing Alert");
      e.preventDefault();

      // Show confirmation Alert
      Alert.alert(
        `⚠️ ${t("settings.unsavedChanges")}`,
        t("settings.unsavedChangesMessage"),
        [
          {
            text: t("settings.stayHere"),
            style: "cancel",
          },
          {
            text: t("settings.discardChanges"),
            style: "destructive",
            onPress: () => {
              // Reset to original values
              setWorkDuration(originalValues.workDuration);
              setShortBreakDuration(originalValues.shortBreakDuration);
              setLongBreakDuration(originalValues.longBreakDuration);
              setPomodorosUntilLongBreak(
                originalValues.pomodorosUntilLongBreak
              );
              setAutoStartBreaks(originalValues.autoStartBreaks);
              setAutoStartPomodoros(originalValues.autoStartPomodoros);
              setNotifications(originalValues.notifications);
              setSound(originalValues.sound);
              setVibration(originalValues.vibration);
              setTestMode(originalValues.testMode);
              setHasUnsavedChanges(false);
              // Continue with navigation
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: t("settings.saveAndExit"),
            onPress: () => {
              // Save from ref to avoid stale state
              const vals = currentValuesRef.current;
              console.log("💾 Saving from ref (beforeRemove):", vals);

              const newSettings = vals.testMode
                ? {
                    workDuration: 10,
                    shortBreakDuration: 5,
                    longBreakDuration: 10,
                    pomodorosUntilLongBreak: vals.pomodorosUntilLongBreak,
                    autoStartBreaks: vals.autoStartBreaks,
                    autoStartPomodoros: vals.autoStartPomodoros,
                    notifications: vals.notifications,
                    sound: vals.sound,
                    vibration: vals.vibration,
                    dailyGoal: vals.dailyGoal,
                    testMode: true,
                  }
                : {
                    workDuration: Math.max(1, vals.workDuration) * 60,
                    shortBreakDuration:
                      Math.max(1, vals.shortBreakDuration) * 60,
                    longBreakDuration: Math.max(1, vals.longBreakDuration) * 60,
                    pomodorosUntilLongBreak: vals.pomodorosUntilLongBreak,
                    autoStartBreaks: vals.autoStartBreaks,
                    autoStartPomodoros: vals.autoStartPomodoros,
                    notifications: vals.notifications,
                    sound: vals.sound,
                    vibration: vals.vibration,
                    dailyGoal: vals.dailyGoal,
                    testMode: false,
                  };

              AsyncStorage.setItem(
                USER_SETTINGS_KEY,
                JSON.stringify(newSettings)
              )
                .then(() => {
                  updateSettings(newSettings);
                  setHasUnsavedChanges(false);
                  // Continue with navigation
                  navigation.dispatch(e.data.action);
                })
                .catch((error) => {
                  console.error("Error saving:", error);
                });
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [
    navigation,
    hasUnsavedChanges,
    originalValues,
    testMode,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    notifications,
    sound,
    vibration,
    updateSettings,
  ]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(USER_SETTINGS_KEY);
      console.log("📂 Loading settings from AsyncStorage:", savedSettings);

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        console.log("📋 Parsed settings:", {
          dailyGoal: parsed.dailyGoal,
          dailyGoalType: typeof parsed.dailyGoal,
          testMode: parsed.testMode,
          testModeType: typeof parsed.testMode,
          fullSettings: parsed,
        });

        // Ensure minimum of 1 minute when converting from seconds
        const workMin = Math.max(1, Math.round(parsed.workDuration / 60));
        const shortMin = Math.max(
          1,
          Math.round(parsed.shortBreakDuration / 60)
        );
        const longMin = Math.max(1, Math.round(parsed.longBreakDuration / 60));

        // Load testMode from storage
        const loadedTestMode = parsed.testMode ?? false;

        setWorkDuration(workMin);
        setShortBreakDuration(shortMin);
        setLongBreakDuration(longMin);
        setPomodorosUntilLongBreak(parsed.pomodorosUntilLongBreak || 4);
        setAutoStartBreaks(parsed.autoStartBreaks ?? true);
        setAutoStartPomodoros(parsed.autoStartPomodoros ?? false);
        setNotifications(parsed.notifications ?? true);
        setSound(parsed.sound ?? true);
        setVibration(parsed.vibration ?? true);
        setDailyGoal(parsed.dailyGoal ?? 8);
        setTestMode(loadedTestMode);

        // Update ref to match loaded testMode (prevent false positive change detection)
        lastSavedTestModeRef.current = loadedTestMode;

        console.log("✅ Loaded into state:", {
          dailyGoal: parsed.dailyGoal ?? 8,
          testMode: loadedTestMode,
        });

        // Store original values (including current language)
        const originalValuesToSet = {
          workDuration: workMin,
          shortBreakDuration: shortMin,
          longBreakDuration: longMin,
          pomodorosUntilLongBreak: parsed.pomodorosUntilLongBreak || 4,
          autoStartBreaks: parsed.autoStartBreaks ?? true,
          autoStartPomodoros: parsed.autoStartPomodoros ?? false,
          notifications: parsed.notifications ?? true,
          sound: parsed.sound ?? true,
          vibration: parsed.vibration ?? true,
          dailyGoal: parsed.dailyGoal ?? 8,
          testMode: loadedTestMode,
          language: language, // Store current language from context
        };
        console.log("📝 Setting originalValues:", originalValuesToSet);
        setOriginalValues(originalValuesToSet);
        setSelectedLanguage(language); // Initialize preview language

        // 🔄 Sync loaded settings to Context (so HomeScreen gets correct values)
        const settingsForContext = {
          workDuration: parsed.workDuration,
          shortBreakDuration: parsed.shortBreakDuration,
          longBreakDuration: parsed.longBreakDuration,
          pomodorosUntilLongBreak: parsed.pomodorosUntilLongBreak || 4,
          autoStartBreaks: parsed.autoStartBreaks ?? true,
          autoStartPomodoros: parsed.autoStartPomodoros ?? false,
          notifications: parsed.notifications ?? true,
          sound: parsed.sound ?? true,
          vibration: parsed.vibration ?? true,
          dailyGoal: parsed.dailyGoal ?? 8,
          testMode: loadedTestMode,
        };
        console.log("🔄 Syncing settings to Context:", settingsForContext);
        updateSettings(settingsForContext);

        // Mark settings as loaded
        setIsSettingsLoaded(true);
      } else {
        // No saved settings, use defaults
        console.log("📝 No saved settings, using defaults");

        // Set default originalValues (UI already has default state from useState)
        setOriginalValues({
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          pomodorosUntilLongBreak: 4,
          autoStartBreaks: true,
          autoStartPomodoros: false,
          notifications: true,
          sound: true,
          vibration: true,
          dailyGoal: 8,
          testMode: false,
          language: language, // Store current language from context
        });
        setSelectedLanguage(language); // Initialize preview language

        // Update ref to match default testMode
        lastSavedTestModeRef.current = false;

        // Sync defaults to Context (Production Mode → use 25/5/15 minutes)
        const defaultSettingsForContext = {
          workDuration: 25 * 60, // Production mode: 25 minutes
          shortBreakDuration: 5 * 60, // Production mode: 5 minutes
          longBreakDuration: 15 * 60, // Production mode: 15 minutes
          pomodorosUntilLongBreak: 4,
          autoStartBreaks: true,
          autoStartPomodoros: false,
          notifications: true,
          dailyGoal: 8,
          testMode: false,
        };
        console.log("🔄 Created default settings:", {
          dailyGoal: defaultSettingsForContext.dailyGoal,
          dailyGoalType: typeof defaultSettingsForContext.dailyGoal,
          fullObject: defaultSettingsForContext,
        });
        console.log(
          "🔄 Syncing default settings to Context:",
          defaultSettingsForContext
        );
        console.log("🔄 Before updateSettings call:", {
          dailyGoal: defaultSettingsForContext.dailyGoal,
          dailyGoalType: typeof defaultSettingsForContext.dailyGoal,
        });
        updateSettings(defaultSettingsForContext);

        setIsSettingsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setIsSettingsLoaded(true);
    }
  };

  // Detect changes and show warning
  useEffect(() => {
    // Skip detection until settings are loaded from storage
    if (!isSettingsLoaded) {
      console.log("⏳ Waiting for settings to load...");
      return;
    }

    // Skip the first immediate run after justSavedRef is set
    if (justSavedRef.current) {
      console.log("⏭️ Skipping change detection (just saved)");
      justSavedRef.current = false; // Reset flag after first skip
      skipUntilTimestampRef.current = Date.now() + 500; // Start 500ms skip period
      console.log("📝 Confirmed testMode value:", testMode);
      return;
    }

    // During skip period (500ms after save), only detect REAL user changes
    // Don't compare with originalValues yet (they might not be synced)
    const now = Date.now();
    const inSkipPeriod = now < skipUntilTimestampRef.current;

    if (inSkipPeriod) {
      // Check if user changed testMode during skip period
      const testModeChangedDuringSkip =
        testMode !== lastSavedTestModeRef.current;

      if (testModeChangedDuringSkip) {
        console.log("⚡ Test Mode changed during skip period:", {
          saved: lastSavedTestModeRef.current,
          current: testMode,
        });
        // User made a real change during skip → Detect it!
        setHasUnsavedChanges(true);
        console.log(
          "� Updating hasUnsavedChanges to: true (changed during skip)"
        );
      } else {
        console.log("⏭️ Skipping change detection (waiting for state sync)");
      }
      return;
    }

    // After skip period, check if testMode changed during skip
    // This handles the case where user toggles testMode while waiting for state sync
    const changedDuringSkip = testMode !== lastSavedTestModeRef.current;
    if (changedDuringSkip) {
      console.log("⚡ Test Mode changed during skip period:", {
        saved: lastSavedTestModeRef.current,
        current: testMode,
      });
    }

    // Build current values for comparison
    // When comparing, we need to handle Test Mode specially:
    // - If testMode changed: Detect it
    // - If IN testMode: Don't compare duration values (they're fixed at 10/5/10)
    // - If NOT in testMode: Compare all values normally

    let hasChanges = false;

    // Check if testMode itself changed
    // Use lastSavedTestModeRef if available (handles changes during skip period)
    const referenceTestMode = changedDuringSkip
      ? lastSavedTestModeRef.current
      : originalValues.testMode;
    const testModeChanged = testMode !== referenceTestMode;

    if (testModeChanged) {
      console.log("✅ Test Mode changed detected:", {
        current: testMode,
        reference: referenceTestMode,
        changedDuringSkip,
      });
      hasChanges = true;
    } else if (testMode) {
      // IN Test Mode: Only check non-duration settings
      hasChanges =
        pomodorosUntilLongBreak !== originalValues.pomodorosUntilLongBreak ||
        autoStartBreaks !== originalValues.autoStartBreaks ||
        autoStartPomodoros !== originalValues.autoStartPomodoros ||
        notifications !== originalValues.notifications ||
        sound !== originalValues.sound ||
        vibration !== originalValues.vibration ||
        dailyGoal !== originalValues.dailyGoal ||
        selectedLanguage !== originalValues.language; // Check language change
    } else {
      // NOT in Test Mode: Check all settings including durations
      hasChanges =
        workDuration !== originalValues.workDuration ||
        shortBreakDuration !== originalValues.shortBreakDuration ||
        longBreakDuration !== originalValues.longBreakDuration ||
        pomodorosUntilLongBreak !== originalValues.pomodorosUntilLongBreak ||
        autoStartBreaks !== originalValues.autoStartBreaks ||
        autoStartPomodoros !== originalValues.autoStartPomodoros ||
        notifications !== originalValues.notifications ||
        sound !== originalValues.sound ||
        vibration !== originalValues.vibration ||
        dailyGoal !== originalValues.dailyGoal ||
        selectedLanguage !== originalValues.language; // Check language change
    }

    console.log("🔍 Change detection:", {
      hasChanges,
      currentHasUnsavedChanges: hasUnsavedChanges,
      testMode,
      originalTestMode: originalValues.testMode,
      testModeChanged,
      current: {
        workDuration,
        shortBreakDuration,
        longBreakDuration,
        dailyGoal,
      },
      original: {
        workDuration: originalValues.workDuration,
        shortBreakDuration: originalValues.shortBreakDuration,
        longBreakDuration: originalValues.longBreakDuration,
        dailyGoal: originalValues.dailyGoal,
      },
    });

    // Track unsaved changes silently (don't show banner)
    // Banner is removed - only Alert will show when navigating away
    if (hasChanges !== hasUnsavedChanges) {
      console.log("🔄 Updating hasUnsavedChanges to:", hasChanges);
      setHasUnsavedChanges(hasChanges);
    }
  }, [
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    notifications,
    sound,
    vibration,
    dailyGoal,
    testMode,
    selectedLanguage,
    originalValues,
    hasUnsavedChanges,
    isSettingsLoaded,
  ]);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // TEST MODE: Use seconds directly (10/5/10 seconds)
      // PRODUCTION MODE: Use minutes converted to seconds
      const newSettings = testMode
        ? {
            // Test mode: 10/5/10 seconds
            workDuration: 10,
            shortBreakDuration: 5,
            longBreakDuration: 10,
            pomodorosUntilLongBreak,
            autoStartBreaks,
            autoStartPomodoros,
            notifications,
            sound,
            vibration,
            dailyGoal,
            testMode, // Save current test mode state
          }
        : {
            // Production mode: minutes to seconds with validation
            workDuration: Math.max(1, workDuration) * 60,
            shortBreakDuration: Math.max(1, shortBreakDuration) * 60,
            longBreakDuration: Math.max(1, longBreakDuration) * 60,
            pomodorosUntilLongBreak,
            autoStartBreaks,
            autoStartPomodoros,
            notifications,
            sound,
            vibration,
            dailyGoal,
            testMode: false, // Save test mode state
          };

      // 🔍 DEBUG: Log newSettings BEFORE saving
      console.log("🔍 newSettings created:", {
        dailyGoal: newSettings.dailyGoal,
        dailyGoalType: typeof newSettings.dailyGoal,
        dailyGoalState: dailyGoal,
        dailyGoalStateType: typeof dailyGoal,
        fullSettings: newSettings,
      });

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        USER_SETTINGS_KEY,
        JSON.stringify(newSettings)
      );

      // Update context
      updateSettings(newSettings);

      // Save language permanently
      await changeLanguage(selectedLanguage);

      // Update original values to current UI values (reset change tracking)
      // Always use UI values, regardless of Test Mode
      const newOriginalValues = {
        workDuration: workDuration,
        shortBreakDuration: shortBreakDuration,
        longBreakDuration: longBreakDuration,
        pomodorosUntilLongBreak: pomodorosUntilLongBreak,
        autoStartBreaks: autoStartBreaks,
        autoStartPomodoros: autoStartPomodoros,
        notifications: notifications,
        sound: sound,
        vibration: vibration,
        dailyGoal: dailyGoal,
        testMode: testMode,
        language: selectedLanguage,
      };

      console.log("💾 Updating originalValues to:", newOriginalValues);
      console.log("🔍 dailyGoal type check:", {
        value: dailyGoal,
        type: typeof dailyGoal,
        newSettingsValue: newSettings.dailyGoal,
        newSettingsType: typeof newSettings.dailyGoal,
      });

      // CRITICAL: Prevent useEffect from re-detecting changes immediately after save
      justSavedRef.current = true; // Flag to skip next change detection
      lastSavedTestModeRef.current = testMode; // Update saved testMode immediately
      // Note: skipUntilTimestampRef will be set in useEffect when justSavedRef is processed

      // Update originalValues and force hasUnsavedChanges = false
      setOriginalValues(newOriginalValues);
      setHasUnsavedChanges(false);

      setSnackbarMessage(
        testMode
          ? `🧪 ${t("settings.testModeActive")}`
          : `✅ ${t("settings.savedSuccessfully")}`
      );
      setSnackbarVisible(true);

      console.log("✅ Settings saved:", newSettings);
      console.log("📌 Forced hasUnsavedChanges = false, justSavedRef = true");
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      setSnackbarMessage(`❌ ${t("general.error")}`);
      setSnackbarVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      t("alerts.resetSettings.title"),
      t("alerts.resetSettings.message"),
      [
        {
          text: t("alerts.resetSettings.cancel"),
          style: "cancel",
        },
        {
          text: t("alerts.resetSettings.confirm"),
          style: "destructive",
          onPress: () => {
            setWorkDuration(25);
            setShortBreakDuration(5);
            setLongBreakDuration(15);
            setPomodorosUntilLongBreak(4);
            setAutoStartBreaks(true);
            setAutoStartPomodoros(false);
            setNotifications(true);
            setSound(true);
            setVibration(true);
            setDailyGoal(8);

            setSnackbarMessage(`🔄 ${t("settings.settingsReset")}`);
            setSnackbarVisible(true);
          },
        },
      ]
    );
  };

  const handleDismissBanner = useCallback(() => {
    // Reset to original values when user dismisses banner
    console.log("🔕 Dismissing banner - Resetting to original values");

    setWorkDuration(originalValues.workDuration);
    setShortBreakDuration(originalValues.shortBreakDuration);
    setLongBreakDuration(originalValues.longBreakDuration);
    setPomodorosUntilLongBreak(originalValues.pomodorosUntilLongBreak);
    setAutoStartBreaks(originalValues.autoStartBreaks);
    setAutoStartPomodoros(originalValues.autoStartPomodoros);
    setNotifications(originalValues.notifications);
    setSound(originalValues.sound);
    setVibration(originalValues.vibration);
    setTestMode(originalValues.testMode);

    setHasUnsavedChanges(false);
  }, [originalValues]);

  const handleDiscardChanges = useCallback(() => {
    // Reset to original values
    setWorkDuration(originalValues.workDuration);
    setShortBreakDuration(originalValues.shortBreakDuration);
    setLongBreakDuration(originalValues.longBreakDuration);
    setPomodorosUntilLongBreak(originalValues.pomodorosUntilLongBreak);
    setAutoStartBreaks(originalValues.autoStartBreaks);
    setAutoStartPomodoros(originalValues.autoStartPomodoros);
    setNotifications(originalValues.notifications);
    setSound(originalValues.sound);
    setVibration(originalValues.vibration);
    setTestMode(originalValues.testMode);

    setHasUnsavedChanges(false);
  }, [originalValues]);

  const handleSaveAndExit = async () => {
    await handleSaveSettings();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Test Mode Section */}
          <Card style={[styles.card, styles.testModeCard]}>
            <Card.Content>
              <View style={styles.switchRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.testModeLabel}>
                    🧪 {t("settings.testMode")} (10/5/10 {t("stats.seconds")})
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.testModeDesc")}
                  </Text>
                </View>
                <Switch
                  value={testMode}
                  onValueChange={setTestMode}
                  color="#FF9800"
                />
              </View>
              {testMode && (
                <View style={styles.testModeWarning}>
                  <Text variant="bodySmall" style={styles.warningText}>
                    ⚠️ {t("settings.testModeWarning")}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Timer Durations Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`⏱️ ${t("settings.timerSettings")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              {/* Work Duration */}
              <View style={styles.settingRow}>
                <Text
                  variant="bodyLarge"
                  style={[styles.label, testMode && styles.disabledText]}
                >
                  {t("settings.workDuration")}
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.value,
                    { color: theme.colors.primary },
                    testMode && styles.disabledText,
                  ]}
                >
                  {testMode
                    ? `10 ${t("stats.seconds")}`
                    : `${workDuration} ${t("settings.minutes")}`}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={45}
                step={5}
                value={workDuration}
                onValueChange={(value) => {
                  triggerHapticFeedback();
                  setWorkDuration(value);
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={theme.colors.primary}
                disabled={testMode}
              />

              <Divider style={styles.divider} />

              {/* Short Break Duration */}
              <View style={styles.settingRow}>
                <Text
                  variant="bodyLarge"
                  style={[styles.label, testMode && styles.disabledText]}
                >
                  {t("settings.shortBreakDuration")}
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.value,
                    { color: "#66BB6A" },
                    testMode && styles.disabledText,
                  ]}
                >
                  {testMode
                    ? `5 ${t("stats.seconds")}`
                    : `${shortBreakDuration} ${t("settings.minutes")}`}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={shortBreakDuration}
                onValueChange={(value) => {
                  triggerHapticFeedback();
                  setShortBreakDuration(value);
                }}
                minimumTrackTintColor="#66BB6A"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#66BB6A"
                disabled={testMode}
              />

              <Divider style={styles.divider} />

              {/* Long Break Duration */}
              <View style={styles.settingRow}>
                <Text
                  variant="bodyLarge"
                  style={[styles.label, testMode && styles.disabledText]}
                >
                  {t("settings.longBreakDuration")}
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.value,
                    { color: "#5C6BC0" },
                    testMode && styles.disabledText,
                  ]}
                >
                  {testMode
                    ? `10 ${t("stats.seconds")}`
                    : `${longBreakDuration} ${t("settings.minutes")}`}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={30}
                step={5}
                value={longBreakDuration}
                onValueChange={(value) => {
                  triggerHapticFeedback();
                  setLongBreakDuration(value);
                }}
                minimumTrackTintColor="#5C6BC0"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#5C6BC0"
                disabled={testMode}
              />
            </Card.Content>
          </Card>

          {/* Break Interval Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`🔄 ${t("settings.behaviorSettings")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.settingRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    {t("settings.pomodorosUntilLongBreak")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.pomodorosUntilLongBreakDesc", {
                      count: pomodorosUntilLongBreak,
                    })}
                  </Text>
                </View>
                <Text
                  variant="titleMedium"
                  style={[styles.value, { color: theme.colors.primary }]}
                >
                  {pomodorosUntilLongBreak}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={2}
                maximumValue={8}
                step={1}
                value={pomodorosUntilLongBreak}
                onValueChange={(value) => {
                  triggerHapticFeedback();
                  setPomodorosUntilLongBreak(value);
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={theme.colors.primary}
              />

              <Divider style={styles.divider} />

              {/* Daily Goal Setting */}
              <View style={styles.settingRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    🎯 {t("settings.dailyGoalLabel")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.dailyGoalDesc")}
                  </Text>
                </View>
                <Text
                  variant="titleMedium"
                  style={[styles.value, { color: theme.colors.primary }]}
                >
                  {dailyGoal}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={dailyGoal}
                onValueChange={(value) => {
                  triggerHapticFeedback();
                  setDailyGoal(Math.round(value));
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={theme.colors.primary}
              />
            </Card.Content>
          </Card>

          {/* Auto-Start Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`🚀 ${t("settings.behaviorSettings")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              {/* Auto Start Breaks */}
              <View style={styles.switchRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    {t("settings.autoStartBreaks")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.autoStartBreaksDesc")}
                  </Text>
                </View>
                <Switch
                  value={autoStartBreaks}
                  onValueChange={setAutoStartBreaks}
                  color={theme.colors.primary}
                />
              </View>

              <Divider style={styles.divider} />

              {/* Auto Start Pomodoros */}
              <View style={styles.switchRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    {t("settings.autoStartPomodoros")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.autoStartPomodorosDesc")}
                  </Text>
                </View>
                <Switch
                  value={autoStartPomodoros}
                  onValueChange={setAutoStartPomodoros}
                  color={theme.colors.primary}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Notifications Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`🔔 ${t("settings.notificationSettings")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.switchRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    {t("settings.enableNotifications")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.enableNotificationsDesc")}
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  color={theme.colors.primary}
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.switchRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    🔊 {t("settings.soundEnabled")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.soundEnabledDesc")}
                  </Text>
                </View>
                <Switch
                  value={sound}
                  onValueChange={setSound}
                  color={theme.colors.primary}
                  disabled={!notifications}
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.switchRow}>
                <View style={styles.labelContainer}>
                  <Text variant="bodyLarge" style={styles.label}>
                    📳 {t("settings.vibrationEnabled")}
                  </Text>
                  <Text variant="bodySmall" style={styles.helpText}>
                    {t("settings.vibrationEnabledDesc")}
                  </Text>
                </View>
                <Switch
                  value={vibration}
                  onValueChange={setVibration}
                  color={theme.colors.primary}
                  disabled={!notifications}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSaveSettings}
              loading={isSaving}
              disabled={isSaving}
              style={[
                styles.saveButton,
                hasUnsavedChanges && styles.saveButtonHighlight,
              ]}
              contentStyle={styles.buttonContent}
              icon="content-save"
              buttonColor={hasUnsavedChanges ? "#FF9800" : undefined}
            >
              {hasUnsavedChanges
                ? `💾 ${t("settings.saveChanges")}`
                : t("settings.saveSettings")}
            </Button>

            <Button
              mode="outlined"
              onPress={handleResetSettings}
              disabled={isSaving}
              style={styles.resetButton}
              contentStyle={styles.buttonContent}
              icon="restore"
            >
              {t("settings.resetDefault")}
            </Button>
          </View>

          {/* Account Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`👤 ${t("settings.accountSettings")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.accountInfo}>
                <Avatar.Text
                  size={56}
                  label={user?.username?.charAt(0).toUpperCase() || "U"}
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <View style={styles.accountText}>
                  <Text variant="titleMedium" style={styles.accountName}>
                    {user?.username || "User"}
                  </Text>
                  <Text variant="bodySmall" style={styles.accountEmail}>
                    {user?.email || ""}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <Button
                mode="outlined"
                onPress={() => {
                  Alert.alert(
                    t("alerts.logout.title"),
                    t("alerts.logout.message"),
                    [
                      { text: t("alerts.logout.cancel"), style: "cancel" },
                      {
                        text: t("alerts.logout.confirm"),
                        style: "destructive",
                        onPress: async () => {
                          resetLanguage(); // Reset to Vietnamese before logout
                          await logout();
                          // Navigation will automatically redirect to Login
                        },
                      },
                    ]
                  );
                }}
                icon="logout"
                textColor="#EF5350"
                style={styles.logoutButton}
              >
                {t("settings.logout")}
              </Button>
            </Card.Content>
          </Card>

          {/* App Info Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`ℹ️ ${t("settings.appInfo")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <List.Item
                title={t("settings.version")}
                description="1.0.0"
                left={(props) => <List.Icon {...props} icon="information" />}
              />
              <List.Item
                title={t("settings.aboutApp")}
                description={t("settings.aboutDescription")}
                left={(props) => <List.Icon {...props} icon="heart" />}
              />
              <List.Item
                title={t("settings.privacyPolicy")}
                description={t("settings.privacyPolicyDesc")}
                left={(props) => <List.Icon {...props} icon="shield-check" />}
                onPress={() => Linking.openURL("https://deepfocus.app/privacy")}
              />
              <List.Item
                title={t("settings.termsOfService")}
                description={t("settings.termsOfServiceDesc")}
                left={(props) => <List.Icon {...props} icon="file-document" />}
                onPress={() => Linking.openURL("https://deepfocus.app/terms")}
              />
            </Card.Content>
          </Card>

          {/* Language Settings Section */}
          <Card style={styles.card}>
            <Card.Title
              title={`🌐 ${t("settings.languageSettings")}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <List.Item
                title={t("settings.vietnamese")}
                description="Tiếng Việt"
                right={() =>
                  selectedLanguage === "vi" && (
                    <List.Icon icon="check" color={theme.colors.primary} />
                  )
                }
                onPress={() => {
                  setSelectedLanguage("vi");
                  setPreviewLanguage("vi");
                }}
                style={styles.languageItem}
              />
              <Divider />
              <List.Item
                title={t("settings.english")}
                description="English"
                right={() =>
                  selectedLanguage === "en" && (
                    <List.Icon icon="check" color={theme.colors.primary} />
                  )
                }
                onPress={() => {
                  setSelectedLanguage("en");
                  setPreviewLanguage("en");
                }}
                style={styles.languageItem}
              />
            </Card.Content>
          </Card>

          {/* Info Card */}
          <Card style={[styles.card, styles.infoCard]}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.infoText}>
                💡 <Text style={styles.infoBold}>{t("general.info")}:</Text>{" "}
                {language === "vi"
                  ? "Phương pháp Pomodoro truyền thống sử dụng chu kỳ 25-5-15 (25 phút làm việc, 5 phút nghỉ ngắn, 15 phút nghỉ dài sau 4 pomodoro)."
                  : "The traditional Pomodoro Technique uses a 25-5-15 cycle (25 minutes work, 5 minutes short break, 15 minutes long break after 4 pomodoros)."}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Success/Error Snackbar - Outside ScrollView for proper positioning */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  testModeCard: {
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: "#FF9800",
  },
  testModeLabel: {
    fontWeight: "600",
    color: "#E65100",
  },
  testModeWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFE0B2",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningText: {
    color: "#E65100",
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontWeight: "500",
    marginBottom: 4,
  },
  helpText: {
    color: "#757575",
    marginTop: 4,
  },
  value: {
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "right",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveButtonHighlight: {
    elevation: 8,
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resetButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    backgroundColor: "#E3F2FD",
  },
  infoText: {
    lineHeight: 22,
    color: "#424242",
  },
  infoBold: {
    fontWeight: "bold",
  },
  languageItem: {
    paddingVertical: 8,
  },
  snackbar: {
    position: "absolute",
    top: "45%",
    left: 20,
    right: 20,
    transform: [{ translateY: -25 }], // Center vertically
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  accountText: {
    marginLeft: 16,
    flex: 1,
  },
  accountName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  accountEmail: {
    color: "#757575",
  },
  logoutButton: {
    marginTop: 12,
    borderColor: "#EF5350",
  },
});

export default SettingsScreen;
