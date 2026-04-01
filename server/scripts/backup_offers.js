const mongoose = require('mongoose');
require('dotenv').config();

const backupOffers = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flashdeals');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'offers_old' }).toArray();
        
        if (collections.length > 0) {
            console.log('Dropping existing "offers_old" collection...');
            await db.collection('offers_old').drop();
        }

        console.log('Copying "offers" to "offers_old"...');
        const offers = await db.collection('offers').find().toArray();
        
        if (offers.length > 0) {
            await db.collection('offers_old').insertMany(offers);
            console.log(`Successfully backed up ${offers.length} offers to "offers_old".`);
        } else {
            console.log('No offers found to back up.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
};

backupOffers();
