const Offer = require('../models/Offer');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');
const mongoose = require('mongoose');

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const addOffer = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ success: false, message: 'Only vendors can add offers' });
        }

        let { title, description, category, startDate, endDate, status } = req.body;
        const finalStatus = status || 'active';

        // Conditional Validation
        if (finalStatus === 'active') {
             if (!title || !category || !req.file || !startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'All fields (Title, Category, Image, Dates) are required for publishing' });
            }
        } else if (finalStatus === 'draft') {
            // Check if AT LEAST something is present for draft, otherwise it's an empty record
             if (!title && !description && !category && !req.file) {
                return res.status(400).json({ success: false, message: 'Please provide at least one field to save as draft' });
             }
        }

        // Parse category if provided
        if (category && (typeof category === 'string' && category.trim() !== '')) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                const foundCat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
                if (foundCat) category = foundCat._id;
                else return res.status(400).json({ success: false, message: `Invalid category: ${category}` });
            }
        } else if (finalStatus === 'active') {
             return res.status(400).json({ success: false, message: 'Category is required for publishing' });
        }

        const offerData = {
            vendorId: req.user.userId,
            title,
            description,
            category: category || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            status: finalStatus
        };

        if (req.file) {
            offerData.image = `https://api.offerz.live/public/offers/${req.file.filename}`;
        }

        const offer = new Offer(offerData);

        await offer.save();
        await offer.populate('category');
        res.json({ success: true, message: 'Offer added successfully', offer });
    } catch (error) {
        console.error("Add Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOffers = async (req, res) => {
    try {
        const { lat, lng, radius, category, search, startDate, endDate } = req.query;
        const now = new Date();

        const query = { status: { $ne: 'draft' } };

        if (startDate && endDate) {
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            query.$and = [
                { createdAt: { $lte: rangeEnd } },
                { endDate: { $gte: rangeStart } },
                { startDate: { $lte: rangeEnd } }
            ];
        } else {
            query.endDate = { $gte: now };
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
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
                    offer.distance = dist;
                }
            });

            offers.sort((a, b) => {
                const distA = a.distance !== undefined ? a.distance : Infinity;
                const distB = b.distance !== undefined ? b.distance : Infinity;
                return distA - distB;
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = offers.length;
        const paginatedOffers = offers.slice(startIndex, endIndex);

        if (paginatedOffers.length > 0) {
            const offerIds = paginatedOffers.map(o => o._id);
            await Offer.updateMany({ _id: { $in: offerIds } }, { $inc: { impressions: 1 } });
        }

        res.json({ success: true, offers: paginatedOffers, total, hasMore: endIndex < total });
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

        const [total, active, upcoming, expired, drafts, offers] = await Promise.all([
            Offer.countDocuments(query),
            Offer.countDocuments({ ...query, status: 'active', startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }),
            Offer.countDocuments({ ...query, status: 'active', startDate: { $gt: endOfDay } }),
            Offer.countDocuments({ ...query, status: 'active', endDate: { $lt: startOfDay } }),
            Offer.countDocuments({ ...query, status: 'draft' }),
            Offer.find(query)
                .populate('vendorId', 'storeName name location profileImage storeImage storeAddress')
                .populate('category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        res.json({ 
            success: true, 
            offers, 
            total, 
            stats: { active, upcoming, expired, drafts }, 
            hasMore: total > skip + offers.length 
        });
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
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, offer });
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
        if (req.user.role !== 'vendor') return res.status(403).json({ success: false, message: 'Only vendors can edit' });
        const { offerId } = req.params;
        const updates = req.body;
        if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
            const foundCat = await Category.findOne({ name: new RegExp(`^${updates.category}$`, 'i') });
            if (foundCat) updates.category = foundCat._id;
            else return res.status(400).json({ success: false, message: 'Invalid category' });
        }
        const offer = await Offer.findOneAndUpdate({ _id: offerId, vendorId: req.user.userId }, updates, { new: true }).populate('category');
        if (!offer) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') return res.status(403).json({ success: false, message: 'Only vendors can delete' });
        const { offerId } = req.params;
        const offer = await Offer.findOneAndDelete({ _id: offerId, vendorId: req.user.userId });
        if (!offer) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getExpiringOffers = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const radius = parseFloat(req.query.radius) || 15;
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        let offers = await Offer.find({ 
            endDate: { $gte: now, $lte: tomorrow },
            status: { $ne: 'draft' }
        })
            .populate('vendorId', 'storeName location profileImage')
            .populate('category')
            .sort({ endDate: 1 })
            .limit(20)
            .lean();

        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            offers = offers.filter(offer => {
                const loc = offer.vendorId && offer.vendorId.location;
                if (loc && loc.latitude) {
                    const dist = getDistanceFromLatLonInKm(userLat, userLng, loc.latitude, loc.longitude);
                    offer.distance = dist;
                    return dist <= radius;
                }
                return false;
            });
        }

        offers = offers.slice(0, 10);

        // Notify Logic
        if (req.user && req.user.userId && offers.length > 0) {
            const userId = req.user.userId;
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            const veryUrgent = offers.filter(o => new Date(o.endDate) <= twoHoursLater);

            if (veryUrgent.length > 0) {
                const title2h = 'Only 2 hours left for this offer!';
                const existing = await Notification.findOne({ userId, title: title2h, createdAt: { $gte: new Date(now.getTime() - 2 * 3600000) } });
                if (!existing) {
                    await Notification.create({ userId, title: title2h, body: `Quick! ${veryUrgent.length} local deals expire in under 2 hours.` });
                }
            } else {
                const title24h = 'Only 24 hours left for this offer!';
                const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
                const existing = await Notification.findOne({ userId, title: title24h, createdAt: { $gte: startOfToday } });
                if (!existing) {
                    await Notification.create({ userId, title: title24h, body: `You have ${offers.length} deals ending in 24h.` });
                }
            }
        }

        res.json({ success: true, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const syncHotDeals = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!req.user?.userId) return res.json({ success: true });
        const userId = req.user.userId;
        const title = "Hot deal nearby! Don’t miss it";
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const existing = await Notification.findOne({ userId, title, createdAt: { $gte: startOfToday } });
        if (existing) return res.json({ success: true });

        let offers = await Offer.find({ endDate: { $gte: new Date() } }).populate('vendorId', 'location storeName').lean();
        if (lat && lng) {
            const userLat = parseFloat(lat); const userLng = parseFloat(lng);
            offers = offers.filter(o => {
                const loc = o.vendorId?.location;
                return loc?.latitude && getDistanceFromLatLonInKm(userLat, userLng, loc.latitude, loc.longitude) <= 15;
            });
        }
        if (offers.length > 0) {
            offers.sort((a, b) => (b.visits || 0) - (a.visits || 0));
            const best = offers[0];
            await Notification.create({ userId, title, body: `Trending deal at ${best.vendorId.storeName}! Grab it now.` });
            return res.json({ success: true, created: true, offer: best });
        }
        res.json({ success: true, created: false });
    } catch (error) { res.status(500).json({ success: false }); }
};

