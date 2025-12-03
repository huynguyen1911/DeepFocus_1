# 🎯 PHASE 3 COMPLETION PLAN - 15% REMAINING

**Current Status:** 85% → Target: 100%  
**Timeline:** 2-3 days (16-20 hours)  
**Cost:** $0 (No deployment costs)  
**Focus:** Server Push Notifications + Reports System

---

## 📊 OVERVIEW

### **What's Missing (15%):**

1. **Server-side Push Notifications** (8% - ~6-8 hours)
   - Firebase Cloud Messaging backend integration
   - Push token management API
   - Notification sending service
2. **Reports System** (7% - ~5-6 hours)
   - StudentDetailScreen (comprehensive view)
   - ReportsScreen with PDF export
   - Report generation backend

---

# 🔔 PART 1: SERVER PUSH NOTIFICATIONS (8%)

## **Timeline:** Day 1 - 6-8 hours

---

## 📱 **STEP 1: Firebase Setup (1 hour)**

### **1.1 Create Firebase Project (FREE)**

**Actions:**

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: "DeepFocus"
4. Disable Google Analytics (not needed for MVP)
5. Create project

### **1.2 Add Android App**

1. Click "Add app" → Android
2. Package name: `com.deepfocus.app` (from app.json)
3. Download `google-services.json`
4. Save to: `DeepFocus/google-services.json`

### **1.3 Add iOS App**

1. Click "Add app" → iOS
2. Bundle ID: `com.deepfocus.app` (from app.json)
3. Download `GoogleService-Info.plist`
4. Save to: `DeepFocus/GoogleService-Info.plist`

### **1.4 Get Server Key**

1. Go to Project Settings → Cloud Messaging
2. Copy "Server key" (Legacy)
3. Save this key - we'll use it in backend

**Success Criteria:**

- ✅ Firebase project created
- ✅ Android config file downloaded
- ✅ iOS config file downloaded
- ✅ Server key saved

---

## 🔧 **STEP 2: Backend Setup (3-4 hours)**

### **2.1 Install Dependencies**

```bash
cd backend
npm install firebase-admin
npm install expo-server-sdk
```

**Why both:**

- `firebase-admin`: For direct FCM integration
- `expo-server-sdk`: Easier for Expo apps

### **2.2 Create Firebase Config**

**File:** `backend/config/firebase.js`

```javascript
const admin = require("firebase-admin");

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
```

### **2.3 Create PushToken Model**

**File:** `backend/models/PushToken.js`

```javascript
const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["ios", "android", "web"],
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
pushTokenSchema.index({ user: 1, isActive: 1 });
pushTokenSchema.index({ token: 1 });

// Auto-deactivate tokens older than 90 days
pushTokenSchema.methods.checkExpiry = function () {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  if (this.lastUsed < ninetyDaysAgo) {
    this.isActive = false;
    return this.save();
  }
};

module.exports = mongoose.model("PushToken", pushTokenSchema);
```

### **2.4 Create Notification Service**

**File:** `backend/services/notificationService.js`

