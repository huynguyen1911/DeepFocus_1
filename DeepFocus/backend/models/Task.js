const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề task là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task phải thuộc về một user"],
      index: true,
    },
    estimatedPomodoros: {
      type: Number,
      default: 1,
      min: [1, "Số pomodoro dự kiến phải ít nhất là 1"],
      max: [50, "Số pomodoro dự kiến không được vượt quá 50"],
    },
    completedPomodoros: {
      type: Number,
      default: 0,
      min: [0, "Số pomodoro đã hoàn thành không thể âm"],
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority phải là low, medium hoặc high",
      },
      default: "medium",
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient querying
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, isCompleted: 1 });

// Virtual for progress percentage
taskSchema.virtual("progress").get(function () {
  if (this.estimatedPomodoros === 0) return 0;
  return Math.round((this.completedPomodoros / this.estimatedPomodoros) * 100);
});

// Virtual to check if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

// Pre-save middleware to set completedAt when isCompleted changes
taskSchema.pre("save", function (next) {
  if (this.isModified("isCompleted") && this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Method to increment pomodoro count
taskSchema.methods.incrementPomodoro = function () {
  this.completedPomodoros += 1;

  // Auto-complete if reached estimated pomodoros
  if (this.completedPomodoros >= this.estimatedPomodoros && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }

  return this.save();
};

// Static method to get user's task statistics
taskSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: ["$isCompleted", 1, 0] },
        },
        totalPomodoros: { $sum: "$completedPomodoros" },
        pendingTasks: {
          $sum: { $cond: ["$isCompleted", 0, 1] },
        },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        totalTasks: 0,
        completedTasks: 0,
        totalPomodoros: 0,
        pendingTasks: 0,
      };
};

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
