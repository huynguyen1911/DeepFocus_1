const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

// All routes require authentication
router.use(authMiddleware);

// Generate student report (teacher/guardian only)
router.get(
  "/student/:studentId",
  requireRole(["teacher", "guardian"]),
  reportController.generateStudentReport
);

// Download report file
router.get("/download/:filename", reportController.downloadReport);

module.exports = router;
