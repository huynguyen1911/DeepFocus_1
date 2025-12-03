const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Get competitions
router.get("/", competitionController.getCompetitions);

// Get user's competitions
router.get("/my-competitions", competitionController.getUserCompetitions);

// Create competition
router.post("/", competitionController.createCompetition);

// Get competition detail
router.get("/:competitionId", competitionController.getCompetitionDetail);

// Join competition
router.post("/:competitionId/join", competitionController.joinCompetition);

// Leave competition
router.post("/:competitionId/leave", competitionController.leaveCompetition);

// Get leaderboard
router.get("/:competitionId/leaderboard", competitionController.getLeaderboard);

// Update progress (system call)
router.post("/:competitionId/progress", competitionController.updateProgress);

// Claim prize
router.post("/:competitionId/claim-prize", competitionController.claimPrize);

// End competition (creator only)
router.post("/:competitionId/end", competitionController.endCompetition);

module.exports = router;
