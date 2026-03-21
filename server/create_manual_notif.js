const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('./models/Notification');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    await Notification.create({
        userId: '69bcd2f95e44bf99365ddc32', // JIGNESH
        title: 'Only 24 hours left for this offer!',
        body: 'You have 3 amazing deals ending soon near you. Click to view them!',
    });
    console.log('Manual notification created for jignesh.');
    process.exit(0);
}
fix().catch(console.error);
