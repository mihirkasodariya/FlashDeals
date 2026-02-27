import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator, useWindowDimensions, Platform, StatusBar, Linking, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Package as LucidePackage, Shield, User, Map as MapIcon, LayoutGrid, List } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import OfferCard from '../components/OfferCard';
import CustomButton from '../components/CustomButton';

const PublicStoreProfileScreen = ({ route, navigation }) => {
    const { vendorId } = route.params || {};
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [vendor, setVendor] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const fetchStoreData = async () => {
        try {
            // First get vendor info (could use an existing endpoint or new one)
            // Using offers list to get vendor info for now as they are populated
            const offResponse = await fetch(`${API_BASE_URL}/offers/vendor/${vendorId}`);
            const offData = await offResponse.json();

            if (offData.success) {
                setOffers(offData.offers);
                if (offData.offers.length > 0) {
                    setVendor(offData.offers[0].vendorId);
                }
            }
        } catch (error) {
            console.error("Fetch store profile error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePinOnMap = () => {
        const location = vendor.location;
        if (!location || !location.latitude || !location.longitude) {
            Alert.alert("Location Not Found", "The store location is not available.");
            return;
        }

        const { latitude, longitude } = location;
        const label = vendor.storeName;

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

    useEffect(() => {
        fetchStoreData();
    }, [vendorId]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!vendor) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <Text className="text-primary font-black text-center">Store Profile Not Found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary px-6 py-3 rounded-2xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const defaultLogo = require('../../assets/logos/storeLogo.png');
    const storeLogoSource = vendor.storeImage
        ? { uri: `${STATIC_BASE_URL}${vendor.storeImage}` }
        : defaultLogo;

    return (
        <View className="flex-1 bg-[#FAFAFA]">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* White Status Bar Line */}
            <View style={{ height: Platform.OS === 'ios' ? insets.top - 12 : insets.top, backgroundColor: 'white' }} />

            <View
                style={{ top: insets.top + 12 }}
                className="absolute left-6 z-30"
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-lg"
                >
                    <ChevronLeft size={24} color={colors.primary} strokeWidth={3} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header Banner */}
                <LinearGradient
                    colors={[colors.primary, '#004D40']}
                    style={{ paddingTop: 70 }}
                    className="px-8 pb-1"
                >
                    <View className="flex-row items-end pb-12">
                        <View className="w-24 h-24 bg-white rounded-[32px] ml-4 items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden">
                            <Image source={storeLogoSource} className="w-full h-full" resizeMode="cover" />
                        </View>
                        <View className="ml-6 flex-1 pb-4">
                            <View className="bg-success self-start px-2 py-0.5 rounded-full mb-2 flex-row items-center">
                                <Shield size={10} color="white" />
                                <Text className="text-[8px] font-black text-white ml-1 tracking-widest">Verified Store</Text>
                            </View>
                            <Text className="text-white font-black text-3xl tracking-tighter" numberOfLines={1}>
                                {vendor.storeName}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View className="px-6 -mt-8">
                    <View className="bg-white rounded-[40px] p-8 shadow-sm border border-surface">
                        <View className="mb-8">
                            <View className="flex-row items-center mb-1">
                                <User size={14} color={colors.textSecondary} />
                                <Text className="text-[10px] font-black text-textSecondary tracking-widest ml-2">Store Owner</Text>
                            </View>
                            <Text className="text-xl font-black text-primary">{vendor.name}</Text>
                        </View>

                        <View className="mb-8">
                            <View className="flex-row items-center mb-2">
                                <MapPin size={14} color={colors.textSecondary} />
                                <Text className="text-[10px] font-black text-textSecondary tracking-widest ml-2">Location Identity</Text>
                            </View>
                            <Text className="text-primary font-bold text-sm leading-6">
                                {vendor.storeAddress || 'Address details managed at store'}
                            </Text>
                        </View>

                        <CustomButton
                            title="Open Map"
                            onPress={handlePinOnMap}
                        />
                    </View>

                    {/* Active Offers Section */}
                    <View className="mt-10 mb-20">
                        <View className="flex-row items-center justify-between mb-8 px-2">
                            <View>
                                <Text className="text-[10px] font-black text-secondary tracking-widest mb-1">Store Inventory</Text>
                                <Text className="text-3xl font-black text-primary tracking-tighter">Active Deals</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="bg-secondary/10 px-4 py-2 rounded-2xl border border-secondary/10 mr-3">
                                    <Text className="text-secondary font-black text-[10px] tracking-widest">{offers.length} LIVE</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                    className="bg-white w-10 h-10 rounded-xl shadow-md border border-surface items-center justify-center"
                                >
                                    {viewMode === 'list' ? (
                                        <LayoutGrid size={18} color={colors.primary} strokeWidth={2.5} />
                                    ) : (
                                        <List size={18} color={colors.primary} strokeWidth={2.5} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {offers.length > 0 ? (
                            <View className="flex-row flex-wrap justify-between px-1">
                                {offers.map((item) => (
                                    <View
                                        key={item._id}
                                        style={{
                                            width: viewMode === 'grid' ? '48.5%' : '100%'
                                        }}
                                        className="mb-2"
                                    >
                                        <OfferCard
                                            offer={item}
                                            grid={viewMode === 'grid'}
                                            onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                        />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-surface">
                                <LucidePackage size={48} color={colors.surface} />
                                <Text className="text-textSecondary font-bold mt-4">No Active Deals Right Now</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={{ height: Math.max(insets.bottom, 40) }} />
            </ScrollView>
        </View>
    );
};

export default PublicStoreProfileScreen;
