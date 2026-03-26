const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
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
    }],
    isDeleted: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    fcmToken: { type: String }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
