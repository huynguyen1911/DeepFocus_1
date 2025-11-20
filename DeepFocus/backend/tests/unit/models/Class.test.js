const mongoose = require("mongoose");
const Class = require("../../../models/Class");
const User = require("../../../models/User");

describe("Class Model Tests", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      username: "teacher1",
      email: "teacher1@example.com",
      password: "password123",
    });
  });

  describe("Class Creation", () => {
    test("should create class with required fields", async () => {
      const classData = {
        name: "Math 101",
        description: "Introduction to Mathematics",
        createdBy: testUser._id,
        type: "school",
      };

      const classDoc = await Class.create(classData);

      expect(classDoc.name).toBe("Math 101");
      expect(classDoc.description).toBe("Introduction to Mathematics");
      expect(classDoc.createdBy.toString()).toBe(testUser._id.toString());
      expect(classDoc.type).toBe("school");
      expect(classDoc.isActive).toBe(true);
      expect(classDoc.members).toHaveLength(0);
    });

    test("should generate unique join code", async () => {
      const joinCode = await Class.generateJoinCode();

      expect(joinCode).toBeDefined();
      expect(typeof joinCode).toBe("string");
      expect(joinCode).toHaveLength(6);
      expect(joinCode).toMatch(/^[A-Z0-9]+$/); // Only uppercase letters and numbers
    });

    test("should set join code expiry on creation", async () => {
      const joinCode = await Class.generateJoinCode();

      const classDoc = await Class.create({
        name: "Science 101",
        createdBy: testUser._id,
        joinCode: joinCode,
      });

      expect(classDoc.joinCodeExpiry).toBeDefined();
      expect(classDoc.joinCodeExpiry).toBeInstanceOf(Date);

      // Should expire in 7 days
      const expectedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const diff = Math.abs(classDoc.joinCodeExpiry - expectedExpiry);
      expect(diff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe("Member Management", () => {
    let classDoc;
    let student;

    beforeEach(async () => {
      student = await User.create({
        username: "student1",
        email: "student1@example.com",
        password: "password123",
      });

      classDoc = await Class.create({
        name: "History 101",
        createdBy: testUser._id,
      });
    });

    test("should add member to class", async () => {
      await classDoc.addMember(student._id);

      expect(classDoc.members).toHaveLength(1);
      expect(classDoc.members[0].user.toString()).toBe(student._id.toString());
      expect(classDoc.members[0].role).toBe("student");
      expect(classDoc.members[0].status).toBe("pending");
    });

    test("should auto-approve member if autoApprove is enabled", async () => {
      classDoc.settings.autoApprove = true;
      await classDoc.save();

      await classDoc.addMember(student._id);

      expect(classDoc.members[0].status).toBe("active");
    });

    test("should not allow duplicate members", async () => {
      await classDoc.addMember(student._id);

      try {
        await classDoc.addMember(student._id);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("already a member");
      }
    });

    test("should approve pending member", async () => {
      await classDoc.addMember(student._id);
      await classDoc.approveMember(student._id);

      const member = classDoc.members.find(
        (m) => m.user.toString() === student._id.toString()
      );
      expect(member.status).toBe("active");
    });

    test("should remove member from class", async () => {
      await classDoc.addMember(student._id);
      await classDoc.removeMember(student._id);

      const member = classDoc.members.find(
        (m) => m.user.toString() === student._id.toString()
      );
      expect(member.status).toBe("removed");
    });

    test("should reactivate removed member", async () => {
      await classDoc.addMember(student._id);
      await classDoc.removeMember(student._id);
      await classDoc.addMember(student._id, "student");

      const member = classDoc.members.find(
        (m) => m.user.toString() === student._id.toString()
      );
      expect(member.status).toBe("pending");
    });
  });

  describe("Virtual Fields", () => {
    let classDoc;

    beforeEach(async () => {
      classDoc = await Class.create({
        name: "English 101",
        createdBy: testUser._id,
      });
    });

    test("should calculate activeMembersCount", async () => {
      const student1 = await User.create({
        username: "student2",
        email: "student2@example.com",
        password: "password123",
      });

      const student2 = await User.create({
        username: "student3",
        email: "student3@example.com",
        password: "password123",
      });

      await classDoc.addMember(student1._id);
      await classDoc.approveMember(student1._id);
      await classDoc.addMember(student2._id);

      const updatedClass = await Class.findById(classDoc._id);
      expect(updatedClass.activeMembersCount).toBe(1);
      expect(updatedClass.pendingMembersCount).toBe(1);
    });
  });

  describe("Stats Management", () => {
    let classDoc;

    beforeEach(async () => {
      classDoc = await Class.create({
        name: "Physics 101",
        createdBy: testUser._id,
      });
    });

    test("should update class stats", async () => {
      await classDoc.updateStats(100, 2500);

      expect(classDoc.stats.totalPomodoros).toBe(100);
      expect(classDoc.stats.totalFocusTime).toBe(2500);
      expect(classDoc.stats.lastUpdated).toBeInstanceOf(Date);
    });

    test("should calculate average per student", async () => {
      const student1 = await User.create({
        username: "student4",
        email: "student4@example.com",
        password: "password123",
      });

      await classDoc.addMember(student1._id);
      await classDoc.approveMember(student1._id);

      await classDoc.updateStats(50, 1250);

      expect(classDoc.stats.averagePerStudent).toBe(50);
    });
  });

  describe("Join Code Validation", () => {
    test("should validate join code", async () => {
      const joinCode = await Class.generateJoinCode();

      const classDoc = await Class.create({
        name: "Art 101",
        createdBy: testUser._id,
        joinCode: joinCode,
      });

      expect(classDoc.isJoinCodeValid()).toBe(true);
    });

    test("should invalidate expired join code", async () => {
      const joinCode = await Class.generateJoinCode();

      const classDoc = await Class.create({
        name: "Music 101",
        createdBy: testUser._id,
        joinCode: joinCode,
        joinCodeExpiry: new Date(Date.now() - 1000), // Expired 1 second ago
      });

      expect(classDoc.isJoinCodeValid()).toBe(false);
    });
  });
});
