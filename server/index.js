const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const offerRoutes = require('./routes/offerRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// 1. Connect to Database
connectDB();

// 2. Initial Logging
app.use((req, res, next) => {
    console.log(`>>> [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 3. CORS and Body Parsers (Must come before security sandbox)
const corsOptions = {
    origin: process.env.CLIENT_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Security Sandbox (Runs after body parser to clean the data)
app.use(helmet()); // Set security HTTP headers
app.use((req, res, next) => {
    const cleanObject = (obj) => {
        if (obj && typeof obj === 'object' && !Buffer.isBuffer(obj)) {
            Object.keys(obj).forEach(key => {
                const value = obj[key];

                // NoSQL Protection: Remove keys starting with $
                if (key.startsWith('$')) {
                    delete obj[key];
                    return;
                }

                if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
                    cleanObject(value);
                } else if (typeof value === 'string') {
                    // XSS Protection: Sanitize strings
                    obj[key] = xss(value);
                }
            });
        }
    };

    if (req.body) cleanObject(req.body);
    if (req.params) cleanObject(req.params);
    if (req.query) cleanObject(req.query);
    next();
});
app.use(hpp()); // Prevent Parameter Pollution

// 5. Rate Limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     message: { success: false, message: 'Too many requests from this IP, please try again later.' }
// });
// app.use('/api/', limiter);

// 6. Static Files
app.use('/public', express.static(path.join(__dirname, 'public')));

// 7. Routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/share/offer/:id', (req, res) => {
    const offerId = req.params.id;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.mihirkasodariya.Offerz';
    const appStoreUrl = 'https://apps.apple.com/app/offerz/id123456789';
    const appSchemeUrl = `offerz://offer/${offerId}`;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Offerz - View Offer</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; }
                .container { padding: 2rem; }
                .loader { border: 3px solid #f3f3f3; border-top: 3px solid #f43f5e; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                p { color: #64748b; }
            </style>
            <script>
                window.onload = function() {
                    const isAndroid = /Android/i.test(navigator.userAgent);
                    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    window.location.href = "${appSchemeUrl}";
                    setTimeout(function() {
                        if (isAndroid) window.location.href = "${playStoreUrl}";
                        else if (isiOS) window.location.href = "${appStoreUrl}";
                        else window.location.href = "/";
                    }, 2500);
                };
            </script>
        </head>
        <body>
            <div class="container">
                <div class="loader"></div>
                <h1>Opening Offerz...</h1>
                <p>We're taking you to the offer details.</p>
            </div>
        </body>
        </html>
    `);
});

// 8. 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} Not Found` });
});

// 9. Global Error Handler
app.use((err, req, res, next) => {
    console.error("!!! SERVER ERROR:", err, "!!!");
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} [SECURE CONFIG]`);
});
