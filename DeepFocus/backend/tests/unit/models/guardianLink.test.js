const mongoose = require("mongoose");
const GuardianLink = require("../../../models/GuardianLink");
const User = require("../../../models/User");

describe("GuardianLink Model Unit Tests", () => {
  let guardian;
  let child;

  beforeEach(async () => {
    // Create test guardian user
    guardian = await User.create({
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

    // Create test child user
    child = await User.create({
      username: "test_child",
      email: "child@test.com",
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
  });

  describe("Schema Validation", () => {
    test("should create a valid GuardianLink", async () => {
      const link = await GuardianLink.create({
        guardian: guardian._id,
        child: child._id,
        status: "pending",
        relation: "parent",
      });

      expect(link).toBeDefined();
      expect(link.guardian.toString()).toBe(guardian._id.toString());
      expect(link.child.toString()).toBe(child._id.toString());
      expect(link.status).toBe("pending");
      expect(link.relation).toBe("parent");
      expect(link.permissions.viewProgress).toBe(true);
      expect(link.permissions.giveRewards).toBe(true);
    });

    test("should fail without required fields", async () => {
      await expect(GuardianLink.create({})).rejects.toThrow();
    });

    test("should fail with invalid status", async () => {
      await expect(
        GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "invalid_status",
          relation: "parent",
        })
      ).rejects.toThrow();
    });

    test("should fail with invalid relation", async () => {
      await expect(
        GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "pending",
          relation: "invalid_relation",
        })
      ).rejects.toThrow();
    });

    test("should not allow duplicate guardian-child pairs", async () => {
      await GuardianLink.create({
        guardian: guardian._id,
        child: child._id,
        status: "pending",
        relation: "parent",
      });

      // Try to create duplicate
      await expect(
        GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "accepted",
          relation: "tutor",
        })
      ).rejects.toThrow();
    });
  });

  describe("Default Values", () => {
    test("should set default permissions", async () => {
      const link = await GuardianLink.create({
        guardian: guardian._id,
        child: child._id,
        status: "pending",
        relation: "parent",
      });

      expect(link.permissions.viewProgress).toBe(true);
      expect(link.permissions.giveRewards).toBe(true);
      expect(link.permissions.setGoals).toBe(false); // Default is false
      expect(link.permissions.viewClasses).toBe(true);
      expect(link.permissions.receiveAlerts).toBe(true);
    });

    test("should set default status to pending", async () => {
      const link = new GuardianLink({
        guardian: guardian._id,
        child: child._id,
        relation: "parent",
      });

      expect(link.status).toBe("pending");
    });
  });

  describe("Static Methods", () => {
    describe("hasAccess", () => {
      test("should return true for accepted links", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "accepted",
          relation: "parent",
        });

        const hasAccess = await GuardianLink.hasAccess(guardian._id, child._id);
        expect(hasAccess).toBe(true);
      });

      test("should return false for pending links", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "pending",
          relation: "parent",
        });

        const hasAccess = await GuardianLink.hasAccess(guardian._id, child._id);
        expect(hasAccess).toBe(false);
      });

      test("should return false for rejected links", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "rejected",
          relation: "parent",
        });

        const hasAccess = await GuardianLink.hasAccess(guardian._id, child._id);
        expect(hasAccess).toBe(false);
      });

      test("should return false for blocked links", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "blocked",
          relation: "parent",
        });

        const hasAccess = await GuardianLink.hasAccess(guardian._id, child._id);
        expect(hasAccess).toBe(false);
      });

      test("should return false when no link exists", async () => {
        const hasAccess = await GuardianLink.hasAccess(guardian._id, child._id);
        expect(hasAccess).toBe(false);
      });
    });

    describe("getActiveLink", () => {
      test("should return link document for accepted links", async () => {
        const createdLink = await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "accepted",
          relation: "parent",
        });

        const link = await GuardianLink.getActiveLink(guardian._id, child._id);
        expect(link).toBeDefined();
        expect(link._id.toString()).toBe(createdLink._id.toString());
      });

      test("should return null for non-accepted links", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "pending",
          relation: "parent",
        });

        const link = await GuardianLink.getActiveLink(guardian._id, child._id);
        expect(link).toBeNull();
      });
    });

    describe("hasPermission", () => {
      test("should return true for granted permissions", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "accepted",
          relation: "parent",
          permissions: {
            viewProgress: true,
            giveRewards: false,
            setGoals: true,
            viewClasses: false,
            receiveAlerts: true,
          },
        });

        expect(
          await GuardianLink.hasPermission(
            guardian._id,
            child._id,
            "viewProgress"
          )
        ).toBe(true);
        expect(
          await GuardianLink.hasPermission(guardian._id, child._id, "setGoals")
        ).toBe(true);
      });

      test("should return false for denied permissions", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "accepted",
          relation: "parent",
          permissions: {
            viewProgress: true,
            giveRewards: false,
            setGoals: true,
            viewClasses: false,
            receiveAlerts: true,
          },
        });

        expect(
          await GuardianLink.hasPermission(
            guardian._id,
            child._id,
            "giveRewards"
          )
        ).toBe(false);
        expect(
          await GuardianLink.hasPermission(
            guardian._id,
            child._id,
            "viewClasses"
          )
        ).toBe(false);
      });

      test("should return false for non-accepted links", async () => {
        await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "pending",
          relation: "parent",
        });

        expect(
          await GuardianLink.hasPermission(
            guardian._id,
            child._id,
            "viewProgress"
          )
        ).toBe(false);
      });
    });
  });

  describe("Instance Methods", () => {
    describe("accept", () => {
      test("should change status to accepted and set respondedAt", async () => {
        const link = await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "pending",
          relation: "parent",
        });

        expect(link.status).toBe("pending");
        expect(link.respondedAt).toBeUndefined();

        await link.accept();

        expect(link.status).toBe("accepted");
        expect(link.respondedAt).toBeDefined();
      });
    });

    describe("reject", () => {
      test("should change status to rejected and set respondedAt", async () => {
        const link = await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "pending",
          relation: "parent",
        });

        expect(link.status).toBe("pending");
        expect(link.respondedAt).toBeUndefined();

        await link.reject();

        expect(link.status).toBe("rejected");
        expect(link.respondedAt).toBeDefined();
      });
    });

    describe("block", () => {
      test("should change status to blocked", async () => {
        const link = await GuardianLink.create({
          guardian: guardian._id,
          child: child._id,
          status: "accepted",
          relation: "parent",
        });

        expect(link.status).toBe("accepted");

        await link.block();

        expect(link.status).toBe("blocked");
      });
    });
  });

  describe("Pre-save Middleware", () => {
    test("should set respondedAt when status changes to accepted", async () => {
      const link = await GuardianLink.create({
        guardian: guardian._id,
        child: child._id,
        status: "pending",
        relation: "parent",
      });

      expect(link.respondedAt).toBeUndefined();

      link.status = "accepted";
      await link.save();

      expect(link.respondedAt).toBeDefined();
    });

    test("should set respondedAt when status changes to rejected", async () => {
      const link = await GuardianLink.create({
        guardian: guardian._id,
        child: child._id,
        status: "pending",
        relation: "parent",
      });

      expect(link.respondedAt).toBeUndefined();

      link.status = "rejected";
      await link.save();

      expect(link.respondedAt).toBeDefined();
    });

    test("should not change respondedAt for other status changes", async () => {
      const link = await GuardianLink.create({
        guardian: guardian._id,
        child: child._id,
        status: "accepted",
        relation: "parent",
      });

      const originalRespondedAt = link.respondedAt;

      link.status = "blocked";
      await link.save();

      expect(link.respondedAt?.getTime()).toBe(originalRespondedAt?.getTime());
    });
  });
});
