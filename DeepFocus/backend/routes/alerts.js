const express = require("express");
const router = express.Router();
const {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  cleanupOldAlerts,
} = require("../controllers/alertController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/alerts
// @desc    Get user's alerts
// @access  Private
router.get("/", getAlerts);

// @route   PUT /api/alerts/read-all
// @desc    Mark all alerts as read
// @access  Private
router.put("/read-all", markAllAlertsAsRead);

// @route   DELETE /api/alerts/cleanup
// @desc    Delete old alerts (older than 30 days)
// @access  Private
router.delete("/cleanup", cleanupOldAlerts);

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put("/:id/read", markAlertAsRead);

// @route   DELETE /api/alerts/:id
// @desc    Delete an alert
// @access  Private
router.delete("/:id", deleteAlert);

module.exports = router;
