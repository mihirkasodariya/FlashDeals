const mongoose = require('mongoose');
require('dotenv').config();

const checkTokens = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select('name fcmToken');
        console.log(`Found ${users.length} users with FCM tokens.`);
        users.forEach(u => {
            const type = u.fcmToken.startsWith('ExponentPushToken') ? 'EXPO' : 'FCM';
            console.log(`- ${u.name} [${type}]: ${u.fcmToken}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTokens();