```javascript
const admin = require("../config/firebase");
const PushToken = require("../models/PushToken");
const { Expo } = require("expo-server-sdk");

const expo = new Expo();

class NotificationService {
  /**
   * Send push notification to a user
   */
  async sendToUser(userId, notification) {
    try {
      // Get all active tokens for user
      const tokens = await PushToken.find({
        user: userId,
        isActive: true,
      });

      if (tokens.length === 0) {
        console.log(`No active push tokens for user ${userId}`);
        return { success: false, reason: "No active tokens" };
      }

      // Prepare messages
      const messages = tokens.map((tokenDoc) => ({
        to: tokenDoc.token,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge || 1,
        priority: notification.priority || "high",
      }));

      // Send via Expo Push
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
        }
      }

      // Update last used timestamp
      await Promise.all(
        tokens.map((token) => {
          token.lastUsed = new Date();
          return token.save();
        })
      );

      return { success: true, tickets };
    } catch (error) {
      console.error("Error in sendToUser:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds, notification) {
    const results = await Promise.all(
      userIds.map((userId) => this.sendToUser(userId, notification))
    );
    return results;
  }

  /**
   * Send notification to all students in a class
   */
  async sendToClass(classId, notification) {
    const Class = require("../models/Class");
    const classDoc = await Class.findById(classId).populate("students");

    if (!classDoc) {
      return { success: false, reason: "Class not found" };
    }

    const studentIds = classDoc.students.map((s) => s._id);
    return this.sendToUsers(studentIds, notification);
  }

  /**
   * Register a new push token
   */
  async registerToken(userId, token, platform, deviceId) {
    try {
      // Check if token already exists
      let pushToken = await PushToken.findOne({ token });

      if (pushToken) {
        // Update existing token
        pushToken.user = userId;
        pushToken.platform = platform;
        pushToken.deviceId = deviceId;
        pushToken.isActive = true;
        pushToken.lastUsed = new Date();
      } else {
        // Create new token
        pushToken = new PushToken({
          user: userId,
          token,
          platform,
          deviceId,
        });
      }

      await pushToken.save();
      return { success: true, token: pushToken };
    } catch (error) {
      console.error("Error registering token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unregister a push token
   */
  async unregisterToken(token) {
    try {
      await PushToken.findOneAndUpdate({ token }, { isActive: false });
      return { success: true };
    } catch (error) {
      console.error("Error unregistering token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens() {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const result = await PushToken.updateMany(
        { lastUsed: { $lt: ninetyDaysAgo }, isActive: true },
        { isActive: false }
      );
      return { success: true, deactivated: result.nModified };
    } catch (error) {
      console.error("Error cleaning up tokens:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
```

### **2.5 Create Notification Controller**

**File:** `backend/controllers/notificationController.js`

```javascript
const notificationService = require("../services/notificationService");

// Register push token
exports.registerToken = async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;
    const userId = req.user._id;

    if (!token || !platform || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Token, platform, and deviceId are required",
      });
    }

    const result = await notificationService.registerToken(
      userId,
      token,
      platform,
      deviceId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Push token registered successfully",
      data: result.token,
    });
  } catch (error) {
    console.error("Error in registerToken:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register push token",
      error: error.message,
    });
  }
};

// Unregister push token
exports.unregisterToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const result = await notificationService.unregisterToken(token);

    res.json({
      success: true,
      message: "Push token unregistered successfully",
    });
  } catch (error) {
    console.error("Error in unregisterToken:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unregister push token",
      error: error.message,
    });
  }
};

// Send test notification (admin/testing only)
exports.sendTestNotification = async (req, res) => {
  try {
    const { title, body, data } = req.body;
    const userId = req.user._id;

    const result = await notificationService.sendToUser(userId, {
      title: title || "Test Notification",
      body: body || "This is a test notification",
      data: data || {},
    });

    res.json({
      success: true,
      message: "Test notification sent",
      result,
    });
  } catch (error) {
    console.error("Error in sendTestNotification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error.message,
    });
  }
};
```

### **2.6 Create Notification Routes**

**File:** `backend/routes/notifications.js`

```javascript
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Register push token
router.post("/register-token", notificationController.registerToken);

// Unregister push token
router.post("/unregister-token", notificationController.unregisterToken);

// Send test notification
router.post("/test", notificationController.sendTestNotification);

module.exports = router;
```

### **2.7 Add Routes to Server**

**File:** `backend/server.js` (modify)

```javascript
// Add near other route imports
const notificationRoutes = require("./routes/notifications");

// Add near other route uses
app.use("/api/notifications", notificationRoutes);
```

### **2.8 Add Environment Variables**

**File:** `backend/.env`

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

**To get these values:**

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Copy values to .env

**Success Criteria:**

- ✅ All models created
- ✅ Notification service working
- ✅ API endpoints created
- ✅ Routes registered

---

## 📱 **STEP 3: Frontend Integration (2-3 hours)**

### **3.1 Install Dependencies**

```bash
cd ..  # Back to root
npx expo install expo-notifications expo-device expo-constants
```

### **3.2 Create Notification Service**

