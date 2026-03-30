import React, { useState, useEffect, useCallback } from 'react';
import Text from '../components/CustomText';
import { View, FlatList, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, useWindowDimensions, RefreshControl, Modal, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Package as LucidePackage, Trash2, Calendar, Tag, Eye, MousePointer2, Edit2, AlertCircle, CheckCircle2, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';
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

const DummyNativeAd = ({ colors }) => (
    <View
        style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed'
        }}
    >
        <View className="flex-row items-center mb-3">
            <View style={{ backgroundColor: '#4285F4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 10 }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'black' }}>Sponsored</Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black">Recommended Deal</Text>
        </View>
        <View style={{ backgroundColor: '#eeeeee', height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#9e9e9e', fontWeight: 'bold' }}>Native Ad Media Placeholder</Text>
        </View>
        <Text style={{ color: colors.text }} className="text-lg font-black mb-1">Premium Product Promotion</Text>
        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold leading-4 opacity-70">This is a sample layout for a Google Native Ad that fits perfectly with your app's design.</Text>
    </View>
);

const VendorOffersScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [stats, setStats] = useState({ active: 0, upcoming: 0, expired: 0, drafts: 0 });
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchMyOffers = async (pageNum = 1, isRefresh = false) => {
        try {
            if (pageNum === 1 && !isRefresh) setLoading(true);
            if (pageNum > 1) setLoadingMore(true);

            const token = await AsyncStorage.getItem('userToken');
            const profileRes = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileRes.json();

            if (profileData.success) {
                const response = await fetch(`${API_BASE_URL}/offers/vendor/${profileData.user._id}?page=${pageNum}&limit=5`);
                const data = await response.json();
                if (data.success) {
                    if (pageNum === 1) {
                        setOffers(data.offers);
                    } else {
                        setOffers(prev => {
                            const existingIds = new Set(prev.map(o => o._id));
                            const uniqueNewOffers = data.offers.filter(o => !existingIds.has(o._id));
                            return [...prev, ...uniqueNewOffers];
                        });
                    }
                    if (data.stats) setStats(data.stats);
                    setHasMore(data.hasMore);
                    setPage(pageNum);
                }
            }
        } catch (error) {
            console.error("Fetch my offers error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyOffers();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchMyOffers(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading && !refreshing) {
            fetchMyOffers(page + 1);
        }
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
                        source={{ 
                            uri: item.image 
                                ? (item.image.startsWith('http') ? item.image : `${STATIC_BASE_URL}${item.image}`)
                                : 'https://via.placeholder.com/150?text=No+Image' 
                        }}
                        style={{ backgroundColor: colors.surface }}
                        className="w-24 h-24 rounded-2xl"
                        resizeMode="cover"
                    />
                    <View className="ml-4 flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <View style={{ backgroundColor: `${colors.primary}15` }} className="px-2 py-1 rounded-lg">
                                <Text style={{ color: colors.primary }} className="text-[10px] font-black">
                                    {(item.category?.name || item.category) || '-'}
                                </Text>
                            </View>
                            {(() => {
                                const now = new Date();
                                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                                const start = new Date(item.startDate);
                                const end = new Date(item.endDate);
                                
                                let status = { label: 'Active', color: '#10B981', bg: '#10B98115' };
                                
                                if (item.status === 'draft') {
                                    status = { label: 'Draft', color: '#8B5CF6', bg: '#8B5CF615' };
                                } else if (start > todayEnd) {
                                    status = { label: 'Upcoming', color: '#F59E0B', bg: '#F59E0B15' };
                                } else if (end < todayStart) {
                                    status = { label: 'Expired', color: '#EF4444', bg: '#EF444415' };
                                }
                                
                                return (
                                    <View style={{ backgroundColor: status.bg }} className="px-2 py-1 rounded-lg">
                                        <Text style={{ color: status.color }} className="text-[9px] font-black">{status.label}</Text>
                                    </View>
                                );
                            })()}
                        </View>
                        <Text style={{ color: colors.text }} className="text-lg font-black leading-6" numberOfLines={2}>{item.title}</Text>
                        
                        <View className="flex-row items-center mt-2 opacity-60">
                            <Calendar size={12} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-1">
                                {item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}
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

    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <View className="flex-row items-center justify-between px-6 py-4">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ backgroundColor: colors.surface }}
                        className="w-10 h-10 items-center justify-center rounded-xl"
                    >
                        <ChevronLeft size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={{ color: colors.text }} className="ml-4 text-2xl font-black">{t('store.my_flash_offers')}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('AddOffer')}
                    style={{ backgroundColor: colors.primary }}
                    className="w-10 h-10 items-center justify-center rounded-xl shadow-lg shadow-primary/30"
                >
                    <Plus size={20} color="white" strokeWidth={3} />
                </TouchableOpacity>
            </View>

            {/* Quick Stats & Filters */}
            <View className="mb-4">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                >
                    {[
                        { label: 'All', count: stats.active + stats.upcoming + stats.expired + (stats.drafts || 0), color: colors.primary },
                        { label: 'Active', count: stats.active, color: '#10B981' },
                        { label: 'Drafts', count: stats.drafts || 0, color: '#8B5CF6' },
                        { label: 'Upcoming', count: stats.upcoming, color: '#F59E0B' },
                        { label: 'Expired', count: stats.expired, color: '#EF4444' }
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => setFilterStatus(item.label)}
                            style={{ 
                                backgroundColor: filterStatus === item.label ? item.color : colors.card,
                                borderColor: filterStatus === item.label ? item.color : colors.border
                            }}
                            className="px-5 py-3 rounded-2xl border flex-row items-center shadow-sm"
                        >
                            <Text style={{ color: filterStatus === item.label ? 'white' : colors.text }} className="font-black text-xs mr-2">{item.label}</Text>
                            <View style={{ backgroundColor: filterStatus === item.label ? 'rgba(255,255,255,0.2)' : `${item.color}15` }} className="px-2 py-0.5 rounded-lg">
                                <Text style={{ color: filterStatus === item.label ? 'white' : item.color }} className="text-[10px] font-black">{item.count}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={offers.filter(offer => {
                        if (filterStatus === 'All') return true;
                        const now = new Date();
                        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                        const start = new Date(offer.startDate);
                        const end = new Date(offer.endDate);

                        if (filterStatus === 'Active') return offer.status !== 'draft' && start <= todayEnd && end >= todayStart;
                        if (filterStatus === 'Drafts') return offer.status === 'draft';
                        if (filterStatus === 'Upcoming') return offer.status !== 'draft' && start > todayEnd;
                        if (filterStatus === 'Expired') return offer.status !== 'draft' && end < todayStart;
                        return true;
                    })}
                    renderItem={({ item, index }) => (
                        <View>
                            {index > 0 && index % 3 === 0 && (
                                <View className="mb-6">
                                    {/* <DummyNativeAd colors={colors} /> */}
                                </View>
                            )}
                            {renderOfferItem({ item })}
                        </View>
                    )}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS === 'android'}
                    initialNumToRender={5}
                    ListFooterComponent={() => (
                        loadingMore ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-2 opacity-50">{t('common.loading_more') || 'Loading More'}</Text>
                            </View>
                        ) : null
                    )}
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
                                <Text style={{ color: '#FFFFFF' }} className="text-white font-black text-xs">{t('store.create_first_offer')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* <View style={{ backgroundColor: colors.background, paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}>
                <DummyBannerAd colors={colors} />
            </View> */}
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
