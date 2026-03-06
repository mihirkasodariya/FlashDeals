require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('./models/Offer');

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://mihir:mihir@ac-swxlive-shard-00-00.jjptbos.mongodb.net/flash_deals?retryWrites=true&w=majority';

async function updateOffers() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const offers = await Offer.find({});
        console.log(`Found ${offers.length} offers to update`);

        const images = [
            '/public/offers/gourmet_pizza.png',
            '/public/offers/luxury_watch.png',
            '/public/offers/fashion_sale.png',
            '/public/offers/electronics_deal.png',
            '/public/offers/grocery_fresh.png'
        ];

        const titles = [
            "Exclusive Gourmet Pizza Deal",
            "Luxury Timepiece Discount",
            "Urban Style Fashion Week",
            "Premium Tech Accessories",
            "Fresh Farm Grocery Harvest",
            "Ultimate Dining Experience",
            "Seasonal Wardrobe Refresh",
            "Next-Gen Gadget Sale",
            "Organic produce Special",
            "Italian Pizza Night"
        ];

        const descriptions = [
            "Grab the finest gourmet pizza in town with fresh toppings and artisan crust. Limited time only!",
            "Elevate your style with our collection of premium wristwatches. Now at an unbeatable price.",
            "Upgrade your wardrobe with the latest urban trends. High-quality fabrics and modern designs.",
            "Top-tier electronics and accessories for your daily tech needs. Performance guaranteed.",
            "Get the freshest organic vegetables and fruits delivered straight from the farm to your table.",
            "Experience luxury dining like never before with our exclusive chef-curated menu.",
            "Refresh your seasonal look with our new arrivals. Quality meets style in every piece.",
            "Stay ahead with the latest in tech. Sleek designs and powerful functionality.",
            "Healthy living starts with fresh produce. Shop our premium range of organic goods.",
            "Authentic Italian flavors at your doorstep. Freshly baked and ready to serve."
        ];

        const startDate = new Date('2026-03-06T00:00:00Z');
        const endDate = new Date('2026-04-07T23:59:59Z');

        for (let i = 0; i < offers.length; i++) {
            const offer = offers[i];
            const imgIndex = i % images.length;
            const textIndex = i % titles.length;

            offer.title = titles[textIndex];
            offer.description = descriptions[textIndex];
            offer.image = images[imgIndex];
            offer.startDate = startDate;
            offer.endDate = endDate;
            offer.category = ['food', 'fashion', 'electronics', 'grocery'][imgIndex % 4] || 'other';

            await offer.save();
            console.log(`Updated offer ${i + 1}: ${offer.title}`);
        }

        console.log('All offers updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating offers:', error);
        process.exit(1);
    }
}

updateOffers();
