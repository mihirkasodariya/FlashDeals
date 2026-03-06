import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import OTPInput from '../components/OTPInput';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const OTPScreen = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { mobile } = route.params || {};
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
            Alert.alert(t('common.error'), t('otp.enter_6_digit'));
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
                    Alert.alert(t('common.success'), t('otp.reset_success'), [
                        { text: t('common.yes'), onPress: () => navigation.navigate('Login') }
                    ]);
                } else if (userType === 'user') {
                    navigation.navigate('Main');
                } else if (userType === 'vendor') {
                    navigation.navigate('VendorRegister', { step: 1, userId, formData: route.params.formData });
                } else {
                    navigation.navigate('ActivationStatus');
                }
            } else {
                Alert.alert(t('otp.verification_failed'), data.message || t('otp.invalid_otp'));
            }
        } catch (error) {
            setLoading(false);
            Alert.alert(t('common.error'), t('register.server_error'));
            console.error(error);
        }
    };

    const handleResend = () => {
        setTimer(30);
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
                className="flex-1 px-6 pt-5"
            >
                <Text style={{ color: colors.text }} className="text-[28px] font-bold mb-2.5">{t('otp.title')}</Text>
                <Text style={{ color: colors.textSecondary }} className="text-[15px] leading-tight mb-5">
                    {t('otp.subtitle')}
                    <Text style={{ color: colors.text }} className="font-bold"> +91 {mobile}</Text>
                </Text>

                <OTPInput onComplete={setOtp} />

                <View className="items-center mb-8">
                    {timer > 0 ? (
                        <Text style={{ color: colors.textSecondary }} className="text-sm">{t('otp.resend_in', { seconds: timer })}</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={{ color: colors.secondary }} className="font-bold text-sm underline">{t('otp.resend_otp')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <CustomButton
                    title={t('otp.verify_proceed')}
                    onPress={handleVerify}
                    loading={loading}
                    className="mt-2.5"
                />

                <Text className="text-center mt-5 text-gray-400 text-xs italic">{t('otp.demo_otp')}</Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default OTPScreen;
