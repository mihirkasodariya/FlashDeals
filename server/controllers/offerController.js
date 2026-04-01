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
            offerData.image = req.file.location;
        }

        // Fetch vendor location from User model
        const User = require('../models/User');
        const vendor = await User.findById(req.user.userId);
        if (vendor && vendor.location && vendor.location.latitude && vendor.location.longitude) {
            offerData.location = {
                type: 'Point',
                coordinates: [parseFloat(vendor.location.longitude), parseFloat(vendor.location.latitude)]
            };
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const now = new Date();

        let pipeline = [];

        // 1. GeoNear Stage (Must be first)
        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: (parseFloat(radius) || 15) * 1000, // conversion to meters
                    distanceMultiplier: 0.001 // conversion to km
                }
            });
        }

        // 2. Initial Match Stage
        let matchQuery = { status: { $ne: 'draft' } };

        if (startDate && endDate) {
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            matchQuery.$and = [
                { createdAt: { $lte: rangeEnd } },
                { endDate: { $gte: rangeStart } },
                { startDate: { $lte: rangeEnd } }
            ];
        } else {
            matchQuery.endDate = { $gte: now };
        }

        if (category && category !== 'all') {
            matchQuery.category = new mongoose.Types.ObjectId(category);
        }

        if (search) {
            matchQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        pipeline.push({ $match: matchQuery });

        // 3. Sorting (if no geoNear, sort by createdAt)
        if (!(lat && lng)) {
            pipeline.push({ $sort: { createdAt: -1 } });
        } else {
             // Already sorted by distance from $geoNear, but can add secondary sort
             pipeline.push({ $sort: { distance: 1, createdAt: -1 } });
        }

        // 4. Faceted Search for Metadata and Paginated Results
        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    // Populate equivalent in aggregation
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'vendorId',
                            foreignField: '_id',
                            as: 'vendorId'
                        }
                    },
                    { $unwind: '$vendorId' },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            'vendorId.password': 0,
                            'vendorId.otp': 0,
                            'vendorId.loginDevices': 0
                        }
                    }
                ]
            }
        });

        const results = await Offer.aggregate(pipeline);
        
        const offers = results[0].data;
        const total = results[0].metadata[0]?.total || 0;

        if (offers.length > 0) {
            const offerIds = offers.map(o => o._id);
            await Offer.updateMany({ _id: { $in: offerIds } }, { $inc: { impressions: 1 } });
        }

        res.json({ 
            success: true, 
            offers, 
            total, 
            hasMore: skip + offers.length < total 
        });
    } catch (error) {
        console.error("Get Offers Error:", error);
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
        const updates = { ...req.body };
        if (req.file) {
            updates.image = req.file.location;
        }

        if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
            const foundCat = await Category.findOne({ name: new RegExp(`^${updates.category}$`, 'i') });
            if (foundCat) updates.category = foundCat._id;
            else return res.status(400).json({ success: false, message: 'Invalid category' });
        }

        // Sync location on edit just in case
        const User = require('../models/User');
        const vendor = await User.findById(req.user.userId);
        if (vendor && vendor.location && vendor.location.latitude && vendor.location.longitude) {
            updates.location = {
                type: 'Point',
                coordinates: [parseFloat(vendor.location.longitude), parseFloat(vendor.location.latitude)]
            };
        }

        const offer = await Offer.findOneAndUpdate({ _id: offerId, vendorId: req.user.userId }, updates, { new: true }).populate('category');
        if (!offer) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, offer });
    } catch (error) {
        console.error("Edit Offer Error:", error);
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

        let pipeline = [];

        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: radius * 1000,
                    distanceMultiplier: 0.001
                }
            });
        }

        pipeline.push({
            $match: {
                endDate: { $gte: now, $lte: tomorrow },
                status: { $ne: 'draft' }
            }
        });

        pipeline.push({ $sort: { endDate: 1 } });
        pipeline.push({ $limit: 10 });

        // Join User and Category
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

        pipeline.push({
            $project: {
                'vendorId.password': 0,
                'vendorId.otp': 0,
                'vendorId.loginDevices': 0
            }
        });

        const offers = await Offer.aggregate(pipeline);

        // Notify Logic
        if (req.user && req.user.userId && offers.length > 0) {
            const userId = req.user.userId;
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            const veryUrgent = offers.filter(o => new Date(o.endDate) <= twoHoursLater);

            const Notification = require('../models/Notification');

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
        console.error("Get Expiring Offers Error:", error);
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
        if (existing) return res.json({ success: true, created: false });

        let pipeline = [];
        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: 15 * 1000,
                    distanceMultiplier: 0.001
                }
            });
        }
        pipeline.push({ $match: { endDate: { $gte: new Date() }, status: { $ne: 'draft' } } });
        pipeline.push({ $sort: { visits: -1 } });
        pipeline.push({ $limit: 1 });
        pipeline.push({ $lookup: { from: 'users', localField: 'vendorId', foreignField: '_id', as: 'vendorId' } });
        pipeline.push({ $unwind: '$vendorId' });

        const offers = await Offer.aggregate(pipeline);

        if (offers.length > 0) {
            const best = offers[0];
            await Notification.create({ userId, title, body: `Trending deal at ${best.vendorId.storeName}! Grab it now.` });
            return res.json({ success: true, created: true, offer: best });
        }
        res.json({ success: true, created: false });
    } catch (error) { 
        console.error("Sync Hot Deals Error:", error);
        res.status(500).json({ success: false }); 
    }
};

