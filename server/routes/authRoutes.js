const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticateToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/login', authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/login-with-otp', authController.loginWithOTP);
router.post('/check-mobile', authController.checkMobile);
router.post('/register', upload.single('profileImage'), authController.register);
router.get('/me', authenticateToken, authController.getMe);
router.post('/verify-otp', authController.verifyOTP);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/login-history', authenticateToken, authController.getLoginHistory);
router.post('/logout-device', authenticateToken, authController.logoutDevice);
router.put('/update', authenticateToken, upload.single('profileImage'), authController.updateProfile);
router.post('/switch-role/user', authenticateToken, authController.switchToUser);
router.post('/update-fcm-token', authenticateToken, authController.updateFCMToken);
router.get('/notifications/unread-count', authenticateToken, authController.getUnreadNotificationCount);
router.get('/notifications', authenticateToken, authController.getNotifications);
router.put('/notifications/:notificationId/read', authenticateToken, authController.markNotificationAsRead);

module.exports = router;
