const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, focusProfile, defaultRole, fullName } =
      req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password",
      });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // Create user data
    const userData = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    };

    // Add defaultRole if provided (student, teacher, guardian)
    if (
      defaultRole &&
      ["student", "teacher", "guardian"].includes(defaultRole)
    ) {
      userData.defaultRole = defaultRole;

      // Set roles array with the specified role as primary
      userData.roles = [
        {
          type: defaultRole,
          isPrimary: true,
          isActive: true,
        },
      ];
    }

    // Add fullName to focusProfile if provided
    if (fullName) {
      userData.focusProfile = {
        ...(userData.focusProfile || {}),
        fullName: fullName.trim(),
      };
    }

    // Add focus profile if provided
    if (focusProfile) {
      userData.focusProfile = {
        ...userData.focusProfile,
        ...focusProfile,
      };
    }

    // Create user
    const user = await User.create(userData);

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ New user registered: ${user.username} (${user.email})`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          defaultRole: user.defaultRole,
          roles: user.roles,
          focusProfile: user.focusProfile,
          joinDate: user.joinDate,
          profileCompleteness: user.profileCompleteness,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ User logged in: ${user.username} (${user.email})`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          defaultRole: user.defaultRole,
          roles: user.roles,
          focusProfile: user.focusProfile,
          lastLogin: user.lastLogin,
          profileCompleteness: user.profileCompleteness,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          defaultRole: user.defaultRole,
          roles: user.roles,
          focusProfile: user.focusProfile,
          lastLogin: user.lastLogin,
          joinDate: user.joinDate,
          profileCompleteness: user.profileCompleteness,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error retrieving profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, focusProfile } = req.body;
    const user = req.user;

    // Update fields if provided
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }

      user.username = username.trim();
    }

    if (focusProfile) {
      user.focusProfile = {
        ...user.focusProfile.toObject(),
        ...focusProfile,
      };
    }

    await user.save();

    console.log(`✅ Profile updated: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          defaultRole: user.defaultRole,
          roles: user.roles,
          focusProfile: user.focusProfile,
          profileCompleteness: user.profileCompleteness,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/user/:userId
// @access  Private (User can delete own account, or admin can delete any)
// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const requestingUser = req.user;
    const isAdmin = requestingUser.isAdmin || requestingUser.hasRole("admin");

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required",
      });
    }

    const { page = 1, limit = 20, search = "", role = "" } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "focusProfile.fullName": { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query["roles.type"] = role;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
      error: error.message,
    });
  }
};

// @desc    Promote user to admin (Admin only)
// @route   PUT /api/auth/user/:userId/promote
// @access  Private/Admin
const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    const isAdmin = requestingUser.isAdmin || requestingUser.hasRole("admin");

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required",
      });
    }

    const userToPromote = await User.findById(userId);
    if (!userToPromote) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userToPromote.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
      });
    }

    // Add admin role if not exists
    const hasAdminRole = userToPromote.hasRole("admin");
    if (!hasAdminRole) {
      userToPromote.roles.push({
        type: "admin",
        isActive: true,
        isPrimary: false,
      });
    }

    userToPromote.isAdmin = true;
    await userToPromote.save();

    console.log(
      `👑 User promoted to admin: ${userToPromote.username} by ${requestingUser.username}`
    );

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: {
        user: {
          id: userToPromote._id,
          username: userToPromote.username,
          email: userToPromote.email,
          isAdmin: userToPromote.isAdmin,
          roles: userToPromote.roles,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error promoting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error promoting user",
      error: error.message,
    });
  }
};

// @desc    Revoke admin privileges (Admin only)
// @route   PUT /api/auth/user/:userId/revoke
// @access  Private/Admin
const revokeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    const isAdmin = requestingUser.isAdmin || requestingUser.hasRole("admin");

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin privileges required",
      });
    }

    // Cannot revoke own admin
    if (requestingUser._id.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot revoke your own admin privileges",
      });
    }

    const userToRevoke = await User.findById(userId);
    if (!userToRevoke) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!userToRevoke.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is not an admin",
      });
    }

    userToRevoke.isAdmin = false;

    // Remove admin role
    userToRevoke.roles = userToRevoke.roles.filter((r) => r.type !== "admin");

    // Ensure at least one role remains
    if (userToRevoke.roles.length === 0) {
      userToRevoke.roles.push({
        type: "student",
        isActive: true,
        isPrimary: true,
      });
      userToRevoke.defaultRole = "student";
    }

    await userToRevoke.save();

    console.log(
      `👑 Admin privileges revoked: ${userToRevoke.username} by ${requestingUser.username}`
    );

    res.status(200).json({
      success: true,
      message: "Admin privileges revoked successfully",
      data: {
        user: {
          id: userToRevoke._id,
          username: userToRevoke.username,
          email: userToRevoke.email,
          isAdmin: userToRevoke.isAdmin,
          roles: userToRevoke.roles,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error revoking admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error revoking admin",
      error: error.message,
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/user/:userId
// @access  Private (User can delete own account, Admin can delete any)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id;

    // Check if user exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Authorization check:
    // - Admin can delete any user
    // - Regular users can only delete their own account
    const requestingUser = req.user;
    const isAdmin = requestingUser.isAdmin || requestingUser.hasRole("admin");
    const isDeletingSelf =
      userToDelete._id.toString() === requestingUserId.toString();

    if (!isAdmin && !isDeletingSelf) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own account. Admin privileges required to delete other users.",
      });
    }

    // Prevent deleting other admins (optional security measure)
    if (isAdmin && userToDelete.isAdmin && !isDeletingSelf) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete another admin account",
      });
    }

    // Optional: Clean up related data before deleting user
    // This depends on your data model and relationships
    const Task = require("../models/Task");
    const Stats = require("../models/Stats");
    const Session = require("../models/Session");
    const Class = require("../models/Class");

    // Delete user's tasks
    await Task.deleteMany({ user: userId });

    // Delete user's stats
    await Stats.deleteMany({ user: userId });

    // Delete user's sessions
    await Session.deleteMany({ user: userId });

    // Remove user from classes (as teacher or student)
    await Class.updateMany(
      { teacher: userId },
      { $set: { teacher: null } } // Or you might want to delete the class
    );

    await Class.updateMany(
      { "members.user": userId },
      { $pull: { members: { user: userId } } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    console.log(
      `🗑️ User deleted: ${userToDelete.username} (${userToDelete.email})`
    );

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  promoteToAdmin,
  revokeAdmin,
};
