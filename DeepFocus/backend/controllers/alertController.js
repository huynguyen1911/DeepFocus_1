const Alert = require("../models/Alert");
const User = require("../models/User");

/**
 * @desc    Get user's alerts
 * @route   GET /api/alerts
 * @access  Private
 */
const getAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { unreadOnly, type, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { recipient: userId };

    if (unreadOnly === "true") {
      query.read = false;
    }

    if (type) {
      query.type = type;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get alerts",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark alert as read
 * @route   PUT /api/alerts/:id/read
 * @access  Private
 */
const markAlertAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const alert = await Alert.findOne({ _id: id, recipient: userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    if (alert.read) {
      return res.json({
        success: true,
        message: "Alert already marked as read",
        data: alert,
      });
    }

    alert.read = true;
    alert.readAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark alert as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all alerts as read
 * @route   PUT /api/alerts/read-all
 * @access  Private
 */
const markAllAlertsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Alert.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({
      success: true,
      message: "All alerts marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error marking all alerts as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all alerts as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete an alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const alert = await Alert.findOneAndDelete({ _id: id, recipient: userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete alert",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete old alerts (older than 30 days)
 * @route   DELETE /api/alerts/cleanup
 * @access  Private
 */
const cleanupOldAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Alert.deleteMany({
      recipient: userId,
      createdAt: { $lt: thirtyDaysAgo },
      read: true,
    });

    res.json({
      success: true,
      message: "Old alerts cleaned up successfully",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error cleaning up alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup alerts",
      error: error.message,
    });
  }
};

/**
 * @desc    Create alert (System use only - called by other controllers)
 * @param   {Object} alertData - Alert data
 * @returns {Promise<Alert>}
 */
const createAlert = async (alertData) => {
  try {
    const alert = await Alert.create(alertData);
    return alert;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

/**
 * @desc    Send bulk alerts (System use only)
 * @param   {Array} recipients - Array of user IDs
 * @param   {Object} alertData - Alert data (without recipient)
 * @returns {Promise<Array>}
 */
const sendBulkAlerts = async (recipients, alertData) => {
  try {
    const alerts = recipients.map((recipientId) => ({
      ...alertData,
      recipient: recipientId,
    }));

    const createdAlerts = await Alert.insertMany(alerts);
    return createdAlerts;
  } catch (error) {
    console.error("Error sending bulk alerts:", error);
    throw error;
  }
};

module.exports = {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  cleanupOldAlerts,
  createAlert,
  sendBulkAlerts,
};
