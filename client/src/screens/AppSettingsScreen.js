import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, Switch, Modal, Alert, Share, Platform, Linking, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Globe, Moon, Sun, Bell, Star, Share2, HelpCircle, ChevronRight, Check, Lock, History } from 'lucide-react-native';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, checkNotificationPermissions } from '../utils/notificationService';

const RECOMMENDED_LANGUAGES = [
    { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { id: 'gj', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' }
];

const ALL_LANGUAGES = [
    { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { id: 'as', name: 'Assamese', native: 'অસમીયા', flag: '🇮🇳' },
    { id: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    { id: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { id: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { id: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { id: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { id: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
    { id: 'ma', name: 'Maithili', native: 'मैતીલી', flag: '🇮🇳' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { id: 'mr', name: 'Marathi', native: 'મરાઠી', flag: '🇮🇳' },
    { id: 'or', name: 'Odia', native: 'ଓଡ଼િଆ', flag: '🇮🇳' },
    { id: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
    { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬી', flag: '🇮🇳' },
    { id: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { id: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' },
    { id: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { id: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' }
];

const SettingRow = ({ icon: Icon, label, value, type = 'toggle', onPress, color, subLabel, colors, isDarkMode }) => (
    <TouchableOpacity
        activeOpacity={type === 'toggle' ? 1 : 0.7}
        onPress={onPress}
        style={{ borderBottomColor: colors.border }}
        className="flex-row items-center py-5 border-b"
    >
        <View style={{ backgroundColor: `${color}10` }} className="w-12 h-12 rounded-[18px] items-center justify-center">
            <Icon size={22} color={color} strokeWidth={2.5} />
        </View>
        <View className="flex-1 ml-5">
            <Text style={{ color: colors.text }} className="font-bold text-sm">{label}</Text>
            {subLabel && <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-0.5 opacity-50">{subLabel}</Text>}
        </View>

        {type === 'toggle' ? (
            <Switch
                value={value}
                onValueChange={onPress}
                trackColor={{ false: isDarkMode ? '#333' : '#E5E7EB', true: colors.primary }}
                thumbColor="white"
                ios_backgroundColor="#E5E7EB"
            />
        ) : type === 'value' ? (
            <View className="flex-row items-center">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold mr-2">{value}</Text>
                <ChevronRight size={16} color="#D1D5DB" strokeWidth={3} />
            </View>
        ) : (
            <ChevronRight size={18} color="#D1D5DB" strokeWidth={3} />
        )}
    </TouchableOpacity>
);

const AppSettingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const { t, i18n } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedLang, setSelectedLang] = useState(
        RECOMMENDED_LANGUAGES.find(l => l.id === i18n.language) ||
        ALL_LANGUAGES.find(l => l.id === i18n.language) ||
        RECOMMENDED_LANGUAGES[0]
    );
    const [isLangModalVisible, setIsLangModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsLoggedIn(!!token);

            const notifPref = await AsyncStorage.getItem('notificationsEnabled');
            if (notifPref !== null) {
                setNotificationsEnabled(notifPref === 'true');
            } else {
                // If no preference yet, check if we already have permissions
                const hasPerms = await checkNotificationPermissions();
                setNotificationsEnabled(hasPerms);
            }
        };
        loadSettings();
    }, []);

    const handleNotificationToggle = async () => {
        const newValue = !notificationsEnabled;

        if (newValue) {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                setNotificationsEnabled(true);
                await AsyncStorage.setItem('notificationsEnabled', 'true');
                if (token !== 'demo-token-simulator') {
                    // Here you would typically send the token to your backend
                    console.log('Push Token:', token);
                }
            } else {
                Alert.alert(
                    t('common.error'),
                    "Push notification permissions are required. Please enable them in your device settings."
                );
            }
        } else {
            setNotificationsEnabled(false);
            await AsyncStorage.setItem('notificationsEnabled', 'false');
        }
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: t('settings.share_message'),
                url: 'https://offerz.com'
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRateApp = () => {
        const storeUrl = Platform.OS === 'ios'
            ? 'itms-apps://itunes.apple.com/app/id123456789'
            : 'market://details?id=com.mihirkasodariya.Offerz';

        Linking.canOpenURL(storeUrl).then(supported => {
            if (supported) {
                Linking.openURL(storeUrl);
            } else {
                Alert.alert(t('settings.rate_us'), t('settings.rate_us_desc'));
            }
        });
    };

    const handleResetIntro = () => {
        navigation.navigate('Onboarding', { fromSettings: true });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <View style={{ backgroundColor: colors.card }} className="px-6 py-4 flex-row items-center shadow-sm">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="ml-4 text-xl font-black">{t('settings.title')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                {isLoggedIn && (
                    <View className="mt-8">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">{t('settings.account_security')}</Text>
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                            <SettingRow
                                icon={Lock}
                                label={t('settings.change_password')}
                                subLabel={t('settings.change_password_desc')}
                                type="nav"
                                onPress={() => navigation.navigate('ChangePassword')}
                                color={colors.warning}
                                colors={colors}
                                isDarkMode={isDarkMode}
                            />
                            <SettingRow
                                icon={History}
                                label={t('settings.login_history')}
                                subLabel={t('settings.login_history_desc')}
                                type="nav"
                                onPress={() => navigation.navigate('LoginHistory')}
                                color={colors.secondary}
                                colors={colors}
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    </View>
                )}

                <View className="mt-8">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">{t('settings.appearance')}</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        <SettingRow
                            icon={isDarkMode ? Moon : Sun}
                            label={t('settings.dark_mode')}
                            subLabel={t('settings.dark_mode_desc')}
                            value={isDarkMode}
                            onPress={toggleTheme}
                            color={isDarkMode ? '#A78BFA' : staticColors.warning}
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                        <SettingRow
                            icon={Globe}
                            label={t('settings.app_language')}
                            subLabel={t('settings.app_language_desc')}
                            value={selectedLang.native}
                            type="value"
                            onPress={() => setIsLangModalVisible(true)}
                            color="#3B82F6"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                <View className="mt-8">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">{t('settings.preferences')}</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        <SettingRow
                            icon={Bell}
                            label={t('settings.push_notifications')}
                            subLabel={t('settings.push_notifications_desc')}
                            value={notificationsEnabled}
                            onPress={handleNotificationToggle}
                            color="#10B981"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                        <SettingRow
                            icon={HelpCircle}
                            label={t('settings.show_intro')}
                            subLabel={t('settings.show_intro_desc')}
                            type="nav"
                            onPress={handleResetIntro}
                            color="#F59E0B"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                <View className="mt-8">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">{t('settings.about')}</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        <SettingRow
                            icon={Star}
                            label={t('settings.rate_app')}
                            subLabel={t('settings.rate_app_desc')}
                            type="nav"
                            onPress={handleRateApp}
                            color="#FACC15"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                        <SettingRow
                            icon={Share2}
                            label={t('settings.share_app')}
                            subLabel={t('settings.share_app_desc')}
                            type="nav"
                            onPress={handleShareApp}
                            color="#EC4899"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            <Modal visible={isLangModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsLangModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <Pressable className="flex-1" onPress={() => setIsLangModalVisible(false)} />
                    <View style={{ backgroundColor: colors.card }} className="rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View style={{ backgroundColor: colors.border }} className="w-16 h-1.5 rounded-full self-center mb-10 opacity-30" />

                        <Text style={{ color: colors.text }} className="text-3xl font-black mb-2">{t('language_selection.title')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="mb-8 font-medium opacity-60">{t('language_selection.subtitle')}</Text>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ height: '60%' }}>
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-4 opacity-40 uppercase">{t('language_selection.recommended')}</Text>
                            <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[32px] p-4 border mb-6">
                                {RECOMMENDED_LANGUAGES.map((lang, index) => (
                                    <TouchableOpacity
                                        key={lang.id}
                                        onPress={async () => {
                                            setSelectedLang(lang);
                                            await i18n.changeLanguage(lang.id);
                                            await AsyncStorage.setItem('app_language', lang.id);
                                            setIsLangModalVisible(false);
                                        }}
                                        style={{ borderBottomColor: index !== RECOMMENDED_LANGUAGES.length - 1 ? colors.border : 'transparent' }}
                                        className={`flex-row items-center py-4 ${index !== RECOMMENDED_LANGUAGES.length - 1 ? 'border-b' : ''}`}
                                    >
                                        <View style={{ backgroundColor: selectedLang.id === lang.id ? `${colors.primary}15` : colors.background }} className="w-12 h-12 rounded-[18px] items-center justify-center mr-4">
                                            <Text className="text-2xl">{lang.flag}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.text }} className={`font-bold text-sm ${selectedLang.id !== lang.id ? 'opacity-70' : ''}`}>{lang.native}</Text>
                                            <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-0.5 font-bold opacity-50">{lang.name}</Text>
                                        </View>
                                        {selectedLang.id === lang.id && (
                                            <View style={{ backgroundColor: colors.primary }} className="w-6 h-6 rounded-full items-center justify-center">
                                                <Check size={14} color="white" strokeWidth={4} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-4 opacity-40 uppercase">{t('language_selection.all_languages')}</Text>
                            <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[32px] p-4 border mb-6">
                                {ALL_LANGUAGES.map((lang, index) => (
                                    <TouchableOpacity
                                        key={lang.id}
                                        onPress={async () => {
                                            setSelectedLang(lang);
                                            await i18n.changeLanguage(lang.id);
                                            await AsyncStorage.setItem('app_language', lang.id);
                                            setIsLangModalVisible(false);
                                        }}
                                        style={{ borderBottomColor: index !== ALL_LANGUAGES.length - 1 ? colors.border : 'transparent' }}
                                        className={`flex-row items-center py-4 ${index !== ALL_LANGUAGES.length - 1 ? 'border-b' : ''}`}
                                    >
                                        <View style={{ backgroundColor: selectedLang.id === lang.id ? `${colors.primary}15` : colors.background }} className="w-12 h-12 rounded-[18px] items-center justify-center mr-4">
                                            <Text className="text-2xl">{lang.flag}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.text }} className={`font-bold text-sm ${selectedLang.id !== lang.id ? 'opacity-70' : ''}`}>{lang.native}</Text>
                                            <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-0.5 font-bold opacity-50">{lang.name}</Text>
                                        </View>
                                        {selectedLang.id === lang.id && (
                                            <View style={{ backgroundColor: colors.primary }} className="w-6 h-6 rounded-full items-center justify-center">
                                                <Check size={14} color="white" strokeWidth={4} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setIsLangModalVisible(false)}
                            style={{ backgroundColor: colors.surface }}
                            className="mt-6 py-5 rounded-[24px] items-center"
                        >
                            <Text style={{ color: colors.text }} className="font-black text-sm tracking-widest uppercase">{t('settings.discard')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default AppSettingsScreen;
