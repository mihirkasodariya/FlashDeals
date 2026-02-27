import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from '../components/FloatingInput';

import CustomButton from '../components/CustomButton';
import TabSwitcher from '../components/TabSwitcher';
import { useNavigation } from '@react-navigation/native';
import { Chrome as Google, Facebook } from 'lucide-react-native';
import { API_BASE_URL } from '../config';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                navigation.replace('Main');
            }
        };
        checkToken();
    }, []);

    const handleLogin = async () => {
        if (!mobile || mobile.length < 10) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }
        if (!password) {
            alert("Please enter your password");
            return;
        }

        setLoading(true);
        console.log("Attempting login at:", `${API_BASE_URL}/auth/login`);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, password })
            });

            console.log("Response status:", response.status);
            const data = await response.json();

            setLoading(false);

            if (data.success) {
                // Save JWT Token in local storage
                await AsyncStorage.setItem('userToken', data.token);

                if (data.user.role === 'vendor' && !data.user.isVerified) {
                    navigation.navigate('ActivationStatus');
                } else {
                    navigation.navigate('Main');
                }
            } else {

                alert(data.message || "Login failed");
            }
        } catch (error) {
            setLoading(false);
            console.error("Login connection error:", error);
            alert("Server connection failed: " + error.message);
        }

    };

    return (
        <SafeAreaView className="flex-1 bg-white">
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
                            <Text className="text-4xl font-black text-primary tracking-tighter">
                                Flash<Text className="text-secondary">Deals</Text>
                            </Text>
                        </View>
                        <Text className="text-2xl font-bold text-primary mb-2">Welcome Back!</Text>
                        <Text className="text-sm text-gray-500 text-center">Login to access the best deals nearby.</Text>
                    </View>

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

                    <TouchableOpacity
                        className="self-end mb-5"
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text className="text-accent font-semibold text-sm">Forgot Password?</Text>
                    </TouchableOpacity>

                    <CustomButton
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                    />

                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-[1px] bg-gray-200" />
                        <Text className="mx-4 text-gray-500 text-xs font-bold">OR</Text>
                        <View className="flex-1 h-[1px] bg-gray-200" />
                    </View>

                    <View className="flex-row justify-between mb-6">
                        <TouchableOpacity className="flex-[0.48] flex-row h-[50px] border border-gray-200 rounded-lg justify-center items-center">
                            <Google size={24} color="#DB4437" />
                            <Text className="ml-2.5 text-sm font-semibold text-primary">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-[0.48] flex-row h-[50px] border border-gray-200 rounded-lg justify-center items-center">
                            <Facebook size={24} color="#4267B2" />
                            <Text className="ml-2.5 text-sm font-semibold text-primary">Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="items-center mb-6"
                        onPress={() => { }}
                    >
                        <Text className="text-gray-500 text-sm font-semibold underline">Skip Login</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mb-10">
                        <Text className="text-primary text-sm">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-secondary font-bold text-sm">Register Now</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center items-center">
                        <Text className="text-xs text-gray-400">Terms & Conditions</Text>
                        <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                        <Text className="text-xs text-gray-400">Privacy Policy</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
