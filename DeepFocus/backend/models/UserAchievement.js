const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
    index: true
  },
  progress: {
    currentValue: {
      type: Number,
      default: 0
    },
    threshold: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  unlockedAt: {
    type: Date,
    index: true
  },
  notifiedAt: {
    type: Date
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isDisplayed: {
    type: Boolean,
    default: true
  },
  viewedAt: {
    type: Date
  },
  sharedCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound indexes
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ user: 1, unlockedAt: 1 });
userAchievementSchema.index({ user: 1, isFavorite: 1 });

// Virtual for isUnlocked
userAchievementSchema.virtual('isUnlocked').get(function() {
  return !!this.unlockedAt;
});

// Virtual for isNew (unlocked within last 24 hours)
userAchievementSchema.virtual('isNew').get(function() {
  if (!this.unlockedAt) return false;
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.unlockedAt > dayAgo;
});

// Pre-save middleware to calculate percentage
userAchievementSchema.pre('save', function(next) {
  if (this.progress.threshold > 0) {
    this.progress.percentage = Math.min(100, 
      Math.round((this.progress.currentValue / this.progress.threshold) * 100)
    );
  }
  next();
});

// Static method to get user's achievements with details
userAchievementSchema.statics.getUserAchievements = async function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.unlocked === true) {
    query.unlockedAt = { $exists: true };
  } else if (filters.unlocked === false) {
    query.unlockedAt = { $exists: false };
  }
  
  if (filters.favorite) {
    query.isFavorite = true;
  }
  
  return this.find(query)
    .populate({
      path: 'achievement',
      match: { isActive: true }
    })
    .sort(filters.sort || { unlockedAt: -1, 'progress.percentage': -1 });
};

// Static method to get achievement summary for user
userAchievementSchema.statics.getUserSummary = async function(userId) {
  const achievements = await this.find({ user: userId })
    .populate('achievement');
  
  const summary = {
    total: achievements.length,
    unlocked: 0,
    inProgress: 0,
    locked: 0,
    byRarity: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    },
    byCategory: {},
    totalPoints: 0,
    favorites: 0,
    recentUnlocks: []
  };
  
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  achievements.forEach(ua => {
    if (!ua.achievement) return;
    
    if (ua.unlockedAt) {
      summary.unlocked++;
      summary.totalPoints += ua.achievement.points || 0;
      summary.byRarity[ua.achievement.rarity]++;
      
      if (ua.unlockedAt > weekAgo) {
        summary.recentUnlocks.push({
          achievement: ua.achievement,
          unlockedAt: ua.unlockedAt
        });
      }
    } else if (ua.progress.percentage > 0) {
      summary.inProgress++;
    } else {
      summary.locked++;
    }
    
    if (ua.isFavorite) {
      summary.favorites++;
    }
    
    const category = ua.achievement.category;
    if (!summary.byCategory[category]) {
      summary.byCategory[category] = 0;
    }
    if (ua.unlockedAt) {
      summary.byCategory[category]++;
    }
  });
  
  summary.recentUnlocks.sort((a, b) => b.unlockedAt - a.unlockedAt);
  summary.recentUnlocks = summary.recentUnlocks.slice(0, 5);
  
  return summary;
};

// Static method to update progress
userAchievementSchema.statics.updateProgress = async function(userId, achievementId, currentValue) {
  const userAchievement = await this.findOne({
    user: userId,
    achievement: achievementId
  });
  
  if (!userAchievement) return null;
  
  // Don't update if already unlocked
  if (userAchievement.unlockedAt) return userAchievement;
  
  userAchievement.progress.currentValue = currentValue;
  
  // Auto-unlock if threshold reached
  if (currentValue >= userAchievement.progress.threshold) {
    userAchievement.unlockedAt = new Date();
    
    // Update achievement statistics
    const Achievement = mongoose.model('Achievement');
    await Achievement.findByIdAndUpdate(achievementId, {
      $inc: { 'statistics.totalUnlocked': 1 }
    });
  }
  
  await userAchievement.save();
  return userAchievement;
};

// Method to unlock achievement
userAchievementSchema.methods.unlock = async function() {
  if (this.unlockedAt) {
    return { success: false, message: 'Already unlocked' };
  }
  
  this.unlockedAt = new Date();
  await this.save();
  
  // Update achievement statistics
  const Achievement = mongoose.model('Achievement');
  await Achievement.findByIdAndUpdate(this.achievement, {
    $inc: { 'statistics.totalUnlocked': 1 }
  });
  
  return { success: true, message: 'Achievement unlocked!' };
};

// Method to toggle favorite
userAchievementSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Method to mark as viewed
userAchievementSchema.methods.markViewed = function() {
  this.viewedAt = new Date();
  return this.save();
};

// Method to increment share count
userAchievementSchema.methods.incrementShare = function() {
  this.sharedCount += 1;
  return this.save();
};

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
