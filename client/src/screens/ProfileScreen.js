import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, useWindowDimensions, Modal, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, MapPin, Package, Store, Map as MapIcon, Edit3, Navigation } from 'lucide-react-native';


import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const ProfileScreen = () => {

    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);

    // Dynamic user data
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [locationLoading, setLocationLoading] = React.useState(false);

    const fetchProfile = async () => {

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setUser({
                    ...data.user,
                    stats: data.user.stats || {
                        activeDeals: 0,
                        savedMoney: '0',
                        totalImpressions: '0'
                    }
                });
            } else {
                // If token invalid, logout
                await AsyncStorage.removeItem('userToken');
                navigation.replace('Login');
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile();
        }, [])
    );

    const isVendor = user && user.role === 'vendor';

    const isTablet = width > 768;
    const contentWidth = isTablet ? 600 : '100%';

    const handleLogout = async () => {
        setIsLogoutModalVisible(false);
        await AsyncStorage.removeItem('userToken');
        // Reset navigation to Login screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleUpdateLocation = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please allow location access to update your store position.');
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
                Alert.alert('Success', 'Store location updated successfully to your current position!');
            } else {
                Alert.alert('Error', data.message || 'Failed to update location');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to get current location');
        } finally {
            setLocationLoading(false);
        }
    };



    const menuItems = [
        ...(isVendor ? [
            { icon: Store, label: 'Store Analytics', color: colors.secondary },
            { icon: Package, label: 'Manage Offers', color: colors.secondary },
            { icon: MapPin, label: 'Business Location', color: colors.accent }
        ] : [
            { icon: Package, label: 'My Redemptions', color: colors.secondary },
            { icon: MapPin, label: 'Saved Addresses', color: colors.accent }
        ]),
        { icon: Bell, label: 'Notifications', color: colors.warning },
        { icon: Shield, label: 'Privacy Policy', color: colors.primary },
        { icon: HelpCircle, label: 'Help & Support', color: '#6366F1' },
    ];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-primary font-bold">Loading Profile...</Text>
            </SafeAreaView>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-white items-center">

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: contentWidth }}>
                {/* Header Profile Info */}
                <View className="px-6 py-8 items-center border-b border-surface">
                    <View className="relative">
                        <View className="w-28 h-28 bg-surface rounded-full items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            <User size={60} color={colors.textSecondary} />
                        </View>
                        <TouchableOpacity className="absolute bottom-1 right-1 bg-primary w-8 h-8 rounded-full border-2 border-white items-center justify-center">
                            <Settings size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-bold text-primary mt-4">{user.name}</Text>
                    <Text className="text-textSecondary">{user.mobile}</Text>

                    <View className="flex-row mt-6 gap-3 w-full">
                        <View className="flex-1 bg-surface rounded-2xl p-4 items-center border border-border">
                            <Text className="text-primary font-bold text-xl">{user.stats.activeDeals}</Text>
                            <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-tight">{isVendor ? 'Live Deals' : 'Active Deals'}</Text>
                        </View>
                        <View className="flex-1 bg-surface rounded-2xl p-4 items-center border border-border">
                            <Text className="text-secondary font-bold text-xl">{isVendor ? user.stats.totalImpressions : `₹${user.stats.savedMoney}`}</Text>
                            <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-tight">{isVendor ? 'Views' : 'Saved Money'}</Text>
                        </View>
                    </View>
                </View>

                {/* Vendor Store Details Section - Ultra Modern Refresh */}
                {isVendor && (
                    <View className="px-6 py-4">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-[10px] font-black text-secondary uppercase tracking-[3px] mb-1">Business Portal</Text>
                                <Text className="text-2xl font-black text-primary">Store Terminal</Text>
                            </View>
                            <TouchableOpacity
                                className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-xl border border-surface"
                                onPress={() => navigation.navigate('EditStore', { vendorData: user })}
                            >
                                <Edit3 size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View
                            style={styles.premiumCard}
                            className="bg-white rounded-[40px] p-1 border border-surface"
                        >
                            {/* Inner Content with slight padding */}
                            <View className="p-6">
                                {/* Store Brand Identity */}
                                <View className="flex-row items-center justify-between mb-8">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-16 h-16 bg-primary/5 rounded-[24px] items-center justify-center border border-primary/10">
                                            <Store size={32} color={colors.primary} strokeWidth={1.5} />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className="text-primary font-black text-2xl tracking-tight leading-7" numberOfLines={1}>
                                                {user.storeName}
                                            </Text>
                                            <View className="flex-row items-center mt-1.5">
                                                <View className="bg-green-500/10 px-2 py-0.5 rounded-full flex-row items-center border border-green-500/20">
                                                    <Shield size={10} color="#10B981" />
                                                    <Text className="text-[#10B981] text-[9px] font-black uppercase ml-1 tracking-wider">Verified Identity</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Stats Bar */}
                                <View className="flex-row justify-between mb-8 bg-surface/50 rounded-3xl p-5 border border-surface">
                                    <View className="items-center flex-1 border-r border-border/50">
                                        <Text className="text-primary font-black text-lg">{user.stats?.activeDeals || 0}</Text>
                                        <Text className="text-textSecondary text-[9px] font-bold uppercase tracking-widest mt-1">Live Deals</Text>
                                    </View>
                                    <View className="items-center flex-1 border-r border-border/50">
                                        <Text className="text-primary font-black text-lg">{user.stats?.totalImpressions || '2.4k'}</Text>
                                        <Text className="text-textSecondary text-[9px] font-bold uppercase tracking-widest mt-1">Footfall</Text>
                                    </View>
                                    <View className="items-center flex-1">
                                        <Text className="text-primary font-black text-lg">4.8</Text>
                                        <Text className="text-textSecondary text-[9px] font-bold uppercase tracking-widest mt-1">Rating</Text>
                                    </View>
                                </View>

                                {/* Location Details */}
                                <View className="space-y-4">
                                    <View className="flex-row items-start mb-6">
                                        <View className="w-10 h-10 bg-secondary/5 rounded-2xl items-center justify-center">
                                            <MapPin size={18} color={colors.secondary} />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className="text-textSecondary text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">Operations Base</Text>
                                            <Text className="text-primary font-bold text-sm leading-6">
                                                {user.storeAddress || 'Not provided'}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={handleUpdateLocation}
                                        disabled={locationLoading}
                                        className="relative"
                                    >
                                        <LinearGradient
                                            colors={[colors.secondary, '#F97316']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="py-4 rounded-[24px] flex-row items-center justify-center shadow-lg"
                                        >
                                            {locationLoading ? (
                                                <ActivityIndicator size="small" color="white" />
                                            ) : (
                                                <>
                                                    <Navigation size={18} color="white" strokeWidth={2.5} />
                                                    <Text className="ml-3 font-black text-white text-sm uppercase tracking-wide">Sync GPS Location</Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}



                {/* Settings Menu */}
                <View className="px-6 py-6">
                    <Text className="text-sm font-bold text-textSecondary uppercase tracking-widest mb-4">Account Settings</Text>

                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="flex-row items-center py-4 border-b border-surface"
                        >
                            <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center">
                                <item.icon size={22} color={item.color} />
                            </View>
                            <Text className="flex-1 ml-4 text-primary font-bold">{item.label}</Text>
                            <ChevronRight size={20} color={colors.border} />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        className="flex-row items-center py-6 mt-4"
                        onPress={() => setIsLogoutModalVisible(true)}
                    >
                        <View className="w-10 h-10 bg-error/10 rounded-xl items-center justify-center">
                            <LogOut size={22} color={colors.error} />
                        </View>
                        <Text className="flex-1 ml-4 text-error font-bold text-lg">Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Version Info */}
                <View className="items-center pb-12">
                    <Text className="text-textSecondary text-xs">FlashDeals v2.0.4 - Premium</Text>
                </View>
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isLogoutModalVisible}
                onRequestClose={() => setIsLogoutModalVisible(false)}
            >
                <Pressable
                    className="flex-1 justify-center items-center bg-black/60 px-6"
                    onPress={() => setIsLogoutModalVisible(false)}
                >
                    <Pressable className="bg-white rounded-3xl p-8 w-full max-w-[340px] items-center shadow-2xl">
                        <View className="w-20 h-20 bg-error/10 rounded-full items-center justify-center mb-6">
                            <LogOut size={40} color={colors.error} />
                        </View>

                        <Text className="text-2xl font-bold text-primary mb-2 text-center">Logout</Text>
                        <Text className="text-textSecondary text-center mb-8 leading-5">
                            Are you sure you want to log out from your account?
                        </Text>

                        <View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: '#F8F9FA',
                                    paddingVertical: 16,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    marginRight: 6,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB'
                                }}
                                onPress={() => setIsLogoutModalVisible(false)}
                            >
                                <Text style={{ fontWeight: 'bold', color: '#002F34' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.error,
                                    paddingVertical: 16,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    marginLeft: 6
                                }}
                                onPress={handleLogout}
                            >
                                <Text style={{ fontWeight: 'bold', color: 'white' }}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default ProfileScreen;
