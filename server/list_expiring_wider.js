const mongoose = require('mongoose');
require('dotenv').config();
const Offer = require('./models/Offer');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const now = new Date();
    const rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const rangeEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const offers = await Offer.find({
        endDate: { $gte: rangeStart, $lte: rangeEnd }
    });
    console.log(`Found ${offers.length} offers ending in +/- 24h.`);
    offers.forEach(o => console.log(`- ${o.title} (Status: ${o.status}) (Ends: ${o.endDate.toISOString()})`));
    process.exit(0);
}
check().catch(console.error);
