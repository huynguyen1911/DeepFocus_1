const mongoose = require("mongoose");
const Achievement = require("../../../models/Achievement");

describe("Achievement Model Tests", () => {
  beforeEach(async () => {
    await Achievement.deleteMany({});
  });

  describe("Schema Validation", () => {
    test("should create achievement with valid data", async () => {
      const achievementData = {
        code: "FIRST_POMO",
        type: "pomodoro_count",
        name: { en: "First Pomodoro", vi: "Pomodoro Đầu Tiên" },
        description: {
          en: "Complete your first pomodoro",
          vi: "Hoàn thành pomodoro đầu tiên",
        },
        icon: "🍅",
        rarity: "common",
        points: 10,
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
          timeframe: "all_time",
        },
        category: "productivity",
      };

      const achievement = await Achievement.create(achievementData);
      expect(achievement.code).toBe("FIRST_POMO");
      expect(achievement.type).toBe("pomodoro_count");
      expect(achievement.unlockCriteria.metric).toBe("pomodoros_completed");
      expect(achievement.category).toBe("productivity");
    });

    test("should fail without required fields", async () => {
      const achievement = new Achievement({});

      let error;
      try {
        await achievement.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.code).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    test("should enforce enum values for type", async () => {
      const achievementData = {
        code: "TEST_ACHIEVEMENT",
        type: "invalid_type",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      };

      let error;
      try {
        await Achievement.create(achievementData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    test("should enforce enum values for unlockCriteria.metric", async () => {
      const achievementData = {
        code: "TEST_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: {
          metric: "invalid_metric",
          threshold: 1,
        },
      };

      let error;
      try {
        await Achievement.create(achievementData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors["unlockCriteria.metric"]).toBeDefined();
    });

    test("should enforce enum values for rarity", async () => {
      const achievementData = {
        code: "TEST_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        rarity: "invalid_rarity",
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      };

      let error;
      try {
        await Achievement.create(achievementData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.rarity).toBeDefined();
    });

    test("should enforce enum values for category", async () => {
      const achievementData = {
        code: "TEST_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        category: "invalid_category",
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      };

      let error;
      try {
        await Achievement.create(achievementData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    test("should enforce enum values for timeframe", async () => {
      const achievementData = {
        code: "TEST_ACHIEVEMENT",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
          timeframe: "invalid_timeframe",
        },
      };

      let error;
      try {
        await Achievement.create(achievementData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors["unlockCriteria.timeframe"]).toBeDefined();
    });

    test("should require unique code", async () => {
      const achievementData = {
        code: "UNIQUE_CODE",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      };

      await Achievement.create(achievementData);

      let error;
      try {
        await Achievement.create(achievementData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error
    });

    test("should set default values correctly", async () => {
      const achievementData = {
        code: "DEFAULT_TEST",
        type: "pomodoro_count",
        name: { en: "Test", vi: "Test" },
        description: { en: "Test", vi: "Test" },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      };

      const achievement = await Achievement.create(achievementData);

      expect(achievement.icon).toBe("🏆");
      expect(achievement.rarity).toBe("common");
      expect(achievement.points).toBe(10);
      expect(achievement.isActive).toBe(true);
      expect(achievement.isHidden).toBe(false);
      expect(achievement.category).toBe("productivity");
      expect(achievement.unlockCriteria.timeframe).toBe("all_time");
    });
  });

  describe("Achievement Types", () => {
    test("should create pomodoro_count achievement", async () => {
      const achievement = await Achievement.create({
        code: "POMO_100",
        type: "pomodoro_count",
        name: { en: "Century", vi: "Thế Kỷ" },
        description: {
          en: "Complete 100 pomodoros",
          vi: "Hoàn thành 100 pomodoros",
        },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 100,
        },
      });

      expect(achievement.type).toBe("pomodoro_count");
      expect(achievement.unlockCriteria.metric).toBe("pomodoros_completed");
    });

    test("should create streak achievement", async () => {
      const achievement = await Achievement.create({
        code: "STREAK_7",
        type: "streak",
        name: { en: "Week Warrior", vi: "Chiến Binh Tuần" },
        description: {
          en: "Maintain 7 day streak",
          vi: "Duy trì 7 ngày streak",
        },
        unlockCriteria: {
          metric: "streak_days",
          threshold: 7,
        },
      });

      expect(achievement.type).toBe("streak");
      expect(achievement.unlockCriteria.metric).toBe("streak_days");
    });

    test("should create competition achievement", async () => {
      const achievement = await Achievement.create({
        code: "COMP_WINNER",
        type: "competition_win",
        name: { en: "Champion", vi: "Vô Địch" },
        description: {
          en: "Win your first competition",
          vi: "Chiến thắng cuộc thi đầu tiên",
        },
        category: "competition",
        unlockCriteria: {
          metric: "competitions_won",
          threshold: 1,
        },
      });

      expect(achievement.type).toBe("competition_win");
      expect(achievement.category).toBe("competition");
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create test achievements
      await Achievement.create([
        {
          code: "ACTIVE_1",
          type: "pomodoro_count",
          name: { en: "Active", vi: "Hoạt động" },
          description: {
            en: "Active achievement",
            vi: "Achievement hoạt động",
          },
          isActive: true,
          unlockCriteria: { metric: "pomodoros_completed", threshold: 1 },
        },
        {
          code: "INACTIVE_1",
          type: "pomodoro_count",
          name: { en: "Inactive", vi: "Không hoạt động" },
          description: {
            en: "Inactive achievement",
            vi: "Achievement không hoạt động",
          },
          isActive: false,
          unlockCriteria: { metric: "pomodoros_completed", threshold: 1 },
        },
        {
          code: "HIDDEN_1",
          type: "special",
          name: { en: "Hidden", vi: "Ẩn" },
          description: { en: "Hidden achievement", vi: "Achievement ẩn" },
          isActive: true,
          isHidden: true,
          category: "special",
          unlockCriteria: { metric: "custom", threshold: 1 },
        },
      ]);
    });

    test("should get active achievements", async () => {
      const activeAchievements = await Achievement.getActiveAchievements();

      // getActiveAchievements filters by isHidden: false by default
      expect(activeAchievements).toHaveLength(1);
      expect(activeAchievements.every((a) => a.isActive)).toBe(true);
      expect(activeAchievements[0].code).toBe("ACTIVE_1");
    });

    test("should filter hidden achievements by default", async () => {
      const visibleAchievements = await Achievement.getActiveAchievements();

      expect(visibleAchievements).toHaveLength(1);
      expect(visibleAchievements[0].code).toBe("ACTIVE_1");
      expect(visibleAchievements[0].isHidden).toBe(false);
    });

    test("should filter by category", async () => {
      const specialAchievements = await Achievement.getActiveAchievements({
        category: "special",
      });

      // HIDDEN_1 is special but hidden, so won't appear
      expect(specialAchievements).toHaveLength(0);
    });

    test("should check unlockable achievements with achievement ID", async () => {
      // Create an achievement to check
      const achievement = await Achievement.create({
        code: "CHECKABLE",
        type: "pomodoro_count",
        name: { en: "Checkable", vi: "Kiểm tra được" },
        description: { en: "Test achievement", vi: "Achievement test" },
        unlockCriteria: {
          metric: "pomodoros_completed",
          threshold: 1,
        },
      });

      const userStats = {
        pomodoros_completed: 1,
        streak_days: 0,
        competitions_won: 0,
      };

      const result = await Achievement.checkUnlockable(
        achievement._id,
        userStats
      );

      expect(result).toBeDefined();
      expect(result.unlockable).toBeDefined();
    });
  });

  describe("Indexes", () => {
    test("should have index on code", async () => {
      const indexes = await Achievement.collection.getIndexes();
      expect(indexes).toHaveProperty("code_1");
    });

    test("should have index on type", async () => {
      const indexes = await Achievement.collection.getIndexes();
      const typeIndex = Object.keys(indexes).find((key) =>
        key.includes("type")
      );
      expect(typeIndex).toBeDefined();
    });
  });
});
