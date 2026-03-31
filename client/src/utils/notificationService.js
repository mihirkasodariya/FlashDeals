import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set up default behavior for notifications when received
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        // Get the token
        try {
            if (Platform.OS === 'android') {
                // Get Native FCM Token for Android
                const deviceToken = await Notifications.getDevicePushTokenAsync();
                token = deviceToken.data;
                console.log('✅ Native FCM Token gathered:', token);
            } else {
                // Get Expo Push Token for iOS or fallback
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId
                });
                token = tokenData.data;
                console.log('✅ Expo Push Token gathered:', token);
            }
        } catch (e) {
            console.log('Error getting push token: ', e);
            token = 'demo-token-simulator';
        }
    } else {
        console.log('Must use physical device for Push Notifications');
        return 'demo-token-simulator';
    }

    return token;
}

export async function checkNotificationPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
}

export async function syncFCMToken(apiBaseUrl, manualToken = null) {
    try {
        const token = manualToken || (await AsyncStorage.getItem('userToken'));
        if (!token) {
            console.log('[Sync] No user token available for sync. Skipping.');
            return;
        }

        console.log('[Sync] Requesting fresh FCM token...');
        let fcmToken = null;
        
        // Retry logic for token fetching
        for (let i = 0; i < 2; i++) {
            try {
                fcmToken = await registerForPushNotificationsAsync();
                if (fcmToken && fcmToken !== 'demo-token-simulator') break;
            } catch (e) {
                console.log(`[Sync] Attempt ${i + 1} failed, retrying...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (!fcmToken || fcmToken === 'demo-token-simulator') {
            console.log('[Sync] Could not get valid FCM token (Permissions might be denied).');
            return;
        }

        console.log('[Sync] Syncing token with server:', fcmToken.substring(0, 10) + '...');

        const resp = await fetch(`${apiBaseUrl}/auth/update-fcm-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fcmToken })
        });
        
        const data = await resp.json();
        if (data.success) {
            console.log('✅ [Sync] FCM Token synced successfully');
        } else {
            console.error('❌ [Sync] Server rejected token:', data.message);
        }
    } catch (error) {
        console.error('❌ [Sync] Critical error in syncFCMToken:', error);
    }
}
