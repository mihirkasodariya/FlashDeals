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
        const { lat, lng, radius } = req.query;
        const now = new Date();
        let offers = await Offer.find({
            endDate: { $gte: now }
        }).populate('vendorId', 'storeName name location profileImage storeImage storeAddress').sort({ createdAt: -1 }).lean();

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
        console.log(offers);

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

const incrementOfferVisits = async (req, res) => {
    try {
        const { offerId } = req.params;
        await Offer.findByIdAndUpdate(offerId, { $inc: { visits: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addOffer,
    getOffers,
    getVendorOffers,
    incrementOfferVisits
};
