import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Initialize Firebase only for native if not already initialized
if (Platform.OS !== 'web') {
    const firebase = require('@react-native-firebase/app').default;
    if (!firebase.apps.length) {
        try {
            firebase.initializeApp();
        } catch (e) {
            console.log('Firebase Init Error:', e);
        }
    }
}

registerRootComponent(App);