**File:** `src/services/notificationService.ts`

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import api from "./api";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private notificationListener: any;
  private responseListener: any;

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log("Push notifications only work on physical devices");
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  /**
   * Get push token and register with backend
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get push token
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;

      console.log("Push token:", token);

      // Get device info
      const platform = Platform.OS;
      const deviceId = Constants.deviceId || Device.modelId || "unknown";

      // Register token with backend
      await api.post("/notifications/register-token", {
        token,
        platform,
        deviceId,
      });

      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (
      response: Notifications.NotificationResponse
    ) => void
  ) {
    // Listener for notifications received while app is open
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listener for user tapping on notification
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        onNotificationResponse?.(response);
      });
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Unregister push token
   */
  async unregisterPushToken(token: string): Promise<void> {
    try {
      await api.post("/notifications/unregister-token", { token });
    } catch (error) {
      console.error("Error unregistering token:", error);
    }
  }

  /**
   * Send test notification (for testing)
   */
  async sendTestNotification(): Promise<void> {
    try {
      await api.post("/notifications/test", {
        title: "Test Notification",
        body: "This is a test notification from DeepFocus",
        data: { type: "test" },
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }
}

export default new NotificationService();
```

### **3.3 Integrate in App Layout**

**File:** `app/_layout.tsx` (modify)

```typescript
import { useEffect } from "react";
import notificationService from "../src/services/notificationService";
import { router } from "expo-router";

export default function RootLayout() {
  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications();

    // Setup listeners
    notificationService.setupNotificationListeners(
      (notification) => {
        // Handle notification received
        console.log("Notification:", notification);
      },
      (response) => {
        // Handle notification tap - navigate based on data
        const data = response.notification.request.content.data;

        if (data.type === "reward") {
          router.push("/rewards");
        } else if (data.type === "achievement") {
          router.push("/achievements");
        } else if (data.type === "competition") {
          router.push(`/competitions/${data.competitionId}`);
        }
      }
    );

    return () => {
      notificationService.removeNotificationListeners();
    };
  }, []);

  // ... rest of layout
}
```

### **3.4 Update App Config**

**File:** `app.json` (modify)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#4F46E5",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    }
  }
}
```

**Success Criteria:**

- ✅ Notifications working on device
- ✅ Permissions requested properly
- ✅ Token registered with backend
- ✅ Tap navigation working
- ✅ Test notification received

---

## 🧪 **STEP 4: Testing Push Notifications (1 hour)**

### **4.1 Test Registration**

```bash
# In backend terminal
npm test -- --grep "push token"
```

### **4.2 Manual Testing**

1. Run app on physical device
2. Accept notification permissions
3. Check backend logs for token registration
4. Send test notification from Postman:
   ```
   POST http://localhost:5000/api/notifications/test
   Headers: Authorization: Bearer <token>
   Body: {
     "title": "Test",
     "body": "Testing push notifications"
   }
   ```
5. Verify notification received

### **4.3 Integration with Existing Features**

**Modify:** `backend/controllers/rewardController.js`

```javascript
const notificationService = require("../services/notificationService");

// In createReward function, after saving reward:
if (reward.type === "positive") {
  await notificationService.sendToUser(reward.student, {
    title: "🎉 You earned a reward!",
    body: `${reward.reason} (+${reward.points} points)`,
    data: { type: "reward", rewardId: reward._id },
  });
}
```

**Modify:** `backend/controllers/achievementController.js`

```javascript
// When achievement unlocked:
await notificationService.sendToUser(userId, {
  title: "🏆 Achievement Unlocked!",
  body: `You unlocked: ${achievement.name}`,
  data: { type: "achievement", achievementId: achievement._id },
});
```

**Success Criteria:**

- ✅ Notifications sent on rewards
- ✅ Notifications sent on achievements
- ✅ Notifications sent on competition updates
- ✅ All notifications navigate correctly

---

# 📊 PART 2: REPORTS SYSTEM (7%)

## **Timeline:** Day 2 - 5-6 hours

---

## 📄 **STEP 5: PDF Report Generation Backend (3 hours)**

### **5.1 Install Dependencies**

```bash
cd backend
npm install pdfkit
```

### **5.2 Create Report Service**

**File:** `backend/services/reportService.js`

