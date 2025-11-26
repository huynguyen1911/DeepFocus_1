const express = require("express");
const router = express.Router();
const {
  createReward,
  getStudentRewards,
  cancelReward,
  getRewardSummary,
} = require("../controllers/rewardController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/rewards
// @desc    Create a reward or penalty
// @access  Private (Teacher/Guardian only)
router.post("/", createReward);

// @route   GET /api/rewards/student/:studentId/class/:classId
// @desc    Get rewards for a student in a specific class
// @access  Private
router.get("/student/:studentId/class/:classId", getStudentRewards);

// @route   GET /api/rewards/student/:studentId/summary
// @desc    Get reward summary for a student across all classes
// @access  Private
router.get("/student/:studentId/summary", getRewardSummary);

// @route   DELETE /api/rewards/:id
// @desc    Cancel a reward (within 24 hours)
// @access  Private (Creator only)
router.delete("/:id", cancelReward);

module.exports = router;
