import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Image, StatusBar, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, SlidersHorizontal, Bell, ChevronDown, Flame, Filter } from 'lucide-react-native';
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
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header / Location */}
            <View className="px-4 py-2 flex-row items-center justify-between">
                <TouchableOpacity
                    className="flex-row items-center flex-1"
                    onPress={() => setIsLocationModalVisible(true)}
                >
                    <MapPin size={20} color={colors.secondary} />
                    <View className="ml-2">
                        <View className="flex-row items-center">
                            <Text className="text-primary font-bold text-base" numberOfLines={1}>{location}</Text>
                            <ChevronDown size={16} color={colors.primary} className="ml-1" />
                        </View>
                        <Text className="text-textSecondary text-[10px]">Tap to change location</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border">
                    <Bell size={20} color={colors.primary} />
                    <View className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Search Bar */}
                <View className="px-4 py-3">
                    <View className="flex-row items-center">
                        <View className="flex-1 flex-row items-center bg-surface border border-border rounded-xl px-3 py-2.5">
                            <Search size={20} color={colors.textSecondary} />
                            <TextInput
                                className="flex-1 ml-2 text-primary font-medium"
                                placeholder="Search for stores, categories..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity className="ml-2 w-12 h-12 bg-primary rounded-xl items-center justify-center">
                            <SlidersHorizontal size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Categories */}
                <View className="py-2">
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={CATEGORIES}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedCategory(item.id)}
                                className={`mr-3 px-4 py-2.5 rounded-full flex-row items-center border ${selectedCategory === item.id
                                    ? 'bg-primary border-primary'
                                    : 'bg-white border-border'
                                    }`}
                            >
                                <Text className="mr-2 text-base">{item.icon}</Text>
                                <Text className={`font-bold ${selectedCategory === item.id ? 'text-white' : 'text-primary'
                                    }`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Trending Section */}
                {trendingOffers.length > 0 && searchQuery === '' && (
                    <View className="mt-4">
                        <View className="px-4 flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <Flame size={20} color={colors.error} fill={colors.error} />
                                <Text className="text-xl font-bold text-primary ml-2">Trending Deals</Text>
                            </View>
                            <TouchableOpacity>
                                <Text className="text-secondary font-bold">See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={trendingOffers}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
                            renderItem={({ item }) => (
                                <View style={{ width: width > 600 ? 350 : width * 0.75 }} className="mr-4">
                                    <OfferCard
                                        offer={item}
                                        onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                                    />
                                </View>
                            )}
                        />
                    </View>
                )}

                {/* Filter / Sort Pills */}
                <View className="px-4 mt-4 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-primary">All Offers Near You</Text>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => setRadius(radius === 10 ? 1 : radius === 5 ? 10 : 5)}
                            className="bg-surface px-3 py-1.5 rounded-lg border border-border flex-row items-center mr-2"
                        >
                            <Filter size={14} color={colors.primary} />
                            <Text className="text-primary text-xs font-bold ml-1">{radius}km</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-surface px-3 py-1.5 rounded-lg border border-border">
                            <Text className="text-primary text-xs font-bold">Sort By</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Offer List */}
                <View className={`px-4 py-4 ${isTablet ? 'flex-row flex-wrap justify-between' : ''}`}>
                    {filteredOffers.map(offer => (
                        <View key={offer.id} style={{ width: isTablet ? '48.5%' : '100%' }}>
                            <OfferCard
                                offer={offer}
                                onPress={() => navigation.navigate('OfferDetails', { offer })}
                            />
                        </View>
                    ))}
                    {filteredOffers.length === 0 && (
                        <View className="py-20 items-center w-full">
                            <Image
                                source={{ uri: 'https://illustrations.popsy.co/teal/searching.png' }}
                                className="w-48 h-48"
                                resizeMode="contain"
                            />
                            <Text className="text-textSecondary text-lg font-medium mt-4">No deals found here</Text>
                            <Text className="text-textSecondary text-center px-10 mt-2">
                                Try changing your category or searching for something else
                            </Text>
                        </View>
                    )}
                </View>

                {/* Spacer for bottom */}
                <View className="h-20" />
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
