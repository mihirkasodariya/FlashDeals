const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadVendorS3, uploadProfileS3 } = require('../middleware/s3UploadMiddleware');

router.post('/complete-registration', uploadVendorS3.single('idDocument'), vendorController.completeRegistration);
router.put('/update/:userId', authenticateToken, uploadVendorS3.single('profileImage'), vendorController.updateVendor);

module.exports = router;
