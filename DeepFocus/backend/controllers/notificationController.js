const notificationService = require('../services/notificationService');

// Register push token
exports.registerToken = async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;
    const userId = req.user._id;

    if (!token || !platform || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Token, platform, and deviceId are required',
      });
    }

    const result = await notificationService.registerToken(
      userId,
      token,
      platform,
      deviceId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Push token registered successfully',
      data: result.token,
    });
  } catch (error) {
    console.error('Error in registerToken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register push token',
      error: error.message,
    });
  }
};

// Unregister push token
exports.unregisterToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const result = await notificationService.unregisterToken(token);

    res.json({
      success: true,
      message: 'Push token unregistered successfully',
    });
  } catch (error) {
    console.error('Error in unregisterToken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister push token',
      error: error.message,
    });
  }
};

// Send test notification (admin/testing only)
exports.sendTestNotification = async (req, res) => {
  try {
    const { title, body, data } = req.body;
    const userId = req.user._id;

    const result = await notificationService.sendToUser(userId, {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from DeepFocus',
      data: data || {},
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      result,
    });
  } catch (error) {
    console.error('Error in sendTestNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message,
    });
  }
};

// Get user's registered tokens
exports.getUserTokens = async (req, res) => {
  try {
    const userId = req.user._id;
    const PushToken = require('../models/PushToken');

    const tokens = await PushToken.find({
      user: userId,
      isActive: true,
    }).select('-__v');

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Error in getUserTokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user tokens',
      error: error.message,
    });
  }
};
