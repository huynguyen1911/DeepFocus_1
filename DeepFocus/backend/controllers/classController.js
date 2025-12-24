const Class = require("../models/Class");
const User = require("../models/User");
const Session = require("../models/Session");

/**
 * @desc    Create a new class (Teacher only)
 * @route   POST /api/classes
 * @access  Private (Teacher only)
 */
const createClass = async (req, res) => {
  try {
    const { name, description, type, settings } = req.body;
    const userId = req.user._id;

    // Verify user is a teacher
    if (req.user.defaultRole !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can create classes",
      });
    }

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    // Generate unique join code
    const joinCode = await Class.generateJoinCode();

    // Create class with creator as first member
    const newClass = await Class.create({
      name,
      description,
      type,
      createdBy: userId,
      joinCode,
      joinCodeExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      settings: settings || {},
      members: [
        {
          user: userId,
          status: "active",
          role: "teacher",
          joinedAt: Date.now(),
        },
      ],
    });

    // Add class to teacher's profile
    const teacher = await User.findById(userId);
    if (teacher && teacher.teacherProfile) {
      teacher.teacherProfile.createdClasses.push(newClass._id);
      await teacher.save();
    }

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: {
        class: newClass,
      },
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create class",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class details by ID
 * @route   GET /api/classes/:id
 * @access  Private (Members only)
 */
const getClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const classData = await Class.findById(id)
      .populate("createdBy", "username focusProfile email")
      .populate({
        path: "members.user",
        select: "username focusProfile email",
      });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is a member
    const isMember = classData.members.some(
      (member) => member.user._id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this class",
      });
    }

    // Debug: Log member data
    console.log(
      "📋 Class members data:",
      JSON.stringify(
        classData.members.map((m) => ({
          _id: m._id,
          role: m.role,
          status: m.status,
          user: {
            _id: m.user?._id,
            email: m.user?.email,
            focusProfile: m.user?.focusProfile,
          },
        })),
        null,
        2
      )
    );

    res.json({
      success: true,
      data: classData.toObject({ virtuals: false }),
    });
  } catch (error) {
    console.error("Error getting class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class",
      error: error.message,
    });
  }
};

/**
 * @desc    Update class details (Teacher only)
 * @route   PUT /api/classes/:id
 * @access  Private (Teacher/Creator)
 */
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, description, type, settings } = req.body;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can update class details",
      });
    }

    // Update fields
    if (name !== undefined) classData.name = name;
    if (description !== undefined) classData.description = description;
    if (type !== undefined) classData.type = type;
    if (settings !== undefined) {
      classData.settings = { ...classData.settings, ...settings };
    }

    await classData.save();

    res.json({
      success: true,
      message: "Class updated successfully",
      data: classData,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a class (Teacher only)
 * @route   DELETE /api/classes/:id
 * @access  Private (Teacher/Creator)
 */
const deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user._id;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can delete the class",
      });
    }

    // Remove class from all members' profiles
    const memberIds = classData.members.map((m) => m.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { "studentProfile.joinedClasses": classId } }
    );

    // Remove from teacher's profile
    await User.findByIdAndUpdate(userId, {
      $pull: { "teacherProfile.createdClasses": classId },
    });

    // Delete the class
    await Class.findByIdAndDelete(classId);

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete class",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all classes for user (auto-detect role)
 * @route   GET /api/classes
 * @access  Private
 */
