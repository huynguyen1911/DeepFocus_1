const mongoose = require("mongoose");
const User = require("../../../models/User");

describe("User Model - Multi-Role Tests", () => {
  describe("Role Management", () => {
    test("should create user with default student role", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const user = await User.create(userData);

      expect(user.roles).toHaveLength(1);
      expect(user.roles[0].type).toBe("student");
      expect(user.roles[0].isPrimary).toBe(true);
      expect(user.roles[0].isActive).toBe(true);
      expect(user.defaultRole).toBe("student");
    });

    test("should add teacher role to user", async () => {
      const user = await User.create({
        username: "testuser2",
        email: "test2@example.com",
        password: "password123",
      });

      await user.addRole("teacher");

      expect(user.roles).toHaveLength(2);
      const teacherRole = user.roles.find((r) => r.type === "teacher");
      expect(teacherRole).toBeDefined();
      expect(teacherRole.isPrimary).toBe(false);
      expect(teacherRole.isActive).toBe(true);
    });

    test("should not allow duplicate roles", async () => {
      const user = await User.create({
        username: "testuser3",
        email: "test3@example.com",
        password: "password123",
      });

      try {
        await user.addRole("student");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("already exists");
      }
    });

    test("should switch primary role", async () => {
      const user = await User.create({
        username: "testuser4",
        email: "test4@example.com",
        password: "password123",
      });

      await user.addRole("teacher");
      await user.switchPrimaryRole("teacher");

      expect(user.defaultRole).toBe("teacher");
      const teacherRole = user.roles.find((r) => r.type === "teacher");
      const studentRole = user.roles.find((r) => r.type === "student");
      expect(teacherRole.isPrimary).toBe(true);
      expect(studentRole.isPrimary).toBe(false);
    });

    test("should not allow removing only role", async () => {
      const user = await User.create({
        username: "testuser5",
        email: "test5@example.com",
        password: "password123",
      });

      try {
        await user.removeRole("student");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("only role");
      }
    });

    test("should not allow removing primary role", async () => {
      const user = await User.create({
        username: "testuser6",
        email: "test6@example.com",
        password: "password123",
      });

      await user.addRole("teacher");

      try {
        await user.removeRole("student");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("primary role");
      }
    });

    test("should check if user has specific role", async () => {
      const user = await User.create({
        username: "testuser7",
        email: "test7@example.com",
        password: "password123",
      });

      await user.addRole("teacher");

      expect(user.hasRole("student")).toBe(true);
      expect(user.hasRole("teacher")).toBe(true);
      expect(user.hasRole("guardian")).toBe(false);
    });

    test("should validate role schema properly", async () => {
      const userData = {
        username: "testuser8",
        email: "test8@example.com",
        password: "password123",
        roles: [
          { type: "student", isPrimary: true },
          { type: "teacher", isPrimary: false },
        ],
      };

      const user = await User.create(userData);
      expect(user.roles).toHaveLength(2);
    });

    test("should not allow invalid role type", async () => {
      const user = await User.create({
        username: "testuser9",
        email: "test9@example.com",
        password: "password123",
      });

      try {
        await user.addRole("invalid");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Invalid role type");
      }
    });
  });

  describe("Role Profiles", () => {
    test("should have default student profile", async () => {
      const user = await User.create({
        username: "testuser10",
        email: "test10@example.com",
        password: "password123",
      });

      expect(user.studentProfile).toBeDefined();
      expect(user.studentProfile.grade).toBe("");
      expect(user.studentProfile.school).toBe("");
      expect(user.studentProfile.guardians).toEqual([]);
      expect(user.studentProfile.joinedClasses).toEqual([]);
    });

    test("should have default teacher profile", async () => {
      const user = await User.create({
        username: "testuser11",
        email: "test11@example.com",
        password: "password123",
      });

      expect(user.teacherProfile).toBeDefined();
      expect(user.teacherProfile.title).toBe("");
      expect(user.teacherProfile.school).toBe("");
      expect(user.teacherProfile.subject).toBe("");
      expect(user.teacherProfile.createdClasses).toEqual([]);
    });

    test("should have default guardian profile", async () => {
      const user = await User.create({
        username: "testuser12",
        email: "test12@example.com",
        password: "password123",
      });

      expect(user.guardianProfile).toBeDefined();
      expect(user.guardianProfile.relation).toBe("");
      expect(user.guardianProfile.monitoringStudents).toEqual([]);
    });
  });
});
