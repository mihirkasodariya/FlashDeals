const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Notification = require('./models/Notification');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    console.log('Connected to DB');
    const users = await User.find({}).select('name mobile');
    for (const u of users) {
        const count = await Notification.countDocuments({ userId: u._id, isRead: false });
        if (count > 0) {
            console.log(`User: ${u.name} (${u.mobile}) | ID: ${u._id} | Unread: ${count}`);
        }
    }
    process.exit(0);
}
check().catch(console.error);
