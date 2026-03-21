const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/Notification');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const notifs = await Notification.find({ userId: '69bcd2f95e44bf99365ddc32' }).sort({ createdAt: -1 });
    console.log(`Found ${notifs.length} notifications`);
    notifs.forEach(n => console.log(`- [${n.createdAt.toISOString()}] ${n.title}`));
    process.exit(0);
}
check().catch(console.error);
