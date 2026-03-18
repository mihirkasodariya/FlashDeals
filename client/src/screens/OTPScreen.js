import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    Animated
} from 'react-native';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
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
    const [verificationId, setVerificationId] = useState(route.params?.verificationId || '');
    const recaptchaVerifier = React.useRef(null);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null
    });
    const modalFadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
            // Verify OTP with Firebase
            const credential = PhoneAuthProvider.credential(
                verificationId,
                otp
            );
            await signInWithCredential(auth, credential);
            
            // If successful, proceed to verify on your backend
            const { userId, userType, purpose, formData } = route.params || {};

            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: 'VERIFIED',
                    userId
                })
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                if (purpose === 'reset') {
                    setModalConfig({
                        visible: true,
                        type: 'success',
                        title: t('common.success'),
                        message: t('otp.reset_success'),
                        onConfirm: () => navigation.navigate('Login')
                    });
                } else if (userType === 'user') {
                    navigation.navigate('Main');
                } else if (userType === 'vendor') {
                    navigation.navigate('VendorRegister', { step: 1, userId, formData: route.params.formData });
                } else {
                    navigation.navigate('ActivationStatus');
                }
            } else {
                setModalConfig({
                    visible: true,
                    type: 'error',
                    title: t('otp.verification_failed'),
                    message: data.message || t('otp.invalid_otp')
                });
            }
        } catch (error) {
            setLoading(false);
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('register.server_error')
            });
            console.error(error);
        }
    };

    const handleResend = async () => {
        try {
            setLoading(true);
            const cleanedMobile = mobile.replace(/\D/g, '');
            const finalMobile = cleanedMobile.length === 10 ? '+91' + cleanedMobile : (mobile.startsWith('+') ? mobile : '+' + mobile);

            const phoneProvider = new PhoneAuthProvider(auth);
            const vId = await phoneProvider.verifyPhoneNumber(
                finalMobile,
                recaptchaVerifier.current
            );
            
            setVerificationId(vId);
            setLoading(false);
            setTimer(60);
            setModalConfig({
                visible: true,
                type: 'success',
                title: t('common.success'),
                message: t('login.otp_sent_msg')
            });
        } catch (error) {
            setLoading(false);
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: error.message || t('common.error')
            });
        }
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

            </KeyboardAvoidingView>

            {/* Custom Premium Dynamic Modal - Matching Project Design System */}
            <Modal
                transparent
                visible={modalConfig.visible}
                animationType="none"
                onRequestClose={() => {
                    setModalConfig(prev => ({ ...prev, visible: false }));
                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                }}
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
                            onPress={() => {
                                setModalConfig(prev => ({ ...prev, visible: false }));
                                if (modalConfig.onConfirm) modalConfig.onConfirm();
                            }}
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

            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
            />
        </SafeAreaView>
    );
};

export default OTPScreen;
