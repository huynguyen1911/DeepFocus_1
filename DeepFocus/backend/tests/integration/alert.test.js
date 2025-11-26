const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

// Mock authMiddleware - must be before app import
jest.mock("../../middleware/auth", () => ({
  authMiddleware: (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      const mockJwt = require("jsonwebtoken");
      const decoded = mockJwt.verify(
        token,
        process.env.JWT_SECRET || "test-secret"
      );
      req.user = { _id: decoded.userId };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  },
}));

const app = require("../../server");
const Alert = require("../../models/Alert");
const User = require("../../models/User");

let mongoServer;
let testUser;
let authToken;

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

beforeEach(async () => {
  // Create test user
  testUser = await User.create({
    username: "testuser",
    email: "test@example.com",
    password: "Password123!",
    roles: [{ type: "student", isActive: true, isPrimary: true }],
  });

  // Generate auth token
  authToken = jwt.sign(
    { userId: testUser._id },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
});

afterEach(async () => {
  await Alert.deleteMany({});
  await User.deleteMany({});
});

describe("Alert API Integration Tests", () => {
  describe("GET /api/alerts", () => {
    it("should get user's alerts", async () => {
      // Create test alerts
      await Alert.create([
        {
          recipient: testUser._id,
          type: "info",
          title: "Test Alert 1",
          message: "This is test alert 1",
        },
        {
          recipient: testUser._id,
          type: "success",
          title: "Test Alert 2",
          message: "This is test alert 2",
          read: true,
        },
        {
          recipient: testUser._id,
          type: "warning",
          title: "Test Alert 3",
          message: "This is test alert 3",
        },
      ]);

      const response = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.unreadCount).toBe(2);
    });

    it("should filter unread alerts only", async () => {
      // Create test alerts
      await Alert.create([
        {
          recipient: testUser._id,
          type: "info",
          title: "Unread Alert",
          message: "This is unread",
        },
        {
          recipient: testUser._id,
          type: "success",
          title: "Read Alert",
          message: "This is read",
          read: true,
        },
      ]);

      const response = await request(app)
        .get("/api/alerts?unreadOnly=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].read).toBe(false);
    });

    it("should filter alerts by type", async () => {
      // Create test alerts
      await Alert.create([
        {
          recipient: testUser._id,
          type: "info",
          title: "Info Alert",
          message: "This is info",
        },
        {
          recipient: testUser._id,
          type: "warning",
          title: "Warning Alert",
          message: "This is warning",
        },
      ]);

      const response = await request(app)
        .get("/api/alerts?type=warning")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe("warning");
    });

    it("should paginate alerts", async () => {
      // Create 25 alerts
      const alerts = Array.from({ length: 25 }, (_, i) => ({
        recipient: testUser._id,
        type: "info",
        title: `Alert ${i + 1}`,
        message: `Message ${i + 1}`,
      }));

      await Alert.create(alerts);

      const response = await request(app)
        .get("/api/alerts?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.total).toBe(25);
      expect(response.body.pagination.pages).toBe(3);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/api/alerts");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/alerts/:id/read", () => {
    it("should mark alert as read", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test Alert",
        message: "Test message",
      });

      const response = await request(app)
        .put(`/api/alerts/${alert._id}/read`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.read).toBe(true);
      expect(response.body.data.readAt).toBeDefined();
    });

    it("should handle already read alert", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test Alert",
        message: "Test message",
        read: true,
        readAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/alerts/${alert._id}/read`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("already marked as read");
    });

    it("should fail for non-existent alert", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/alerts/${fakeId}/read`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it("should fail to mark another user's alert", async () => {
      const otherUser = await User.create({
        username: "otheruser",
        email: "other@example.com",
        password: "Password123!",
        roles: [{ type: "student", isActive: true, isPrimary: true }],
      });

      const alert = await Alert.create({
        recipient: otherUser._id,
        type: "info",
        title: "Other's Alert",
        message: "Test message",
      });

      const response = await request(app)
        .put(`/api/alerts/${alert._id}/read`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/alerts/read-all", () => {
    it("should mark all alerts as read", async () => {
      // Create unread alerts
      await Alert.create([
        {
          recipient: testUser._id,
          type: "info",
          title: "Alert 1",
          message: "Message 1",
        },
        {
          recipient: testUser._id,
          type: "info",
          title: "Alert 2",
          message: "Message 2",
        },
        {
          recipient: testUser._id,
          type: "info",
          title: "Alert 3",
          message: "Message 3",
        },
      ]);

      const response = await request(app)
        .put("/api/alerts/read-all")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(3);

      // Verify all alerts are read
      const alerts = await Alert.find({ recipient: testUser._id });
      expect(alerts.every((a) => a.read)).toBe(true);
    });

    it("should return 0 modified when all already read", async () => {
      // Create read alerts
      await Alert.create([
        {
          recipient: testUser._id,
          type: "info",
          title: "Alert 1",
          message: "Message 1",
          read: true,
        },
      ]);

      const response = await request(app)
        .put("/api/alerts/read-all")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.modifiedCount).toBe(0);
    });
  });

  describe("DELETE /api/alerts/:id", () => {
    it("should delete an alert", async () => {
      const alert = await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Test Alert",
        message: "Test message",
      });

      const response = await request(app)
        .delete(`/api/alerts/${alert._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deleted
      const deletedAlert = await Alert.findById(alert._id);
      expect(deletedAlert).toBeNull();
    });

    it("should fail to delete non-existent alert", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/alerts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it("should fail to delete another user's alert", async () => {
      const otherUser = await User.create({
        username: "otheruser",
        email: "other@example.com",
        password: "Password123!",
        roles: [{ type: "student", isActive: true, isPrimary: true }],
      });

      const alert = await Alert.create({
        recipient: otherUser._id,
        type: "info",
        title: "Other's Alert",
        message: "Test message",
      });

      const response = await request(app)
        .delete(`/api/alerts/${alert._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/alerts/cleanup", () => {
    it("should delete old read alerts (> 30 days)", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      // Create old read alert
      await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Old Alert",
        message: "Old message",
        read: true,
        createdAt: oldDate,
      });

      // Create recent alert
      await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Recent Alert",
        message: "Recent message",
        read: true,
      });

      const response = await request(app)
        .delete("/api/alerts/cleanup")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.deletedCount).toBe(1);

      // Verify recent alert still exists
      const alerts = await Alert.find({ recipient: testUser._id });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].title).toBe("Recent Alert");
    });

    it("should not delete unread old alerts", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      // Create old unread alert
      await Alert.create({
        recipient: testUser._id,
        type: "info",
        title: "Old Unread Alert",
        message: "Old message",
        read: false,
        createdAt: oldDate,
      });

      const response = await request(app)
        .delete("/api/alerts/cleanup")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.deletedCount).toBe(0);

      // Verify alert still exists
      const alerts = await Alert.find({ recipient: testUser._id });
      expect(alerts).toHaveLength(1);
    });
  });
});
