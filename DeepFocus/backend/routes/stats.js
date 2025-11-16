const express = require("express");
const router = express.Router();
const {
  getStats,
  getDailyStats,
  syncStats,
  getWeeklyStats,
  getMonthlyStats,
  getAchievements,
  resetStats,
} = require("../controllers/statsController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/stats
// @desc    Get user's overall stats
// @access  Private
router.get("/", getStats);

// @route   POST /api/stats/sync
// @desc    Sync pomodoro completion from client
// @access  Private
router.post("/sync", syncStats);

// @route   GET /api/stats/daily/:date
// @desc    Get stats for a specific date (YYYY-MM-DD)
// @access  Private
router.get("/daily/:date", getDailyStats);

// @route   GET /api/stats/weekly/:year/:week
// @desc    Get stats for a specific week
// @access  Private
router.get("/weekly/:year/:week", getWeeklyStats);

// @route   GET /api/stats/monthly/:year/:month
// @desc    Get stats for a specific month
// @access  Private
router.get("/monthly/:year/:month", getMonthlyStats);

// @route   GET /api/stats/achievements
// @desc    Get all achievements with progress
// @access  Private
router.get("/achievements", getAchievements);

// @route   DELETE /api/stats/reset
// @desc    Reset all stats (for testing/admin)
// @access  Private
router.delete("/reset", resetStats);

module.exports = router;
