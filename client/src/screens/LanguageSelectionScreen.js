import React, { useState } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const RECOMMENDED_LANGUAGES = [
    { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { id: 'gj', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' }
];

const ALL_LANGUAGES = [
    { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { id: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
    { id: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    { id: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { id: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { id: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { id: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { id: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
    { id: 'ma', name: 'Maithili', native: 'मैथिली', flag: '🇮🇳' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { id: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
    { id: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { id: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
    { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { id: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { id: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳' },
    { id: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { id: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳' }
];

const LanguageSelectionScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [selectedLang, setSelectedLang] = useState(RECOMMENDED_LANGUAGES[0]);

    // Check for saved language on mount
    React.useEffect(() => {
        const checkLanguage = async () => {
            const savedLang = await AsyncStorage.getItem('app_language');
            if (savedLang) {
                const found = [...RECOMMENDED_LANGUAGES, ...ALL_LANGUAGES].find(l => l.id === savedLang);
                if (found) setSelectedLang(found);
            }
        };
        checkLanguage();
    }, []);

    const handleContinue = async () => {
        try {
            // Save language preference
            await AsyncStorage.setItem('app_language', selectedLang.id);
            // Change language in i18n
            await i18n.changeLanguage(selectedLang.id);

            const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
            if (hasSeen === 'true') {
                navigation.replace('Main');
            } else {
                navigation.replace('Onboarding');
            }
        } catch (error) {
            navigation.replace('Onboarding');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="px-6 pt-10 pb-6 shadow-sm z-10" style={{ backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }} className="text-3xl font-black mb-2">{t('language_selection.title')}</Text>
                <Text style={{ color: colors.textSecondary }} className="mb-2 font-medium opacity-60">{t('language_selection.subtitle')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mt-4 mb-4 opacity-40 uppercase">{t('language_selection.recommended')}</Text>
                <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[32px] p-4 border mb-6">
                    {RECOMMENDED_LANGUAGES.map((lang, index) => (
                        <TouchableOpacity
                            key={lang.id}
                            onPress={() => setSelectedLang(lang)}
                            style={{ borderBottomColor: index !== RECOMMENDED_LANGUAGES.length - 1 ? colors.border : 'transparent' }}
                            className={`flex-row items-center py-4 ${index !== RECOMMENDED_LANGUAGES.length - 1 ? 'border-b' : ''}`}
                        >
                            <View style={{ backgroundColor: selectedLang.id === lang.id ? `${colors.primary}15` : colors.background }} className="w-12 h-12 rounded-[18px] items-center justify-center mr-4">
                                <Text className="text-2xl">{lang.flag}</Text>
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: colors.text }} className={`font-bold text-sm ${selectedLang.id !== lang.id ? 'opacity-70' : ''}`}>{lang.name}</Text>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-0.5 font-bold opacity-50">{lang.native}</Text>
                            </View>
                            {selectedLang.id === lang.id && (
                                <View style={{ backgroundColor: colors.primary }} className="w-6 h-6 rounded-full items-center justify-center border border-white/20">
                                    <Check size={14} color="white" strokeWidth={4} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-4 opacity-40 uppercase">{t('language_selection.all_languages')}</Text>
                <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[32px] p-4 border mb-24">
                    {ALL_LANGUAGES.map((lang, index) => (
                        <TouchableOpacity
                            key={lang.id}
                            onPress={() => setSelectedLang(lang)}
                            style={{ borderBottomColor: index !== ALL_LANGUAGES.length - 1 ? colors.border : 'transparent' }}
                            className={`flex-row items-center py-4 ${index !== ALL_LANGUAGES.length - 1 ? 'border-b' : ''}`}
                        >
                            <View style={{ backgroundColor: selectedLang.id === lang.id ? `${colors.primary}15` : colors.background }} className="w-12 h-12 rounded-[18px] items-center justify-center mr-4">
                                <Text className="text-2xl">{lang.flag}</Text>
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: colors.text }} className={`font-bold text-sm ${selectedLang.id !== lang.id ? 'opacity-70' : ''}`}>{lang.name}</Text>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] mt-0.5 font-bold opacity-50">{lang.native}</Text>
                            </View>
                            {selectedLang.id === lang.id && (
                                <View style={{ backgroundColor: colors.primary }} className="w-6 h-6 rounded-full items-center justify-center border border-white/20">
                                    <Check size={14} color="white" strokeWidth={4} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View 
                style={{ 
                    backgroundColor: colors.background, 
                    paddingBottom: Math.max(20, insets.bottom + 20),
                    paddingTop: 16
                }} 
                className="px-6 absolute bottom-0 left-0 right-0 border-t border-black/5 shadow-2xl"
            >
                <TouchableOpacity
                    onPress={handleContinue}
                    style={{ backgroundColor: colors.primary }}
                    className="w-full h-16 rounded-[24px] flex-row items-center justify-center shadow-lg shadow-primary/30"
                >
                    <Text style={{ color: '#FFFFFF' }} className="text-white font-black tracking-widest mr-2">
                        {t('language_selection.continue', { lang: selectedLang.native })}
                    </Text>
                    <ChevronRight size={20} color="white" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default LanguageSelectionScreen;
