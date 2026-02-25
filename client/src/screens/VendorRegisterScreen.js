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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react-native';
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
    const [validationStatus, setValidationStatus] = useState('none');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);

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
        Alert.alert('Success', 'Current location captured successfully!');
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
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        mobile: formData.mobile,
                        password: formData.password,
                        role: 'vendor'
                    })
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
            console.log("Submitting Step 1 for UserID:", userId);

            if (!userId) {
                alert("Critical Error: User ID is missing. Please restart registration.");
                setLoading(false);
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
                    headers: {
                        'Accept': 'application/json',
                    },
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
                console.error("Upload Error:", error);
                alert("Server connection failed during upload");
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity onPress={() => step === 0 ? navigation.goBack() : setStep(0)}>
                    <ChevronLeft size={28} color="#002F34" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-primary">Vendor Registration</Text>
                <View className="w-7" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

                    <ProgressSteps currentStep={step} />

                    {step === 0 ? (
                        <View>
                            <Text className="text-xl font-bold text-primary mb-2">Business Details</Text>
                            <FloatingInput
                                label="Full Name"
                                value={formData.name}
                                onChangeText={(val) => setFormData({ ...formData, name: val })}
                            />
                            <FloatingInput
                                label="Mobile Number"
                                value={formData.mobile}
                                onChangeText={(val) => setFormData({ ...formData, mobile: val })}
                                keyboardType="phone-pad"
                            />
                            <FloatingInput
                                label="Password"
                                value={formData.password}
                                onChangeText={(val) => setFormData({ ...formData, password: val })}
                                secureTextEntry
                            />
                            <FloatingInput
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                                secureTextEntry
                            />
                        </View>
                    ) : (
                        <View>
                            <Text className="text-xl font-bold text-primary mb-2">Document Verification</Text>
                            <Text className="text-sm text-gray-500 mb-5">Upload government ID for verification</Text>

                            <View className="flex-row mb-5 bg-surface p-1 rounded-lg">
                                {['GSTIN', 'Aadhaar'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        className={`flex-1 py-2.5 items-center rounded-md ${formData.idType === type ? 'bg-white shadow-sm' : ''}`}
                                        onPress={() => setFormData({ ...formData, idType: type })}
                                    >
                                        <Text className={`text-sm font-semibold ${formData.idType === type ? 'text-primary' : 'text-gray-500'}`}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <FloatingInput
                                label="Shop / Store Name"
                                value={formData.storeName}
                                onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                            />

                            <FloatingInput
                                label={`${formData.idType} Number`}
                                value={formData.idNumber}
                                onChangeText={(val) => setFormData({ ...formData, idNumber: val })}
                            />

                            <View className="mb-4">
                                <AddressAutocomplete
                                    label="Full Shop / Store Address"
                                    value={formData.storeAddress}
                                    onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                                />

                                <TouchableOpacity
                                    onPress={getCurrentLocation}
                                    className="mt-2 flex-row items-center border border-accent/20 bg-accent/5 py-3 rounded-lg px-4"
                                >
                                    <View className={`w-3 h-3 rounded-full mr-3 ${formData.location ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <Text className="text-accent font-bold">
                                        {formData.location ? 'Current Location Captured' : 'Use Current GPS Location'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity className="h-[180px] border-2 border-gray-200 border-dashed rounded-xl mt-2.5 justify-center items-center bg-surface overflow-hidden" onPress={pickDocument}>
                                {docImage ? (
                                    <View className="w-full h-full">
                                        <Image source={{ uri: docImage }} className="w-full h-full" />
                                        <View className="absolute inset-0 bg-black/30 justify-center items-center">
                                            <RefreshCw size={24} color="#FFFFFF" />
                                            <Text className="text-white mt-2 font-bold">Change Image</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="items-center">
                                        <Upload size={32} color="#00A49F" />
                                        <Text className="mt-2.5 text-base font-semibold text-primary">Upload {formData.idType} Image</Text>
                                        <Text className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {validationStatus !== 'none' && (
                                <View className={`flex-row items-center p-3 rounded-lg mt-4 border ${validationStatus === 'valid' ? 'bg-green-50 border-green-200' :
                                    validationStatus === 'invalid' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                                    }`}>
                                    {validationStatus === 'checking' && <ActivityIndicator size="small" color="#00A49F" className="mr-2" />}
                                    {validationStatus === 'valid' && <CheckCircle2 size={18} color="#27AE60" className="mr-2" />}
                                    {validationStatus === 'invalid' && <AlertCircle size={18} color="#EB5757" className="mr-2" />}

                                    <Text className={`text-[13px] font-bold ${validationStatus === 'valid' ? 'text-green-600' :
                                        validationStatus === 'invalid' ? 'text-red-500' : 'text-accent'
                                        }`}>
                                        {validationStatus === 'checking' ? `AI Checking... ${uploadProgress}%` :
                                            validationStatus === 'valid' ? 'Valid Document Detected' : 'Invalid Document'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <CustomButton
                        title={step === 0 ? "Next: OTP Verification" : "Submit Registration"}
                        onPress={handleNext}
                        loading={loading}
                        className="mt-8"
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default VendorRegisterScreen;
