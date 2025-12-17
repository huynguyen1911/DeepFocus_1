const mongoose = require("mongoose");

const focusPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 12, // weeks
      default: 4,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goals: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "paused", "cancelled"],
      default: "pending",
      index: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    trainingDays: {
      type: Number,
      required: true,
    },
    restDays: {
      type: Number,
      required: true,
    },
    completedDays: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentWeek: {
      type: Number,
      default: 1,
      min: 1,
    },
    initialAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAssessment",
    },
    finalAssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAssessment",
    },
    // AI generated plan metadata
    aiModel: {
      type: String,
      default: "gpt-4o-mini",
    },
    aiGeneratedAt: {
      type: Date,
      default: Date.now,
    },
    planStructure: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    // Progress tracking
    totalPoints: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    // Statistics
    averageSessionDuration: {
      type: Number,
      default: 0,
    },
    totalFocusMinutes: {
      type: Number,
      default: 0,
    },
    // Settings
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: String, // HH:MM format
      default: "09:00",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
focusPlanSchema.index({ userId: 1, status: 1 });
focusPlanSchema.index({ userId: 1, createdAt: -1 });
focusPlanSchema.index({ startDate: 1, endDate: 1 });

// Virtual for weeks array
focusPlanSchema.virtual("weeks").get(function () {
  return Math.ceil(this.duration);
});

// Virtual for days remaining
focusPlanSchema.virtual("daysRemaining").get(function () {
  return this.totalDays - this.completedDays;
});

// Virtual for is active
focusPlanSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === "active" && this.startDate <= now && this.endDate >= now
  );
});

// Method to update completion rate
focusPlanSchema.methods.updateCompletionRate = function () {
  if (this.totalDays > 0) {
    this.completionRate = Math.round(
      (this.completedDays / this.totalDays) * 100
    );
  }
  return this.save();
};

// Method to mark day as completed
focusPlanSchema.methods.markDayCompleted = async function (points = 0) {
  this.completedDays += 1;
  this.totalPoints += points;

  // Update streak
  this.currentStreak += 1;
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  // Update completion rate
  this.completionRate = Math.round((this.completedDays / this.totalDays) * 100);

  // Check if plan is completed
  if (this.completedDays >= this.totalDays) {
    this.status = "completed";
  }

  return this.save();
};

// Method to break streak
focusPlanSchema.methods.breakStreak = function () {
  this.currentStreak = 0;
  return this.save();
};

// Method to pause plan
focusPlanSchema.methods.pause = function () {
  this.status = "paused";
  return this.save();
};

// Method to resume plan
focusPlanSchema.methods.resume = function () {
  this.status = "active";
  return this.save();
};

// Method to cancel plan
focusPlanSchema.methods.cancel = function () {
  this.status = "cancelled";
  return this.save();
};

// Static method to get active plan for user
focusPlanSchema.statics.getActivePlan = function (userId) {
  return this.findOne({
    userId,
    status: "active",
  }).sort({ createdAt: -1 });
};

// Static method to get user's plans
focusPlanSchema.statics.getUserPlans = function (userId, limit = 10) {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

// Pre-save middleware to calculate end date if not set
focusPlanSchema.pre("save", function (next) {
  if (!this.endDate && this.startDate && this.duration) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.duration * 7);
    this.endDate = endDate;
  }
  next();
});

// Ensure virtuals are included in JSON
focusPlanSchema.set("toJSON", { virtuals: true });
focusPlanSchema.set("toObject", { virtuals: true });

const FocusPlan = mongoose.model("FocusPlan", focusPlanSchema);

module.exports = FocusPlan;