const getClasses = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.defaultRole;

    if (userRole === "teacher") {
      // Teacher: get classes they created
      const classes = await Class.find({ createdBy: userId })
        .populate("createdBy", "username focusProfile email")
        .populate("members.user", "username focusProfile email")
        .sort({ createdAt: -1 });

      const classesWithStats = classes.map((cls) => {
        const activeMembers = cls.members.filter(
          (m) => m.status === "active"
        ).length;
        const pendingMembers = cls.members.filter(
          (m) => m.status === "pending"
        ).length;

        const classObj = cls.toObject({ virtuals: false });
        return {
          ...classObj,
          stats: {
            totalPomodoros: classObj.stats?.totalPomodoros || 0,
            totalFocusTime: classObj.stats?.totalFocusTime || 0,
            averagePerStudent: classObj.stats?.averagePerStudent || 0,
            lastUpdated: classObj.stats?.lastUpdated || null,
            activeMembers,
            pendingMembers,
            totalMembers: cls.members.length,
          },
        };
      });

      return res.json({
        success: true,
        count: classes.length,
        data: classesWithStats,
      });
    } else if (userRole === "student") {
      // Student: get classes they joined
      const classes = await Class.find({
        "members.user": userId,
        "members.status": { $in: ["active", "pending"] },
      })
        .populate("createdBy", "username focusProfile email")
        .populate("members.user", "username focusProfile email")
        .sort({ createdAt: -1 });

      const studentClasses = classes.map((cls) => {
        const userMembership = cls.members.find(
          (m) => m.user._id.toString() === userId.toString()
        );

        return {
          ...cls.toObject({ virtuals: false }),
          userStatus: userMembership?.status,
          userRole: userMembership?.role,
          joinedAt: userMembership?.joinedAt,
        };
      });

      return res.json({
        success: true,
        count: studentClasses.length,
        data: studentClasses,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }
  } catch (error) {
    console.error("Error getting classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get classes",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all classes created by teacher
 * @route   GET /api/classes/teacher/my-classes
 * @access  Private (Teacher only)
 */
const getTeacherClasses = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify user is a teacher
    if (req.user.defaultRole !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can access this route",
      });
    }

    const classes = await Class.find({ createdBy: userId })
      .populate("createdBy", "username focusProfile email")
      .populate("members.user", "username focusProfile email")
      .sort({ createdAt: -1 });

    // Add stats for each class
    const classesWithStats = classes.map((cls) => {
      const activeMembers = cls.members.filter(
        (m) => m.status === "active"
      ).length;
      const pendingMembers = cls.members.filter(
        (m) => m.status === "pending"
      ).length;

      const classObj = cls.toObject({ virtuals: false });
      return {
        ...classObj,
        stats: {
          totalPomodoros: classObj.stats?.totalPomodoros || 0,
          totalFocusTime: classObj.stats?.totalFocusTime || 0,
          averagePerStudent: classObj.stats?.averagePerStudent || 0,
          lastUpdated: classObj.stats?.lastUpdated || null,
          activeMembers,
          pendingMembers,
          totalMembers: cls.members.length,
        },
      };
    });

    res.json({
      success: true,
      count: classes.length,
      data: classesWithStats,
    });
  } catch (error) {
    console.error("Error getting teacher classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get classes",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all classes where user is a student member
 * @route   GET /api/classes/student/my-classes
 * @access  Private (Student only)
 */
const getStudentClasses = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify user has student role (check both defaultRole and roles array)
    const hasStudentRole =
      req.user.defaultRole === "student" ||
      (req.user.roles &&
        req.user.roles.some(
          (role) => role.type === "student" && role.isActive
        ));

    if (!hasStudentRole) {
      return res.status(403).json({
        success: false,
        message: "Only students can access this route",
      });
    }

    const classes = await Class.find({
      "members.user": userId,
      "members.status": { $in: ["active", "pending"] },
    })
      .populate("createdBy", "username focusProfile email")
      .populate("members.user", "username focusProfile email")
      .sort({ createdAt: -1 });

    // Filter to only return relevant class info for student
    const studentClasses = classes.map((cls) => {
      const userMembership = cls.members.find(
        (m) => m.user._id.toString() === userId.toString()
      );

      return {
        ...cls.toObject({ virtuals: false }),
        userStatus: userMembership?.status,
        userRole: userMembership?.role,
        joinedAt: userMembership?.joinedAt,
      };
    });

    res.json({
      success: true,
      count: studentClasses.length,
      data: studentClasses,
    });
  } catch (error) {
    console.error("Error getting student classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get classes",
      error: error.message,
    });
  }
};

