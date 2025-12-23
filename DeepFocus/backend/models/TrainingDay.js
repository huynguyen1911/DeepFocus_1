const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "focus_session",
      "breathing",
      "mindfulness",
      "stretching",
      "reflection",
    ],
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  description: {
    type: String,
    required: true,
  },
  instructions: [
    {
      type: String,
    },
  ],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  feedback: String,
});

const trainingDaySchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FocusPlan",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["training", "rest", "assessment"],
      default: "training",
    },
    challenges: [challengeSchema],
    feedback: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    totalPoints: {
      type: Number,
      default: 0,
    },
    aiEncouragement: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
trainingDaySchema.index({ planId: 1, date: 1 });
trainingDaySchema.index({ userId: 1, date: 1 });
trainingDaySchema.index({ userId: 1, completed: 1 });

// Virtual for completion percentage
trainingDaySchema.virtual("completionPercentage").get(function () {
  if (!this.challenges || this.challenges.length === 0) return 0;
  const completedCount = this.challenges.filter((c) => c.completed).length;
  return Math.round((completedCount / this.challenges.length) * 100);
});

// Method to mark challenge as completed
trainingDaySchema.methods.completeChallenge = function (challengeIndex, score) {
  if (challengeIndex >= 0 && challengeIndex < this.challenges.length) {
    this.challenges[challengeIndex].completed = true;
    this.challenges[challengeIndex].completedAt = new Date();
    this.challenges[challengeIndex].score = score;

    // Calculate points (50 base + score bonus)
    const points = 50 + Math.floor(score / 2);
    this.totalPoints += points;

    // Check if all challenges completed
    const allCompleted = this.challenges.every((c) => c.completed);
    if (allCompleted) {
      this.completed = true;
      this.completedAt = new Date();
      // Bonus points for completing all challenges
      this.totalPoints += 100;
    }
  }
  return this.save();
};

// Method to get remaining challenges
trainingDaySchema.methods.getRemainingChallenges = function () {
  return this.challenges.filter((c) => !c.completed);
};

// Static method to get training days for a date range
trainingDaySchema.statics.getForDateRange = async function (
  userId,
  startDate,
  endDate
) {
  // Ensure we cover the full day range regardless of timezone
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // First get active plan(s) for this user
  const FocusPlan = require("./FocusPlan");
  const activePlans = await FocusPlan.find({ userId, status: "active" });
  const activePlanIds = activePlans.map((p) => p._id);

  // Only return training days from active plans
  return this.find({
    userId,
    planId: { $in: activePlanIds },
    date: {
      $gte: start,
      $lte: end,
    },
  }).sort({ date: 1 });
};

// Static method to get today's training
trainingDaySchema.statics.getTodayTraining = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Only get training day from active plan
  const FocusPlan = require("./FocusPlan");
  const activePlan = await FocusPlan.findOne({ userId, status: "active" });

  if (!activePlan) {
    return null;
  }

  return this.findOne({
    userId,
    planId: activePlan._id,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });
};

// Static method to get week's training days
trainingDaySchema.statics.getWeekTraining = function (
  userId,
  weekNumber,
  planId
) {
  return this.find({
    userId,
    planId,
    weekNumber,
  }).sort({ dayNumber: 1 });
};

// Ensure virtuals are included in JSON
trainingDaySchema.set("toJSON", { virtuals: true });
trainingDaySchema.set("toObject", { virtuals: true });

const TrainingDay = mongoose.model("TrainingDay", trainingDaySchema);

module.exports = TrainingDay;
