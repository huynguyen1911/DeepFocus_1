const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../models/User");
const Class = require("../../models/Class");
const jwt = require("jsonwebtoken");

let mongoServer;
let teacherToken;
let studentToken;
let teacherId;
let studentId;
let classId;
let joinCode;
let app;

beforeAll(async () => {
  // Set JWT secret for tests
  process.env.JWT_SECRET = "test-jwt-secret-key-for-integration-tests";

  // Disconnect existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create app after mongoose is connected
  const express = require("express");
  const cors = require("cors");
  const authRoutes = require("../../routes/auth");
  const classRoutes = require("../../routes/classes");

  app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/classes", classRoutes);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  // Create test users
  const teacher = await User.create({
    username: "teacher123",
    email: "teacher@test.com",
    password: "password123",
    fullName: "Test Teacher",
    defaultRole: "teacher",
    roles: [
      { type: "teacher", isPrimary: true, isActive: true },
      { type: "student", isPrimary: false, isActive: true },
    ],
  });

  const student = await User.create({
    username: "student123",
    email: "student@test.com",
    password: "password123",
    fullName: "Test Student",
    defaultRole: "student",
    roles: [{ type: "student", isPrimary: true, isActive: true }],
  });

  teacherId = teacher._id;
  studentId = student._id;

  // Generate tokens
  teacherToken = jwt.sign(
    { userId: teacherId, email: teacher.email },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "7d" }
  );

  studentToken = jwt.sign(
    { userId: studentId, email: student.email },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "7d" }
  );
});

afterEach(async () => {
  await User.deleteMany({});
  await Class.deleteMany({});
});