```javascript
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Stats = require("../models/Stats");
const Session = require("../models/Session");
const Task = require("../models/Task");
const Reward = require("../models/Reward");
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");

class ReportService {
  /**
   * Generate student progress report
   */
  async generateStudentReport(studentId, startDate, endDate) {
    try {
      // Fetch student data
      const student = await User.findById(studentId);
      const stats = await Stats.findOne({ user: studentId });

      // Fetch sessions in date range
      const sessions = await Session.find({
        user: studentId,
        startTime: { $gte: startDate, $lte: endDate },
        status: "completed",
      }).sort({ startTime: -1 });

      // Fetch tasks in date range
      const tasks = await Task.find({
        user: studentId,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Fetch rewards
      const rewards = await Reward.find({
        student: studentId,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Fetch achievements
      const userAchievements = await UserAchievement.find({
        user: studentId,
        unlockedAt: { $gte: startDate, $lte: endDate },
      }).populate("achievement");

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const filename = `student-report-${studentId}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, "../temp", filename);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, "../temp"))) {
        fs.mkdirSync(path.join(__dirname, "../temp"));
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add content to PDF
      this.addStudentReportContent(doc, {
        student,
        stats,
        sessions,
        tasks,
        rewards,
        userAchievements,
        startDate,
        endDate,
      });

      doc.end();

      // Wait for PDF to be written
      await new Promise((resolve) => stream.on("finish", resolve));

      return {
        success: true,
        filepath,
        filename,
        downloadUrl: `/api/reports/download/${filename}`,
      };
    } catch (error) {
      console.error("Error generating student report:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add content to student report PDF
   */
  addStudentReportContent(doc, data) {
    const {
      student,
      stats,
      sessions,
      tasks,
      rewards,
      userAchievements,
      startDate,
      endDate,
    } = data;

    // Header
    doc
      .fontSize(24)
      .text("DeepFocus - Student Progress Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        { align: "center" }
      );
    doc.moveDown(2);

    // Student Info
    doc.fontSize(16).text("Student Information", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Name: ${student.fullName}`)
      .text(`Email: ${student.email}`)
      .text(`Student ID: ${student.studentProfile?.studentId || "N/A"}`);
    doc.moveDown(2);

    // Statistics Overview
    doc.fontSize(16).text("Statistics Overview", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Total Pomodoros: ${stats?.totalPomodoros || 0}`)
      .text(
        `Total Focus Time: ${((stats?.totalFocusTime || 0) / 60).toFixed(
          1
        )} hours`
      )
      .text(`Total Tasks Completed: ${stats?.totalTasksCompleted || 0}`)
      .text(`Current Streak: ${stats?.currentStreak || 0} days`)
      .text(`Best Streak: ${stats?.bestStreak || 0} days`)
      .text(`Total Points: ${stats?.totalPoints || 0}`);
    doc.moveDown(2);

    // Sessions in Period
    doc.fontSize(16).text("Focus Sessions in Period", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Sessions: ${sessions.length}`);
    doc
      .fontSize(12)
      .text(
        `Total Focus Time: ${(
          sessions.reduce((sum, s) => sum + s.duration, 0) / 60
        ).toFixed(1)} hours`
      );
    doc.moveDown();

    // Recent sessions table
    if (sessions.length > 0) {
      doc.fontSize(12).text("Recent Sessions (Last 10):", { underline: true });
      doc.moveDown(0.5);

      sessions.slice(0, 10).forEach((session, index) => {
        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${session.startTime.toLocaleDateString()} - ${
              session.duration
            }min - ${session.taskName || "No task"}`
          );
      });
      doc.moveDown(2);
    }

    // Tasks Summary
    doc.fontSize(16).text("Tasks Summary", { underline: true });
    doc.moveDown(0.5);
    const completedTasks = tasks.filter((t) => t.status === "completed");
    doc
      .fontSize(12)
      .text(`Total Tasks Created: ${tasks.length}`)
      .text(`Tasks Completed: ${completedTasks.length}`)
      .text(
        `Completion Rate: ${
          tasks.length > 0
            ? ((completedTasks.length / tasks.length) * 100).toFixed(1)
            : 0
        }%`
      );
    doc.moveDown(2);

    // Rewards Summary
    doc.fontSize(16).text("Rewards & Recognition", { underline: true });
    doc.moveDown(0.5);
    const positiveRewards = rewards.filter((r) => r.type === "positive");
    const negativeRewards = rewards.filter((r) => r.type === "negative");
    doc
      .fontSize(12)
      .text(`Positive Rewards: ${positiveRewards.length}`)
      .text(
        `Total Points Earned: +${positiveRewards.reduce(
          (sum, r) => sum + r.points,
          0
        )}`
      )
      .text(`Penalties: ${negativeRewards.length}`)
      .text(
        `Total Points Deducted: ${negativeRewards.reduce(
          (sum, r) => sum + r.points,
          0
        )}`
      );
    doc.moveDown(2);

    // Achievements
    if (userAchievements.length > 0) {
      doc
        .fontSize(16)
        .text("Achievements Unlocked in Period", { underline: true });
      doc.moveDown(0.5);
      userAchievements.forEach((ua, index) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${ua.achievement.name} (${ua.achievement.rarity})`
          );
      });
      doc.moveDown(2);
    }

    // Footer
    doc
      .fontSize(10)
      .text(`Report generated on ${new Date().toLocaleDateString()}`, {
        align: "center",
      });
    doc.text("DeepFocus - Focus. Achieve. Succeed.", { align: "center" });
  }

  /**
   * Generate class summary report
   */
  async generateClassReport(classId, startDate, endDate) {
    // Similar structure, but for entire class
    // TODO: Implement class report
  }

  /**
   * Clean up old report files
   */
  async cleanupOldReports() {
    try {
      const tempDir = path.join(__dirname, "../temp");
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filepath = path.join(tempDir, file);
        const stats = fs.statSync(filepath);
        if (stats.mtimeMs < oneDayAgo) {
          fs.unlinkSync(filepath);
        }
      });
    } catch (error) {
      console.error("Error cleaning up reports:", error);
    }
  }
}

module.exports = new ReportService();
```

### **5.3 Create Report Controller**

**File:** `backend/controllers/reportController.js`

```javascript
const reportService = require("../services/reportService");
const path = require("path");

// Generate student report
exports.generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Parse dates
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await reportService.generateStudentReport(
      studentId,
      start,
      end
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Report generated successfully",
      downloadUrl: result.downloadUrl,
    });
  } catch (error) {
    console.error("Error in generateStudentReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

// Download report file
exports.downloadReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, "../temp", filename);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(404).json({
          success: false,
          message: "File not found",
        });
      }
    });
  } catch (error) {
    console.error("Error in downloadReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download report",
      error: error.message,
    });
  }
};
```

### **5.4 Create Report Routes**

**File:** `backend/routes/reports.js`

```javascript
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authMiddleware, roleCheck } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Generate student report (teacher/guardian only)
router.get(
  "/student/:studentId",
  roleCheck(["teacher", "guardian"]),
  reportController.generateStudentReport
);

// Download report file
router.get("/download/:filename", reportController.downloadReport);

module.exports = router;
```

### **5.5 Register Routes**

**File:** `backend/server.js` (add)

```javascript
const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);
```

**Success Criteria:**

- ✅ PDF generation working
- ✅ Reports include all data
- ✅ Download working
- ✅ Old reports auto-cleanup

---

## 📱 **STEP 6: Reports Frontend (2-3 hours)**

### **6.1 Create StudentDetailScreen**

**File:** `app/students/[id].tsx`

```typescript
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useEffect } from "react";
import api from "../../src/services/api";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams();
  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Fetch student info
      const studentRes = await api.get(`/users/${id}`);
      setStudent(studentRes.data);

      // Fetch stats
      const statsRes = await api.get(`/stats/user/${id}`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const response = await api.get(`/reports/student/${id}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      // Open download URL
      if (response.data.downloadUrl) {
        // TODO: Open download URL or share
        alert("Report generated! Check downloads.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: student?.fullName || "Student Detail",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView style={styles.container}>
        {/* Student Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <InfoRow label="Name" value={student?.fullName} />
          <InfoRow label="Email" value={student?.email} />
          <InfoRow
            label="Student ID"
            value={student?.studentProfile?.studentId}
          />
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <StatCard
            label="Total Pomodoros"
            value={stats?.totalPomodoros || 0}
          />
          <StatCard
            label="Focus Time"
            value={`${((stats?.totalFocusTime || 0) / 60).toFixed(1)} hours`}
          />
          <StatCard
            label="Tasks Completed"
            value={stats?.totalTasksCompleted || 0}
          />
          <StatCard
            label="Current Streak"
            value={`${stats?.currentStreak || 0} days`}
          />
          <StatCard label="Total Points" value={stats?.totalPoints || 0} />
        </View>

        {/* Generate Report Button */}
        <TouchableOpacity style={styles.reportButton} onPress={generateReport}>
          <Text style={styles.reportButtonText}>📄 Generate PDF Report</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/rewards?studentId=${id}`)}
          >
            <Text style={styles.actionButtonText}>View Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/sessions?studentId=${id}`)}
          >
            <Text style={styles.actionButtonText}>View Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/tasks?studentId=${id}`)}
          >
            <Text style={styles.actionButtonText}>View Tasks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || "N/A"}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    flex: 2,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  statCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },
  reportButton: {
    backgroundColor: "#4F46E5",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  reportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
    textAlign: "center",
  },
});
```

### **6.2 Create Layout for Students**

**File:** `app/students/_layout.tsx`

```typescript
import { Stack } from "expo-router";

export default function StudentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
```

### **6.3 Add Navigation from Classes**

**Modify:** `app/classes/members/[classId].tsx`

```typescript
// In member list, make each student tappable:
<TouchableOpacity onPress={() => router.push(`/students/${student._id}`)}>
  <Text>{student.fullName}</Text>
</TouchableOpacity>
```

**Success Criteria:**

- ✅ StudentDetailScreen shows full info
- ✅ Generate report button works
- ✅ PDF downloads/shares properly
- ✅ Navigation from class members working

---

## 🧪 **STEP 7: Testing (1 hour)**

### **7.1 Test Push Notifications**

- [ ] Send test notification
- [ ] Verify received on device
- [ ] Test tap navigation
- [ ] Test reward notifications
- [ ] Test achievement notifications

### **7.2 Test Reports**

- [ ] Generate student report
- [ ] Verify PDF content
- [ ] Test download
- [ ] Test from different roles (teacher/guardian)
- [ ] Verify date ranges work

### **7.3 Create Tests**

**File:** `backend/tests/notifications.test.js`

```javascript
// Add tests for notification service
// Test token registration
// Test sending notifications
// Test cleanup
```

**File:** `backend/tests/reports.test.js`

```javascript
// Add tests for report generation
// Test PDF creation
// Test data accuracy
// Test permissions
```

**Success Criteria:**

- ✅ All tests passing
- ✅ Manual testing complete
- ✅ No critical bugs

---

# ✅ COMPLETION CHECKLIST

## **Push Notifications (8%):**

- [ ] Firebase project created
- [ ] Backend service implemented
- [ ] Push token management working
- [ ] Frontend integration complete
- [ ] Notifications sent on rewards
- [ ] Notifications sent on achievements
- [ ] Tap navigation working
- [ ] Tests passing

## **Reports System (7%):**

- [ ] PDF generation service created
- [ ] Student report working
- [ ] Report controller implemented
- [ ] StudentDetailScreen created
- [ ] Download functionality working
- [ ] Navigation from classes working
- [ ] Tests passing

## **Final Steps:**

- [ ] Update documentation
- [ ] Run full test suite
- [ ] Update progress report (85% → 100%)
- [ ] Commit all changes
- [ ] Tag release v1.3 (Phase 3 Complete)

---

# 🎯 EXPECTED RESULTS

## **After Completion:**

- ✅ **Phase 3: 85% → 100%** (+15%)
- ✅ **Overall App: 88.5% → 90.7%** (+2.2%)
- ✅ **New Features:**
  - Server-side push notifications
  - PDF report generation
  - StudentDetailScreen
  - Complete monitoring system

## **Updated Metrics:**

- **Backend Tests:** 348 → 360+ (add notification & report tests)
- **API Endpoints:** 76+ → 80+ (notifications + reports)
- **Frontend Screens:** 25 → 26 (StudentDetailScreen)

---

# 💡 TIPS & BEST PRACTICES

## **Push Notifications:**

- Keep notification messages concise (<50 chars)
- Always include action data for navigation
- Test on both iOS and Android
- Handle permission denial gracefully
- Clean up expired tokens regularly

## **PDF Reports:**

- Keep reports under 5 pages
- Use charts/graphs for visual appeal
- Include date range clearly
- Add school/organization branding
- Implement report expiry (24 hours)

## **Testing:**

- Test on physical devices (not simulator)
- Test with different user roles
- Test edge cases (no data, invalid dates)
- Test concurrent notifications
- Monitor memory usage

---

**Plan Created:** November 30, 2025  
**Estimated Timeline:** 2-3 days (16-20 hours)  
**Cost:** $0 (No cloud services needed yet)  
**Priority:** HIGH (Complete Phase 3 before deployment)

🚀 **Ready to start? Begin with Firebase setup!**
