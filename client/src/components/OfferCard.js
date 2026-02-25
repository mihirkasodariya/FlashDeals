import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Tag } from 'lucide-react-native';
import { colors } from '../theme/colors';

const OfferCard = ({ offer, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-white rounded-xl mb-4 shadow-sm border border-border overflow-hidden"
        >
            {/* Offer Image */}
            <View className="relative">
                <Image
                    source={{ uri: offer.image || 'https://via.placeholder.com/400x200' }}
                    className="w-full h-44 bg-surface"
                    resizeMode="cover"
                />
                {/* Discount Badge */}
                <View className="absolute top-3 left-3 bg-secondary px-2 py-1 rounded-md">
                    <Text className="text-white font-bold text-xs">{offer.discount}% OFF</Text>
                </View>
                {/* Distance Badge */}
                <View className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 rounded-md flex-row items-center">
                    <MapPin size={12} color={colors.primary} />
                    <Text className="text-primary font-bold text-[10px] ml-1">{offer.distance} km</Text>
                </View>
            </View>

            <View className="p-3">
                {/* Title and Category */}
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-primary font-bold text-lg flex-1 mr-2" numberOfLines={1}>
                        {offer.title}
                    </Text>
                    <View className="bg-surface px-2 py-0.5 rounded border border-border">
                        <Text className="text-textSecondary text-[10px] font-medium uppercase tracking-wider">
                            {offer.category}
                        </Text>
                    </View>
                </View>

                {/* Vendor/Store Name */}
                <Text className="text-textSecondary text-xs mb-3 font-medium">
                    at {offer.storeName}
                </Text>

                {/* Stock and Expiry */}
                <View className="flex-row items-center justify-between border-t border-border pt-3">
                    <View className="flex-row items-center">
                        <Clock size={14} color={colors.error} />
                        <Text className="text-error font-bold text-xs ml-1">
                            Expires in {offer.expiryHours}h
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-warning mr-1.5" />
                        <Text className="text-warning font-bold text-xs">
                            Only {offer.stock} Left!
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default OfferCard;
