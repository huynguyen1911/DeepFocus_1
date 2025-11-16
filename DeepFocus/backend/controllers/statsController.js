const Stats = require("../models/Stats");
const Task = require("../models/Task");

// @desc    Get user's stats
// @route   GET /api/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get or create stats for user
    const stats = await Stats.getOrCreate(userId);

    // Aggregate weekly and monthly stats
    const weeklyStats = await Stats.aggregateWeeklyStats(userId);
    const monthlyStats = await Stats.aggregateMonthlyStats(userId);

    // Get last 30 days for chart data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30Days = stats.dailyStats
      .filter((day) => new Date(day.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => ({
        date: day.date,
        completedPomodoros: day.completedPomodoros,
        totalWorkTime: day.totalWorkTime,
        completedTasks: day.completedTasks,
      }));

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalPomodoros: stats.totalPomodoros,
          totalWorkTime: stats.totalWorkTime,
          totalHours: stats.totalHours,
          totalCompletedTasks: stats.totalCompletedTasks,
          averagePomodoros: stats.averagePomodoros,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          lastActiveDate: stats.lastActiveDate,
        },
        weekly: weeklyStats,
        monthly: monthlyStats,
        last30Days,
        achievements: stats.achievements,
      },
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê",
      error: error.message,
    });
  }
};

// @desc    Get daily stats for a specific date
// @route   GET /api/stats/daily/:date
// @access  Private
const getDailyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date } = req.params;

    const stats = await Stats.findOne({ userId });
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thống kê",
      });
    }

    const dailyStat = stats.getStatsForDate(new Date(date));

    if (!dailyStat) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu cho ngày này",
      });
    }

    res.status(200).json({
      success: true,
      data: dailyStat,
    });
  } catch (error) {
    console.error("❌ Get daily stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê theo ngày",
      error: error.message,
    });
  }
};

// @desc    Sync pomodoro stats from client
// @route   POST /api/stats/sync
// @access  Private
const syncStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { duration, taskId } = req.body;

    // Validate duration
    if (!duration || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration phải là số dương",
      });
    }

    // Get or create stats
    const stats = await Stats.getOrCreate(userId);

    // Add pomodoro session
    await stats.addPomodoroSession(duration, taskId);

    console.log(`📊 Synced pomodoro: ${duration}min for user ${userId}`);
    console.log(
      `📊 Total pomodoros: ${stats.totalPomodoros}, Today: ${
        stats.dailyStats[0]?.completedPomodoros || 0
      }`
    );

    res.status(200).json({
      success: true,
      message: "Đồng bộ thống kê thành công",
      data: {
        totalPomodoros: stats.totalPomodoros,
        totalWorkTime: stats.totalWorkTime,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
      },
    });
  } catch (error) {
    console.error("❌ Sync stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đồng bộ thống kê",
      error: error.message,
    });
  }
};

// @desc    Get weekly stats for a specific week
// @route   GET /api/stats/weekly/:year/:week
// @access  Private
const getWeeklyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { year, week } = req.params;

    const stats = await Stats.findOne({ userId });
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thống kê",
      });
    }

    const weeklyStat = stats.getStatsForWeek(parseInt(week), parseInt(year));

    if (!weeklyStat) {
      // Aggregate from daily stats if not found
      const aggregated = await Stats.aggregateWeeklyStats(userId);
      return res.status(200).json({
        success: true,
        data: aggregated,
      });
    }

    res.status(200).json({
      success: true,
      data: weeklyStat,
    });
  } catch (error) {
    console.error("❌ Get weekly stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê theo tuần",
      error: error.message,
    });
  }
};

// @desc    Get monthly stats for a specific month
// @route   GET /api/stats/monthly/:year/:month
// @access  Private
const getMonthlyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.params;

    const stats = await Stats.findOne({ userId });
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thống kê",
      });
    }

    const monthlyStat = stats.getStatsForMonth(parseInt(month), parseInt(year));

    if (!monthlyStat) {
      // Aggregate from daily stats if not found
      const aggregated = await Stats.aggregateMonthlyStats(userId);
      return res.status(200).json({
        success: true,
        data: aggregated,
      });
    }

    res.status(200).json({
      success: true,
      data: monthlyStat,
    });
  } catch (error) {
    console.error("❌ Get monthly stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê theo tháng",
      error: error.message,
    });
  }
};

