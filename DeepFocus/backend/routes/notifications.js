const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Register push token
router.post('/register-token', notificationController.registerToken);

// Unregister push token
router.post('/unregister-token', notificationController.unregisterToken);

// Send test notification
router.post('/test', notificationController.sendTestNotification);

// Get user's registered tokens
router.get('/tokens', notificationController.getUserTokens);

module.exports = router;
