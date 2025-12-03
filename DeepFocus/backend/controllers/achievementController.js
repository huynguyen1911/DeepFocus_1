const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Stats = require('../models/Stats');

// Get all achievements with user progress
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, rarity, unlocked, favorite } = req.query;
    
    // Get all achievements with filters
    const achievementFilters = {};
    if (type) achievementFilters.type = type;
    if (category) achievementFilters.category = category;
    if (rarity) achievementFilters.rarity = rarity;
    
    const achievements = await Achievement.getActiveAchievements(achievementFilters);
    
    // Get user's progress for each achievement
    const userAchievementFilters = {};
    if (unlocked === 'true') userAchievementFilters.unlocked = true;
    if (unlocked === 'false') userAchievementFilters.unlocked = false;
    if (favorite === 'true') userAchievementFilters.favorite = true;
    
    const userAchievements = await UserAchievement.getUserAchievements(userId, userAchievementFilters);
    
    // Create map of user achievements
    const userAchievementMap = {};
    userAchievements.forEach(ua => {
      if (ua.achievement) {
        userAchievementMap[ua.achievement._id.toString()] = ua;
      }
    });
    
    // Combine data
    const result = achievements.map(achievement => {
      const userProgress = userAchievementMap[achievement._id.toString()];
      return {
        achievement,
        userProgress: userProgress || null,
        isUnlocked: userProgress?.unlockedAt ? true : false,
        progress: userProgress?.progress || { currentValue: 0, threshold: achievement.unlockCriteria.threshold, percentage: 0 },
        isFavorite: userProgress?.isFavorite || false
      };
    });
    
    // Apply additional filters
    let filtered = result;
    if (unlocked === 'true') {
      filtered = filtered.filter(r => r.isUnlocked);
    } else if (unlocked === 'false') {
      filtered = filtered.filter(r => !r.isUnlocked);
    }
    if (favorite === 'true') {
      filtered = filtered.filter(r => r.isFavorite);
    }
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting achievements',
      error: error.message
    });
  }
};

// Get achievement detail
exports.getAchievementDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.params;
    
    const achievement = await Achievement.findById(achievementId)
      .populate('prerequisiteAchievements');
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }
    
    // Get user's progress
    let userAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    });
    
    // If not exists, create one
    if (!userAchievement) {
      userAchievement = new UserAchievement({
        user: userId,
        achievement: achievementId,
        progress: {
          currentValue: 0,
          threshold: achievement.unlockCriteria.threshold,
          percentage: 0
        }
      });
      await userAchievement.save();
    }
    
    // Mark as viewed
    await userAchievement.markViewed();
    
    // Get user stats for unlockability check
    const stats = await Stats.findOne({ user: userId });
    const unlockableCheck = await Achievement.checkUnlockable(achievementId, stats || {});
    
    res.json({
      success: true,
      data: {
        achievement,
        userProgress: userAchievement,
        unlockableCheck,
        isUnlocked: !!userAchievement.unlockedAt,
        isNew: userAchievement.isNew
      }
    });
  } catch (error) {
    console.error('Error getting achievement detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting achievement detail',
      error: error.message
    });
  }
};

// Toggle achievement favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.params;
    
    let userAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    });
    
    if (!userAchievement) {
      // Create if not exists
      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Achievement not found'
        });
      }
      
      userAchievement = new UserAchievement({
        user: userId,
        achievement: achievementId,
        progress: {
          currentValue: 0,
          threshold: achievement.unlockCriteria.threshold,
          percentage: 0
        },
        isFavorite: true
      });
      await userAchievement.save();
    } else {
      await userAchievement.toggleFavorite();
    }
    
    res.json({
      success: true,
      data: userAchievement,
      isFavorite: userAchievement.isFavorite
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
};

// Share achievement
exports.shareAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.params;
    
    const userAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    }).populate('achievement');
    
    if (!userAchievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }
    
    if (!userAchievement.unlockedAt) {
      return res.status(400).json({
        success: false,
        message: 'Cannot share locked achievement'
      });
    }
    
    await userAchievement.incrementShare();
    
    // Generate share data
    const shareData = {
      achievementName: userAchievement.achievement.name,
      achievementIcon: userAchievement.achievement.icon,
      unlockedAt: userAchievement.unlockedAt,
      rarity: userAchievement.achievement.rarity,
      shareUrl: `deepfocus://achievements/${achievementId}`,
      shareText: `I just unlocked "${userAchievement.achievement.getLocalizedName('en')}" in DeepFocus! 🎉`
    };
    
    res.json({
      success: true,
      data: shareData
    });
  } catch (error) {
    console.error('Error sharing achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing achievement',
      error: error.message
    });
  }
};

// Get achievement summary
exports.getAchievementSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const summary = await UserAchievement.getUserSummary(userId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting achievement summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting achievement summary',
      error: error.message
    });
  }
};

// Check and unlock achievements (called by system)
exports.checkUnlocks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    const stats = await Stats.findOne({ user: userId });
    if (!stats) {
      return res.json({
        success: true,
        unlockedCount: 0,
        unlocked: []
      });
    }
    
    // Get all achievements user hasn't unlocked yet
    const unlockedAchievementIds = await UserAchievement.find({
      user: userId,
      unlockedAt: { $exists: true }
    }).distinct('achievement');
    
    const achievements = await Achievement.find({
      _id: { $nin: unlockedAchievementIds },
      isActive: true
    });
    
    const newlyUnlocked = [];
    
    // Check each achievement
    for (const achievement of achievements) {
      const check = await Achievement.checkUnlockable(achievement._id, stats);
      
      if (check.unlockable) {
        // Get or create user achievement
        let userAchievement = await UserAchievement.findOne({
          user: userId,
          achievement: achievement._id
        });
        
        if (!userAchievement) {
          userAchievement = new UserAchievement({
            user: userId,
            achievement: achievement._id,
            progress: {
              currentValue: check.currentValue,
              threshold: check.threshold,
              percentage: 100
            }
          });
        }
        
        // Unlock it
        const result = await userAchievement.unlock();
        if (result.success) {
          await userAchievement.populate('achievement');
          newlyUnlocked.push(userAchievement);
        }
      }
    }
    
    res.json({
      success: true,
      unlockedCount: newlyUnlocked.length,
      unlocked: newlyUnlocked
    });
  } catch (error) {
    console.error('Error checking unlocks:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking unlocks',
      error: error.message
    });
  }
};
