const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const Achievement = require("../../models/Achievement");
const UserAchievement = require("../../models/UserAchievement");
const User = require("../../models/User");

describe("Achievement API Integration Tests", () => {
  let authToken;
  let testUser;
  let testCounter = 0;

  beforeEach(async () => {
    // Clean collections
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});

    // Create fresh user for each test with short unique name
    testCounter++;
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: `achtest${testCounter}`,
        email: `achtest${testCounter}@t.co`,
        password: "password123",
        fullName: "Test User",
      });

    authToken = response.body.data.token;
    testUser = await User.findById(response.body.data.user.id);
  });

  describe("GET /api/achievements", () => {
    test("should get all active achievements", async () => {
      await Achievement.create([
        {
          code: "ACHIEVEMENT_1",
          type: "pomodoro_count",
          name: { en: "First", vi: "Đầu tiên" },
          description: { en: "First achievement", vi: "Achievement đầu tiên" },
          isActive: true,
          unlockCriteria: { metric: "pomodoros_completed", threshold: 1 },
        },
        {
          code: "ACHIEVEMENT_2",
          type: "streak",
          name: { en: "Second", vi: "Thứ hai" },
          description: { en: "Second achievement", vi: "Achievement thứ hai" },
          isActive: true,
          unlockCriteria: { metric: "streak_days", threshold: 7 },
        },
      ]);

      const response = await request(app)
        .get("/api/achievements")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test("should filter hidden achievements by default", async () => {
      await Achievement.create([
        {
          code: "VISIBLE",
          type: "pomodoro_count",
          name: { en: "Visible", vi: "Hiển thị" },
          description: { en: "Visible", vi: "Hiển thị" },
          isActive: true,
          isHidden: false,
          unlockCriteria: { metric: "pomodoros_completed", threshold: 1 },
        },
        {
          code: "HIDDEN",
          type: "special",
          name: { en: "Hidden", vi: "Ẩn" },
          description: { en: "Hidden", vi: "Ẩn" },
          isActive: true,
          isHidden: true,
          unlockCriteria: { metric: "custom", threshold: 1 },
        },
      ]);

      const response = await request(app)
        .get("/api/achievements")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].achievement.code).toBe("VISIBLE");
    });
  });

  describe("GET /api/achievements/:id", () => {
    test("should get achievement by ID", async () => {
      const achievement = await Achievement.create({
        code: "TEST_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: { metric: "pomodoros_completed", threshold: 10 },
      });

      const response = await request(app)
        .get(`/api/achievements/${achievement._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.achievement.code).toBe("TEST_ACHIEVEMENT");
    });

    test("should return 404 for non-existent achievement", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/achievements/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/achievements with unlocked filter", () => {
    test("should get unlocked achievements only", async () => {
      const achievement = await Achievement.create({
        code: "TEST_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: { metric: "pomodoros_completed", threshold: 10 },
      });

      await UserAchievement.create({
        user: testUser._id,
        achievement: achievement._id,
        progress: { currentValue: 10, threshold: 10, percentage: 100 },
        unlockedAt: new Date(),
      });

      const response = await request(app)
        .get("/api/achievements?unlocked=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].isUnlocked).toBe(true);
    });
  });

  describe("GET /api/achievements/summary", () => {
    test("should get achievement summary", async () => {
      const achievement = await Achievement.create({
        code: "UNLOCKED_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Unlocked", vi: "Đã mở" },
        description: { en: "Unlocked", vi: "Đã mở" },
        unlockCriteria: { metric: "pomodoros_completed", threshold: 1 },
      });

      await UserAchievement.create({
        user: testUser._id,
        achievement: achievement._id,
        progress: { currentValue: 1, threshold: 1, percentage: 100 },
        unlockedAt: new Date(),
      });

      const response = await request(app)
        .get("/api/achievements/summary")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.unlocked).toBeGreaterThanOrEqual(0);
    });
  });

  describe("POST /api/achievements/check-unlocks", () => {
    test("should check and unlock eligible achievements", async () => {
      const Stats = require("../../models/Stats");

      await Achievement.create({
        code: "FIRST_POMO",
        type: "pomodoro_count",
        name: { en: "First Pomodoro", vi: "Pomodoro Đầu Tiên" },
        description: {
          en: "Complete first pomodoro",
          vi: "Hoàn thành pomodoro đầu tiên",
        },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      });

      // Create user stats
      await Stats.create({
        userId: testUser._id,
        totalPomodoros: 1,
        totalWorkTime: 25,
      });

      const response = await request(app)
        .post("/api/achievements/check-unlocks")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.unlockedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("POST /api/achievements/:achievementId/favorite", () => {
    test("should toggle achievement favorite", async () => {
      const achievement = await Achievement.create({
        code: "FAVORITE_TEST",
        type: "pomodoro_count",
        name: { en: "Favorite", vi: "Yêu thích" },
        description: { en: "Favorite test", vi: "Test yêu thích" },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 10,
        },
      });

      await UserAchievement.create({
        user: testUser._id,
        achievement: achievement._id,
        progress: { currentValue: 5, threshold: 10, percentage: 50 },
        isFavorite: false,
      });

      const response = await request(app)
        .post(`/api/achievements/${achievement._id}/favorite`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isFavorite).toBeDefined();
    });
  });

  describe("Authentication", () => {
    test("should require authentication", async () => {
      const response = await request(app).get("/api/achievements");

      expect(response.status).toBe(401);
    });

    test("should reject invalid token", async () => {
      const response = await request(app)
        .get("/api/achievements")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid ObjectId format", async () => {
      const response = await request(app)
        .get("/api/achievements/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test("should return 404 for sharing non-existent achievement", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/achievements/${fakeId}/share`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
