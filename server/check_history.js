const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/Notification');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    console.log('Connected to DB');
    const userId = '69b51ae2d3f8398c94478b55'; // The ID we saw earlier
    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    console.log(`Found ${notifs.length} notifications for user.`);
    notifs.forEach(n => {
        console.log(`- [${n.createdAt.toISOString()}] ${n.title}`);
    });
    process.exit(0);
}
check().catch(console.error);
