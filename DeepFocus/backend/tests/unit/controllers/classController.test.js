const Class = require("../../../models/Class");
const User = require("../../../models/User");
const {
  createClass,
  getClass,
  updateClass,
  deleteClass,
  getTeacherClasses,
  getStudentClasses,
  requestJoinClass,
  regenerateJoinCode,
  approveJoinRequest,
  rejectJoinRequest,
  removeMember,
  getMemberList,
} = require("../../../controllers/classController");

describe("Class Controller Tests", () => {
  let teacherUser, studentUser, mockReq, mockRes, createdClass;

  beforeEach(async () => {
    // Create test users
    teacherUser = new User({
      username: "teacher_test",
      email: "teacher@test.com",
      password: "password123",
      roles: [{ type: "teacher", isPrimary: true, isActive: true }],
    });
    await teacherUser.save();

    studentUser = new User({
      username: "student_test",
      email: "student@test.com",
      password: "password123",
      roles: [{ type: "student", isPrimary: true, isActive: true }],
    });
    await studentUser.save();

    // Mock request and response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("createClass", () => {
    test("should create class successfully for teacher", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        body: {
          name: "Test Class",
          description: "Test Description",
          settings: { allowJoinRequests: true },
        },
      };

      await createClass(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Class created successfully",
          data: expect.objectContaining({
            class: expect.objectContaining({
              name: "Test Class",
              description: "Test Description",
            }),
          }),
        })
      );

      // Verify join code was generated
      const jsonCall = mockRes.json.mock.calls[0][0];
      expect(jsonCall.data.class.joinCode).toHaveLength(6);
      expect(jsonCall.data.class.joinCodeExpiry).toBeDefined();
    });

    test("should fail if user is not a teacher", async () => {
      mockReq = {
        user: { _id: studentUser._id },
        body: {
          name: "Test Class",
        },
      };

      await createClass(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Only teachers can create classes",
        })
      );
    });

    test("should fail if class name is missing", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        body: {
          description: "Test Description",
        },
      };

      await createClass(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Class name is required",
        })
      );
    });
  });

  describe("requestJoinClass", () => {
    beforeEach(async () => {
      // Create a class first
      createdClass = new Class({
        name: "Test Class",
        createdBy: teacherUser._id,
        joinCode: "ABC123",
        joinCodeExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        members: [
          {
            userId: teacherUser._id,
            role: "teacher",
            status: "approved",
          },
        ],
      });
      await createdClass.save();
    });

    test("should allow student to request join with valid code", async () => {
      mockReq = {
        user: { _id: studentUser._id },
        body: {
          joinCode: "ABC123",
        },
      };

      await requestJoinClass(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining("Join request sent successfully"),
        })
      );

      // Verify student was added to pending members
      const updatedClass = await Class.findById(createdClass._id);
      const pendingMember = updatedClass.members.find(
        (m) =>
          m.userId.toString() === studentUser._id.toString() &&
          m.status === "pending"
      );
      expect(pendingMember).toBeDefined();
    });

    test("should fail with invalid join code", async () => {
      mockReq = {
        user: { _id: studentUser._id },
        body: {
          joinCode: "INVALID",
        },
      };

      await requestJoinClass(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid join code",
        })
      );
    });

    test("should fail if student already joined", async () => {
      // Add student as member first
      createdClass.members.push({
        userId: studentUser._id,
        role: "student",
        status: "approved",
      });
      await createdClass.save();

      mockReq = {
        user: { _id: studentUser._id },
        body: {
          joinCode: "ABC123",
        },
      };

      await requestJoinClass(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("already a member"),
        })
      );
    });

    test("should fail if non-student tries to join", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        body: {
          joinCode: "ABC123",
        },
      };

      await requestJoinClass(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Only students can join classes",
        })
      );
    });
  });

  describe("approveJoinRequest", () => {
    beforeEach(async () => {
      // Create class with pending student
      createdClass = new Class({
        name: "Test Class",
        createdBy: teacherUser._id,
        members: [
          {
            userId: teacherUser._id,
            role: "teacher",
            status: "approved",
          },
          {
            userId: studentUser._id,
            role: "student",
            status: "pending",
          },
        ],
      });
      await createdClass.save();
    });

    test("should approve join request successfully", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        params: {
          id: createdClass._id.toString(),
          memberId: studentUser._id.toString(),
        },
      };

      await approveJoinRequest(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Member approved successfully",
        })
      );

      // Verify member status changed
      const updatedClass = await Class.findById(createdClass._id);
      const approvedMember = updatedClass.members.find(
        (m) => m.userId.toString() === studentUser._id.toString()
      );
      expect(approvedMember.status).toBe("approved");

      // Verify class was added to student's profile
      const updatedStudent = await User.findById(studentUser._id);
      expect(
        updatedStudent.studentProfile.joinedClasses.includes(createdClass._id)
      ).toBe(true);
    });

    test("should fail if non-creator tries to approve", async () => {
      const anotherUser = new User({
        username: "another_teacher",
        email: "another@test.com",
        password: "password123",
        roles: [{ type: "teacher", isPrimary: true, isActive: true }],
      });
      await anotherUser.save();

      mockReq = {
        user: { _id: anotherUser._id },
        params: {
          id: createdClass._id.toString(),
          memberId: studentUser._id.toString(),
        },
      };

      await approveJoinRequest(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Only the class creator"),
        })
      );
    });
  });

  describe("removeMember", () => {
    beforeEach(async () => {
      // Create class with approved student
      createdClass = new Class({
        name: "Test Class",
        createdBy: teacherUser._id,
        members: [
          {
            userId: teacherUser._id,
            role: "teacher",
            status: "approved",
          },
          {
            userId: studentUser._id,
            role: "student",
            status: "approved",
          },
        ],
      });
      await createdClass.save();

      // Add class to student's profile
      studentUser.studentProfile.joinedClasses.push(createdClass._id);
      await studentUser.save();
    });

    test("should remove member successfully", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        params: {
          id: createdClass._id.toString(),
          memberId: studentUser._id.toString(),
        },
      };

      await removeMember(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Member removed successfully",
        })
      );

      // Verify member was removed from class
      const updatedClass = await Class.findById(createdClass._id);
      const memberExists = updatedClass.members.find(
        (m) => m.userId.toString() === studentUser._id.toString()
      );
      expect(memberExists).toBeUndefined();

      // Verify class was removed from student's profile
      const updatedStudent = await User.findById(studentUser._id);
      expect(
        updatedStudent.studentProfile.joinedClasses.includes(createdClass._id)
      ).toBe(false);
    });

    test("should fail to remove class creator", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        params: {
          id: createdClass._id.toString(),
          memberId: teacherUser._id.toString(),
        },
      };

      await removeMember(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Cannot remove class creator",
        })
      );
    });
  });

  describe("regenerateJoinCode", () => {
    beforeEach(async () => {
      createdClass = new Class({
        name: "Test Class",
        createdBy: teacherUser._id,
        joinCode: "OLD123",
        joinCodeExpiry: new Date(Date.now() - 1000), // Expired
        members: [
          {
            userId: teacherUser._id,
            role: "teacher",
            status: "approved",
          },
        ],
      });
      await createdClass.save();
    });

    test("should regenerate join code successfully", async () => {
      mockReq = {
        user: { _id: teacherUser._id },
        params: {
          id: createdClass._id.toString(),
        },
      };

      await regenerateJoinCode(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Join code regenerated successfully",
          data: expect.objectContaining({
            joinCode: expect.any(String),
            joinCodeExpiry: expect.any(Date),
          }),
        })
      );

      // Verify code was changed
      const jsonCall = mockRes.json.mock.calls[0][0];
      expect(jsonCall.data.joinCode).not.toBe("OLD123");
      expect(jsonCall.data.joinCode).toHaveLength(6);
    });
  });
});
