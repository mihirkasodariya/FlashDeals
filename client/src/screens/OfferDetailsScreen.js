import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share, useWindowDimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, MapPin, Clock, Store, Info, Phone, Map, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const OfferDetailsScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { offer } = route.params || {};

    if (!offer) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-primary font-black">Offer not found</Text>
            </SafeAreaView>
        );
    }

    const { width, height } = useWindowDimensions();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const isTablet = width > 768;
    const imageHeight = isTablet ? height * 0.5 : 400;

    // Data Processing (Remove /api from base URL for static files)
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const imageUrl = offer.image
        ? (offer.image.startsWith('http') ? offer.image : `${STATIC_BASE_URL}${offer.image}`)
        : 'https://via.placeholder.com/400x400';

    const storeName = offer.vendorId?.storeName || 'Local Store';
    const storeAddress = offer.vendorId?.storeAddress || 'Address available at store';

    const calculateExpiry = () => {
        if (!offer.endDate) return '24';
        const end = new Date(offer.endDate);
        const now = new Date();
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours > 0 ? hours : '0';
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this amazing deal: ${offer.title} at ${storeName}! Download FlashDeals to get more.`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleRedeem = () => {
        setIsRedeeming(true);
        setTimeout(() => {
            setIsRedeeming(false);
            Alert.alert(
                "Offer Activated",
                "Flash Code: FD-9921\n\nShow this at the counter to claim your discount!",
                [{ text: "Great, Got it!" }]
            );
        }, 1500);
    };

    return (
        <View className="flex-1 bg-white">
            <View className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-6 flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 bg-white/90 rounded-2xl items-center justify-center shadow-lg"
                >
                    <ChevronLeft size={24} color={colors.primary} strokeWidth={3} />
                </TouchableOpacity>

                <View className="flex-row">
                    <TouchableOpacity
                        onPress={handleShare}
                        className="w-12 h-12 bg-white/90 rounded-2xl items-center justify-center mr-3 shadow-lg"
                    >
                        <Share2 size={20} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsFavorite(!isFavorite)}
                        className="w-12 h-12 bg-white/90 rounded-2xl items-center justify-center shadow-lg"
                    >
                        <Heart size={20} color={isFavorite ? colors.error : colors.primary} fill={isFavorite ? colors.error : 'transparent'} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1" bounces={false}>
                <View className="relative">
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: imageHeight }}
                        className="bg-surface"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'white']}
                        className="absolute inset-0"
                    />

                    <View className="absolute bottom-10 left-6 right-6 flex-row justify-end items-end">
                        <View className="bg-white/90 px-4 py-2 rounded-2xl shadow-lg border border-white/20">
                            <Text className="text-error font-black text-xs uppercase tracking-widest">Expires in {calculateExpiry()}h</Text>
                        </View>
                    </View>
                </View>

                <View className="px-6 py-8">
                    <View className="mb-8">
                        <Text className="text-[10px] font-black text-secondary uppercase tracking-[4px] mb-2">{offer.category}</Text>
                        <Text className="text-4xl font-black text-primary tracking-tighter leading-[44px]">
                            {offer.title}
                        </Text>
                    </View>

                    <View className="bg-[#FAFAFA] rounded-[32px] p-6 mb-8 border border-surface shadow-sm">
                        <View className="flex-row items-center mb-6">
                            <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-md border border-surface">
                                <Store size={28} color={colors.primary} strokeWidth={1.5} />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-primary font-black text-lg">{storeName}</Text>
                                <View className="flex-row items-center mt-1">
                                    <MapPin size={14} color={colors.textSecondary} />
                                    <Text className="text-textSecondary text-xs font-bold ml-1">{offer.distance || 'Near'} km away</Text>
                                </View>
                            </View>
                        </View>

                        <Text className="text-textSecondary text-sm font-medium leading-6 mb-6">
                            {storeAddress}
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 bg-white border border-surface py-4 rounded-2xl flex-row items-center justify-center shadow-sm">
                                <Phone size={18} color={colors.primary} />
                                <Text className="ml-2 font-black text-primary text-xs uppercase tracking-widest">Call Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-white border border-surface py-4 rounded-2xl flex-row items-center justify-center shadow-sm">
                                <Map size={18} color={colors.primary} />
                                <Text className="ml-2 font-black text-primary text-xs uppercase tracking-widest">Directions</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-10">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1.5 h-6 bg-secondary rounded-full mr-3" />
                            <Text className="text-xl font-black text-primary tracking-tight">Deals Details</Text>
                        </View>
                        <Text className="text-textSecondary text-base leading-7 font-medium">
                            {offer.description}
                        </Text>
                    </View>

                    <View className="bg-primary/5 p-8 rounded-[40px] border border-primary/5">
                        <View className="flex-row items-center mb-6">
                            <Sparkles size={16} color={colors.primary} strokeWidth={2} />
                            <Text className="font-black text-primary text-sm uppercase tracking-[3px] ml-3">Verified Offer</Text>
                        </View>
                        <View className="flex-row items-start mb-4">
                            <View className="w-6 h-6 rounded-full bg-white items-center justify-center mr-4 shadow-sm">
                                <Clock size={12} color={colors.primary} strokeWidth={3} />
                            </View>
                            <Text className="text-primary font-bold text-sm flex-1 leading-6">This offer is live until {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'the end of the week'}.</Text>
                        </View>
                    </View>
                </View>

                <View className="h-48" />
            </ScrollView>

            <View
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                className="absolute bottom-0 left-0 right-0 bg-white/95 p-6 pt-4 border-t border-surface shadow-2xl"
            >

                <View className="flex-row items-center justify-between mb-5">
                    <View>
                        <Text className="text-[10px] font-black text-textSecondary uppercase tracking-widest opacity-60">Offer Status</Text>
                        <View className="flex-row items-center mt-1">
                            <View className="w-2 h-2 bg-success rounded-full mr-2" />
                            <Text className="text-success font-black text-base uppercase">Available Now</Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-primary font-black text-2xl tracking-tighter">Activated</Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleRedeem}
                    disabled={isRedeeming}
                >
                    <LinearGradient
                        colors={[colors.primary, '#1e293b']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-5 rounded-[24px] items-center shadow-xl"
                    >
                        {isRedeeming ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-black text-sm uppercase tracking-[4px]">Activate Flash Pass</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OfferDetailsScreen;
