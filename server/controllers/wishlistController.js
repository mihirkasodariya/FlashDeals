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

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const userId = req.user.userId;
        const wishlists = await Wishlist.find({ user: userId })
            .populate({
                path: 'offer',
                populate: {
                    path: 'vendorId',
                    select: 'name storeName location storeImage'
                }
            })
            .lean(); // Use lean for better performance

        // Filter out any null if offer was deleted
        let offers = wishlists.map(w => w.offer).filter(Boolean);

        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            offers.forEach(offer => {
                const loc = offer.vendorId && offer.vendorId.location;
                if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
                    const dist = getDistanceFromLatLonInKm(userLat, userLng, loc.latitude, loc.longitude);
                    offer.distance = dist;
                }
            });

            // Sort by distance
            offers.sort((a, b) => {
                const distA = a.distance !== undefined ? a.distance : Infinity;
                const distB = b.distance !== undefined ? b.distance : Infinity;
                return distA - distB;
            });
        }

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
