const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'scheduled'], default: 'active' },
    // You might want to add more fields like discount, stock, etc. later
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