describe("Class Integration Tests - Complete Flow", () => {
  test("E2E: Teacher creates class → Student joins → Teacher approves → Both see updated member list", async () => {
    // Step 1: Teacher creates class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        name: "Math 101",
        description: "Introduction to Mathematics",
      })
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.name).toBe("Math 101");
    expect(createResponse.body.data.joinCode).toBeDefined();
    expect(createResponse.body.data.joinCode).toHaveLength(6);

    classId = createResponse.body.data._id;
    joinCode = createResponse.body.data.joinCode;

    // Step 2: Verify teacher can see their class
    const teacherClassesResponse = await request(app)
      .get("/api/classes/teacher/my-classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    expect(teacherClassesResponse.body.success).toBe(true);
    expect(teacherClassesResponse.body.data).toHaveLength(1);
    expect(teacherClassesResponse.body.data[0].name).toBe("Math 101");

    // Step 3: Student requests to join with code
    const joinResponse = await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode })
      .expect(200);

    expect(joinResponse.body.success).toBe(true);
    expect(joinResponse.body.message).toContain("approval");

    // Step 4: Verify class has pending member
    const classDetailsResponse = await request(app)
      .get(`/api/classes/${classId}`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    const pendingMembers = classDetailsResponse.body.data.members.filter(
      (m) => m.status === "pending"
    );
    expect(pendingMembers).toHaveLength(1);
    expect(pendingMembers[0].user._id.toString()).toBe(studentId.toString());

    // Step 5: Teacher approves student
    const memberId = pendingMembers[0].user._id.toString();
    const approveResponse = await request(app)
      .put(`/api/classes/${classId}/members/${memberId}/approve`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    expect(approveResponse.body.success).toBe(true);

    // Step 6: Verify student is now approved
    const updatedClassResponse = await request(app)
      .get(`/api/classes/${classId}`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    const approvedMembers = updatedClassResponse.body.data.members.filter(
      (m) => m.status === "active"
    );
    expect(approvedMembers).toHaveLength(2); // Teacher + Student

    // Step 7: Verify student can see the class in their list
    const studentClassesResponse = await request(app)
      .get("/api/classes/student/my-classes")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200);

    expect(studentClassesResponse.body.success).toBe(true);
    expect(studentClassesResponse.body.data).toHaveLength(1);
    expect(studentClassesResponse.body.data[0].name).toBe("Math 101");

    // Step 8: Verify student profile updated
    const studentProfile = await User.findById(studentId);
    expect(studentProfile.studentProfile.joinedClasses).toHaveLength(1);
    expect(studentProfile.studentProfile.joinedClasses[0].toString()).toBe(
      classId
    );
  });

  test("Edge Case: Student cannot join with expired code", async () => {
    // Create class with expired join code
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 8); // 8 days ago

    const classData = await Class.create({
      name: "Expired Class",
      description: "Test expired code",
      createdBy: teacherId,
      joinCode: "EXP123",
      joinCodeExpiry: expiredDate,
      members: [
        {
          user: teacherId,
          role: "teacher",
          status: "active",
        },
      ],
    });

    // Try to join with expired code
    const joinResponse = await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: "EXP123" })
      .expect(400);

    expect(joinResponse.body.success).toBe(false);
    expect(joinResponse.body.message).toContain("expired");
  });

  test("Edge Case: Student cannot join same class twice", async () => {
    // Create class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    const code = createResponse.body.data.joinCode;

    // First join request
    await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: code })
      .expect(200);

    // Second join request should fail
    const secondJoinResponse = await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: code })
      .expect(400);

    expect(secondJoinResponse.body.success).toBe(false);
    expect(secondJoinResponse.body.message).toContain("already");
  });

  test("Edge Case: Invalid join code returns error", async () => {
    const joinResponse = await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: "INVALID" })
      .expect(404);

    expect(joinResponse.body.success).toBe(false);
    expect(joinResponse.body.message).toContain("Invalid join code");
  });

  test("Edge Case: Only teacher can approve requests", async () => {
    // Create class as teacher
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    const code = createResponse.body.data.joinCode;
    classId = createResponse.body.data._id;

    // Create another student
    const student2 = await User.create({
      username: "student2",
      email: "student2@test.com",
      password: "password123",
      fullName: "Test Student 2",
      defaultRole: "student",
      roles: [{ type: "student", isPrimary: true, isActive: true }],
    });

    const student2Token = jwt.sign(
      { userId: student2._id, email: student2.email },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "7d" }
    );

    // Student joins
    await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: code })
      .expect(200);

    // Another student tries to approve (should fail) - use studentId not member._id
    const approveResponse = await request(app)
      .put(`/api/classes/${classId}/members/${studentId}/approve`)
      .set("Authorization", `Bearer ${student2Token}`)
      .expect(403);

    expect(approveResponse.body.success).toBe(false);
  });

  test("Edge Case: Cannot remove class creator", async () => {
    // Create class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    classId = createResponse.body.data._id;

    // Try to remove creator (use teacherId not member._id)
    const removeResponse = await request(app)
      .delete(`/api/classes/${classId}/members/${teacherId}`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(400);

    expect(removeResponse.body.success).toBe(false);
    expect(removeResponse.body.message).toContain("creator");
  });

  test("Teacher can regenerate join code", async () => {
    // Create class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    classId = createResponse.body.data._id;
    const oldCode = createResponse.body.data.joinCode;

    // Regenerate code
    const regenerateResponse = await request(app)
      .post(`/api/classes/${classId}/regenerate-code`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    expect(regenerateResponse.body.success).toBe(true);
    expect(regenerateResponse.body.data.joinCode).toBeDefined();
    expect(regenerateResponse.body.data.joinCode).not.toBe(oldCode);
    expect(regenerateResponse.body.data.joinCode).toHaveLength(6);

    // Old code should not work
    const joinResponse = await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: oldCode })
      .expect(404);

    expect(joinResponse.body.success).toBe(false);
  });

  test("Teacher can remove approved member", async () => {
    // Create class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    classId = createResponse.body.data._id;
    const code = createResponse.body.data.joinCode;

    // Student joins and gets approved
    await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: code })
      .expect(200);

    const classData = await Class.findById(classId);
    const studentMember = classData.members.find(
      (m) => m.user.toString() === studentId.toString()
    );

    await request(app)
      .put(`/api/classes/${classId}/members/${studentId}/approve`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    // Remove member (use studentId not member._id)
    const removeResponse = await request(app)
      .delete(`/api/classes/${classId}/members/${studentId}`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    expect(removeResponse.body.success).toBe(true);

    // Verify member removed from class
    const updatedClass = await Class.findById(classId);
    const removedMember = updatedClass.members.find(
      (m) => m.user.toString() === studentId.toString()
    );
    expect(removedMember).toBeUndefined();

    // Verify removed from student profile
    const studentProfile = await User.findById(studentId);
    expect(studentProfile.studentProfile.joinedClasses).toHaveLength(0);
  });

  test("Teacher can reject join request", async () => {
    // Create class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    classId = createResponse.body.data._id;
    const code = createResponse.body.data.joinCode;

    // Student joins
    await request(app)
      .post("/api/classes/join")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ joinCode: code })
      .expect(200);

    // Reject request (use studentId not member._id)
    const rejectResponse = await request(app)
      .put(`/api/classes/${classId}/members/${studentId}/reject`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    expect(rejectResponse.body.success).toBe(true);

    // Verify member removed
    const updatedClass = await Class.findById(classId);
    const rejectedMember = updatedClass.members.find(
      (m) => m.user.toString() === studentId.toString()
    );
    expect(rejectedMember).toBeUndefined();
  });

  test("Teacher can delete class", async () => {
    // Create class
    const createResponse = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "Test Class" })
      .expect(201);

    classId = createResponse.body.data._id;

    // Delete class
    const deleteResponse = await request(app)
      .delete(`/api/classes/${classId}`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);

    // Verify class deleted
    const deletedClass = await Class.findById(classId);
    expect(deletedClass).toBeNull();

    // Verify removed from teacher profile
    const teacherProfile = await User.findById(teacherId);
    expect(teacherProfile.teacherProfile.createdClasses).toHaveLength(0);
  });
});
