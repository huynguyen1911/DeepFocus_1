const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const GuardianLink = require("../../models/GuardianLink");
const Alert = require("../../models/Alert");
const Session = require("../../models/Session");
const Class = require("../../models/Class");
const Reward = require("../../models/Reward");

// Mock auth middleware before requiring routes
jest.mock("../../middleware/auth", () => {
  const jwt = require("jsonwebtoken");
  const mongoose = require("mongoose");
  const User = require("../../models/User");
  return {
    authMiddleware: async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "No token provided" });
      }
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "test-secret"
        );
        // Fetch full user document with roles
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res
            .status(401)
            .json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
      } catch (error) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
      }
    },
  };
});

const guardianRoutes = require("../../routes/guardian");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/guardian", guardianRoutes);

// Helper function to generate test token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "1h",
  });
};

describe("Guardian API Integration Tests", () => {
  let guardianUser;
  let childUser1;
  let childUser2;
  let guardianToken;
  let childToken1;
  let childToken2;

  beforeEach(async () => {
    // Create guardian user
    guardianUser = await User.create({
      username: "test_guardian",
      email: "guardian@test.com",
      password: "password123",
      roles: [
        {
          type: "guardian",
          isPrimary: true,
          isActive: true,
          children: [],
        },
      ],
    });

    // Create child users
    childUser1 = await User.create({
      username: "test_child1",
      email: "child1@test.com",
      password: "password123",
      roles: [
        {
          type: "student",
          isPrimary: true,
          isActive: true,
        },
      ],
      studentProfile: {
        guardians: [],
        dailyGoal: 8,
      },
    });

    childUser2 = await User.create({
      username: "test_child2",
      email: "child2@test.com",
      password: "password123",
      roles: [
        {
          type: "student",
          isPrimary: true,
          isActive: true,
        },
      ],
      studentProfile: {
        guardians: [],
        dailyGoal: 10,
      },
    });

    // Generate tokens
    guardianToken = generateToken(guardianUser._id);
    childToken1 = generateToken(childUser1._id);
    childToken2 = generateToken(childUser2._id);
  });

  describe("POST /api/guardian/link-child", () => {
    test("should successfully send link request", async () => {
      const response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "test_child1",
          relation: "parent",
          notes: "I am the parent",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe("pending");

      // Verify link was created in database
      const link = await GuardianLink.findOne({
        guardian: guardianUser._id,
        child: childUser1._id,
      });
      expect(link).toBeDefined();
      expect(link.relation).toBe("parent");
      expect(link.notes).toBe("I am the parent");

      // Verify alert was created for child
      const alert = await Alert.findOne({
        recipient: childUser1._id,
        type: "info",
      });
      expect(alert).toBeDefined();
    });

    test("should fail when non-guardian tries to send request", async () => {
      const response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${childToken1}`)
        .send({
          childIdentifier: "test_child2",
          relation: "parent",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should fail when child not found", async () => {
      const response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "nonexistent_user",
          relation: "parent",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("should fail when trying to link self", async () => {
      const response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "test_guardian",
          relation: "parent",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail when duplicate link already exists", async () => {
      // Create first link
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "pending",
        relation: "parent",
      });

      const response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "test_child1",
          relation: "parent",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/guardian/children", () => {
    beforeEach(async () => {
      // Create accepted links
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "accepted",
        relation: "parent",
      });

      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser2._id,
        status: "accepted",
        relation: "tutor",
      });

      // Update guardian's children array
      await User.findByIdAndUpdate(guardianUser._id, {
        "roles.0.children": [childUser1._id, childUser2._id],
      });

      // Create some sessions for children
      const today = new Date();
      await Session.create({
        user: childUser1._id,
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });
    });

    test("should get all linked children", async () => {
      const response = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].username).toBeDefined();
      expect(response.body.data[0].todayPomodoros).toBeDefined();
      expect(response.body.data[0].weekPomodoros).toBeDefined();
    });

    test("should filter by status", async () => {
      // Delete existing link first to avoid duplicate key error
      await GuardianLink.deleteOne({
        guardian: guardianUser._id,
        child: childUser1._id,
      });

      // Create pending link
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "pending",
        relation: "guardian",
      });

      const response = await request(app)
        .get("/api/guardian/children?status=pending")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Should only get pending links
    });

    test("should fail when non-guardian tries to access", async () => {
      const response = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${childToken1}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/guardian/children/:childId/progress", () => {
    beforeEach(async () => {
      // Create accepted link
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "accepted",
        relation: "parent",
      });

      // Create sessions (3 completed focus sessions for testing totalPomodoros)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 3);

      for (let i = 0; i < 3; i++) {
        const sessionDate = new Date(weekAgo);
        sessionDate.setDate(sessionDate.getDate() + i);

        await Session.create({
          user: childUser1._id,
          type: "focus",
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + 25 * 60 * 1000),
          duration: 25,
          completed: true,
        });
      }

      // Create class and reward
      const testClass = await Class.create({
        name: "Test Class",
        teacher: guardianUser._id,
        createdBy: guardianUser._id,
        members: [{ user: childUser1._id, role: "student", status: "active" }],
      });

      await Reward.create({
        student: childUser1._id,
        class: testClass._id,
        type: "reward",
        category: "achievement",
        points: 10,
        reason: "Good work on assignments",
        givenBy: guardianUser._id,
      });
    });

    test("should get child progress", async () => {
      const response = await request(app)
        .get(`/api/guardian/children/${childUser1._id}/progress`)
        .set("Authorization", `Bearer ${guardianToken}`)
        .query({ period: "week" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalPomodoros).toBeDefined();
      expect(response.body.data.classes).toBeDefined();
      expect(response.body.data.recentRewards).toBeDefined();
    });

    test("should fail without access", async () => {
      const response = await request(app)
        .get(`/api/guardian/children/${childUser2._id}/progress`)
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/guardian/link-requests/:requestId", () => {
    let linkRequest;

    beforeEach(async () => {
      linkRequest = await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "pending",
        relation: "parent",
      });

      // Create alert for the request
      await Alert.create({
        recipient: childUser1._id,
        type: "info",
        title: "Link request",
        message: "Guardian wants to link",
        data: {
          linkId: linkRequest._id,
          guardianId: guardianUser._id,
        },
      });
    });

    test("should accept link request", async () => {
      const response = await request(app)
        .put(`/api/guardian/link-requests/${linkRequest._id}`)
        .set("Authorization", `Bearer ${childToken1}`)
        .send({ action: "accept" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify link status changed
      const updatedLink = await GuardianLink.findById(linkRequest._id);
      expect(updatedLink.status).toBe("accepted");
      expect(updatedLink.respondedAt).toBeDefined();

      // Verify guardian's children array updated
      const updatedGuardian = await User.findById(guardianUser._id);
      expect(updatedGuardian.roles[0].children).toContainEqual(childUser1._id);

      // Verify child's guardians array updated
      const updatedChild = await User.findById(childUser1._id);
      expect(updatedChild.studentProfile.guardians).toContainEqual(
        guardianUser._id
      );

      // Verify alert created for guardian
      const alert = await Alert.findOne({
        recipient: guardianUser._id,
        type: "guardian_link_accepted",
      });
      expect(alert).toBeDefined();
    });

    test("should reject link request", async () => {
      const response = await request(app)
        .put(`/api/guardian/link-requests/${linkRequest._id}`)
        .set("Authorization", `Bearer ${childToken1}`)
        .send({ action: "reject" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify link status changed
      const updatedLink = await GuardianLink.findById(linkRequest._id);
      expect(updatedLink.status).toBe("rejected");
      expect(updatedLink.respondedAt).toBeDefined();

      // Verify alert created for guardian
      const alert = await Alert.findOne({
        recipient: guardianUser._id,
        type: "guardian_link_rejected",
      });
      expect(alert).toBeDefined();
    });

    test("should fail when non-owner tries to respond", async () => {
      const response = await request(app)
        .put(`/api/guardian/link-requests/${linkRequest._id}`)
        .set("Authorization", `Bearer ${childToken2}`)
        .send({ action: "accept" });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid action", async () => {
      const response = await request(app)
        .put(`/api/guardian/link-requests/${linkRequest._id}`)
        .set("Authorization", `Bearer ${childToken1}`)
        .send({ action: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail for already responded request", async () => {
      // First accept the request
      await linkRequest.accept();

      const response = await request(app)
        .put(`/api/guardian/link-requests/${linkRequest._id}`)
        .set("Authorization", `Bearer ${childToken1}`)
        .send({ action: "accept" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/guardian/link-requests", () => {
    beforeEach(async () => {
      // Delete any existing links to avoid duplicate key error
      await GuardianLink.deleteMany({
        $or: [
          { guardian: guardianUser._id, child: childUser1._id },
          { guardian: guardianUser._id, child: childUser2._id },
        ],
      });

      // Create pending request for child1
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "pending",
        relation: "parent",
      });
    });

    test("should get pending requests for child", async () => {
      const response = await request(app)
        .get("/api/guardian/link-requests")
        .set("Authorization", `Bearer ${childToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe("pending");
      expect(response.body.data[0].guardian).toBeDefined();
    });

    test("should return empty array when no pending requests", async () => {
      const response = await request(app)
        .get("/api/guardian/link-requests")
        .set("Authorization", `Bearer ${childToken2}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe("DELETE /api/guardian/children/:childId", () => {
    beforeEach(async () => {
      // Create accepted link
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "accepted",
        relation: "parent",
      });

      // Update user documents
      await User.findByIdAndUpdate(guardianUser._id, {
        "roles.0.children": [childUser1._id],
      });

      await User.findByIdAndUpdate(childUser1._id, {
        "studentProfile.guardians": [guardianUser._id],
      });
    });

    test("guardian should remove link successfully", async () => {
      const response = await request(app)
        .delete(`/api/guardian/children/${childUser1._id}`)
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify link status changed to blocked
      const link = await GuardianLink.findOne({
        guardian: guardianUser._id,
        child: childUser1._id,
      });
      expect(link.status).toBe("blocked");

      // Verify removed from guardian's children
      const updatedGuardian = await User.findById(guardianUser._id);
      expect(updatedGuardian.roles[0].children).not.toContainEqual(
        childUser1._id
      );

      // Verify removed from child's guardians
      const updatedChild = await User.findById(childUser1._id);
      expect(updatedChild.studentProfile.guardians).not.toContainEqual(
        guardianUser._id
      );

      // Verify alert created
      const alert = await Alert.findOne({
        recipient: childUser1._id,
        type: "guardian_link_removed",
      });
      expect(alert).toBeDefined();
    });

    test("child should remove link successfully", async () => {
      const response = await request(app)
        .delete(`/api/guardian/children/${guardianUser._id}`)
        .set("Authorization", `Bearer ${childToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify link blocked
      const link = await GuardianLink.findOne({
        guardian: guardianUser._id,
        child: childUser1._id,
      });
      expect(link.status).toBe("blocked");

      // Verify alert created for guardian
      const alert = await Alert.findOne({
        recipient: guardianUser._id,
        type: "guardian_link_removed",
      });
      expect(alert).toBeDefined();
    });

    test("should fail when link does not exist", async () => {
      const response = await request(app)
        .delete(`/api/guardian/children/${childUser2._id}`)
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/guardian/dashboard", () => {
    beforeEach(async () => {
      // Create accepted links
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser1._id,
        status: "accepted",
        relation: "parent",
      });

      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser2._id,
        status: "accepted",
        relation: "tutor",
      });

      // Update guardian's children array
      await User.findByIdAndUpdate(guardianUser._id, {
        "roles.0.children": [childUser1._id, childUser2._id],
      });

      // Create sessions for this week
      const today = new Date();
      await Session.create({
        user: childUser1._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      await Session.create({
        user: childUser2._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      await Session.create({
        user: childUser2._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });
    });

    test("should get dashboard summary", async () => {
      const response = await request(app)
        .get("/api/guardian/dashboard")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.childrenCount).toBe(2);
      expect(response.body.data.totalWeekPomodoros).toBe(3);
      expect(response.body.data.averagePomodoros).toBe(2); // Math.round(3/2) = 2
      expect(response.body.data.children).toHaveLength(2);
    });

    test("should fail when non-guardian tries to access", async () => {
      const response = await request(app)
        .get("/api/guardian/dashboard")
        .set("Authorization", `Bearer ${childToken1}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
