import React, { useState } from 'react';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from '../components/FloatingInput';

import CustomButton from '../components/CustomButton';
import TabSwitcher from '../components/TabSwitcher';
import { useTheme } from '../context/ThemeContext';
import { } from '@react-navigation/native';
import { Chrome as Google, Facebook } from 'lucide-react-native';
import { API_BASE_URL } from '../config';

const LoginScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);

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
            alert("Enter valid mobile number first");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });
            const data = await response.json();
            setLoading(false);
            if (data.success) {
                setOtpSent(true);
                setTimer(30);
                alert("Demo OTP: 123456 sent!");
            } else {
                alert(data.message || "Failed to send OTP");
            }
        } catch (error) {
            setLoading(false);
            alert("Network error");
        }
    };

    const handleLogin = async () => {
        if (!mobile || mobile.length < 10) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }

        if (loginMode === 'password' && !password) {
            alert("Please enter your password");
            return;
        }

        if (loginMode === 'otp' && (!otp || otp.length < 6)) {
            alert("Please enter 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const endpoint = loginMode === 'password' ? 'login' : 'login-with-otp';
            const body = loginMode === 'password'
                ? { mobile, password }
                : { mobile, otp };

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
            alert("Server connection failed");
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
                                Flash<Text style={{ color: colors.secondary }}>Deals</Text>
                            </Text>
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">Welcome Back!</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-sm text-center">Login to access the best deals nearby.</Text>
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
                                    {mode === 'password' ? 'Password' : 'OTP Login'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loginMode === 'otp' && otpSent ? (
                        <View>
                            <View className="mb-6 items-center">
                                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold tracking-widest mb-1">Enter Code Sent OTP</Text>
                                <View className="flex-row items-center">
                                    <Text style={{ color: colors.text }} className="font-black text-sm">+91 {mobile}</Text>
                                    <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                                        <Text style={{ color: colors.secondary }} className="ml-2 font-bold text-xs underline">Change</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <FloatingInput
                                label="6-Digit OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <View className="items-center mb-6">
                                {timer > 0 ? (
                                    <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">Resend OTP in {timer}s</Text>
                                ) : (
                                    <TouchableOpacity onPress={handleSendOTP}>
                                        <Text style={{ color: colors.secondary }} className="font-black text-xs tracking-widest underline">Resend code</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View>
                            <FloatingInput
                                label="Mobile Number"
                                value={mobile}
                                onChangeText={setMobile}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!otpSent}
                            />

                            {loginMode === 'password' && (
                                <FloatingInput
                                    label="Password"
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
                            <Text style={{ color: colors.accent }} className="font-semibold text-sm">Forgot Password?</Text>
                        </TouchableOpacity>
                    )}

                    <CustomButton
                        title={loginMode === 'otp' ? (otpSent ? "Verify & Login" : "Get Verification Code") : "Login"}
                        onPress={handleAction}
                        loading={loading}
                    />

                    <View className="flex-row items-center my-6">
                        <View style={{ backgroundColor: colors.border }} className="flex-1 h-[1px]" />
                        <Text style={{ color: colors.textSecondary }} className="mx-4 text-xs font-bold">OR</Text>
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
                        onPress={() => { }}
                    >
                        <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold underline">Skip Login</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mb-10">
                        <Text style={{ color: colors.text }} className="text-sm">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={{ color: colors.secondary }} className="font-bold text-sm">Register Now</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center items-center">
                        <Text style={{ color: colors.textSecondary }} className="text-xs">Terms & Conditions</Text>
                        <View style={{ backgroundColor: colors.border }} className="w-1 h-1 rounded-full mx-2" />
                        <Text style={{ color: colors.textSecondary }} className="text-xs">Privacy Policy</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
