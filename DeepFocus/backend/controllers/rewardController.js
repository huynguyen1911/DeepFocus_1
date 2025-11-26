const mongoose = require("mongoose");
const Reward = require("../models/Reward");
const Class = require("../models/Class");
const User = require("../models/User");
const Alert = require("../models/Alert");

/**
 * @desc    Create a reward or penalty
 * @route   POST /api/rewards
 * @access  Private (Teacher/Guardian only)
 */
const createReward = async (req, res) => {
  try {
    const { studentId, classId, type, category, points, reason, metadata } =
      req.body;
    const giverId = req.user._id;

    // Validation
    if (!studentId || !classId || !type || !category || !points || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Verify student exists and is a member
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const isStudentMember = classData.members.some(
      (m) => m.user.toString() === studentId && m.status === "active"
    );

    if (!isStudentMember) {
      return res.status(400).json({
        success: false,
        message: "Student is not an active member of this class",
      });
    }

    // Use req.user from authMiddleware (preserves full roles data including children)
    const giver = req.user;

    if (!giver || !giver.roles || giver.roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User has no roles",
      });
    }

    const isTeacher = giver.roles.some(
      (r) => r.type === "teacher" && r.isActive
    );
    const isGuardian = giver.roles.some(
      (r) => r.type === "guardian" && r.isActive
    );

    if (!isTeacher && !isGuardian) {
      return res.status(403).json({
        success: false,
        message: "Only teachers and guardians can give rewards",
      });
    }

    // For guardians, verify they are guardian of this student
    if (isGuardian && !isTeacher) {
      const guardianRole = giver.roles.find(
        (r) => r.type === "guardian" && r.isActive
      );

      if (!guardianRole) {
        return res.status(403).json({
          success: false,
          message: "Guardian role not found",
        });
      }

      const isGuardianOfStudent = guardianRole.children?.some(
        (childId) => childId.toString() === studentId
      );

      if (!isGuardianOfStudent) {
        return res.status(403).json({
          success: false,
          message: "You can only give rewards to your children",
        });
      }
    }

    // Validate points based on type
    if (type === "reward" && points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Reward must have positive points",
      });
    }

    if (type === "penalty" && points >= 0) {
      return res.status(400).json({
        success: false,
        message: "Penalty must have negative points",
      });
    }

    // Create reward
    const reward = await Reward.create({
      student: studentId,
      class: classId,
      type,
      category,
      points,
      reason,
      givenBy: giverId,
      metadata: metadata || {},
    });

    // Populate fields
    await reward.populate([
      { path: "student", select: "fullName email" },
      { path: "class", select: "name" },
      { path: "givenBy", select: "fullName email" },
    ]);

    // Create alert for student
    await Alert.create({
      recipient: studentId,
      type: type === "reward" ? "success" : "warning",
      title: type === "reward" ? "🎉 Reward Received!" : "⚠️ Penalty Notice",
      message: `${Math.abs(points)} points - ${reason}`,
      link: "/rewards",
      data: {
        rewardId: reward._id,
        type,
        points,
        category,
      },
    });

    res.status(201).json({
      success: true,
      message: `${
        type === "reward" ? "Reward" : "Penalty"
      } created successfully`,
      data: reward,
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create reward",
    });
  }
};

/**
 * @desc    Get rewards for a student in a class
 * @route   GET /api/rewards/student/:studentId/class/:classId
 * @access  Private
 */
