const Offer = require('../models/Offer');

const addOffer = async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ success: false, message: 'Only vendors can add offers' });
        }

        const { title, description, category, startDate, endDate } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Offer image is required' });
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
        res.json({ success: true, message: 'Offer added successfully', offer });
    } catch (error) {
        console.error("Add Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOffers = async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.find({
            endDate: { $gte: now }
        }).populate('vendorId', 'storeName name location profileImage storeImage storeAddress').sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getVendorOffers = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const now = new Date();
        const offers = await Offer.find({
            vendorId,
            endDate: { $gte: now }
        }).populate('vendorId', 'storeName name location profileImage storeImage storeAddress').sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addOffer,
    getOffers,
    getVendorOffers
};