/**
 * @desc    Request to join a class using join code
 * @route   POST /api/classes/join
 * @access  Private (Student only)
 */
const requestJoinClass = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user._id;

    // Verify user is a student
    if (req.user.defaultRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can request to join classes",
      });
    }

    if (!joinCode) {
      return res.status(400).json({
        success: false,
        message: "Join code is required",
      });
    }

    // Find class by join code
    const classData = await Class.findOne({ joinCode: joinCode.toUpperCase() });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Invalid join code",
      });
    }

    // Check if join code is expired
    if (!classData.isJoinCodeValid()) {
      return res.status(400).json({
        success: false,
        message: "Join code has expired",
      });
    }

    // Check if user is already a member
    const existingMember = classData.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    if (existingMember) {
      if (existingMember.status === "active") {
        return res.status(400).json({
          success: false,
          message: "You are already a member of this class",
        });
      } else if (existingMember.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Your join request is already pending",
        });
      }
    }

    // Add user as pending member
    classData.members.push({
      user: userId,
      role: "student",
      status: classData.settings.autoApprove ? "active" : "pending",
      joinedAt: Date.now(),
    });

    await classData.save();

    // Add class to student's profile
    const student = await User.findById(userId);
    if (student && student.studentProfile) {
      if (!student.studentProfile.joinedClasses.includes(classData._id)) {
        student.studentProfile.joinedClasses.push(classData._id);
        await student.save();
      }
    }

    res.json({
      success: true,
      message: classData.settings.autoApprove
        ? "Successfully joined class"
        : "Join request sent successfully",
      data: {
        classId: classData._id,
        className: classData.name,
        status: classData.settings.autoApprove ? "active" : "pending",
      },
    });
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join class",
      error: error.message,
    });
  }
};

/**
 * @desc    Regenerate join code for class (Teacher only)
 * @route   POST /api/classes/:id/regenerate-code
 * @access  Private (Teacher/Creator)
 */
const regenerateJoinCode = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user._id;

    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can regenerate join code",
      });
    }

    // Generate new join code
    classData.joinCode = await Class.generateJoinCode();
    classData.joinCodeExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await classData.save();

    res.json({
      success: true,
      message: "Join code regenerated successfully",
      data: {
        joinCode: classData.joinCode,
        joinCodeExpiry: classData.joinCodeExpiry,
      },
    });
  } catch (error) {
    console.error("Error regenerating join code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate join code",
      error: error.message,
    });
  }
};

/**
 * @desc    Approve student join request (Teacher only)
 * @route   PUT /api/classes/:id/approve/:memberId
 * @access  Private (Teacher/Creator)
 */
const approveJoinRequest = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can approve join requests",
      });
    }

    // Find the member
    const member = classData.members.find(
      (m) => m.user.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (member.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Member is not in pending status",
      });
    }

    // Approve the member
    member.status = "active";
    await classData.save();

    // Add class to student's joinedClasses if not already there
    const student = await User.findById(memberId);
    if (student && student.studentProfile) {
      if (!student.studentProfile.joinedClasses.includes(id)) {
        student.studentProfile.joinedClasses.push(id);
        await student.save();
      }
    }

    res.json({
      success: true,
      message: "Member approved successfully",
    });
  } catch (error) {
    console.error("Error approving join request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve join request",
      error: error.message,
    });
  }
};

/**
 * @desc    Reject student join request (Teacher only)
 * @route   PUT /api/classes/:id/reject/:memberId
 * @access  Private (Teacher/Creator)
 */
