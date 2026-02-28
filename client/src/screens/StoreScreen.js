import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform, useWindowDimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, MapPin, Shield, Navigation2, ChevronRight, Package as LucidePackage, Edit3, LayoutGrid, Edit2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const StoreScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [locationLoading, setLocationLoading] = React.useState(false);

    // Static URL for images
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const fetchProfile = async (isMounted) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    if (isMounted.current) setUser(data.user);
                }
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    React.useEffect(() => {
        const isMounted = { current: true };
        fetchProfile(isMounted);

        if (navigation && navigation.addListener) {
            const unsubscribe = navigation.addListener('focus', () => {
                const innerMounted = { current: true };
                fetchProfile(innerMounted);
            });
            return () => {
                isMounted.current = false;
                unsubscribe();
            };
        }
    }, [navigation]);

    const handleUpdateLocation = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please allow location access.');
                setLocationLoading(false);
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/vendor/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    location: {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'GPS precise location updated!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to sync GPS');
        } finally {
            setLocationLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!user || user.role !== 'vendor') return null;

    const defaultLogo = require('../../assets/logos/storeLogo.png');

    // Resolve Logo Image
    const logoSource = user.storeImage
        ? { uri: `${STATIC_BASE_URL}${user.storeImage}` }
        : defaultLogo;

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Visual Header */}
                <View className="px-6 pt-8 pb-4">
                    <Text className="text-[10px] font-black text-secondary tracking-[4px] mb-1">Commercial Hub</Text>
                    <Text className="text-3xl font-black text-primary tracking-tighter">Store Command</Text>
                </View>
                {/* Integrated Store Card */}
                <View className="px-6 py-2">
                    <View
                        style={styles.mainCard}
                        className="bg-white rounded-[48px] overflow-hidden border border-surface shadow-xl"
                    >
                        {/* Top Gradient Banner */}
                        <LinearGradient
                            colors={[colors.primary, '#004D40']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={Platform.OS === 'ios' ? { paddingTop: 50, paddingBottom: 100, paddingHorizontal: 40 } : {}}
                            className={`px-8 ${Platform.OS === 'ios' ? '' : 'pt-10 pb-16'} relative`}
                        >
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditStore', { vendorData: user })}
                                activeOpacity={0.7}
                                className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 z-10"
                            >
                                <Edit2 size={20} color="white" />
                            </TouchableOpacity>

                            <View className="flex-row items-center">
                                <View className="w-16 h-16 bg-white rounded-[24px] items-center justify-center shadow-lg overflow-hidden">
                                    <Image source={logoSource} className="w-full h-full" resizeMode="cover" />
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-white font-black text-2xl tracking-tight" numberOfLines={1}>
                                        {user.storeName}
                                    </Text>
                                    <View className="bg-success self-start px-2 py-0.5 rounded-full mt-1.5 flex-row items-center">
                                        <Shield size={10} color="white" />
                                        <Text className="text-white text-[8px] font-black ml-1 tracking-widest">Verified Store</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Bottom Info Section - Overlap fix for iOS */}
                        <View
                            style={Platform.OS === 'ios' ? { marginTop: -50 } : {}}
                            className={`px-8 pt-12 pb-8 bg-white ${Platform.OS === 'ios' ? '' : '-mt-10'} rounded-t-[48px]`}
                        >
                            <View className="flex-row items-start mb-8">
                                <View className="w-10 h-10 bg-secondary/10 rounded-2xl items-center justify-center mt-0.5">
                                    <MapPin size={18} color={colors.secondary} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-textSecondary text-[9px] font-black tracking-widest mb-1.5 opacity-50">Operational Base</Text>
                                    <Text className="text-primary font-bold text-sm leading-6">
                                        {user.storeAddress || 'Setup Details In Edit'}
                                    </Text>
                                </View>
                            </View>

                            {/* GPS Integrated Sync Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleUpdateLocation}
                                disabled={locationLoading}
                                style={styles.syncButton}
                                className="bg-[#1E293B] rounded-[28px] overflow-hidden shadow-lg shadow-black/20"
                            >
                                <View className="px-6 py-4 flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        {locationLoading ? (
                                            <ActivityIndicator size="small" color="white" className="mr-4" />
                                        ) : (
                                            <Navigation2 size={20} color="white" className="mr-4" fill="white" />
                                        )}
                                        <View>
                                            <Text className="text-white font-black text-sm tracking-tight">Sync Satellite GPS</Text>
                                            <Text className="text-white/40 text-[8px] font-black tracking-[2px] mt-0.5">High-Precision Link</Text>
                                        </View>
                                    </View>
                                    <View className="w-1.5 h-1.5 rounded-full bg-success shadow-lg shadow-success/50" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Manage Section */}
                <View className="px-6 py-6">
                    <Text className="text-[10px] font-black text-textSecondary tracking-[4px] mb-6 opacity-40">Business Tools</Text>

                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('VendorOffers')}
                            activeOpacity={0.8}
                            className="w-[48%] bg-white rounded-[32px] p-6 items-center border border-surface shadow-sm"
                        >
                            <View className="w-14 h-14 bg-secondary/10 rounded-2xl items-center justify-center mb-4">
                                <LayoutGrid size={28} color={colors.secondary} strokeWidth={2} />
                            </View>
                            <Text className="text-primary font-black text-center text-sm leading-5">Active{"\n"}Deals</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddOffer')}
                            activeOpacity={0.8}
                            className="w-[48%] bg-white rounded-[32px] p-6 items-center border border-surface shadow-sm"
                        >
                            <View className="w-14 h-14 bg-primary/5 rounded-2xl items-center justify-center mb-4">
                                <LucidePackage size={28} color={colors.primary} strokeWidth={2} />
                            </View>
                            <Text className="text-primary font-black text-center text-sm leading-5">Launch{"\n"}Flash Deal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    mainCard: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 15,
    },
    syncButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    }
});

export default StoreScreen;
