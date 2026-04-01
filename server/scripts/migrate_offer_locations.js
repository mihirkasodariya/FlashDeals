const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const User = require('../models/User');
require('dotenv').config();

const migrateLocations = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('Fetching all offers...');
        const offers = await Offer.find().populate('vendorId');
        console.log(`Found ${offers.length} offers.`);

        let updatedCount = 0;
        for (const offer of offers) {
            const vendor = offer.vendorId;
            if (vendor && vendor.location && vendor.location.latitude && vendor.location.longitude) {
                const lng = parseFloat(vendor.location.longitude);
                const lat = parseFloat(vendor.location.latitude);
                
                // MongoDB GeoJSON: [longitude, latitude]
                offer.location = {
                    type: 'Point',
                    coordinates: [lng, lat]
                };
                
                await offer.save();
                updatedCount++;
                console.log(`Updated offer ${offer._id} with coordinates [${lng}, ${lat}]`);
            } else {
                console.warn(`Vendor for offer ${offer._id} has no location data.`);
            }
        }

        console.log(`Migration complete. ${updatedCount} offers updated.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateLocations();
