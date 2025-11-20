const User = require("../models/User");

// @desc    Get user roles
// @route   GET /api/roles
// @access  Private
const getUserRoles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "roles defaultRole studentProfile teacherProfile guardianProfile"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        roles: user.roles,
        defaultRole: user.defaultRole,
        profiles: {
          student: user.studentProfile,
          teacher: user.teacherProfile,
          guardian: user.guardianProfile,
        },
      },
    });
  } catch (error) {
    console.error("Error in getUserRoles:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Add a new role to user
// @route   POST /api/roles
// @access  Private
const addRole = async (req, res) => {
  try {
    const { roleType } = req.body;

    if (!roleType) {
      return res.status(400).json({
        success: false,
        message: "Role type is required",
      });
    }

    // Validate role type
    const validRoles = ["student", "teacher", "guardian"];
    if (!validRoles.includes(roleType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role type. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if role already exists
    if (user.hasRole(roleType)) {
      return res.status(400).json({
        success: false,
        message: `User already has ${roleType} role`,
      });
    }

    // Add the role
    await user.addRole(roleType);

    res.status(201).json({
      success: true,
      message: `${roleType} role added successfully`,
      data: {
        roles: user.roles,
        defaultRole: user.defaultRole,
      },
    });
  } catch (error) {
    console.error("Error in addRole:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Switch active role
// @route   PUT /api/roles/switch
// @access  Private
const switchRole = async (req, res) => {
  try {
    const { roleType } = req.body;

    if (!roleType) {
      return res.status(400).json({
        success: false,
        message: "Role type is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has this role
    if (!user.hasRole(roleType)) {
      return res.status(400).json({
        success: false,
        message: `User does not have ${roleType} role`,
      });
    }

    // Switch primary role
    await user.switchPrimaryRole(roleType);

    res.status(200).json({
      success: true,
      message: `Switched to ${roleType} role`,
      data: {
        roles: user.roles,
        defaultRole: user.defaultRole,
      },
    });
  } catch (error) {
    console.error("Error in switchRole:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update role-specific profile
// @route   PUT /api/roles/:roleType/profile
// @access  Private
const updateRoleProfile = async (req, res) => {
  try {
    const { roleType } = req.params;
    const profileData = req.body;

    // Validate role type
    const validRoles = ["student", "teacher", "guardian"];
    if (!validRoles.includes(roleType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role type. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has this role
    if (!user.hasRole(roleType)) {
      return res.status(400).json({
        success: false,
        message: `User does not have ${roleType} role`,
      });
    }

    // Update the appropriate profile
    const profileField = `${roleType}Profile`;
    user[profileField] = { ...user[profileField].toObject(), ...profileData };

    await user.save();

    res.status(200).json({
      success: true,
      message: `${roleType} profile updated successfully`,
      data: {
        profile: user[profileField],
      },
    });
  } catch (error) {
    console.error("Error in updateRoleProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Remove a role from user
// @route   DELETE /api/roles/:roleType
// @access  Private
const removeRole = async (req, res) => {
  try {
    const { roleType } = req.params;

    // Validate role type
    const validRoles = ["student", "teacher", "guardian"];
    if (!validRoles.includes(roleType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role type. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has this role
    if (!user.hasRole(roleType)) {
      return res.status(400).json({
        success: false,
        message: `User does not have ${roleType} role`,
      });
    }

    // Remove the role
    await user.removeRole(roleType);

    res.status(200).json({
      success: true,
      message: `${roleType} role removed successfully`,
      data: {
        roles: user.roles,
        defaultRole: user.defaultRole,
      },
    });
  } catch (error) {
    console.error("Error in removeRole:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  getUserRoles,
  addRole,
  switchRole,
  updateRoleProfile,
  removeRole,
};
