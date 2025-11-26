const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Reward = require("../../../models/Reward");
const User = require("../../../models/User");
const Class = require("../../../models/Class");

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

describe("Reward Model Unit Tests", () => {
  let testTeacher;
  let testStudent;
  let testClass;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Class.deleteMany({});
    await Reward.deleteMany({});

    // Create test teacher
    testTeacher = await User.create({
      username: "teacher1",
      email: "teacher1@test.com",
      password: "password123",
      defaultRole: "teacher",
      roles: [{ type: "teacher", isActive: true, isPrimary: true }],
    });

    // Create test student
    testStudent = await User.create({
      username: "student1",
      email: "student1@test.com",
      password: "password123",
      defaultRole: "student",
      roles: [{ type: "student", isActive: true, isPrimary: true }],
    });

    // Create test class
    testClass = await Class.create({
      name: "Test Class",
      description: "Test class for rewards",
      createdBy: testTeacher._id,
      members: [
        {
          user: testTeacher._id,
          role: "teacher",
          status: "active",
        },
        {
          user: testStudent._id,
          role: "student",
          status: "active",
        },
      ],
    });
  });

  describe("Schema Validation", () => {
    test("should create reward with valid data", async () => {
      const reward = await Reward.create({
        student: testStudent._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Excellent work on the assignment",
        givenBy: testTeacher._id,
      });

      expect(reward).toBeDefined();
      expect(reward.student.toString()).toBe(testStudent._id.toString());
      expect(reward.type).toBe("reward");
      expect(reward.points).toBe(10);
      expect(reward.status).toBe("approved");
    });

    test("should create penalty with negative points", async () => {
      const penalty = await Reward.create({
        student: testStudent._id,
        class: testClass._id,
        type: "penalty",
        category: "behavior",
        points: -5,
        reason: "Late submission",
        givenBy: testTeacher._id,
      });

      expect(penalty).toBeDefined();
      expect(penalty.type).toBe("penalty");
      expect(penalty.points).toBe(-5);
    });

    test("should fail without required fields", async () => {
      await expect(
        Reward.create({
          student: testStudent._id,
          // Missing class, type, category, points, reason, givenBy
        })
      ).rejects.toThrow();
    });

    test("should fail if reward has negative points", async () => {
      await expect(
        Reward.create({
          student: testStudent._id,
          class: testClass._id,
          type: "reward",
          category: "performance",
          points: -10, // Reward should be positive
          reason: "Test",
          givenBy: testTeacher._id,
        })
      ).rejects.toThrow();
    });

    test("should fail if penalty has positive points", async () => {
      await expect(
        Reward.create({
          student: testStudent._id,
          class: testClass._id,
          type: "penalty",
          category: "behavior",
          points: 10, // Penalty should be negative
          reason: "Test",
          givenBy: testTeacher._id,
        })
      ).rejects.toThrow();
    });

    test("should fail if points exceed 100", async () => {
      await expect(
        Reward.create({
          student: testStudent._id,
          class: testClass._id,
          type: "reward",
          category: "achievement",
          points: 101,
          reason: "Test",
          givenBy: testTeacher._id,
        })
      ).rejects.toThrow();
    });

    test("should fail if points are less than -100", async () => {
      await expect(
        Reward.create({
          student: testStudent._id,
          class: testClass._id,
          type: "penalty",
          category: "behavior",
          points: -101,
          reason: "Test",
          givenBy: testTeacher._id,
        })
      ).rejects.toThrow();
    });

    test("should fail if student is not a class member", async () => {
      const nonMember = await User.create({
        username: "nonmember",
        email: "nonmember@test.com",
        password: "password123",
        defaultRole: "student",
        roles: [{ type: "student", isActive: true, isPrimary: true }],
      });

      await expect(
        Reward.create({
          student: nonMember._id,
          class: testClass._id,
          type: "reward",
          category: "performance",
          points: 10,
          reason: "Test",
          givenBy: testTeacher._id,
        })
      ).rejects.toThrow("Student is not an active member of this class");
    });

    test("should fail if user gives reward to themselves", async () => {
      await expect(
        Reward.create({
          student: testTeacher._id,
          class: testClass._id,
          type: "reward",
          category: "performance",
          points: 10,
          reason: "Self reward",
          givenBy: testTeacher._id,
        })
      ).rejects.toThrow("Cannot give reward to yourself");
    });
  });

  describe("Instance Methods", () => {
    test("canBeCancelled should return true for recent rewards", async () => {
      const reward = await Reward.create({
        student: testStudent._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
        givenBy: testTeacher._id,
      });

      expect(reward.canBeCancelled()).toBe(true);
    });

    test("canBeCancelled should return false for old rewards", async () => {
      const reward = await Reward.create({
        student: testStudent._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
        givenBy: testTeacher._id,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      });

      expect(reward.canBeCancelled()).toBe(false);
    });

    test("canBeCancelled should return false for cancelled rewards", async () => {
      const reward = await Reward.create({
        student: testStudent._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
        givenBy: testTeacher._id,
        status: "cancelled",
      });

      expect(reward.canBeCancelled()).toBe(false);
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create multiple rewards
      await Reward.create([
        {
          student: testStudent._id,
          class: testClass._id,
          type: "reward",
          category: "performance",
          points: 10,
          reason: "Good work",
          givenBy: testTeacher._id,
        },
        {
          student: testStudent._id,
          class: testClass._id,
          type: "reward",
          category: "attendance",
          points: 5,
          reason: "Perfect attendance",
          givenBy: testTeacher._id,
        },
        {
          student: testStudent._id,
          class: testClass._id,
          type: "penalty",
          category: "behavior",
          points: -3,
          reason: "Late",
          givenBy: testTeacher._id,
        },
      ]);
    });

    test("calculateTotalPoints should return correct totals", async () => {
      const result = await Reward.calculateTotalPoints(
        testStudent._id,
        testClass._id
      );

      expect(result.totalPoints).toBe(12); // 10 + 5 - 3
      expect(result.breakdown.rewards.total).toBe(15);
      expect(result.breakdown.rewards.count).toBe(2);
      expect(result.breakdown.penalties.total).toBe(-3);
      expect(result.breakdown.penalties.count).toBe(1);
    });

    test("getRecentRewards should return rewards sorted by date", async () => {
      const rewards = await Reward.getRecentRewards(
        testStudent._id,
        testClass._id,
        10
      );

      expect(rewards.length).toBe(3);
      expect(rewards[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        rewards[1].createdAt.getTime()
      );
    });

    test("getRecentRewards should respect limit parameter", async () => {
      const rewards = await Reward.getRecentRewards(
        testStudent._id,
        testClass._id,
        2
      );

      expect(rewards.length).toBe(2);
    });
  });

  describe("Metadata", () => {
    test("should store metadata correctly", async () => {
      const reward = await Reward.create({
        student: testStudent._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
        givenBy: testTeacher._id,
        metadata: {
          notes: "Extra credit for project",
        },
      });

      expect(reward.metadata.notes).toBe("Extra credit for project");
    });
  });
});
