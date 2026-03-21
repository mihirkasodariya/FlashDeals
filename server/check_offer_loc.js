const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Offer = require('./models/Offer');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    console.log('Connected to DB');
    const o = await Offer.findOne({ title: 'Test' }).populate('vendorId');
    if (o) {
        console.log(`Offer: ${o.title}`);
        console.log(`Vendor Location:`, JSON.stringify(o.vendorId.location));
    } else {
        console.log('No Test offer found');
    }
    process.exit(0);
}
check().catch(console.error);