const syncTrendingDeals = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!req.user?.userId) return res.json({ success: true });
        const userId = req.user.userId;
        const title = "Trending Deals near you 15km";
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const existing = await Notification.findOne({ userId, title, createdAt: { $gte: startOfToday } });
        if (existing) return res.json({ success: true });

        let offers = await Offer.find({ endDate: { $gte: new Date() } }).populate('vendorId', 'location').lean();
        let count = 0;
        if (lat && lng) {
            const userLat = parseFloat(lat); const userLng = parseFloat(lng);
            count = offers.filter(o => {
                const loc = o.vendorId?.location;
                return loc?.latitude && getDistanceFromLatLonInKm(userLat, userLng, loc.latitude, loc.longitude) <= 15;
            }).length;
        } else { count = offers.length; }

        if (count > 0) {
            await Notification.create({ userId, title, body: `Morning! You have ${count} trending deals near you.` });
            return res.json({ success: true, created: true, count });
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
};

const syncRecommendedDeals = async (req, res) => {
    try {
        if (!req.user?.userId) return res.json({ success: true });
        const userId = req.user.userId;
        const title = "Recommended offers for you";
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const existing = await Notification.findOne({ userId, title, createdAt: { $gte: startOfToday } });
        if (existing) return res.json({ success: true });

        // Get user's wishlist
        const wishlist = await Wishlist.find({ user: userId }).populate('offer');
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const expiringWishlist = wishlist.filter(item => {
            const o = item.offer;
            return o && o.endDate >= now && o.endDate <= tomorrow;
        });

        if (expiringWishlist.length > 0) {
            await Notification.create({
                userId,
                title,
                body: `Attention! ${expiringWishlist.length} items in your wishlist are expiring in less than 24 hours. Check them now!`,
            });
            console.log(`[SyncRec] Created morning wishlist-expiry alert for ${userId}`);
            return res.json({ success: true, created: true, count: expiringWishlist.length });
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
};

const syncNewOffers = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!req.user?.userId) return res.json({ success: true });
        const userId = req.user.userId;
        const title = "New offers near you";
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const existing = await Notification.findOne({ userId, title, createdAt: { $gte: startOfToday } });
        if (existing) return res.json({ success: true });

        // Find offers created in last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let offers = await Offer.find({ createdAt: { $gte: yesterday } }).populate('vendorId', 'location').lean();

        let newCount = 0;
        if (lat && lng) {
            const userLat = parseFloat(lat); const userLng = parseFloat(lng);
            newCount = offers.filter(o => {
                const loc = o.vendorId?.location;
                return loc?.latitude && getDistanceFromLatLonInKm(userLat, userLng, loc.latitude, loc.longitude) <= 15;
            }).length;
        } else { newCount = offers.length; }

        if (newCount > 0) {
            await Notification.create({
                userId,
                title,
                body: `Exciting! ${newCount} fresh deals were added near you in the last 24 hours. Check them out!`,
            });
            console.log(`[SyncNew] Created morning new-deals alert for ${userId}`);
            return res.json({ success: true, created: true, count: newCount });
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
};

module.exports = {
    addOffer,
    getOffers,
    getVendorOffers,
    getOfferById,
    incrementOfferVisits,
    editOffer,
    deleteOffer,
    getExpiringOffers,
    syncHotDeals,
    syncTrendingDeals,
    syncRecommendedDeals,
    syncNewOffers
};
