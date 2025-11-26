const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../server");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Reward = require("../../models/Reward");
const Alert = require("../../models/Alert");
const jwt = require("jsonwebtoken");

let mongoServer;
let teacherToken, studentToken, guardianToken;
let teacher, student, guardian, studentOfGuardian;
let testClass;

beforeAll(async () => {
  // Set JWT_SECRET for consistent token generation/verification
  process.env.JWT_SECRET = "test-secret";

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
  await User.deleteMany({});
  await Class.deleteMany({});
  await Reward.deleteMany({});
  await Alert.deleteMany({}); // Create test users
  teacher = await User.create({
    username: "teacher1",
    email: "teacher1@test.com",
    password: "password123",
    defaultRole: "teacher",
    roles: [{ type: "teacher", isActive: true, isPrimary: true }],
  });

  student = await User.create({
    username: "student1",
    email: "student1@test.com",
    password: "password123",
    defaultRole: "student",
    roles: [{ type: "student", isActive: true, isPrimary: true }],
  });

  guardian = await User.create({
    username: "guardian1",
    email: "guardian1@test.com",
    password: "password123",
    defaultRole: "guardian",
    roles: [
      {
        type: "guardian",
        isActive: true,
        isPrimary: true,
        children: [],
      },
    ],
  });

  studentOfGuardian = await User.create({
    username: "child1",
    email: "child1@test.com",
    password: "password123",
    defaultRole: "student",
    roles: [{ type: "student", isActive: true, isPrimary: true }],
  });

  // Add child to guardian
  if (!guardian.roles[0].children) {
    guardian.roles[0].children = [];
  }
  guardian.roles[0].children.push(studentOfGuardian._id);
  await guardian.save();

  // Create test class
  testClass = await Class.create({
    name: "Test Class",
    description: "Test class for rewards",
    createdBy: teacher._id,
    members: [
      { user: teacher._id, role: "teacher", status: "active" },
      { user: student._id, role: "student", status: "active" },
      { user: studentOfGuardian._id, role: "student", status: "active" },
    ],
  });

  // Generate tokens - MUST convert ObjectId to string before jwt.sign!
  teacherToken = jwt.sign(
    { userId: teacher._id.toString(), username: teacher.username },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );

  studentToken = jwt.sign(
    { userId: student._id.toString(), username: student.username },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );

  guardianToken = jwt.sign(
    { userId: guardian._id.toString(), username: guardian.username },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
});

describe("POST /api/rewards - Create Reward", () => {
  test("teacher should create reward successfully", async () => {
    const res = await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        studentId: student._id.toString(),
        classId: testClass._id.toString(),
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Excellent work",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.points).toBe(10);
    expect(res.body.data.type).toBe("reward");

    // Check alert was created
    const alert = await Alert.findOne({ recipient: student._id });
    expect(alert).toBeDefined();
    expect(alert.type).toBe("success");
  });

  test("teacher should create penalty successfully", async () => {
    const res = await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        studentId: student._id.toString(),
        classId: testClass._id.toString(),
        type: "penalty",
        category: "behavior",
        points: -5,
        reason: "Late submission",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.points).toBe(-5);
    expect(res.body.data.type).toBe("penalty");

    // Check warning alert was created
    const alert = await Alert.findOne({ recipient: student._id });
    expect(alert).toBeDefined();
    expect(alert.type).toBe("warning");
  });

  test("student should not be able to create reward", async () => {
    const res = await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        studentId: student._id.toString(),
        classId: testClass._id.toString(),
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
      });

    expect(res.status).toBe(403);
  });

  test("guardian should create reward for their child", async () => {
    const res = await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${guardianToken}`)
      .send({
        studentId: studentOfGuardian._id.toString(),
        classId: testClass._id.toString(),
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Good work",
      });

    expect(res.status).toBe(201);
  });

  test("guardian should not create reward for non-child", async () => {
    const res = await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${guardianToken}`)
      .send({
        studentId: student._id.toString(),
        classId: testClass._id.toString(),
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
      });

    expect(res.status).toBe(403);
  });

  test("should fail with invalid classId", async () => {
    const res = await request(app)
      .post("/api/rewards")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        studentId: student._id.toString(),
        classId: new mongoose.Types.ObjectId().toString(),
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Test",
      });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/rewards/student/:studentId/class/:classId", () => {
  beforeEach(async () => {
    // Create test rewards
    await Reward.create([
      {
        student: student._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Good work",
        givenBy: teacher._id,
      },
      {
        student: student._id,
        class: testClass._id,
        type: "reward",
        category: "attendance",
        points: 5,
        reason: "Perfect attendance",
        givenBy: teacher._id,
      },
      {
        student: student._id,
        class: testClass._id,
        type: "penalty",
        category: "behavior",
        points: -3,
        reason: "Late",
        givenBy: teacher._id,
      },
    ]);
  });

  test("teacher should get all student rewards", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/class/${testClass._id}`)
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rewards.length).toBe(3);
    expect(res.body.summary.totalPoints).toBe(12);
    expect(res.body.summary.breakdown.rewards.count).toBe(2);
    expect(res.body.summary.breakdown.penalties.count).toBe(1);
  });

  test("student should get their own rewards", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/class/${testClass._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rewards.length).toBe(3);
  });

  test("should filter by type", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/class/${testClass._id}`)
      .query({ type: "reward" })
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rewards.length).toBe(2);
    expect(res.body.rewards.every((r) => r.type === "reward")).toBe(true);
  });

  test("should filter by category", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/class/${testClass._id}`)
      .query({ category: "performance" })
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rewards.length).toBe(1);
    expect(res.body.rewards[0].category).toBe("performance");
  });

  test("should support pagination", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/class/${testClass._id}`)
      .query({ page: 1, limit: 2 })
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rewards.length).toBe(2);
    expect(res.body.pagination.totalPages).toBe(2);
  });
});

