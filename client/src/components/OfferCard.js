import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Clock, Heart, Flame } from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const OfferCard = ({ offer, onPress, grid }) => {
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
                    source={{ uri: offer.image || 'https://via.placeholder.com/400x200' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Subtle Brand Overlay - Scaled for grid */}
                <View className={`absolute bottom-3 left-3 right-3 flex-row justify-between items-center ${grid ? 'bottom-2 left-2 right-2' : ''}`}>
                    <View className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center border border-white/50 shadow-sm">
                        <View className={`${grid ? 'w-4 h-4' : 'w-5 h-5'} bg-white rounded-md items-center justify-center overflow-hidden mr-1.5`}>
                            <Image
                                source={{ uri: offer.storeLogo || 'https://via.placeholder.com/40' }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                        {!grid && (
                            <Text className="text-primary font-black text-[9px] uppercase tracking-wider">
                                {offer.storeName}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        className={`${grid ? 'w-8 h-8' : 'w-10 h-10'} bg-white/60 backdrop-blur-xl rounded-full items-center justify-center border border-white/80`}
                    >
                        <Heart size={grid ? 14 : 18} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Clean Content Area */}
            <View className={`${grid ? 'p-3' : 'p-5'}`}>
                <Text className={`text-primary font-black leading-6 mb-3 ${grid ? 'text-sm mb-2 h-12' : 'text-xl'}`} numberOfLines={2}>
                    {offer.title}
                </Text>

                <View className="flex-row items-center justify-between mt-auto">
                    <View className={`flex-row items-center bg-[#F3F4F6] ${grid ? 'px-1.5 py-1' : 'px-3 py-2'} rounded-lg`}>
                        <MapPin size={grid ? 8 : 12} color={colors.secondary} strokeWidth={2.5} />
                        <Text className={`text-primary font-bold ${grid ? 'text-[8px]' : 'text-[11px]'} ml-1 uppercase tracking-tight`}>
                            {offer.distance}km
                        </Text>
                    </View>

                    <View className={`flex-row items-center bg-primary/5 ${grid ? 'px-1.5 py-1' : 'px-3 py-2'} rounded-lg border border-primary/5`}>
                        <Clock size={grid ? 8 : 12} color={colors.primary} strokeWidth={2.5} />
                        <Text className={`text-primary font-black ${grid ? 'text-[8px]' : 'text-[11px]'} ml-1`}>
                            {offer.expiryHours}H LEFT
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

