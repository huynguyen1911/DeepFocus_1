const Session = require("../models/Session");
const Class = require("../models/Class");
const Task = require("../models/Task");

/**
 * @desc    Create a new session
 * @route   POST /api/sessions
 * @access  Private
 */
const createSession = async (req, res) => {
  try {
    const { taskId, classId, type, targetDuration } = req.body;
    const userId = req.user._id;

    // Validate type
    const validTypes = ["focus", "short-break", "long-break"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session type",
      });
    }

    // Verify task exists if provided
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Verify task belongs to user
      if (task.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Task does not belong to you",
        });
      }
    }

    // Verify class exists if provided
    if (classId) {
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Verify user is a member of the class
      const isMember = classData.members.some(
        (m) => m.user.toString() === userId.toString() && m.status === "active"
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "You are not an active member of this class",
        });
      }
    }

    // Check if user has an active session
    const activeSession = await Session.findOne({
      user: userId,
      isActive: true,
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: "You already have an active session",
        activeSession: activeSession._id,
      });
    }

    // Create session
    const session = await Session.create({
      user: userId,
      task: taskId || null,
      class: classId || null,
      type: type || "focus",
      targetDuration: targetDuration || 25,
      startTime: new Date(),
      isActive: true,
    });

    // Populate references
    await session.populate([
      { path: "user", select: "username focusProfile.fullName email" },
      { path: "task", select: "title description" },
      { path: "class", select: "name joinCode" },
    ]);

    res.status(201).json({
      success: true,
      message: "Session started successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create session",
      error: error.message,
    });
  }
};

/**
 * @desc    Complete a session
 * @route   PUT /api/sessions/:id/complete
 * @access  Private
 */
const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { notes } = req.body;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify session belongs to user
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your own sessions",
      });
    }

    // Check if already completed
    if (session.completed) {
      return res.status(400).json({
        success: false,
        message: "Session is already completed",
      });
    }

    // Add notes if provided
    if (notes) {
      session.notes = notes;
    }

    // Complete the session
    await session.completeSession();

    // If session is associated with a task, update task's completed pomodoros
    if (session.task && session.type === "focus") {
      await Task.findByIdAndUpdate(session.task, {
        $inc: { completedPomodoros: 1 },
      });
    }

    // If session is associated with a class, update class stats
    if (session.class && session.type === "focus") {
      await Class.findByIdAndUpdate(session.class, {
        $inc: {
          "stats.totalPomodoros": 1,
          "stats.totalFocusTime": session.duration,
        },
        "stats.lastUpdated": new Date(),
      });
    }

    // Populate references
    await session.populate([
      { path: "user", select: "username focusProfile.fullName email" },
      { path: "task", select: "title description completedPomodoros" },
      { path: "class", select: "name joinCode" },
    ]);

    res.json({
      success: true,
      message: "Session completed successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error completing session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete session",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel/abandon a session
 * @route   PUT /api/sessions/:id/cancel
 * @access  Private
 */
const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // Verify session belongs to user
    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own sessions",
      });
    }

    // Check if already completed or cancelled
    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: "Session is not active",
      });
    }

    // Cancel the session
    await session.cancelSession();

    await session.populate([
      { path: "user", select: "username focusProfile.fullName email" },
      { path: "task", select: "title description" },
      { path: "class", select: "name joinCode" },
    ]);

    res.json({
      success: true,
      message: "Session cancelled successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error cancelling session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel session",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's sessions
 * @route   GET /api/sessions/my-sessions
 * @access  Private
 */
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, completed } = req.query;

    const query = { user: userId };

    if (type) {
      query.type = type;
    }

    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    const sessions = await Session.find(query)
      .populate("task", "title description")
      .populate("class", "name joinCode")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: sessions,
    });
  } catch (error) {
    console.error("Error getting user sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sessions",
      error: error.message,
    });
  }
};

/**
 * @desc    Get class sessions
 * @route   GET /api/sessions/class/:classId
 * @access  Private (Class members only)
 */
const getClassSessions = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Verify class exists and user is a member
    const classData = await Class.findById(classId);

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

    const query = {
      class: classId,
      completed: true,
      type: "focus",
    };

    const sessions = await Session.find(query)
      .populate("user", "username focusProfile.fullName email")
      .populate("task", "title description")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      sessions: sessions,
    });
  } catch (error) {
    console.error("Error getting class sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class sessions",
      error: error.message,
    });
  }
};

/**
 * @desc    Get session statistics
 * @route   GET /api/sessions/stats
 * @access  Private
 */
const getSessionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { classId, startDate, endDate } = req.query;

    let stats;

    if (classId) {
      // Verify user is a member of the class
      const classData = await Class.findById(classId);

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

      // Get class stats
      stats = await Session.getClassStats(classId, startDate, endDate);
    } else {
      // Get user stats
      stats = await Session.getUserStats(userId, startDate, endDate);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting session stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get session statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get active session
 * @route   GET /api/sessions/active
 * @access  Private
 */
const getActiveSession = async (req, res) => {
  try {
    const userId = req.user._id;

    const session = await Session.findOne({
      user: userId,
      isActive: true,
    })
      .populate("task", "title description")
      .populate("class", "name joinCode");

    if (!session) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error getting active session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active session",
      error: error.message,
    });
  }
};

module.exports = {
  createSession,
  completeSession,
  cancelSession,
  getUserSessions,
  getClassSessions,
  getSessionStats,
  getActiveSession,
};
