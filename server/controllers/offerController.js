const Offer = require('../models/Offer');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const addOffer = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ success: false, message: 'Only vendors can add offers' });
        }

        let { title, description, category, startDate, endDate } = req.body;

        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            const foundCat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
            if (foundCat) category = foundCat._id;
            else return res.status(400).json({ success: false, message: `Invalid category: ${category}` });
        }

        const offer = new Offer({
            vendorId: req.user.userId,
            title,
            description,
            category,
            image: `/public/offers/${req.file.filename}`,
            startDate,
            endDate
        });

        await offer.save();
        await offer.populate('category');
        res.json({ success: true, message: 'Offer added successfully', offer });
    } catch (error) {
        console.error("Add Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
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

const getOffers = async (req, res) => {
    try {
        const { lat, lng, radius, category, search, startDate, endDate } = req.query;
        const now = new Date();

        const query = {};

        // If range is provided, find offers that have any overlap with [startDate, endDate]
        // or are "Upcoming" relative to the range.
        if (startDate && endDate) {
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            query.$and = [
                { createdAt: { $lte: rangeEnd } }, // Must be created before range ends
                { endDate: { $gte: rangeStart } }, // Must not have ended before range starts
                { startDate: { $lte: rangeEnd } }  // Must have started (or start during) the range
            ];
        } else {
            // Default: Only show current/future offers
            query.endDate = { $gte: now };
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'vendorId.storeName': { $regex: search, $options: 'i' } } // Note: Need to verify if this works with populate
            ];
            // Since vendorId is populated, searching by storeName requires a different approach or search in memory. 
            // For now, let's stick to title and description.
        }

        let offers = await Offer.find(query)
            .populate('vendorId', 'storeName name location profileImage storeImage storeAddress')
            .populate('category')
            .sort({ createdAt: -1 })
            .lean();

        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            offers.forEach(offer => {
                const loc = offer.vendorId && offer.vendorId.location;
                if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
                    const dist = getDistanceFromLatLonInKm(userLat, userLng, loc.latitude, loc.longitude);
                    offer.distance = dist; // Attach distance for UI
                }
            });

            // Sort by distance (nearest first)
            offers.sort((a, b) => {
                const distA = a.distance !== undefined ? a.distance : Infinity;
                const distB = b.distance !== undefined ? b.distance : Infinity;
                return distA - distB;
            });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = offers.length;
        const paginatedOffers = offers.slice(startIndex, endIndex);

        // Increment impressions for the paginated set
        if (paginatedOffers.length > 0) {
            const offerIds = paginatedOffers.map(o => o._id);
            await Offer.updateMany(
                { _id: { $in: offerIds } },
                { $inc: { impressions: 1 } }
            );
        }

        res.json({
            success: true,
            offers: paginatedOffers,
            total,
            hasMore: endIndex < total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getVendorOffers = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        const query = { vendorId };

        const [total, active, upcoming, expired, offers] = await Promise.all([
            Offer.countDocuments(query),
            Offer.countDocuments({ ...query, startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }),
            Offer.countDocuments({ ...query, startDate: { $gt: endOfDay } }),
            Offer.countDocuments({ ...query, endDate: { $lt: startOfDay } }),
            Offer.find(query)
                .populate('vendorId', 'storeName name location profileImage storeImage storeAddress')
                .populate('category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        res.json({
            success: true,
            offers,
            total,
            stats: { active, upcoming, expired },
            page,
            hasMore: skip + offers.length < total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const incrementOfferVisits = async (req, res) => {
    try {
        const { offerId } = req.params;
        await Offer.findByIdAndUpdate(offerId, { $inc: { visits: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const editOffer = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ success: false, message: 'Only vendors can edit offers' });
        }

        const { offerId } = req.params;
        const updates = req.body;

        if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
            const foundCat = await Category.findOne({ name: new RegExp(`^${updates.category}$`, 'i') });
            if (foundCat) updates.category = foundCat._id;
            // if not found, we let it fall through or error. For edit, maybe let it be or error.
            else return res.status(400).json({ success: false, message: `Invalid category: ${updates.category}` });
        }

        const offer = await Offer.findOneAndUpdate(
            { _id: offerId, vendorId: req.user.userId },
            updates,
            { returnDocument: 'after' }
        ).populate('category');

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found or unauthorized' });
        }

        res.json({ success: true, message: 'Offer updated successfully', offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOfferById = async (req, res) => {
    try {
        const { offerId } = req.params;
        const offer = await Offer.findById(offerId)
            .populate('vendorId', 'storeName name location profileImage storeImage storeAddress')
            .populate('category');

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        res.json({ success: true, offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ success: false, message: 'Only vendors can delete offers' });
        }

        const { offerId } = req.params;
        const offer = await Offer.findOneAndDelete({ _id: offerId, vendorId: req.user.userId });

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found or unauthorized' });
        }

        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addOffer,
    getOffers,
    getVendorOffers,
    getOfferById,
    incrementOfferVisits,
    editOffer,
    deleteOffer
};
