const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist, getWishlistStatus } = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(authenticateToken);

router.post('/toggle', toggleWishlist);
router.get('/', getWishlist);
router.get('/status', getWishlistStatus);

module.exports = router;
