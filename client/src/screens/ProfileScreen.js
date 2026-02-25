import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, useWindowDimensions, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, MapPin, Package, Store, Map as MapIcon, Edit3 } from 'lucide-react-native';
import { colors } from '../theme/colors';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);

    // Mock user data - in real app would come from AuthContext
    const [user, setUser] = React.useState({
        _id: '65dad723924372001c8a1234',
        name: 'Mihir Kasodariya',
        mobile: '+91 98765 43210',
        role: 'user', // Change this to 'vendor' to see store details
        storeName: 'Mihir Store & Stationery',
        storeAddress: 'Shop G-12, Platinum Plaza, Near Iscon Circle, Ahmedabad, Gujarat 380015',
        stats: {
            activeDeals: 12,
            savedMoney: '4.5k',
            totalImpressions: '1.2k'
        }
    });

    const isVendor = user && user.role === 'vendor';
    const isTablet = width > 768;
    const contentWidth = isTablet ? 600 : '100%';

    const handleLogout = () => {
        setIsLogoutModalVisible(false);
        // Reset navigation to Login screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const menuItems = [
        ...(isVendor ? [{ icon: Store, label: 'Store Analytics', color: colors.secondary }] : []),
        { icon: Package, label: isVendor ? 'Manage Offers' : 'My Redemptions', color: colors.secondary },
        { icon: MapPin, label: isVendor ? 'Business Location' : 'Saved Addresses', color: colors.accent },
        { icon: Bell, label: 'Notifications', color: colors.warning },
        { icon: Shield, label: 'Privacy Policy', color: colors.primary },
        { icon: HelpCircle, label: 'Help & Support', color: '#6366F1' },
    ];

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

                {/* Vendor Store Details Section */}
                {isVendor && (
                    <View className="px-6 py-6 border-b border-surface">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm font-bold text-textSecondary uppercase tracking-widest">Store Information</Text>
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => navigation.navigate('EditStore', { vendorData: user })}
                            >
                                <Edit3 size={14} color={colors.secondary} />
                                <Text className="text-secondary text-xs font-bold ml-1">Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-surface/50 rounded-2xl p-5 border border-border border-dashed">
                            <View className="flex-row items-center mb-4">
                                <View className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-sm border border-border">
                                    <Store size={24} color={colors.primary} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-lg font-bold text-primary">{user.storeName}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <View className="px-2 py-0.5 bg-green-100 rounded">
                                            <Text className="text-[10px] text-green-700 font-bold uppercase">Verified Store</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-start mb-4">
                                <MapPin size={18} color={colors.textSecondary} className="mt-0.5" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-xs font-bold text-textSecondary uppercase mb-1">Full Address</Text>
                                    <Text className="text-primary text-sm leading-5">
                                        {user.storeAddress}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                className="flex-row items-center justify-center bg-white border border-border py-3 rounded-xl shadow-sm"
                                activeOpacity={0.7}
                            >
                                <MapIcon size={18} color={colors.primary} />
                                <Text className="ml-2 font-bold text-primary">Update Location on Map</Text>
                            </TouchableOpacity>
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
