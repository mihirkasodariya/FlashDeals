const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticateToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/login', authController.login);
router.post('/register', upload.single('profileImage'), authController.register);
router.get('/me', authenticateToken, authController.getMe);
router.post('/verify-otp', authController.verifyOTP);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/login-history', authenticateToken, authController.getLoginHistory);
router.post('/logout-device', authenticateToken, authController.logoutDevice);
router.put('/update', authenticateToken, upload.single('profileImage'), authController.updateProfile);

module.exports = router;
