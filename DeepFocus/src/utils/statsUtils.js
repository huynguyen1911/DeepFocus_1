/**
 * Statistics Utility Functions
 * Helper functions for statistics calculations and data formatting
 */

/**
 * Format work time from minutes to readable string
 * @param {number} minutes - Total minutes
 * @returns {string} - Formatted time string (e.g., "2h 30m")
 */
export const formatWorkTime = (minutes) => {
  if (!minutes || minutes < 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

/**
 * Format work time to hours with decimal
 * @param {number} minutes - Total minutes
 * @returns {number} - Hours with one decimal place
 */
export const formatHours = (minutes) => {
  if (!minutes || minutes < 0) return 0;
  return Math.round((minutes / 60) * 10) / 10;
};

/**
 * Calculate current streak from daily stats
 * @param {Array} dailyStats - Array of daily stat objects
 * @returns {number} - Current streak count
 */
export const calculateCurrentStreak = (dailyStats) => {
  if (!dailyStats || dailyStats.length === 0) return 0;

  // Sort by date descending
  const sorted = [...dailyStats].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const statDate = new Date(sorted[i].date);
    statDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    // Check if this stat is for the expected date
    if (statDate.getTime() === expectedDate.getTime()) {
      if (sorted[i].completedPomodoros > 0) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate longest streak from daily stats
 * @param {Array} dailyStats - Array of daily stat objects
 * @returns {number} - Longest streak count
 */
export const calculateLongestStreak = (dailyStats) => {
  if (!dailyStats || dailyStats.length === 0) return 0;

  // Sort by date ascending
  const sorted = [...dailyStats].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let longestStreak = 0;
  let currentStreak = 0;
  let lastDate = null;

  sorted.forEach((stat) => {
    if (stat.completedPomodoros > 0) {
      const statDate = new Date(stat.date);
      statDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        // First day
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor(
          (statDate - lastDate) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          // Consecutive day
          currentStreak++;
        } else {
          // Streak broken
          currentStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      lastDate = statDate;
    }
  });

  return longestStreak;
};

/**
 * Get week number from date
 * @param {Date} date - Date object
 * @returns {number} - Week number (1-53)
 */
export const getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

/**
 * Get week start date (Monday)
 * @param {Date} date - Date object
 * @returns {Date} - Start of week (Monday)
 */
export const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Get week end date (Sunday)
 * @param {Date} date - Date object
 * @returns {Date} - End of week (Sunday)
 */
export const getWeekEndDate = (date) => {
  const monday = getWeekStartDate(date);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

/**
 * Calculate average pomodoros per active day
 * @param {number} totalPomodoros - Total pomodoros
 * @param {Array} dailyStats - Array of daily stat objects
 * @returns {number} - Average pomodoros per active day
 */
export const calculateAveragePomodoros = (totalPomodoros, dailyStats) => {
  if (!dailyStats || dailyStats.length === 0 || totalPomodoros === 0) return 0;

  const activeDays = dailyStats.filter(
    (day) => day.completedPomodoros > 0
  ).length;

  if (activeDays === 0) return 0;

  return Math.round((totalPomodoros / activeDays) * 10) / 10;
};

/**
 * Get today's stats from daily stats array
 * @param {Array} dailyStats - Array of daily stat objects
 * @returns {Object|null} - Today's stats or null
 */
export const getTodayStats = (dailyStats) => {
  if (!dailyStats || dailyStats.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dailyStats.find((stat) => {
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);
    return statDate.getTime() === today.getTime();
  });
};

/**
 * Get stats for a specific date range
 * @param {Array} dailyStats - Array of daily stat objects
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Filtered daily stats
 */
export const getStatsForDateRange = (dailyStats, startDate, endDate) => {
  if (!dailyStats || dailyStats.length === 0) return [];

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return dailyStats.filter((stat) => {
    const statDate = new Date(stat.date);
    return statDate >= start && statDate <= end;
  });
};

/**
 * Calculate total stats for a date range
 * @param {Array} dailyStats - Array of daily stat objects
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - Total stats (pomodoros, workTime, tasks)
 */
export const calculateTotalForRange = (dailyStats, startDate, endDate) => {
  const rangeStats = getStatsForDateRange(dailyStats, startDate, endDate);

  return rangeStats.reduce(
    (acc, stat) => ({
      totalPomodoros: acc.totalPomodoros + (stat.completedPomodoros || 0),
      totalWorkTime: acc.totalWorkTime + (stat.totalWorkTime || 0),
      totalTasks: acc.totalTasks + (stat.completedTasks || 0),
    }),
    { totalPomodoros: 0, totalWorkTime: 0, totalTasks: 0 }
  );
};

/**
 * Format date for display
 * @param {Date|string} date - Date object or string
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = "short") => {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    case "long":
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
      });
    case "full":
      return d.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    default:
      return d.toLocaleDateString("vi-VN");
  }
};

/**
 * Get motivational message based on stats
 * @param {Object} stats - Statistics object
 * @returns {string} - Motivational message
 */
export const getMotivationalMessage = (stats) => {
  if (!stats) return "Bắt đầu ngày mới của bạn!";

  const { completedPomodoros, currentStreak, totalHours } = stats;

  if (completedPomodoros === 0) {
    return "Hãy hoàn thành pomodoro đầu tiên! 🎯";
  }

  if (currentStreak >= 30) {
    return "Bạn là huyền thoại! 30+ ngày streak! 👑";
  }

  if (currentStreak >= 7) {
    return `Xuất sắc! ${currentStreak} ngày liên tiếp! ⭐`;
  }

  if (totalHours >= 100) {
    return "100+ giờ tập trung! Bạn thật phi thường! 💎";
  }

  if (completedPomodoros >= 100) {
    return "100+ pomodoros! Tiếp tục phát huy! 🏆";
  }

  return "Tuyệt vời! Bạn đang làm rất tốt! 💪";
};

/**
 * Calculate productivity score (0-100)
 * @param {Object} stats - Statistics object
 * @returns {number} - Productivity score
 */
export const calculateProductivityScore = (stats) => {
  if (!stats || !stats.dailyStats || stats.dailyStats.length === 0) return 0;

  // Factors: streak, average pomodoros, consistency
  const streakScore = Math.min(stats.currentStreak * 2, 30); // Max 30 points
  const avgScore = Math.min(stats.averagePomodoros * 3, 40); // Max 40 points

  // Consistency: percentage of active days in last 30 days
  const last30Days = stats.dailyStats.slice(-30);
  const activeDays = last30Days.filter(
    (day) => day.completedPomodoros > 0
  ).length;
  const consistencyScore = Math.min((activeDays / 30) * 30, 30); // Max 30 points

  return Math.round(streakScore + avgScore + consistencyScore);
};
