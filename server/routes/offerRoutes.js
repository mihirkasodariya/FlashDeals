const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadOffer } = require('../middleware/uploadMiddleware');

router.get('/', offerController.getOffers);
router.get('/vendor/:vendorId', offerController.getVendorOffers);
router.post('/add', authenticateToken, uploadOffer.single('image'), offerController.addOffer);

module.exports = router;
