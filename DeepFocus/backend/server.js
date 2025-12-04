const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const ip = require("ip");

// Load environment variables
dotenv.config();

// Get local IP address automatically
const LOCAL_IP = ip.address();

// Import routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const statsRoutes = require("./routes/stats");
const roleRoutes = require("./routes/roles");
const classRoutes = require("./routes/classes");
const sessionRoutes = require("./routes/sessions");

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8081",
      `http://${LOCAL_IP}:8081`, // Auto-detected IP for mobile
      "http://localhost:19006", // Expo web
      `exp://${LOCAL_IP}:8081`, // Expo mobile with auto IP
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

// Connect to database only if not in test mode
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rewards", require("./routes/rewards"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/guardian", require("./routes/guardian"));
app.use("/api/achievements", require("./routes/achievements"));
app.use("/api/competitions", require("./routes/competitions"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/reports", require("./routes/reports"));

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

// Debug endpoint - ONLY enabled in development
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/user/:email", async (req, res) => {
    try {
      const User = require("./models/User");
      const user = await User.findOne({
        email: req.params.email.toLowerCase(),
      });

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
}

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

// Export app for testing
module.exports = app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  const HOST = "0.0.0.0"; // Listen on all network interfaces

  app.listen(PORT, HOST, () => {
    console.log(`🚀 DeepFocus Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Local: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Network: http://${LOCAL_IP}:${PORT}/api/health`);
    console.log(`📱 Mobile API URL: http://${LOCAL_IP}:${PORT}/api`);
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
}
