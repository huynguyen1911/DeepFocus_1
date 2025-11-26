const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const User = require("../../models/User");
const Task = require("../../models/Task");
const Class = require("../../models/Class");
const Session = require("../../models/Session");

let authToken;
let testUser;
let testTask;
let testClass;
let teacherToken;
let teacherUser;

beforeEach(async () => {
  // Create test student user
  const studentResponse = await request(app).post("/api/auth/register").send({
    username: "student1",
    email: "student1@test.com",
    password: "password123",
    fullName: "Student One",
  });

  authToken = studentResponse.body.data.token;
  testUser = await User.findById(studentResponse.body.data.user.id);

  // Create test teacher user
  const teacherResponse = await request(app).post("/api/auth/register").send({
    username: "teacher1",
    email: "teacher1@test.com",
    password: "password123",
    fullName: "Teacher One",
  });

  teacherToken = teacherResponse.body.data.token;
  teacherUser = await User.findById(teacherResponse.body.data.user.id);
  await teacherUser.addRole("teacher");
  teacherUser.defaultRole = "teacher";
  await teacherUser.save();

  // Create test class
  const classResponse = await request(app)
    .post("/api/classes")
    .set("Authorization", `Bearer ${teacherToken}`)
    .send({
      name: "Test Class",
      description: "Integration test class",
      settings: {
        autoApprove: true,
      },
    })
    .expect(201);

  testClass = await Class.findById(classResponse.body.data.class._id);

  // Add student to class
  await request(app)
    .post("/api/classes/join")
    .set("Authorization", `Bearer ${authToken}`)
    .send({ joinCode: testClass.joinCode })
    .expect(200);

  // Reload class to get updated members
  testClass = await Class.findById(testClass._id);

  // Create test task
  const taskResponse = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      title: "Test Task",
      description: "Integration test task",
      estimatedPomodoros: 4,
      priority: "medium",
    });

  testTask = await Task.findById(taskResponse.body.data._id);
});

afterEach(async () => {
  await Session.deleteMany({});
  await Task.deleteMany({});
  await Class.deleteMany({});
  await User.deleteMany({});
});

