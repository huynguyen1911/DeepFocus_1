const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const focusProfileSchema = new mongoose.Schema({
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100,
  },
  dailyGoal: {
    type: Number,
    default: 4, // 4 pomodoro sessions per day
    min: 1,
    max: 20,
  },
  workDuration: {
    type: Number,
    default: 25, // 25 minutes
    min: 5,
    max: 60,
  },
  shortBreakDuration: {
    type: Number,
    default: 5, // 5 minutes
    min: 1,
    max: 15,
  },
  longBreakDuration: {
    type: Number,
    default: 15, // 15 minutes
    min: 5,
    max: 30,
  },
  sessionsBeforeLongBreak: {
    type: Number,
    default: 4, // Long break after 4 sessions
    min: 2,
    max: 8,
  },
  totalSessionsCompleted: {
    type: Number,
    default: 0,
  },
  totalFocusTime: {
    type: Number,
    default: 0, // Total minutes focused
  },
  currentStreak: {
    type: Number,
    default: 0, // Current daily streak
  },
  longestStreak: {
    type: Number,
    default: 0, // Longest daily streak
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    focusProfile: {
      type: focusProfileSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual("profileCompleteness").get(function () {
  let completeness = 0;
  if (this.username) completeness += 25;
  if (this.email) completeness += 25;
  if (this.focusProfile.dailyGoal > 0) completeness += 25;
  if (this.focusProfile.workDuration > 0) completeness += 25;
  return completeness;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method to update focus stats
userSchema.methods.updateFocusStats = function (sessionDuration) {
  this.focusProfile.totalSessionsCompleted += 1;
  this.focusProfile.totalFocusTime += sessionDuration;

  // Update level based on total sessions (every 10 sessions = 1 level)
  this.focusProfile.level =
    Math.floor(this.focusProfile.totalSessionsCompleted / 10) + 1;

  return this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Pre-remove middleware
userSchema.pre("remove", function (next) {
  console.log(`User ${this.username} is being removed`);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
