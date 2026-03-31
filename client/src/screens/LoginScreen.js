import React, { useState } from 'react';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    Animated
} from 'react-native';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import getAuth, { getPhoneCredential } from '../utils/firebaseAuth';
import * as Device from 'expo-device';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import { syncFCMToken } from '../utils/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import FloatingInput from '../components/FloatingInput';
import OTPInput from '../components/OTPInput';

import CustomButton from '../components/CustomButton';
import TabSwitcher from '../components/TabSwitcher';
import { useTheme } from '../context/ThemeContext';
import { } from '@react-navigation/native';
import { Chrome as Google, Facebook } from 'lucide-react-native';


const LoginScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestId, setRequestId] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'success', // 'success' or 'error'
        title: '',
        message: ''
    });
    const recaptchaVerifier = React.useRef(null);
    const [verificationId, setVerificationId] = useState('');
    const modalFadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (modalConfig.visible) {
            Animated.timing(modalFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            modalFadeAnim.setValue(0);
        }
    }, [modalConfig.visible]);

    React.useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    React.useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                navigation.replace('Main');
            }
        };
        checkToken();
    }, []);

    const handleSendOTP = async () => {
        if (!mobile || mobile.length < 10) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('forgot_password.enter_mobile')
            });
            return;
        }
        setLoading(true);
        try {
            const cleanedMobile = mobile.replace(/\D/g, '');
            
            // Check if mobile exists in backend first
            const checkRes = await fetch(`${API_BASE_URL}/auth/check-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: cleanedMobile })
            });
            const checkData = await checkRes.json();
            
            if (!checkData.exists) {
                setLoading(false);
                setModalConfig({
                    visible: true,
                    type: 'error',
                    title: t('common.error'),
                    message: t('login.not_registered') || 'Mobile number not registered. Please register first.'
                });
                return;
            }

            const finalMobile = cleanedMobile.length === 10 ? '+91' + cleanedMobile : (mobile.startsWith('+') ? mobile : '+' + mobile);
            
            // Native/Universal Firebase Auth
            const authInstance = getAuth();
            const confirmation = await authInstance.signInWithPhoneNumber(finalMobile);
            
            setVerificationId(confirmation.verificationId); 
            setLoading(false);
            setOtpSent(true);
            setTimer(60);
            
            setModalConfig({
                visible: true,
                type: 'success',
                title: t('common.success'),
                message: t('login.otp_sent_msg') || 'OTP has been sent to your mobile number.'
            });
        } catch (error) {
            setLoading(false);
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: error.message || t('register.server_error')
            });
        }
    };

    const handleLogin = async () => {
        if (!mobile || mobile.length < 10) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('forgot_password.enter_mobile')
            });
            return;
        }

        if (loginMode === 'password' && !password) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('register.fill_all_fields')
            });
            return;
        }

        if (loginMode === 'otp' && (!otp || otp.length < 6)) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('otp.enter_6_digit')
            });
            return;
        }

        setLoading(true);
        try {
            if (loginMode === 'otp') {
                // Verify OTP with Native/Universal Firebase
                const credential = getPhoneCredential(
                    verificationId, 
                    otp
                );
                const authInstance = getAuth();
                await authInstance.signInWithCredential(credential);
            }

            const endpoint = loginMode === 'password' ? 'login' : 'login-with-otp';
            const body = loginMode === 'password'
                ? { mobile, password }
                : { mobile, otp: 'VERIFIED' }; // Tell backend it's already verified via SDK

            const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    deviceInfo: Device.modelName || (Platform.OS === 'ios' ? 'iPhone' : 'Android Device'),
                    os: `${Platform.OS} ${Platform.Version}`
                })
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                await AsyncStorage.setItem('userToken', data.token);
                syncFCMToken(API_BASE_URL, data.token);

                // Auto-fulfill pending wishlist if any
                const pendingId = await AsyncStorage.getItem('pendingWishlistOfferId');
                if (pendingId) {
                    try {
                        await fetch(`${API_BASE_URL}/wishlist/toggle`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${data.token}`
                            },
                            body: JSON.stringify({ offerId: pendingId })
                        });
                        await AsyncStorage.removeItem('pendingWishlistOfferId');
                    } catch (e) {
                        console.log('Pending wishlist fill error:', e);
                    }
                }

                navigation.navigate('Main');
            } else {
                let msg = data.message || t('login.failed');
                if (msg === 'Invalid OTP') msg = t('otp.invalid_otp');
                else if (msg === 'OTP has expired') msg = t('otp.expired_otp');

                setModalConfig({
                    visible: true,
                    type: 'error',
                    title: t('common.error'),
                    message: msg
                });
            }
        } catch (error) {
            setLoading(false);
            let errorMessage = t('register.server_error');
            
            if (error.code === 'auth/invalid-verification-code' || error.message?.includes('Invalid OTP')) {
                errorMessage = t('otp.invalid_otp');
            } else if (error.code === 'auth/code-expired' || error.message?.includes('expired')) {
                errorMessage = t('otp.expired_otp');
            } else if (error.message) {
                errorMessage = error.message;
            }

            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: errorMessage
            });
        }
    };

    const handleAction = () => {
        if (loginMode === 'otp' && !otpSent) {
            handleSendOTP();
        } else {
            handleLogin();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="mb-8 items-center">
                        <View className="mb-4">
                            <Text style={{ color: colors.text }} className="text-4xl font-black tracking-tighter">
                                Offerz
                            </Text>
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">{t('login.welcome_back')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-sm text-center">{t('login.subtitle')}</Text>
                    </View>

                    {/* Premium Login Switcher */}
                    <View style={{ backgroundColor: isDarkMode ? `${colors.primary}33` : 'rgba(245, 247, 248, 0.5)', borderColor: colors.border }} className="flex-row p-1.5 rounded-2xl border mb-8">
                        {['password', 'otp'].map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                activeOpacity={0.9}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    alignItems: 'center',
                                    borderRadius: 12,
                                    backgroundColor: loginMode === mode ? colors.card : 'transparent',
                                    shadowColor: loginMode === mode ? '#000' : 'transparent',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: loginMode === mode ? 3 : 0
                                }}
                                onPress={() => setLoginMode(mode)}
                            >
                                <Text style={{ color: loginMode === mode ? colors.text : colors.textSecondary }} className={`text-[11px] font-black tracking-wider`}>
                                    {mode === 'password' ? t('login.password_login') : t('login.otp_login')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loginMode === 'otp' && otpSent ? (
                        <View>
                            <View className="mb-6 items-center">
                                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold tracking-widest mb-1">{t('login.enter_code')}</Text>
                                <View className="flex-row items-center">
                                    <Text style={{ color: colors.text }} className="font-black text-sm">+91 {mobile}</Text>
                                    <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                                        <Text style={{ color: colors.secondary }} className="ml-2 font-bold text-xs underline">{t('login.change')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <OTPInput
                                onComplete={(value) => setOtp(value)}
                                length={6}
                            />
                            <View className="items-center mb-6">
                                {timer > 0 ? (
                                    <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">{t('login.resend_in', { seconds: timer })}</Text>
                                ) : (
                                    <TouchableOpacity onPress={handleSendOTP}>
                                        <Text style={{ color: colors.secondary }} className="font-black text-xs tracking-widest underline">{t('login.resend_code')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View>
                            <FloatingInput
                                label={t('common.mobile')}
                                value={mobile}
                                onChangeText={setMobile}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!otpSent}
                            />

                            {loginMode === 'password' && (
                                <FloatingInput
                                    label={t('common.password')}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            )}
                        </View>
                    )}

                    {loginMode === 'password' && (
                        <TouchableOpacity
                            className="self-end mb-5"
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={{ color: colors.accent }} className="font-semibold text-sm">{t('common.forgot_password')}</Text>
                        </TouchableOpacity>
                    )}

                    <CustomButton
                        title={loginMode === 'otp' ? (otpSent ? t('login.verify_login') : t('login.get_otp')) : t('common.login')}
                        onPress={handleAction}
                        loading={loading}
                    />

                    <View className="flex-row items-center my-6">
                        <View style={{ backgroundColor: colors.border }} className="flex-1 h-[1px]" />
                        <Text style={{ color: colors.textSecondary }} className="mx-4 text-xs font-bold">{t('common.or')}</Text>
                        <View style={{ backgroundColor: colors.border }} className="flex-1 h-[1px]" />
                    </View>

                    <View className="flex-row justify-between mb-6">
                        <TouchableOpacity style={{ borderColor: colors.border }} className="flex-[0.48] flex-row h-[50px] border rounded-lg justify-center items-center">
                            <Google size={24} color="#DB4437" />
                            <Text style={{ color: colors.text }} className="ml-2.5 text-sm font-semibold">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ borderColor: colors.border }} className="flex-[0.48] flex-row h-[50px] border rounded-lg justify-center items-center">
                            <Facebook size={24} color="#4267B2" />
                            <Text style={{ color: colors.text }} className="ml-2.5 text-sm font-semibold">Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="items-center mb-6"
                        onPress={() => navigation.navigate('Main')}
                    >
                        <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold underline">{t('login.skip_login')}</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mb-10">
                        <Text style={{ color: colors.text }} className="text-sm">{t('common.dont_have_account')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={{ color: colors.secondary }} className="font-bold text-sm">{t('common.register_now')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center items-center">
                        <Text style={{ color: colors.textSecondary }} className="text-xs">{t('register.terms_conditions')}</Text>
                        <View style={{ backgroundColor: colors.border }} className="w-1 h-1 rounded-full mx-2" />
                        <Text style={{ color: colors.textSecondary }} className="text-xs">{t('privacy.policy_privacy_title')}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Premium Dynamic Modal - Matching Project Design System */}
            <Modal
                transparent
                visible={modalConfig.visible}
                animationType="none"
                onRequestClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
            >
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <Animated.View 
                        style={{ 
                            opacity: modalFadeAnim,
                            backgroundColor: colors.background, 
                            borderRadius: 40,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.3,
                            shadowRadius: 40,
                            elevation: 25,
                        }} 
                        className="w-full p-8 items-center border border-white/5"
                    >
                        <View 
                            style={{ backgroundColor: modalConfig.type === 'success' ? `${colors.success}15` : `${colors.error}15` }} 
                            className="w-24 h-24 rounded-[32px] items-center justify-center mb-8"
                        >
                            {modalConfig.type === 'success' ? (
                                <CheckCircle2 size={44} color={colors.success} strokeWidth={1.5} />
                            ) : (
                                <AlertCircle size={44} color={colors.error} strokeWidth={1.5} />
                            )}
                        </View>
                        
                        <Text style={{ color: colors.text }} className="text-2xl font-black text-center mb-3 tracking-tight">
                            {modalConfig.title}
                        </Text>
                        
                        <Text style={{ color: colors.textSecondary }} className="text-center font-medium mb-10 leading-6 opacity-70 px-2">
                            {modalConfig.message}
                        </Text>
                        
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                            style={{ 
                                backgroundColor: colors.primary, 
                                shadowColor: colors.primary, 
                                shadowOffset: { width: 0, height: 10 }, 
                                shadowOpacity: 0.3, 
                                shadowRadius: 20 
                            }}
                            className="w-full py-5 rounded-[24px] items-center justify-center"
                        >
                            <Text style={{ color: '#FFFFFF' }} className="font-black tracking-widest text-sm uppercase">{t('common.continue')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default LoginScreen;
