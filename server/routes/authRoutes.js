const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticateToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/login', authController.login);
router.post('/register', upload.single('profileImage'), authController.register);
router.get('/me', authenticateToken, authController.getMe);
router.post('/verify-otp', authController.verifyOTP);
router.put('/update', authenticateToken, upload.single('profileImage'), authController.updateProfile);

module.exports = router;