describe("Session Integration Tests", () => {
  describe("POST /api/sessions - Create Session", () => {
    it("should create a new session successfully", async () => {
      const response = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          classId: testClass._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data.task._id).toBe(testTask._id.toString());
      expect(response.body.data.class._id).toBe(testClass._id.toString());
      expect(response.body.data.type).toBe("focus");
      expect(response.body.data.targetDuration).toBe(25);
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.completed).toBe(false);
    });

    it("should prevent creating duplicate active sessions", async () => {
      // Create first session
      await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(201);

      // Try to create second active session
      const response = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(400);

      expect(response.body.message).toContain("already have an active session");
    });

    it("should fail without authentication", async () => {
      await request(app)
        .post("/api/sessions")
        .send({
          taskId: testTask._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(401);
    });

    it("should fail with invalid task ID", async () => {
      const response = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: new mongoose.Types.ObjectId().toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(404);

      expect(response.body.message).toContain("Task not found");
    });

    it("should fail when not a class member", async () => {
      // Create another user
      const otherResponse = await request(app).post("/api/auth/register").send({
        username: "other",
        email: "other@test.com",
        password: "password123",
        fullName: "Other User",
      });

      // Create task for other user
      const otherTaskResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${otherResponse.body.data.token}`)
        .send({
          title: "Other Task",
          description: "Task for other user",
          estimatedPomodoros: 2,
        });

      const response = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${otherResponse.body.data.token}`)
        .send({
          taskId: otherTaskResponse.body.data._id,
          classId: testClass._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(403);

      expect(response.body.message).toContain("not an active member");
    });
  });

  describe("PUT /api/sessions/:id/complete - Complete Session", () => {
    let activeSession;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          classId: testClass._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(201);

      activeSession = response.body.data;
    });

    it("should complete a session successfully", async () => {
      const response = await request(app)
        .put(`/api/sessions/${activeSession._id}/complete`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.isActive).toBe(false);
      expect(response.body.data.endTime).toBeDefined();
      expect(response.body.data.duration).toBeGreaterThanOrEqual(0);

      // Verify task was updated
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.completedPomodoros).toBe(1);

      // Verify class stats were updated
      const updatedClass = await Class.findById(testClass._id);
      expect(updatedClass.stats.totalPomodoros).toBe(1);
      expect(updatedClass.stats.totalFocusTime).toBeGreaterThanOrEqual(0);
    });

    it("should fail to complete another user's session", async () => {
      // Create another user
      const otherResponse = await request(app).post("/api/auth/register").send({
        username: "other2",
        email: "other2@test.com",
        password: "password123",
        fullName: "Other User",
      });

      await request(app)
        .put(`/api/sessions/${activeSession._id}/complete`)
        .set("Authorization", `Bearer ${otherResponse.body.data.token}`)
        .expect(403);
    });

    it("should fail to complete non-existent session", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .put(`/api/sessions/${fakeId}/complete`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/sessions/:id/cancel - Cancel Session", () => {
    let activeSession;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(201);

      activeSession = response.body.data;
    });

    it("should cancel a session successfully", async () => {
      const response = await request(app)
        .put(`/api/sessions/${activeSession._id}/cancel`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.isActive).toBe(false);
      expect(response.body.data.endTime).toBeDefined();
    });

    it("should not increment task completedPomodoros when cancelled", async () => {
      await request(app)
        .put(`/api/sessions/${activeSession._id}/cancel`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.completedPomodoros).toBe(0);
    });
  });

  describe("GET /api/sessions/my-sessions - Get User Sessions", () => {
    beforeEach(async () => {
      // Create multiple completed sessions
      for (let i = 0; i < 5; i++) {
        const session = await Session.create({
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
          endTime: new Date(Date.now() - i * 60 * 60 * 1000),
          type: i % 2 === 0 ? "focus" : "short-break",
          targetDuration: 25,
          duration: 25,
          completed: true,
        });
      }
    });

    it("should get user sessions with pagination", async () => {
      const response = await request(app)
        .get("/api/sessions/my-sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 3 })
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body).toHaveProperty("total", 5);
      expect(response.body).toHaveProperty("page", 1);
      expect(response.body).toHaveProperty("pages", 2);
    });

    it("should filter sessions by type", async () => {
      const response = await request(app)
        .get("/api/sessions/my-sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ type: "focus" })
        .expect(200);

      expect(response.body.data.length).toBe(3); // 3 focus sessions
      response.body.data.forEach((session) => {
        expect(session.type).toBe("focus");
      });
    });

    it("should filter sessions by completed status", async () => {
      // Create an incomplete session
      await Session.create({
        user: testUser._id,
        task: testTask._id,
        startTime: new Date(),
        type: "focus",
        targetDuration: 25,
        completed: false,
        isActive: true,
      });

      const response = await request(app)
        .get("/api/sessions/my-sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ completed: false })
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].completed).toBe(false);
    });

    it("should filter sessions by date range", async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const response = await request(app)
        .get("/api/sessions/my-sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          startDate: twoDaysAgo.toISOString(),
          endDate: oneDayAgo.toISOString(),
        })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/sessions/class/:classId - Get Class Sessions", () => {
    beforeEach(async () => {
      // Create sessions for multiple students
      const student2Response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "student2",
          email: "student2@test.com",
          password: "password123",
          fullName: "Student Two",
        });

      const student2 = await User.findById(student2Response.body.data.user.id);

      // Add student2 to class
      await request(app)
        .post("/api/classes/join")
        .set("Authorization", `Bearer ${student2Response.body.data.token}`)
        .send({ joinCode: testClass.joinCode });

      // Create sessions for both students
      await Session.create([
        {
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: new Date(),
          endTime: new Date(),
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        },
        {
          user: student2._id,
          task: testTask._id,
          class: testClass._id,
          startTime: new Date(),
          endTime: new Date(),
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        },
      ]);
    });

    it("should get class sessions for member", async () => {
      const response = await request(app)
        .get(`/api/sessions/class/${testClass._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.sessions.length).toBe(2);
      expect(response.body.sessions[0]).toHaveProperty("user");
      expect(response.body.sessions[0].user).toHaveProperty("username");
    });

    it("should fail for non-member", async () => {
      // Create another user not in class
      const outsiderResponse = await request(app)
        .post("/api/auth/register")
        .send({
          username: "outsider",
          email: "outsider@test.com",
          password: "password123",
          fullName: "Outsider",
        });

      await request(app)
        .get(`/api/sessions/class/${testClass._id}`)
        .set("Authorization", `Bearer ${outsiderResponse.body.data.token}`)
        .expect(403);
    });
  });

  describe("GET /api/sessions/stats - Get Session Stats", () => {
    beforeEach(async () => {
      // Create multiple sessions
      for (let i = 0; i < 3; i++) {
        await Session.create({
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
          endTime: new Date(Date.now() - i * 60 * 60 * 1000),
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        });
      }
    });

    it("should get user stats", async () => {
      const response = await request(app)
        .get("/api/sessions/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("totalSessions", 3);
      expect(response.body.data).toHaveProperty("totalDuration", 75);
      expect(response.body.data).toHaveProperty("avgDuration", 25);
      expect(response.body.data).toHaveProperty("focusSessions", 3);
    });

    it("should get class stats", async () => {
      const response = await request(app)
        .get("/api/sessions/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ classId: testClass._id.toString() })
        .expect(200);

      expect(response.body.data).toHaveProperty("totalSessions", 3);
      expect(response.body.data).toHaveProperty("totalDuration", 75);
      expect(response.body.data).toHaveProperty("activeStudents", 1);
    });

    it("should filter stats by date range", async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const response = await request(app)
        .get("/api/sessions/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ startDate: oneHourAgo.toISOString() })
        .expect(200);

      expect(response.body.data.totalSessions).toBeLessThanOrEqual(3);
    });
  });

  describe("GET /api/sessions/active - Get Active Session", () => {
    it("should return active session if exists", async () => {
      // Create active session
      const createResponse = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          classId: testClass._id.toString(),
          type: "focus",
          targetDuration: 25,
        });

      const response = await request(app)
        .get("/api/sessions/active")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty(
        "_id",
        createResponse.body.data._id
      );
      expect(response.body.data.isActive).toBe(true);
    });

    it("should return null if no active session", async () => {
      const response = await request(app)
        .get("/api/sessions/active")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeNull();
    });
  });

  describe("Class Statistics Integration", () => {
    beforeEach(async () => {
      // Create sessions for multiple students
      const student2Response = await request(app)
        .post("/api/auth/register")
        .send({
          username: "student3",
          email: "student3@test.com",
          password: "password123",
          fullName: "Student Three",
        });

      const student2 = await User.findById(student2Response.body.data.user.id);

      await request(app)
        .post("/api/classes/join")
        .set("Authorization", `Bearer ${student2Response.body.data.token}`)
        .send({ joinCode: testClass.joinCode });

      // Create different amounts of sessions for ranking
      for (let i = 0; i < 5; i++) {
        await Session.create({
          user: testUser._id,
          task: testTask._id,
          class: testClass._id,
          startTime: new Date(),
          endTime: new Date(),
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        });
      }

      for (let i = 0; i < 3; i++) {
        await Session.create({
          user: student2._id,
          task: testTask._id,
          class: testClass._id,
          startTime: new Date(),
          endTime: new Date(),
          type: "focus",
          targetDuration: 25,
          duration: 25,
          completed: true,
        });
      }
    });

    it("should get class leaderboard", async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass._id}/leaderboard`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(2);
      expect(response.body.leaderboard[0].totalSessions).toBe(5);
      expect(response.body.leaderboard[1].totalSessions).toBe(3);
      expect(response.body.leaderboard[0]).toHaveProperty("username");
      expect(response.body.leaderboard[0]).toHaveProperty("email");
    });

    it("should get student progress", async () => {
      const response = await request(app)
        .get(`/api/classes/${testClass._id}/student/${testUser._id}/progress`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("totalSessions", 5);
      expect(response.body).toHaveProperty("totalDuration", 125);
      expect(response.body).toHaveProperty("avgDuration", 25);
      expect(response.body).toHaveProperty("recentSessions");
      expect(response.body.recentSessions).toHaveLength(5);
    });

    it("should update class stats (teacher only)", async () => {
      const response = await request(app)
        .put(`/api/classes/${testClass._id}/update-stats`)
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.stats.totalPomodoros).toBe(8); // 5 + 3
      expect(response.body.stats.totalFocusTime).toBe(200); // 8 * 25
    });

    it("should fail to update stats as student", async () => {
      await request(app)
        .put(`/api/classes/${testClass._id}/update-stats`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe("Full Session Lifecycle", () => {
    it("should complete full session workflow", async () => {
      // 1. Create session
      const createResponse = await request(app)
        .post("/api/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          taskId: testTask._id.toString(),
          classId: testClass._id.toString(),
          type: "focus",
          targetDuration: 25,
        })
        .expect(201);

      const sessionId = createResponse.body.data._id;

      // 2. Verify active session exists
      const activeResponse = await request(app)
        .get("/api/sessions/active")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(activeResponse.body.data._id).toBe(sessionId);

      // 3. Complete session
      await request(app)
        .put(`/api/sessions/${sessionId}/complete`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // 4. Verify no active session
      const noActiveResponse = await request(app)
        .get("/api/sessions/active")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(noActiveResponse.body.data).toBeNull();

      // 5. Verify session in history
      const historyResponse = await request(app)
        .get("/api/sessions/my-sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(historyResponse.body.data).toHaveLength(1);
      expect(historyResponse.body.data[0]._id).toBe(sessionId);
      expect(historyResponse.body.data[0].completed).toBe(true);

      // 6. Verify task updated
      const taskResponse = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(taskResponse.body.data.completedPomodoros).toBe(1);

      // 7. Verify class stats updated
      const statsResponse = await request(app)
        .get("/api/sessions/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ classId: testClass._id.toString() })
        .expect(200);

      expect(statsResponse.body.data.totalSessions).toBe(1);
      expect(statsResponse.body.data.totalDuration).toBeGreaterThanOrEqual(0);
    });
  });
});
