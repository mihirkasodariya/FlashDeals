const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: { type: String, enum: ['user', 'vendor'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    // Vendor specific fields
    storeName: { type: String },
    storeAddress: { type: String },
    storeImage: { type: String },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    },
    idType: { type: String, enum: ['GSTIN', 'Aadhaar'] },
    idNumber: { type: String },
    idDocument: { type: String },
    status: {
        type: String,
        enum: ['submitted', 'under_review', 'approved', 'rejected'],
        default: 'submitted'
    },
    loginDevices: [{
        deviceInfo: { type: String },
        os: { type: String },
        ip: { type: String },
        location: { type: String },
        lastLogin: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
