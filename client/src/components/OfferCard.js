import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Clock, Heart, Star, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const OfferCard = ({ offer, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.95}
            style={styles.container}
            className="bg-white rounded-[24px] mb-5 shadow-lg overflow-hidden border border-border/50"
        >
            <View className="relative">
                <Image
                    source={{ uri: offer.image || 'https://via.placeholder.com/400x200' }}
                    className="w-full h-52 bg-surface"
                    resizeMode="cover"
                />

                {/* Image Overlays */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                    className="absolute inset-0"
                />

                {/* Badges - Top Row */}
                <View className="absolute top-3 left-3 flex-row space-x-2">
                    <LinearGradient
                        colors={[colors.secondary, '#FB923C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-3 py-1.5 rounded-full shadow-sm"
                    >
                        <Text className="text-white font-black text-xs uppercase tracking-tighter">
                            {offer.discount}% OFF
                        </Text>
                    </LinearGradient>

                    {offer.isTrending && (
                        <View className="bg-white/95 px-2.5 py-1.5 rounded-full flex-row items-center shadow-sm">
                            <Star size={10} color="#F59E0B" fill="#F59E0B" />
                            <Text className="text-[#F59E0B] font-bold text-[10px] ml-1 uppercase">Top Deal</Text>
                        </View>
                    )}
                </View>

                {/* Like Button */}
                <TouchableOpacity
                    className="absolute top-3 right-3 w-9 h-9 bg-white/30 rounded-full items-center justify-center backdrop-blur-md"
                >
                    <Heart size={18} color="white" />
                </TouchableOpacity>

                {/* Quick Info Bar - Floating */}
                <View className="absolute bottom-3 left-3 right-3 flex-row justify-between items-center">
                    <View className="bg-white/95 px-3 py-1.5 rounded-full flex-row items-center shadow-sm">
                        <Navigation size={12} color={colors.secondary} strokeWidth={2.5} />
                        <Text className="text-primary font-bold text-[10px] ml-1.5">{offer.distance}km away</Text>
                    </View>

                    <View className="bg-primary px-3 py-1.5 rounded-full flex-row items-center shadow-sm">
                        <Clock size={12} color="white" />
                        <Text className="text-white font-bold text-[10px] ml-1.5">{offer.expiryHours}h left</Text>
                    </View>
                </View>
            </View>

            <View className="p-4 bg-white">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text className="text-primary font-black text-lg leading-6" numberOfLines={1}>
                            {offer.title}
                        </Text>

                        <View className="flex-row items-center mt-1">
                            <Text className="text-textSecondary text-sm font-medium">at</Text>
                            <Text className="text-secondary font-bold text-sm ml-1.5 decoration-secondary" numberOfLines={1}>
                                {offer.storeName}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-surface">
                    <View className="flex-row items-center">
                        <View className="w-2.5 h-2.5 bg-warning rounded-full" />
                        <Text className="text-warning font-black text-[11px] ml-2 uppercase tracking-wide">
                            {offer.stock} Stocks Left
                        </Text>
                    </View>

                    <View className="bg-surface px-3 py-1.5 rounded-lg">
                        <Text className="text-primary/70 font-bold text-[10px] uppercase tracking-widest">
                            {offer.category}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    }
});

export default OfferCard;

