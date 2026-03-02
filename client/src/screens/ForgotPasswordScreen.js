import React, { useState } from 'react';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';

const ForgotPasswordScreen = ({ navigation }) => {
    const { colors } = useTheme();
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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="px-4 py-3">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 pt-10 items-center"
            >
                <View style={{ backgroundColor: colors.surface }} className="w-20 h-20 rounded-full justify-center items-center mb-8">
                    <Lock size={40} color={colors.primary} />
                </View>

                <Text style={{ color: colors.text }} className="text-[26px] font-bold mb-3 text-center">Forgot Password?</Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm text-center leading-tight mb-10 px-2.5">
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
                    <Text style={{ color: colors.secondary }} className="font-bold text-sm">Back to Login</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
