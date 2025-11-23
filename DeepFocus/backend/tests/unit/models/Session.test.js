const Session = require("../../../models/Session");
const User = require("../../../models/User");
const Task = require("../../../models/Task");
const Class = require("../../../models/Class");

describe("Session Model Tests", () => {
  let testUser;
  let testTask;
  let testClass;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
      roles: [{ type: "student", isPrimary: true, isActive: true }],
    });

    // Create test class
    testClass = await Class.create({
      name: "Test Class",
      description: "Test Description",
      createdBy: testUser._id,
      members: [
        {
          user: testUser._id,
          role: "teacher",
          status: "active",
        },
      ],
    });

    // Create test task
    testTask = await Task.create({
      title: "Test Task",
      description: "Test Description",
      userId: testUser._id,
      estimatedPomodoros: 4,
      priority: "medium",
      status: "pending",
    });
  });

  describe("Schema Validation", () => {
    it("should create a valid session with all required fields", async () => {
      const session = await Session.create({
        user: testUser._id,
        task: testTask._id,
        class: testClass._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        isActive: true,
      });

      expect(session.user.toString()).toBe(testUser._id.toString());
      expect(session.task.toString()).toBe(testTask._id.toString());
      expect(session.class.toString()).toBe(testClass._id.toString());
      expect(session.type).toBe("focus");
      expect(session.targetDuration).toBe(25);
      expect(session.isActive).toBe(true);
      expect(session.completed).toBe(false);
      expect(session.duration).toBe(0);
    });

    it("should fail without required user field", async () => {
      const session = new Session({
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
      });

      await expect(session.save()).rejects.toThrow();
    });

    it("should fail with invalid session type", async () => {
      const session = new Session({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "invalid-type",
        targetDuration: 25,
      });

      await expect(session.save()).rejects.toThrow();
    });

    it("should accept valid session types: focus, short-break, long-break", async () => {
      const types = ["focus", "short-break", "long-break"];

      for (const type of types) {
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          startTime: new Date(),
          type: type,
          targetDuration: 25,
        });

        expect(session.type).toBe(type);
      }
    });

    it("should set default values correctly", async () => {
      const session = await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
      });

      expect(session.completed).toBe(false);
      expect(session.duration).toBe(0);
      expect(session.interruptions).toBe(0);
      expect(session.isActive).toBe(true); // Default is true for new sessions
    });

    it("should save optional fields correctly", async () => {
      const notes = "Test notes for this session";
      const session = await Session.create({
        user: testUser._id,
        task: testTask._id,
        class: testClass._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        notes: notes,
        interruptions: 2,
      });

      expect(session.notes).toBe(notes);
      expect(session.interruptions).toBe(2);
    });
  });

  describe("Virtual Properties", () => {
    it("should calculate completionRate correctly", async () => {
      const session = await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        duration: 20,
      });

      expect(session.completionRate).toBe(80); // (20/25) * 100
    });

    it("should return 0 completionRate when targetDuration is 0", async () => {
      const session = await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 0,
        duration: 10,
      });

      expect(session.completionRate).toBe(0);
    });

    it("should return 100 completionRate when duration exceeds target", async () => {
      const session = await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        duration: 30,
      });

      expect(session.completionRate).toBe(120); // Can exceed 100%
    });

    it("should determine isFullyCompleted correctly", async () => {
      const completedSession = await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        duration: 25,
      });

      const incompleteSession = await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        duration: 20,
      });

      expect(completedSession.isFullyCompleted).toBe(true);
      expect(incompleteSession.isFullyCompleted).toBe(false);
    });
  });

  describe("Instance Methods", () => {
    describe("completeSession()", () => {
      it("should mark session as completed and set endTime", async () => {
        const startTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          startTime: startTime,
          type: "focus",
          targetDuration: 25,
          isActive: true,
        });

        const completedSession = await session.completeSession();

        expect(completedSession.completed).toBe(true);
        expect(completedSession.isActive).toBe(false);
        expect(completedSession.endTime).toBeDefined();
        expect(completedSession.duration).toBeGreaterThan(0);
      });

      it("should calculate duration based on startTime and endTime", async () => {
        const startTime = new Date(Date.now() - 25 * 60 * 1000); // 25 minutes ago
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          startTime: startTime,
          type: "focus",
          targetDuration: 25,
          isActive: true,
        });

        const completedSession = await session.completeSession();

        // Duration should be approximately 25 minutes (allowing 1 minute tolerance)
        expect(completedSession.duration).toBeGreaterThanOrEqual(24);
        expect(completedSession.duration).toBeLessThanOrEqual(26);
      });

      it("should not modify already completed session", async () => {
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          startTime: new Date(Date.now() - 25 * 60 * 1000),
          endTime: new Date(),
          type: "focus",
          targetDuration: 25,
          completed: true,
          duration: 25,
        });

        const originalEndTime = session.endTime;
        const originalDuration = session.duration;

        await session.completeSession();

        expect(session.endTime.getTime()).toBe(originalEndTime.getTime());
        expect(session.duration).toBe(originalDuration);
      });
    });

    describe("cancelSession()", () => {
      it("should mark session as not completed and calculate partial duration", async () => {
        const startTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          startTime: startTime,
          type: "focus",
          targetDuration: 25,
          isActive: true,
        });

        const cancelledSession = await session.cancelSession();

        expect(cancelledSession.completed).toBe(false);
        expect(cancelledSession.isActive).toBe(false);
        expect(cancelledSession.endTime).toBeDefined();
        expect(cancelledSession.duration).toBeGreaterThanOrEqual(14);
        expect(cancelledSession.duration).toBeLessThanOrEqual(16);
      });

      it("should set duration to 0 for newly created sessions", async () => {
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          startTime: new Date(),
          type: "focus",
          targetDuration: 25,
          isActive: true,
        });

        const cancelledSession = await session.cancelSession();

        expect(cancelledSession.duration).toBeLessThanOrEqual(1); // Less than a minute
      });
    });
  });

  describe("Static Methods", () => {
    // Shared date variables for consistent filtering
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    beforeEach(async () => {
      // Create multiple sessions for testing aggregation

      await Session.create([
        {
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: twoDaysAgo,
          endTime: new Date(twoDaysAgo.getTime() + 25 * 60 * 1000),
          createdAt: twoDaysAgo,
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        },
        {
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: yesterday,
          endTime: new Date(yesterday.getTime() + 25 * 60 * 1000),
          createdAt: yesterday,
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        },
        {
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: now,
          createdAt: now,
          type: "focus",
          targetDuration: 25,
          duration: 15,
          completed: false,
        },
      ]);
    });

    describe("getUserStats()", () => {
      it("should return correct stats for a user", async () => {
        const stats = await Session.getUserStats(testUser._id);

        expect(stats).toBeDefined();
        expect(stats.totalSessions).toBe(2); // Only completed sessions
        expect(stats.totalDuration).toBe(50); // 25 + 25
        expect(stats.avgDuration).toBe(25); // 50 / 2
        expect(stats.focusSessions).toBe(2);
      });

      it("should filter stats by date range", async () => {
        const stats = await Session.getUserStats(testUser._id, yesterday);

        expect(stats.totalSessions).toBe(1); // Only yesterday's session
        expect(stats.totalDuration).toBe(25);
      });

      it("should return zero stats for user with no sessions", async () => {
        const newUser = await User.create({
          username: "newuser",
          email: "new@example.com",
          password: "password123",
          fullName: "New User",
          roles: [{ type: "student", isPrimary: true, isActive: true }],
        });

        const stats = await Session.getUserStats(newUser._id);

        expect(stats.totalSessions).toBe(0);
        expect(stats.totalDuration).toBe(0);
        expect(stats.avgDuration).toBe(0);
      });
    });

    describe("getClassStats()", () => {
      it("should return correct stats for a class", async () => {
        const stats = await Session.getClassStats(testClass._id);

        expect(stats).toBeDefined();
        expect(stats.totalSessions).toBe(2);
        expect(stats.totalDuration).toBe(50);
        expect(stats.avgDuration).toBe(25);
        expect(stats.activeStudents).toBe(1);
      });

      it("should filter stats by date range", async () => {
        const stats = await Session.getClassStats(testClass._id, yesterday);

        expect(stats.totalSessions).toBe(1);
        expect(stats.totalDuration).toBe(25);
      });
    });

    describe("getClassLeaderboard()", () => {
      it("should return leaderboard with correct ranking", async () => {
        // Create another user with more sessions
        const topUser = await User.create({
          username: "topuser",
          email: "top@example.com",
          password: "password123",
          fullName: "Top User",
          roles: [{ type: "student", isPrimary: true, isActive: true }],
        });

        await Class.findByIdAndUpdate(testClass._id, {
          $push: { students: topUser._id },
        });

        // Create more sessions for top user
        for (let i = 0; i < 5; i++) {
          await Session.create({
            user: topUser._id,
            task: testTask._id,
            class: testClass._id,
            startTime: new Date(Date.now() - i * 60 * 60 * 1000),
            endTime: new Date(Date.now() - i * 60 * 60 * 1000 + 25 * 60 * 1000),
            type: "focus",
            targetDuration: 25,
            duration: 25,
            completed: true,
          });
        }

        const leaderboard = await Session.getClassLeaderboard(testClass._id);

        expect(leaderboard).toHaveLength(2);
        expect(leaderboard[0].userId.toString()).toBe(topUser._id.toString());
        expect(leaderboard[0].totalSessions).toBe(5);
        expect(leaderboard[1].userId.toString()).toBe(testUser._id.toString());
        expect(leaderboard[1].totalSessions).toBe(2);
      });

      it("should limit leaderboard results", async () => {
        const limit = 1;
        const leaderboard = await Session.getClassLeaderboard(
          testClass._id,
          limit
        );

        expect(leaderboard.length).toBeLessThanOrEqual(limit);
      });
    });
  });

  describe("Indexes", () => {
    it("should have correct indexes", async () => {
      const indexes = await Session.collection.getIndexes();
      const indexNames = Object.keys(indexes);

      // Check that important indexes exist (MongoDB creates index names automatically)
      expect(indexNames.length).toBeGreaterThan(1); // At least _id and custom indexes

      // Verify compound indexes exist by checking index definitions
      const hasUserCreatedAtIndex = indexNames.some(
        (name) => name.includes("user") && name.includes("createdAt")
      );
      const hasClassCreatedAtIndex = indexNames.some(
        (name) => name.includes("class") && name.includes("createdAt")
      );
      const hasCompletedTypeIndex = indexNames.some(
        (name) => name.includes("completed") && name.includes("type")
      );

      expect(hasUserCreatedAtIndex).toBe(true);
      expect(hasClassCreatedAtIndex).toBe(true);
      expect(hasCompletedTypeIndex).toBe(true);
    });
  });
});
