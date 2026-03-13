const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ role: { $in: ['admin', 'super_admin'] } });
        console.log('Admins found:', JSON.stringify(users.map(u => ({ id: u._id, name: u.name, role: u.role, mobile: u.mobile })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
