const express = require("express");
const router = express.Router();
const { authMiddleware: auth } = require("../middleware/auth");
const focusTrainingController = require("../controllers/focusTrainingController");

/**
 * @route   POST /api/focus-training/assess
 * @desc    Submit initial assessment and get AI analysis
 * @access  Private
 */
router.post("/assess", auth, focusTrainingController.submitAssessment);

/**
 * @route   POST /api/focus-training/generate-plan
 * @desc    Generate personalized training plan based on assessment
 * @access  Private
 */
router.post("/generate-plan", auth, focusTrainingController.generatePlan);

/**
 * @route   GET /api/focus-training/plan
 * @desc    Get user's active training plan
 * @access  Private
 */
router.get("/plan", auth, focusTrainingController.getActivePlan);

/**
 * @route   GET /api/focus-training/days
 * @desc    Get training days for date range (for calendar)
 * @query   startDate, endDate
 * @access  Private
 */
router.get("/days", auth, focusTrainingController.getTrainingDays);

/**
 * @route   GET /api/focus-training/day/:date
 * @desc    Get specific training day details
 * @access  Private
 */
router.get("/day/:date", auth, focusTrainingController.getTrainingDay);

/**
 * @route   POST /api/focus-training/day/:dayId/challenge/:challengeIndex/complete
 * @desc    Complete a specific challenge
 * @access  Private
 */
router.post(
  "/day/:dayId/challenge/:challengeIndex/complete",
  auth,
  focusTrainingController.completeChallenge
);

/**
 * @route   POST /api/focus-training/weekly-assessment
 * @desc    Submit weekly assessment and get AI feedback
 * @access  Private
 */
router.post(
  "/weekly-assessment",
  auth,
  focusTrainingController.submitWeeklyAssessment
);

/**
 * @route   GET /api/focus-training/progress
 * @desc    Get user's training progress dashboard
 * @access  Private
 */
router.get("/progress", auth, focusTrainingController.getProgress);

/**
 * @route   PUT /api/focus-training/plan/status
 * @desc    Pause/Resume/Cancel plan
 * @body    { action: 'pause' | 'resume' | 'cancel' }
 * @access  Private
 */
router.put("/plan/status", auth, focusTrainingController.updatePlanStatus);

module.exports = router;
