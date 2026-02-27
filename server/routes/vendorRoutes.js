const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload, uploadProfile } = require('../middleware/uploadMiddleware');

router.post('/complete-registration', upload.single('idDocument'), vendorController.completeRegistration);
router.put('/update/:userId', authenticateToken, uploadProfile.single('profileImage'), vendorController.updateVendor);

module.exports = router;
