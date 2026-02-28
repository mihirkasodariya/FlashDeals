import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Package as LucidePackage, Trash2, Calendar, Tag } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const VendorOffersScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyOffers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileRes.json();

            if (profileData.success) {
                const response = await fetch(`${API_BASE_URL}/offers/vendor/${profileData.user._id}`);
                const data = await response.json();
                if (data.success) {
                    setOffers(data.offers);
                }
            }
        } catch (error) {
            console.error("Fetch my offers error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOffers();
    }, []);

    const renderOfferItem = ({ item }) => {
        const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');
        return (
            <View className="bg-white rounded-[32px] mb-4 p-4 shadow-sm border border-surface overflow-hidden">
                <View className="flex-row">
                    <Image
                        source={{ uri: `${STATIC_BASE_URL}${item.image}` }}
                        className="w-24 h-24 rounded-2xl bg-surface"
                        resizeMode="cover"
                    />
                    <View className="ml-4 flex-1">
                        <View className="bg-primary/5 self-start px-2 py-1 rounded-lg mb-1">
                            <Text className="text-[10px] font-black text-primary">{item.category}</Text>
                        </View>
                        <Text className="text-lg font-black text-primary leading-6" numberOfLines={2}>{item.title}</Text>

                        <View className="flex-row items-center mt-2 opacity-50">
                            <Calendar size={12} color={colors.primary} />
                            <Text className="text-[10px] font-bold text-primary ml-1">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm border border-surface">
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="ml-4 text-2xl font-black text-primary">My Flash Deals</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOfferItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
                                <LucidePackage size={40} color={colors.border} strokeWidth={1.5} />
                            </View>
                            <Text className="text-xl font-black text-primary">No Active Deals</Text>
                            <Text className="text-textSecondary text-center mt-2">You haven't launched any flash deals yet.</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AddOffer')}
                                className="mt-8 bg-primary px-8 py-4 rounded-2xl"
                            >
                                <Text className="text-white font-black text-xs tracking-widest">Create First Deal</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default VendorOffersScreen;
