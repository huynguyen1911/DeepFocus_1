const mongoose = require("mongoose");

const userAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FocusPlan",
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["initial", "weekly", "final", "adjustment"],
      default: "initial",
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // User responses to questionnaire
    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Structured assessment data
    focusLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    distractionLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    motivationLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    // Goals and preferences
    primaryGoal: {
      type: String,
      enum: [
        "exam_preparation",
        "work_productivity",
        "study_habits",
        "meditation",
        "deep_work",
        "reduce_distractions",
        "other",
      ],
    },
    availableTimePerDay: {
      type: Number, // minutes
      min: 5,
      max: 480,
    },
    preferredSessionLength: {
      type: Number, // minutes
      min: 5,
      max: 120,
    },
    experienceLevel: {
      type: String,
      enum: ["none", "beginner", "intermediate", "advanced"],
      default: "none",
    },
    // Main distractions reported
    distractions: [
      {
        type: String,
        enum: [
          "phone",
          "social_media",
          "noise",
          "people",
          "thoughts",
          "fatigue",
          "hunger",
          "other",
        ],
      },
    ],
    // AI Analysis
    aiAnalysis: {
      type: String,
      required: true,
    },
    aiRecommendations: [
      {
        type: String,
      },
    ],
    suggestedDifficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    suggestedDuration: {
      type: Number, // weeks
      min: 1,
      max: 12,
    },
    // Calculated focus score
    focusScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Progress comparison (for weekly/final assessments)
    previousScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    improvement: {
      type: Number, // percentage improvement
    },
    // AI model used
    aiModel: {
      type: String,
      default: "gpt-4o-mini",
    },
    // Additional notes
    userNotes: String,
    coachNotes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
userAssessmentSchema.index({ userId: 1, type: 1, assessmentDate: -1 });
userAssessmentSchema.index({ planId: 1, type: 1 });

// Virtual for improvement status
userAssessmentSchema.virtual("improvementStatus").get(function () {
  if (this.improvement === undefined || this.improvement === null)
    return "baseline";
  if (this.improvement > 10) return "excellent";
  if (this.improvement > 0) return "good";
  if (this.improvement === 0) return "stable";
  return "needs_attention";
});

// Method to calculate focus score from responses
userAssessmentSchema.methods.calculateFocusScore = function () {
  let totalScore = 0;
  let weights = 0;

  // Focus level (weight: 30%)
  if (this.focusLevel) {
    totalScore += this.focusLevel * 3;
    weights += 3;
  }

  // Distraction level (inverted, weight: 20%)
  if (this.distractionLevel) {
    totalScore += (11 - this.distractionLevel) * 2;
    weights += 2;
  }

  // Motivation level (weight: 20%)
  if (this.motivationLevel) {
    totalScore += this.motivationLevel * 2;
    weights += 2;
  }

  // Energy level (weight: 15%)
  if (this.energyLevel) {
    totalScore += this.energyLevel * 1.5;
    weights += 1.5;
  }

  // Stress level (inverted, weight: 15%)
  if (this.stressLevel) {
    totalScore += (11 - this.stressLevel) * 1.5;
    weights += 1.5;
  }

  // Calculate weighted average and normalize to 0-100
  if (weights > 0) {
    this.focusScore = Math.round((totalScore / weights) * 10);
  }

  return this.focusScore;
};

// Method to calculate improvement from previous assessment
userAssessmentSchema.methods.calculateImprovement = async function () {
  if (this.type === "initial") {
    this.improvement = 0;
    return this.save();
  }

  // Find previous assessment
  const previousAssessment = await this.constructor
    .findOne({
      userId: this.userId,
      assessmentDate: { $lt: this.assessmentDate },
    })
    .sort({ assessmentDate: -1 });

  if (previousAssessment && previousAssessment.focusScore) {
    this.previousScore = previousAssessment.focusScore;
    if (this.focusScore && this.previousScore) {
      this.improvement = Math.round(
        ((this.focusScore - this.previousScore) / this.previousScore) * 100
      );
    }
  }

  return this.save();
};

// Static method to get latest assessment for user
userAssessmentSchema.statics.getLatestAssessment = function (userId) {
  return this.findOne({ userId }).sort({ assessmentDate: -1 });
};

// Static method to get assessment history
userAssessmentSchema.statics.getAssessmentHistory = function (
  userId,
  limit = 10
) {
  return this.find({ userId }).sort({ assessmentDate: -1 }).limit(limit);
};

// Static method to get plan assessments
userAssessmentSchema.statics.getPlanAssessments = function (planId) {
  return this.find({ planId }).sort({ assessmentDate: 1 });
};

// Pre-save middleware to calculate scores
userAssessmentSchema.pre("save", function (next) {
  if (
    this.isNew ||
    this.isModified("focusLevel") ||
    this.isModified("distractionLevel")
  ) {
    this.calculateFocusScore();
  }
  next();
});

// Ensure virtuals are included in JSON
userAssessmentSchema.set("toJSON", { virtuals: true });
userAssessmentSchema.set("toObject", { virtuals: true });

const UserAssessment = mongoose.model("UserAssessment", userAssessmentSchema);

module.exports = UserAssessment;
