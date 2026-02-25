import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import OTPInput from '../components/OTPInput';
import CustomButton from '../components/CustomButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const OTPScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { mobile = "9876543210" } = route.params || {};
    const [timer, setTimer] = useState(30);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(timer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert("Error", "Please enter 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const { userId, userType, purpose, formData } = route.params || {};

            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp,
                    userId
                })
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                if (purpose === 'reset') {
                    Alert.alert("Success", "Password reset successful! Please login with your new password.", [
                        { text: "OK", onPress: () => navigation.navigate('Login') }
                    ]);
                } else if (userType === 'user') {
                    navigation.navigate('Main');
                } else if (userType === 'vendor') {
                    navigation.navigate('VendorRegister', { step: 1, userId, formData: route.params.formData });
                } else {
                    navigation.navigate('ActivationStatus');
                }
            } else {
                Alert.alert("Verification Failed", data.message || "Invalid OTP");
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Server connection failed");
            console.error(error);
        }
    };

    const handleResend = () => {
        setTimer(30);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 pt-2.5">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color="#002F34" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 pt-5"
            >
                <Text className="text-[28px] font-bold text-primary mb-2.5">Verify OTP</Text>
                <Text className="text-[15px] text-gray-500 leading-tight mb-5">
                    We've sent a 6-digit verification code to
                    <Text className="text-primary font-bold"> +91 {mobile}</Text>
                </Text>

                <OTPInput onComplete={setOtp} />

                <View className="items-center mb-8">
                    {timer > 0 ? (
                        <Text className="text-sm text-gray-500">Resend code in <Text className="text-secondary font-bold">{timer}s</Text></Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend}>
                            <Text className="text-secondary font-bold text-sm underline">Resend OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <CustomButton
                    title="Verify & Proceed"
                    onPress={handleVerify}
                    loading={loading}
                    className="mt-2.5"
                />

                <Text className="text-center mt-5 text-gray-400 text-xs italic">Demo OTP: 123456</Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default OTPScreen;
