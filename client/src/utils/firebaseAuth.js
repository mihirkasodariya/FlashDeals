import { Platform } from 'react-native';

import Constants from 'expo-constants';

const getAuth = () => {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (Platform.OS === 'web' || isExpoGo) {
        const { auth } = require('../lib/firebase');
        return auth;
    } else {
        const auth = require('@react-native-firebase/auth').default;
        return auth();
    }
};

// Also export the constructor / helper for credentials
export const getPhoneCredential = (verificationId, code) => {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (Platform.OS === 'web' || isExpoGo) {
        const { PhoneAuthProvider } = require('firebase/auth');
        return PhoneAuthProvider.credential(verificationId, code);
    } else {
        const auth = require('@react-native-firebase/auth').default;
        return auth.PhoneAuthProvider.credential(verificationId, code);
    }
};

export default getAuth;
