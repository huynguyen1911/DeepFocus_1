const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['individual', 'team'],
    default: 'individual'
  },
  scope: {
    type: String,
    required: true,
    enum: ['global', 'class', 'private'],
    default: 'global'
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timing: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    registrationDeadline: {
      type: Date
    }
  },
  goal: {
    metric: {
      type: String,
      required: true,
      enum: [
        'total_pomodoros',      // Most pomodoros completed
        'total_focus_time',     // Most focus time
        'daily_consistency',    // Most consistent daily usage
        'task_completion',      // Most tasks completed
        'streak_length',        // Longest streak maintained
        'average_session',      // Longest average session
        'early_bird',          // Most early morning sessions
        'night_owl',           // Most late night sessions
        'quality_score'        // Highest quality score
      ]
    },
    target: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['count', 'hours', 'minutes', 'days', 'score'],
      default: 'count'
    }
  },
  rules: {
    maxParticipants: {
      type: Number
    },
    minParticipants: {
      type: Number,
      default: 2
    },
    teamSize: {
      type: Number,
      default: 1
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    allowLateJoin: {
      type: Boolean,
      default: true
    },
    lateJoinDeadline: {
      type: Date
    }
  },
  prizes: [{
    rank: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    points: {
      type: Number,
      default: 0
    },
    badge: {
      type: String
    },
    reward: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite_only'],
    default: 'public'
  },
  invitedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  statistics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    activeParticipants: {
      type: Number,
      default: 0
    },
    totalProgress: {
      type: Number,
      default: 0
    },
    averageProgress: {
      type: Number,
      default: 0
    }
  },
  settings: {
    showLeaderboard: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    sendReminders: {
      type: Boolean,
      default: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
competitionSchema.index({ status: 1, 'timing.startDate': 1 });
competitionSchema.index({ scope: 1, class: 1 });
competitionSchema.index({ creator: 1 });
competitionSchema.index({ 'timing.endDate': 1 });
competitionSchema.index({ featured: 1, status: 1 });

// Virtual for duration in days
competitionSchema.virtual('durationDays').get(function() {
  if (!this.timing.startDate || !this.timing.endDate) return 0;
  const diff = this.timing.endDate - this.timing.startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for time remaining
competitionSchema.virtual('timeRemaining').get(function() {
  if (!this.timing.endDate) return 0;
  const now = new Date();
  const diff = this.timing.endDate - now;
  return Math.max(0, diff);
});

// Virtual for has started
competitionSchema.virtual('hasStarted').get(function() {
  return this.timing.startDate <= new Date();
});

// Virtual for has ended
competitionSchema.virtual('hasEnded').get(function() {
  return this.timing.endDate < new Date();
});

// Pre-save middleware to update status based on dates
competitionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'draft') {
    next();
    return;
  }
  
  if (this.timing.startDate > now) {
    this.status = 'upcoming';
  } else if (this.timing.endDate < now) {
    if (this.status !== 'cancelled') {
      this.status = 'completed';
    }
  } else {
    this.status = 'active';
  }
  
  next();
});

// Static method to get active competitions
competitionSchema.statics.getActive = function(filters = {}) {
  const query = { status: 'active' };
  
  if (filters.scope) query.scope = filters.scope;
  if (filters.class) query.class = filters.class;
  if (filters.type) query.type = filters.type;
  
  return this.find(query)
    .populate('creator', 'name email')
    .populate('class', 'name')
    .sort({ featured: -1, 'timing.endDate': 1 });
};

// Static method to get upcoming competitions
competitionSchema.statics.getUpcoming = function(filters = {}) {
  const query = { status: 'upcoming' };
  
  if (filters.scope) query.scope = filters.scope;
  if (filters.class) query.class = filters.class;
  
  return this.find(query)
    .populate('creator', 'name email')
    .populate('class', 'name')
    .sort({ 'timing.startDate': 1 });
};

// Static method to check if user can join
competitionSchema.statics.canUserJoin = async function(competitionId, userId) {
  const competition = await this.findById(competitionId);
  if (!competition) {
    return { canJoin: false, reason: 'Competition not found' };
  }
  
  if (competition.status === 'completed' || competition.status === 'cancelled') {
    return { canJoin: false, reason: 'Competition ended' };
  }
  
  if (competition.status === 'draft') {
    return { canJoin: false, reason: 'Competition not started' };
  }
  
  const now = new Date();
  if (!competition.rules.allowLateJoin && competition.timing.startDate < now) {
    return { canJoin: false, reason: 'Late join not allowed' };
  }
  
  if (competition.rules.lateJoinDeadline && competition.rules.lateJoinDeadline < now) {
    return { canJoin: false, reason: 'Registration deadline passed' };
  }
  
  if (competition.rules.maxParticipants && 
      competition.statistics.totalParticipants >= competition.rules.maxParticipants) {
    return { canJoin: false, reason: 'Competition full' };
  }
  
  if (competition.visibility === 'invite_only' && 
      !competition.invitedUsers.includes(userId)) {
    return { canJoin: false, reason: 'Invitation required' };
  }
  
  // Check if already joined
  const CompetitionEntry = mongoose.model('CompetitionEntry');
  const existingEntry = await CompetitionEntry.findOne({
    competition: competitionId,
    user: userId
  });
  
  if (existingEntry) {
    return { canJoin: false, reason: 'Already joined' };
  }
  
  return { canJoin: true };
};

// Method to update statistics
competitionSchema.methods.updateStatistics = async function() {
  const CompetitionEntry = mongoose.model('CompetitionEntry');
  
  const entries = await CompetitionEntry.find({
    competition: this._id,
    status: { $ne: 'withdrawn' }
  });
  
  this.statistics.totalParticipants = entries.length;
  this.statistics.activeParticipants = entries.filter(e => e.isActive).length;
  
  const totalProgress = entries.reduce((sum, e) => sum + (e.progress.currentValue || 0), 0);
  this.statistics.totalProgress = totalProgress;
  this.statistics.averageProgress = entries.length > 0 
    ? totalProgress / entries.length 
    : 0;
  
  await this.save();
  return this.statistics;
};

// Method to end competition and award prizes
competitionSchema.methods.endCompetition = async function() {
  this.status = 'completed';
  await this.save();
  
  const CompetitionEntry = mongoose.model('CompetitionEntry');
  const entries = await CompetitionEntry.find({
    competition: this._id,
    status: { $ne: 'withdrawn' }
  }).sort({ 'progress.currentValue': -1, updatedAt: 1 });
  
  // Award prizes
  const awardedEntries = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prize = this.prizes.find(p => p.rank === i + 1);
    
    if (prize) {
      entry.prize = {
        rank: prize.rank,
        title: prize.title,
        points: prize.points,
        badge: prize.badge
      };
      await entry.save();
      awardedEntries.push(entry);
    }
  }
  
  return awardedEntries;
};

module.exports = mongoose.model('Competition', competitionSchema);
