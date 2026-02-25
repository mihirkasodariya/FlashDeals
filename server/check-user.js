const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flashdeals')
    .then(async () => {
        const user = await User.findOne({ mobile: '9876543210' });
        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User not found');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
