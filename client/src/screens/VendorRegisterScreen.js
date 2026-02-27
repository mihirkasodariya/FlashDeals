import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Upload, CheckCircle2, AlertCircle, RefreshCw, Shield, Camera } from 'lucide-react-native';
import { colors } from '../theme/colors';

import FloatingInput from '../components/FloatingInput';
import AddressAutocomplete from '../components/AddressAutocomplete';
import CustomButton from '../components/CustomButton';

import ProgressSteps from '../components/ProgressSteps';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const VendorRegisterScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [step, setStep] = useState(0); // 0 or 1
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        storeName: '',
        storeAddress: '',
        location: null,
        password: '',
        confirmPassword: '',
        idType: 'GSTIN',
        idNumber: '',
    });

    React.useEffect(() => {
        if (route.params?.step !== undefined) {
            setStep(route.params.step);
        }
        if (route.params?.formData) {
            setFormData(prev => ({ ...prev, ...route.params.formData }));
        }
    }, [route.params]);

    const [docImage, setDocImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [validationStatus, setValidationStatus] = useState('none');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);

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
            Alert.alert('Permission denied', 'Allow location access to pin your store');
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
        Alert.alert('Success', 'GPS precise location synced!');
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
                alert("Please fill all business details");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match");
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
                    alert(data.message || "Registration failed");
                }
            } catch (error) {
                setLoading(false);
                alert("Server connection failed");
            }
        } else {
            if (!docImage || !formData.idNumber || !formData.storeAddress || !formData.storeName) {
                alert("Please fill all details and upload document");
                return;
            }

            const userId = route.params?.userId || formData.userId;
            if (!userId) {
                alert("Critical Error: User ID is missing. Please restart registration.");
                return;
            }

            setLoading(true);
            try {
                const formDataToSend = new FormData();
                formDataToSend.append('userId', userId);
                formDataToSend.append('storeName', formData.storeName);
                formDataToSend.append('storeAddress', formData.storeAddress);
                formDataToSend.append('idType', formData.idType);
                formDataToSend.append('idNumber', formData.idNumber);

                if (formData.location) {
                    formDataToSend.append('location', JSON.stringify(formData.location));
                }

                const fileName = docImage.split('/').pop();
                const fileType = fileName.split('.').pop() || 'jpg';

                formDataToSend.append('idDocument', {
                    uri: Platform.OS === 'android' ? docImage : docImage.replace('file://', ''),
                    name: fileName,
                    type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
                });

                const response = await fetch(`${API_BASE_URL}/vendor/complete-registration`, {
                    method: 'POST',
                    body: formDataToSend
                });

                const data = await response.json();
                setLoading(false);
                if (data.success) {
                    navigation.navigate('ActivationStatus');
                } else {
                    alert(data.message || "Failed to submit documents");
                }
            } catch (error) {
                setLoading(false);
                alert("Server connection failed during upload");
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]">
            {/* Minimalist Premium Header */}
            <View className="bg-white px-6 pb-6 pt-2 flex-row items-center border-b border-surface">
                <TouchableOpacity
                    onPress={() => step === 0 ? navigation.goBack() : setStep(0)}
                    className="w-10 h-10 bg-surface rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color={colors.primary} strokeWidth={3} />
                </TouchableOpacity>
                <View className="ml-4">
                    <Text className="text-[10px] font-black text-secondary tracking-[3px] mb-0.5">Commercial</Text>
                    <Text className="text-xl font-black text-primary">Merchant Portal</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 30, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                    <ProgressSteps currentStep={step} />

                    <View className="bg-white rounded-[40px] p-8 shadow-sm border border-surface mt-6">
                        {step === 0 ? (
                            <View className="space-y-6">
                                <View className="items-center mb-6">
                                    <TouchableOpacity
                                        onPress={pickProfileImage}
                                        className="w-24 h-24 bg-surface rounded-full items-center justify-center border border-surface overflow-hidden"
                                    >
                                        {profileImage ? (
                                            <Image source={{ uri: profileImage }} className="w-full h-full" />
                                        ) : (
                                            <View className="items-center">
                                                <Shield size={32} color={colors.primary} strokeWidth={1} />
                                                <Text className="text-[8px] font-black text-primary/40 mt-1 tracking-widest">Identify</Text>
                                            </View>
                                        )}
                                        <View className="absolute bottom-0 right-0 left-0 bg-primary/20 items-center py-1">
                                            <Camera size={12} color={colors.primary} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text className="mt-3 text-[10px] font-black text-textSecondary/40 tracking-widest">Personal Profile Image</Text>
                                </View>

                                <View>
                                    <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">Business Lead</Text>
                                    <FloatingInput
                                        label="Full Name"
                                        value={formData.name}
                                        onChangeText={(val) => setFormData({ ...formData, name: val })}
                                    />
                                </View>

                                <View className="mt-6">
                                    <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">Communication Hub</Text>
                                    <FloatingInput
                                        label="Mobile No"
                                        value={formData.mobile}
                                        onChangeText={(val) => setFormData({ ...formData, mobile: val })}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>

                                <View className="mt-6">
                                    <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">Secure Access</Text>
                                    <FloatingInput
                                        label="Creation Password"
                                        value={formData.password}
                                        onChangeText={(val) => setFormData({ ...formData, password: val })}
                                        secureTextEntry
                                    />
                                </View>

                                <View className="mt-6">
                                    <FloatingInput
                                        label="Confirm Credentials"
                                        value={formData.confirmPassword}
                                        onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View className="items-center mb-10">
                                    <View className="w-16 h-16 bg-primary/5 rounded-[24px] items-center justify-center border border-primary/10">
                                        <Shield size={32} color={colors.primary} strokeWidth={1.5} />
                                    </View>
                                    <Text className="mt-4 text-primary font-black text-xl tracking-tight">Enterprise Verification</Text>
                                </View>

                                <View className="flex-row mb-10 bg-surface/50 p-1.5 rounded-2xl border border-surface">
                                    {['GSTIN', 'Aadhaar'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            className={`flex-1 py-3.5 items-center rounded-xl ${formData.idType === type ? 'bg-white shadow-xl' : ''}`}
                                            onPress={() => setFormData({ ...formData, idType: type })}
                                        >
                                            <Text className={`text-[10px] font-black tracking-widest ${formData.idType === type ? 'text-primary' : 'text-gray-400'}`}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View className="space-y-6">
                                    <View>
                                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">Public Branding</Text>
                                        <FloatingInput
                                            label="Trade / Store Name"
                                            value={formData.storeName}
                                            onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                                        />
                                    </View>

                                    <View className="mt-6">
                                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">Tax Identity</Text>
                                        <FloatingInput
                                            label={`${formData.idType} Reference`}
                                            value={formData.idNumber}
                                            onChangeText={(val) => setFormData({ ...formData, idNumber: val })}
                                        />
                                    </View>

                                    <View className="mt-6">
                                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1 opacity-50">Physical Nexus</Text>
                                        <AddressAutocomplete
                                            label="Registered Store Address"
                                            value={formData.storeAddress}
                                            onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                                        />

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={getCurrentLocation}
                                            className="mt-4 flex-row items-center border border-secondary/10 bg-secondary/5 py-5 rounded-[24px] px-6"
                                        >
                                            <View className={`w-3.5 h-3.5 rounded-full mr-4 shadow-sm ${formData.location ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <Text className="text-secondary font-black text-xs tracking-widest">
                                                {formData.location ? 'GPS Precision Synced' : 'Detect Live GPS Location'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Document Upload Zone */}
                                    <View className="mt-10">
                                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-4 ml-1 opacity-50">Proof of Existence</Text>
                                        <TouchableOpacity className="h-[220px] border-2 border-surface border-dashed rounded-[32px] justify-center items-center bg-[#FAFAFA] overflow-hidden" onPress={pickDocument}>
                                            {docImage ? (
                                                <View className="w-full h-full">
                                                    <Image source={{ uri: docImage }} className="w-full h-full" />
                                                    <View className="absolute inset-0 bg-black/40 justify-center items-center">
                                                        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                                            <RefreshCw size={20} color="#FFFFFF" strokeWidth={3} />
                                                        </View>
                                                        <Text className="text-white mt-3 font-black text-[10px] tracking-widest">Update Image</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View className="items-center">
                                                    <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center shadow-sm mb-6">
                                                        <Upload size={28} color={colors.secondary} strokeWidth={2.5} />
                                                    </View>
                                                    <Text className="text-primary font-black text-sm tracking-widest">Upload ID Card</Text>
                                                    <Text className="text-[10px] text-gray-400 mt-2 font-medium tracking-[2px]">PNG, JPG • Max 5MB</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* AI Validation Status */}
                                    {validationStatus !== 'none' && (
                                        <View className={`flex-row items-center p-6 rounded-[28px] mt-8 border ${validationStatus === 'valid' ? 'bg-green-50 border-green-100' :
                                            validationStatus === 'invalid' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                                            }`}>
                                            {validationStatus === 'checking' && <ActivityIndicator size="small" color={colors.secondary} className="mr-4" />}
                                            {validationStatus === 'valid' && <CheckCircle2 size={24} color="#10B981" strokeWidth={3} className="mr-4" />}

                                            <View className="flex-1">
                                                <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-0.5 opacity-50">AI Core Status</Text>
                                                <Text className={`text-sm font-black ${validationStatus === 'valid' ? 'text-green-600' :
                                                    validationStatus === 'invalid' ? 'text-red-500' : 'text-secondary'
                                                    }`}>
                                                    {validationStatus === 'checking' ? `Verifying Authenticity... ${uploadProgress}%` :
                                                        validationStatus === 'valid' ? 'Document Authorized' : 'Authorization Failed'}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        <View className="mt-12">
                            <CustomButton
                                title={step === 0 ? "Verify Via OTP" : "Finalize Portal"}
                                onPress={handleNext}
                                loading={loading}
                            />
                        </View>
                    </View>

                    <View className="mt-8 items-center">
                        <Text className="text-[9px] font-black text-textSecondary tracking-[5px] opacity-30">Secure Merchant Onboarding v2</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


export default VendorRegisterScreen;
