const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'pomodoro_count',    // Complete X pomodoros
      'streak',            // Maintain X day streak
      'total_time',        // Accumulate X hours
      'daily_goal',        // Complete daily goal X times
      'class_rank',        // Achieve rank in class
      'competition_win',   // Win competitions
      'task_completion',   // Complete X tasks
      'perfect_week',      // Perfect attendance/completion
      'early_bird',        // Start sessions early
      'night_owl',         // Complete late sessions
      'social',            // Class/group participation
      'consistency',       // Regular usage patterns
      'milestone',         // Special milestones
      'special'            // Limited time/event achievements
    ]
  },
  name: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  icon: {
    type: String,
    required: true,
    default: '🏆'
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  unlockCriteria: {
    metric: {
      type: String,
      required: true,
      enum: [
        'pomodoros_completed',
        'streak_days',
        'total_focus_hours',
        'daily_goals_completed',
        'class_rank_position',
        'competitions_won',
        'tasks_completed',
        'perfect_weeks',
        'early_sessions_count',
        'late_sessions_count',
        'classes_joined',
        'consistent_days',
        'custom'
      ]
    },
    threshold: {
      type: Number,
      required: true
    },
    timeframe: {
      type: String,
      enum: ['all_time', 'daily', 'weekly', 'monthly'],
      default: 'all_time'
    },
    additionalConditions: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  category: {
    type: String,
    enum: ['productivity', 'consistency', 'social', 'competition', 'milestone', 'special'],
    default: 'productivity'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  availableFrom: Date,
  availableUntil: Date,
  prerequisiteAchievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badge: {
      type: String
    },
    title: {
      en: String,
      vi: String
    }
  },
  statistics: {
    totalUnlocked: {
      type: Number,
      default: 0
    },
    unlockRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ type: 1, rarity: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ isActive: 1, isHidden: 1 });

// Virtual for unlock difficulty
achievementSchema.virtual('difficulty').get(function() {
  const rarityPoints = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4
  };
  return rarityPoints[this.rarity] || 1;
});

// Static method to get active achievements
achievementSchema.statics.getActiveAchievements = function(filters = {}) {
  const query = { isActive: true, isHidden: false };
  
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.rarity) query.rarity = filters.rarity;
  
  // Check date availability
  const now = new Date();
  query.$or = [
    { availableFrom: { $exists: false } },
    { availableFrom: { $lte: now } }
  ];
  query.$and = [
    {
      $or: [
        { availableUntil: { $exists: false } },
        { availableUntil: { $gte: now } }
      ]
    }
  ];
  
  return this.find(query).sort({ rarity: -1, points: -1 });
};

// Static method to check if achievement is unlockable
achievementSchema.statics.checkUnlockable = async function(achievementId, userStats) {
  const achievement = await this.findById(achievementId)
    .populate('prerequisiteAchievements');
  
  if (!achievement || !achievement.isActive) {
    return { unlockable: false, reason: 'Achievement not available' };
  }
  
  // Check date availability
  const now = new Date();
  if (achievement.availableFrom && achievement.availableFrom > now) {
    return { unlockable: false, reason: 'Not yet available' };
  }
  if (achievement.availableUntil && achievement.availableUntil < now) {
    return { unlockable: false, reason: 'No longer available' };
  }
  
  // Check prerequisites
  if (achievement.prerequisiteAchievements.length > 0) {
    const UserAchievement = mongoose.model('UserAchievement');
    const unlockedPrereqs = await UserAchievement.find({
      user: userStats.userId,
      achievement: { $in: achievement.prerequisiteAchievements.map(a => a._id) },
      unlockedAt: { $exists: true }
    }).countDocuments();
    
    if (unlockedPrereqs < achievement.prerequisiteAchievements.length) {
      return { unlockable: false, reason: 'Prerequisites not met' };
    }
  }
  
  // Check unlock criteria
  const { metric, threshold, timeframe, additionalConditions } = achievement.unlockCriteria;
  let currentValue = 0;
  
  switch (metric) {
    case 'pomodoros_completed':
      currentValue = userStats.totalSessions || 0;
      break;
    case 'streak_days':
      currentValue = userStats.currentStreak || 0;
      break;
    case 'total_focus_hours':
      currentValue = Math.floor((userStats.totalFocusTime || 0) / 3600);
      break;
    case 'daily_goals_completed':
      currentValue = userStats.dailyGoalsCompleted || 0;
      break;
    case 'tasks_completed':
      currentValue = userStats.tasksCompleted || 0;
      break;
    case 'competitions_won':
      currentValue = userStats.competitionsWon || 0;
      break;
    default:
      currentValue = 0;
  }
  
  const unlockable = currentValue >= threshold;
  return {
    unlockable,
    progress: Math.min(100, (currentValue / threshold) * 100),
    currentValue,
    threshold,
    reason: unlockable ? 'Criteria met' : 'Criteria not met'
  };
};

// Method to get localized name
achievementSchema.methods.getLocalizedName = function(language = 'en') {
  return this.name[language] || this.name.en;
};

// Method to get localized description
achievementSchema.methods.getLocalizedDescription = function(language = 'en') {
  return this.description[language] || this.description.en;
};

// Increment statistics when unlocked
achievementSchema.methods.incrementUnlocked = function() {
  this.statistics.totalUnlocked += 1;
  return this.save();
};

module.exports = mongoose.model('Achievement', achievementSchema);
