const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_flashdeals';


const app = express();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const User = require('./models/User');
const Offer = require('./models/Offer');

// Specialized Multer for Offers
const offerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/offers';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'offer-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadOffer = multer({ storage: offerStorage });

// Helper for Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flashdeals')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('FlashDeals API is running...');
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ mobile, password });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ success: true, message: 'Login successful', user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Current User Profile API
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});


app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, mobile, password, role = 'user' } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Mobile number already registered' });
        }

        const user = new User({ name, mobile, password, role });
        await user.save();

        res.json({ success: true, message: 'Registration successful. OTP sent.', mobile: user.mobile, userId: user._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { otp, userId } = req.body;
        console.log(`Verify OTP request: user=${userId}, otp=${otp}`);

        if (otp === '123456') {
            const user = await User.findById(userId);
            if (!user) {
                console.log('User not found');
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            user.isVerified = true;
            await user.save();
            console.log(`User ${userId} verified successfully`);

            res.json({ success: true, message: 'OTP Verified successfully' });
        } else {
            console.log('Invalid OTP');
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/vendor/complete-registration', upload.single('idDocument'), async (req, res) => {
    try {
        console.log("--- COMPLETE REGISTRATION REQUEST ---");
        console.log("Body:", req.body);
        console.log("File:", req.file);

        if (!req.body || Object.keys(req.body).length === 0) {
            console.log("Error: Body is empty or undefined");
            return res.status(400).json({ success: false, message: 'Request body is empty or not parsed correctly' });
        }

        const { userId, storeName, storeAddress, location, idType, idNumber } = req.body;

        if (!userId) {
            console.log("Error: userId is missing in req.body");
            return res.status(400).json({ success: false, message: 'userId is required' });
        }

        let updateData = {
            storeName,
            storeAddress,
            idType,
            idNumber,
            status: 'submitted'
        };

        if (location) {
            try {
                updateData.location = JSON.parse(location);
            } catch (e) {
                updateData.location = {};
            }
        }

        if (req.file) {
            updateData.idDocument = `/public/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Vendor registration submitted for review' });
    } catch (error) {
        console.error("Complete Registration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/vendor/update/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { storeName, storeAddress, location } = req.body;

        // Verify Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Security check: Ensure user is updating their own profile
        if (decoded.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        console.log("!!! ATTEMPTING VENDOR UPDATE FOR ID:", userId, "!!!");

        const user = await User.findByIdAndUpdate(
            userId,
            { storeName, storeAddress, location },
            { new: true }
        );

        if (!user) {
            console.log("!!! VENDOR NOT FOUND IN DB !!!");
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        console.log("!!! VENDOR UPDATED SUCCESSFULLY !!!");
        res.json({ success: true, message: 'Store details updated successfully', user });
    } catch (error) {
        console.error("!!! UPDATE ERROR:", error, "!!!");
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- OFFER ROUTES ---

// Add Offer (Vendor Only)
app.post('/api/offers/add', authenticateToken, uploadOffer.single('image'), async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({ success: false, message: 'Only vendors can add offers' });
        }

        const { title, description, category, startDate, endDate } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Offer image is required' });
        }

        const offer = new Offer({
            vendorId: req.user.userId,
            title,
            description,
            category,
            image: `/public/offers/${req.file.filename}`,
            startDate,
            endDate
        });

        await offer.save();
        res.json({ success: true, message: 'Offer added successfully', offer });
    } catch (error) {
        console.error("Add Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Offers (Public)
app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find().populate('vendorId', 'storeName name location profileImage').sort({ createdAt: -1 });
        res.json({ success: true, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// 404 Handler - Return JSON instead of HTML
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} Not Found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("!!! SERVER ERROR:", err, "!!!");
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} [VERSION 2.2 - MULTER FIX]`);
});
