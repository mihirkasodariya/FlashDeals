const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/send', authenticateToken, isAdmin, notificationController.sendCustomNotification);

module.exports = router;
