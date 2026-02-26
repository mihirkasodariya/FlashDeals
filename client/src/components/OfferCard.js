import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Clock, Heart } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const OfferCard = ({ offer, onPress, grid }) => {
    // Prefix image if it's a local path (Remove /api from base URL for static files)
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const imageUrl = offer.image
        ? (offer.image.startsWith('http') ? offer.image : `${STATIC_BASE_URL}${offer.image}`)
        : 'https://via.placeholder.com/400x200';

    const storeLogo = offer.vendorId?.profileImage
        ? (offer.vendorId.profileImage.startsWith('http') ? offer.vendorId.profileImage : `${STATIC_BASE_URL}${offer.vendorId.profileImage}`)
        : 'https://cdn.iconscout.com/icon/free/png-256/free-store-icon-download-in-svg-png-gif-file-formats--market-shop-building-shopping-commerce-pack-e-commerce-icons-443831.png';

    const storeName = offer.vendorId?.storeName || 'Local Store';

    // Calculate expiry hours
    const calculateExpiry = () => {
        if (!offer.endDate) return '24H';
        const end = new Date(offer.endDate);
        const now = new Date();
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours > 0 ? `${hours}H` : 'EXPIRING';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.cardContainer}
            className={`bg-white rounded-[24px] mb-6 overflow-hidden border border-[#E5E7EB]/60 ${grid ? 'mx-1' : ''}`}
        >
            {/* Minimalist Image View */}
            <View className={`relative bg-[#F9FAFB] ${grid ? 'h-40' : 'h-56'}`}>
                <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Subtle Brand Overlay */}
                <View className={`absolute bottom-3 left-3 right-3 flex-row justify-between items-center ${grid ? 'bottom-2 left-2 right-2' : ''}`}>
                    <View className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center border border-white/50 shadow-sm leading-none">
                        <View className={`${grid ? 'w-4 h-4' : 'w-5 h-5'} bg-white rounded-md items-center justify-center overflow-hidden mr-1.5`}>
                            <Image
                                source={{ uri: storeLogo }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                        {!grid && (
                            <Text className="text-primary font-black text-[9px] uppercase tracking-wider" numberOfLines={1}>
                                {storeName}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        className={`${grid ? 'w-7 h-7' : 'w-9 h-9'} bg-white/80 backdrop-blur-xl rounded-full items-center justify-center border border-white/80`}
                    >
                        <Heart size={grid ? 14 : 16} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Area */}
            <View className={`${grid ? 'p-3' : 'p-5'}`}>
                <Text className={`text-primary font-black tracking-tight ${grid ? 'text-xs mb-2 h-10' : 'text-lg mb-3'}`} numberOfLines={2}>
                    {offer.title}
                </Text>

                <View className="flex-row items-center justify-between mt-auto">
                    <View className={`flex-row items-center bg-[#F3F4F6] ${grid ? 'px-1.5 py-1' : 'px-3 py-2'} rounded-lg`}>
                        <MapPin size={grid ? 8 : 10} color={colors.secondary} strokeWidth={3} />
                        <Text className={`text-primary font-bold ${grid ? 'text-[7px]' : 'text-[10px]'} ml-1 uppercase tracking-tight`}>
                            {offer.distance || 'Near'} KM
                        </Text>
                    </View>

                    <View className={`flex-row items-center bg-primary/5 ${grid ? 'px-1.5 py-1' : 'px-3 py-2'} rounded-lg border border-primary/5`}>
                        <Clock size={grid ? 8 : 10} color={colors.primary} strokeWidth={3} />
                        <Text className={`text-primary font-black ${grid ? 'text-[7px]' : 'text-[10px]'} ml-1`}>
                            {calculateExpiry()} LEFT
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 6,
    }
});

export default OfferCard;
