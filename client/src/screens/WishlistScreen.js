import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';
import OfferCard from '../components/OfferCard';
import { API_BASE_URL } from '../config';

const WishlistScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
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
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            {/* Minimal Header */}
            <View className="px-6 pt-4 pb-6 bg-white shadow-sm flex-row items-center justify-between">
                <View>
                    <Text className="text-[10px] font-black text-secondary tracking-[3px] mb-1">Collection</Text>
                    <Text className="text-3xl font-black text-primary">Wishlist</Text>
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
                        <View className="w-48 h-48 bg-white rounded-[60px] items-center justify-center mb-10 shadow-2xl border border-surface">
                            <Heart size={80} color={colors.primary} opacity={0.1} strokeWidth={1.5} />
                            <View className="absolute">
                                <Heart size={60} color={colors.secondary} strokeWidth={2} />
                            </View>
                        </View>
                        <View className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-lg transform rotate-12">
                            <Sparkles size={24} color={colors.warning} />
                        </View>
                    </TouchableOpacity>

                    <Text className="text-3xl font-black text-primary mb-3 text-center tracking-tighter">Your Heart is Empty</Text>
                    <Text className="text-textSecondary text-center mb-12 font-medium leading-6 opacity-70">
                        Don't let these exclusive deals slip away! Start tapping the heart to save your top picks.
                    </Text>

                    <CustomButton
                        title="Start Discovering"
                        onPress={() => navigation.navigate('Home')}
                    />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View className="mb-6">
                            <OfferCard
                                offer={item}
                                isFavorite={true}
                                onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                onRefresh={fetchWishlist}
                            />
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};


export default WishlistScreen;
