const mongoose = require('mongoose');
const Category = require('../models/Category'); // Corrected path
require('dotenv').config();

const categories = [
    { name: 'Groceries', image: '/public/categories/cat_groceries.png' },
    { name: 'Electronics', image: '/public/categories/cat_electronics.png' },
    { name: 'Fashion & Lifestyle', image: '/public/categories/cat_fashion.png' },
    { name: 'Footwear', image: '/public/categories/cat_footwear.png' },
    { name: 'Home Appliances', image: '/public/categories/cat_appliances.png' },
    { name: 'Beauty & Personal Care', image: '/public/categories/cat_beauty_care.png' },
    { name: 'Sports & Fitness', image: '/public/categories/cat_fitness.png' },
    { name: 'Automotive Accessories', image: '/public/categories/cat_auto_accs.png' },
    { name: 'Kids & Toys', image: '/public/categories/cat_kids_toys.png' },
    { name: 'Books & Stationary', image: '/public/categories/cat_books_stationary.png' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const cat of categories) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create(cat);
                console.log(`Added category: ${cat.name}`);
            } else {
                console.log(`Category already exists: ${cat.name}`);
            }
        }

        console.log('Finished seeding categories');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
