const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const statsRoutes = require("./routes/stats");
const roleRoutes = require("./routes/roles");
const classRoutes = require("./routes/classes");

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8081",
      "http://10.100.101.228:8081", // Add updated IP address
      "http://localhost:19006", // Expo web
      "exp://10.100.101.228:8081", // Expo mobile
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/deepfocus",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/classes", classRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DeepFocus Backend API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Debug endpoint to check user (REMOVE IN PRODUCTION)
app.get("/api/debug/user/:email", async (req, res) => {
  try {
    const User = require("./models/User");
    const user = await User.findOne({ email: req.params.email.toLowerCase() });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
        email: req.params.email.toLowerCase(),
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        defaultRole: user.defaultRole,
        roles: user.roles,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check class (REMOVE IN PRODUCTION)
app.get("/api/debug/class/:classId", async (req, res) => {
  try {
    const Class = require("./models/Class");
    const classData = await Class.findById(req.params.classId)
      .populate("createdBy", "focusProfile.fullName email defaultRole")
      .populate("members.user", "focusProfile.fullName email defaultRole");

    if (!classData) {
      return res.json({
        success: false,
        message: "Class not found",
        classId: req.params.classId
      });
    }

    res.json({
      success: true,
      class: {
        id: classData._id,
        name: classData.name,
        createdBy: classData.createdBy,
        joinCode: classData.joinCode,
        members: classData.members.map(m => ({
          userId: m.user._id,
          userEmail: m.user.email,
          userName: m.user.focusProfile?.fullName,
          userRole: m.user.defaultRole,
          status: m.status,
          role: m.role,
          joinedAt: m.joinedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to DeepFocus API",
    documentation: "/api/health for health check",
    version: "1.0.0",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 DeepFocus Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network:10.100.101.228:${PORT}/api/health`); // Updated IP
  console.log(
    `🌍 CORS enabled for: ${
      process.env.FRONTEND_URL || "http://localhost:8081"
    }`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});
