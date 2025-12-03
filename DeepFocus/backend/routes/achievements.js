const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Get all achievements with user progress
router.get("/", achievementController.getAchievements);

// Get achievement summary
router.get("/summary", achievementController.getAchievementSummary);

// Check and unlock achievements
router.post("/check-unlocks", achievementController.checkUnlocks);

// Get achievement detail
router.get("/:achievementId", achievementController.getAchievementDetail);

// Toggle favorite
router.post("/:achievementId/favorite", achievementController.toggleFavorite);

// Share achievement
router.post("/:achievementId/share", achievementController.shareAchievement);

module.exports = router;
