const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const offerRoutes = require('./routes/offerRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/share/offer/:id', (req, res) => {
    const offerId = req.params.id;

    // Replace these with your actual Store URLs
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.flashdeals.app';
    const appStoreUrl = 'https://apps.apple.com/app/flashdeals/id123456789';
    const appSchemeUrl = `flashdeals://offer/${offerId}`;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>FlashDeals - View Offer</title>
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
                    
                    // Try to open the app
                    window.location.href = "${appSchemeUrl}";
                    
                    // Fallback to store after 2 seconds if app doesn't open
                    setTimeout(function() {
                        if (isAndroid) {
                            window.location.href = "${playStoreUrl}";
                        } else if (isiOS) {
                            window.location.href = "${appStoreUrl}";
                        } else {
                            window.location.href = "/";
                        }
                    }, 2500);
                };
            </script>
        </head>
        <body>
            <div class="container">
                <div class="loader"></div>
                <h1>Opening FlashDeals...</h1>
                <p>We're taking you to the offer details.</p>
            </div>
        </body>
        </html>
    `);
});

// 404 Handler
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
    console.log(`🚀 Server running on port ${PORT} [MVC STRUCTURE]`);
});
