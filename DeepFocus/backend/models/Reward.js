const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
    },
    type: {
      type: String,
      enum: ["reward", "penalty"],
      required: [true, "Type is required"],
    },
    category: {
      type: String,
      enum: ["attendance", "performance", "behavior", "achievement"],
      required: [true, "Category is required"],
    },
    points: {
      type: Number,
      required: [true, "Points is required"],
      min: [-100, "Points cannot be less than -100"],
      max: [100, "Points cannot exceed 100"],
      validate: {
        validator: function (value) {
          // Reward must have positive points, penalty must have negative points
          if (this.type === "reward" && value <= 0) {
            return false;
          }
          if (this.type === "penalty" && value >= 0) {
            return false;
          }
          return true;
        },
        message:
          "Reward must have positive points, penalty must have negative points",
      },
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      minlength: [3, "Reason must be at least 3 characters"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "GivenBy is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "approved",
    },
    metadata: {
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
rewardSchema.index({ student: 1, class: 1 });
rewardSchema.index({ class: 1, createdAt: -1 });
rewardSchema.index({ student: 1, createdAt: -1 });
rewardSchema.index({ status: 1 });

// Virtual for age (time since creation)
rewardSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Check if reward can be cancelled (within 24 hours)
rewardSchema.methods.canBeCancelled = function () {
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return this.age < twentyFourHours && this.status === "approved";
};

// Static method to calculate total points for a student in a class
rewardSchema.statics.calculateTotalPoints = async function (
  studentId,
  classId
) {
  const result = await this.aggregate([
    {
      $match: {
        student: new mongoose.Types.ObjectId(studentId),
        class: new mongoose.Types.ObjectId(classId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$points" },
        count: { $sum: 1 },
      },
    },
  ]);

  const breakdown = {
    rewards: { total: 0, count: 0 },
    penalties: { total: 0, count: 0 },
  };

  result.forEach((item) => {
    if (item._id === "reward") {
      breakdown.rewards = { total: item.total, count: item.count };
    } else if (item._id === "penalty") {
      breakdown.penalties = { total: item.total, count: item.count };
    }
  });

  const totalPoints = breakdown.rewards.total + breakdown.penalties.total;

  return {
    totalPoints,
    breakdown,
  };
};

// Static method to get recent rewards for a student
rewardSchema.statics.getRecentRewards = async function (
  studentId,
  classId,
  limit = 10
) {
  return this.find({
    student: studentId,
    class: classId,
    status: "approved",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("givenBy", "fullName email")
    .populate("class", "name")
    .lean();
};

// Pre-save validation
rewardSchema.pre("save", async function (next) {
  // Validate that student is a member of the class
  const Class = mongoose.model("Class");
  const classData = await Class.findById(this.class);

  if (!classData) {
    throw new Error("Class not found");
  }

  const isMember = classData.members.some(
    (m) =>
      m.user.toString() === this.student.toString() && m.status === "active"
  );

  if (!isMember) {
    throw new Error("Student is not an active member of this class");
  }

  // Validate that givenBy is a teacher or guardian
  const User = mongoose.model("User");
  const giver = await User.findById(this.givenBy);

  if (!giver) {
    throw new Error("Giver not found");
  }

  const isTeacher = giver.roles.some((r) => r.type === "teacher" && r.isActive);
  const isGuardian = giver.roles.some(
    (r) => r.type === "guardian" && r.isActive
  );

  if (!isTeacher && !isGuardian) {
    throw new Error("Only teachers and guardians can give rewards");
  }

  // Cannot give reward to self
  if (this.givenBy.toString() === this.student.toString()) {
    throw new Error("Cannot give reward to yourself");
  }

  next();
});

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
