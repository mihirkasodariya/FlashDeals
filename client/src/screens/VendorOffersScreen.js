import React, { useState, useEffect } from 'react';
import Text from '../components/CustomText';
import { View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, useWindowDimensions, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Package as LucidePackage, Trash2, Calendar, Tag, Eye, MousePointer2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const VendorOffersScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyOffers();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyOffers();
    };

    const confirmDelete = async () => {
        if (!selectedOfferId) return;
        setIsDeleting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/offers/delete/${selectedOfferId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setShowDeleteModal(false);
                setShowSuccessModal(true);
                fetchMyOffers();
            } else {
                Alert.alert(t('common.error'), data.message);
                setShowDeleteModal(false);
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('common.server_error'));
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteOffer = (offerId) => {
        setSelectedOfferId(offerId);
        setShowDeleteModal(true);
    };

    const renderOfferItem = ({ item }) => {
        const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');
        return (
            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] mb-6 p-5 shadow-sm border overflow-hidden">
                <View className="flex-row">
                    <Image
                        source={{ uri: item.image.startsWith('http') ? item.image : `${STATIC_BASE_URL}${item.image}` }}
                        style={{ backgroundColor: colors.surface }}
                        className="w-24 h-24 rounded-2xl"
                        resizeMode="cover"
                    />
                    <View className="ml-4 flex-1">
                        <View style={{ backgroundColor: `${colors.primary}15` }} className="self-start px-2 py-1 rounded-lg mb-1">
                            <Text style={{ color: colors.primary }} className="text-[10px] font-black uppercase tracking-wider">{t(`categories.${item.category.toLowerCase()}`)}</Text>
                        </View>
                        <Text style={{ color: colors.text }} className="text-lg font-black leading-6" numberOfLines={2}>{item.title}</Text>

                        <View className="flex-row items-center mt-2 opacity-60">
                            <Calendar size={12} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-1">
                                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Analytics Row */}
                <View style={{ borderTopColor: colors.border }} className="flex-row items-center justify-between mt-5 pt-4 border-t">
                    <View className="flex-row items-center gap-6">
                        <View className="flex-row items-center">
                            <View style={{ backgroundColor: `${staticColors.secondary}15` }} className="p-2 rounded-xl mr-2">
                                <Eye size={14} color={staticColors.secondary} />
                            </View>
                            <View>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black">{t('store.impressions')}</Text>
                                <Text style={{ color: colors.text }} className="text-sm font-black">{item.impressions || 0}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View style={{ backgroundColor: `${colors.primary}15` }} className="p-2 rounded-xl mr-2">
                                <MousePointer2 size={14} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black">{t('store.visits')}</Text>
                                <Text style={{ color: colors.text }} className="text-sm font-black">{item.visits || 0}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddOffer', { offerToEdit: item })}
                            style={{ backgroundColor: colors.surface }}
                            className="w-10 h-10 items-center justify-center rounded-xl"
                        >
                            <Edit2 size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDeleteOffer(item._id)}
                            style={{ backgroundColor: `${staticColors.error}15` }}
                            className="w-10 h-10 items-center justify-center rounded-xl"
                        >
                            <Trash2 size={18} color={staticColors.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="ml-4 text-2xl font-black">{t('store.my_flash_offers')}</Text>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOfferItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <View style={{ backgroundColor: colors.surface }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
                                <LucidePackage size={40} color={colors.border} strokeWidth={1.5} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-xl font-black">{t('store.no_active_offers')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-center mt-2">{t('store.no_offers_desc')}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AddOffer')}
                                className="mt-8 bg-primary px-8 py-4 rounded-2xl"
                            >
                                <Text className="text-white font-black text-xs tracking-widest">{t('store.create_first_offer')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
            {/* Delete Confirmation Modal */}
            <Modal transparent visible={showDeleteModal} animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="rounded-[40px] p-8 w-full items-center shadow-2xl relative overflow-hidden">
                        <View style={{ backgroundColor: `${staticColors.error}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                            <Trash2 size={40} color="#FF4444" strokeWidth={1.5} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-black mb-2 text-center tracking-tight">{t('common.confirm')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center mb-10 font-medium leading-5 opacity-70 px-2">{t('store.delete_confirm_msg')}</Text>

                        <View className="w-full">
                            <TouchableOpacity
                                onPress={confirmDelete}
                                disabled={isDeleting}
                                style={{ backgroundColor: '#FF4444' }}
                                className="w-full py-5 rounded-[24px] items-center mb-4 shadow-lg shadow-[#FF4444]/20"
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-black text-sm tracking-tight">{t('common.delete')}</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowDeleteModal(false)}
                                style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC' }}
                                className="w-full py-5 rounded-[24px] items-center"
                            >
                                <Text style={{ color: colors.text }} className="font-black text-sm tracking-tight">{t('common.cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal transparent visible={showSuccessModal} animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="w-full rounded-[40px] p-8 items-center shadow-2xl relative overflow-hidden">
                        <View style={{ backgroundColor: `${staticColors.success}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                            <CheckCircle2 size={40} color={staticColors.success} strokeWidth={1.5} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-black mb-2 text-center tracking-tight">{t('common.success')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center mb-10 font-medium leading-5 opacity-70 px-2">{t('common.offer_deleted_success') || 'Offer deleted successfully!'}</Text>

                        <TouchableOpacity
                            onPress={() => setShowSuccessModal(false)}
                            style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC' }}
                            className="w-full py-5 rounded-[24px] flex-row items-center justify-center"
                        >
                            <CheckCircle2 size={16} color={colors.primary} className="mr-2" />
                            <Text style={{ color: colors.primary }} className="font-black text-sm tracking-tight">{t('common.cool') || 'Done'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default VendorOffersScreen;
