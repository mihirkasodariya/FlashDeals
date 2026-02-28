import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, useWindowDimensions, Modal, Pressable, Alert, ActivityIndicator, StyleSheet, TextInput, Platform } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, MapPin, Package as LucidePackage, Store, Map as MapIcon, Edit3, Navigation2, Camera, Lock, History, Headphones } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';



import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const ProfileScreen = ({ navigation }) => {
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
    const [editImage, setEditImage] = React.useState(null);
    const [saving, setSaving] = React.useState(false);

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
                Alert.alert("Success", "Profile updated successfully!");
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
            { icon: LucidePackage, label: 'Add New Offer', color: colors.secondary, onPress: () => navigation.navigate('AddOffer') }
        ] : [
            { icon: LucidePackage, label: 'Redemption History', color: colors.secondary, onPress: () => { } }
        ]),
        { icon: Lock, label: 'Change Password', color: colors.warning, onPress: () => navigation.navigate('ChangePassword') },
        { icon: History, label: 'Login History', color: colors.secondary, onPress: () => navigation.navigate('LoginHistory') },
        { icon: Bell, label: 'Notifications', color: colors.warning, onPress: () => navigation.navigate('Notifications') },
        { icon: Shield, label: 'Privacy Center', color: colors.primary, onPress: () => navigation.navigate('PrivacyCenter') },
        { icon: Headphones, label: 'Support Center', color: colors.secondary, onPress: () => navigation.navigate('SupportCenter') },
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
                            {user.profileImage ? (
                                <Image
                                    source={{ uri: `${API_BASE_URL.replace('/api', '')}${user.profileImage}` }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <User size={80} color="#D1D5DB" strokeWidth={1} />
                            )}
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
                    <Text className="text-textSecondary font-bold mt-1 tracking-widest text-xs opacity-60">
                        {user.role} Account • {user.mobile}
                    </Text>

                    <TouchableOpacity
                        onPress={() => setIsEditModalVisible(true)}
                        className="mt-6 bg-[#F3F4F6] px-8 py-3 rounded-2xl border border-surface"
                    >
                        <Text className="text-primary font-black text-xs tracking-widest">Edit Profile</Text>
                    </TouchableOpacity>
                </View>


                {/* Settings Menu Sections */}
                <View className="px-6 py-6">
                    <Text className="text-[10px] font-black text-textSecondary tracking-[4px] mb-6 opacity-40">System Dashboard</Text>

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
                            <Text className="ml-3 text-error font-black text-sm tracking-widest">Secure Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Version & Credits */}
                <View className="items-center pb-32">
                    <Text className="text-[9px] font-black text-textSecondary/40 tracking-[5px]">NextGen Core v2.2</Text>
                </View>
            </ScrollView>

            {/* Unique Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-[50px] p-10 pb-16 shadow-2xl">
                        <View className="w-16 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-10" />

                        <Text className="text-3xl font-black text-primary mb-2">Edit Identity</Text>
                        <Text className="text-textSecondary mb-8 font-medium">Update your profile information below.</Text>

                        {/* Image Picker in Modal */}
                        <View className="items-center mb-8">
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-24 h-24 bg-surface rounded-full items-center justify-center border-2 border-dashed border-primary/20 overflow-hidden"
                            >
                                {editImage ? (
                                    <Image source={{ uri: editImage }} className="w-full h-full" />
                                ) : user.profileImage ? (
                                    <Image source={{ uri: `${API_BASE_URL.replace('/api', '')}${user.profileImage}` }} className="w-full h-full" />
                                ) : (
                                    <Camera size={28} color={colors.primary} opacity={0.5} />
                                )}
                                <View className="absolute bottom-0 right-0 left-0 bg-primary/80 py-1.5 items-center">
                                    <Text className="text-[8px] font-black text-white tracking-widest">Change</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-6">
                            <View>
                                <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1">Full Name</Text>
                                <TextInput
                                    className="bg-[#F3F4F6] p-5 rounded-[24px] font-bold text-primary border border-transparent focus:border-primary"
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Enter your name"
                                />
                            </View>

                            <View className="mt-6">
                                <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-3 ml-1">Mobile No</Text>
                                <TextInput
                                    className="bg-[#F3F4F6] p-5 rounded-[24px] font-bold text-primary border border-transparent opacity-50"
                                    value={editMobile}
                                    editable={false}
                                    placeholder="Enter mobile number"
                                />
                            </View>

                            <View className="flex-row gap-4 mt-12">
                                <TouchableOpacity
                                    onPress={() => setIsEditModalVisible(false)}
                                    className="flex-1 bg-surface py-5 rounded-[24px] items-center"
                                >
                                    <Text className="text-primary font-black text-sm tracking-widest">Discard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                    className="flex-[2] bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-primary/30"
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text className="text-white font-black text-sm tracking-widest">Sync Changes</Text>
                                    )}
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
                                className="w-full bg-primary py-5 rounded-[30px] items-center shadow-lg shadow-primary/30"
                            >
                                <Text className="text-white font-black text-sm tracking-widest">Logout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsLogoutModalVisible(false)}
                                className="w-full py-5 items-center mt-2"
                            >
                                <Text className="text-primary font-black text-xs tracking-[3px]">Cancel</Text>
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

