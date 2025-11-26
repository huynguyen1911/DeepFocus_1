const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "alert"],
      default: "info",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 5,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
alertSchema.index({ recipient: 1, read: 1, createdAt: -1 });
alertSchema.index({ recipient: 1, type: 1, createdAt: -1 });
alertSchema.index({ createdAt: 1 }); // For cleanup old alerts

// Virtual for age
alertSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Mark alert as read
alertSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Check if alert is recent (within 7 days)
alertSchema.methods.isRecent = function () {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return this.age < sevenDays;
};

// Static method to get unread count for a user
alertSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient: userId,
    read: false,
  });
};

// Static method to mark all as read for a user
alertSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    {
      recipient: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );
};

// Static method to cleanup old alerts (older than 30 days)
alertSchema.statics.cleanupOldAlerts = async function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    read: true,
  });

  return result;

  return result.deletedCount;
};

// Static method to create alert with type helpers
alertSchema.statics.createInfo = function (params) {
  const { recipient, title, message, data = null, link = null } = params;
  return this.create({
    recipient,
    type: "info",
    title,
    message,
    data,
    link,
    priority: 3,
  });
};

alertSchema.statics.createSuccess = function (params) {
  const { recipient, title, message, data = null, link = null } = params;
  return this.create({
    recipient,
    type: "success",
    title,
    message,
    data,
    link,
    priority: 5,
  });
};

alertSchema.statics.createWarning = function (params) {
  const { recipient, title, message, data = null, link = null } = params;
  return this.create({
    recipient,
    type: "warning",
    title,
    message,
    data,
    link,
    priority: 7,
  });
};

alertSchema.statics.createAlert = function (params) {
  const { recipient, title, message, data = null, link = null } = params;
  return this.create({
    recipient,
    type: "alert",
    title,
    message,
    data,
    link,
    priority: 10,
  });
};

// Pre-save validation
alertSchema.pre("save", function (next) {
  // Validate link format if provided
  if (this.link && !this.link.startsWith("/")) {
    this.link = `/${this.link}`;
  }
  next();
});

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
