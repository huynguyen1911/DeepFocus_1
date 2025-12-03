const admin = require('../config/firebase');
const PushToken = require('../models/PushToken');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

class NotificationService {
  /**
   * Send push notification to a user
   */
  async sendToUser(userId, notification) {
    try {
      // Check if Firebase is initialized
      if (!admin) {
        console.warn('Firebase not initialized. Skipping notification.');
        return { success: false, reason: 'Firebase not configured' };
      }

      // Get all active tokens for user
      const tokens = await PushToken.find({
        user: userId,
        isActive: true,
      });

      if (tokens.length === 0) {
        console.log(`No active push tokens for user ${userId}`);
        return { success: false, reason: 'No active tokens' };
      }

      // Prepare messages for Expo Push
      const messages = tokens
        .filter(tokenDoc => Expo.isExpoPushToken(tokenDoc.token))
        .map(tokenDoc => ({
          to: tokenDoc.token,
          sound: 'default',
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          badge: notification.badge || 1,
          priority: notification.priority || 'high',
        }));

      if (messages.length === 0) {
        console.log(`No valid Expo push tokens for user ${userId}`);
        return { success: false, reason: 'No valid Expo tokens' };
      }

      // Send via Expo Push
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      // Update last used timestamp
      await Promise.all(tokens.map(token => {
        token.lastUsed = new Date();
        return token.save();
      }));

      console.log(`✅ Sent notification to user ${userId}: "${notification.title}"`);
      return { success: true, tickets };
    } catch (error) {
      console.error('Error in sendToUser:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds, notification) {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );
    return results;
  }

  /**
   * Send notification to all students in a class
   */
  async sendToClass(classId, notification) {
    const Class = require('../models/Class');
    const classDoc = await Class.findById(classId).populate('students');
    
    if (!classDoc) {
      return { success: false, reason: 'Class not found' };
    }

    const studentIds = classDoc.students.map(s => s._id);
    return this.sendToUsers(studentIds, notification);
  }

  /**
   * Register a new push token
   */
  async registerToken(userId, token, platform, deviceId) {
    try {
      // Validate Expo push token
      if (!Expo.isExpoPushToken(token)) {
        console.warn(`Invalid Expo push token: ${token}`);
        return { success: false, error: 'Invalid Expo push token format' };
      }

      // Check if token already exists
      let pushToken = await PushToken.findOne({ token });

      if (pushToken) {
        // Update existing token
        pushToken.user = userId;
        pushToken.platform = platform;
        pushToken.deviceId = deviceId;
        pushToken.isActive = true;
        pushToken.lastUsed = new Date();
      } else {
        // Create new token
        pushToken = new PushToken({
          user: userId,
          token,
          platform,
          deviceId,
        });
      }

      await pushToken.save();
      console.log(`✅ Registered push token for user ${userId} on ${platform}`);
      return { success: true, token: pushToken };
    } catch (error) {
      console.error('Error registering token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unregister a push token
   */
  async unregisterToken(token) {
    try {
      await PushToken.findOneAndUpdate(
        { token },
        { isActive: false }
      );
      console.log(`✅ Unregistered push token`);
      return { success: true };
    } catch (error) {
      console.error('Error unregistering token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens() {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const result = await PushToken.updateMany(
        { lastUsed: { $lt: ninetyDaysAgo }, isActive: true },
        { isActive: false }
      );
      console.log(`✅ Cleaned up ${result.modifiedCount} expired push tokens`);
      return { success: true, deactivated: result.modifiedCount };
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
