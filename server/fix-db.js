const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flashdeals';

async function fixIndexes() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const usersCollectionExists = collections.some(c => c.name === 'users');

        if (usersCollectionExists) {
            const users = mongoose.connection.db.collection('users');
            console.log('Dropping problematic phone_1 index...');
            try {
                await users.dropIndex('phone_1');
                console.log('Successfully dropped phone_1 index');
            } catch (e) {
                console.log('Index phone_1 not found or already dropped');
            }
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixIndexes();
