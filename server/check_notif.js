const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/Notification');

async function check() {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    console.log('Connected to DB');
    const uId = '69b51ae2d3f8398c94478b55';
    const count = await Notification.countDocuments({ userId: uId, isRead: false });
    console.log(`Unread count for user ${uId}: ${count}`);
    const lastNotif = await Notification.findOne({ userId: uId }).sort({ createdAt: -1 });
    console.log('Last notification:', JSON.stringify(lastNotif, null, 2));
    process.exit(0);
}
check().catch(err => {
    console.error('ERROR in script:', err);
    process.exit(1);
});
