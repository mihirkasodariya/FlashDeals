import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import { View, FlatList, Image, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import OfferCard from '../components/OfferCard';
import { API_BASE_URL } from '../config';

const DummyBannerAd = ({ colors, label = "Google Test Ad (Banner)" }) => (
    <View
        style={{
            backgroundColor: '#f5f5f5',
            height: 60,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#e0e0e0'
        }}
    >
        <View style={{ backgroundColor: '#4285F4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, marginRight: 8 }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Ad</Text>
        </View>
        <Text style={{ color: '#616161', fontSize: 12, fontWeight: 'bold' }}>{label}</Text>
    </View>
);

const DummyNativeAd = ({ colors }) => (
    <View
        style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed'
        }}
    >
        <View className="flex-row items-center mb-3">
            <View style={{ backgroundColor: '#4285F4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'black' }}>SPONSORED</Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest">Recommended Deal</Text>
        </View>
        <View style={{ backgroundColor: '#eeeeee', height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#9e9e9e', fontWeight: 'bold' }}>Native Ad Media Placeholder</Text>
        </View>
        <Text style={{ color: colors.text }} className="text-lg font-black mb-1">Premium Product Promotion</Text>
        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold leading-4 opacity-70">This is a sample layout for a Google Native Ad that fits perfectly with your app's design.</Text>
    </View>
);

const WishlistScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                setFavorites(data.offers);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchWishlist();

        // Refetch when screen comes into focus
        if (navigation && navigation.addListener) {
            const unsubscribe = navigation.addListener('focus', () => {
                fetchWishlist();
            });
            return unsubscribe;
        }
    }, [navigation]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            {/* Minimal Header */}
            <View style={{ backgroundColor: colors.card }} className="px-6 pt-4 pb-6 shadow-sm flex-row items-center justify-between">
                <View>
                    <Text style={{ color: staticColors.secondary }} className="text-[10px] font-black tracking-[3px] mb-1">{t('wishlist.collection')}</Text>
                    <Text style={{ color: colors.text }} className="text-3xl font-black">{t('wishlist.title')}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : favorites.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Home')}
                        className="relative"
                    >
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-48 h-48 rounded-[60px] items-center justify-center mb-10 shadow-2xl border">
                            <Heart size={80} color={colors.primary} opacity={0.1} strokeWidth={1.5} />
                            <View className="absolute">
                                <Heart size={60} color={staticColors.secondary} strokeWidth={2} />
                            </View>
                        </View>
                        <View style={{ backgroundColor: colors.card }} className="absolute -top-2 -right-2 w-12 h-12 rounded-2xl items-center justify-center shadow-lg transform rotate-12">
                            <Sparkles size={24} color={staticColors.warning} />
                        </View>
                    </TouchableOpacity>

                    <Text style={{ color: colors.text }} className="text-3xl font-black mb-3 text-center tracking-tighter">{t('wishlist.empty_title')}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-center mb-12 font-medium leading-6 opacity-70">
                        {t('wishlist.empty_desc')}
                    </Text>

                    <CustomButton
                        title={t('wishlist.start_discovering')}
                        onPress={() => navigation.navigate('Home')}
                    />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    renderItem={({ item, index }) => (
                        <>
                            {index > 0 && index % 4 === 0 && (
                                <View className="mb-6">
                                    <DummyNativeAd colors={colors} />
                                </View>
                            )}
                            <View className="mb-6">
                                <OfferCard
                                    offer={item}
                                    isFavorite={true}
                                    onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                    onRefresh={fetchWishlist}
                                />
                            </View>
                        </>
                    )}
                />
            )}

            {/* Bottom Banner Ad */}
            <View style={{ backgroundColor: colors.background }}>
                <DummyBannerAd colors={colors} />
            </View>
        </SafeAreaView>
    );
};


export default WishlistScreen;
