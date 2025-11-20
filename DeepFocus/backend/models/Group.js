const mongoose = require("mongoose");

// Member schema for group participants (students being monitored)
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
  relation: {
    type: String,
    default: "child",
  },
});

// Settings schema for group configuration
const settingsSchema = new mongoose.Schema({
  minPomodorosPerWeek: {
    type: Number,
    default: 15,
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
    default: false, // More private for family groups
  },
  rewardSystem: {
    enabled: {
      type: Boolean,
      default: true,
    },
    rewardTypes: {
      type: [String],
      default: ["privilege", "bonus"],
    },
  },
  autoApprove: {
    type: Boolean,
    default: false,
  },
  notifications: {
    dailyReport: {
      type: Boolean,
      default: true,
    },
    weeklyReport: {
      type: Boolean,
      default: true,
    },
    alerts: {
      type: Boolean,
      default: true,
    },
  },
});

// Stats schema for group statistics
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

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      minlength: [3, "Group name must be at least 3 characters"],
      maxlength: [100, "Group name cannot exceed 100 characters"],
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
      enum: ["family", "tutor", "mentor"],
      default: "family",
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
groupSchema.index({ joinCode: 1 });
groupSchema.index({ createdBy: 1 });
groupSchema.index({ "members.user": 1 });
groupSchema.index({ createdAt: -1 });

// Virtual for active members count
groupSchema.virtual("activeMembersCount").get(function () {
  return this.members.filter((m) => m.status === "active").length;
});

// Virtual for pending members count
groupSchema.virtual("pendingMembersCount").get(function () {
  return this.members.filter((m) => m.status === "pending").length;
});

// Static method to generate unique join code
groupSchema.statics.generateJoinCode = async function () {
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
groupSchema.methods.addMember = function (userId, relation = "child") {
  // Check if user is already a member
  const existingMember = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (existingMember) {
    if (existingMember.status === "removed") {
      // Reactivate removed member
      existingMember.status = this.settings.autoApprove ? "active" : "pending";
      existingMember.joinedAt = Date.now();
      existingMember.relation = relation;
    } else {
      throw new Error("User is already a member of this group");
    }
  } else {
    // Add new member
    this.members.push({
      user: userId,
      relation: relation,
      status: this.settings.autoApprove ? "active" : "pending",
      joinedAt: Date.now(),
    });
  }

  return this.save();
};

// Instance method to remove a member
groupSchema.methods.removeMember = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) {
    throw new Error("User is not a member of this group");
  }

  member.status = "removed";
  return this.save();
};

// Instance method to approve a pending member
groupSchema.methods.approveMember = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!member) {
    throw new Error("User is not a member of this group");
  }

  if (member.status !== "pending") {
    throw new Error("Member is not in pending status");
  }

  member.status = "active";
  return this.save();
};

// Instance method to update group stats
groupSchema.methods.updateStats = function (totalPomodoros, totalFocusTime) {
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
groupSchema.methods.isJoinCodeValid = function () {
  if (!this.joinCode) return false;
  if (!this.joinCodeExpiry) return true;
  return new Date() < this.joinCodeExpiry;
};

// Pre-save middleware to set join code expiry
groupSchema.pre("save", function (next) {
  if (this.isNew && this.joinCode && !this.joinCodeExpiry) {
    // Set expiry to 30 days from now (longer for family groups)
    this.joinCodeExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
