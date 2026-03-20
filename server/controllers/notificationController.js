const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const axios = require('axios');

exports.sendCustomNotification = async (req, res) => {
    try {
        const { title, body, audience } = req.body;

        if (!title || !body || !audience) {
            return res.status(400).json({ success: false, message: 'Title, body, and audience are required' });
        }

        let query = { isDeleted: { $ne: true }, fcmToken: { $exists: true, $ne: null } };

        if (audience === 'vendors') {
            query.role = 'vendor';
        } else if (audience === 'users' || audience === 'customers') {
            query.role = 'user';
        } else if (audience === '7d') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query.createdAt = { $gte: sevenDaysAgo };
        } else if (audience === '14d') {
            const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
            query.createdAt = { $gte: fourteenDaysAgo };
        } else if (audience === '30d') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            query.createdAt = { $gte: thirtyDaysAgo };
        }

        console.log(`[Notification] Dispatching for audience: ${audience}`);
        console.log(`[Notification] Query:`, JSON.stringify(query));

        const users = await User.find(query).select('fcmToken role name');
        
        // Filter out obviously malformed tokens (very short ones)
        const allTokens = users
            .filter(u => u.fcmToken && u.fcmToken.length > 20) // Basic length check
            .map(u => u.fcmToken);

        const invalidFound = users.length - allTokens.length;
        if (invalidFound > 0) {
            console.warn(`[Notification] Skipping ${invalidFound} users with obviously invalid/short tokens.`);
        }

        if (allTokens.length === 0) {
            console.warn(`[Notification] Abortion: No valid tokens found for audience ${audience}`);
            return res.status(404).json({ success: false, message: 'No users found in the selected category with valid push tokens' });
        }

        const expoTokens = allTokens.filter(t => t.startsWith('ExponentPushToken'));
        const rawFcmTokens = allTokens.filter(t => !t.startsWith('ExponentPushToken'));

        // Extract true FCM tokens. Skip 64-char hex strings (likely APNs tokens from missing projectId)
        const fcmTokens = rawFcmTokens.filter(t => {
            const isAPNs = /^[0-9a-fA-F]{64}$/.test(t);
            if (isAPNs) {
                console.warn(`[Notification] Skipping APNs device token: ${t.substring(0, 10)}... (Requires Expo Push Service or native FCM setup)`);
                return false;
            }
            return true;
        });

        const skippedAPNs = rawFcmTokens.length - fcmTokens.length;
        if (skippedAPNs > 0) {
            console.log(`[Notification] Filtered out ${skippedAPNs} APNs tokens from FCM dispatch.`);
        }

        console.log(`[Notification] Found ${allTokens.length} valid tokens. (Expo: ${expoTokens.length}, FCM: ${fcmTokens.length})`);

        let results = { successCount: 0, failureCount: 0, cleanedCount: 0 };

        // 1. Send via Expo Push API
        if (expoTokens.length > 0) {
            try {
                const expoMessages = expoTokens.map(token => ({
                    to: token,
                    title,
                    body,
                    sound: 'default'
                }));

                const expoResponse = await axios.post('https://exp.host/--/api/v2/push/send', expoMessages);
                const data = expoResponse.data.data;
                data.forEach(ticket => {
                    if (ticket.status === 'ok') results.successCount++;
                    else {
                        results.failureCount++;
                        // Expo specific cleanup can be added here if needed
                    }
                });
                console.log(`[Notification] Expo result: Sent to ${expoTokens.length} users.`);
            } catch (expoErr) {
                console.error('[Notification] Expo API Error:', expoErr.response?.data || expoErr.message);
                results.failureCount += expoTokens.length;
            }
        }

        // 2. Send via Firebase Admin SDK
        if (fcmTokens.length > 0 && admin.apps.length > 0) {
            try {
                const fcmMessage = {
                    notification: { title, body },
                    tokens: fcmTokens
                };
                const fcmResponse = await admin.messaging().sendEachForMulticast(fcmMessage);
                results.successCount += fcmResponse.successCount;
                results.failureCount += fcmResponse.failureCount;
                console.log(`[Notification] FCM result: Sent=${fcmResponse.successCount}, Failed=${fcmResponse.failureCount}`);

                if (fcmResponse.failureCount > 0) {
                    await Promise.all(fcmResponse.responses.map(async (resp, idx) => {
                        if (!resp.success) {
                            console.error(`[Notification] FCM Error for token ${fcmTokens[idx].substring(0, 10)}... :`, resp.error);
                            if (resp.error.code === 'messaging/invalid-argument' || 
                                resp.error.code === 'messaging/registration-token-not-registered') {
                                try {
                                    await User.updateOne({ fcmToken: fcmTokens[idx] }, { $set: { fcmToken: null } });
                                    results.cleanedCount++;
                                } catch (err) {
                                    console.error('Error cleaning up token:', err);
                                }
                            }
                        }
                    }));
                }
            } catch (fcmErr) {
                console.error('[Notification] FCM Error:', fcmErr.message);
                results.failureCount += fcmTokens.length;
            }
        } else if (fcmTokens.length > 0) {
            console.warn('[Notification] FCM tokens found but Firebase Admin is not initialized.');
            results.failureCount += fcmTokens.length;
        }

        res.json({
            success: true,
            message: `Notification dispatch complete.`,
            stats: {
                total: allTokens.length,
                success: results.successCount,
                failure: results.failureCount,
                cleaned: results.cleanedCount
            }
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
