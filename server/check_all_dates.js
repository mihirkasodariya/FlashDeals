const mongoose = require('mongoose');
require('dotenv').config();
const Offer = require('./models/Offer');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const offers = await Offer.find({}).sort({ endDate: 1 });
    console.log(`Found ${offers.length} offers total.`);
    offers.forEach(o => console.log(`- ${o.title}: ${o.endDate.toISOString()} (Status: ${o.status})`));
    process.exit(0);
}
check().catch(console.error);
