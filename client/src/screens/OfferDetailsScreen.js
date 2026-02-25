import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, MapPin, Clock, Store, Info, Phone, Navigation } from 'lucide-react-native';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';

const OfferDetailsScreen = ({ route, navigation }) => {
    const { offer } = route.params || {
        offer: {
            id: '1',
            title: '50% Off on Pizza Royale',
            storeName: 'Pizza Hut - Downtown',
            discount: 50,
            distance: 1.2,
            stock: 5,
            expiryHours: 2,
            category: 'Food',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
            description: 'Enjoy a massive 50% discount on our best-selling Pizza Royale. Valid for dine-in and takeaway. Limited time offer!',
            terms: [
                'Valid only today until 10:00 PM',
                'Cannot be combined with other offers',
                'One coupon per customer',
                'Valid on medium and large sizes'
            ],
            storeAddress: '123 Food Street, Near City Center, Ahmedabad',
            storePhone: '+91 98765 43210'
        }
    };

    const { width, height } = useWindowDimensions();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const isTablet = width > 768;
    const imageHeight = isTablet ? height * 0.45 : 320;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this amazing deal: ${offer.title} at ${offer.storeName}! Download FlashDeals to get more.`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleRedeem = () => {
        setIsRedeeming(true);
        // Simulate API call
        setTimeout(() => {
            setIsRedeeming(false);
            // Navigate to a redemption success or QR screen
            alert("Offer Activated! Show this code at the store: FD-9921");
        }, 1500);
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header Overlay */}
            <View className="absolute top-0 left-0 right-0 z-10 px-4 py-12 flex-row justify-between pointer-events-none">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-white/80 rounded-full items-center justify-center pointer-events-auto shadow-sm"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>

                <View className="flex-row pointer-events-auto">
                    <TouchableOpacity
                        onPress={handleShare}
                        className="w-10 h-10 bg-white/80 rounded-full items-center justify-center mr-2 shadow-sm"
                    >
                        <Share2 size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsFavorite(!isFavorite)}
                        className="w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-sm"
                    >
                        <Heart size={20} color={isFavorite ? colors.error : colors.primary} fill={isFavorite ? colors.error : 'transparent'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Main Image */}
                <Image
                    source={{ uri: offer.image }}
                    style={{ width: '100%', height: imageHeight }}
                    className="bg-surface"
                />

                <View className="p-5 -mt-6 bg-white rounded-t-3xl shadow-lg">
                    {/* Offer Info */}
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-4">
                            <View className="flex-row items-center mb-1">
                                <View className="bg-secondary/10 px-2 py-0.5 rounded mr-2">
                                    <Text className="text-secondary font-bold text-xs uppercase">{offer.category}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Clock size={14} color={colors.error} />
                                    <Text className="text-error font-bold text-xs ml-1">Expires in {offer.expiryHours}h</Text>
                                </View>
                            </View>
                            <Text className="text-2xl font-bold text-primary leading-tight">{offer.title}</Text>
                        </View>
                        <View className="bg-secondary px-3 py-2 rounded-xl items-center justify-center">
                            <Text className="text-white font-bold text-xl">{offer.discount}%</Text>
                            <Text className="text-white text-[10px] font-bold uppercase">Off</Text>
                        </View>
                    </View>

                    {/* Store Info */}
                    <View className="flex-row items-center mb-6 pt-4 border-t border-border">
                        <View className="w-12 h-12 bg-surface rounded-full items-center justify-center border border-border">
                            <Store size={24} color={colors.primary} />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-primary font-bold text-base">{offer.storeName}</Text>
                            <View className="flex-row items-center">
                                <MapPin size={12} color={colors.textSecondary} />
                                <Text className="text-textSecondary text-xs ml-1">{offer.distance} km away • {offer.storeAddress}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Buttons Row */}
                    <View className="flex-row gap-3 mb-8">
                        <TouchableOpacity className="flex-1 bg-surface border border-border py-3 rounded-xl flex-row items-center justify-center">
                            <Phone size={18} color={colors.primary} />
                            <Text className="ml-2 font-bold text-primary">Call Store</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-surface border border-border py-3 rounded-xl flex-row items-center justify-center">
                            <Navigation size={18} color={colors.primary} />
                            <Text className="ml-2 font-bold text-primary">Map</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-2">
                            <Info size={18} color={colors.primary} />
                            <Text className="text-lg font-bold text-primary ml-2">Description</Text>
                        </View>
                        <Text className="text-textSecondary leading-6">
                            {offer.description || 'No description available for this offer.'}
                        </Text>
                    </View>

                    {/* Terms & Conditions */}
                    <View className="mb-10 bg-surface/50 p-4 rounded-xl border border-dashed border-border">
                        <Text className="font-bold text-primary mb-3">Terms & Conditions</Text>
                        {(offer.terms || []).map((term, index) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 mr-3" />
                                <Text className="text-textSecondary text-sm flex-1">{term}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Padding */}
                <View className="h-40" />
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-border">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-textSecondary text-xs">Limited Stock Left</Text>
                        <Text className="text-warning font-black text-lg">Only {offer.stock} Left!</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-textSecondary text-xs text-right">Grab it before it expires!</Text>
                    </View>
                </View>
                <CustomButton
                    title={isRedeeming ? "Activating..." : "Redeem Offer Now"}
                    onPress={handleRedeem}
                    disabled={isRedeeming}
                />
            </View>
        </View>
    );
};

export default OfferDetailsScreen;
