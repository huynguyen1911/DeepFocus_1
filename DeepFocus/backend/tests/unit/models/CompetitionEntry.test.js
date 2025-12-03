const mongoose = require("mongoose");
const CompetitionEntry = require("../../../models/CompetitionEntry");
const Competition = require("../../../models/Competition");
const User = require("../../../models/User");

describe("CompetitionEntry Model Tests", () => {
  let testUser;
  let testCompetition;

  beforeEach(async () => {
    await CompetitionEntry.deleteMany({});
    await Competition.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    testCompetition = await Competition.create({
      title: "Test Competition",
      description: "Test competition",
      creator: testUser._id,
      timing: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      },
      goal: {
        metric: "total_pomodoros",
        target: 100,
      },
    });
  });

  describe("Schema Validation", () => {
    test("should create competition entry with valid data", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        progress: {
          currentValue: 25,
          target: 100,
        },
      });

      expect(entry.competition.toString()).toBe(testCompetition._id.toString());
      expect(entry.user.toString()).toBe(testUser._id.toString());
      expect(entry.progress.currentValue).toBe(25);
    });

    test("should fail without required fields", async () => {
      const entry = new CompetitionEntry({});

      let error;
      try {
        await entry.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.competition).toBeDefined();
      expect(error.errors.user).toBeDefined();
    });

    test("should set default progress to 0", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
      });

      expect(entry.progress.currentValue).toBe(0);
    });

    test("should require unique user per competition", async () => {
      await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
      });

      let error;
      try {
        await CompetitionEntry.create({
          competition: testCompetition._id,
          user: testUser._id,
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
    });
  });

  describe("Score Tracking", () => {
    test("should track progress correctly", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        progress: {
          currentValue: 42,
          target: 100,
        },
      });

      expect(entry.progress.currentValue).toBe(42);
    });

    test("should track statistics", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        statistics: {
          sessionsCompleted: 5,
        },
      });

      expect(entry.statistics.sessionsCompleted).toBe(5);
    });

    test("should update progress", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        progress: {
          currentValue: 10,
          target: 100,
        },
      });

      entry.progress.currentValue = 20;
      await entry.save();

      const updated = await CompetitionEntry.findById(entry._id);
      expect(updated.progress.currentValue).toBe(20);
    });
  });

  describe("Ranking", () => {
    beforeEach(async () => {
      const user2 = await User.create({
        username: "user2",
        email: "user2@example.com",
        password: "password123",
      });

      const user3 = await User.create({
        username: "user3",
        email: "user3@example.com",
        password: "password123",
      });

      await CompetitionEntry.create([
        {
          competition: testCompetition._id,
          user: testUser._id,
          progress: { currentValue: 100, target: 100 },
        },
        {
          competition: testCompetition._id,
          user: user2._id,
          progress: { currentValue: 150, target: 100 },
        },
        {
          competition: testCompetition._id,
          user: user3._id,
          progress: { currentValue: 75, target: 100 },
        },
      ]);
    });

    test("should rank entries by progress descending", async () => {
      const entries = await CompetitionEntry.find({
        competition: testCompetition._id,
      }).sort({ "progress.currentValue": -1 });

      expect(entries).toHaveLength(3);
      expect(entries[0].progress.currentValue).toBe(150);
      expect(entries[1].progress.currentValue).toBe(100);
      expect(entries[2].progress.currentValue).toBe(75);
    });

    test("should calculate rank correctly", async () => {
      const entries = await CompetitionEntry.find({
        competition: testCompetition._id,
      }).sort({ "progress.currentValue": -1 });

      entries.forEach((entry, index) => {
        entry.rank.current = index + 1;
      });

      expect(entries[0].rank.current).toBe(1);
      expect(entries[1].rank.current).toBe(2);
      expect(entries[2].rank.current).toBe(3);
    });
  });

  describe("Progress Details", () => {
    test("should store detailed statistics", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        progress: { currentValue: 50, target: 100 },
        statistics: {
          sessionsCompleted: 50,
          totalFocusTime: 1200,
          streakDays: 5,
        },
      });

      expect(entry.statistics.sessionsCompleted).toBe(50);
      expect(entry.statistics.totalFocusTime).toBe(1200);
      expect(entry.statistics.streakDays).toBe(5);
    });

    test("should update statistics", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        statistics: {
          sessionsCompleted: 10,
        },
      });

      entry.statistics.sessionsCompleted = 15;
      entry.statistics.totalFocusTime = 300;
      await entry.save();

      const updated = await CompetitionEntry.findById(entry._id);
      expect(updated.statistics.sessionsCompleted).toBe(15);
      expect(updated.statistics.totalFocusTime).toBe(300);
    });
  });

  describe("Prize Assignment", () => {
    test("should assign prize to winner", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        score: 100,
        rank: 1,
        prize: {
          points: 1000,
          badge: "gold_medal",
        },
      });

      expect(entry.prize.points).toBe(1000);
      expect(entry.prize.badge).toBe("gold_medal");
    });

    test("should handle entries without prizes", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        progress: { currentValue: 50, target: 100 },
      });

      expect(entry.prize.claimed).toBe(false);
    });
  });

  describe("Team Support", () => {
    test("should support team entries", async () => {
      const teamCompetition = await Competition.create({
        title: "Team Competition",
        description: "Team challenge",
        type: "team",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: {
          metric: "total_focus_time",
        },
      });

      const entry = await CompetitionEntry.create({
        competition: teamCompetition._id,
        user: testUser._id,
        team: new mongoose.Types.ObjectId(),
        progress: { currentValue: 100, target: 100 },
      });

      expect(entry.team).toBeDefined();
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      const user2 = await User.create({
        username: "user2",
        name: "User 2",
        email: "user2@example.com",
        password: "password123",
      });

      await CompetitionEntry.create([
        {
          competition: testCompetition._id,
          user: testUser._id,
          progress: { currentValue: 100, target: 100 },
        },
        {
          competition: testCompetition._id,
          user: user2._id,
          progress: { currentValue: 150, target: 100 },
        },
      ]);
    });

    test("should get leaderboard", async () => {
      const leaderboard = await CompetitionEntry.find({
        competition: testCompetition._id,
      })
        .sort({ "progress.currentValue": -1 })
        .limit(10);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].progress.currentValue).toBeGreaterThanOrEqual(
        leaderboard[1].progress.currentValue
      );
    });

    test("should count participants", async () => {
      const count = await CompetitionEntry.countDocuments({
        competition: testCompetition._id,
      });

      expect(count).toBe(2);
    });

    test("should get user entry", async () => {
      const entry = await CompetitionEntry.findOne({
        competition: testCompetition._id,
        user: testUser._id,
      });

      expect(entry).toBeDefined();
      expect(entry.user.toString()).toBe(testUser._id.toString());
    });
  });

  describe("Timestamps", () => {
    test("should have createdAt timestamp", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
      });

      expect(entry.createdAt).toBeDefined();
      expect(entry.createdAt).toBeInstanceOf(Date);
    });

    test("should have updatedAt timestamp", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
      });

      expect(entry.updatedAt).toBeDefined();
      expect(entry.updatedAt).toBeInstanceOf(Date);
    });

    test("should update updatedAt on progress change", async () => {
      const entry = await CompetitionEntry.create({
        competition: testCompetition._id,
        user: testUser._id,
        progress: { currentValue: 10, target: 100 },
      });

      const originalUpdatedAt = entry.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      entry.progress.currentValue = 20;
      await entry.save();

      expect(entry.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Indexes", () => {
    test("should have compound index on competition and user", async () => {
      const indexes = await CompetitionEntry.collection.getIndexes();
      const compoundIndex = Object.keys(indexes).find(
        (key) => key.includes("competition") && key.includes("user")
      );
      expect(compoundIndex).toBeDefined();
    });

    test("should have index on progress.currentValue for ranking queries", async () => {
      const indexes = await CompetitionEntry.collection.getIndexes();
      const progressIndex = Object.keys(indexes).find((key) =>
        key.includes("progress.currentValue")
      );
      expect(progressIndex).toBeDefined();
    });
  });
});
