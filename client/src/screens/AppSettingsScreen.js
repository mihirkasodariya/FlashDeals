import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Alert, Share, Platform, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Globe, Moon, Sun, Bell, Star, Share2, HelpCircle, ChevronRight, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';

const LANGUAGES = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'gj', name: 'Gujarati', native: 'ગુજરાતી' }
];

const AppSettingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [isLangModalVisible, setIsLangModalVisible] = useState(false);

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Check out FlashDeals! Get the best local offers in real-time. Download now.',
                url: 'https://flashdeals.com' // Placeholder
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRateApp = () => {
        const storeUrl = Platform.OS === 'ios'
            ? 'itms-apps://itunes.apple.com/app/id123456789' // Placeholder
            : 'market://details?id=com.flashdeals.app'; // Placeholder

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
                { text: "Yes, Reset", onPress: () => Alert.alert("Success", "Onboarding has been reset!") }
            ]
        );
    };

    const SettingRow = ({ icon: Icon, label, value, type = 'toggle', onPress, color = colors.primary, subLabel }) => (
        <TouchableOpacity
            activeOpacity={type === 'toggle' ? 1 : 0.7}
            onPress={onPress}
            className="flex-row items-center py-5 border-b border-surface"
        >
            <View style={{ backgroundColor: `${color}10` }} className="w-12 h-12 rounded-[18px] items-center justify-center">
                <Icon size={22} color={color} strokeWidth={2.5} />
            </View>
            <View className="flex-1 ml-5">
                <Text className="text-primary font-bold text-sm">{label}</Text>
                {subLabel && <Text className="text-textSecondary text-[10px] font-bold mt-0.5 opacity-50">{subLabel}</Text>}
            </View>

            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#E5E7EB', true: colors.primary }}
                    thumbColor="white"
                    ios_backgroundColor="#E5E7EB"
                />
            ) : type === 'value' ? (
                <View className="flex-row items-center">
                    <Text className="text-textSecondary text-xs font-bold mr-2">{value}</Text>
                    <ChevronRight size={16} color="#D1D5DB" strokeWidth={3} />
                </View>
            ) : (
                <ChevronRight size={18} color="#D1D5DB" strokeWidth={3} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center bg-white shadow-sm">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center bg-surface rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-black text-primary">App Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                {/* Visual Section */}
                <View className="mt-8">
                    <Text className="text-[10px] font-black text-textSecondary tracking-[2px] mb-6 opacity-40">Appearance</Text>
                    <View className="bg-white rounded-[32px] p-4 shadow-sm border border-surface">
                        <SettingRow
                            icon={isDarkMode ? Moon : Sun}
                            label="Dark Mode"
                            subLabel="Optimize for night viewing"
                            value={isDarkMode}
                            onPress={() => setIsDarkMode(!isDarkMode)}
                            color={isDarkMode ? '#A78BFA' : colors.warning}
                        />
                        <SettingRow
                            icon={Globe}
                            label="App Language"
                            subLabel="Set your preferred language"
                            value={selectedLang.name}
                            type="value"
                            onPress={() => setIsLangModalVisible(true)}
                            color="#3B82F6"
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <View className="mt-8">
                    <Text className="text-[10px] font-black text-textSecondary tracking-[2px] mb-6 opacity-40">Preferences</Text>
                    <View className="bg-white rounded-[32px] p-4 shadow-sm border border-surface">
                        <SettingRow
                            icon={Bell}
                            label="Push Notifications"
                            subLabel="Vibrate and show alerts"
                            value={notificationsEnabled}
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                            color="#10B981"
                        />
                        <SettingRow
                            icon={HelpCircle}
                            label="Show Intro Again"
                            subLabel="Replay onboarding screens"
                            type="nav"
                            onPress={handleResetIntro}
                            color="#F59E0B"
                        />
                    </View>
                </View>

                {/* Growth Section */}
                <View className="mt-8">
                    <Text className="text-[10px] font-black text-textSecondary tracking-[2px] mb-6 opacity-40">About FlashDeals</Text>
                    <View className="bg-white rounded-[32px] p-4 shadow-sm border border-surface">
                        <SettingRow
                            icon={Star}
                            label="Rate This App"
                            subLabel="Support us on App Store"
                            type="nav"
                            onPress={handleRateApp}
                            color="#FACC15"
                        />
                        <SettingRow
                            icon={Share2}
                            label="Share This App"
                            subLabel="Invite your friends"
                            type="nav"
                            onPress={handleShareApp}
                            color="#EC4899"
                        />
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Language Selector Modal */}
            <Modal visible={isLangModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View className="w-16 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-10" />

                        <Text className="text-3xl font-black text-primary mb-2">Language</Text>
                        <Text className="text-textSecondary mb-8 font-medium">Choose your primary app language.</Text>

                        <View className="space-y-4">
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.id}
                                    onPress={() => {
                                        setSelectedLang(lang);
                                        setIsLangModalVisible(false);
                                    }}
                                    className={`flex-row items-center p-6 rounded-[24px] border ${selectedLang.id === lang.id ? 'bg-primary/5 border-primary' : 'bg-surface border-transparent'}`}
                                >
                                    <View className="flex-1">
                                        <Text className={`font-black text-lg ${selectedLang.id === lang.id ? 'text-primary' : 'text-primary/60'}`}>{lang.name}</Text>
                                        <Text className="text-textSecondary text-xs mt-0.5 font-bold opacity-50">{lang.native}</Text>
                                    </View>
                                    {selectedLang.id === lang.id && (
                                        <View className="bg-primary w-8 h-8 rounded-full items-center justify-center">
                                            <Check size={18} color="white" strokeWidth={4} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsLangModalVisible(false)}
                            className="mt-10 bg-surface py-5 rounded-[24px] items-center"
                        >
                            <Text className="text-primary font-black text-sm tracking-widest">Discard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default AppSettingsScreen;
