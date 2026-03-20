const mongoose = require('mongoose');
require('dotenv').config();

const clearTokens = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const result = await User.updateMany({}, { $set: { fcmToken: null } });
        console.log(`✅ Tokens cleared. Modified ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing tokens:', err);
        process.exit(1);
    }
};

clearTokens();
