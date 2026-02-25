import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VendorRegisterScreen from '../screens/VendorRegisterScreen';
import OTPScreen from '../screens/OTPScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ActivationStatusScreen from '../screens/ActivationStatusScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FFFFFF' },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ActivationStatus" component={ActivationStatusScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
