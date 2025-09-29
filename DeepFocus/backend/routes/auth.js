const express = require("express");
const router = express.Router();

// Import controllers
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
} = require("../controllers/authController");

// Import middleware
const { authMiddleware } = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authMiddleware, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authMiddleware, updateProfile);

// @route   GET /api/auth/verify
// @desc    Verify token is valid
// @access  Private
router.get("/verify", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isActive: req.user.isActive,
      },
    },
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authMiddleware, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  console.log(`User logged out: ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: "Logout successful. Please remove token from client storage.",
  });
});

module.exports = router;
