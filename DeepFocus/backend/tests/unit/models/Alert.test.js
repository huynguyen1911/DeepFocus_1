const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Alert = require("../../../models/Alert");
const User = require("../../../models/User");

let mongoServer;

beforeAll(async () => {
  // Disconnect any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Alert Model Unit Tests", () => {
  let testUser;

  beforeEach(async () => {
    await User.deleteMany({});
    await Alert.deleteMany({});

    testUser = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: "password123",
      defaultRole: "student",
      roles: [{ type: "student", isActive: true, isPrimary: true }],
    });
  });

  describe("Schema Validation", () => {
    test("should create alert with valid data", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test Alert",
        message: "This is a test alert",
      });

      expect(alert).toBeDefined();
      expect(alert.recipient.toString()).toBe(testUser._id.toString());
      expect(alert.type).toBe("info");
      expect(alert.title).toBe("Test Alert");
      expect(alert.read).toBe(false);
      expect(alert.priority).toBe(5);
    });

    test("should fail without required fields", async () => {
      await expect(
        Alert.create({
          recipient: testUser._id,
          // Missing type, title, message
        })
      ).rejects.toThrow();
    });

    test("should accept all alert types", async () => {
      const types = ["info", "warning", "success", "alert"];

      for (const type of types) {
        const alert = await Alert.create({
          recipient: testUser._id,
          type,
          title: `${type} alert`,
          message: `This is a ${type} alert`,
        });
        expect(alert.type).toBe(type);
      }
    });

    test("should store link and data", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test",
        message: "Test message",
        link: "/classes/123",
        data: { classId: "123", sessionId: "456" },
      });

      expect(alert.link).toBe("/classes/123");
      expect(alert.data.classId).toBe("123");
    });

    test("should accept custom priority", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "alert",
        title: "Urgent",
        message: "Urgent alert",
        priority: 10,
      });

      expect(alert.priority).toBe(10);
    });
  });

  describe("Instance Methods", () => {
    test("markAsRead should update read status", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test",
        message: "Test",
      });

      expect(alert.read).toBe(false);
      expect(alert.readAt).toBeUndefined();

      await alert.markAsRead();

      expect(alert.read).toBe(true);
      expect(alert.readAt).toBeDefined();
    });

    test("isRecent should return true for recent alerts", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test",
        message: "Test",
      });

      expect(alert.isRecent()).toBe(true);
    });

    test("isRecent should return false for old alerts", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test",
        message: "Test",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      });

      expect(alert.isRecent()).toBe(false);
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create multiple alerts
      await Alert.create([
        {
          recipient: testUser._id,
          type: "info",
          title: "Alert 1",
          message: "Message 1",
        },
        {
          recipient: testUser._id,
          type: "warning",
          title: "Alert 2",
          message: "Message 2",
        },
        {
          recipient: testUser._id,
          type: "success",
          title: "Alert 3",
          message: "Message 3",
          read: true,
        },
      ]);
    });

    test("getUnreadCount should return correct count", async () => {
      const count = await Alert.getUnreadCount(testUser._id);
      expect(count).toBe(2);
    });

    test("markAllAsRead should mark all unread alerts", async () => {
      await Alert.markAllAsRead(testUser._id);

      const unreadCount = await Alert.getUnreadCount(testUser._id);
      expect(unreadCount).toBe(0);

      const allAlerts = await Alert.find({ recipient: testUser._id });
      expect(allAlerts.every((a) => a.read === true)).toBe(true);
    });

    test("cleanupOldAlerts should delete old read alerts", async () => {
      // Create an old read alert
      await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Old Alert",
        message: "Old message",
        read: true,
        readAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
      });

      const result = await Alert.cleanupOldAlerts();
      expect(result.deletedCount).toBeGreaterThan(0);
    });

    test("cleanupOldAlerts should not delete unread alerts", async () => {
      const beforeCount = await Alert.countDocuments({
        recipient: testUser._id,
        read: false,
      });

      await Alert.cleanupOldAlerts();

      const afterCount = await Alert.countDocuments({
        recipient: testUser._id,
        read: false,
      });

      expect(afterCount).toBe(beforeCount);
    });
  });

  describe("Helper Methods", () => {
    test("createInfo should create info alert", async () => {
      const alert = await Alert.createInfo({
        recipient: testUser._id,
        title: "Info",
        message: "Info message",
      });

      expect(alert.type).toBe("info");
      expect(alert.priority).toBe(3);
    });

    test("createSuccess should create success alert", async () => {
      const alert = await Alert.createSuccess({
        recipient: testUser._id,
        title: "Success",
        message: "Success message",
      });

      expect(alert.type).toBe("success");
      expect(alert.priority).toBe(5);
    });

    test("createWarning should create warning alert", async () => {
      const alert = await Alert.createWarning({
        recipient: testUser._id,
        title: "Warning",
        message: "Warning message",
      });

      expect(alert.type).toBe("warning");
      expect(alert.priority).toBe(7);
    });

    test("createAlert should create alert with high priority", async () => {
      const alert = await Alert.createAlert({
        recipient: testUser._id,
        title: "Alert",
        message: "Alert message",
      });

      expect(alert.type).toBe("alert");
      expect(alert.priority).toBe(10);
    });

    test("helper methods should accept link and data", async () => {
      const alert = await Alert.createSuccess({
        recipient: testUser._id,
        title: "Success",
        message: "Success message",
        link: "/rewards/123",
        data: { rewardId: "123" },
      });

      expect(alert.link).toBe("/rewards/123");
      expect(alert.data.rewardId).toBe("123");
    });
  });
});
