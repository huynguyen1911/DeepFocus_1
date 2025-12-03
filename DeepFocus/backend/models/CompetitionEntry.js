const mongoose = require('mongoose');

const competitionEntrySchema = new mongoose.Schema({
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  team: {
    name: String,
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  progress: {
    currentValue: {
      type: Number,
      default: 0
    },
    target: Number,
    percentage: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  rank: {
    current: {
      type: Number,
      default: 0
    },
    previous: Number,
    best: Number,
    trend: {
      type: String,
      enum: ['up', 'down', 'same', 'new'],
      default: 'new'
    }
  },
  statistics: {
    sessionsCompleted: {
      type: Number,
      default: 0
    },
    totalFocusTime: {
      type: Number,
      default: 0
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    averageSessionLength: {
      type: Number,
      default: 0
    }
  },
  milestones: [{
    value: Number,
    achievedAt: Date,
    note: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'withdrawn', 'disqualified'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  prize: {
    rank: Number,
    title: String,
    points: Number,
    badge: String,
    claimed: {
      type: Boolean,
      default: false
    },
    claimedAt: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes
competitionEntrySchema.index({ competition: 1, user: 1 }, { unique: true });
competitionEntrySchema.index({ competition: 1, 'rank.current': 1 });
competitionEntrySchema.index({ competition: 1, 'progress.currentValue': -1 });
competitionEntrySchema.index({ user: 1, status: 1 });

// Virtual for completion percentage
competitionEntrySchema.virtual('completionPercentage').get(function() {
  if (!this.progress.target || this.progress.target === 0) return 0;
  return Math.min(100, Math.round((this.progress.currentValue / this.progress.target) * 100));
});

// Virtual for is complete
competitionEntrySchema.virtual('isComplete').get(function() {
  if (!this.progress.target) return false;
  return this.progress.currentValue >= this.progress.target;
});

// Virtual for days since last active
competitionEntrySchema.virtual('daysSinceActive').get(function() {
  if (!this.lastActiveAt) return 0;
  const now = new Date();
  const diff = now - this.lastActiveAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate percentage
competitionEntrySchema.pre('save', function(next) {
  if (this.progress.target && this.progress.target > 0) {
    this.progress.percentage = Math.min(100,
      Math.round((this.progress.currentValue / this.progress.target) * 100)
    );
  }
  
  // Update trend based on rank change
  if (this.rank.previous !== undefined) {
    if (this.rank.current < this.rank.previous) {
      this.rank.trend = 'up';
    } else if (this.rank.current > this.rank.previous) {
      this.rank.trend = 'down';
    } else {
      this.rank.trend = 'same';
    }
  }
  
  // Update best rank
  if (!this.rank.best || this.rank.current < this.rank.best) {
    this.rank.best = this.rank.current;
  }
  
  next();
});

// Static method to get leaderboard for competition
competitionEntrySchema.statics.getLeaderboard = async function(competitionId, options = {}) {
  const limit = options.limit || 100;
  const skip = options.skip || 0;
  
  const entries = await this.find({
    competition: competitionId,
    status: { $ne: 'withdrawn' }
  })
  .populate('user', 'name email avatar')
  .populate('team.members', 'name email avatar')
  .sort({ 'progress.currentValue': -1, updatedAt: 1 })
  .limit(limit)
  .skip(skip);
  
  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.rank.current !== i + 1 + skip) {
      entry.rank.previous = entry.rank.current;
      entry.rank.current = i + 1 + skip;
      await entry.save();
    }
  }
  
  return entries;
};

// Static method to get user's entries
competitionEntrySchema.statics.getUserEntries = async function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  return this.find(query)
    .populate('competition')
    .sort({ 'competition.timing.endDate': -1 });
};

// Static method to update entry progress
competitionEntrySchema.statics.updateProgress = async function(competitionId, userId, progressData) {
  const entry = await this.findOne({
    competition: competitionId,
    user: userId
  });
  
  if (!entry) {
    return { success: false, message: 'Entry not found' };
  }
  
  if (entry.status !== 'active') {
    return { success: false, message: 'Entry not active' };
  }
  
  // Update progress
  entry.progress.currentValue = progressData.currentValue || entry.progress.currentValue;
  entry.progress.lastUpdated = new Date();
  entry.lastActiveAt = new Date();
  
  // Update statistics
  if (progressData.statistics) {
    Object.assign(entry.statistics, progressData.statistics);
  }
  
  // Check for milestones
  const milestoneValues = [25, 50, 75, 100];
  const percentage = entry.progress.target 
    ? (entry.progress.currentValue / entry.progress.target) * 100 
    : 0;
    
  milestoneValues.forEach(value => {
    if (percentage >= value && 
        !entry.milestones.find(m => m.value === value)) {
      entry.milestones.push({
        value,
        achievedAt: new Date(),
        note: `${value}% milestone reached`
      });
    }
  });
  
  await entry.save();
  
  // Update competition statistics
  const Competition = mongoose.model('Competition');
  const competition = await Competition.findById(competitionId);
  if (competition) {
    await competition.updateStatistics();
  }
  
  return { success: true, entry };
};

// Method to withdraw from competition
competitionEntrySchema.methods.withdraw = async function(reason) {
  this.status = 'withdrawn';
  if (reason) {
    this.notes = reason;
  }
  await this.save();
  
  // Update competition statistics
  const Competition = mongoose.model('Competition');
  const competition = await Competition.findById(this.competition);
  if (competition) {
    await competition.updateStatistics();
  }
  
  return { success: true, message: 'Withdrawn from competition' };
};

// Method to claim prize
competitionEntrySchema.methods.claimPrize = async function() {
  if (!this.prize || !this.prize.rank) {
    return { success: false, message: 'No prize to claim' };
  }
  
  if (this.prize.claimed) {
    return { success: false, message: 'Prize already claimed' };
  }
  
  this.prize.claimed = true;
  this.prize.claimedAt = new Date();
  await this.save();
  
  // Award points to user if applicable
  if (this.prize.points && this.prize.points > 0) {
    const Stats = mongoose.model('Stats');
    await Stats.findOneAndUpdate(
      { user: this.user },
      { $inc: { totalPoints: this.prize.points } }
    );
  }
  
  return { success: true, prize: this.prize };
};

// Method to get position relative to target
competitionEntrySchema.methods.getRelativePosition = function() {
  if (!this.progress.target) return null;
  
  const remaining = Math.max(0, this.progress.target - this.progress.currentValue);
  const percentage = this.progress.percentage;
  
  return {
    current: this.progress.currentValue,
    target: this.progress.target,
    remaining,
    percentage,
    status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'near' : percentage >= 50 ? 'halfway' : 'started'
  };
};

module.exports = mongoose.model('CompetitionEntry', competitionEntrySchema);
