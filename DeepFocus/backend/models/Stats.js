const mongoose = require("mongoose");

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  completedPomodoros: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalWorkTime: {
    type: Number, // in minutes
    default: 0,
    min: 0,
  },
  completedTasks: {
    type: Number,
    default: 0,
    min: 0,
  },
  pomodoroSessions: [
    {
      startTime: {
        type: Date,
        required: true,
      },
      duration: {
        type: Number, // in minutes
        default: 25,
      },
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: null,
      },
    },
  ],
});

const weeklyStatsSchema = new mongoose.Schema({
  weekStartDate: {
    type: Date,
    required: true,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalPomodoros: {
    type: Number,
    default: 0,
  },
  totalWorkTime: {
    type: Number, // in minutes
    default: 0,
  },
  averageDailyPomodoros: {
    type: Number,
    default: 0,
  },
  mostProductiveDay: {
    type: String,
    default: null,
  },
});

const monthlyStatsSchema = new mongoose.Schema({
  month: {
    type: Number, // 1-12
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  totalPomodoros: {
    type: Number,
    default: 0,
  },
  totalWorkTime: {
    type: Number, // in minutes
    default: 0,
  },
  averageDailyPomodoros: {
    type: Number,
    default: 0,
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
});

const statsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Stats phải thuộc về một user"],
      index: true,
      unique: true,
    },
    // Overall stats
    totalPomodoros: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWorkTime: {
      type: Number, // in minutes
      default: 0,
      min: 0,
    },
    totalCompletedTasks: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Streak tracking
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    // Achievements
    achievements: [
      {
        type: {
          type: String,
          enum: [
            "first_pomodoro",
            "streak_3",
            "streak_7",
            "streak_30",
            "pomodoros_50",
            "pomodoros_100",
            "pomodoros_500",
            "hours_10",
            "hours_50",
            "hours_100",
          ],
        },
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Daily stats (last 90 days)
    dailyStats: [dailyStatsSchema],
    // Weekly stats
    weeklyStats: [weeklyStatsSchema],
    // Monthly stats
    monthlyStats: [monthlyStatsSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient querying
statsSchema.index({ userId: 1, "dailyStats.date": -1 });
statsSchema.index({
  userId: 1,
  "weeklyStats.year": -1,
  "weeklyStats.weekNumber": -1,
});
statsSchema.index({
  userId: 1,
  "monthlyStats.year": -1,
  "monthlyStats.month": -1,
});

// Virtual for total hours worked
statsSchema.virtual("totalHours").get(function () {
  // Return exact hours without rounding for accuracy
  // Frontend will handle formatting
  return parseFloat((this.totalWorkTime / 60).toFixed(2));
});

// Virtual for average pomodoros per day (based on active days)
statsSchema.virtual("averagePomodoros").get(function () {
  const activeDays = this.dailyStats.filter(
    (day) => day.completedPomodoros > 0
  ).length;
  if (activeDays === 0) return 0;
  return Math.round((this.totalPomodoros / activeDays) * 10) / 10;
});

// Method to get stats for a specific date
statsSchema.methods.getStatsForDate = function (date) {
  const dateStr = new Date(date).toISOString().split("T")[0];
  return this.dailyStats.find(
    (stat) => new Date(stat.date).toISOString().split("T")[0] === dateStr
  );
};

// Method to get stats for a specific week
statsSchema.methods.getStatsForWeek = function (weekNumber, year) {
  return this.weeklyStats.find(
    (stat) => stat.weekNumber === weekNumber && stat.year === year
  );
};

// Method to get stats for a specific month
statsSchema.methods.getStatsForMonth = function (month, year) {
  return this.monthlyStats.find(
    (stat) => stat.month === month && stat.year === year
  );
};

// Method to add a pomodoro session
statsSchema.methods.addPomodoroSession = function (duration, taskId = null) {
  const now = new Date();
  // Create today's date at midnight UTC to ensure consistency
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  console.log(
    `📅 Adding pomodoro for date: ${today.toISOString().split("T")[0]}`
  );

  // Update overall stats
  this.totalPomodoros += 1;
  this.totalWorkTime += duration;

  // Update or create daily stats
  let dailyStat = this.getStatsForDate(today);
  if (!dailyStat) {
    dailyStat = {
      date: today,
      completedPomodoros: 0,
      totalWorkTime: 0,
      completedTasks: 0,
      pomodoroSessions: [],
    };
    this.dailyStats.push(dailyStat);
  }

  dailyStat.completedPomodoros += 1;
  dailyStat.totalWorkTime += duration;
  dailyStat.pomodoroSessions.push({
    startTime: now,
    duration: duration,
    taskId: taskId,
  });

  // Update streak
  this.updateStreak(today);

  // Keep only last 90 days
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  this.dailyStats = this.dailyStats.filter(
    (stat) => new Date(stat.date) >= ninetyDaysAgo
  );

  // Sort daily stats by date descending
  this.dailyStats.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Check for achievements
  this.checkAchievements();

  return this.save();
};

// Method to update streak
statsSchema.methods.updateStreak = function (currentDate) {
  const today = new Date(currentDate);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!this.lastActiveDate) {
    // First pomodoro ever
    this.currentStreak = 1;
    this.longestStreak = 1;
    this.lastActiveDate = today;
  } else {
    const lastDate = new Date(this.lastActiveDate);
    const lastDateStr = lastDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDateStr === todayStr) {
      // Already worked today, don't update streak
      return;
    } else if (lastDateStr === yesterdayStr) {
      // Consecutive day
      this.currentStreak += 1;
      this.longestStreak = Math.max(this.currentStreak, this.longestStreak);
      this.lastActiveDate = today;
    } else {
      // Streak broken
      this.currentStreak = 1;
      this.lastActiveDate = today;
    }
  }
};

// Method to check and unlock achievements
statsSchema.methods.checkAchievements = function () {
  const achievements = [
    { type: "first_pomodoro", condition: this.totalPomodoros >= 1 },
    { type: "pomodoros_50", condition: this.totalPomodoros >= 50 },
    { type: "pomodoros_100", condition: this.totalPomodoros >= 100 },
    { type: "pomodoros_500", condition: this.totalPomodoros >= 500 },
    { type: "streak_3", condition: this.currentStreak >= 3 },
    { type: "streak_7", condition: this.currentStreak >= 7 },
    { type: "streak_30", condition: this.longestStreak >= 30 },
    { type: "hours_10", condition: this.totalWorkTime >= 600 }, // 10 hours
    { type: "hours_50", condition: this.totalWorkTime >= 3000 }, // 50 hours
    { type: "hours_100", condition: this.totalWorkTime >= 6000 }, // 100 hours
  ];

  achievements.forEach((achievement) => {
    if (
      achievement.condition &&
      !this.achievements.find((a) => a.type === achievement.type)
    ) {
      this.achievements.push({
        type: achievement.type,
        unlockedAt: new Date(),
      });
      console.log(`🏆 Achievement unlocked: ${achievement.type}`);
    }
  });
};

// Method to increment completed tasks
statsSchema.methods.incrementCompletedTasks = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  this.totalCompletedTasks += 1;

  // Update daily stats
  let dailyStat = this.getStatsForDate(today);
  if (dailyStat) {
    dailyStat.completedTasks += 1;
  }

  return this.save();
};

// Static method to get or create stats for user
statsSchema.statics.getOrCreate = async function (userId) {
  let stats = await this.findOne({ userId });

  if (!stats) {
    stats = await this.create({ userId });
    console.log(`📊 Created new stats for user: ${userId}`);
  }

  return stats;
};

// Static method to aggregate weekly stats
statsSchema.statics.aggregateWeeklyStats = async function (userId) {
  const stats = await this.findOne({ userId });
  if (!stats) return null;

  // Get week number and year for current week
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  // Get week start date
  const weekStart = getWeekStartDate(now);

  // Calculate stats for current week
  const weeklyStats = stats.dailyStats
    .filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= weekStart && dayDate <= now;
    })
    .reduce(
      (acc, day) => {
        acc.totalPomodoros += day.completedPomodoros;
        acc.totalWorkTime += day.totalWorkTime;
        return acc;
      },
      { totalPomodoros: 0, totalWorkTime: 0 }
    );

  // Find most productive day
  const mostProductiveDay = stats.dailyStats
    .filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= weekStart && dayDate <= now;
    })
    .sort((a, b) => b.completedPomodoros - a.completedPomodoros)[0];

  const daysInWeek = stats.dailyStats.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate >= weekStart && dayDate <= now;
  }).length;

  return {
    weekStartDate: weekStart,
    weekNumber,
    year,
    totalPomodoros: weeklyStats.totalPomodoros,
    totalWorkTime: weeklyStats.totalWorkTime,
    averageDailyPomodoros:
      daysInWeek > 0 ? weeklyStats.totalPomodoros / daysInWeek : 0,
    mostProductiveDay: mostProductiveDay
      ? mostProductiveDay.date.toLocaleDateString("vi-VN", { weekday: "long" })
      : null,
  };
};

// Static method to aggregate monthly stats
statsSchema.statics.aggregateMonthlyStats = async function (userId) {
  const stats = await this.findOne({ userId });
  if (!stats) return null;

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Get month start date
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  // Calculate stats for current month
  const monthlyStats = stats.dailyStats
    .filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= monthStart && dayDate <= monthEnd;
    })
    .reduce(
      (acc, day) => {
        acc.totalPomodoros += day.completedPomodoros;
        acc.totalWorkTime += day.totalWorkTime;
        acc.completedTasks += day.completedTasks;
        return acc;
      },
      { totalPomodoros: 0, totalWorkTime: 0, completedTasks: 0 }
    );

  const daysInMonth = stats.dailyStats.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate >= monthStart && dayDate <= monthEnd;
  }).length;

  return {
    month,
    year,
    totalPomodoros: monthlyStats.totalPomodoros,
    totalWorkTime: monthlyStats.totalWorkTime,
    averageDailyPomodoros:
      daysInMonth > 0 ? monthlyStats.totalPomodoros / daysInMonth : 0,
    completedTasks: monthlyStats.completedTasks,
  };
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Helper function to get week start date (Monday)
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

const Stats = mongoose.model("Stats", statsSchema);

module.exports = Stats;
