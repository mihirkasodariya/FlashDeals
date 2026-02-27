const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['General', 'Technical', 'Billing', 'Store Verification', 'Others'],
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In Review', 'Resolved', 'Closed'],
        default: 'Open'
    },
    ticketId: {
        type: String,
        unique: true,
        required: true
    },
    attachment: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
