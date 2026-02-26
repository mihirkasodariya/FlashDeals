import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme/colors';

const WishlistScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    // Semi-empty state for now
    const [favorites, setFavorites] = React.useState([]);

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            {/* Minimal Header */}
            <View className="px-6 pt-4 pb-6 bg-white shadow-sm flex-row items-center justify-between">
                <View>
                    <Text className="text-[10px] font-black text-secondary uppercase tracking-[3px] mb-1">Collection</Text>
                    <Text className="text-3xl font-black text-primary">Wishlist</Text>
                </View>
                <View className="w-12 h-12 bg-surface rounded-2xl items-center justify-center">
                    <Heart size={24} color={colors.primary} fill={colors.primary} />
                </View>
            </View>

            {favorites.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <View className="w-48 h-48 bg-white rounded-[60px] items-center justify-center mb-10 shadow-2xl border border-surface">
                        <Heart size={80} color={colors.border} strokeWidth={1} />
                        <View className="absolute bottom-10 right-10 w-6 h-6 bg-secondary rounded-full border-4 border-white" />
                    </View>

                    <Text className="text-2xl font-black text-primary mb-3 text-center">Empty Heart?</Text>
                    <Text className="text-textSecondary text-center mb-12 font-medium leading-6">
                        Don't let these flash deals slip away! Save your favorite offers here to track them easily.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Home')}
                        className="w-full"
                    >
                        <LinearGradient
                            colors={[colors.primary, '#1e293b']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5 rounded-[24px] items-center shadow-lg"
                        >
                            <Text className="text-white font-black text-sm uppercase tracking-widest">Start Discovering</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}

                    renderItem={({ item }) => (
                        <View className="mb-6">
                            <OfferCard
                                offer={item}
                                onPress={() => navigation.navigate('OfferDetails', { offer: item })}
                            />
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};


export default WishlistScreen;
