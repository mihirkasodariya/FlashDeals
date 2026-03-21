const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const users = await User.find({ role: 'user' }).limit(5);
    users.forEach(u => console.log(`User: ${u.name}, ID: ${u._id}, Mobile: ${u.mobile}`));
    process.exit(0);
}
check().catch(console.error);
