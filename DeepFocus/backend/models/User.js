const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const focusProfileSchema = new mongoose.Schema({
  fullName: {
    type: String,
    default: "",
    trim: true,
  },
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

// Role schema for multi-role support
const roleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["student", "teacher", "guardian", "admin"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  // Guardian-specific field: array of child user IDs
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Student profile schema
const studentProfileSchema = new mongoose.Schema({
  grade: {
    type: String,
    default: "",
  },
  school: {
    type: String,
    default: "",
  },
  guardians: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  joinedClasses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
});

// Teacher profile schema
const teacherProfileSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
  },
  school: {
    type: String,
    default: "",
  },
  subject: {
    type: String,
    default: "",
  },
  createdClasses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
});

// Guardian profile schema
const guardianProfileSchema = new mongoose.Schema({
  relation: {
    type: String,
    default: "",
    enum: ["", "parent", "guardian", "relative", "other"],
  },
  monitoringStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
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
    roles: {
      type: [roleSchema],
      default: () => [{ type: "student", isPrimary: true, isActive: true }],
      validate: {
        validator: function (roles) {
          // Must have at least one role
          if (roles.length === 0) return false;

          // Check for duplicate role types
          const types = roles.map((r) => r.type);
          const uniqueTypes = new Set(types);
          if (types.length !== uniqueTypes.size) return false;

          // Must have exactly one primary role
          const primaryRoles = roles.filter((r) => r.isPrimary);
          return primaryRoles.length === 1;
        },
        message:
          "User must have at least one role, no duplicate roles, and exactly one primary role",
      },
    },
    defaultRole: {
      type: String,
      enum: ["student", "teacher", "guardian", "admin"],
      default: "student",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    studentProfile: {
      type: studentProfileSchema,
      default: () => ({}),
    },
    teacherProfile: {
      type: teacherProfileSchema,
      default: () => ({}),
    },
    guardianProfile: {
      type: guardianProfileSchema,
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
  if (this.focusProfile && this.focusProfile.dailyGoal > 0) completeness += 25;
  if (this.focusProfile && this.focusProfile.workDuration > 0)
    completeness += 25;
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

// Instance method to add a role
userSchema.methods.addRole = function (roleType) {
  // Check if role already exists
  const existingRole = this.roles.find((r) => r.type === roleType);
  if (existingRole) {
    throw new Error(`Role ${roleType} already exists for this user`);
  }

  // Validate role type
  const validRoles = ["student", "teacher", "guardian", "admin"];
  if (!validRoles.includes(roleType)) {
    throw new Error(`Invalid role type: ${roleType}`);
  }

  // Add the new role
  this.roles.push({
    type: roleType,
    isActive: true,
    isPrimary: false,
  });

  return this.save();
};

// Instance method to remove a role
userSchema.methods.removeRole = function (roleType) {
  // Cannot remove if it's the only role
  if (this.roles.length === 1) {
    throw new Error("Cannot remove the only role");
  }

  // Cannot remove primary role without setting a new primary first
  const roleToRemove = this.roles.find((r) => r.type === roleType);
  if (roleToRemove && roleToRemove.isPrimary) {
    throw new Error(
      "Cannot remove primary role. Set another role as primary first"
    );
  }

  // Remove the role
  this.roles = this.roles.filter((r) => r.type !== roleType);

  return this.save();
};

// Instance method to switch primary role
userSchema.methods.switchPrimaryRole = function (roleType) {
  const newPrimaryRole = this.roles.find((r) => r.type === roleType);
  if (!newPrimaryRole) {
    throw new Error(`Role ${roleType} not found`);
  }

  // Set all roles to not primary
  this.roles.forEach((r) => {
    r.isPrimary = false;
  });

  // Set the new primary role
  newPrimaryRole.isPrimary = true;
  this.defaultRole = roleType;

  return this.save();
};

// Instance method to check if user has a specific role
userSchema.methods.hasRole = function (roleType) {
  return this.roles.some((r) => r.type === roleType && r.isActive);
};

// Pre-remove middleware
userSchema.pre("remove", function (next) {
  console.log(`User ${this.username} is being removed`);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
