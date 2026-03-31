import React from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TouchableOpacity, Image, useWindowDimensions, Modal, Pressable, Alert, ActivityIndicator, StyleSheet, TextInput, Platform, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Package as LucidePackage, Store, Edit3, Camera, Lock, History, Headphones, CheckCircle2, LogIn, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const ProfileScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
    const [isRoleSwitchModalVisible, setIsRoleSwitchModalVisible] = React.useState(false);
    const [roleSwitchMode, setRoleSwitchMode] = React.useState(null);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');

    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [editName, setEditName] = React.useState('');
    const [editMobile, setEditMobile] = React.useState('');
    const [editImage, setEditImage] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [switching, setSwitching] = React.useState(false);

    const fetchProfile = async (isMounted) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                if (isMounted.current) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                if (isMounted.current) {
                    setUser(data.user);
                    setEditName(data.user.name);
                    setEditMobile(data.user.mobile);
                }
            } else {
                await AsyncStorage.removeItem('userToken');
                if (isMounted.current) setUser(null);
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
    const hasVendorProfile = user && user.storeName; // Detect if they were a vendor before
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
            Alert.alert(t('common.error'), t('profile.permission_required'));
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
            Alert.alert(t('common.error'), t('profile.name_required'));
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
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                setIsEditModalVisible(false);
                setEditImage(null);
                setSuccessMessage(t('profile.profile_updated'));
                setIsSuccessModalVisible(true);
            }
        } catch (error) {
            console.error("Update profile error:", error);
        } finally {
            setSaving(false);
        }
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
            const endpoint = roleSwitchMode === 'vendor' 
                ? `${API_BASE_URL}/auth/switch-role/vendor`
                : `${API_BASE_URL}/auth/switch-role/user`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setIsRoleSwitchModalVisible(false);
                setSuccessMessage(t('profile.switched_personal_success'));
                setIsSuccessModalVisible(true);
                const isMounted = { current: true };
                fetchProfile(isMounted);
                DeviceEventEmitter.emit('roleChanged');
            }
        } catch (error) {
            console.error("Role switch error:", error);
        } finally {
            setSwitching(false);
        }
    };

    const handleSwitchToVendor = () => {
        if (isVendor) {
            setRoleSwitchMode('vendor');
            setIsRoleSwitchModalVisible(true);
        } else {
            // Normal user becoming vendor for the first time OR returning vendor
            navigation.navigate('VendorRegister', { 
                step: 1, 
                userId: user._id,
                formData: {
                    storeName: user.storeName,
                    storeAddress: user.storeAddress,
                    location: user.location,
                    idNumber: user.idNumber,
                    idType: user.idType || 'GSTIN'
                },
                prevDocImage: user.idDocument // Pass existing document if any
            });
        }
    };

    const handleSwitchToUser = () => {
        setRoleSwitchMode('user');
        setIsRoleSwitchModalVisible(true);
    };

    const menuItems = [
        ...(user && isVendor ? [
            { icon: LucidePackage, label: t('profile.add_new_offer'), color: colors.secondary, onPress: () => navigation.navigate('AddOffer') },
            { icon: Store, label: t('profile.manage_store'), color: colors.primary, onPress: () => navigation.navigate('EditStore', { vendorData: user }) },
            { icon: CheckCircle2, label: t('profile.account_status') || 'Account Status', color: colors.success || '#10B981', onPress: () => navigation.navigate('ActivationStatus') }
        ] : []),
        { icon: Bell, label: t('profile.notifications'), color: colors.warning, onPress: () => navigation.navigate('Notifications') },
        { icon: Shield, label: t('profile.privacy_center'), color: colors.primary, onPress: () => navigation.navigate('PrivacyCenter') },
        { icon: Headphones, label: t('profile.support_center'), color: colors.secondary, onPress: () => navigation.navigate('SupportCenter') },
        { icon: Settings, label: t('profile.app_settings'), color: colors.primary, onPress: () => navigation.navigate('AppSettings') },
    ];

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']} className="items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="items-center" edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: contentWidth }}>
                {/* Header / Guest View */}
                <View style={{ backgroundColor: colors.card }} className="px-6 pt-6 pb-8 rounded-b-[40px] shadow-sm items-center">
                    {user ? (
                        <>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(true)} activeOpacity={0.9} className="relative">
                                <View style={{ backgroundColor: colors.surface, borderColor: colors.card }} className="w-[120px] h-[120px] rounded-full items-center justify-center border-4 shadow-xl overflow-hidden">
                                    {user.profileImage ? (
                                        <Image
                                            source={{ 
                                                uri: user.profileImage.startsWith('http') 
                                                    ? user.profileImage 
                                                    : `${API_BASE_URL.replace('/api', '')}${user.profileImage}` 
                                            }}
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
                                        <Text style={{ color: isVendor ? colors.secondary : colors.primary }} className="text-[12px] font-black tracking-widest">{isVendor ? t('profile.vendor') : t('profile.personal')}</Text>
                                    </View>
                                    <Text style={{ color: colors.textSecondary }} className="text-[12px] font-medium">{user.mobile}</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View className="items-center py-6">
                            <View style={{ backgroundColor: colors.surface }} className="w-24 h-24 rounded-full items-center justify-center mb-6">
                                <User size={48} color={colors.primary} opacity={0.3} />
                            </View>
                            <Text style={{ color: colors.text }} className="text-2xl font-black text-center">{t('profile.guest_access')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-sm font-bold opacity-60 mt-1 mb-8">{t('profile.sign_in_unlock')}</Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    await AsyncStorage.removeItem('userToken');
                                    navigation.navigate('Login');
                                }}
                                style={{ backgroundColor: colors.primary }}
                                className="flex-row items-center px-10 py-4 rounded-[24px] shadow-lg shadow-primary/20"
                            >
                                <LogIn size={20} color="white" />
                                <Text style={{ color: '#FFFFFF' }} className="text-white font-black ml-3 tracking-widest">{t('profile.sign_in_now')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Settings Menu Sections */}
                <View className="px-6 py-6">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[4px] mb-6 opacity-40">{t('profile.account_settings')}</Text>

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

                    {!user ? (
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-5 mt-8 bg-primary rounded-[28px] shadow-lg shadow-primary/40 px-8"
                            onPress={async () => {
                                await AsyncStorage.removeItem('userToken');
                                navigation.navigate('Login');
                            }}
                        >
                            <Store size={20} color="white" />
                            <Text style={{ color: '#FFFFFF' }} className="ml-3 font-black text-sm tracking-widest">
                                {t('profile.become_vendor')}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                className="flex-row items-center justify-center py-5 mt-8 bg-primary rounded-[28px] shadow-lg shadow-primary/40 px-8"
                                onPress={isVendor ? handleSwitchToUser : (hasVendorProfile ? handleSwitchToVendor : handleSwitchToVendor)}
                                disabled={switching}
                            >
                                {switching ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Store size={20} color="white" />
                                        <Text style={{ color: '#FFFFFF' }} className="ml-3 font-black text-sm tracking-widest">
                                            {isVendor ? t('profile.switch_personal') : (hasVendorProfile ? t('profile.switch_vendor_mode') : t('profile.become_vendor'))}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center justify-center py-5 mt-4 bg-[#FF4444] rounded-[28px] shadow-lg shadow-[#FF4444]/40 px-8"
                                onPress={() => setIsLogoutModalVisible(true)}
                            >
                                <LogOut size={20} color="white" />
                                <Text style={{ color: '#FFFFFF' }} className="ml-3 font-black text-sm tracking-widest">{t('profile.secure_sign_out')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Version & Credits */}
                    <View className="items-center mt-12 mb-10">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[3px] opacity-40">{t('common.version')} 1.0.4</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Modals (Only rendered if user exists) */}
            {user && (
                <>
                    {/* Logout Modal */}
                    <Modal visible={isLogoutModalVisible} animationType="fade" transparent={true}>
                        <View className="flex-1 justify-center items-center bg-black/80 px-8">
                            <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="rounded-[40px] p-8 w-full items-center shadow-2xl relative overflow-hidden">
                                <View style={{ backgroundColor: `${colors.error}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                                    <LogOut size={40} color="#FF4444" strokeWidth={1.5} />
                                </View>
                                <Text style={{ color: colors.text }} className="text-2xl font-black mb-2 text-center tracking-tight">{t('profile.sign_out_title')}</Text>
                                <Text style={{ color: colors.textSecondary }} className="text-center mb-10 font-medium leading-5 opacity-70 px-2">{t('profile.sign_out_desc')}</Text>
                                <View className="w-full space-y-4">
                                    <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#FF4444' }} className="w-full py-5 rounded-[24px] items-center mb-4"><Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest text-white">{t('profile.yes_logout')}</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsLogoutModalVisible(false)} style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC' }} className="w-full py-5 rounded-[24px] items-center"><Text style={{ color: colors.text }} className="font-black text-xs tracking-[3px]">{t('common.cancel')}</Text></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Edit Profile Modal */}
                    <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
                        <View className="flex-1 justify-end bg-black/60">
                            <View style={{ backgroundColor: colors.background }} className="rounded-t-[48px] p-8 min-h-[70%]">
                                <View className="flex-row justify-between items-center mb-10">
                                    <Text style={{ color: colors.text }} className="text-3xl font-black tracking-tight">{t('profile.edit_profile')}</Text>
                                    <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={{ backgroundColor: colors.surface }} className="w-12 h-12 rounded-2xl items-center justify-center">
                                        <X size={24} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View className="items-center mb-10">
                                        <TouchableOpacity onPress={pickImage} activeOpacity={0.9} className="relative">
                                            <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="w-32 h-32 rounded-full items-center justify-center border-2 overflow-hidden shadow-lg">
                                                {editImage ? (
                                                    <Image source={{ uri: editImage }} className="w-full h-full" />
                                                ) : user.profileImage ? (
                                                    <Image 
                                                        source={{ 
                                                            uri: user.profileImage.startsWith('http') 
                                                                ? user.profileImage 
                                                                : `${API_BASE_URL.replace('/api', '')}${user.profileImage}` 
                                                        }} 
                                                        className="w-full h-full" 
                                                    />
                                                ) : (
                                                    <User size={60} color={colors.textSecondary} opacity={0.3} />
                                                )}
                                            </View>
                                            <View style={{ backgroundColor: colors.primary }} className="absolute bottom-1 right-1 w-10 h-10 rounded-full justify-center items-center border-4 border-white">
                                                <Camera size={20} color="white" />
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="space-y-6">
                                        <View>
                                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-2 opacity-60 ml-2">{t('profile.full_name')}</Text>
                                            <TextInput
                                                value={editName}
                                                onChangeText={setEditName}
                                                placeholder={t('profile.placeholder_name')}
                                                placeholderTextColor={colors.textSecondary + '80'}
                                                style={{ backgroundColor: colors.card, color: colors.text, borderColor: colors.border }}
                                                className="w-full h-16 rounded-[20px] px-6 font-bold text-base border"
                                            />
                                        </View>

                                        <View className="mt-4">
                                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] mb-2 opacity-60 ml-2">{t('profile.mobile_readonly')}</Text>
                                            <TextInput
                                                value={editMobile}
                                                disabled={true}
                                                editable={false}
                                                style={{ backgroundColor: colors.surface, color: colors.textSecondary }}
                                                className="w-full h-16 rounded-[20px] px-6 font-bold text-base border-0 opacity-60"
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleSaveProfile}
                                        disabled={saving}
                                        style={{ backgroundColor: colors.primary }}
                                        className="w-full h-16 rounded-[24px] items-center justify-center mt-12 shadow-lg shadow-primary/30"
                                    >
                                        {saving ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={{ color: '#FFFFFF' }} className="text-white font-black text-sm tracking-widest">{t('profile.update_profile')}</Text>
                                        )}
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    {/* Role Switch Confirmation Modal */}
                    <Modal visible={isRoleSwitchModalVisible} animationType="fade" transparent={true}>
                        <View className="flex-1 justify-center items-center bg-black/80 px-8">
                            <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="rounded-[40px] p-8 w-full items-center shadow-2xl relative overflow-hidden">
                                <View style={{ backgroundColor: `${colors.primary}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                                    <Store size={40} color={colors.primary} strokeWidth={1.5} />
                                </View>
                                <Text style={{ color: colors.text }} className="text-2xl font-black mb-2 text-center tracking-tight">
                                    {roleSwitchMode === 'vendor' ? (hasVendorProfile ? t('profile.switch_vendor_mode') : t('profile.start_selling')) : t('profile.back_to_personal')}
                                </Text>
                                <Text style={{ color: colors.textSecondary }} className="text-center mb-10 font-medium leading-5 opacity-70 px-2">
                                    {roleSwitchMode === 'vendor'
                                        ? (hasVendorProfile ? 'Switch back to your store dashboard to manage your offers.' : t('profile.start_selling_desc'))
                                        : t('profile.back_to_personal_desc')}
                                </Text>
                                <View className="w-full space-y-4">
                                    <TouchableOpacity
                                        onPress={performRoleSwitch}
                                        disabled={switching}
                                        style={{ backgroundColor: colors.primary }}
                                        className="w-full py-5 rounded-[24px] items-center mb-4 shadow-lg shadow-primary/20"
                                    >
                                        {switching ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest text-white">{t('profile.confirm_switch')}</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setIsRoleSwitchModalVisible(false)}
                                        style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC' }}
                                        className="w-full py-5 rounded-[24px] items-center"
                                    >
                                        <Text style={{ color: colors.text }} className="font-black text-xs tracking-[3px]">{t('common.not_now')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Success Message Modal */}
                    <Modal visible={isSuccessModalVisible} animationType="fade" transparent={true}>
                        <View className="flex-1 justify-center items-center bg-black/80">
                            <View style={{ backgroundColor: colors.card }} className="w-72 p-8 rounded-[40px] items-center shadow-2xl">
                                <View style={{ backgroundColor: `${colors.success}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                                    <CheckCircle2 size={40} color={colors.success} strokeWidth={2} />
                                </View>
                                <Text style={{ color: colors.text }} className="text-xl font-black mb-10 text-center tracking-tight">{successMessage}</Text>
                                <TouchableOpacity
                                    onPress={() => setIsSuccessModalVisible(false)}
                                    style={{ backgroundColor: colors.success }}
                                    className="px-10 py-4 rounded-[20px]"
                                >
                                    <Text style={{ color: '#FFFFFF' }} className="text-white font-black text-xs tracking-widest">{t('profile.cool')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </SafeAreaView>
    );
};

export default ProfileScreen;
