import React from 'react';
import Text from './CustomText';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Clock, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const OfferCard = ({ offer, onPress, grid, isFavorite = false, onRefresh }) => {
    if (!offer) return null;
    const navigation = useNavigation();
    const { colors, isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
    const [localFavorite, setLocalFavorite] = React.useState(isFavorite);

    React.useEffect(() => {
        setLocalFavorite(isFavorite);
    }, [isFavorite]);

    const toggleWishlist = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                await AsyncStorage.setItem('pendingWishlistOfferId', offer._id);
                navigation.navigate('Login');
                return;
            }

            setLocalFavorite(!localFavorite); // Optimistic UI update

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
                // Revert if failed
                setLocalFavorite(localFavorite);
            } else if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            setLocalFavorite(localFavorite); // Revert
        }
    };
    // Prefix image if it's a local path (Remove /api from base URL for static files)
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const defaultLogo = require('../../assets/logos/storeLogo.png');

    const imageUrl = offer.image
        ? (offer.image.startsWith('http') ? offer.image : `${STATIC_BASE_URL}${offer.image}`)
        : 'https://via.placeholder.com/400x200';

    const storeLogoSource = offer.vendorId?.storeImage
        ? { uri: (offer.vendorId.storeImage.startsWith('http') ? offer.vendorId.storeImage : `${STATIC_BASE_URL}${offer.vendorId.storeImage}`) }
        : defaultLogo;

    const storeName = offer.vendorId?.storeName || 'Local Store';

    // Calculate expiry
    const calculateExpiry = () => {
        if (!offer.endDate) return '24h';
        const end = new Date(offer.endDate);
        const now = new Date();
        const diff = end - now;
        const totalHours = Math.floor(diff / (1000 * 60 * 60));

        if (totalHours <= 0) return t('common.expiring');

        if (totalHours > 24) {
            const days = Math.floor(totalHours / 24);
            return `${days} ${t('common.days')}`;
        }

        return `${totalHours}h`;
    };

    // Format Date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return t('common.tba');
        const date = new Date(dateStr);
        return date.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language === 'hi' ? 'hi-IN' : 'gu-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const handleCardPress = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                navigation.navigate('Login');
                return;
            }
            if (onPress) onPress();
        } catch (error) {
            console.error('Card press error:', error);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleCardPress}
            activeOpacity={0.9}
            style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            className={`rounded-[24px] mb-6 overflow-hidden border ${grid ? 'mx-1' : ''}`}
        >
            {/* Minimalist Image View */}
            <View style={{ backgroundColor: colors.surface }} className={`relative ${grid ? 'h-40' : 'h-56'}`}>
                <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Subtle Brand Overlay */}
                <View className={`absolute bottom-3 left-3 right-3 flex-row justify-between items-center ${grid ? 'bottom-2 left-2 right-2' : ''}`}>
                    <View style={{ backgroundColor: colors.card + 'E6', borderColor: colors.border }} className="backdrop-blur-md px-2 py-1 rounded-lg flex-row items-center border shadow-sm">
                        <View className={`${grid ? 'w-4 h-4' : 'w-5 h-5'} bg-white rounded-md items-center justify-center overflow-hidden mr-1.5`}>
                            <Image
                                source={storeLogoSource}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                        {!grid && (
                            <Text style={{ color: colors.text }} className="font-black text-[9px] tracking-wider" numberOfLines={1}>
                                {storeName}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={toggleWishlist}
                        style={{ backgroundColor: colors.card + 'CC', borderColor: colors.border }}
                        className={`${grid ? 'w-7 h-7' : 'w-9 h-9'} backdrop-blur-xl rounded-full items-center justify-center border`}
                    >
                        {/* Syncing Heart style directly with parent (isFavorite) whenever available */}
                        <Heart 
                            size={grid ? 14 : 16} 
                            color={localFavorite ? staticColors.error : colors.primary} 
                            fill={localFavorite ? staticColors.error : 'transparent'} 
                            strokeWidth={2.5} 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Area */}
            <View className={`${grid ? 'p-3' : 'p-5'}`}>
                <Text style={{ color: colors.text }} className={`font-black tracking-tight ${grid ? 'text-xs mb-2 h-10' : 'text-lg mb-3'}`} numberOfLines={2}>
                    {offer.title}
                </Text>

                <View className="flex-row items-center justify-between mt-auto">
                    <View style={{ backgroundColor: colors.surface }} className={`flex-row items-center ${grid ? 'px-1.5 py-1' : 'px-3 py-2'} rounded-lg`}>
                        <MapPin size={grid ? 8 : 10} color={staticColors.secondary} strokeWidth={3} />
                        <Text style={{ color: colors.text }} className={`font-bold ${grid ? 'text-[7px]' : 'text-[10px]'} ml-1 tracking-tight`}>
                            {offer.distance != null ? `${offer.distance.toFixed(1)} km` : t('common.near')}
                        </Text>
                    </View>

                    <View style={{ backgroundColor: `${colors.primary}1A`, borderColor: `${colors.primary}1A` }} className={`flex-row items-center ${grid ? 'px-1.5 py-1' : 'px-3 py-2'} rounded-lg border`}>
                        <Clock size={grid ? 8 : 10} color={colors.primary} strokeWidth={3} />
                        <Text style={{ color: colors.primary }} className={`font-black ${grid ? 'text-[7px]' : 'text-[10px]'} ml-1`}>
                            {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
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
