const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, focusProfile } = req.body;

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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
};
