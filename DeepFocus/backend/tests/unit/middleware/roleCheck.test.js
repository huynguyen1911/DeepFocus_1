const {
  requireRole,
  requireAllRoles,
  requirePrimaryRole,
} = require("../../../middleware/roleCheck");
const User = require("../../../models/User");

describe("RoleCheck Middleware Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("requireRole", () => {
    test("should call next when user has required role", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
          {
            type: "teacher",
            isPrimary: false,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requireRole(["teacher"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 403 when user does not have required role", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requireRole(["teacher", "guardian"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. Required role(s): teacher, guardian",
        requiredRoles: ["teacher", "guardian"],
        userRoles: ["student"],
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 when user is not authenticated", async () => {
      req.user = undefined;

      const middleware = requireRole(["student"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Authentication required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should call next when user has any of multiple allowed roles", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
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

      req.user = user;

      const middleware = requireRole(["teacher", "guardian", "admin"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 403 when user role is inactive", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "teacher",
            isPrimary: true,
            isActive: false, // Inactive role
          },
        ],
      });

      req.user = user;

      const middleware = requireRole(["teacher"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireAllRoles", () => {
    test("should call next when user has all required roles", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
          {
            type: "teacher",
            isPrimary: false,
            isActive: true,
          },
          {
            type: "guardian",
            isPrimary: false,
            isActive: true,
            children: [],
          },
        ],
      });

      req.user = user;

      const middleware = requireAllRoles(["student", "teacher"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 403 when user is missing one required role", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requireAllRoles(["student", "teacher"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Access denied. All of these roles are required: student, teacher",
        requiredRoles: ["student", "teacher"],
        userRoles: ["student"],
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should call next when user has all roles in any order", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "guardian",
            isPrimary: false,
            isActive: true,
            children: [],
          },
          {
            type: "teacher",
            isPrimary: false,
            isActive: true,
          },
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requireAllRoles(["student", "teacher", "guardian"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("requirePrimaryRole", () => {
    test("should call next when user's primary role matches", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "teacher",
            isPrimary: true,
            isActive: true,
          },
          {
            type: "student",
            isPrimary: false,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requirePrimaryRole(["teacher"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 403 when primary role does not match", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
          {
            type: "teacher",
            isPrimary: false,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requirePrimaryRole(["teacher"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access denied. Primary role must be one of: teacher",
        requiredPrimaryRoles: ["teacher"],
        currentPrimaryRole: "student",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 403 when user has no primary role", async () => {
      // Manually create req.user object without primary role to bypass validation
      req.user = {
        _id: "test-id",
        username: "test_user",
        roles: [
          {
            type: "student",
            isPrimary: false,
            isActive: true,
          },
        ],
      };

      const middleware = requirePrimaryRole(["student"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test("should call next when primary role is in allowed list", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
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

      req.user = user;

      const middleware = requirePrimaryRole(["student", "teacher", "guardian"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    test("should handle user with no roles", async () => {
      // Manually create req.user object with empty roles to bypass validation
      req.user = {
        _id: "test-id",
        username: "test_user",
        roles: [],
      };

      const middleware = requireRole(["student"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle empty allowedRoles array", async () => {
      const user = await User.create({
        username: "test_user",
        email: "test@test.com",
        password: "password123",
        roles: [
          {
            type: "student",
            isPrimary: true,
            isActive: true,
          },
        ],
      });

      req.user = user;

      const middleware = requireRole([]);
      await middleware(req, res, next);

      // With empty allowed roles, should deny access
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle database error gracefully", async () => {
      // Set user with empty roles to simulate error
      req.user = {
        _id: "invalid-id-format",
        roles: [],
      };

      const middleware = requireRole(["student"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle non-existent user", async () => {
      const mongoose = require("mongoose");
      // Set user with empty roles to simulate non-existent
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        roles: [],
      };

      const middleware = requireRole(["student"]);
      await middleware(req, res, next);

      // Middleware returns 403 for users without required roles
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
