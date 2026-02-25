import { View, Text, FlatList, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingBag } from 'lucide-react-native';
import { colors } from '../theme/colors';

const WishlistScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    // Semi-empty state for now
    const favorites = [];

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="py-6 border-b border-border mb-6">
                <Text className="text-3xl font-bold text-primary">My Wishlist</Text>
                <Text className="text-textSecondary">Your saved flash deals</Text>
            </View>

            {favorites.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <View className="w-32 h-32 bg-surface rounded-full items-center justify-center mb-6">
                        <Heart size={64} color={colors.border} />
                    </View>
                    <Text className="text-xl font-bold text-primary mb-2">Your wishlist is empty</Text>
                    <Text className="text-textSecondary text-center mb-8">
                        Save deals you like to keep track of them and never miss a flash sale!
                    </Text>
                    <TouchableOpacity
                        className="bg-primary px-8 py-3 rounded-xl shadow-sm"
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text className="text-white font-bold">Start Exploring</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="mb-4">
                            {/* Simplified card for wishlist */}
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default WishlistScreen;
