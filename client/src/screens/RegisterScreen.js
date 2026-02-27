import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Check } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
import CustomButton from '../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

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
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }
        if (!agreed) {
            Alert.alert("Error", "Please agree to Terms & Conditions");
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
                navigation.navigate('OTP', {
                    mobile,
                    userType: 'user',
                    userId: data.userId
                });
            } else {
                Alert.alert("Registration Failed", data.message || "Something went wrong");
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Cannot connect to server. Please check if server is running.");
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color="#002F34" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-primary">Create Account</Text>
                <View className="w-7" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 }}
                    showsVerticalScrollIndicator={false}
                >

                    <View className="items-center mb-8">
                        <TouchableOpacity className="w-[100px] h-[100px] rounded-full bg-surface justify-center items-center border border-gray-200" onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} className="w-[100px] h-[100px] rounded-full" />
                            ) : (
                                <View className="items-center">
                                    <Camera size={32} color="#54757C" />
                                </View>
                            )}
                            <View className="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full justify-center items-center border-2 border-white">
                                <Camera size={14} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text className="mt-2.5 text-xs text-gray-500 font-medium">Upload Profile Picture</Text>
                    </View>

                    <FloatingInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                    />

                    <FloatingInput
                        label="Mobile Number"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />

                    <FloatingInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <FloatingInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        className="flex-row items-center my-5"
                        onPress={() => setAgreed(!agreed)}
                        activeOpacity={0.7}
                    >
                        <View className={`w-[22px] h-[22px] rounded border-2 justify-center items-center mr-2.5 ${agreed ? 'bg-secondary border-secondary' : 'border-gray-200'}`}>
                            {agreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                        <Text className="text-sm text-gray-500">
                            I agree to the <Text className="text-accent font-semibold">Terms & Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    <CustomButton
                        title="Register"
                        onPress={handleRegister}
                        loading={loading}
                    />

                    <View className="h-[1px] bg-gray-200 my-5" />

                    <CustomButton
                        title="Register as Vendor"
                        variant="outline"
                        onPress={() => navigation.navigate('VendorRegister')}
                    />

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-primary text-sm">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-secondary font-bold text-sm">Login</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
