import React from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, Image, useWindowDimensions, Modal, Pressable, Alert, ActivityIndicator, StyleSheet, TextInput, Platform, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, MapPin, Package as LucidePackage, Store, Map as MapIcon, Edit3, Navigation2, Camera, Lock, History, Headphones, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const ProfileScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors, isDarkMode } = useTheme();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
    const [isRoleSwitchModalVisible, setIsRoleSwitchModalVisible] = React.useState(false);
    const [roleSwitchMode, setRoleSwitchMode] = React.useState(null);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');

    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [locationLoading, setLocationLoading] = React.useState(false);

    const [editName, setEditName] = React.useState('');
    const [editMobile, setEditMobile] = React.useState('');
    const [editImage, setEditImage] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [switching, setSwitching] = React.useState(false);

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
            if (response.ok && data.success) {
                if (isMounted.current) {
                    setUser(data.user);
                    setEditName(data.user.name);
                    setEditMobile(data.user.mobile);
                }
            } else if (response.status === 401 || response.status === 403) {
                await AsyncStorage.removeItem('userToken');
                if (isMounted.current) navigation.replace('Login');
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

        const unsubscribe = navigation.addListener('focus', () => {
            const innerMounted = { current: true };
            fetchProfile(innerMounted);
        });

        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, [navigation]);

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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission", "Permission to access library is required");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setEditImage(result.assets[0].uri);
        }
    };

    const handleSwitchToVendor = () => {
        setRoleSwitchMode('vendor');
        setIsRoleSwitchModalVisible(true);
    };

    const handleSwitchToUser = () => {
        setRoleSwitchMode('user');
        setIsRoleSwitchModalVisible(true);
    };

    const performRoleSwitch = async () => {
        if (roleSwitchMode === 'vendor') {
            setIsRoleSwitchModalVisible(false);
            navigation.navigate('VendorRegister', {
                step: 1,
                userId: user._id,
                formData: {
                    name: user.name,
                    mobile: user.mobile,
                    storeName: user.storeName || '',
                    storeAddress: user.storeAddress || '',
                    location: user.location || null
                }
            });
            return;
        }

        setSwitching(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/auth/switch-role/user`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setIsRoleSwitchModalVisible(false);
                setSuccessMessage("Switched to Personal Account successfully!");
                setIsSuccessModalVisible(true);
                const isMounted = { current: true };
                fetchProfile(isMounted);
                DeviceEventEmitter.emit('roleChanged');
            } else {
                Alert.alert("Error", data.message || "Failed to switch role");
            }
        } catch (error) {
            console.error("Role switch error:", error);
            Alert.alert("Error", "Server connection failed");
        } finally {
            setSwitching(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!editName) {
            Alert.alert("Error", "Name is required");
            return;
        }

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const formData = new FormData();
            formData.append('name', editName);

            if (editImage) {
                const filename = editImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('profileImage', {
                    uri: editImage,
                    name: filename,
                    type
                });
            }

            const response = await fetch(`${API_BASE_URL}/auth/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setIsEditModalVisible(false);
                setEditImage(null);
                setSuccessMessage("Profile updated successfully!");
                setIsSuccessModalVisible(true);
            } else {
                Alert.alert("Update Failed", data.message || "Could not update profile");
            }
        } catch (error) {
            console.error("Update profile error:", error);
            Alert.alert("Error", "Server connection failed");
        } finally {
            setSaving(false);
        }
    };

    const menuItems = [
        ...(isVendor ? [
            { icon: LucidePackage, label: 'Add New Offer', color: colors.secondary, onPress: () => navigation.navigate('AddOffer') },
            { icon: Store, label: 'Manage Store', color: colors.primary, onPress: () => navigation.navigate('EditStore', { vendorData: user }) }
        ] : [
            { icon: LucidePackage, label: 'Redemption History', color: colors.secondary, onPress: () => { } }
        ]),
        { icon: Lock, label: 'Change Password', color: colors.warning, onPress: () => navigation.navigate('ChangePassword') },
        { icon: History, label: 'Login History', color: colors.secondary, onPress: () => navigation.navigate('LoginHistory') },
        { icon: Bell, label: 'Notifications', color: colors.warning, onPress: () => navigation.navigate('Notifications') },
        { icon: Shield, label: 'Privacy Center', color: colors.primary, onPress: () => navigation.navigate('PrivacyCenter') },
        { icon: Headphones, label: 'Support Center', color: colors.secondary, onPress: () => navigation.navigate('SupportCenter') },
        { icon: Settings, label: 'App Settings', color: colors.primary, onPress: () => navigation.navigate('AppSettings') },
    ];

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']} className="items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="items-center" edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: contentWidth }}>
                {/* Minimalist Premium Header */}
                <View style={{ backgroundColor: colors.card }} className="px-6 pt-6 pb-8 rounded-b-[40px] shadow-sm items-center">
                    <TouchableOpacity onPress={() => setIsEditModalVisible(true)} activeOpacity={0.9} className="relative">
                        <View style={{ backgroundColor: colors.surface, borderColor: colors.card }} className="w-[120px] h-[120px] rounded-full items-center justify-center border-4 shadow-xl overflow-hidden">
                            {user.profileImage ? (
                                <Image
                                    source={{ uri: `${API_BASE_URL.replace('/api', '')}${user.profileImage}` }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <User size={50} color={colors.textSecondary} strokeWidth={1.5} />
                            )}
                        </View>
                        <View style={{ backgroundColor: colors.primary, borderColor: colors.card }} className="absolute bottom-1 right-1 w-8 h-8 rounded-full justify-center items-center border-2">
                            <Camera size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <View className="items-center mt-4">
                        <Text style={{ color: colors.text }} className="text-3xl font-black tracking-tight">{user.name}</Text>
                        <View className="flex-row items-center mt-2">
                            <View style={{ backgroundColor: isVendor ? `${colors.secondary}20` : `${colors.primary}20` }} className="px-2 py-0.5 rounded-full mr-2">
                                <Text style={{ color: isVendor ? colors.secondary : colors.primary }} className="text-[12px] font-black tracking-widest">{isVendor ? 'Vender' : 'Personal'}</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary }} className="text-[12px] font-medium">{user.mobile}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Menu Sections */}
                <View className="px-6 py-6">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[4px] mb-6 opacity-40 uppercase">Account Settings</Text>

                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[32px] p-4 shadow-sm border">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={item.onPress}
                                style={{ borderBottomColor: index !== menuItems.length - 1 ? colors.border : 'transparent' }}
                                className={`flex-row items-center py-5 ${index !== menuItems.length - 1 ? 'border-b' : ''}`}
                            >
                                <View style={{ backgroundColor: `${item.color}10` }} className="w-12 h-12 rounded-[18px] items-center justify-center">
                                    <item.icon size={22} color={item.color} strokeWidth={2} />
                                </View>
                                <Text style={{ color: colors.text }} className="flex-1 ml-5 font-bold text-sm tracking-tight">{item.label}</Text>
                                <ChevronRight size={18} color={isDarkMode ? '#4A5568' : "#D1D5DB"} strokeWidth={3} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        className="flex-row items-center justify-center py-5 mt-8 bg-primary rounded-[28px] shadow-lg shadow-primary/40 px-8"
                        onPress={isVendor ? handleSwitchToUser : handleSwitchToVendor}
                        disabled={switching}
                    >
                        {switching ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Store size={20} color="white" />
                                <Text style={{ color: '#FFFFFF' }} className="ml-3 font-black text-sm tracking-widest">
                                    {isVendor ? 'Switch to Personal Account' : 'Become a Vendor Account'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center py-5 mt-4 bg-[#FF4444] rounded-[28px] shadow-lg shadow-[#FF4444]/40 px-8"
                        onPress={() => setIsLogoutModalVisible(true)}
                    >
                        <LogOut size={20} color="white" />
                        <Text style={{ color: '#FFFFFF' }} className="ml-3 font-black text-sm tracking-widest">Secure Sign Out</Text>
                    </TouchableOpacity>

                    {/* Version & Credits */}
                    <View className="items-center mt-8 mb-10">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[3px] opacity-40">FLASHDEALS V.1.0.4</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/40">
                    <View style={{ backgroundColor: colors.card }} className="rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View style={{ backgroundColor: colors.border }} className="w-16 h-1.5 rounded-full self-center mb-10" />
                        <Text style={{ color: colors.text }} className="text-3xl font-black mb-2">Edit Identity</Text>
                        <Text style={{ color: colors.textSecondary }} className="mb-8 font-medium">Update your profile information below.</Text>

                        <View className="items-center mb-8">
                            <TouchableOpacity onPress={pickImage} style={{ backgroundColor: colors.surface, borderColor: `${colors.primary}33` }} className="w-24 h-24 rounded-full items-center justify-center border-2 border-dashed overflow-hidden relative">
                                {editImage ? (
                                    <Image source={{ uri: editImage }} className="w-full h-full" />
                                ) : user.profileImage ? (
                                    <Image source={{ uri: `${API_BASE_URL.replace('/api', '')}${user.profileImage}` }} className="w-full h-full" />
                                ) : (
                                    <Camera size={28} color={colors.primary} opacity={0.5} />
                                )}
                                <View className="absolute bottom-0 right-0 left-0 bg-primary/80 py-1.5 items-center">
                                    <Text className="text-[8px] font-black text-white tracking-widest uppercase">Change</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-6">
                            <View>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-1 uppercase">Full Name</Text>
                                <TextInput
                                    style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                                    className="p-5 rounded-[24px] font-bold border"
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Enter your name"
                                    placeholderTextColor={isDarkMode ? '#4A5568' : '#94A3B8'}
                                />
                            </View>

                            <View className="mt-6">
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-1 uppercase">Mobile No</Text>
                                <TextInput
                                    style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                                    className="p-5 rounded-[24px] font-bold border opacity-50"
                                    value={editMobile}
                                    editable={false}
                                />
                            </View>

                            <View className="flex-row gap-4 mt-12">
                                <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={{ backgroundColor: colors.surface }} className="flex-1 py-5 rounded-[24px] items-center">
                                    <Text style={{ color: colors.text }} className="font-black text-sm tracking-widest">Discard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={{ backgroundColor: colors.primary }} className="flex-[2] py-5 rounded-[24px] items-center shadow-lg shadow-primary/30">
                                    {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest">Sync Changes</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Logout Modal */}
            <Modal visible={isLogoutModalVisible} animationType="fade" transparent={true}>
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="rounded-[40px] p-8 w-full items-center shadow-2xl relative overflow-hidden">
                        {/* Decorative background element for Logout */}
                        <View style={{ backgroundColor: `${colors.error}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                            <LogOut size={40} color="#FF4444" strokeWidth={1.5} />
                        </View>

                        <Text style={{ color: colors.text }} className="text-2xl font-black mb-2 text-center tracking-tight">Sign Out?</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center mb-10 font-medium leading-5 opacity-70 px-2">Are you sure you want to disconnect from your active session? Ready to go?</Text>

                        <View className="w-full space-y-4">
                            <TouchableOpacity
                                onPress={handleLogout}
                                style={{ backgroundColor: '#FF4444' }}
                                className="w-full py-5 rounded-[24px] items-center shadow-lg shadow-red-500/20"
                            >
                                <Text className="font-black text-sm tracking-widest text-white">YES, LOGOUT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsLogoutModalVisible(false)}
                                style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC' }}
                                className="w-full py-5 rounded-[24px] items-center mt-2"
                            >
                                <Text style={{ color: colors.text }} className="font-black text-xs tracking-[3px]">CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Role Switch Modal */}
            <Modal visible={isRoleSwitchModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/60">
                    <Pressable className="flex-1" onPress={() => !switching && setIsRoleSwitchModalVisible(false)} />
                    <View style={{ backgroundColor: colors.card }} className="rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View style={{ backgroundColor: colors.border }} className="w-16 h-1.5 rounded-full self-center mb-10" />
                        <View className="items-center mb-8">
                            <View style={{ backgroundColor: roleSwitchMode === 'vendor' ? `${colors.primary}15` : `${colors.warning}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center">
                                {roleSwitchMode === 'vendor' ? <Store size={40} color={colors.primary} /> : <User size={40} color={colors.warning} />}
                            </View>
                        </View>
                        <Text style={{ color: colors.text }} className="text-3xl font-black mb-3 text-center">{roleSwitchMode === 'vendor' ? 'Start Selling?' : 'Switch to Personal?'}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center mb-10 font-medium leading-6 opacity-70 px-4">
                            {roleSwitchMode === 'vendor' ? "Open your vendor portal to reach local customers. You can launch flash offers and manage your store identity." : "Warning: Switching to a personal account will hide your business dashboard and active flash offers."}
                        </Text>
                        <View className="flex-row space-x-4">
                            <TouchableOpacity onPress={() => setIsRoleSwitchModalVisible(false)} style={{ backgroundColor: colors.surface }} className="flex-1 py-5 rounded-[24px] items-center">
                                <Text style={{ color: colors.text }} className="font-black text-sm tracking-widest">Discard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={performRoleSwitch} style={{ backgroundColor: roleSwitchMode === 'vendor' ? colors.primary : colors.secondary }} className="flex-[2] py-5 rounded-[24px] items-center shadow-lg">
                                {switching ? <ActivityIndicator size="small" color="white" /> : <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest uppercase">{roleSwitchMode === 'vendor' ? 'Accept & Continue' : 'Confirm Switch'}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Animation Modal */}
            <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View style={{ backgroundColor: colors.card }} className="rounded-[60px] p-10 w-full items-center shadow-2xl relative overflow-hidden">
                        <View style={{ backgroundColor: `${colors.success}15` }} className="w-24 h-24 rounded-[40px] items-center justify-center mb-8 rotate-12">
                            <CheckCircle2 size={48} color={colors.success} strokeWidth={1.5} className="-rotate-12" />
                        </View>
                        <Text style={{ color: colors.text }} className="text-3xl font-black mb-3 text-center tracking-tighter">Success!</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center mb-12 font-medium leading-6 opacity-70">{successMessage}</Text>
                        <TouchableOpacity onPress={() => setIsSuccessModalVisible(false)} style={{ backgroundColor: colors.primary }} className="w-full py-5 rounded-[30px] items-center">
                            <Text style={{ color: '#FFFFFF' }} className="text-white font-black text-sm tracking-widest">Great!</Text>
                        </TouchableOpacity>
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
    },
    iosButtonShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 0,
    }
});

export default ProfileScreen;
