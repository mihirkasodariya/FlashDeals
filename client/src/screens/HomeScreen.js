import React, { useState, useEffect } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, TextInput, FlatList, Image, useWindowDimensions, ActivityIndicator, RefreshControl, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, MapPin, Bell, Navigation2, X, ArrowRight, Filter, ChevronRight, ChevronDown, LayoutGrid, List } from 'lucide-react-native';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads'; // Temporarily disabled for Expo Go
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import OfferCard from '../components/OfferCard';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Categories will be fetched from the backend

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
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'black' }}>SPONSORED</Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest">Recommended Deal</Text>
        </View>
        <View style={{ backgroundColor: '#eeeeee', height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#9e9e9e', fontWeight: 'bold' }}>Native Ad Media Placeholder</Text>
        </View>
        <Text style={{ color: colors.text }} className="text-lg font-black mb-1">Premium Product Promotion</Text>
        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold leading-4 opacity-70">This is a sample layout for a Google Native Ad that fits perfectly with your app's design.</Text>
    </View>
);

const HomeScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [categories, setCategories] = useState([{ _id: 'all', name: t('categories.all'), isStatic: true }]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [location, setLocation] = useState(t('location_selector.detect_current') + '...');
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
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [pickingStep, setPickingStep] = useState(null); // 'start' or 'end'
    const [tempStart, setTempStart] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const getUserLocation = async () => {
        try {
            // First, check permission
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                // Fresh GPS detection
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };

                const [geocode] = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude
                });

                let city = 'Ahmedabad, Gujarat';
                if (geocode) {
                    city = `${geocode.city || geocode.subregion || 'Unknown City'}, ${geocode.region || ''}`;
                }

                // Save for future reference as fallback
                await AsyncStorage.setItem('userLocation', JSON.stringify({ city, coords }));
                setLocation(city);
                setUserCoordinates(coords);
                return coords;
            }

            // Fallback: If no permission or failed, try saved location
            const savedLoc = await AsyncStorage.getItem('userLocation');
            if (savedLoc) {
                const parsed = JSON.parse(savedLoc);
                setLocation(parsed.city);
                setUserCoordinates(parsed.coords);
                return parsed.coords;
            }

            return null;
        } catch (error) {
            console.error("Location Error:", error);
            // Last resort fallback
            const savedLoc = await AsyncStorage.getItem('userLocation');
            if (savedLoc) {
                const parsed = JSON.parse(savedLoc);
                return parsed.coords;
            }
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

            const currentCategoryObj = categories.find(c => c._id === selectedCategory);
            const currentCategoryKey = currentCategoryObj?.isStatic ? 'all' : (currentCategoryObj?._id || 'all');
            let url = `${API_BASE_URL}/offers?page=${pageNum}&limit=10&category=${currentCategoryKey}&search=${searchQuery}`;

            if (coordsToUse) {
                url += `&lat=${coordsToUse.lat}&lng=${coordsToUse.lng}&radius=${radius}`;
            }

            if (dateRange.start && dateRange.end) {
                url += `&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`;
            }

            const [offersRes, wishlistRes] = await Promise.all([
                fetch(url),
                token && pageNum === 1 ? fetch(`${API_BASE_URL}/wishlist/status`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve(null)
            ]);

            const offersData = await offersRes.json();
            if (offersData.success) {
                const incomingOffers = offersData.offers || [];
                if (pageNum === 1) {
                    // Filter duplicates even in first page just in case server is messy
                    const uniqueInPage = incomingOffers.filter((item, index, self) => 
                        item?._id && index === self.findIndex((t) => (t._id === item._id))
                    );
                    setOffers(uniqueInPage);
                } else {
                    setOffers(prev => {
                        const existingIds = new Set(prev.map(o => o._id));
                        const uniqueNewOffers = incomingOffers.filter(o => 
                            o?._id && !existingIds.has(o._id) && 
                            // Avoid duplicates within the new chunk itself
                            incomingOffers.findIndex(io => io._id === o._id) === incomingOffers.indexOf(o)
                        );
                        return [...prev, ...uniqueNewOffers];
                    });
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

    const fetchCategories = async () => {
        try {
            const resp = await fetch(`${API_BASE_URL}/categories?activeOnly=true`);
            const data = await resp.json();
            if (data.success) {
                const staticCats = [{ _id: 'all', name: t('categories.all'), isStatic: true }];
                const dynamicCats = data.categories || [];
                
                // Merge and remove potential duplicates (if server ever sends 'all' id)
                const merged = [...staticCats, ...dynamicCats];
                const uniqueCats = merged.filter((item, index, self) => 
                    item?._id && index === self.findIndex((t) => (t._id === item._id))
                );
                
                setCategories(uniqueCats);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    useEffect(() => {
        // Initial fetch only - Do not re-fetch on focus to prevent flickering
        fetchCategories();
        fetchData();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            onRefresh();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [selectedCategory, searchQuery, radius, dateRange]);

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

    const onDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            if (pickingStep === 'start') {
                setTempStart(date);
                setPickingStep('end');
                if (Platform.OS === 'android') {
                    setTimeout(() => setShowDatePicker(true), 200);
                }
            } else if (pickingStep === 'end') {
                if (date < tempStart) {
                    Alert.alert(t('common.error'), 'Ant ki tarikh shuru ki tarikh se pehle nahi ho sakti');
                    setPickingStep('start');
                    return;
                }
                setDateRange({ start: tempStart, end: date });
                setPickingStep(null);
                setTempStart(null);
                setShowDatePicker(false);
            }
        } else {
            setPickingStep(null);
            setShowDatePicker(false);
        }
    };

    const renderDatePicker = () => {
        if (!showDatePicker) return null;

        const currentValue = pickingStep === 'start' ? new Date() : (tempStart || new Date());
        const minDate = pickingStep === 'end' ? tempStart : null; // No minimum date for 'start' step allows picking past/future ranges easily

        if (Platform.OS === 'ios') {
            return (
                <Modal transparent animationType="fade" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
                    <View className="flex-1 justify-end bg-black/40">
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            onPress={() => { setShowDatePicker(false); setPickingStep(null); setTempStart(null); }}
                        />
                        <View style={{ backgroundColor: colors.card }} className="rounded-t-[40px] p-8 pb-12 shadow-2xl">
                            <View className="flex-row justify-between items-center mb-6">
                                <View>
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest uppercase mb-1">
                                        {t('home.select_range')}
                                    </Text>
                                    <Text style={{ color: colors.text }} className="text-xl font-black text-primary">
                                        {pickingStep === 'start' ? t('home.select_start_date') : t('home.select_end_date')}
                                    </Text>
                                </View>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        onPress={() => {
                                            const today = new Date();
                                            setDateRange({ start: today, end: today });
                                            setPickingStep(null);
                                            setTempStart(null);
                                            setShowDatePicker(false);
                                        }}
                                        style={{ backgroundColor: `${colors.primary}10` }}
                                        className="px-6 py-2 rounded-xl mr-2"
                                    >
                                        <Text style={{ color: colors.primary }} className="font-black text-sm">{t('common.today')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { setDateRange({ start: null, end: null }); setPickingStep(null); setTempStart(null); setShowDatePicker(false); }}
                                        style={{ backgroundColor: `${staticColors.error}10` }}
                                        className="px-6 py-2 rounded-xl"
                                    >
                                        <Text style={{ color: staticColors.error }} className="font-black text-sm">{t('common.cancel')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <DateTimePicker
                                value={currentValue}
                                mode="date"
                                display="inline"
                                onChange={onDateChange}
                                minimumDate={minDate}
                                themeVariant={isDarkMode ? 'dark' : 'light'}
                                accentColor={colors.primary}
                            />
                        </View>
                    </View>
                </Modal>
            );
        }

        return (
            <DateTimePicker
                value={currentValue}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={minDate}
            />
        );
    };

    const refNow = dateRange.start ? new Date(dateRange.start) : new Date();
    // In server-side pagination, activeOffers are what we get from the server
    const activeOffers = offers || [];

    // Filter discovery sections from the current pool of data
    const hotOffers = [...activeOffers]
        .filter(o => refNow >= new Date(o.startDate) && refNow <= new Date(o.endDate))
        .sort((a, b) => (b.visits || 0) - (a.visits || 0))
        .slice(0, 4);

    const upcomingOffers = activeOffers.filter(o => new Date(o.startDate) > refNow);

    // For the main list, we already filter overlapping range from backend
    const mainListOffers = activeOffers;

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
                    {categories.map((item) => (
                        <TouchableOpacity
                            key={item._id}
                            onPress={() => setSelectedCategory(item._id)}
                            style={{
                                marginRight: 16,
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: selectedCategory === item._id ? colors.primary : colors.border,
                                backgroundColor: selectedCategory === item._id ? colors.primary : colors.card
                            }}
                        >
                            {item.isStatic ? (
                                <Text style={{ fontSize: 18, marginRight: 8 }}>🛍️</Text>
                            ) : item.image ? (
                                <Image
                                    source={{ uri: `${API_BASE_URL.replace('/api', '')}${item.image}` }}
                                    style={{ width: 20, height: 20, marginRight: 8, borderRadius: 4 }}
                                />
                            ) : (
                                <Text style={{ fontSize: 18, marginRight: 8 }}>📦</Text>
                            )}
                            <Text style={{
                                fontWeight: 'bold',
                                color: selectedCategory === item._id ? '#FFFFFF' : colors.primary
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
                                keyExtractor={(item) => item._id.toString()}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                                renderItem={({ item }) => (
                                    <View style={{ width: width > 600 ? 350 : width * 0.7 }} className="mr-6">
                                        <OfferCard
                                            offer={item}
                                            isFavorite={wishlistIds.includes(item?._id)}
                                            onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                        />
                                    </View>
                                )}
                            />
                            {/* Ad after Hot Offers */}
                            <View className="mt-2 mb-6 px-6">
                                <DummyBannerAd colors={colors} label="Featured Sponsored Content" />
                            </View>
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
                                keyExtractor={(item) => item._id.toString()}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                                renderItem={({ item }) => (
                                    <View style={{ width: width > 600 ? 350 : width * 0.7 }} className="mr-6">
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
            <View style={{ width: isGrid ? '48.5%' : '100%', marginBottom: 8 }}>
                {index > 0 && index % 5 === 0 && (
                    <View style={{ width: isGrid ? ((width - 32) / (width > 768 ? 2 : 1)) : '100%' }}>
                        <DummyNativeAd colors={colors} />
                    </View>
                )}
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
                    <TouchableOpacity
                        onPress={() => {
                            setPickingStep('start');
                            setShowDatePicker(true);
                        }}
                        style={{ backgroundColor: colors.surface }}
                        className={`ml-3 w-14 h-14 rounded-2xl items-center justify-center border border-surface`}
                    >
                        {dateRange.start ? (
                            <View className="items-center justify-center">
                                <Calendar size={22} color={colors.primary} strokeWidth={2.5} />
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setDateRange({ start: null, end: null });
                                    }}
                                    style={{ backgroundColor: colors.primary }}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full items-center justify-center border-2 border-white"
                                >
                                    <X size={10} color="white" strokeWidth={4} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Calendar size={22} color={colors.primary} strokeWidth={2.5} />
                        )}
                    </TouchableOpacity>
                </View>
                {dateRange.start && dateRange.end && (
                    <View style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }} className="flex-row items-center justify-center py-2 px-4 rounded-xl mb-3 border self-center">
                        <Calendar size={14} color={colors.primary} strokeWidth={2.5} />
                        <Text style={{ color: colors.primary }} className="font-black text-[10px] ml-2 tracking-widest">
                            {dateRange.start.toLocaleDateString()}
                        </Text>
                        <ArrowRight size={14} color={colors.primary} className="mx-2" />
                        <Text style={{ color: colors.primary }} className="font-black text-[10px] tracking-widest">
                            {dateRange.end.toLocaleDateString()}
                        </Text>
                    </View>
                )}
                {renderDatePicker()}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList className="mt-1"
                    key={viewMode} // Force re-render when switching modes
                    data={mainListOffers}
                    renderItem={renderOfferItem}
                    keyExtractor={(item) => item._id.toString()}
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
                    removeClippedSubviews={Platform.OS === 'android'} // Android optimization
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
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

            {/* Banner Ad - Using Dummy for Expo Go Testing */}
            <View style={{ backgroundColor: colors.background, paddingBottom: Platform.OS === 'ios' ? 0 : 0 }}>
                <DummyBannerAd colors={colors} />
                {/* Asli Ad - Production ke liye ise use karein:
                <BannerAd
                    unitId={TestIds.BANNER}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                /> 
                */}
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
