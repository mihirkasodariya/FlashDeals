const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_flashdeals';

const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        // Check if device is still active in database
        if (decoded.deviceId) {
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ success: false, message: 'User no longer exists' });
            }

            const device = user.loginDevices.find(d => d._id.toString() === decoded.deviceId);
            if (!device || !device.isActive) {
                return res.status(401).json({ success: false, message: 'Session expired or device logged out' });
            }
        }

        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = { authenticateToken };
