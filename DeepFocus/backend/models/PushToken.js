const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for fast lookups
pushTokenSchema.index({ user: 1, isActive: 1 });
pushTokenSchema.index({ token: 1 });

// Auto-deactivate tokens older than 90 days
pushTokenSchema.methods.checkExpiry = function() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  if (this.lastUsed < ninetyDaysAgo) {
    this.isActive = false;
    return this.save();
  }
};

module.exports = mongoose.model('PushToken', pushTokenSchema);
