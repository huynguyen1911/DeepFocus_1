const express = require("express");
const router = express.Router();
const {
  getUserRoles,
  addRole,
  switchRole,
  updateRoleProfile,
  removeRole,
} = require("../controllers/roleController");
const { authMiddleware } = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/roles
// @desc    Get user roles
// @access  Private
router.get("/", getUserRoles);

// @route   POST /api/roles
// @desc    Add a new role to user
// @access  Private
router.post("/", addRole);

// @route   PUT /api/roles/switch
// @desc    Switch active role
// @access  Private
router.put("/switch", switchRole);

// @route   PUT /api/roles/:roleType/profile
// @desc    Update role-specific profile
// @access  Private
router.put("/:roleType/profile", updateRoleProfile);

// @route   DELETE /api/roles/:roleType
// @desc    Remove a role from user
// @access  Private
router.delete("/:roleType", removeRole);

module.exports = router;
