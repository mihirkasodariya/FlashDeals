import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share, useWindowDimensions, Alert, ActivityIndicator, StatusBar, Platform, Linking, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, MapPin, Clock, Store, Info, Phone, Map, Sparkles, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const OfferDetailsScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { offer } = route.params || {};

    if (!offer) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-primary font-black">Offer Not Found</Text>
            </SafeAreaView>
        );
    }

    const { width, height } = useWindowDimensions();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    // Initial check for wishlist status
    React.useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;
                const response = await fetch(`${API_BASE_URL}/wishlist/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success && data.offerIds.includes(offer._id)) {
                    setIsFavorite(true);
                }
            } catch (error) {
                console.error('Error fetching wishlist status:', error);
            }
        };
        checkWishlistStatus();

        // Increment visit count
        const recordVisit = async () => {
            try {
                await fetch(`${API_BASE_URL}/offers/visit/${offer._id}`, { method: 'POST' });
            } catch (error) {
                console.error('Error recording visit:', error);
            }
        };
        recordVisit();
    }, [offer._id]);

    const handleToggleWishlist = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert("Login Required", "Please login to wishlist offers.");
                return;
            }

            setIsFavorite(!isFavorite); // Optimistic

            const response = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ offerId: offer._id })
            });

            const data = await response.json();
            if (!data.success) {
                setIsFavorite(isFavorite); // Revert
                Alert.alert("Error", "Could not update wishlist");
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            setIsFavorite(isFavorite); // Revert
        }
    };

    const isTablet = width > 768;
    const imageHeight = isTablet ? height * 0.5 : 400;

    // Data Processing (Remove /api from base URL for static files)
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const imageUrl = offer.image
        ? (offer.image.startsWith('http') ? offer.image : `${STATIC_BASE_URL}${offer.image}`)
        : 'https://via.placeholder.com/400x400';

    const storeName = offer.vendorId?.storeName || 'Local Store';
    const storeAddress = offer.vendorId?.storeAddress || 'Address available at store';

    const defaultLogo = require('../../assets/logos/storeLogo.png');
    const storeLogoSource = offer.vendorId?.storeImage
        ? { uri: (offer.vendorId.storeImage.startsWith('http') ? offer.vendorId.storeImage : `${STATIC_BASE_URL}${offer.vendorId.storeImage}`) }
        : defaultLogo;

    // Format Date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]}`;
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
                [{ text: "Great, Got It!" }]
            );
        }, 1500);
    };

    const handleGetDirections = () => {
        const location = offer.vendorId?.location;
        if (!location || !location.latitude || !location.longitude) {
            Alert.alert("Location Not Found", "The store location is not available.");
            return;
        }

        const { latitude, longitude } = location;
        const label = storeName;

        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}(${label})`
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                Linking.openURL(browserUrl);
            }
        }).catch(() => {
            Alert.alert("Error", "Could not open map application.");
        });
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* White Status Bar Line */}
            <View style={{ height: Platform.OS === 'ios' ? insets.top - 12 : insets.top, backgroundColor: 'white' }} />

            <View
                style={{ top: insets.top + (Platform.OS === 'ios' ? 0 : 12) }}
                className="absolute left-0 right-0 z-20 px-6 pb-6 flex-row justify-between items-center"
            >
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
                        onPress={handleToggleWishlist}
                        className="w-12 h-12 bg-white/90 rounded-2xl items-center justify-center shadow-lg"
                    >
                        <Heart size={20} color={isFavorite ? colors.error : colors.primary} fill={isFavorite ? colors.error : 'transparent'} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1" bounces={false}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setIsImageModalVisible(true)}
                    className="relative"
                >
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
                            <Text className="text-secondary font-black text-xs tracking-widest">Valid: {formatDate(offer.startDate)} - {formatDate(offer.endDate)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View className="px-6 py-8">
                    <View className="mb-8">
                        <Text className="text-[10px] font-black text-secondary tracking-[2px] mb-2">
                            {offer.category || 'Offer'}
                        </Text>
                        <Text className="text-4xl font-black text-primary tracking-tighter leading-[44px]">
                            {offer.title}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('PublicStoreProfile', { vendorId: offer.vendorId?._id })}
                        className="bg-[#FAFAFA] rounded-[32px] p-6 mb-8 border border-surface shadow-sm"
                    >
                        <View className="flex-row items-center mb-6">
                            <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-md border border-surface overflow-hidden">
                                <Image source={storeLogoSource} className="w-full h-full" resizeMode="cover" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-primary font-black text-lg">{storeName}</Text>
                                <View className="flex-row items-center mt-1">
                                    <MapPin size={14} color={colors.textSecondary} />
                                    <Text className="text-textSecondary text-xs font-bold ml-1">{offer.distance || 'Nearby'} km Away</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={colors.primary} opacity={0.3} />
                        </View>

                        <Text className="text-textSecondary text-sm font-medium leading-6 mb-6">
                            {storeAddress}
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleGetDirections}
                                className="flex-1 bg-white border border-surface py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
                            >
                                <Map size={18} color={colors.primary} />
                                <Text className="ml-2 font-black text-primary text-xs tracking-widest">Directions</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    <View className="mb-10">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1.5 h-6 bg-secondary rounded-full mr-3" />
                            <Text className="text-xl font-black text-primary tracking-tight">Offer Details</Text>
                        </View>
                        <Text className="text-textSecondary text-base leading-7 font-medium">
                            {offer.description}
                        </Text>
                    </View>

                    <View className="bg-primary/5 p-8 rounded-[40px] border border-primary/5">
                        <View className="flex-row items-center mb-6">
                            <Sparkles size={16} color={colors.primary} strokeWidth={2} />
                            <Text className="font-black text-primary text-sm tracking-[3px] ml-3">Verified Offer</Text>
                        </View>
                        <View className="flex-row items-start mb-4">
                            <View className="w-6 h-6 rounded-full bg-white items-center justify-center mr-4 shadow-sm">
                                <Clock size={12} color={colors.primary} strokeWidth={3} />
                            </View>
                            <Text className="text-primary font-bold text-sm flex-1 leading-6">
                                This offer is valid from {formatDate(offer.startDate)} to {formatDate(offer.endDate)}.
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Premium Full Screen Image Viewer */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsImageModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <StatusBar barStyle="light-content" backgroundColor="black" />

                    {/* Close Button UI */}
                    <View
                        style={{ top: insets.top + (Platform.OS === 'ios' ? 0 : 20) }}
                        className="absolute right-6 z-50"
                    >
                        <TouchableOpacity
                            onPress={() => setIsImageModalVisible(false)}
                            className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                        >
                            <X size={24} color="white" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal={false}
                        contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                        maximumZoomScale={5}
                        minimumZoomScale={1}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        centerContent={true}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            style={{ width: width, height: height * 0.8 }}
                            resizeMode="contain"
                        />
                    </ScrollView>

                    {/* Footer Info in Modal */}
                    <View
                        style={{ bottom: insets.bottom + 20 }}
                        className="absolute left-0 right-0 items-center"
                    >
                        <Text className="text-white/40 text-[10px] font-black tracking-[2px]">Pinch to Zoom · Swipe to Explore</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default OfferDetailsScreen;
