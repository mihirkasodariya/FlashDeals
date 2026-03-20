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
            // Get Expo Push Token (works in Expo Go and Standalone)
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId
            });
            token = tokenData.data;
            console.log('✅ Token gathered:', token);
        } catch (e) {
            console.log('Error getting Expo push token: ', e);
            try {
                // Fallback to device token
                const deviceToken = await Notifications.getDevicePushTokenAsync();
                token = deviceToken.data;
            } catch (err) {
                token = 'demo-token-simulator';
            }
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

export async function syncFCMToken(apiBaseUrl) {
    console.log('[Sync] Starting FCM token sync...');
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            console.log('[Sync] No userToken found in AsyncStorage, skipping sync.');
            return;
        }

        const fcmToken = await registerForPushNotificationsAsync();
        console.log('[Sync] Token gathered from device:', fcmToken);

        if (fcmToken && typeof fcmToken === 'string' && fcmToken !== 'demo-token-simulator') {
            const isAPNsRaw = /^[0-9a-fA-F]{64}$/.test(fcmToken);
            if (isAPNsRaw) {
                console.warn('⚠️ [Sync] Raw APNs token detected instead of Expo token. Notifications won\'t work in Expo Go. Please ensure projectId is correct in app.json.');
                return;
            }

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
                console.log('✅ FCM Token synced with server successfully');
            } else {
                console.error('❌ Server failed to update token:', data.message);
            }
        } else {
            console.log('[Sync] No valid token to sync (mock or null).');
        }
    } catch (error) {
        console.log('❌ Error during FCM token sync:', error);
    }
}
