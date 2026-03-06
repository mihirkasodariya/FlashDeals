import React, { useState, useEffect } from 'react';
import Text from '../components/CustomText';
import { View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Package as LucidePackage, Trash2, Calendar, Tag } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const VendorOffersScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyOffers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileRes.json();

            if (profileData.success) {
                const response = await fetch(`${API_BASE_URL}/offers/vendor/${profileData.user._id}`);
                const data = await response.json();
                if (data.success) {
                    setOffers(data.offers);
                }
            }
        } catch (error) {
            console.error("Fetch my offers error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOffers();
    }, []);

    const renderOfferItem = ({ item }) => {
        const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');
        return (
            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] mb-4 p-4 shadow-sm border overflow-hidden">
                <View className="flex-row">
                    <Image
                        source={{ uri: `${STATIC_BASE_URL}${item.image}` }}
                        style={{ backgroundColor: colors.surface }}
                        className="w-24 h-24 rounded-2xl"
                        resizeMode="cover"
                    />
                    <View className="ml-4 flex-1">
                        <View style={{ backgroundColor: `${colors.primary}15` }} className="self-start px-2 py-1 rounded-lg mb-1">
                            <Text style={{ color: colors.primary }} className="text-[10px] font-black">{t(`categories.${item.category.toLowerCase()}`)}</Text>
                        </View>
                        <Text style={{ color: colors.text }} className="text-lg font-black leading-6" numberOfLines={2}>{item.title}</Text>

                        <View className="flex-row items-center mt-2 opacity-60">
                            <Calendar size={12} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-1">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="ml-4 text-2xl font-black">{t('store.my_flash_offers')}</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOfferItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <View style={{ backgroundColor: colors.surface }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
                                <LucidePackage size={40} color={colors.border} strokeWidth={1.5} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-black">{t('store.no_active_offers')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-center mt-2">{t('store.no_offers_desc')}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AddOffer')}
                                className="mt-8 bg-primary px-8 py-4 rounded-2xl"
                            >
                                <Text className="text-white font-black text-xs tracking-widest">{t('store.create_first_offer')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default VendorOffersScreen;
