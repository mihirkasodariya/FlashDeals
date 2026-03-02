import React, { useState, useEffect } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, TextInput, FlatList, Image, useWindowDimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, Bell, ChevronDown, Flame, Filter, LayoutGrid, List } from 'lucide-react-native';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import OfferCard from '../components/OfferCard';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
    { id: '1', name: 'All', icon: '🛍️' },
    { id: '2', name: 'Food', icon: '🍔' },
    { id: '3', name: 'Grocery', icon: '🛒' },
    { id: '4', name: 'Fashion', icon: '👕' },
    { id: '5', name: 'Electronics', icon: '📱' },
    { id: '6', name: 'Health', icon: '💊' },
];

const HomeScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors, isDarkMode } = useTheme();
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

    const fetchData = async () => {
        try {
            console.log("Fetching Home Data...");
            const token = await AsyncStorage.getItem('userToken');

            const [offersRes, wishlistRes] = await Promise.all([
                fetch(`${API_BASE_URL}/offers`),
                token ? fetch(`${API_BASE_URL}/wishlist/status`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve(null)
            ]);

            const offersData = await offersRes.json();
            if (offersData.success) {
                setOffers(offersData.offers || []);
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
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Refetch when screen comes into focus
        if (navigation && navigation.addListener) {
            const unsubscribe = navigation.addListener('focus', () => {
                fetchData();
            });
            return unsubscribe;
        }
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const now = new Date();
    const allOffers = (offers || []).filter(offer => {
        if (!offer) return false;
        const matchesCategory = selectedCategory === '1' ||
            (offer.category && offer.category.toLowerCase() === CATEGORIES.find(c => c.id === selectedCategory)?.name.toLowerCase());
        const matchesSearch = (offer.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (offer.vendorId?.storeName || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Currently Live Offers
    const activeOffers = allOffers.filter(offer => {
        const start = new Date(offer.startDate);
        const end = new Date(offer.endDate);
        return now >= start && now <= end;
    });

    // Top 4 Hot Offers based on visits (must be active)
    const hotOffers = [...activeOffers]
        .sort((a, b) => (b.visits || 0) - (a.visits || 0))
        .slice(0, 4);

    // Upcoming Offers (not yet started)
    const upcomingOffers = allOffers.filter(offer => {
        const start = new Date(offer.startDate);
        return start > now;
    });
    const isTablet = width > 768;

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
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest mr-1 opacity-60">Your Location</Text>
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
                <View className="flex-row items-center mb-4">
                    <View style={{ backgroundColor: colors.surface }} className="flex-1 h-14 rounded-2xl flex-row items-center px-5 border border-surface">
                        <Search size={20} color={colors.textSecondary} strokeWidth={2.5} />
                        <TextInput
                            style={{ color: colors.text }}
                            placeholder="Search magic offers..."
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
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

                {loading ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <>
                        {/* Hot Offers Section */}
                        {hotOffers.length > 0 && searchQuery === '' && (
                            <View className="mt-8">
                                <View className="px-6 flex-row items-end justify-between mb-6">
                                    <View>
                                        <View className="flex-row items-center mb-1">
                                            <View className="w-2 h-2 bg-error rounded-full mr-2" />
                                            <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px]">Most Visited</Text>
                                        </View>
                                        <Text style={{ color: colors.text }} className="text-3xl font-black tracking-tighter">Hot Offers</Text>
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
                        {upcomingOffers.length > 0 && searchQuery === '' && (
                            <View className="mt-8">
                                <View className="px-6 flex-row items-end justify-between mb-6">
                                    <View>
                                        <View className="flex-row items-center mb-1">
                                            <View className="w-2.5 h-2.5 bg-warning rounded-full mr-2" />
                                            <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px]">Coming Soon</Text>
                                        </View>
                                        <Text style={{ color: colors.text }} className="text-3xl font-black tracking-tighter">Upcoming Offers</Text>
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

                        {/* Main List */}
                        <View className="px-6 mt-8 flex-row items-center justify-between mb-4">
                            <View>
                                <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[2px] mb-1">Flash Sales</Text>
                                <Text style={{ color: colors.text }} className="text-2xl font-black">Near Your Place</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setRadius(radius === 10 ? 1 : radius === 5 ? 10 : 5)}
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                className="px-4 py-2 rounded-xl shadow-md border flex-row items-center"
                            >
                                <Filter size={14} color={colors.primary} strokeWidth={3} />
                                <Text style={{ color: colors.primary }} className="text-xs font-black ml-2">{radius}km</Text>
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

                        <View className={`px-4 py-2 flex-row flex-wrap justify-between`}>
                            {activeOffers.map((offer, index) => (
                                <View
                                    key={offer?._id || `offer-${index}`}
                                    style={{
                                        width: (width > 768) || viewMode === 'grid' ? '48.5%' : '100%'
                                    }}
                                    className="mb-2"
                                >
                                    <OfferCard
                                        offer={offer}
                                        grid={(width > 768) || viewMode === 'grid'}
                                        isFavorite={wishlistIds.includes(offer?._id)}
                                        onRefresh={fetchData}
                                        onPress={() => navigation.navigate('OfferDetails', { offer })}
                                    />
                                </View>
                            ))}
                            {activeOffers.length === 0 && (
                                <View className="py-24 items-center w-full">
                                    <View style={{ backgroundColor: colors.surface }} className="w-40 h-40 rounded-full items-center justify-center mb-6">
                                        <Search size={64} color={colors.border} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-2xl font-black text-center">No Treasures Found</Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-center px-10 mt-2 font-medium opacity-60">
                                        We couldn't find any offers matching your current filters.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <View className="h-32" />
            </ScrollView>

            <LocationSelectorModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
                onSelectLocation={(loc) => setLocation(loc)}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;
