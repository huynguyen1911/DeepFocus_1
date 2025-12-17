const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
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
} = require("../controllers/classController");
const {
  getClassRewards,
  getClassRewardSummary,
} = require("../controllers/rewardController");

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/classes
// @desc    Create a new class (Teacher only)
// @access  Private
router.post("/", createClass);

// @route   GET /api/classes
// @desc    Get all classes for user (auto-detect role)
// @access  Private
router.get("/", getClasses);

// @route   GET /api/classes/teacher/my-classes
// @desc    Get all classes created by teacher
// @access  Private (Teacher)
router.get("/teacher/my-classes", getTeacherClasses);

// @route   GET /api/classes/student/my-classes
// @desc    Get all classes joined by student
// @access  Private (Student)
router.get("/student/my-classes", getStudentClasses);

// @route   GET /api/classes/:id
// @desc    Get class details by ID
// @access  Private (Members only)
router.get("/:id", getClass);

// @route   PUT /api/classes/:id
// @desc    Update class details (Teacher only)
// @access  Private (Teacher/Creator)
router.put("/:id", updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete class (Teacher only)
// @access  Private (Teacher/Creator)
router.delete("/:id", deleteClass);

// @route   POST /api/classes/join
// @desc    Request to join class with join code (Student only)
// @access  Private (Student)
router.post("/join", requestJoinClass);

// @route   PUT /api/classes/:id/regenerate-code
// @desc    Regenerate join code for class (Teacher only)
// @access  Private (Teacher/Creator)
router.put("/:id/regenerate-code", regenerateJoinCode);

// @route   GET /api/classes/:id/members
// @desc    Get class members list
// @access  Private (Members only)
router.get("/:id/members", getMemberList);

// @route   PUT /api/classes/:id/members/:memberId/approve
// @desc    Approve join request (Teacher only)
// @access  Private (Teacher/Creator)
router.put("/:id/members/:memberId/approve", approveJoinRequest);

// @route   PUT /api/classes/:id/members/:memberId/reject
// @desc    Reject join request (Teacher only)
// @access  Private (Teacher/Creator)
router.put("/:id/members/:memberId/reject", rejectJoinRequest);

// @route   DELETE /api/classes/:id/members/:memberId
// @desc    Remove member from class (Teacher only)
// @access  Private (Teacher/Creator)
router.delete("/:id/members/:memberId", removeMember);

// @route   GET /api/classes/:id/leaderboard
// @desc    Get class leaderboard
// @access  Private (Members only)
router.get("/:id/leaderboard", getClassLeaderboard);

// @route   PUT /api/classes/:id/update-stats
// @desc    Update class statistics
// @access  Private (Teacher/Creator)
router.put("/:id/update-stats", updateClassStats);

// @route   GET /api/classes/:id/student/:studentId/progress
// @desc    Get student progress in class
// @access  Private (Members only)
router.get("/:id/student/:studentId/progress", getStudentProgress);

// @route   GET /api/classes/:id/rewards/summary
// @desc    Get reward summary for a class
// @access  Private (Teacher/Creator)
router.get("/:id/rewards/summary", getClassRewardSummary);

// @route   GET /api/classes/:id/rewards
// @desc    Get all rewards for a class
// @access  Private (Teacher/Creator)
router.get("/:id/rewards", getClassRewards);

module.exports = router;
