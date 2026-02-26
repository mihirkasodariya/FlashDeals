import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Image, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, SlidersHorizontal, Bell, ChevronDown, Flame, Filter, LayoutGrid, List } from 'lucide-react-native';
import { colors } from '../theme/colors';
import OfferCard from '../components/OfferCard';
import LocationSelectorModal from '../components/LocationSelectorModal';

const CATEGORIES = [
    { id: '1', name: 'All', icon: '🛍️' },
    { id: '2', name: 'Food', icon: '🍔' },
    { id: '3', name: 'Grocery', icon: '🛒' },
    { id: '4', name: 'Fashion', icon: '👕' },
    { id: '5', name: 'Electronics', icon: '📱' },
    { id: '6', name: 'Health', icon: '💊' },
];

const DUMMY_OFFERS = [
    {
        id: '1',
        title: '50% Off on Pizza Royale',
        storeName: 'Pizza Hut - Downtown',
        storeLogo: 'https://cdn.iconscout.com/icon/free/png-256/free-pizza-hut-logo-icon-download-in-svg-png-gif-file-formats--brand-brands-pack-logos-icons-226343.png',
        discount: 50,
        distance: 1.2,
        stock: 5,
        expiryHours: 2,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
        isTrending: true,
    },
    {
        id: '2',
        title: 'Buy 1 Get 1 Free - Fresh Milk',
        storeName: 'Reliance Fresh',
        storeLogo: 'https://companieslogo.com/img/orig/RELIANCE.NS-96424ca1.png',
        discount: 30,
        distance: 0.8,
        stock: 12,
        expiryHours: 5,
        category: 'Grocery',
        image: 'https://images.unsplash.com/photo-1528498033053-35a71300267f?w=800&q=80',
        isTrending: true,
    },
    {
        id: '3',
        title: 'Flat 40% Off on Sneakers',
        storeName: 'Adidas Express',
        storeLogo: 'https://w7.pngwing.com/pngs/461/123/png-transparent-adidas-logo-adidas-original-logo-brand-adidas-text-indonesia-shoes.png',
        discount: 40,
        distance: 3.5,
        stock: 3,
        expiryHours: 8,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        isTrending: false,
    },
    {
        id: '4',
        title: 'Free Coke with Burger Combo',
        storeName: 'Burger King',
        storeLogo: 'https://companieslogo.com/img/orig/QSR-61d0263f.png',
        discount: 25,
        distance: 2.1,
        stock: 15,
        expiryHours: 1,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
        isTrending: true,
    }
];

const HomeScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const [selectedCategory, setSelectedCategory] = useState('1');
    const [location, setLocation] = useState('Ahmedabad, Gujarat');
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [radius, setRadius] = useState(5); // 1, 5, 10 km
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const filteredOffers = DUMMY_OFFERS.filter(offer => {
        const matchesCategory = selectedCategory === '1' || offer.category === CATEGORIES.find(c => c.id === selectedCategory)?.name;
        const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offer.storeName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const trendingOffers = DUMMY_OFFERS.filter(o => o.isTrending);
    const isTablet = width > 768;
    const numColumns = isTablet ? 2 : 1;

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Premium Sticky-ready Header */}
            <View className="bg-white px-4 pb-4 pt-2 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setIsLocationModalVisible(true)}
                    >
                        <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center">
                            <MapPin size={22} color={colors.secondary} strokeWidth={2.5} />
                        </View>
                        <View className="ml-3">
                            <Text className="text-[10px] uppercase font-black tracking-widest text-textSecondary">Your Location</Text>
                            <View className="flex-row items-center">
                                <Text className="text-primary font-black text-base" numberOfLines={1}>{location}</Text>
                                <ChevronDown size={14} color={colors.primary} className="ml-1" />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl border border-surface">
                        <Bell size={22} color={colors.primary} />
                        <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-error rounded-full border-2 border-white" />
                    </TouchableOpacity>
                </View>

                {/* Modern Search Section */}
                <View className="flex-row items-center">
                    <View className="flex-1 flex-row items-center bg-[#F3F4F6] rounded-2xl px-4 py-3 border border-transparent">
                        <Search size={22} color={colors.textSecondary} strokeWidth={2.5} />
                        <TextInput
                            className="flex-1 ml-3 text-primary font-bold text-sm"
                            placeholder="Discover deals, stores..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity className="ml-3 w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg">
                        <SlidersHorizontal size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Modern Categories */}
                <View className="py-6 bg-white">
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={CATEGORIES}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedCategory(item.id)}
                                activeOpacity={0.8}
                                className={`mr-4 px-6 py-3 rounded-2xl flex-row items-center ${selectedCategory === item.id
                                    ? 'bg-primary shadow-lg shadow-primary/40'
                                    : 'bg-[#F3F4F6]'
                                    }`}
                            >
                                <Text className="mr-2 text-lg">{item.icon}</Text>
                                <Text className={`font-black text-sm ${selectedCategory === item.id ? 'text-white' : 'text-primary'
                                    }`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Trending Section */}
                {trendingOffers.length > 0 && searchQuery === '' && (
                    <View className="mt-8">
                        <View className="px-6 flex-row items-end justify-between mb-6">
                            <View>
                                <View className="flex-row items-center mb-1">
                                    <View className="w-2 h-2 bg-error rounded-full mr-2" />
                                    <Text className="text-[10px] font-black text-error uppercase tracking-[3px]">On Fire Now</Text>
                                </View>
                                <Text className="text-3xl font-black text-primary tracking-tighter">Hot Deals</Text>
                            </View>
                            <TouchableOpacity className="bg-primary/5 px-5 py-2.5 rounded-2xl border border-primary/5">
                                <Text className="text-primary font-black text-xs uppercase tracking-tight">Browse All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={trendingOffers}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                            renderItem={({ item }) => (
                                <View style={{ width: width > 600 ? 350 : width * 0.85 }} className="mr-6">
                                    <OfferCard
                                        offer={item}
                                        onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                    />
                                </View>
                            )}
                        />
                    </View>
                )}

                {/* Main List Header */}
                <View className="px-6 mt-8 flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Flash Sales</Text>
                        <Text className="text-2xl font-black text-primary">Near Your Place</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setRadius(radius === 10 ? 1 : radius === 5 ? 10 : 5)}
                        className="bg-white px-4 py-2 rounded-xl shadow-md border border-surface flex-row items-center"
                    >
                        <Filter size={14} color={colors.primary} strokeWidth={3} />
                        <Text className="text-primary text-xs font-black ml-2 uppercase">{radius}km</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        className="bg-white ml-2 w-10 h-10 rounded-xl shadow-md border border-surface items-center justify-center"
                    >
                        {viewMode === 'list' ? (
                            <LayoutGrid size={18} color={colors.primary} strokeWidth={2.5} />
                        ) : (
                            <List size={18} color={colors.primary} strokeWidth={2.5} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Offer List with improved spacing */}
                <View className={`px-4 py-2 flex-row flex-wrap justify-between`}>
                    {filteredOffers.map(offer => (
                        <View
                            key={offer.id}
                            style={{
                                width: isTablet || viewMode === 'grid' ? '48.5%' : '100%'
                            }}
                            className="mb-2"
                        >
                            <OfferCard
                                offer={offer}
                                grid={isTablet || viewMode === 'grid'}
                                onPress={() => navigation.navigate('OfferDetails', { offer })}
                            />
                        </View>
                    ))}
                    {filteredOffers.length === 0 && (
                        <View className="py-24 items-center w-full">
                            <View className="w-40 h-40 bg-surface rounded-full items-center justify-center mb-6">
                                <Search size={64} color={colors.border} />
                            </View>
                            <Text className="text-primary text-2xl font-black text-center">No Treasures Found</Text>
                            <Text className="text-textSecondary text-center px-10 mt-2 font-medium">
                                We couldn't find any deals matching your current filters.
                            </Text>
                        </View>
                    )}
                </View>


                {/* Spacer for bottom */}
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