describe("GET /api/rewards/student/:studentId/summary", () => {
  beforeEach(async () => {
    const class2 = await Class.create({
      name: "Class 2",
      description: "Second class",
      createdBy: teacher._id,
      members: [
        { user: teacher._id, role: "teacher", status: "active" },
        { user: student._id, role: "student", status: "active" },
      ],
    });

    await Reward.create([
      {
        student: student._id,
        class: testClass._id,
        type: "reward",
        category: "performance",
        points: 10,
        reason: "Good work",
        givenBy: teacher._id,
      },
      {
        student: student._id,
        class: class2._id,
        type: "reward",
        category: "attendance",
        points: 5,
        reason: "Perfect",
        givenBy: teacher._id,
      },
    ]);
  });

  test("should get cross-class summary", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/summary`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.overallTotal).toBe(15);
    expect(res.body.summary.classes.length).toBe(2);
  });

  test("teacher should access student summary", async () => {
    const res = await request(app)
      .get(`/api/rewards/student/${student._id}/summary`)
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.overallTotal).toBe(15);
  });
});

describe("DELETE /api/rewards/:id - Cancel Reward", () => {
  let rewardId;

  beforeEach(async () => {
    const reward = await Reward.create({
      student: student._id,
      class: testClass._id,
      type: "reward",
      category: "performance",
      points: 10,
      reason: "Test",
      givenBy: teacher._id,
    });
    rewardId = reward._id;
  });

  test("creator should cancel reward within 24h", async () => {
    const res = await request(app)
      .delete(`/api/rewards/${rewardId}`)
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);

    const reward = await Reward.findById(rewardId);
    expect(reward.status).toBe("cancelled");

    // Check cancellation alert
    const alert = await Alert.findOne({
      recipient: student._id,
      message: /cancelled/i,
    });
    expect(alert).toBeDefined();
  });

  test("non-creator should not cancel reward", async () => {
    const otherTeacher = await User.create({
      username: "teacher2",
      email: "teacher2@test.com",
      password: "password123",
      defaultRole: "teacher",
      roles: [{ type: "teacher", isActive: true, isPrimary: true }],
    });

    const otherToken = jwt.sign(
      { userId: otherTeacher._id, username: otherTeacher.username },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .delete(`/api/rewards/${rewardId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  test("should not cancel reward after 24h", async () => {
    const oldReward = await Reward.create({
      student: student._id,
      class: testClass._id,
      type: "reward",
      category: "performance",
      points: 10,
      reason: "Test",
      givenBy: teacher._id,
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    });

    const res = await request(app)
      .delete(`/api/rewards/${oldReward._id}`)
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(400);
  });
});
