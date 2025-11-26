const User = require("../models/User");
const GuardianLink = require("../models/GuardianLink");
const Alert = require("../models/Alert");
const Session = require("../models/Session");
const Reward = require("../models/Reward");
const Class = require("../models/Class");

/**
 * @desc    Send link request to child
 * @route   POST /api/guardian/link-child
 * @access  Private (Guardian only)
 */
const sendLinkRequest = async (req, res) => {
  try {
    const { childIdentifier, relation = "parent", notes } = req.body;

    // Validate input
    if (!childIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Child username or email is required",
      });
    }

    // Verify requester has guardian role
    const guardianHasRole = req.user.roles.some(
      (r) => r.type === "guardian" && r.isActive
    );
    if (!guardianHasRole) {
      return res.status(403).json({
        success: false,
        message: "You must have guardian role to link children",
      });
    }

    // Find child by username or email
    const child = await User.findOne({
      $or: [
        { username: childIdentifier },
        { email: childIdentifier.toLowerCase() },
      ],
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child user not found",
      });
    }

    // Check if child has student role
    const childHasStudentRole = child.roles.some(
      (r) => r.type === "student" && r.isActive
    );
    if (!childHasStudentRole) {
      return res.status(400).json({
        success: false,
        message: "User must have student role to be linked as child",
      });
    }

    // Cannot link to self
    if (req.user._id.equals(child._id)) {
      return res.status(400).json({
        success: false,
        message: "Cannot link to yourself",
      });
    }

    // Check if link already exists
    const existingLink = await GuardianLink.findOne({
      guardian: req.user._id,
      child: child._id,
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: `Link already exists with status: ${existingLink.status}`,
        data: existingLink,
      });
    }

    // Create GuardianLink
    const link = await GuardianLink.create({
      guardian: req.user._id,
      child: child._id,
      relation,
      notes,
      status: "pending",
    });

    // Create alert for child
    await Alert.create({
      recipient: child._id,
      type: "info",
      priority: 5,
      title: "Yêu cầu liên kết mới",
      message: `${req.user.username} muốn liên kết với bạn với vai trò ${relation}`,
      data: {
        linkId: link._id,
        guardianId: req.user._id,
        guardianUsername: req.user.username,
        relation,
      },
    });

    console.log(
      `📧 Guardian link request sent: ${req.user.username} → ${child.username}`
    );

    res.status(201).json({
      success: true,
      message: "Link request sent successfully",
      data: link,
    });
  } catch (error) {
    console.error("❌ Error in sendLinkRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get guardian's linked children
 * @route   GET /api/guardian/children
 * @access  Private (Guardian only)
 */
const getLinkedChildren = async (req, res) => {
  try {
    const { status = "accepted" } = req.query;

    const links = await GuardianLink.find({
      guardian: req.user._id,
      status,
    })
      .populate({
        path: "child",
        select:
          "username email focusProfile.currentStreak focusProfile.dailyGoal focusProfile.totalSessionsCompleted",
      })
      .sort({ createdAt: -1 });

    // Enhance each child with recent activity summary
    const childrenWithActivity = await Promise.all(
      links.map(async (link) => {
        const child = link.child;

        // Get today's sessions
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todaySessions = await Session.find({
          user: child._id,
          createdAt: { $gte: startOfToday },
          completed: true,
          type: "focus",
        });

        const todayPomodoros = todaySessions.length;

        // Get this week's sessions
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const weekSessions = await Session.find({
          user: child._id,
          createdAt: { $gte: startOfWeek },
          completed: true,
          type: "focus",
        });

        const weekPomodoros = weekSessions.length;

        // Get active classes count
        const classes = await Class.find({
          "members.user": child._id,
          "members.status": "active",
        });

        // Get recent unread alert
        const recentAlert = await Alert.findOne({
          userId: child._id,
          readAt: null,
        })
          .sort({ createdAt: -1 })
          .select("title message createdAt");

        return {
          linkId: link._id,
          childId: child._id,
          username: child.username,
          email: child.email,
          relation: link.relation,
          permissions: link.permissions,
          linkedAt: link.respondedAt || link.createdAt,
          dailyGoal: child.focusProfile?.dailyGoal || 4,
          currentStreak: child.focusProfile?.currentStreak || 0,
          todayPomodoros,
          weekPomodoros,
          activeClassesCount: classes.length,
          recentAlert: recentAlert
            ? {
                title: recentAlert.title,
                message: recentAlert.message,
                createdAt: recentAlert.createdAt,
              }
            : null,
        };
      })
    );

    console.log(
      `👨‍👩‍👧 Retrieved ${childrenWithActivity.length} children for guardian: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      count: childrenWithActivity.length,
      data: childrenWithActivity,
    });
  } catch (error) {
    console.error("❌ Error in getLinkedChildren:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get child's detailed progress
 * @route   GET /api/guardian/children/:childId/progress
 * @access  Private (Guardian with access only)
 */
const getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    const { period = "week" } = req.query; // week, month, all

    // Verify guardian has access
    const hasAccess = await GuardianLink.hasAccess(req.user._id, childId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this child's progress",
      });
    }

    const child = await User.findById(childId).select(
      "username email focusProfile studentProfile"
    );

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    // Calculate date range
    let startDate = new Date();
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    // Get sessions in period
    const sessions = await Session.find({
      user: childId,
      createdAt: { $gte: startDate },
      completed: true,
      type: "focus",
    }).sort({ createdAt: -1 });

    const totalPomodoros = sessions.length; // Count completed focus sessions
    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );

    // Get classes with student's rank
    const classes = await Class.find({
      "members.user": childId,
      "members.status": "active",
    })
      .populate("createdBy", "username")
      .select("name description members");

    const classesWithRank = await Promise.all(
      classes.map(async (cls) => {
        // Get rewards for this class to calculate rank
        const rewards = await Reward.find({
          classId: cls._id,
        })
          .populate("studentId", "username")
          .select("studentId points");

        // Calculate total points per student
        const studentPoints = {};
        rewards.forEach((reward) => {
          const studentId = reward.studentId._id.toString();
          studentPoints[studentId] =
            (studentPoints[studentId] || 0) + reward.points;
        });

        // Sort by points to get ranking
        const rankings = Object.entries(studentPoints)
          .sort(([, a], [, b]) => b - a)
          .map(([studentId], index) => ({
            studentId,
            rank: index + 1,
          }));

        const childRank = rankings.find(
          (r) => r.studentId === childId.toString()
        );

        return {
          _id: cls._id,
          name: cls.name,
          description: cls.description,
          teacher: cls.createdBy.username,
          totalMembers: cls.members.filter((m) => m.status === "active").length,
          rank: childRank ? childRank.rank : null,
          points: studentPoints[childId.toString()] || 0,
        };
      })
    );

    // Get recent rewards
    const recentRewards = await Reward.find({
      studentId: childId,
      createdAt: { $gte: startDate },
    })
      .populate("giverId", "username")
      .populate("classId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate trend (compare with previous period)
    const prevStartDate = new Date(startDate);
    if (period === "week") {
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (period === "month") {
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    }

    const prevSessions = await Session.find({
      user: childId,
      createdAt: { $gte: prevStartDate, $lt: startDate },
      completed: true,
      type: "focus",
    });

    const prevPomodoros = prevSessions.length;

    let trend = "stable";
    let trendPercent = 0;

    if (prevPomodoros > 0) {
      trendPercent = Math.round(
        ((totalPomodoros - prevPomodoros) / prevPomodoros) * 100
      );
      if (trendPercent > 10) trend = "up";
      else if (trendPercent < -10) trend = "down";
    }

    // Calculate completion rate (tasks completed vs total)
    const completionRate = sessions.length > 0 ? 100 : 0; // Simplified

    console.log(
      `📊 Retrieved progress for child: ${child.username} (${period})`
    );

    res.status(200).json({
      success: true,
      data: {
        child: {
          _id: child._id,
          username: child.username,
          email: child.email,
        },
        period,
        totalPomodoros,
        totalMinutes,
        completionRate,
        currentStreak: child.focusProfile?.currentStreak || 0,
        dailyGoal: child.focusProfile?.dailyGoal || 4,
        trend,
        trendPercent,
        classes: classesWithRank,
        recentRewards,
        sessionsCount: sessions.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in getChildProgress:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Respond to link request (Child's action)
 * @route   PUT /api/guardian/link-requests/:requestId
 * @access  Private (Child only)
 */
const respondToLinkRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!action || !["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'accept' or 'reject'",
      });
    }

    const link = await GuardianLink.findById(requestId).populate(
      "guardian",
      "username email"
    );

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link request not found",
      });
    }

    // Verify request belongs to current user (child)
    if (!link.child.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "This request does not belong to you",
      });
    }

    // Check if already responded
    if (link.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${link.status}`,
      });
    }

    // Update link status
    if (action === "accept") {
      await link.accept();

      // Update guardian's role.children array
      const guardian = await User.findById(link.guardian._id);
      const guardianRole = guardian.roles.find((r) => r.type === "guardian");
      if (guardianRole) {
        if (!guardianRole.children) {
          guardianRole.children = [];
        }
        if (!guardianRole.children.includes(req.user._id)) {
          guardianRole.children.push(req.user._id);
        }
        await guardian.save();
      }

      // Update child's studentProfile.guardians array
      if (!req.user.studentProfile.guardians) {
        req.user.studentProfile.guardians = [];
      }
      if (!req.user.studentProfile.guardians.includes(link.guardian._id)) {
        req.user.studentProfile.guardians.push(link.guardian._id);
      }
      await req.user.save();

      // Create success alert for guardian
      await Alert.create({
        recipient: link.guardian._id,
        type: "success",
        priority: 6,
        title: "Yêu cầu liên kết được chấp nhận",
        message: `${req.user.username} đã chấp nhận yêu cầu liên kết của bạn`,
        data: {
          linkId: link._id,
          childId: req.user._id,
          childUsername: req.user.username,
        },
      });

      console.log(
        `✅ Link accepted: ${link.guardian.username} ↔ ${req.user.username}`
      );
    } else {
      await link.reject();

      // Create info alert for guardian
      await Alert.create({
        recipient: link.guardian._id,
        type: "info",
        priority: 4,
        title: "Yêu cầu liên kết bị từ chối",
        message: `${req.user.username} đã từ chối yêu cầu liên kết của bạn`,
        data: {
          linkId: link._id,
          childId: req.user._id,
          childUsername: req.user.username,
        },
      });

      console.log(
        `❌ Link rejected: ${link.guardian.username} ✗ ${req.user.username}`
      );
    }

    res.status(200).json({
      success: true,
      message: `Link request ${action}ed successfully`,
      data: link,
    });
  } catch (error) {
    console.error("❌ Error in respondToLinkRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get pending link requests (Child's view)
 * @route   GET /api/guardian/link-requests
 * @access  Private (Student only)
 */
const getPendingRequests = async (req, res) => {
  try {
    const requests = await GuardianLink.find({
      child: req.user._id,
      status: "pending",
    })
      .populate("guardian", "username email")
      .sort({ createdAt: -1 });

    console.log(
      `📬 Retrieved ${requests.length} pending requests for: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("❌ Error in getPendingRequests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove guardian-child link
 * @route   DELETE /api/guardian/children/:childId
 * @access  Private (Guardian or Child)
 */
const removeLink = async (req, res) => {
  try {
    const { childId } = req.params;

    const link = await GuardianLink.findOne({
      $or: [
        { guardian: req.user._id, child: childId },
        { guardian: childId, child: req.user._id },
      ],
      status: "accepted",
    }).populate("guardian child", "username");

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Active link not found",
      });
    }

    // Block the link
    await link.block();

    // Remove from guardian's role.children
    const guardian = await User.findById(link.guardian._id);
    const guardianRole = guardian.roles.find((r) => r.type === "guardian");
    if (guardianRole && guardianRole.children) {
      guardianRole.children = guardianRole.children.filter(
        (id) => !id.equals(link.child._id)
      );
      await guardian.save();
    }

    // Remove from child's studentProfile.guardians
    const child = await User.findById(link.child._id);
    if (child.studentProfile.guardians) {
      child.studentProfile.guardians = child.studentProfile.guardians.filter(
        (id) => !id.equals(link.guardian._id)
      );
      await child.save();
    }

    // Create alert for the other party
    const isGuardianRemoving = req.user._id.equals(link.guardian._id);
    const otherPartyId = isGuardianRemoving
      ? link.child._id
      : link.guardian._id;
    const otherPartyUsername = isGuardianRemoving
      ? link.child.username
      : link.guardian.username;

    await Alert.create({
      recipient: otherPartyId,
      type: "warning",
      priority: 6,
      title: "Liên kết đã bị xóa",
      message: `${req.user.username} đã xóa liên kết với bạn`,
      data: {
        linkId: link._id,
        removedBy: req.user._id,
        removedByUsername: req.user.username,
      },
    });

    console.log(
      `🗑️ Link removed: ${link.guardian.username} ✗ ${link.child.username}`
    );

    res.status(200).json({
      success: true,
      message: "Link removed successfully",
      data: {},
    });
  } catch (error) {
    console.error("❌ Error in removeLink:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get guardian dashboard summary
 * @route   GET /api/guardian/dashboard
 * @access  Private (Guardian only)
 */
const getDashboardSummary = async (req, res) => {
  try {
    // Get all accepted children
    const links = await GuardianLink.find({
      guardian: req.user._id,
      status: "accepted",
    }).populate("child", "username email focusProfile");

    if (links.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          children: [],
          totalWeekPomodoros: 0,
          averagePomodoros: 0,
          childrenCount: 0,
        },
      });
    }

    // Calculate week start
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get data for each child
    const childrenData = await Promise.all(
      links.map(async (link) => {
        const child = link.child;

        // Today's pomodoros
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todaySessions = await Session.find({
          user: child._id,
          createdAt: { $gte: startOfToday },
          completed: true,
          type: "focus",
        });

        const todayPomodoros = todaySessions.length;

        // Week's pomodoros
        const weekSessions = await Session.find({
          user: child._id,
          createdAt: { $gte: startOfWeek },
          completed: true,
          type: "focus",
        });

        const weekPomodoros = weekSessions.length;

        return {
          childId: child._id,
          username: child.username,
          todayPomodoros,
          weekPomodoros,
          dailyGoal: child.focusProfile?.dailyGoal || 4,
          currentStreak: child.focusProfile?.currentStreak || 0,
        };
      })
    );

    // Calculate totals
    const totalWeekPomodoros = childrenData.reduce(
      (sum, c) => sum + c.weekPomodoros,
      0
    );
    const averagePomodoros =
      childrenData.length > 0
        ? Math.round(totalWeekPomodoros / childrenData.length)
        : 0;

    console.log(
      `📊 Dashboard summary for guardian: ${req.user.username} (${childrenData.length} children)`
    );

    res.status(200).json({
      success: true,
      data: {
        children: childrenData,
        totalWeekPomodoros,
        averagePomodoros,
        childrenCount: childrenData.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in getDashboardSummary:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  sendLinkRequest,
  getLinkedChildren,
  getChildProgress,
  respondToLinkRequest,
  getPendingRequests,
  removeLink,
  getDashboardSummary,
};
