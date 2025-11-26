const mongoose = require("mongoose");

/**
 * GuardianLink Model
 * Manages the relationship between guardians (parents/tutors) and children (students)
 * Includes permission system for what guardians can access
 */

const guardianLinkSchema = new mongoose.Schema(
  {
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Guardian ID is required"],
      index: true,
    },
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Child ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
      index: true,
    },
    relation: {
      type: String,
      enum: ["parent", "guardian", "tutor", "mentor", "relative", "other"],
      default: "parent",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    // Permissions for what guardian can do
    permissions: {
      viewProgress: {
        type: Boolean,
        default: true,
      },
      giveRewards: {
        type: Boolean,
        default: true,
      },
      setGoals: {
        type: Boolean,
        default: false,
      },
      viewClasses: {
        type: Boolean,
        default: true,
      },
      receiveAlerts: {
        type: Boolean,
        default: true,
      },
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate guardian-child pairs
guardianLinkSchema.index({ guardian: 1, child: 1 }, { unique: true });

// Index for finding all children of a guardian
guardianLinkSchema.index({ guardian: 1, status: 1 });

// Index for finding all guardians of a child
guardianLinkSchema.index({ child: 1, status: 1 });

// Virtual for checking if link is active
guardianLinkSchema.virtual("isActive").get(function () {
  return this.status === "accepted";
});

// Virtual for checking if link is pending
guardianLinkSchema.virtual("isPending").get(function () {
  return this.status === "pending";
});

/**
 * Static method: Check if guardian has access to child
 * @param {ObjectId} guardianId - Guardian user ID
 * @param {ObjectId} childId - Child user ID
 * @returns {Promise<boolean>}
 */
guardianLinkSchema.statics.hasAccess = async function (guardianId, childId) {
  const link = await this.findOne({
    guardian: guardianId,
    child: childId,
    status: "accepted",
  });
  return !!link;
};

/**
 * Static method: Get link with permission check
 * @param {ObjectId} guardianId - Guardian user ID
 * @param {ObjectId} childId - Child user ID
 * @returns {Promise<GuardianLink|null>}
 */
guardianLinkSchema.statics.getActiveLink = async function (
  guardianId,
  childId
) {
  return await this.findOne({
    guardian: guardianId,
    child: childId,
    status: "accepted",
  });
};

/**
 * Static method: Check specific permission
 * @param {ObjectId} guardianId - Guardian user ID
 * @param {ObjectId} childId - Child user ID
 * @param {string} permission - Permission name (e.g., 'viewProgress')
 * @returns {Promise<boolean>}
 */
guardianLinkSchema.statics.hasPermission = async function (
  guardianId,
  childId,
  permission
) {
  const link = await this.getActiveLink(guardianId, childId);
  if (!link) return false;
  return link.permissions[permission] === true;
};

/**
 * Instance method: Accept the link request
 */
guardianLinkSchema.methods.accept = function () {
  this.status = "accepted";
  this.respondedAt = new Date();
  return this.save();
};

/**
 * Instance method: Reject the link request
 */
guardianLinkSchema.methods.reject = function () {
  this.status = "rejected";
  this.respondedAt = new Date();
  return this.save();
};

/**
 * Instance method: Block the link (remove access)
 */
guardianLinkSchema.methods.block = function () {
  this.status = "blocked";
  this.respondedAt = new Date();
  return this.save();
};

/**
 * Pre-save middleware: Set respondedAt when status changes from pending
 */
guardianLinkSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status !== "pending") {
    if (!this.respondedAt) {
      this.respondedAt = new Date();
    }
  }
  next();
});

const GuardianLink = mongoose.model("GuardianLink", guardianLinkSchema);

module.exports = GuardianLink;
