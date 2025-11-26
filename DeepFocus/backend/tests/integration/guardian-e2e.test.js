const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const GuardianLink = require("../../models/GuardianLink");
const Alert = require("../../models/Alert");
const Session = require("../../models/Session");

// Mock auth middleware
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

describe("Guardian E2E Test Scenarios", () => {
  let guardianUser;
  let childUser;
  let guardianToken;
  let childToken;

  beforeEach(async () => {
    // Create guardian user with guardian role
    guardianUser = await User.create({
      username: "parent_nguyen",
      email: "parent@example.com",
      password: "password123",
      phone: "0901234567",
      roles: [
        {
          type: "guardian",
          isPrimary: true,
          isActive: true,
          children: [],
        },
      ],
    });

    // Create child user with student role
    childUser = await User.create({
      username: "student_an",
      email: "student@example.com",
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

    // Generate tokens
    guardianToken = generateToken(guardianUser._id);
    childToken = generateToken(childUser._id);
  });

  describe("E2E Scenario 1: Complete Guardian-Child Linking Flow (Accept)", () => {
    test("should complete full linking flow from request to acceptance", async () => {
      console.log("\n📋 E2E Test: Guardian links child successfully");

      // Step 1: Guardian sends link request
      console.log("Step 1: Guardian sends link request...");
      const sendRequestResponse = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "student_an",
          relation: "parent",
          notes: "I am your parent",
        });

      expect(sendRequestResponse.status).toBe(201);
      expect(sendRequestResponse.body.success).toBe(true);
      console.log("✓ Link request sent successfully");

      const linkId = sendRequestResponse.body.data._id;

      // Verify link exists in database
      const link = await GuardianLink.findById(linkId);
      expect(link).toBeDefined();
      expect(link.status).toBe("pending");
      console.log("✓ Link created in database with pending status");

      // Verify alert created for child
      const childAlert = await Alert.findOne({
        recipient: childUser._id,
        type: "info",
      });
      expect(childAlert).toBeDefined();
      console.log("✓ Alert created for child");

      // Step 2: Child checks pending requests
      console.log("\nStep 2: Child checks pending requests...");
      const pendingRequestsResponse = await request(app)
        .get("/api/guardian/link-requests")
        .set("Authorization", `Bearer ${childToken}`);

      expect(pendingRequestsResponse.status).toBe(200);
      expect(pendingRequestsResponse.body.success).toBe(true);
      expect(pendingRequestsResponse.body.data).toHaveLength(1);
      expect(pendingRequestsResponse.body.data[0]._id).toBe(linkId);
      expect(pendingRequestsResponse.body.data[0].guardian.username).toBe(
        "parent_nguyen"
      );
      console.log("✓ Child can see pending request");

      // Step 3: Child accepts the link request
      console.log("\nStep 3: Child accepts the request...");
      const acceptResponse = await request(app)
        .put(`/api/guardian/link-requests/${linkId}`)
        .set("Authorization", `Bearer ${childToken}`)
        .send({ action: "accept" });

      expect(acceptResponse.status).toBe(200);
      expect(acceptResponse.body.success).toBe(true);
      console.log("✓ Child accepted the request");

      // Verify link status changed to accepted
      const acceptedLink = await GuardianLink.findById(linkId);
      expect(acceptedLink.status).toBe("accepted");
      expect(acceptedLink.respondedAt).toBeDefined();
      console.log("✓ Link status changed to accepted");

      // Verify guardian's children array updated
      const updatedGuardian = await User.findById(guardianUser._id);
      expect(updatedGuardian.roles[0].children).toHaveLength(1);
      expect(updatedGuardian.roles[0].children[0].toString()).toBe(
        childUser._id.toString()
      );
      console.log("✓ Child added to guardian's children array");

      // Verify child's guardians array updated
      const updatedChild = await User.findById(childUser._id);
      expect(updatedChild.studentProfile.guardians).toHaveLength(1);
      expect(updatedChild.studentProfile.guardians[0].toString()).toBe(
        guardianUser._id.toString()
      );
      console.log("✓ Guardian added to child's guardians array");

      // Verify alert created for guardian
      const guardianAlert = await Alert.findOne({
        recipient: guardianUser._id,
        type: "guardian_link_accepted",
      });
      expect(guardianAlert).toBeDefined();
      console.log("✓ Alert created for guardian about acceptance");

      // Step 4: Guardian checks linked children
      console.log("\nStep 4: Guardian checks linked children...");
      const linkedChildrenResponse = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(linkedChildrenResponse.status).toBe(200);
      expect(linkedChildrenResponse.body.success).toBe(true);
      expect(linkedChildrenResponse.body.data).toHaveLength(1);
      expect(linkedChildrenResponse.body.data[0].username).toBe("student_an");
      console.log("✓ Guardian can see linked child in their list");

      // Step 5: Guardian views dashboard
      console.log("\nStep 5: Guardian views dashboard...");
      const dashboardResponse = await request(app)
        .get("/api/guardian/dashboard")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data.childrenCount).toBe(1);
      console.log("✓ Guardian dashboard shows 1 child");

      console.log(
        "\n✅ E2E Scenario 1 PASSED: Complete linking flow successful\n"
      );
    });
  });

  describe("E2E Scenario 2: Child Rejects Link Request", () => {
    test("should handle rejection flow correctly", async () => {
      console.log("\n📋 E2E Test: Child rejects guardian link request");

      // Step 1: Guardian sends link request
      console.log("Step 1: Guardian sends link request...");
      const sendRequestResponse = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "student_an",
          relation: "tutor",
          notes: "I am your tutor",
        });

      expect(sendRequestResponse.status).toBe(201);
      const linkId = sendRequestResponse.body.data._id;
      console.log("✓ Link request sent");

      // Step 2: Child rejects the request
      console.log("\nStep 2: Child rejects the request...");
      const rejectResponse = await request(app)
        .put(`/api/guardian/link-requests/${linkId}`)
        .set("Authorization", `Bearer ${childToken}`)
        .send({ action: "reject" });

      expect(rejectResponse.status).toBe(200);
      expect(rejectResponse.body.success).toBe(true);
      console.log("✓ Child rejected the request");

      // Verify link status changed to rejected
      const rejectedLink = await GuardianLink.findById(linkId);
      expect(rejectedLink.status).toBe("rejected");
      expect(rejectedLink.respondedAt).toBeDefined();
      console.log("✓ Link status changed to rejected");

      // Verify guardian's children array NOT updated
      const updatedGuardian = await User.findById(guardianUser._id);
      expect(updatedGuardian.roles[0].children).toHaveLength(0);
      console.log("✓ Child NOT added to guardian's children array");

      // Verify child's guardians array NOT updated
      const updatedChild = await User.findById(childUser._id);
      expect(updatedChild.studentProfile.guardians).toHaveLength(0);
      console.log("✓ Guardian NOT added to child's guardians array");

      // Verify alert created for guardian
      const guardianAlert = await Alert.findOne({
        recipient: guardianUser._id,
        type: "guardian_link_rejected",
      });
      expect(guardianAlert).toBeDefined();
      console.log("✓ Alert created for guardian about rejection");

      // Step 3: Guardian checks linked children (should be empty)
      console.log("\nStep 3: Guardian checks linked children...");
      const linkedChildrenResponse = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(linkedChildrenResponse.status).toBe(200);
      expect(linkedChildrenResponse.body.data).toHaveLength(0);
      console.log("✓ Guardian has no linked children");

      console.log("\n✅ E2E Scenario 2 PASSED: Rejection flow successful\n");
    });
  });

  describe("E2E Scenario 3: Guardian Views Child Progress", () => {
    test("should view detailed child progress after linking", async () => {
      console.log("\n📋 E2E Test: Guardian views child progress");

      // Setup: Create accepted link
      console.log("Setup: Creating accepted link...");
      const link = await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser._id,
        status: "accepted",
        relation: "parent",
      });

      await User.findByIdAndUpdate(guardianUser._id, {
        "roles.0.children": [childUser._id],
      });

      await User.findByIdAndUpdate(childUser._id, {
        "studentProfile.guardians": [guardianUser._id],
      });
      console.log("✓ Link setup complete");

      // Create some sessions for the child
      console.log("\nCreating child's learning sessions...");
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await Session.create({
        user: childUser._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      await Session.create({
        user: childUser._id,
        type: "focus",
        startTime: yesterday,
        endTime: new Date(yesterday.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      await Session.create({
        user: childUser._id,
        type: "focus",
        startTime: yesterday,
        endTime: new Date(yesterday.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });
      console.log("✓ Created 3 sessions (1 today, 2 yesterday)");

      // Step 1: Guardian views child progress
      console.log("\nStep 1: Guardian views child progress...");
      const progressResponse = await request(app)
        .get(`/api/guardian/children/${childUser._id}/progress`)
        .set("Authorization", `Bearer ${guardianToken}`)
        .query({ period: "week" });

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body.success).toBe(true);
      expect(progressResponse.body.data).toBeDefined();
      expect(progressResponse.body.data.totalPomodoros).toBe(3);
      expect(progressResponse.body.data.totalMinutes).toBe(75);
      expect(progressResponse.body.data.completionRate).toBeGreaterThan(0);
      console.log(
        `✓ Guardian can view progress: ${progressResponse.body.data.totalPomodoros} pomodoros`
      );

      // Step 2: Guardian views dashboard with child stats
      console.log("\nStep 2: Guardian views dashboard...");
      const dashboardResponse = await request(app)
        .get("/api/guardian/dashboard")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.data.childrenCount).toBe(1);
      expect(dashboardResponse.body.data.totalWeekPomodoros).toBe(3);
      expect(dashboardResponse.body.data.children[0].weekPomodoros).toBe(3);
      console.log(
        `✓ Dashboard shows week total: ${dashboardResponse.body.data.totalWeekPomodoros} pomodoros`
      );

      console.log("\n✅ E2E Scenario 3 PASSED: Progress viewing successful\n");
    });
  });

  describe("E2E Scenario 4: Guardian Removes Link", () => {
    test("should successfully remove link from guardian side", async () => {
      console.log("\n📋 E2E Test: Guardian removes child link");

      // Setup: Create accepted link
      console.log("Setup: Creating accepted link...");
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser._id,
        status: "accepted",
        relation: "parent",
      });

      await User.findByIdAndUpdate(guardianUser._id, {
        "roles.0.children": [childUser._id],
      });

      await User.findByIdAndUpdate(childUser._id, {
        "studentProfile.guardians": [guardianUser._id],
      });
      console.log("✓ Link setup complete");

      // Step 1: Verify link exists
      console.log("\nStep 1: Verify link exists...");
      const beforeResponse = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(beforeResponse.body.data).toHaveLength(1);
      console.log("✓ Guardian has 1 linked child");

      // Step 2: Guardian removes the link
      console.log("\nStep 2: Guardian removes the link...");
      const removeResponse = await request(app)
        .delete(`/api/guardian/children/${childUser._id}`)
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body.success).toBe(true);
      console.log("✓ Link removal successful");

      // Step 3: Verify link status changed to blocked
      console.log("\nStep 3: Verify link blocked...");
      const link = await GuardianLink.findOne({
        guardian: guardianUser._id,
        child: childUser._id,
      });
      expect(link.status).toBe("blocked");
      console.log("✓ Link status changed to blocked");

      // Step 4: Verify removed from both user documents
      console.log("\nStep 4: Verify removed from user documents...");
      const updatedGuardian = await User.findById(guardianUser._id);
      expect(updatedGuardian.roles[0].children).toHaveLength(0);
      console.log("✓ Child removed from guardian's children array");

      const updatedChild = await User.findById(childUser._id);
      expect(updatedChild.studentProfile.guardians).toHaveLength(0);
      console.log("✓ Guardian removed from child's guardians array");

      // Step 5: Verify alert sent to child
      console.log("\nStep 5: Verify alert sent to child...");
      const childAlert = await Alert.findOne({
        recipient: childUser._id,
        type: "guardian_link_removed",
      });
      expect(childAlert).toBeDefined();
      console.log("✓ Alert sent to child");

      // Step 6: Guardian checks linked children (should be empty)
      console.log("\nStep 6: Guardian checks linked children...");
      const afterResponse = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(afterResponse.body.data).toHaveLength(0);
      console.log("✓ Guardian has no linked children");

      // Step 7: Guardian cannot view child progress anymore
      console.log("\nStep 7: Verify access revoked...");
      const progressResponse = await request(app)
        .get(`/api/guardian/children/${childUser._id}/progress`)
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(progressResponse.status).toBe(403);
      console.log("✓ Guardian cannot access child progress");

      console.log("\n✅ E2E Scenario 4 PASSED: Link removal successful\n");
    });
  });

  describe("E2E Scenario 5: Child Removes Link", () => {
    test("should successfully remove link from child side", async () => {
      console.log("\n📋 E2E Test: Child removes guardian link");

      // Setup: Create accepted link
      console.log("Setup: Creating accepted link...");
      await GuardianLink.create({
        guardian: guardianUser._id,
        child: childUser._id,
        status: "accepted",
        relation: "parent",
      });

      await User.findByIdAndUpdate(guardianUser._id, {
        "roles.0.children": [childUser._id],
      });

      await User.findByIdAndUpdate(childUser._id, {
        "studentProfile.guardians": [guardianUser._id],
      });
      console.log("✓ Link setup complete");

      // Step 1: Child removes the link
      console.log("\nStep 1: Child removes the link...");
      const removeResponse = await request(app)
        .delete(`/api/guardian/children/${guardianUser._id}`)
        .set("Authorization", `Bearer ${childToken}`);

      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body.success).toBe(true);
      console.log("✓ Link removal successful");

      // Step 2: Verify link blocked
      console.log("\nStep 2: Verify link blocked...");
      const link = await GuardianLink.findOne({
        guardian: guardianUser._id,
        child: childUser._id,
      });
      expect(link.status).toBe("blocked");
      console.log("✓ Link status changed to blocked");

      // Step 3: Verify removed from user documents
      console.log("\nStep 3: Verify removed from user documents...");
      const updatedGuardian = await User.findById(guardianUser._id);
      expect(updatedGuardian.roles[0].children).toHaveLength(0);

      const updatedChild = await User.findById(childUser._id);
      expect(updatedChild.studentProfile.guardians).toHaveLength(0);
      console.log("✓ Removed from both sides");

      // Step 4: Verify alert sent to guardian
      console.log("\nStep 4: Verify alert sent to guardian...");
      const guardianAlert = await Alert.findOne({
        recipient: guardianUser._id,
        type: "guardian_link_removed",
      });
      expect(guardianAlert).toBeDefined();
      console.log("✓ Alert sent to guardian");

      console.log("\n✅ E2E Scenario 5 PASSED: Child removal successful\n");
    });
  });

  describe("E2E Scenario 6: Multiple Children Management", () => {
    test("should handle guardian with multiple linked children", async () => {
      console.log("\n📋 E2E Test: Guardian manages multiple children");

      // Create second child
      const child2 = await User.create({
        username: "student_binh",
        email: "binh@example.com",
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
      const child2Token = generateToken(child2._id);

      // Step 1: Link first child
      console.log("\nStep 1: Link first child...");
      const request1Response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "student_an",
          relation: "parent",
        });

      expect(request1Response.status).toBe(201);
      const link1Id = request1Response.body.data._id;

      await request(app)
        .put(`/api/guardian/link-requests/${link1Id}`)
        .set("Authorization", `Bearer ${childToken}`)
        .send({ action: "accept" });

      console.log("✓ First child linked");

      // Step 2: Link second child
      console.log("\nStep 2: Link second child...");
      const request2Response = await request(app)
        .post("/api/guardian/link-child")
        .set("Authorization", `Bearer ${guardianToken}`)
        .send({
          childIdentifier: "student_binh",
          relation: "parent",
        });

      expect(request2Response.status).toBe(201);
      const link2Id = request2Response.body.data._id;

      await request(app)
        .put(`/api/guardian/link-requests/${link2Id}`)
        .set("Authorization", `Bearer ${child2Token}`)
        .send({ action: "accept" });

      console.log("✓ Second child linked");

      // Step 3: Create sessions for both children
      console.log("\nStep 3: Creating sessions...");
      const today = new Date();

      await Session.create({
        user: childUser._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      await Session.create({
        user: child2._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      await Session.create({
        user: child2._id,
        type: "focus",
        startTime: today,
        endTime: new Date(today.getTime() + 25 * 60 * 1000),
        duration: 25,
        completed: true,
      });

      console.log("✓ Sessions created (1 for child1, 2 for child2)");

      // Step 4: Guardian views dashboard
      console.log("\nStep 4: Guardian views dashboard...");
      const dashboardResponse = await request(app)
        .get("/api/guardian/dashboard")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.data.childrenCount).toBe(2);
      expect(dashboardResponse.body.data.totalWeekPomodoros).toBe(3);
      expect(dashboardResponse.body.data.averagePomodoros).toBe(2); // Math.round(3/2) = 2
      console.log(
        `✓ Dashboard shows 2 children, total ${dashboardResponse.body.data.totalWeekPomodoros} pomodoros`
      );

      // Step 5: Guardian views all linked children
      console.log("\nStep 5: Guardian views all children...");
      const childrenResponse = await request(app)
        .get("/api/guardian/children")
        .set("Authorization", `Bearer ${guardianToken}`);

      expect(childrenResponse.status).toBe(200);
      expect(childrenResponse.body.data).toHaveLength(2);
      console.log("✓ Guardian can see both children");

      // Step 6: Guardian views progress for each child
      console.log("\nStep 6: Guardian views individual progress...");
      const progress1Response = await request(app)
        .get(`/api/guardian/children/${childUser._id}/progress`)
        .set("Authorization", `Bearer ${guardianToken}`)
        .query({ period: "week" });

      expect(progress1Response.status).toBe(200);
      expect(progress1Response.body.data.totalPomodoros).toBe(1);
      console.log(
        `✓ Child 1 progress: ${progress1Response.body.data.totalPomodoros} pomodoros`
      );

      const progress2Response = await request(app)
        .get(`/api/guardian/children/${child2._id}/progress`)
        .set("Authorization", `Bearer ${guardianToken}`)
        .query({ period: "week" });

      expect(progress2Response.status).toBe(200);
      expect(progress2Response.body.data.totalPomodoros).toBe(2);
      console.log(
        `✓ Child 2 progress: ${progress2Response.body.data.totalPomodoros} pomodoros`
      );

      console.log(
        "\n✅ E2E Scenario 6 PASSED: Multiple children management successful\n"
      );
    });
  });
});
