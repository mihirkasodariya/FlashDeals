import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
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
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

const ChangePasswordScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t('common.error'), t('register.fill_all_fields'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('common.error'), t('change_password.passwords_mismatch'));
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(t('common.error'), t('change_password.min_chars'));
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
                Alert.alert(t('common.success'), t('change_password.password_updated'), [
                    { text: t('common.yes'), onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert(t('common.error'), data.message || t('common.error'));
            }
        } catch (error) {
            setLoading(false);
            Alert.alert(t('common.error'), t('register.server_error'));
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ borderColor: colors.border }} className="px-4 pt-2.5 flex-row items-center border-b pb-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="ml-4 text-xl font-black">{t('change_password.security_settings')}</Text>
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
                        <View style={{ backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}1A` }} className="w-20 h-20 rounded-[32px] items-center justify-center border mb-5">
                            <ShieldCheck size={40} color={colors.primary} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-black text-center">{t('change_password.update_password')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-sm text-center mt-2 px-6">
                            {t('change_password.update_password_desc')}
                        </Text>
                    </View>

                    <View className="space-y-6">
                        <View>
                            <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px] mb-3 ml-1 uppercase">{t('change_password.auth_check')}</Text>
                            <FloatingInput
                                label={t('change_password.current_password')}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-6">
                            <Text style={{ color: colors.text }} className="text-[10px] font-black tracking-[2px] mb-3 ml-1 uppercase">{t('change_password.new_credentials')}</Text>
                            <FloatingInput
                                label={t('change_password.new_password')}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-6">
                            <FloatingInput
                                label={t('change_password.confirm_new_password')}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-10">
                            <CustomButton
                                title={t('change_password.title')}
                                onPress={handleChangePassword}
                                loading={loading}
                            />
                        </View>

                        <View style={{ backgroundColor: isDarkMode ? `${colors.primary}33` : 'rgba(245, 247, 248, 0.5)', borderColor: colors.border }} className="mt-8 p-6 rounded-[24px] border">
                            <View className="flex-row items-center mb-2">
                                <Lock size={14} color={staticColors.secondary} />
                                <Text style={{ color: staticColors.secondary }} className="ml-2 text-[10px] font-black tracking-widest uppercase">{t('change_password.security_tip')}</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="text-xs leading-relaxed font-medium">
                                {t('change_password.password_policy')}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
