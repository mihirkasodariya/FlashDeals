const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
} else {
    console.error('❌ Firebase Service Account Key not found at server/config/serviceAccountKey.json');
    console.error('Push notifications will not work until this file is provided.');
}

module.exports = admin;
