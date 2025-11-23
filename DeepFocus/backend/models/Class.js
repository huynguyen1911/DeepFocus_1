const mongoose = require("mongoose");

// Member schema for class participants
const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "active", "removed"],
    default: "pending",
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    default: "student",
  },
});

// Settings schema for class configuration
const settingsSchema = new mongoose.Schema({
  minPomodorosPerWeek: {
    type: Number,
    default: 20,
    min: 0,
  },
  dailyGoalDefault: {
    type: Number,
    default: 4,
    min: 1,
    max: 20,
  },
  allowPeerView: {
    type: Boolean,
    default: true,
  },
  rewardSystem: {
    enabled: {
      type: Boolean,
      default: true,
    },
    gradeBonus: {
      type: Number,
      default: 5,
      min: 0,
      max: 20,
    },
  },
  autoApprove: {
    type: Boolean,
    default: false,
  },
});

// Stats schema for class statistics
const statsSchema = new mongoose.Schema({
  totalPomodoros: {
    type: Number,
    default: 0,
  },
  totalFocusTime: {
    type: Number,
    default: 0,
  },
  averagePerStudent: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      minlength: [3, "Class name must be at least 3 characters"],
      maxlength: [100, "Class name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["school", "private", "online"],
      default: "school",
    },
    joinCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    joinCodeExpiry: {
      type: Date,
      default: null,
    },
    members: [memberSchema],
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    stats: {
      type: statsSchema,
      default: () => ({}),
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

// Indexes for better performance
classSchema.index({ joinCode: 1 });
classSchema.index({ createdBy: 1 });
classSchema.index({ "members.user": 1 });
classSchema.index({ createdAt: -1 });

// Virtual for active members count
classSchema.virtual("activeMembersCount").get(function () {
  return this.members
    ? this.members.filter((m) => m.status === "active").length
    : 0;
});

// Virtual for pending members count
classSchema.virtual("pendingMembersCount").get(function () {
  return this.members
    ? this.members.filter((m) => m.status === "pending").length
    : 0;
});

// Static method to generate unique join code
classSchema.statics.generateJoinCode = async function () {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists
    const existing = await this.findOne({ joinCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Instance method to add a member
classSchema.methods.addMember = function (userId, role = "student") {
  // Check if user is already a member
  const existingMember = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (existingMember) {
    if (existingMember.status === "removed") {
      // Reactivate removed member
      existingMember.status = this.settings.autoApprove ? "active" : "pending";
      existingMember.joinedAt = Date.now();
    } else {
      throw new Error("User is already a member of this class");
    }
  } else {
    // Add new member
    this.members.push({
      user: userId,
      role: role,
      status: this.settings.autoApprove ? "active" : "pending",
      joinedAt: Date.now(),
    });
  }

  return this.save();
};

// Instance method to remove a member
classSchema.methods.removeMember = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) {
    throw new Error("User is not a member of this class");
  }

  member.status = "removed";
  return this.save();
};

// Instance method to approve a pending member
classSchema.methods.approveMember = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) {
    throw new Error("User is not a member of this class");
  }

  if (member.status !== "pending") {
    throw new Error("Member is not in pending status");
  }

  member.status = "active";
  return this.save();
};

// Instance method to update class stats
classSchema.methods.updateStats = function (totalPomodoros, totalFocusTime) {
  this.stats.totalPomodoros = totalPomodoros;
  this.stats.totalFocusTime = totalFocusTime;

  const activeMembers = this.members.filter(
    (m) => m.status === "active"
  ).length;
  this.stats.averagePerStudent =
    activeMembers > 0 ? totalPomodoros / activeMembers : 0;

  this.stats.lastUpdated = Date.now();

  return this.save();
};

// Instance method to check if join code is valid
classSchema.methods.isJoinCodeValid = function () {
  if (!this.joinCode) return false;
  if (!this.joinCodeExpiry) return true;
  return new Date() < this.joinCodeExpiry;
};

// Pre-save middleware to set join code expiry
classSchema.pre("save", function (next) {
  if (this.isNew && this.joinCode && !this.joinCodeExpiry) {
    // Set expiry to 7 days from now
    this.joinCodeExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
