import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, ShieldCheck } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
import CustomButton from '../components/CustomButton';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                Alert.alert("Success", "Password updated successfully!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Failed", data.message || "Could not change password");
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Server connection failed");
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 pt-2.5 flex-row items-center border-b border-surface pb-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-surface rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-black text-primary">Security Settings</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-primary/5 rounded-[32px] items-center justify-center border border-primary/10 mb-5">
                            <ShieldCheck size={40} color={colors.primary} />
                        </View>
                        <Text className="text-2xl font-black text-primary text-center">Update Password</Text>
                        <Text className="text-sm text-gray-500 text-center mt-2 px-6">
                            Manage your digital perimeter by keeping your credentials refreshed.
                        </Text>
                    </View>

                    <View className="space-y-6">
                        <View>
                            <Text className="text-[10px] font-black text-secondary tracking-[2px] mb-3 ml-1 uppercase">Authentication Check</Text>
                            <FloatingInput
                                label="Current Password"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-6">
                            <Text className="text-[10px] font-black text-primary tracking-[2px] mb-3 ml-1 uppercase">New Credentials</Text>
                            <FloatingInput
                                label="New Password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-6">
                            <FloatingInput
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-10">
                            <CustomButton
                                title="Change Password"
                                onPress={handleChangePassword}
                                loading={loading}
                            />
                        </View>

                        <View className="mt-8 bg-surface/50 p-6 rounded-[24px] border border-surface">
                            <View className="flex-row items-center mb-2">
                                <Lock size={14} color={colors.secondary} />
                                <Text className="ml-2 text-[10px] font-black text-secondary tracking-widest uppercase">Security Tip</Text>
                            </View>
                            <Text className="text-xs text-gray-500 leading-relaxed font-medium">
                                A strong password contains at least 8 characters, including symbols and numbers to ensure your store data remains secure.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
