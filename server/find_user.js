const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    console.log('Connected to DB');
    const u = await User.findOne({ mobile: '9913043130' });
    if (u) {
        console.log(`User found: ${u.name}, ID: ${u._id}`);
    } else {
        console.log('User not found');
    }
    process.exit(0);
}
check().catch(console.error);