const syncTrendingDeals = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!req.user?.userId) return res.json({ success: true });
        const userId = req.user.userId;
        const title = "Trending Deals near you 15km";
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const existing = await Notification.findOne({ userId, title, createdAt: { $gte: startOfToday } });
        if (existing) return res.json({ success: true, created: false });

        let query = { endDate: { $gte: new Date() }, status: { $ne: 'draft' } };
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: 15 * 1000
                }
            };
        }

        const count = await Offer.countDocuments(query);

        if (count > 0) {
            await Notification.create({ userId, title, body: `Morning! You have ${count} trending deals near you.` });
            return res.json({ success: true, created: true, count });
        }
        res.json({ success: true, created: false });
    } catch (error) { 
        console.error("Sync Trending Deals Error:", error);
        res.status(500).json({ success: false }); 
    }
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
        if (existing) return res.json({ success: true, created: false });

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let query = { createdAt: { $gte: yesterday }, status: { $ne: 'draft' } };
        
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: 15 * 1000
                }
            };
        }

        const newCount = await Offer.countDocuments(query);

        if (newCount > 0) {
            await Notification.create({
                userId,
                title,
                body: `Exciting! ${newCount} fresh deals were added near you in the last 24 hours. Check them out!`,
            });
            console.log(`[SyncNew] Created morning new-deals alert for ${userId}`);
            return res.json({ success: true, created: true, count: newCount });
        }
        res.json({ success: true, created: false });
    } catch (error) { 
        console.error("Sync New Offers Error:", error);
        res.status(500).json({ success: false }); 
    }
};

const getHomeInit = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const userId = req.user?.userId;

        const [categories, unreadRes] = await Promise.all([
            Category.find({ isActive: true }).lean(),
            userId ? Notification.countDocuments({ userId, isRead: false }) : Promise.resolve(0)
        ]);

        res.json({
            success: true,
            categories,
            unreadCount: unreadRes || 0
        });
    } catch (error) {
        console.error("Home Init Error:", error);
        res.status(500).json({ success: false });
    }
};

const getSyncAll = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!req.user?.userId) return res.json({ success: true });
        const userId = req.user.userId;

        const results = await Promise.allSettled([
            // Use internal logic or call individual existing sync functions if modified to return
            // For now, let's just run them as they are but return a combined status
            // Note: Each might already create notifications
            syncHotDeals(req, { json: (d) => d }),
            syncTrendingDeals(req, { json: (d) => d }),
            syncNewOffers(req, { json: (d) => d }),
            syncRecommendedDeals(req, { json: (d) => d })
        ]);

        res.json({
            success: true,
            syncResults: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
        });
    } catch (error) {
        console.error("Sync All Error:", error);
        res.status(500).json({ success: false });
    }
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
    syncNewOffers,
    getHomeInit,
    getSyncAll
};
