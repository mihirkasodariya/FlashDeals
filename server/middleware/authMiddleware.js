const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET not found in environment variables!');
    process.exit(1);
}

const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch the user from the database to ensure we have the latest role and status
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        // Check if device is still active in database
        if (decoded.deviceId) {
            const device = user.loginDevices.find(d => d._id.toString() === decoded.deviceId);
            if (!device || !device.isActive) {
                return res.status(401).json({ success: false, message: 'Session expired or device logged out' });
            }
        }

        // Attach the LATEST user data from the database to req.user
        req.user = {
            userId: user._id,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified,
            deviceId: decoded.deviceId
        };

        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied: Administrative privileges required' });
        }
        req.adminUser = user;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const optionalAuthenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        next();
    }
};

module.exports = { authenticateToken, isAdmin, optionalAuthenticateToken };

