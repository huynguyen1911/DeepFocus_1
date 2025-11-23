const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    type: {
      type: String,
      enum: ["focus", "short-break", "long-break"],
      required: [true, "Session type is required"],
      default: "focus",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    targetDuration: {
      type: Number, // Target duration in minutes
      default: 25,
    },
    interruptions: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
sessionSchema.index({ user: 1, createdAt: -1 });
sessionSchema.index({ class: 1, createdAt: -1 });
sessionSchema.index({ user: 1, class: 1, createdAt: -1 });
sessionSchema.index({ completed: 1, type: 1 });

// Virtual for completion percentage
sessionSchema.virtual("completionRate").get(function () {
  if (this.targetDuration === 0) return 0;
  return Math.round((this.duration / this.targetDuration) * 100);
});

// Virtual to check if session was fully completed
sessionSchema.virtual("isFullyCompleted").get(function () {
  return this.duration >= this.targetDuration;
});

// Method to complete session
sessionSchema.methods.completeSession = function (endTime = new Date()) {
  // Don't modify if already completed
  if (this.completed) {
    return Promise.resolve(this);
  }

  this.endTime = endTime;
  this.completed = true;
  this.isActive = false;

  // Calculate actual duration in minutes
  const durationMs = this.endTime - this.startTime;
  this.duration = Math.round(durationMs / (1000 * 60));

  return this.save();
};

// Method to cancel/abandon session
sessionSchema.methods.cancelSession = function () {
  this.completed = false;
  this.isActive = false;
  this.endTime = new Date();

  const durationMs = this.endTime - this.startTime;
  this.duration = Math.round(durationMs / (1000 * 60));

  return this.save();
};

// Static method to get user's session stats
sessionSchema.statics.getUserStats = async function (
  userId,
  startDate,
  endDate
) {
  const match = {
    user: new mongoose.Types.ObjectId(userId),
    completed: true,
    type: "focus",
  };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        avgDuration: { $avg: "$duration" },
        fullySessions: {
          $sum: {
            $cond: [{ $gte: ["$duration", "$targetDuration"] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      avgDuration: 0,
      completionRate: 0,
    };
  }

  const result = stats[0];
  return {
    totalSessions: result.totalSessions,
    totalDuration: result.totalDuration,
    avgDuration: Math.round(result.avgDuration),
    completionRate: Math.round(
      (result.fullySessions / result.totalSessions) * 100
    ),
    focusSessions: result.totalSessions, // All matched sessions are focus type
  };
};

// Static method to get class session stats
sessionSchema.statics.getClassStats = async function (
  classId,
  startDate,
  endDate
) {
  const match = {
    class: new mongoose.Types.ObjectId(classId),
    completed: true,
    type: "focus",
  };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        avgDuration: { $avg: "$duration" },
        uniqueStudents: { $addToSet: "$user" },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      activeStudents: 0,
      avgPerStudent: 0,
    };
  }

  const result = stats[0];
  const activeStudents = result.uniqueStudents.length;

  return {
    totalSessions: result.totalSessions,
    totalDuration: result.totalDuration,
    avgDuration: Math.round(result.avgDuration),
    activeStudents,
    avgPerStudent:
      activeStudents > 0
        ? Math.round(result.totalSessions / activeStudents)
        : 0,
  };
};

// Static method to get class leaderboard
sessionSchema.statics.getClassLeaderboard = async function (
  classId,
  limit = 10
) {
  return this.aggregate([
    {
      $match: {
        class: new mongoose.Types.ObjectId(classId),
        completed: true,
        type: "focus",
      },
    },
    {
      $group: {
        _id: "$user",
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        lastSession: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSessions: -1, totalDuration: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        userId: "$_id",
        username: "$userInfo.username",
        fullName: "$userInfo.focusProfile.fullName",
        email: "$userInfo.email",
        totalSessions: 1,
        totalDuration: 1,
        lastSession: 1,
        avgDuration: {
          $round: [{ $divide: ["$totalDuration", "$totalSessions"] }, 0],
        },
      },
    },
  ]);
};

// Pre-save middleware to validate session
sessionSchema.pre("save", function (next) {
  // Ensure duration is not negative
  if (this.duration < 0) {
    this.duration = 0;
  }

  // If session is completed, ensure endTime is set
  if (this.completed && !this.endTime) {
    this.endTime = new Date();
  }

  next();
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
