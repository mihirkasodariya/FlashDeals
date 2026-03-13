const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Offer = require('../models/Offer');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { uploadOffer } = require('../middleware/uploadMiddleware');

router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user', isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Admin Management (Super Admin Only or with manage_admins permission)
router.get('/admins', authenticateToken, isAdmin, async (req, res) => {
    try {
        const admins = await User.find({ 
            role: 'admin', 
            isDeleted: { $ne: true } 
        }).sort({ createdAt: -1 });
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch admins' });
    }
});

router.post('/user', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, mobile, password, role } = req.body;

        const existing = await User.findOne({ mobile });
        if (existing) return res.status(400).json({ success: false, message: 'Mobile already registered' });

        // Logic to restrict administrative role creation to super_admin
        const creator = await User.findById(req.user.userId);
        if (role === 'admin' || role === 'super_admin') {
            if (creator.role !== 'super_admin') {
                return res.status(403).json({ success: false, message: 'Only super_admin can create administrative roles' });
            }
        }

        const user = new User({
            name,
            mobile,
            password,
            role: role || 'user',
            isVerified: true
        });
        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// Create Vendor Manually
router.post('/vendor', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, mobile, password, storeName, storeAddress } = req.body;
        const existing = await User.findOne({ mobile });
        if (existing) return res.status(400).json({ success: false, message: 'Mobile already registered' });

        const vendor = new User({
            name,
            mobile,
            password,
            role: 'vendor',
            storeName,
            storeAddress,
            isVerified: true,
            status: 'approved'
        });
        await vendor.save();
        res.json({ success: true, vendor });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create vendor' });
    }
});

// Get All Vendors with Offer Counts
router.get('/vendors', authenticateToken, isAdmin, async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor', isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
        const now = new Date();

        const vendorsWithCounts = await Promise.all(vendors.map(async (vendor) => {
            const offers = await Offer.find({ vendorId: vendor._id });

            const counts = {
                active: 0,
                upcoming: 0,
                expired: 0
            };

            offers.forEach(offer => {
                const start = new Date(offer.startDate);
                const end = new Date(offer.endDate);

                if (now >= start && now <= end) {
                    counts.active++;
                } else if (now < start) {
                    counts.upcoming++;
                } else {
                    counts.expired++;
                }
            });

            return { ...vendor, offerCounts: counts };
        }));

        res.json({ success: true, vendors: vendorsWithCounts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
    }
});

// Get Single Vendor and their Offers
router.get('/vendor/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const vendor = await User.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found or deleted' });
        const offers = await Offer.find({ vendorId: req.params.id }).sort({ createdAt: -1 });
        res.json({ success: true, vendor, offers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendor details' });
    }
});

// Update User/Vendor Status (e.g., approved, rejected)
router.put('/status/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

// Delete Offer (Admin override)
router.delete('/offer/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Offer deleted by administrator' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete offer' });
    }
});

// Get All Offers (Admin override - including expired)
router.get('/offers', authenticateToken, isAdmin, async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate('vendorId', 'storeName name')
            .sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch offers' });
    }
});

// Edit Offer (Admin override)
router.put('/offer/:id', authenticateToken, isAdmin, uploadOffer.single('image'), async (req, res) => {
    try {
        const { title, description, category, startDate, endDate } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (startDate) updateData.startDate = startDate;
        if (endDate) updateData.endDate = endDate;
        if (req.file) {
            updateData.image = `/public/offers/${req.file.filename}`;
        }

        const offer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

        res.json({ success: true, message: 'Offer updated by administrator', offer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update offer' });
    }
});

// Add Offer for Vendor (Admin side)
router.post('/vendor/:vendorId/offer', authenticateToken, isAdmin, uploadOffer.single('image'), async (req, res) => {
    try {
        const { title, description, category, startDate, endDate } = req.body;
        const { vendorId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Offer image is required' });
        }

        const offer = new Offer({
            vendorId,
            title,
            description,
            category,
            image: `/public/offers/${req.file.filename}`,
            startDate,
            endDate
        });

        await offer.save();
        res.json({ success: true, message: 'Offer created by administrator', offer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create offer' });
    }
});

// Soft Delete Vendor
router.delete('/vendor/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ success: true, message: 'Merchant account terminated and archived.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to terminate account.' });
    }
});

// Soft Delete User
router.delete('/user/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ success: true, message: 'User account terminated and archived.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to terminate user account.' });
    }
});

// Update User/Vendor (Edit Profile)
router.put('/user/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, mobile, password, role, storeName, storeAddress } = req.body;
        const updateData = { name, mobile };

        if (password) updateData.password = password;
        if (storeName !== undefined) updateData.storeName = storeName;
        if (storeAddress !== undefined) updateData.storeAddress = storeAddress;
        if (role) updateData.role = role;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// Get Dashboard Stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user', isDeleted: { $ne: true } });
        const totalVendors = await User.countDocuments({ role: 'vendor', isDeleted: { $ne: true } });
        const totalOffers = await Offer.countDocuments();

        const recentOffers = await Offer.find()
            .populate('vendorId', 'storeName')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentUsers = await User.find({ isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(5);

        const topImpressionOffers = await Offer.find()
            .populate('vendorId', 'storeName')
            .sort({ impressions: -1 })
            .limit(5);

        const topVisitOffers = await Offer.find()
            .populate('vendorId', 'storeName')
            .sort({ visits: -1 })
            .limit(5);

        // Monthly Registrations Analytics (Last 6 months)
        const { range = '6m' } = req.query;
        let startDate = new Date();
        let groupFormat = {};

        switch (range) {
            case '1d':
                startDate.setHours(startDate.getHours() - 24);
                groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" }, hour: { $hour: "$createdAt" } };
                break;
            case '1w':
                startDate.setDate(startDate.getDate() - 7);
                groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
                break;
            case '1m':
                startDate.setMonth(startDate.getMonth() - 1);
                groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
                break;
            case '3m':
                startDate.setMonth(startDate.getMonth() - 3);
                groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
                break;
            case '6m':
            default:
                startDate.setMonth(startDate.getMonth() - 6);
                groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
                break;
        }

        const monthlyStats = await User.aggregate([
            {
                $match: {
                    createdAt: { $exists: true, $gte: startDate },
                    isDeleted: { $ne: true }
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
        ]);

        console.log(`[Dashboard Stats] Range: ${range} | Group: ${JSON.stringify(groupFormat)} | Stats Count: ${monthlyStats.length}`);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalVendors,
                totalOffers,
                recentOffers,
                recentUsers,
                topImpressionOffers,
                topVisitOffers,
                monthlyStats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
