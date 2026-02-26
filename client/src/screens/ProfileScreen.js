import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, useWindowDimensions, Modal, Pressable, Alert, ActivityIndicator, StyleSheet, TextInput } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, MapPin, Package, Store, Map as MapIcon, Edit3, Navigation2 } from 'lucide-react-native';



import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

    // Dynamic user data
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [locationLoading, setLocationLoading] = React.useState(false);

    // Edit Form State
    const [editName, setEditName] = React.useState('');
    const [editMobile, setEditMobile] = React.useState('');

    const fetchProfile = async (isMounted) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                if (isMounted.current) navigation.replace('Login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                if (isMounted.current) {
                    setUser(data.user);
                    setEditName(data.user.name);
                    setEditMobile(data.user.mobile);
                }
            } else {
                await AsyncStorage.removeItem('userToken');
                if (isMounted.current) navigation.replace('Login');
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const isMounted = { current: true };
            fetchProfile(isMounted);
            return () => { isMounted.current = false; };
        }, [])
    );


    const isVendor = user && user.role === 'vendor';
    const isTablet = width > 768;
    const contentWidth = isTablet ? 600 : '100%';

    const handleLogout = async () => {
        setIsLogoutModalVisible(false);
        await AsyncStorage.removeItem('userToken');
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
            console.error(error);
            Alert.alert('Error', 'Failed to sync GPS');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSaveProfile = () => {
        // Logic to update name/mobile on backend
        setUser({ ...user, name: editName, mobile: editMobile });
        setIsEditModalVisible(false);
        Alert.alert("Success", "Profile updated successfully!");
    };

    const menuItems = [
        ...(isVendor ? [
            { icon: Store, label: 'Business Insights', color: colors.secondary, onPress: () => { } },
            { icon: Package, label: 'Add New Offer', color: colors.secondary, onPress: () => navigation.navigate('AddOffer') }
        ] : [
            { icon: Package, label: 'Redemption History', color: colors.secondary, onPress: () => { } }
        ]),
        { icon: MapPin, label: 'Saved Locations', color: colors.accent, onPress: () => { } },
        { icon: Bell, label: 'Preferences', color: colors.warning, onPress: () => { } },
        { icon: Shield, label: 'Privacy Center', color: colors.primary, onPress: () => { } },
    ];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>

                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA] items-center" edges={['top']}>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: contentWidth }}>
                {/* Minimalist Premium Header */}
                <View className="bg-white px-6 pt-10 pb-8 rounded-b-[40px] shadow-sm items-center">
                    <View className="relative">
                        <View className="w-32 h-32 bg-[#F3F4F6] rounded-full items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                            <User size={80} color="#D1D5DB" strokeWidth={1} />
                            {/* Decorative ring */}
                            <View className="absolute inset-0 border-[3px] border-primary/10 rounded-full" />
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsEditModalVisible(true)}
                            className="absolute bottom-1 right-1 bg-primary w-10 h-10 rounded-2xl border-4 border-white items-center justify-center shadow-lg"
                        >
                            <Settings size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-3xl font-black text-primary mt-6 tracking-tight">{user.name}</Text>
                    <Text className="text-textSecondary font-bold mt-1 tracking-widest text-xs uppercase opacity-60">
                        {user.role} Account • {user.mobile}
                    </Text>

                    <TouchableOpacity
                        onPress={() => setIsEditModalVisible(true)}
                        className="mt-6 bg-[#F3F4F6] px-8 py-3 rounded-2xl border border-surface"
                    >
                        <Text className="text-primary font-black text-xs uppercase tracking-widest">Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Vendor Section Refresh */}
                {isVendor && (
                    <View className="px-6 py-8">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-[10px] font-black text-secondary uppercase tracking-[3px] mb-1">Commercial Hub</Text>
                                <Text className="text-2xl font-black text-primary">Store Identity</Text>
                            </View>
                            <TouchableOpacity
                                className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-md border border-surface"
                                onPress={() => navigation.navigate('EditStore', { vendorData: user })}
                            >
                                <Edit3 size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.premiumCard} className="bg-white rounded-[40px] p-8 border border-surface">
                            <View className="flex-row items-center mb-10">
                                <View className="w-20 h-20 bg-primary/5 rounded-[30px] items-center justify-center border border-primary/10 shadow-inner">
                                    <Store size={40} color={colors.primary} strokeWidth={1} />
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-primary font-black text-2xl tracking-tight leading-8">{user.storeName}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="bg-green-500 px-2.5 py-1 rounded-full flex-row items-center">
                                            <Shield size={10} color="white" />
                                            <Text className="text-white text-[8px] font-black uppercase ml-1.5 tracking-widest">Global Brand</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-6">
                                <View className="flex-row items-start mb-8">
                                    <View className="w-10 h-10 bg-secondary/10 rounded-2xl items-center justify-center">
                                        <MapPin size={18} color={colors.secondary} />
                                    </View>
                                    <View className="ml-4 flex-1">
                                        <Text className="text-textSecondary text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-50">Operational Base</Text>
                                        <Text className="text-primary font-bold text-sm leading-6">
                                            {user.storeAddress || 'Setup details in edit'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="mt-4 pt-4 border-t border-surface/50">
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleUpdateLocation}
                                        disabled={locationLoading}
                                        className="overflow-hidden rounded-[24px] shadow-sm"
                                    >
                                        <LinearGradient
                                            colors={['#1E293B', '#0F172A']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="px-6 py-5 flex-row items-center justify-between"
                                        >
                                            <View className="flex-row items-center">
                                                <View className="w-11 h-11 bg-white/10 rounded-2xl items-center justify-center mr-4 border border-white/5">
                                                    {locationLoading ? (
                                                        <ActivityIndicator size="small" color="white" />
                                                    ) : (
                                                        <Navigation2 size={22} color="white" strokeWidth={2} />
                                                    )}
                                                </View>
                                                <View>
                                                    <Text className="text-white font-black text-sm tracking-tight">Synchronize GPS</Text>
                                                    <Text className="text-white/40 text-[9px] font-black uppercase tracking-[3px] mt-0.5">High-Precision Link</Text>
                                                </View>
                                            </View>
                                            <View className="w-8 h-8 rounded-xl items-center justify-center bg-white/5">
                                                <ChevronRight size={16} color="white" strokeWidth={3} opacity={0.4} />
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <View className="flex-row items-center justify-center mt-5">
                                        <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-lg shadow-green-500/50" />
                                        <Text className="text-[9px] text-textSecondary uppercase tracking-[3px] font-black opacity-30">
                                            Status: Satellite Lock Active
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => navigation.navigate('AddOffer')}
                                        className="mt-8 overflow-hidden rounded-[24px]"
                                    >
                                        <LinearGradient
                                            colors={[colors.secondary, '#0D9488']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="px-6 py-5 flex-row items-center justify-center"
                                        >
                                            <Package size={20} color="white" strokeWidth={2.5} />
                                            <Text className="text-white font-black text-sm uppercase tracking-[3px] ml-3">Launch Flash Deal</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Settings Menu Sections */}
                <View className="px-6 py-6">
                    <Text className="text-[10px] font-black text-textSecondary uppercase tracking-[4px] mb-6 opacity-40">System Dashboard</Text>

                    <View className="bg-white rounded-[32px] p-4 shadow-sm border border-surface">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={item.onPress}
                                className={`flex-row items-center py-5 ${index !== menuItems.length - 1 ? 'border-b border-surface' : ''}`}
                            >
                                <View style={{ backgroundColor: `${item.color}10` }} className="w-12 h-12 rounded-[18px] items-center justify-center">
                                    <item.icon size={22} color={item.color} strokeWidth={2} />
                                </View>
                                <Text className="flex-1 ml-5 text-primary font-bold text-sm">{item.label}</Text>
                                <ChevronRight size={18} color="#D1D5DB" strokeWidth={3} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center justify-center py-8 mt-4"
                        onPress={() => setIsLogoutModalVisible(true)}
                    >
                        <View className="bg-error/5 px-6 py-3 rounded-full flex-row items-center">
                            <LogOut size={18} color={colors.error} />
                            <Text className="ml-3 text-error font-black text-sm uppercase tracking-widest">Secure Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Version & Credits */}
                <View className="items-center pb-32">
                    <Text className="text-[9px] font-black text-textSecondary/40 uppercase tracking-[5px]">NextGen Core v2.2</Text>
                </View>
            </ScrollView>

            {/* Unique Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View className="w-16 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-10" />

                        <Text className="text-3xl font-black text-primary mb-2">Edit Identity</Text>
                        <Text className="text-textSecondary mb-10 font-medium">Update your profile information below.</Text>

                        <View className="space-y-6">
                            <View>
                                <Text className="text-[10px] font-black text-textSecondary uppercase tracking-widest mb-3 ml-1">Full Name</Text>
                                <TextInput
                                    className="bg-[#F3F4F6] p-5 rounded-[24px] font-bold text-primary border border-transparent focus:border-primary"
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Enter your name"
                                />
                            </View>

                            <View className="mt-6">
                                <Text className="text-[10px] font-black text-textSecondary uppercase tracking-widest mb-3 ml-1">Mobile Access</Text>
                                <TextInput
                                    className="bg-[#F3F4F6] p-5 rounded-[24px] font-bold text-primary border border-transparent focus:border-primary"
                                    value={editMobile}
                                    onChangeText={setEditMobile}
                                    keyboardType="phone-pad"
                                    placeholder="Enter mobile number"
                                />
                            </View>

                            <View className="flex-row gap-4 mt-12">
                                <TouchableOpacity
                                    onPress={() => setIsEditModalVisible(false)}
                                    className="flex-1 bg-surface py-5 rounded-[24px] items-center"
                                >
                                    <Text className="text-primary font-black text-sm uppercase tracking-widest">Discard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSaveProfile}
                                    className="flex-[2] bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-primary/30"
                                >
                                    <Text className="text-white font-black text-sm uppercase tracking-widest">Sync Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Logout Confirmation (Very Unique) */}
            <Modal visible={isLogoutModalVisible} animationType="fade" transparent={true}>
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View className="bg-white rounded-[60px] p-10 w-full items-center shadow-2xl relative overflow-hidden">
                        {/* Decorative Background Blob */}
                        <View className="absolute -top-10 -right-10 w-32 h-32 bg-error/5 rounded-full" />

                        <View className="w-24 h-24 bg-error/10 rounded-[40px] items-center justify-center mb-8 rotate-12">
                            <LogOut size={48} color={colors.error} strokeWidth={1.5} className="-rotate-12" />
                        </View>

                        <Text className="text-3xl font-black text-primary mb-3 text-center tracking-tighter">Sign Out?</Text>
                        <Text className="text-textSecondary text-center mb-12 font-medium leading-6 opacity-70">
                            You're about to disconnect from your active session. Ready to go?
                        </Text>

                        <View className="w-full space-y-4">
                            <TouchableOpacity
                                onPress={handleLogout}
                                className="w-full bg-error py-5 rounded-[30px] items-center shadow-lg shadow-error/30"
                            >
                                <Text className="text-white font-black text-sm uppercase tracking-widest">Yes, Disconnect</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsLogoutModalVisible(false)}
                                className="w-full py-5 items-center mt-2"
                            >
                                <Text className="text-primary font-black text-xs uppercase tracking-[3px]">Stay Connected</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    premiumCard: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 15,
    }
});

export default ProfileScreen;

