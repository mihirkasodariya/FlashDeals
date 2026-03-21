const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    await User.updateOne({ _id: '69b51ae2d3f8398c94478b55' }, {
        $set: {
            'location.latitude': 21.218,
            'location.longitude': 72.824,
            'location.address': 'Surat, Gujarat'
        }
    });
    console.log('Vendor moved to Surat.');
    process.exit(0);
}
fix().catch(console.error);
