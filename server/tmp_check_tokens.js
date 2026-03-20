const mongoose = require('mongoose');
const User = require('./models/User');

async function checkTokens() {
    try {
        await mongoose.connect('mongodb://localhost:27017/offerz');
        const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select('name role fcmToken');
        console.log('--- USERS WITH TOKENS ---');
        users.forEach(u => {
            console.log(`[${u.role}] ${u.name}: ${u.fcmToken}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTokens();
