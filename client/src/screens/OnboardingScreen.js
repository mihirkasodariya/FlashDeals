import React, { useState, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    Animated,
    StatusBar,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Zap, MapPin, Store, Bell, CheckCircle2 } from 'lucide-react-native';
import Text from '../components/CustomText';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Instant Flash\nDeals Nearby',
        description: 'Discover massive savings from local stores happening right now in your neighborhood.',
        icon: Zap,
        color: '#FACC15', // Yellow/Gold
        bg: '#FFFBEB'
    },
    {
        id: '2',
        title: 'Real-Time Store\nTracking',
        description: 'Never miss an offer again. Get directions and real-time alerts for live deals near you.',
        icon: MapPin,
        color: '#00A49F', // Secondary Teal
        bg: '#F0FDFA'
    },
    {
        id: '3',
        title: 'Support Local\nBusinesses',
        description: 'Join thousands of shoppers saving money while boosting local storefront growth.',
        icon: Store,
        color: '#002F34', // Primary Dark
        bg: '#F0F4F4'
    }
];

const OnboardingScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = async () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            try {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                navigation.replace('Main');
            } catch (err) {
                console.log('Error @setItem: ', err);
            }
        }
    };

    const skip = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            navigation.replace('Main');
        } catch (err) {
            console.log('Error @setItem skip: ', err);
        }
    };

    const renderItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <View style={{ width }} className="items-center justify-center px-10">
                <View
                    style={{ backgroundColor: isDarkMode ? colors.card : item.bg }}
                    className="w-full h-[55%] rounded-[60px] items-center justify-center mb-10 overflow-hidden relative"
                >
                    {/* Decorative Blobs */}
                    <View
                        style={{ backgroundColor: item.color, opacity: 0.1 }}
                        className="absolute -top-10 -right-10 w-64 h-64 rounded-full"
                    />
                    <View
                        style={{ backgroundColor: item.color, opacity: 0.05 }}
                        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
                    />

                    <View style={{ backgroundColor: 'white', elevation: 20, shadowColor: item.color, shadowOpacity: 0.2, shadowRadius: 30 }} className="w-32 h-32 rounded-[40px] items-center justify-center">
                        <Icon size={64} color={item.color} strokeWidth={2.5} />
                    </View>
                </View>

                <View className="items-center">
                    <Text style={{ color: colors.text }} className="text-4xl font-black text-center leading-tight mb-4">
                        {item.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-base text-center font-bold px-4 leading-relaxed opacity-70">
                        {item.description}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* Skip Button */}
            <View className="px-6 py-4 items-end">
                <TouchableOpacity onPress={skip} className="px-4 py-2">
                    <Text style={{ color: colors.textSecondary }} className="font-black text-xs tracking-widest uppercase opacity-50">Skip</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-[3]">
                <FlatList
                    data={SLIDES}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            {/* Bottom Controls */}
            <View className="px-10 pb-12 flex-row items-center justify-between">
                {/* Pagination Dots */}
                <View className="flex-row">
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 24, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i}
                                style={{
                                    width: dotWidth,
                                    opacity,
                                    backgroundColor: colors.primary
                                }}
                                className="h-2.5 rounded-full mr-2"
                            />
                        );
                    })}
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    onPress={scrollTo}
                    style={{ backgroundColor: colors.primary }}
                    className="w-20 h-20 rounded-[30px] items-center justify-center shadow-2xl shadow-primary/40"
                >
                    <ChevronRight size={32} color="white" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OnboardingScreen;