// @desc    Get achievement progress
// @route   GET /api/stats/achievements
// @access  Private
const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Stats.getOrCreate(userId);

    // Define all achievements with progress
    const allAchievements = [
      {
        type: "first_pomodoro",
        name: "Bước Đầu Tiên",
        description: "Hoàn thành pomodoro đầu tiên",
        icon: "🎯",
        unlocked: stats.achievements.some((a) => a.type === "first_pomodoro"),
        progress: Math.min(stats.totalPomodoros, 1),
        target: 1,
      },
      {
        type: "pomodoros_50",
        name: "Người Siêng Năng",
        description: "Hoàn thành 50 pomodoros",
        icon: "💪",
        unlocked: stats.achievements.some((a) => a.type === "pomodoros_50"),
        progress: Math.min(stats.totalPomodoros, 50),
        target: 50,
      },
      {
        type: "pomodoros_100",
        name: "Chiến Binh",
        description: "Hoàn thành 100 pomodoros",
        icon: "⚔️",
        unlocked: stats.achievements.some((a) => a.type === "pomodoros_100"),
        progress: Math.min(stats.totalPomodoros, 100),
        target: 100,
      },
      {
        type: "pomodoros_500",
        name: "Huyền Thoại",
        description: "Hoàn thành 500 pomodoros",
        icon: "🏆",
        unlocked: stats.achievements.some((a) => a.type === "pomodoros_500"),
        progress: Math.min(stats.totalPomodoros, 500),
        target: 500,
      },
      {
        type: "streak_3",
        name: "Khởi Đầu Tốt",
        description: "Duy trì streak 3 ngày",
        icon: "🔥",
        unlocked: stats.achievements.some((a) => a.type === "streak_3"),
        progress: Math.min(stats.currentStreak, 3),
        target: 3,
      },
      {
        type: "streak_7",
        name: "Tuần Hoàn Hảo",
        description: "Duy trì streak 7 ngày",
        icon: "⭐",
        unlocked: stats.achievements.some((a) => a.type === "streak_7"),
        progress: Math.min(stats.currentStreak, 7),
        target: 7,
      },
      {
        type: "streak_30",
        name: "Bất Khả Chiến Bại",
        description: "Duy trì streak 30 ngày",
        icon: "👑",
        unlocked: stats.achievements.some((a) => a.type === "streak_30"),
        progress: Math.min(stats.longestStreak, 30),
        target: 30,
      },
      {
        type: "hours_10",
        name: "10 Giờ Tập Trung",
        description: "Tích lũy 10 giờ làm việc",
        icon: "⏰",
        unlocked: stats.achievements.some((a) => a.type === "hours_10"),
        progress: Math.min(stats.totalWorkTime, 600),
        target: 600,
      },
      {
        type: "hours_50",
        name: "50 Giờ Cống Hiến",
        description: "Tích lũy 50 giờ làm việc",
        icon: "🎓",
        unlocked: stats.achievements.some((a) => a.type === "hours_50"),
        progress: Math.min(stats.totalWorkTime, 3000),
        target: 3000,
      },
      {
        type: "hours_100",
        name: "100 Giờ Tinh Hoa",
        description: "Tích lũy 100 giờ làm việc",
        icon: "💎",
        unlocked: stats.achievements.some((a) => a.type === "hours_100"),
        progress: Math.min(stats.totalWorkTime, 6000),
        target: 6000,
      },
    ];

    res.status(200).json({
      success: true,
      data: allAchievements,
    });
  } catch (error) {
    console.error("❌ Get achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thành tựu",
      error: error.message,
    });
  }
};

// @desc    Reset stats (for testing/admin only)
// @route   DELETE /api/stats/reset
// @access  Private
const resetStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Stats.findOneAndDelete({ userId });

    console.log(`🗑️ Reset stats for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Đã reset thống kê thành công",
    });
  } catch (error) {
    console.error("❌ Reset stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi reset thống kê",
      error: error.message,
    });
  }
};

module.exports = {
  getStats,
  getDailyStats,
  syncStats,
  getWeeklyStats,
  getMonthlyStats,
  getAchievements,
  resetStats,
};
