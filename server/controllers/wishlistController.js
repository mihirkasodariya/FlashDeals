const Wishlist = require('../models/Wishlist');
const Offer = require('../models/Offer');

// Toggle Wishlist Status
exports.toggleWishlist = async (req, res) => {
    try {
        const { offerId } = req.body;
        const userId = req.user.userId;

        const existingWishlist = await Wishlist.findOne({ user: userId, offer: offerId });

        if (existingWishlist) {
            // Remove from wishlist
            await Wishlist.findByIdAndDelete(existingWishlist._id);
            return res.status(200).json({ success: true, message: 'Offer removed from wishlist', isWishlisted: false });
        } else {
            // Add to wishlist
            const newWishlist = new Wishlist({ user: userId, offer: offerId });
            await newWishlist.save();
            return res.status(201).json({ success: true, message: 'Offer added to wishlist', isWishlisted: true });
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const wishlists = await Wishlist.find({ user: userId }).populate({
            path: 'offer',
            populate: {
                path: 'vendorId',
                select: 'name storeName location storeImage'
            }
        });
        // Filter out any null if offer was deleted
        const offers = wishlists.map(w => w.offer).filter(Boolean);

        res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user's wishlisted offer IDs
exports.getWishlistStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const wishlists = await Wishlist.find({ user: userId }, 'offer');
        const offerIds = wishlists.map(w => w.offer.toString());
        res.status(200).json({ success: true, offerIds });
    } catch (error) {
        console.error('Error fetching wishlist status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
