import React, { useState } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, Switch, Modal, Alert, Share, Platform, Linking, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Globe, Moon, Sun, Bell, Star, Share2, HelpCircle, ChevronRight, Check, Lock, History } from 'lucide-react-native';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'gj', name: 'Gujarati', native: 'ગુજરાતી' }
];

// Moving SettingRow outside to prevent re-creation on every render
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
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [isLangModalVisible, setIsLangModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    React.useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsLoggedIn(!!token);
        };
        checkToken();
    }, []);

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Check out FlashDeals! Get the best local offers in real-time. Download now.',
                url: 'https://flashdeals.com'
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRateApp = () => {
        const storeUrl = Platform.OS === 'ios'
            ? 'itms-apps://itunes.apple.com/app/id123456789'
            : 'market://details?id=com.flashdeals.app';

        Linking.canOpenURL(storeUrl).then(supported => {
            if (supported) {
                Linking.openURL(storeUrl);
            } else {
                Alert.alert("Rate Us", "Thank you for your support! App store links will be active upon release.");
            }
        });
    };

    const handleResetIntro = () => {
        Alert.alert(
            "Onboarding Intro",
            "Would you like to see the welcome intro again on next restart?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Reset",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('hasSeenOnboarding');
                            Alert.alert("Success", "Onboarding has been reset! Restart the app to see it.");
                        } catch (e) {
                            Alert.alert("Error", "Failed to reset intro.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            {/* Header */}
            <View style={{ backgroundColor: colors.card }} className="px-6 py-4 flex-row items-center shadow-sm">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="ml-4 text-xl font-black">App Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                {/* Account Section */}
                {isLoggedIn && (
                    <View className="mt-8">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">Account Security</Text>
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                            <SettingRow
                                icon={Lock}
                                label="Change Password"
                                subLabel="Update your account password"
                                type="nav"
                                onPress={() => navigation.navigate('ChangePassword')}
                                color={colors.warning}
                                colors={colors}
                                isDarkMode={isDarkMode}
                            />
                            <SettingRow
                                icon={History}
                                label="Login History"
                                subLabel="View recent login activity"
                                type="nav"
                                onPress={() => navigation.navigate('LoginHistory')}
                                color={colors.secondary}
                                colors={colors}
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    </View>
                )}

                {/* Visual Section */}
                <View className="mt-8">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">Appearance</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        <SettingRow
                            icon={isDarkMode ? Moon : Sun}
                            label="Dark Mode"
                            subLabel="Optimize for night viewing"
                            value={isDarkMode}
                            onPress={toggleTheme}
                            color={isDarkMode ? '#A78BFA' : staticColors.warning}
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                        <SettingRow
                            icon={Globe}
                            label="App Language"
                            subLabel="Set your preferred language"
                            value={selectedLang.name}
                            type="value"
                            onPress={() => setIsLangModalVisible(true)}
                            color="#3B82F6"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <View className="mt-8">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">Preferences</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        <SettingRow
                            icon={Bell}
                            label="Push Notifications"
                            subLabel="Vibrate and show alerts"
                            value={notificationsEnabled}
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                            color="#10B981"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                        <SettingRow
                            icon={HelpCircle}
                            label="Show Intro Again"
                            subLabel="Replay onboarding screens"
                            type="nav"
                            onPress={handleResetIntro}
                            color="#F59E0B"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                {/* Growth Section */}
                <View className="mt-8">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-6 opacity-40 uppercase">About FlashDeals</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        <SettingRow
                            icon={Star}
                            label="Rate This App"
                            subLabel="Support us on App Store"
                            type="nav"
                            onPress={handleRateApp}
                            color="#FACC15"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                        <SettingRow
                            icon={Share2}
                            label="Share This App"
                            subLabel="Invite your friends"
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

            {/* Language Selector Modal */}
            <Modal visible={isLangModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsLangModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <Pressable className="flex-1" onPress={() => setIsLangModalVisible(false)} />
                    <View style={{ backgroundColor: colors.card }} className="rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View style={{ backgroundColor: colors.border }} className="w-16 h-1.5 rounded-full self-center mb-10 opacity-30" />

                        <Text style={{ color: colors.text }} className="text-3xl font-black mb-2">Language</Text>
                        <Text style={{ color: colors.textSecondary }} className="mb-8 font-medium opacity-60">Choose your primary app language.</Text>

                        <View className="space-y-4">
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.id}
                                    onPress={() => {
                                        setSelectedLang(lang);
                                        setIsLangModalVisible(false);
                                    }}
                                    style={{
                                        backgroundColor: selectedLang.id === lang.id ? `${colors.primary}10` : colors.surface,
                                        borderColor: selectedLang.id === lang.id ? colors.primary : colors.border
                                    }}
                                    className={`flex-row items-center p-6 rounded-[24px] border mb-4`}
                                >
                                    <View className="flex-1">
                                        <Text style={{ color: colors.text }} className={`font-black text-lg ${selectedLang.id !== lang.id && 'opacity-60'}`}>{lang.name}</Text>
                                        <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-0.5 font-bold opacity-50">{lang.native}</Text>
                                    </View>
                                    {selectedLang.id === lang.id && (
                                        <View style={{ backgroundColor: colors.primary }} className="w-8 h-8 rounded-full items-center justify-center">
                                            <Check size={18} color="white" strokeWidth={4} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsLangModalVisible(false)}
                            style={{ backgroundColor: colors.surface }}
                            className="mt-6 py-5 rounded-[24px] items-center"
                        >
                            <Text style={{ color: colors.text }} className="font-black text-sm tracking-widest uppercase">Discard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default AppSettingsScreen;
