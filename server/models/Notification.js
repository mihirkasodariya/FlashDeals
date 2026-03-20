const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    // imageUrl: {
    //     type: String
    // },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '24h' } // Automatically delete after 24 hours as requested
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
