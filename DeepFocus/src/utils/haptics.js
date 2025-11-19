import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Light haptic feedback - for subtle interactions
 * Use for: button taps, selection changes
 */
export const lightHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available on this device
    }
  }
};

/**
 * Medium haptic feedback - for moderate interactions
 * Use for: navigation, toggle switches
 */
export const mediumHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available
    }
  }
};

/**
 * Heavy haptic feedback - for important interactions
 * Use for: deletions, important confirmations
 */
export const heavyHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Haptics not available
    }
  }
};

/**
 * Success haptic feedback
 * Use for: task completion, successful saves
 */
export const successHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available
    }
  }
};

/**
 * Warning haptic feedback
 * Use for: warnings, caution states
 */
export const warningHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Haptics not available
    }
  }
};

/**
 * Error haptic feedback
 * Use for: errors, failed operations
 */
export const errorHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Haptics not available
    }
  }
};

/**
 * Selection haptic - for discrete selection changes
 * Use for: picker selections, segmented controls
 */
export const selectionHaptic = async () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Haptics not available
    }
  }
};

export default {
  light: lightHaptic,
  medium: mediumHaptic,
  heavy: heavyHaptic,
  success: successHaptic,
  warning: warningHaptic,
  error: errorHaptic,
  selection: selectionHaptic,
};
