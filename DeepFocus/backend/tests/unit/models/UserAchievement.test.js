const mongoose = require("mongoose");
const UserAchievement = require("../../../models/UserAchievement");
const Achievement = require("../../../models/Achievement");
const User = require("../../../models/User");

describe("UserAchievement Model Tests", () => {
  let testUser;
  let testAchievement;

  beforeEach(async () => {
    await UserAchievement.deleteMany({});
    await Achievement.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Create test achievement
    testAchievement = await Achievement.create({
      code: "TEST_ACHIEVEMENT",
      type: "pomodoro_count",
      name: { en: "Test Achievement", vi: "Achievement Test" },
      description: { en: "Test description", vi: "Mô tả test" },
      unlockCriteria: {
        metric: "pomodoros_completed",
        threshold: 10,
      },
    });
  });

  describe("Schema Validation", () => {
    test("should create user achievement with valid data", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          currentValue: 5,
          threshold: 10,
          percentage: 50,
        },
        unlockedAt: new Date(),
      });

      expect(userAchievement.user.toString()).toBe(testUser._id.toString());
      expect(userAchievement.achievement.toString()).toBe(
        testAchievement._id.toString()
      );
      expect(userAchievement.progress.currentValue).toBe(5);
    });

    test("should fail without required fields", async () => {
      const userAchievement = new UserAchievement({});

      let error;
      try {
        await userAchievement.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.user).toBeDefined();
      expect(error.errors.achievement).toBeDefined();
    });

    test("should set default progress to 0", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          threshold: 10,
        },
      });

      expect(userAchievement.progress.currentValue).toBe(0);
    });

    test("should require unique user-achievement combination", async () => {
      await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: { threshold: 10 },
      });

      let error;
      try {
        await UserAchievement.create({
          user: testUser._id,
          achievement: testAchievement._id,
          progress: { threshold: 10 },
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
    });
  });

  describe("Progress Tracking", () => {
    test("should track progress correctly", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          currentValue: 7,
          threshold: 10,
          percentage: 70,
        },
      });

      expect(userAchievement.progress.currentValue).toBe(7);
      expect(userAchievement.unlockedAt).toBeUndefined();
    });

    test("should set unlockedAt when achievement is completed", async () => {
      const unlockDate = new Date();
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          currentValue: 10,
          threshold: 10,
          percentage: 100,
        },
        unlockedAt: unlockDate,
      });

      expect(userAchievement.unlockedAt).toBeDefined();
      expect(userAchievement.progress.currentValue).toBe(10);
    });

    test("should allow progress to exceed threshold", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          currentValue: 15,
          threshold: 10,
          percentage: 150,
        },
      });

      expect(userAchievement.progress.currentValue).toBe(15);
    });
  });

  describe("Virtual Fields", () => {
    test("should calculate isUnlocked correctly when unlocked", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          threshold: 10,
        },
        unlockedAt: new Date(),
      });

      expect(userAchievement.isUnlocked).toBe(true);
    });

    test("should calculate isUnlocked correctly when not unlocked", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: {
          threshold: 10,
        },
      });

      expect(userAchievement.isUnlocked).toBe(false);
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      const achievement2 = await Achievement.create({
        code: "ACHIEVEMENT_2",
        type: "streak",
        name: { en: "Streak Master", vi: "Bậc Thầy Streak" },
        description: { en: "Maintain streak", vi: "Duy trì streak" },
        unlockCriteria: {
          metric: "streak_days",
          threshold: 7,
        },
      });

      await UserAchievement.create([
        {
          user: testUser._id,
          achievement: testAchievement._id,
          progress: {
            currentValue: 10,
            threshold: 10,
            percentage: 100,
          },
          unlockedAt: new Date(),
        },
        {
          user: testUser._id,
          achievement: achievement2._id,
          progress: {
            currentValue: 3,
            threshold: 7,
            percentage: 43,
          },
        },
      ]);
    });

    test("should get all user achievements", async () => {
      const achievements = await UserAchievement.find({ user: testUser._id });
      expect(achievements).toHaveLength(2);
    });

    test("should get only unlocked achievements", async () => {
      const unlocked = await UserAchievement.find({
        user: testUser._id,
        unlockedAt: { $exists: true },
      });

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].achievement.toString()).toBe(
        testAchievement._id.toString()
      );
    });

    test("should get in-progress achievements", async () => {
      const inProgress = await UserAchievement.find({
        user: testUser._id,
        unlockedAt: { $exists: false },
      });

      expect(inProgress).toHaveLength(1);
    });
  });

  describe("Timestamps", () => {
    test("should have updatedAt timestamp", async () => {
      const userAchievement = await UserAchievement.create({
        user: testUser._id,
        achievement: testAchievement._id,
        progress: { threshold: 10 },
      });

      expect(userAchievement.updatedAt).toBeDefined();
      expect(userAchievement.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Indexes", () => {
    test("should have compound index on user and achievement", async () => {
      const indexes = await UserAchievement.collection.getIndexes();
      const compoundIndex = Object.keys(indexes).find(
        (key) => key.includes("user") && key.includes("achievement")
      );
      expect(compoundIndex).toBeDefined();
    });
  });
});
