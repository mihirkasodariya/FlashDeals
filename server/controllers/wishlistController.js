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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.user.userId;

        // 1. Get all wishlisted offer IDs for this user
        const wishlistItems = await Wishlist.find({ user: userId }).select('offer').lean();
        const offerIds = wishlistItems.map(w => w.offer);

        if (offerIds.length === 0) {
            return res.json({ success: true, offers: [], total: 0, hasMore: false });
        }

        // 2. Aggregate on Offer model to use $geoNear (for spatial sorting)
        let pipeline = [];

        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    spherical: true,
                    distanceMultiplier: 0.001 // Convert m to km
                }
            });
        }

        // Match only wishlisted offers that are not drafts
        pipeline.push({
            $match: {
                _id: { $in: offerIds },
                status: { $ne: 'draft' }
            }
        });

        // Add Category and Vendor details
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'vendorId',
                foreignField: '_id',
                as: 'vendorId'
            }
        });
        pipeline.push({ $unwind: '$vendorId' });

        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        });
        pipeline.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } });

        // Project necessary fields
        pipeline.push({
            $project: {
                title: 1,
                description: 1,
                image: 1,
                discount: 1,
                startDate: 1,
                endDate: 1,
                status: 1,
                location: 1,
                distance: 1,
                'vendorId.name': 1,
                'vendorId.storeName': 1,
                'vendorId.location': 1,
                'vendorId.storeImage': 1,
                'category.name': 1
            }
        });

        // Facet for count and pagination
        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        });

        const result = await Offer.aggregate(pipeline);
        const offers = result[0].data;
        const total = result[0].metadata[0]?.total || 0;
        const hasMore = (skip + offers.length) < total;

        res.status(200).json({ success: true, offers, total, hasMore });
    } catch (error) {
        console.error('Error fetching optimized wishlist:', error);
        res.status(500).json({ success: false, message: error.message });
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
