import React, { useState, useEffect } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, TextInput, FlatList, Image, useWindowDimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, SlidersHorizontal, Bell, ChevronDown, Flame, Filter, LayoutGrid, List } from 'lucide-react-native';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import OfferCard from '../components/OfferCard';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const getCategories = (t) => [
    { id: '1', key: 'all', name: t('categories.all'), icon: '🛍️' },
    { id: '2', key: 'food', name: t('categories.food'), icon: '🍔' },
    { id: '3', key: 'grocery', name: t('categories.grocery'), icon: '🛒' },
    { id: '4', key: 'fashion', name: t('categories.fashion'), icon: '👕' },
    { id: '5', key: 'electronics', name: t('categories.electronics'), icon: '📱' },
    { id: '6', key: 'health', name: t('categories.health'), icon: '💊' },
    { id: '7', key: 'other', name: t('categories.other'), icon: '📦' },
];

const HomeScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const CATEGORIES = getCategories(t);
    const [selectedCategory, setSelectedCategory] = useState('1');
    const [location, setLocation] = useState('Ahmedabad, Gujarat');
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [radius, setRadius] = useState(5);
    const [viewMode, setViewMode] = useState('list');
    const [offers, setOffers] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const getUserLocation = async () => {
        try {
            const savedLoc = await AsyncStorage.getItem('userLocation');
            if (savedLoc) {
                const parsed = JSON.parse(savedLoc);
                setLocation(parsed.city);
                setUserCoordinates(parsed.coords);
                return parsed.coords;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return null;

            const loc = await Location.getCurrentPositionAsync({});
            const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };

            const [geocode] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            let city = 'Ahmedabad, Gujarat';
            if (geocode) {
                city = `${geocode.city || geocode.subregion || 'Unknown City'}, ${geocode.region || ''}`;
            }

            await AsyncStorage.setItem('userLocation', JSON.stringify({ city, coords }));
            setLocation(city);
            setUserCoordinates(coords);
            return coords;
        } catch (error) {
            console.error("Location Error:", error);
            return null;
        }
    };

    const fetchData = async (pageNum = 1, isRefresh = false, coordsOverride = null) => {
        try {
            if (pageNum === 1 && !isRefresh) setLoading(true);
            if (pageNum > 1) setLoadingMore(true);

            console.log("Fetching Home Data, Page:", pageNum);
            const token = await AsyncStorage.getItem('userToken');

            let coordsToUse = coordsOverride || userCoordinates;
            if (!coordsToUse) {
                coordsToUse = await getUserLocation();
            }

            const currentCategoryKey = CATEGORIES.find(c => c.id === selectedCategory)?.key || 'all';
            let url = `${API_BASE_URL}/offers?page=${pageNum}&limit=10&category=${currentCategoryKey}&search=${searchQuery}`;

            if (coordsToUse) {
                url += `&lat=${coordsToUse.lat}&lng=${coordsToUse.lng}&radius=${radius}`;
            }

            const [offersRes, wishlistRes] = await Promise.all([
                fetch(url),
                token && pageNum === 1 ? fetch(`${API_BASE_URL}/wishlist/status`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve(null)
            ]);

            const offersData = await offersRes.json();
            if (offersData.success) {
                if (pageNum === 1) {
                    setOffers(offersData.offers || []);
                } else {
                    setOffers(prev => [...prev, ...offersData.offers]);
                }
                setHasMore(offersData.hasMore);
                setPage(pageNum);
            }

            if (wishlistRes) {
                const wishlistData = await wishlistRes.json();
                if (wishlistData.success) {
                    setWishlistIds(wishlistData.offerIds || []);
                }
            }
        } catch (error) {
            console.error("Fetch data error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleLocationSelect = async (locString) => {
        setIsLocationModalVisible(false);
        setLocation(locString);
        try {
            const geocoded = await Location.geocodeAsync(locString);
            if (geocoded && geocoded.length > 0) {
                const coords = { lat: geocoded[0].latitude, lng: geocoded[0].longitude };
                setUserCoordinates(coords);
                await AsyncStorage.setItem('userLocation', JSON.stringify({ city: locString, coords }));
                setPage(1);
                fetchData(1, true, coords);
            } else {
                onRefresh();
            }
        } catch (error) {
            console.error("Geocoding User Error:", error);
            onRefresh();
        }
    };

    useEffect(() => {
        fetchData();
        if (navigation && navigation.addListener) {
            const unsubscribe = navigation.addListener('focus', () => {
                fetchData(1, true);
            });
            return unsubscribe;
        }
    }, [navigation]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            onRefresh();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [selectedCategory, searchQuery, radius]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchData(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading && !refreshing) {
            fetchData(page + 1);
        }
    };

    const now = new Date();
    // In server-side pagination, activeOffers are what we get from the server
    const activeOffers = offers || [];

    // Filter discovery sections from the current pool of data
    const hotOffers = [...activeOffers]
        .filter(o => now >= new Date(o.startDate) && now <= new Date(o.endDate))
        .sort((a, b) => (b.visits || 0) - (a.visits || 0))
        .slice(0, 4);

    const upcomingOffers = activeOffers.filter(o => new Date(o.startDate) > now);

    const isTablet = width > 768;

    const renderHeader = () => (
        <View>
            {/* Categories */}
            <View style={{ backgroundColor: colors.background }} className="py-6">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {CATEGORIES.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setSelectedCategory(item.id)}
                            style={{
                                marginRight: 16,
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: selectedCategory === item.id ? colors.primary : colors.border,
                                backgroundColor: selectedCategory === item.id ? colors.primary : colors.card
                            }}
                        >
                            <Text style={{ fontSize: 18, marginRight: 8 }}>{item.icon}</Text>
                            <Text style={{
                                fontWeight: 'bold',
                                color: selectedCategory === item.id ? '#FFFFFF' : colors.primary
                            }}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Discovery Sections (only if not searching) */}
            {searchQuery === '' && (
                <>
                    {/* Hot Offers Section */}
                    {hotOffers.length > 0 && (
                        <View className="mt-4">
                            <View className="px-6 flex-row items-end justify-between mb-6">
                                <View>
                                    <View className="flex-row items-center mb-1">
                                        <View className="w-2 h-2 bg-error rounded-full mr-2" />
                                        <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px]">{t('home.most_visited')}</Text>
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-3xl font-black tracking-tighter">{t('home.hot_offers')}</Text>
                                </View>
                            </View>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={hotOffers}
                                keyExtractor={(item, index) => item?._id || index.toString()}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                                renderItem={({ item }) => (
                                    <View style={{ width: width > 600 ? 350 : width * 0.85 }} className="mr-6">
                                        <OfferCard
                                            offer={item}
                                            isFavorite={wishlistIds.includes(item?._id)}
                                            onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    )}

                    {/* Upcoming Offers Section */}
                    {upcomingOffers.length > 0 && (
                        <View className="mt-8">
                            <View className="px-6 flex-row items-end justify-between mb-6">
                                <View>
                                    <View className="flex-row items-center mb-1">
                                        <View className="w-2.5 h-2.5 bg-warning rounded-full mr-2" />
                                        <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px]">{t('home.coming_soon')}</Text>
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-3xl font-black tracking-tighter">{t('home.upcoming_offers')}</Text>
                                </View>
                            </View>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={upcomingOffers}
                                keyExtractor={(item, index) => item?._id || index.toString()}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                                renderItem={({ item }) => (
                                    <View style={{ width: width > 600 ? 350 : width * 0.85 }} className="mr-6">
                                        <OfferCard
                                            offer={item}
                                            isFavorite={wishlistIds.includes(item?._id)}
                                            onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                    )}
                </>
            )}

            {/* Main List Title & Filters */}
            <View className="px-6 mt-8 flex-row items-center justify-between mb-4">
                <View>
                    <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px] mb-1">{t('home.flash_sales')}</Text>
                    <Text style={{ color: colors.text }} className="text-2xl font-black">{t('home.near_your_place')}</Text>
                </View>
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => setRadius(radius === 10 ? 1 : radius === 5 ? 10 : 5)}
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        className="px-4 py-2 rounded-xl shadow-md border flex-row items-center"
                    >
                        <Filter size={14} color={colors.primary} strokeWidth={3} />
                        <Text style={{ color: colors.primary }} className="text-xs font-black ml-2">{radius}{t('common.km')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        className="ml-2 w-10 h-10 rounded-xl shadow-md border items-center justify-center"
                    >
                        {viewMode === 'list' ? (
                            <LayoutGrid size={18} color={colors.primary} strokeWidth={2.5} />
                        ) : (
                            <List size={18} color={colors.primary} strokeWidth={2.5} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderOfferItem = ({ item, index }) => {
        const isGrid = (width > 768) || viewMode === 'grid';
        return (
            <View
                style={{
                    width: isGrid ? '48.5%' : '100%',
                    marginBottom: 8, // Changed from 16 to 8 to match mb-2
                }}
            >
                <OfferCard
                    offer={item}
                    grid={isGrid}
                    isFavorite={wishlistIds.includes(item?._id)}
                    onRefresh={onRefresh}
                    onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <View style={{ backgroundColor: colors.card }} className="px-6 pt-6 pb-2 shadow-sm">
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <View style={{ backgroundColor: `${colors.primary}10` }} className="w-12 h-12 rounded-2xl items-center justify-center">
                            <MapPin size={24} color={colors.primary} strokeWidth={2.5} />
                        </View>
                        <TouchableOpacity onPress={() => setIsLocationModalVisible(true)} className="ml-4">
                            <View className="flex-row items-center">
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest mr-1 opacity-60">{t('home.your_location')}</Text>
                                <ChevronDown size={12} color={colors.textSecondary} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-sm font-black tracking-tight">{location}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Notifications')}
                        style={{ backgroundColor: colors.surface }}
                        className="w-12 h-12 rounded-2xl items-center justify-center border border-surface"
                    >
                        <Bell size={22} color={colors.primary} strokeWidth={2.5} />
                        <View className="absolute top-2.5 right-2.5 w-3 h-3 bg-error rounded-full border-2 border-white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center mb-3">
                    <View style={{ backgroundColor: colors.surface }} className="flex-1 h-14 rounded-2xl flex-row items-center px-5 border border-surface">
                        <Search size={20} color={colors.textSecondary} strokeWidth={2.5} />
                        <TextInput
                            style={{ color: colors.text }}
                            placeholder={t('home.search_placeholder')}
                            placeholderTextColor={colors.textSecondary + '80'}
                            className="flex-1 ml-4 font-bold text-sm"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={{ backgroundColor: isDarkMode ? '#4bb2f9' : colors.primary }} className="ml-3 w-14 h-14 rounded-2xl items-center justify-center shadow-lg">
                        <SlidersHorizontal size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList className="mt-1"
                    key={viewMode} // Force re-render when switching modes
                    data={activeOffers}
                    renderItem={renderOfferItem}
                    keyExtractor={(item) => item?._id || Math.random().toString()}
                    numColumns={((width > 768) || viewMode === 'grid') ? 2 : 1}
                    columnWrapperStyle={((width > 768) || viewMode === 'grid') ? { justifyContent: 'space-between', paddingHorizontal: 16 } : null}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={() => (
                        loadingMore ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : <View className="h-20" />
                    )}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    ListEmptyComponent={() => (
                        <View className="py-24 items-center w-full px-6">
                            <View style={{ backgroundColor: colors.surface }} className="w-40 h-40 rounded-full items-center justify-center mb-6">
                                <Search size={64} color={colors.border} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-2xl font-black text-center">{t('home.no_offers_found')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-center mt-2 font-medium opacity-60">
                                {t('home.no_offers_desc')}
                            </Text>
                        </View>
                    )}
                />
            )}

            <LocationSelectorModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
                onSelectLocation={handleLocationSelect}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;
