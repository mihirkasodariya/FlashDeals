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
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Check } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
import CustomButton from '../components/CustomButton';
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
            Alert.alert(t('common.error'), t('register.fill_all_fields'));
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert(t('common.error'), t('register.passwords_mismatch'));
            return;
        }
        if (!agreed) {
            Alert.alert(t('common.error'), t('register.agree_to_terms'));
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
                Alert.alert(t('register.failed'), data.message || t('common.error'));
            }
        } catch (error) {
            setLoading(false);
            Alert.alert(t('common.error'), t('register.server_error'));
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
        </SafeAreaView>
    );
};

export default RegisterScreen;