const rejectJoinRequest = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can reject join requests",
      });
    }

    // Remove the member
    classData.members = classData.members.filter(
      (m) => m.user.toString() !== memberId
    );

    await classData.save();

    // Remove class from student's profile
    await User.findByIdAndUpdate(memberId, {
      $pull: { "studentProfile.joinedClasses": id },
    });

    res.json({
      success: true,
      message: "Join request rejected",
    });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject join request",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a member from class (Teacher only)
 * @route   DELETE /api/classes/:id/members/:memberId
 * @access  Private (Teacher/Creator)
 */
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can remove members",
      });
    }

    // Cannot remove creator
    if (memberId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove class creator",
      });
    }

    // Remove member
    const memberExists = classData.members.find(
      (m) => m.user.toString() === memberId
    );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "Member not found in class",
      });
    }

    classData.members = classData.members.filter(
      (m) => m.user.toString() !== memberId
    );

    // Update stats
    classData.stats.totalMembers = classData.members.filter(
      (m) => m.status === "active"
    ).length;

    await classData.save();

    // Remove class from student's profile
    const student = await User.findById(memberId);
    if (student) {
      student.studentProfile.joinedClasses =
        student.studentProfile.joinedClasses.filter(
          (classId) => classId.toString() !== id
        );
      await student.save();
    }

    res.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class members list
 * @route   GET /api/classes/:id/members
 * @access  Private (Members only)
 */
const getMemberList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const classData = await Class.findById(id).populate(
      "members.user",
      "username email focusProfile"
    );

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is a member
    const isMember = classData.members.some(
      (member) => member.user._id.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this class",
      });
    }

    // Separate approved and pending members
    const approvedMembers = classData.members.filter(
      (m) => m.status === "active"
    );
    const pendingMembers = classData.members.filter(
      (m) => m.status === "pending"
    );

    res.json({
      success: true,
      data: {
        approved: approvedMembers,
        pending: pendingMembers,
        total: classData.members.length,
      },
    });
  } catch (error) {
    console.error("Error getting members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get members",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class leaderboard
 * @route   GET /api/classes/:id/leaderboard
 * @access  Private (Class members only)
 */
const getClassLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Verify class exists and user is a member
    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const isMember = classData.members.some(
      (m) => m.user.toString() === userId.toString() && m.status === "active"
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this class",
      });
    }

    // Get leaderboard from Session model
    const Session = require("../models/Session");
    const leaderboard = await Session.getClassLeaderboard(id, parseInt(limit));

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard: leaderboard,
    });
  } catch (error) {
    console.error("Error getting class leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class leaderboard",
      error: error.message,
    });
  }
};

/**
 * @desc    Update class statistics
 * @route   POST /api/classes/:id/update-stats
 * @access  Private (Teacher only)
 */
const updateClassStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if user is the creator
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the class creator can update class statistics",
      });
    }

    // Recalculate stats from sessions
    const Session = require("../models/Session");
    const stats = await Session.getClassStats(id);

    classData.stats = {
      totalPomodoros: stats.totalSessions,
      totalFocusTime: stats.totalDuration,
      averagePerStudent: stats.avgPerStudent,
      lastUpdated: new Date(),
    };

    await classData.save();

    res.json({
      success: true,
      message: "Class statistics updated successfully",
      stats: classData.stats,
    });
  } catch (error) {
    console.error("Error updating class stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get student progress in class
 * @route   GET /api/classes/:id/student/:studentId/progress
 * @access  Private (Class members only)
 */
const getStudentProgress = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const userId = req.user._id;

    // Verify class exists and user is a member
    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const isUserMember = classData.members.some(
      (m) => m.user.toString() === userId.toString() && m.status === "active"
    );

    if (!isUserMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this class",
      });
    }

    // Verify student exists (either must be active member OR user is viewing their own progress)
    const studentMember = classData.members.find(
      (m) => m.user.toString() === studentId.toString()
    );

    // If not viewing own progress and student is not in class or not active, return 404
    if (!studentMember && userId.toString() !== studentId.toString()) {
      return res.status(404).json({
        success: false,
        message: "Student is not a member of this class",
      });
    }

    // Get student's session stats for this class
    const Session = require("../models/Session");

    const sessions = await Session.find({
      user: studentId,
      class: id,
      completed: true,
      type: "focus",
    }).sort({ createdAt: -1 });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration =
      totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    // Get recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = sessions.filter(
      (s) => new Date(s.createdAt) >= sevenDaysAgo
    );

    res.json({
      success: true,
      studentId,
      classId: id,
      totalSessions,
      totalDuration,
      avgDuration,
      recentSessions: recentSessions,
      lastSession: sessions.length > 0 ? sessions[0].createdAt : null,
      sessions: sessions.slice(0, 10), // Return last 10 sessions
    });
  } catch (error) {
    console.error("Error getting student progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student progress",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class analytics with aggregated statistics
 * @route   GET /api/classes/:id/analytics
 * @access  Private (Teacher/Creator)
 */
const getClassAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Get class and verify teacher access
    const classData = await Class.findById(id).populate({
      path: "members.user",
      select: "username email focusProfile",
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Verify user is the creator/teacher
    if (classData.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only class creator can view analytics",
      });
    }

    // Get active members (students only, exclude teacher/guardian)
    const activeMembers = classData.members.filter(
      (m) => m.status === "active" && m.role === "student"
    );
    const activeMemberIds = activeMembers.map((m) => m.user._id);

    // Get all sessions for class members in the last 7 days (or custom range)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await Session.find({
      user: { $in: activeMemberIds },
      class: id,
      completed: true,
      createdAt: { $gte: sevenDaysAgo },
    }).populate("user", "username email focusProfile");

    // Calculate total statistics
    const totalPomodoros = sessions.filter((s) => s.type === "focus").length;
    const totalWorkTime = sessions
      .filter((s) => s.type === "focus")
      .reduce((sum, s) => sum + s.duration, 0);

    // Students who have at least 1 session in the last 7 days
    const activeStudents = new Set(sessions.map((s) => s.user._id.toString()))
      .size;

    const averagePerStudent =
      activeStudents > 0 ? Math.round(totalPomodoros / activeStudents) : 0;

    // Calculate top performers
    const performerMap = {};
    sessions.forEach((session) => {
      if (session.type === "focus") {
        const userId = session.user._id.toString();
        if (!performerMap[userId]) {
          performerMap[userId] = {
            studentId: userId,
            studentName:
              session.user.focusProfile?.fullName ||
              session.user.username ||
              "Unknown",
            pomodoros: 0,
            workTime: 0,
          };
        }
        performerMap[userId].pomodoros += 1;
        performerMap[userId].workTime += session.duration;
      }
    });

    const topPerformers = Object.values(performerMap)
      .sort((a, b) => b.pomodoros - a.pomodoros)
      .slice(0, 3);

    // Calculate weekly activity (last 7 days)
    const weeklyActivity = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNamesVi = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySessions = sessions.filter((s) => {
        const sessionDate = new Date(s.createdAt);
        return (
          sessionDate >= date && sessionDate < nextDate && s.type === "focus"
        );
      });

      const dayIndex = date.getDay();
      weeklyActivity.push({
        day: dayNames[dayIndex],
        dayVi: dayNamesVi[dayIndex],
        pomodoros: daySessions.length,
        students: new Set(daySessions.map((s) => s.user._id.toString())).size,
      });
    }

    // Prepare analytics response
    const analytics = {
      totalStudents: activeMembers.length,
      activeStudents,
      totalPomodoros,
      totalWorkTime,
      averagePerStudent,
      topPerformers,
      weeklyActivity,
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error getting class analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class analytics",
      error: error.message,
    });
  }
};

module.exports = {
  createClass,
  getClasses,
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
  getClassLeaderboard,
  updateClassStats,
  getStudentProgress,
  getClassAnalytics,
};
