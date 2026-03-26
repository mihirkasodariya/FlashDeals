import React, { useState } from 'react';
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
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, AlertCircle, ChevronLeft, Lock } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';

import getAuth from '../utils/firebaseAuth';
import { Animated, Modal } from 'react-native';
import { API_BASE_URL } from '../config';

const ForgotPasswordScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'success',
        title: '',
        message: ''
    });
    const recaptchaVerifier = React.useRef(null);
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

    const handleReset = async () => {
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
            
            setLoading(false);
            navigation.navigate('OTP', { 
                mobile, 
                purpose: 'reset',
                confirmation 
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

                <Text style={{ color: colors.text }} className="text-[26px] font-bold mb-3 text-center">{t('forgot_password.title')}</Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm text-center leading-tight mb-10 px-2.5">
                    {t('forgot_password.subtitle')}
                </Text>

                <FloatingInput
                    label={t('common.mobile')}
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                />

                <CustomButton
                    title={t('forgot_password.send_otp')}
                    onPress={handleReset}
                    loading={loading}
                    className="mt-5 w-full"
                />

                <TouchableOpacity
                    className="mt-8"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={{ color: colors.secondary }} className="font-bold text-sm">{t('forgot_password.back_to_login')}</Text>
                </TouchableOpacity>
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

export default ForgotPasswordScreen;
