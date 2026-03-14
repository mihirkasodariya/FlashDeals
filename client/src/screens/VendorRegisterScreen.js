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
    ActivityIndicator,
    Alert,
    BackHandler,
    DeviceEventEmitter,
    Modal
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Upload, CheckCircle2, AlertCircle, RefreshCw, Shield, Camera } from 'lucide-react-native';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

import FloatingInput from '../components/FloatingInput';
import AddressAutocomplete from '../components/AddressAutocomplete';
import CustomButton from '../components/CustomButton';

import ProgressSteps from '../components/ProgressSteps';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config';


const VendorRegisterScreen = ({ navigation, route }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [step, setStep] = useState(0); // 0 or 1
    const [activeIdType, setActiveIdType] = useState('GSTIN');
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        storeName: '',
        storeAddress: '',
        location: null,
        password: '',
        confirmPassword: '',
        idNumber: '',
    });

    React.useEffect(() => {
        if (route.params?.step !== undefined) {
            setStep(route.params.step);
        }
        if (route.params?.formData) {
            setFormData(prev => ({ ...prev, ...route.params.formData }));
        }
    }, [route.params?.step, route.params?.formData]);

    const [docImage, setDocImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [validationStatus, setValidationStatus] = useState('none');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [registrationFinished, setRegistrationFinished] = useState(false);
    const [isExitModalVisible, setIsExitModalVisible] = useState(false);
    const handleBack = () => {
        if (step === 1 && !registrationFinished) {
            setIsExitModalVisible(true);
            return true;
        }
        if (step === 0) {
            navigation.goBack();
        } else {
            setStep(0);
        }
        return true;
    };

    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
        return () => backHandler.remove();
    }, [step, registrationFinished]);

    const pickProfileImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const pickDocument = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setDocImage(result.assets[0].uri);
            simulateAIValidation();
        }
    };

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), t('vendor_register.sync_gps_req'));
            return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setFormData({
            ...formData,
            location: {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            }
        });
        Alert.alert(t('common.success'), t('vendor_register.gps_synced'));
    };

    const simulateAIValidation = () => {
        setValidationStatus('checking');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setValidationStatus('valid');
            }
        }, 200);
    };

    const handleNext = async () => {
        if (step === 0) {
            if (!formData.name || !formData.mobile || !formData.password || !formData.confirmPassword) {
                Alert.alert(t('common.error'), t('vendor_register.fill_business_details'));
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                Alert.alert(t('common.error'), t('vendor_register.passwords_mismatch'));
                return;
            }

            setLoading(true);
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('mobile', formData.mobile);
                formDataToSend.append('password', formData.password);
                formDataToSend.append('role', 'vendor');

                if (profileImage) {
                    const filename = profileImage.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image`;
                    formDataToSend.append('profileImage', {
                        uri: Platform.OS === 'ios' ? profileImage.replace('file://', '') : profileImage,
                        name: filename,
                        type
                    });
                }

                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    body: formDataToSend
                });

                const data = await response.json();
                setLoading(false);

                if (data.success) {
                    navigation.navigate('OTP', {
                        mobile: formData.mobile,
                        userType: 'vendor',
                        userId: data.userId,
                        formData: formData
                    });
                } else {
                    Alert.alert(t('register.failed'), data.message || t('common.error'));
                }
            } catch (error) {
                setLoading(false);
                Alert.alert(t('common.error'), t('register.server_error'));
            }
        } else {
            if (!formData.storeName) {
                Alert.alert(t('common.error'), t('vendor_register.store_name_req'));
                return;
            }
            if (!formData.storeAddress) {
                Alert.alert(t('common.error'), t('vendor_register.store_addr_req'));
                return;
            }
            if (!formData.location) {
                Alert.alert(t('common.error'), t('vendor_register.sync_gps_req'));
                return;
            }

            const userId = route.params?.userId || formData.userId;
            if (!userId) {
                Alert.alert(t('common.error'), t('vendor_register.critical_error_userid'));
                return;
            }

            setLoading(true);
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('userId', userId);
                formDataToSend.append('storeName', formData.storeName);
                formDataToSend.append('storeAddress', formData.storeAddress);
                formDataToSend.append('idType', activeIdType);

                if (formData.location) {
                    formDataToSend.append('location', JSON.stringify(formData.location));
                }
                if (formData.idNumber) {
                    formDataToSend.append('idNumber', formData.idNumber);
                }

                if (docImage) {
                    const fileName = docImage.split('/').pop();
                    const fileType = fileName.split('.').pop() || 'jpg';

                    formDataToSend.append('idDocument', {
                        uri: Platform.OS === 'android' ? docImage : docImage.replace('file://', ''),
                        name: fileName,
                        type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
                    });
                }

                const response = await fetch(`${API_BASE_URL}/vendor/complete-registration`, {
                    method: 'POST',
                    body: formDataToSend
                });

                const data = await response.json();
                setLoading(false);
                if (data.success) {
                    setRegistrationFinished(true); // Mark as done to prevent reversal
                    DeviceEventEmitter.emit('roleChanged');
                    navigation.navigate('Main');
                } else {
                    Alert.alert(t('common.error'), data.message || t('vendor_register.failed_submit_docs'));
                }
            } catch (error) {
                setLoading(false);
                Alert.alert(t('common.error'), t('register.server_error'));
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            {/* Minimalist Premium Header */}
            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="px-6 pb-6 pt-2 flex-row items-center border-b">
                <TouchableOpacity
                    onPress={handleBack}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color={colors.text} strokeWidth={3} />
                </TouchableOpacity>
                <View className="ml-4">
                    <Text style={{ color: staticColors.secondary }} className="text-[10px] font-black tracking-[3px] mb-0.5">{t('vendor_register.commercial')}</Text>
                    <Text style={{ color: colors.text }} className="text-xl font-black">{t('vendor_register.merchant_portal')}</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 30, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                    <ProgressSteps currentStep={step} />

                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[40px] p-8 shadow-sm border mt-6">
                        {step === 0 ? (
                            <View className="space-y-6">
                                <View className="items-center mb-6">
                                    <TouchableOpacity
                                        onPress={pickProfileImage}
                                        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                        className="w-24 h-24 rounded-full items-center justify-center border overflow-hidden"
                                    >
                                        {profileImage ? (
                                            <Image source={{ uri: profileImage }} className="w-full h-full" />
                                        ) : (
                                            <View className="items-center">
                                                <Shield size={32} color={colors.textSecondary} strokeWidth={1} />
                                                <Text style={{ color: colors.textSecondary }} className="text-[8px] font-black mt-1 tracking-widest opacity-40">{t('vendor_register.identify')}</Text>
                                            </View>
                                        )}
                                        <View style={{ backgroundColor: `${colors.primary}33` }} className="absolute bottom-0 right-0 left-0 items-center py-1">
                                            <Camera size={12} color={colors.primary} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={{ color: colors.textSecondary }} className="mt-3 text-[10px] font-black tracking-widest opacity-40">{t('vendor_register.profile_image_label')}</Text>
                                </View>

                                <View>
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-1 opacity-50">{t('vendor_register.business_lead')}</Text>
                                    <FloatingInput
                                        label={t('vendor_register.full_name')}
                                        value={formData.name}
                                        onChangeText={(val) => setFormData({ ...formData, name: val })}
                                    />
                                </View>

                                <View className="mt-6">
                                    <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">{t('vendor_register.communication_hub')}</Text>
                                    <FloatingInput
                                        label={t('vendor_register.mobile_no')}
                                        value={formData.mobile}
                                        onChangeText={(val) => setFormData({ ...formData, mobile: val })}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>

                                <View className="mt-6">
                                    <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">{t('vendor_register.secure_access')}</Text>
                                    <FloatingInput
                                        label={t('vendor_register.creation_password')}
                                        value={formData.password}
                                        onChangeText={(val) => setFormData({ ...formData, password: val })}
                                        secureTextEntry
                                    />
                                </View>

                                <View className="mt-6">
                                    <FloatingInput
                                        label={t('vendor_register.confirm_credentials')}
                                        value={formData.confirmPassword}
                                        onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View className="items-center mb-10">
                                    <View style={{ backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}1A` }} className="w-16 h-16 rounded-[24px] items-center justify-center border">
                                        <Shield size={32} color={colors.primary} strokeWidth={1.5} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="mt-4 font-black text-xl tracking-tight">{t('vendor_register.enterprise_verification')}</Text>
                                </View>

                                {/* Removed ID Type Switcher as only GSTIN is needed now */}

                                <View className="space-y-6">
                                    <View>
                                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-1 opacity-50">{t('vendor_register.public_branding')}</Text>
                                        <FloatingInput
                                            label={t('vendor_register.trade_store_name')}
                                            value={formData.storeName}
                                            onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                                        />
                                    </View>

                                    <View className="mt-6">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-[10px] font-black text-textSecondary tracking-widest ml-1 opacity-50">{t('vendor_register.tax_identity')}</Text>
                                            <Text style={{ color: colors.textSecondary }} className="text-[9px] font-bold opacity-40">OPTIONAL</Text>
                                        </View>
                                        <FloatingInput
                                            label="GSTIN Number (Optional)"
                                            value={formData.idNumber}
                                            onChangeText={(val) => setFormData(prev => ({ ...prev, idNumber: val }))}
                                        />
                                    </View>

                                    <View className="mt-6">
                                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-1 opacity-50">{t('vendor_register.physical_nexus')}</Text>
                                        <AddressAutocomplete
                                            label={t('vendor_register.registered_store_address')}
                                            value={formData.storeAddress}
                                            onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                                        />

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={getCurrentLocation}
                                            style={{ borderColor: `${colors.secondary}1A`, backgroundColor: `${colors.secondary}0D` }}
                                            className="mt-4 flex-row items-center border py-5 rounded-[24px] px-6"
                                        >
                                            <View className={`w-3.5 h-3.5 rounded-full mr-4 shadow-sm ${formData.location ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <Text style={{ color: staticColors.secondary }} className="font-black text-xs tracking-widest">
                                                {formData.location ? t('vendor_register.gps_synced') : t('vendor_register.detect_gps')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Document Upload Zone */}
                                    <View className="mt-10">
                                        <View className="flex-row justify-between items-center mb-4">
                                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest ml-1 opacity-50">{t('vendor_register.proof_existence')}</Text>
                                            <Text style={{ color: colors.textSecondary }} className="text-[9px] font-bold opacity-40">OPTIONAL</Text>
                                        </View>
                                        <TouchableOpacity style={{ borderColor: colors.border, backgroundColor: colors.surface }} className="h-[220px] border-2 border-dashed rounded-[32px] justify-center items-center overflow-hidden" onPress={pickDocument}>
                                            {docImage ? (
                                                <View className="w-full h-full">
                                                    <Image source={{ uri: docImage }} className="w-full h-full" />
                                                    <View className="absolute inset-0 bg-black/40 justify-center items-center">
                                                        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                                            <RefreshCw size={20} color="#FFFFFF" strokeWidth={3} />
                                                        </View>
                                                        <Text className="text-white mt-3 font-black text-[10px] tracking-widest">{t('vendor_register.update_image')}</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View className="items-center">
                                                    <View style={{ backgroundColor: colors.card }} className="w-16 h-16 rounded-3xl items-center justify-center shadow-sm mb-6">
                                                        <Upload size={28} color={staticColors.secondary} strokeWidth={2.5} />
                                                    </View>
                                                    <Text style={{ color: colors.text }} className="font-black text-sm tracking-widest">{t('vendor_register.upload_id')}</Text>
                                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-2 font-medium tracking-[2px]">{t('vendor_register.png_jpg_max')}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {validationStatus !== 'none' && (
                                        <View className={`flex-row items-center p-6 rounded-[28px] mt-8 border ${validationStatus === 'valid' ? 'bg-green-50 border-green-100' :
                                            validationStatus === 'invalid' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                                            }`}>
                                            {validationStatus === 'checking' && <ActivityIndicator size="small" color={staticColors.secondary} className="mr-4" />}
                                            {validationStatus === 'valid' && <CheckCircle2 size={24} color="#10B981" strokeWidth={3} className="mr-4" />}

                                            <View className="flex-1">
                                                <Text style={{ color: colors.text }} className="text-[10px] font-black tracking-widest mb-0.5 opacity-50">{t('vendor_register.ai_core_status')}</Text>
                                                <Text className={`text-sm font-black ${validationStatus === 'valid' ? 'text-green-600' :
                                                    validationStatus === 'invalid' ? 'text-red-500' : `text-[${staticColors.secondary}]`
                                                    }`}>
                                                    {validationStatus === 'checking' ? t('vendor_register.verifying_authenticity', { progress: uploadProgress }) :
                                                        validationStatus === 'valid' ? t('vendor_register.document_authorized') : t('vendor_register.authorization_failed')}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        <View className="mt-12">
                            <CustomButton
                                title={step === 0 ? t('vendor_register.verify_otp_btn') : t('vendor_register.finalize_portal')}
                                onPress={handleNext}
                                loading={loading}
                            />
                        </View>
                    </View>

                    <View className="mt-8 items-center">
                        <Text className="text-[9px] font-black text-textSecondary tracking-[5px] opacity-30">{t('vendor_register.secure_onboarding')}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Exit Confirmation Modal */}
            <Modal visible={isExitModalVisible} animationType="fade" transparent={true}>
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View style={{ backgroundColor: colors.card }} className="rounded-[60px] p-10 w-full items-center shadow-2xl relative overflow-hidden">
                        {/* Decorative Background Blob */}
                        <View style={{ backgroundColor: `${staticColors.error}0D` }} className="absolute -top-10 -right-10 w-32 h-32 rounded-full" />

                        <View style={{ backgroundColor: `${staticColors.error}1A` }} className="w-24 h-24 rounded-[40px] items-center justify-center mb-8 rotate-12">
                            <AlertCircle size={48} color={staticColors.error} strokeWidth={1.5} className="-rotate-12" />
                        </View>

                        <Text style={{ color: colors.text }} className="text-3xl font-black mb-3 text-center tracking-tighter">{t('vendor_register.exit_setup_title')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center mb-12 font-medium leading-6 opacity-70">
                            {t('vendor_register.exit_setup_desc')}
                        </Text>

                        <View className="w-full space-y-4">
                            <TouchableOpacity
                                onPress={() => setIsExitModalVisible(false)}
                                className="w-full bg-primary py-5 rounded-[30px] items-center shadow-lg shadow-primary/30"
                            >
                                <Text className="text-white font-black text-sm tracking-widest">{t('vendor_register.continue_setup')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsExitModalVisible(false);
                                    navigation.goBack();
                                }}
                                className="w-full py-5 items-center mt-2"
                            >
                                <Text style={{ color: staticColors.error }} className="font-black text-xs tracking-[3px] uppercase">{t('vendor_register.quit_revert')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};


export default VendorRegisterScreen;
