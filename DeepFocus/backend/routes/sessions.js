const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
  createSession,
  completeSession,
  cancelSession,
  getUserSessions,
  getClassSessions,
  getSessionStats,
  getActiveSession,
} = require("../controllers/sessionController");

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post("/", createSession);

// @route   GET /api/sessions/active
// @desc    Get user's active session
// @access  Private
router.get("/active", getActiveSession);

// @route   GET /api/sessions/my-sessions
// @desc    Get user's sessions with pagination and filters
// @access  Private
router.get("/my-sessions", getUserSessions);

// @route   GET /api/sessions/stats
// @desc    Get session statistics (user or class)
// @access  Private
router.get("/stats", getSessionStats);

// @route   GET /api/sessions/class/:classId
// @desc    Get all sessions for a specific class
// @access  Private (Class members only)
router.get("/class/:classId", getClassSessions);

// @route   PUT /api/sessions/:id/complete
// @desc    Complete a session
// @access  Private
router.put("/:id/complete", completeSession);

// @route   PUT /api/sessions/:id/cancel
// @desc    Cancel/abandon a session
// @access  Private
router.put("/:id/cancel", cancelSession);

module.exports = router;
