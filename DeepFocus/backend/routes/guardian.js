const express = require("express");
const router = express.Router();
const {
  sendLinkRequest,
  getLinkedChildren,
  getChildProgress,
  respondToLinkRequest,
  getPendingRequests,
  removeLink,
  getDashboardSummary,
} = require("../controllers/guardianController");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

// All routes require authentication
router.use(authMiddleware);

// Guardian-only routes
// @route   POST /api/guardian/link-child
// @desc    Send link request to child
// @access  Private (Guardian only)
router.post("/link-child", requireRole(["guardian"]), sendLinkRequest);

// @route   GET /api/guardian/children
// @desc    Get guardian's linked children
// @access  Private (Guardian only)
router.get("/children", requireRole(["guardian"]), getLinkedChildren);

// @route   GET /api/guardian/children/:childId/progress
// @desc    Get child's detailed progress
// @access  Private (Guardian with access only)
router.get(
  "/children/:childId/progress",
  requireRole(["guardian"]),
  getChildProgress
);

// @route   DELETE /api/guardian/children/:childId
// @desc    Remove guardian-child link
// @access  Private (Guardian or Child)
router.delete("/children/:childId", removeLink);

// @route   GET /api/guardian/dashboard
// @desc    Get guardian dashboard summary
// @access  Private (Guardian only)
router.get("/dashboard", requireRole(["guardian"]), getDashboardSummary);

// Child-accessible routes
// @route   GET /api/guardian/link-requests
// @desc    Get pending link requests for child
// @access  Private (Student only)
router.get("/link-requests", requireRole(["student"]), getPendingRequests);

// @route   PUT /api/guardian/link-requests/:requestId
// @desc    Respond to link request (accept/reject)
// @access  Private (Child only)
router.put(
  "/link-requests/:requestId",
  requireRole(["student"]),
  respondToLinkRequest
);

module.exports = router;
