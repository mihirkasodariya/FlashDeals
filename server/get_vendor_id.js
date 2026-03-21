const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Offer = require('./models/Offer');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const o = await Offer.findOne({ title: 'Test' });
    if (o) console.log(`Vendor ID: ${o.vendorId}`);
    process.exit(0);
}
check().catch(console.error);
