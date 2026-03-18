import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    Modal,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Check, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
import CustomButton from '../components/CustomButton';
import { PhoneAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const RegisterScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const recaptchaVerifier = React.useRef(null);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'success',
        title: '',
        message: ''
    });
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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        if (!name || !mobile || !password || !confirmPassword) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('register.fill_all_fields')
            });
            return;
        }
        if (password !== confirmPassword) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('register.passwords_mismatch')
            });
            return;
        }
        if (!agreed) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: t('common.error'),
                message: t('register.agree_to_terms')
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('mobile', mobile);
            formData.append('password', password);
            formData.append('role', 'user');

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('profileImage', {
                    uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
                    name: filename,
                    type
                });
            }

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                // Send OTP via Firebase before navigating
                try {
                    const cleanedMobile = mobile.replace(/\D/g, '');
                    const finalMobile = cleanedMobile.length === 10 ? '+91' + cleanedMobile : (mobile.startsWith('+') ? mobile : '+' + mobile);
                    
                    const phoneProvider = new PhoneAuthProvider(auth);
                    const vId = await phoneProvider.verifyPhoneNumber(
                        finalMobile,
                        recaptchaVerifier.current
                    );
                    
                    navigation.navigate('OTP', {
                        mobile,
                        userType: 'user',
                        userId: data.userId,
                        verificationId: vId
                    });
                } catch (otpErr) {
                    console.error("Firebase Auth Error:", otpErr);
                    setModalConfig({
                        visible: true,
                        type: 'error',
                        title: t('common.error'),
                        message: otpErr.message || t('login.failed')
                    });
                }
            } else {
                setModalConfig({
                    visible: true,
                    type: 'error',
                    title: t('register.failed'),
                    message: data.message || t('common.error')
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="text-lg font-bold">{t('register.create_account')}</Text>
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30 }}
                    showsVerticalScrollIndicator={false}
                >

                    <View className="items-center mb-8">
                        <TouchableOpacity style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="w-[120px] h-[120px] rounded-full justify-center items-center border" onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} className="w-[120px] h-[120px] rounded-full" />
                            ) : (
                                <View className="items-center">
                                    <Camera size={40} color={colors.textSecondary} />
                                </View>
                            )}
                            <View style={{ backgroundColor: colors.primary, borderColor: colors.background }} className="absolute bottom-1 right-1 w-8 h-8 rounded-full justify-center items-center border-2">
                                <Camera size={16} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={{ color: colors.textSecondary }} className="mt-2.5 text-xs font-medium">{t('register.upload_profile')}</Text>
                    </View>

                    <FloatingInput
                        label={t('register.full_name')}
                        value={name}
                        onChangeText={setName}
                    />

                    <FloatingInput
                        label={t('register.mobile_number')}
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />

                    <FloatingInput
                        label={t('common.password')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <FloatingInput
                        label={t('register.confirm_password')}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        className="flex-row items-center my-5"
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.7}
                    >
                        <View style={{ borderColor: agreed ? colors.secondary : colors.border, backgroundColor: agreed ? colors.secondary : 'transparent' }} className={`w-[22px] h-[22px] rounded border-2 justify-center items-center mr-2.5`}>
                            {agreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                        <Text style={{ color: colors.textSecondary }} className="text-sm">
                            {t('register.agree_terms', { terms: '' })}
                            <Text style={{ color: colors.accent }} className="font-semibold">{t('register.terms_conditions')}</Text>
                        </Text>
                    </TouchableOpacity>

                    <CustomButton
                        title={t('common.register')}
                        onPress={handleRegister}
                        loading={loading}
                    />

                    <View style={{ backgroundColor: colors.border }} className="h-[1px] my-5" />

                    <CustomButton
                        title={t('register.register_vendor')}
                        variant="outline"
                        onPress={() => navigation.navigate('VendorRegister')}
                    />

                    <View className="flex-row justify-center mt-8">
                        <Text style={{ color: colors.text }} className="text-sm">{t('common.already_have_account')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ color: colors.secondary }} className="font-bold text-sm">{t('common.login')}</Text>
                        </TouchableOpacity>
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

            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
            />
        </SafeAreaView>
    );
};

export default RegisterScreen;
