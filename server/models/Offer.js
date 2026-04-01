const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'expired', 'scheduled', 'draft'], default: 'active' },
    visits: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [longitude, latitude]
    }
}, { timestamps: true });

offerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Offer', offerSchema);
