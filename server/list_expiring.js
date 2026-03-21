const mongoose = require('mongoose');
require('dotenv').config();
const Offer = require('./models/Offer');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const offers = await Offer.find({
        endDate: { $gte: now, $lte: tomorrow }
    });
    console.log(`Found ${offers.length} expiring offers.`);
    offers.forEach(o => console.log(`- ${o.title} (Ends: ${o.endDate.toISOString()})`));
    process.exit(0);
}
check().catch(console.error);
