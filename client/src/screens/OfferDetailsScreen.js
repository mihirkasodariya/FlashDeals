import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import { View, ScrollView, Image, TouchableOpacity, Share, useWindowDimensions, Alert, ActivityIndicator, StatusBar, Platform, Linking, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, MapPin, Clock, Store, Info, Phone, Map, Sparkles, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
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

// const DummyNativeAd = ({ colors }) => (
//     <View
//         style={{
//             backgroundColor: colors.card,
//             borderRadius: 24,
//             padding: 16,
//             marginBottom: 20,
//             borderWidth: 1,
//             borderColor: colors.border,
//             borderStyle: 'dashed'
//         }}
//     >
//         <View className="flex-row items-center mb-3">
//             <View style={{ backgroundColor: '#4285F4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 }}>
//                 <Text style={{ color: 'white', fontSize: 10, fontWeight: 'black' }}>SPONSORED</Text>
//             </View>
//             <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest">Recommended Deal</Text>
//         </View>
//         <View style={{ backgroundColor: '#eeeeee', height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
//             <Text style={{ color: '#9e9e9e', fontWeight: 'bold' }}>Native Ad Media Placeholder</Text>
//         </View>
//         <Text style={{ color: colors.text }} className="text-lg font-black mb-1">Premium Product Promotion</Text>
//         <Text style={{ color: colors.textSecondary }} className="text-xs font-bold leading-4 opacity-70">This is a sample layout for a Google Native Ad that fits perfectly with your app's design.</Text>
//     </View>
// );

const OfferDetailsScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors, isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
    const { offer: initialOffer, offerId } = route.params || {};
    const [offer, setOffer] = useState(initialOffer);
    const [loading, setLoading] = useState(!initialOffer);

    if (!offer && !offerId && !loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center">
                <Text style={{ color: colors.text }} className="font-black">{t('offer_details.offer_not_found')}</Text>
            </SafeAreaView>
        );
    }

    const { width, height } = useWindowDimensions();
    const [isFavorite, setIsFavorite] = useState(false);
    // const [isRedeeming, setIsRedeeming] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    // Fetch offer details if only offerId is provided
    React.useEffect(() => {
        const fetchOfferDetails = async () => {
            if (!offer && offerId) {
                try {
                    setLoading(true);
                    const response = await fetch(`${API_BASE_URL}/offers/${offerId}`);
                    const data = await response.json();
                    if (data.success) {
                        setOffer(data.offer);
                    } else {
                        Alert.alert(t('common.error'), t('offer_details.offer_not_found'));
                        navigation.goBack();
                    }
                } catch (error) {
                    console.error('Error fetching offer details:', error);
                    Alert.alert(t('common.error'), t('register.server_error'));
                    navigation.goBack();
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchOfferDetails();
    }, [offerId, offer]);

    // Initial check for wishlist status
    React.useEffect(() => {
        if (!offer?._id) return;

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
    }, [offer?._id]);

    const handleToggleWishlist = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                await AsyncStorage.setItem('pendingWishlistOfferId', offer._id);
                navigation.navigate('Login');
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

    const storeName = offer.vendorId?.storeName || t('offer_details.nearby');
    const storeAddress = offer.vendorId?.storeAddress || t('public_store.address_managed');

    const defaultLogo = require('../../assets/logos/storeLogo.png');
    const storeLogoSource = offer.vendorId?.storeImage
        ? { uri: (offer.vendorId.storeImage.startsWith('http') ? offer.vendorId.storeImage : `${STATIC_BASE_URL}${offer.vendorId.storeImage}`) }
        : defaultLogo;

    // Format Date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const date = new Date(dateStr);
        return date.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language === 'hi' ? 'hi-IN' : 'gu-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const handleShare = async () => {
        try {
            // Use the server URL for sharing to enable redirection to app/store
            const shareUrl = `${STATIC_BASE_URL}/share/offer/${offer._id}`;
            const shareMessage = t('offer_details.share_msg', { title: offer.title, store: storeName });

            await Share.share({
                title: offer.title,
                // On Android, we append the URL to the message.
                // On iOS, the 'url' field is shared as a separate item, so we don't include it in message.
                message: Platform.OS === 'android' ? `${shareMessage}\n\nView Deal: ${shareUrl}` : shareMessage,
                url: shareUrl, // iOS support
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleGetDirections = () => {
        const location = offer.vendorId?.location;
        if (!location || !location.latitude || !location.longitude) {
            Alert.alert(t('common.error'), t('public_store.profile_not_found'));
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
            Alert.alert(t('common.error'), t('register.server_error'));
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <View style={{ height: Platform.OS === 'ios' ? insets.top - 12 : insets.top, backgroundColor: colors.background }} />

            <View
                style={{ top: insets.top + (Platform.OS === 'ios' ? 0 : 12) }}
                className="absolute left-0 right-0 z-20 px-6 pb-6 flex-row justify-between items-center"
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
                    className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg"
                >
                    <ChevronLeft size={24} color={colors.primary} strokeWidth={3} />
                </TouchableOpacity>

                <View className="flex-row">
                    <TouchableOpacity
                        onPress={handleShare}
                        style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-lg"
                    >
                        <Share2 size={20} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleToggleWishlist}
                        style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
                        className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg"
                    >
                        <Heart size={20} color={isFavorite ? staticColors.error : colors.primary} fill={isFavorite ? staticColors.error : 'transparent'} strokeWidth={2.5} />
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
                        style={{ width: '100%', height: imageHeight, backgroundColor: colors.surface }}
                        className="bg-surface"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', colors.background]}
                        className="absolute inset-0"
                    />

                    <View className="absolute bottom-10 left-6 right-6 flex-row justify-end items-end">
                        <View style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderColor: colors.border }} className="px-4 py-2 rounded-2xl shadow-lg border">
                            <Text style={{ color: staticColors.secondary }} className="font-black text-xs tracking-widest">{t('offer_details.valid_from', { start: formatDate(offer.startDate), end: formatDate(offer.endDate) })}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View className="px-6 py-8">
                    <View className="mb-8">
                        <Text style={{ color: staticColors.secondary }} className="text-[10px] font-black tracking-[2px] mb-2">
                            {offer.category?.name || offer.category || t('common.offer')}
                        </Text>
                        <Text style={{ color: colors.text }} className="text-4xl font-black tracking-tighter leading-[44px]">
                            {offer.title}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('PublicStoreProfile', { vendorId: offer.vendorId?._id })}
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        className="rounded-[32px] p-6 mb-8 border shadow-sm"
                    >
                        <View className="flex-row items-center mb-6">
                            <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="w-14 h-14 rounded-2xl items-center justify-center shadow-md border overflow-hidden">
                                <Image source={storeLogoSource} className="w-full h-full" resizeMode="cover" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text style={{ color: colors.text }} className="font-black text-lg">{storeName}</Text>
                                <View className="flex-row items-center mt-1">
                                    <MapPin size={14} color={colors.textSecondary} />
                                    <Text style={{ color: colors.textSecondary }} className="text-xs font-bold ml-1">
                                        {offer.distance != null ? t('offer_details.km_away', { distance: offer.distance.toFixed(1) }) : t('common.near')}
                                    </Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={colors.primary} style={{ opacity: 0.3 }} />
                        </View>

                        <Text style={{ color: colors.textSecondary }} className="text-sm font-medium leading-6 mb-6">
                            {storeAddress}
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleGetDirections}
                                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                className="flex-1 border py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
                            >
                                <Map size={18} color={colors.primary} />
                                <Text style={{ color: colors.primary }} className="ml-2 font-black text-xs tracking-widest">{t('offer_details.directions')}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {/* Ad after store info */}
                    {/* <View className="mb-8">
                        <DummyNativeAd colors={colors} />
                    </View> */}

                    <View className="mb-10">
                        <View className="flex-row items-center mb-4">
                            <View style={{ backgroundColor: staticColors.secondary }} className="w-1.5 h-6 rounded-full mr-3" />
                            <Text style={{ color: colors.text }} className="text-xl font-black tracking-tight">{t('offer_details.offer_title')}</Text>
                        </View>
                        <Text style={{ color: colors.textSecondary }} className="text-base leading-7 font-medium">
                            {offer.description}
                        </Text>
                    </View>

                    <View style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}10` }} className="p-8 rounded-[40px] border">
                        <View className="flex-row items-center mb-6">
                            <Sparkles size={16} color={colors.primary} strokeWidth={2} />
                            <Text style={{ color: colors.primary }} className="font-black text-sm tracking-[3px] ml-3">{t('offer_details.verified_offer')}</Text>
                        </View>
                        <View className="flex-row items-start mb-4">
                            <View style={{ backgroundColor: colors.card }} className="w-6 h-6 rounded-full items-center justify-center mr-4 shadow-sm">
                                <Clock size={12} color={colors.primary} strokeWidth={3} />
                            </View>
                            <Text style={{ color: colors.text }} className="font-bold text-sm flex-1 leading-6">
                                {t('offer_details.valid_msg', { start: formatDate(offer.startDate), end: formatDate(offer.endDate) })}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Bottom Banner Ad */}
            {/* <View style={{ backgroundColor: colors.background }}>
                <DummyBannerAd colors={colors} />
            </View> */}

            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsImageModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <StatusBar barStyle="light-content" backgroundColor="black" />

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

                    <View
                        style={{ bottom: insets.bottom + 20 }}
                        className="absolute left-0 right-0 items-center"
                    >
                        <Text className="text-white/40 text-[10px] font-black tracking-[2px]">{t('offer_details.pinch_zoom')}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default OfferDetailsScreen;
