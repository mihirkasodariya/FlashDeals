const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_flashdeals';

const login = async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ mobile, password });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid mobile or password' });
        }

        // Create a unique ID for this login session
        const deviceId = new mongoose.Types.ObjectId();

        const token = jwt.sign(
            { userId: user._id, role: user.role, isVerified: user.isVerified, deviceId: deviceId },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Record Login Device
        const { deviceInfo, os } = req.body;

        user.loginDevices.push({
            _id: deviceId,
            deviceInfo: deviceInfo || 'Unknown Device',
            os: os || 'Unknown OS',
            lastLogin: new Date(),
            isActive: true
        });

        // Keep only last 10 devices
        if (user.loginDevices.length > 10) {
            user.loginDevices.shift();
        }

        await user.save();

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                isVerified: user.isVerified,
                profileImage: user.profileImage,
                storeName: user.storeName,
                storeAddress: user.storeAddress,
                storeImage: user.storeImage,
                location: user.location
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const register = async (req, res) => {
    try {
        const { name, mobile, password, role } = req.body;

        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Mobile number already registered' });
        }

        const user = new User({
            name,
            mobile,
            password,
            role: role || 'user',
            profileImage: req.file ? `/public/uploads/${req.file.filename}` : null
        });

        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully', userId: user._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                _id: user._id, // Keep both for compatibility
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                isVerified: user.isVerified,
                profileImage: user.profileImage,
                storeName: user.storeName,
                storeAddress: user.storeAddress,
                storeImage: user.storeImage,
                location: user.location
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        let updateData = { name };

        if (req.file) {
            updateData.profileImage = `/public/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        // Demo OTP check
        if (otp === '123456') {
            const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { returnDocument: 'after' });
            return res.json({ success: true, message: 'OTP verified successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.password !== currentPassword) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLoginHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('loginDevices');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, devices: user.loginDevices.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const logoutDevice = async (req, res) => {
    try {
        const { deviceId } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Remove the device from history (this will invalidate the token)
        user.loginDevices = user.loginDevices.filter(d => d._id.toString() !== deviceId);
        await user.save();

        res.json({ success: true, message: 'Device logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    login,
    register,
    getMe,
    updateProfile,
    verifyOTP,
    changePassword,
    getLoginHistory,
    logoutDevice
};
