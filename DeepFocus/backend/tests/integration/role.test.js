const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const roleRoutes = require("../../routes/roles");

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware - must be defined before requiring the routes
const mockAuthMiddleware = jest.fn((req, res, next) => {
  // Attach mock user to request
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "test-secret"
      );
      req.user = { _id: decoded.userId };
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
});

jest.mock("../../middleware/auth", () => mockAuthMiddleware);

app.use("/api/roles", roleRoutes);

describe("Role API Integration Tests", () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: "roletest",
      email: "roletest@example.com",
      password: "password123",
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );
  });

  describe("GET /api/roles", () => {
    test("should get user roles", async () => {
      const response = await request(app)
        .get("/api/roles")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles).toHaveLength(1);
      expect(response.body.data.roles[0].type).toBe("student");
      expect(response.body.data.defaultRole).toBe("student");
      expect(response.body.data.profiles).toBeDefined();
    });

    test("should require authentication", async () => {
      const response = await request(app).get("/api/roles").expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/roles", () => {
    test("should add teacher role", async () => {
      const response = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ roleType: "teacher" })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles).toHaveLength(2);

      const teacherRole = response.body.data.roles.find(
        (r) => r.type === "teacher"
      );
      expect(teacherRole).toBeDefined();
      expect(teacherRole.isPrimary).toBe(false);
    });

    test("should not allow duplicate roles", async () => {
      const response = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ roleType: "student" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already has");
    });

    test("should validate role type", async () => {
      const response = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ roleType: "invalid" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid role type");
    });

    test("should require roleType parameter", async () => {
      const response = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("required");
    });
  });

  describe("PUT /api/roles/switch", () => {
    beforeEach(async () => {
      // Add teacher role first
      await testUser.addRole("teacher");
    });

    test("should switch to teacher role", async () => {
      const response = await request(app)
        .put("/api/roles/switch")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ roleType: "teacher" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.defaultRole).toBe("teacher");

      const teacherRole = response.body.data.roles.find(
        (r) => r.type === "teacher"
      );
      expect(teacherRole.isPrimary).toBe(true);
    });

    test("should not switch to non-existent role", async () => {
      const response = await request(app)
        .put("/api/roles/switch")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ roleType: "guardian" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("does not have");
    });
  });

  describe("PUT /api/roles/:roleType/profile", () => {
    test("should update student profile", async () => {
      const profileData = {
        grade: "10th Grade",
        school: "Test High School",
      };

      const response = await request(app)
        .put("/api/roles/student/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profile.grade).toBe("10th Grade");
      expect(response.body.data.profile.school).toBe("Test High School");
    });

    test("should not update profile for non-existent role", async () => {
      const response = await request(app)
        .put("/api/roles/guardian/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ relation: "parent" })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/roles/:roleType", () => {
    beforeEach(async () => {
      // Add teacher role first
      await testUser.addRole("teacher");
      await testUser.switchPrimaryRole("teacher");
    });

    test("should remove student role", async () => {
      const response = await request(app)
        .delete("/api/roles/student")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles).toHaveLength(1);
      expect(response.body.data.roles[0].type).toBe("teacher");
    });

    test("should not remove only role", async () => {
      // Remove teacher role first, leaving only student
      await testUser.removeRole("teacher");

      const response = await request(app)
        .delete("/api/roles/student")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test("should not remove primary role", async () => {
      const response = await request(app)
        .delete("/api/roles/teacher")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("primary role");
    });
  });
});
