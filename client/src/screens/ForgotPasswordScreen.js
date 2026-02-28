import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
import CustomButton from '../components/CustomButton';
import { } from '@react-navigation/native';

const ForgotPasswordScreen = ({ navigation }) => {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = () => {
        if (!mobile) {
            Alert.alert("Error", "Please enter your mobile number");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('OTP', { mobile, purpose: 'reset' });
        }, 1000);
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
                className="flex-1 px-6 pt-10 items-center"
            >
                <View className="w-20 h-20 rounded-full bg-surface justify-center items-center mb-8">
                    <Lock size={40} color="#00A49F" />
                </View>

                <Text className="text-[26px] font-bold text-primary mb-3 text-center">Forgot Password?</Text>
                <Text className="text-sm text-gray-500 text-center leading-tight mb-10 px-2.5">
                    No worries! Enter your registered mobile number and we'll send you an OTP to reset your password.
                </Text>

                <FloatingInput
                    label="Mobile Number"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                />

                <CustomButton
                    title="Send OTP"
                    onPress={handleReset}
                    loading={loading}
                    className="mt-5 w-full"
                />

                <TouchableOpacity
                    className="mt-8"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-secondary font-bold text-sm">Back to Login</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