const getStudentRewards = async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    const {
      type,
      category,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const userId = req.user._id;

    // Build filter
    const filter = {
      student: studentId,
      class: classId,
      status: "approved",
    };

    if (type) filter.type = type;
    if (category) filter.category = category;

    // Verify user has permission to view
    // Student can view own rewards, teacher can view all, guardian can view children
    const isOwnRewards = userId.toString() === studentId;
    const user = await User.findById(userId);
    const isTeacher = user.roles.some(
      (r) => r.type === "teacher" && r.isActive
    );
    const isGuardian = user.roles.some(
      (r) => r.type === "guardian" && r.isActive
    );

    if (!isOwnRewards && !isTeacher) {
      if (isGuardian) {
        const guardianRole = user.roles.find(
          (r) => r.type === "guardian" && r.isActive
        );
        const isGuardianOfStudent = guardianRole.children?.some(
          (childId) => childId.toString() === studentId
        );

        if (!isGuardianOfStudent) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to view these rewards",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view these rewards",
        });
      }
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get rewards with pagination
    const rewards = await Reward.find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("givenBy", "fullName email")
      .populate("class", "name")
      .lean();

    // Get total count
    const total = await Reward.countDocuments(filter);

    // Calculate total points
    const pointsData = await Reward.calculateTotalPoints(studentId, classId);

    res.json({
      success: true,
      rewards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      summary: {
        totalPoints: pointsData.totalPoints,
        breakdown: {
          rewards: pointsData.breakdown.rewards,
          penalties: pointsData.breakdown.penalties,
        },
      },
    });
  } catch (error) {
    console.error("Error getting student rewards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get rewards",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel a reward (within 24 hours)
 * @route   DELETE /api/rewards/:id
 * @access  Private (Creator only)
 */
const cancelReward = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find reward
    const reward = await Reward.findById(id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    // Verify user is the creator
    if (reward.givenBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel rewards you created",
      });
    }

    // Check if reward can be cancelled
    if (!reward.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: "Reward can only be cancelled within 24 hours of creation",
      });
    }

    // Update status to cancelled
    reward.status = "cancelled";
    await reward.save();

    // Create alert for student
    await Alert.create({
      recipient: reward.student,
      type: "info",
      title: "Reward Cancelled",
      message: `A ${reward.type} of ${Math.abs(
        reward.points
      )} points has been cancelled`,
      link: "/rewards",
      data: {
        rewardId: reward._id,
        type: reward.type,
        points: reward.points,
      },
    });

    res.json({
      success: true,
      message: "Reward cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reward:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel reward",
      error: error.message,
    });
  }
};

/**
 * @desc    Get reward summary for a student across all classes
 * @route   GET /api/rewards/student/:studentId/summary
 * @access  Private
 */
const getRewardSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id;

    // Verify permission
    const isOwnSummary = userId.toString() === studentId;
    const user = await User.findById(userId);
    const isTeacher = user.roles.some(
      (r) => r.type === "teacher" && r.isActive
    );
    const isGuardian = user.roles.some(
      (r) => r.type === "guardian" && r.isActive
    );

    if (!isOwnSummary && !isTeacher && !isGuardian) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this summary",
      });
    }

    // Get all rewards grouped by class
    const summary = await Reward.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$class",
          totalPoints: { $sum: "$points" },
          rewardCount: {
            $sum: { $cond: [{ $eq: ["$type", "reward"] }, 1, 0] },
          },
          penaltyCount: {
            $sum: { $cond: [{ $eq: ["$type", "penalty"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $project: {
          classId: "$_id",
          className: "$class.name",
          totalPoints: 1,
          rewardCount: 1,
          penaltyCount: 1,
        },
      },
    ]);

    // Calculate overall totals
    const overall = summary.reduce(
      (acc, item) => {
        acc.totalPoints += item.totalPoints;
        acc.rewardCount += item.rewardCount;
        acc.penaltyCount += item.penaltyCount;
        return acc;
      },
      { totalPoints: 0, rewardCount: 0, penaltyCount: 0 }
    );

    res.json({
      success: true,
      summary: {
        overallTotal: overall.totalPoints,
        overallRewards: overall.rewardCount,
        overallPenalties: overall.penaltyCount,
        classes: summary,
      },
    });
  } catch (error) {
    console.error("Error getting reward summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reward summary",
      error: error.message,
    });
  }
};

module.exports = {
  createReward,
  getStudentRewards,
  cancelReward,
  getRewardSummary,
};
