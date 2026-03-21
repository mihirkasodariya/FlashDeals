const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');
const { uploadOffer } = require('../middleware/uploadMiddleware');

router.get('/', offerController.getOffers);
router.get('/expiring-soon', optionalAuthenticateToken, offerController.getExpiringOffers);
router.get('/sync-hot-deals', optionalAuthenticateToken, offerController.syncHotDeals);
router.get('/sync-trending-deals', optionalAuthenticateToken, offerController.syncTrendingDeals);
router.get('/sync-recommended-deals', optionalAuthenticateToken, offerController.syncRecommendedDeals);
router.get('/sync-new-offers', optionalAuthenticateToken, offerController.syncNewOffers);
router.get('/:offerId', offerController.getOfferById);
router.get('/vendor/:vendorId', offerController.getVendorOffers);
router.post('/add', authenticateToken, uploadOffer.single('image'), offerController.addOffer);
router.put('/edit/:offerId', authenticateToken, uploadOffer.single('image'), offerController.editOffer);
router.delete('/delete/:offerId', authenticateToken, offerController.deleteOffer);
router.post('/visit/:offerId', offerController.incrementOfferVisits);

module.exports = router;
