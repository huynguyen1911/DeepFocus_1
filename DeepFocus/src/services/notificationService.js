import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // For Android/iOS - shows notification banner
    shouldShowList: true, // Show in notification center
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async () => {
  try {
    if (!Device.isDevice) {
      console.log("⚠️ Notifications chỉ hoạt động trên thiết bị thật");
      return false;
    }

    // Check current permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Không có quyền gửi thông báo");
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "DeepFocus",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF5252",
        sound: "default",
      });
    }

    console.log("✅ Notification permissions granted");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi request permissions:", error);
    return false;
  }
};

// Schedule immediate notification
export const sendLocalNotification = async (
  title,
  body,
  data = {},
  options = {}
) => {
  try {
    const { sound = true, vibration = true } = options;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: sound ? "default" : false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: vibration ? [0, 250, 250, 250] : false,
      },
      trigger: null, // Send immediately
    });

    console.log("📬 Notification sent:", title);
  } catch (error) {
    console.error("❌ Lỗi khi gửi notification:", error);
  }
};

// Notification for work session complete
export const sendWorkCompleteNotification = async (
  pomodoroCount,
  options = {}
) => {
  const title = "🎉 Xuất sắc!";
  const body = `Bạn đã hoàn thành Pomodoro #${pomodoroCount}. Đã đến lúc nghỉ ngơi!`;

  await sendLocalNotification(
    title,
    body,
    { type: "work_complete", count: pomodoroCount },
    options
  );
};

// Notification for break complete
export const sendBreakCompleteNotification = async (
  breakType,
  options = {}
) => {
  const title = "⏰ Hết giờ nghỉ!";
  const body =
    breakType === "long"
      ? "Nghỉ dài đã kết thúc. Sẵn sàng tập trung trở lại?"
      : "Nghỉ ngắn đã kết thúc. Hãy tiếp tục làm việc!";

  await sendLocalNotification(
    title,
    body,
    { type: "break_complete", breakType },
    options
  );
};

// Notification for daily goal achieved
export const sendDailyGoalNotification = async (
  pomodoroCount,
  options = {}
) => {
  const title = "🌟 Chúc mừng!";
  const body = `Bạn đã hoàn thành mục tiêu ${pomodoroCount} Pomodoros hôm nay!`;

  await sendLocalNotification(
    title,
    body,
    { type: "goal_achieved", goal: pomodoroCount },
    options
  );
};

// Notification for streak milestone
export const sendStreakNotification = async (days, options = {}) => {
  const title = "🔥 Chuỗi ngày tuyệt vời!";
  const body = `Bạn đã duy trì ${days} ngày liên tiếp. Hãy tiếp tục!`;

  await sendLocalNotification(
    title,
    body,
    { type: "streak_milestone", days },
    options
  );
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🗑️ Đã hủy tất cả notifications");
  } catch (error) {
    console.error("❌ Lỗi khi cancel notifications:", error);
  }
};

// Get notification badge count (iOS)
export const getBadgeCount = async () => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    return 0;
  }
};

// Set notification badge (iOS)
export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("❌ Lỗi khi set badge:", error);
  }
};

// Add notification listeners
export const addNotificationListeners = (onReceived, onResponse) => {
  // Notification received while app is foregrounded
  const receivedListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("📨 Notification received:", notification);
      if (onReceived) onReceived(notification);
    }
  );

  // User tapped on notification
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("👆 Notification tapped:", response);
      if (onResponse) onResponse(response);
    });

  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};
