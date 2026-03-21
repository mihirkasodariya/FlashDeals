import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Flame, Clock } from 'lucide-react-native';
import Text from '../components/CustomText';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import OfferCard from '../components/OfferCard';
import { API_BASE_URL } from '../config';

import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpiringDealsScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const savedCoords = await AsyncStorage.getItem('userLocation');
                let url = `${API_BASE_URL}/offers/expiring-soon?radius=15`;
                
                if (savedCoords) {
                    const parsed = JSON.parse(savedCoords);
                    const coords = parsed.coords;
                    if (coords) {
                        url += `&lat=${coords.lat}&lng=${coords.lng}`;
                    }
                }

                console.log(`[ExpiringScreen] Fetching from: ${url}`);
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setOffers(data.offers);
                }
            } catch (error) {
                console.error("Expiring deals fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ backgroundColor: colors.card }} className="px-6 py-4 flex-row items-center border-b border-surface">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <View className="flex-1 ml-2">
                    <Text style={{ color: colors.text }} className="text-xl font-black">{t('home.ending_soon_title') || 'Final Countdown!'}</Text>
                    <Text style={{ color: colors.error }} className="text-[10px] font-black uppercase tracking-widest">{t('home.24h_urgent') || 'Only 24 hours left'}</Text>
                </View>
                <View style={{ backgroundColor: `${colors.error}15` }} className="w-10 h-10 rounded-xl items-center justify-center">
                    <Flame size={22} color={colors.error} strokeWidth={2.5} />
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : offers.length > 0 ? (
                <FlatList
                    data={offers}
                    contentContainerStyle={{ padding: 20 }}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View className="mb-6">
                            <OfferCard
                                offer={item}
                                onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                            />
                        </View>
                    )}
                />
            ) : (
                <View className="flex-1 items-center justify-center px-10">
                    <Clock size={64} color={colors.border} />
                    <Text style={{ color: colors.textSecondary }} className="text-center mt-6 font-bold">{t('home.no_urgent_deals') || 'No urgent deals found right now. Check back soon!'}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ExpiringDealsScreen;
