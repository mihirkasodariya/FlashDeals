const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    }
}, { timestamps: true });

// Ensure a user can only wishlist a specific offer once
wishlistSchema.index({ user: 1, offer: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
