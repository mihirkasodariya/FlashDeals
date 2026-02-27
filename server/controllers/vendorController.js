const User = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_flashdeals';

const completeRegistration = async (req, res) => {
    try {
        const { userId, storeName, storeAddress, location, idType, idNumber } = req.body;

        let updateData = {
            storeName,
            storeAddress,
            idType,
            idNumber,
            status: 'under_review'
        };

        if (location) {
            try {
                updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
            } catch (e) {
                console.log("Location parse error", e);
            }
        }

        if (req.file) {
            updateData.idDocument = `/public/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Vendor registration submitted for review' });
    } catch (error) {
        console.error("Complete Registration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        const { userId } = req.params;

        // Security check: Ensure user is updating their own profile
        if (req.user.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own profile' });
        }

        const { storeName, storeAddress, location } = req.body || {};

        let updateData = {};
        if (storeName) updateData.storeName = storeName;
        if (storeAddress) updateData.storeAddress = storeAddress;

        if (location) {
            try {
                updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
            } catch (e) {
                console.log("Location parse error", e);
            }
        }

        if (req.file) {
            updateData.storeImage = `/public/storelogo/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({ success: true, message: 'Store details updated successfully', user });
    } catch (error) {
        console.error("Update Vendor Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    completeRegistration,
    updateVendor
};
