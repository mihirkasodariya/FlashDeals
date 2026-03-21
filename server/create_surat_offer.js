const mongoose = require('mongoose');
require('dotenv').config();
const Offer = require('./models/Offer');
const Category = require('./models/Category');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/offerz');
    const cat = await Category.findOne({});
    const now = new Date();
    const endingSoon = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12h later
    
    await Offer.create({
        vendorId: '69b51ae2d3f8398c94478b55', // SURAT VENDOR
        title: 'Surat Expiring Deal',
        description: 'Only 12 hours left!',
        category: cat._id,
        image: '/public/offers/sample.jpg',
        startDate: new Date(),
        endDate: endingSoon,
        status: 'active'
    });
    console.log('Surat expiring offer created.');
    process.exit(0);
}
fix().catch(console.error);
