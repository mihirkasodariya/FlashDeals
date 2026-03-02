import React, { useState, useEffect } from 'react';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    Dimensions,
    StyleSheet,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Monitor, Smartphone, Clock, ShieldCheck, Globe, LogOut, ChevronRight, Fingerprint, MapPin, Tablet, ShieldAlert, Zap } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const LoginHistoryScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);

    const fetchHistory = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/auth/login-history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setDevices(data.devices);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRemoteLogout = async () => {
        if (!selectedDeviceId) return;

        setActionLoading(selectedDeviceId);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/auth/logout-device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deviceId: selectedDeviceId })
            });

            const data = await response.json();
            if (data.success) {
                const deviceIndex = devices.findIndex(d => d._id === selectedDeviceId);
                if (deviceIndex === 0) {
                    await AsyncStorage.multiRemove(['userToken', 'userData', 'isVendor']);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                } else {
                    setDevices(devices.filter(d => d._id !== selectedDeviceId));
                    setShowLogoutModal(false);
                }
            } else {
                Alert.alert("Failed", data.message || "Could not logout device");
            }
        } catch (error) {
            Alert.alert("Error", "Server connection timed out");
        } finally {
            setActionLoading(null);
            setSelectedDeviceId(null);
        }
    };

    const confirmLogout = (deviceId) => {
        setSelectedDeviceId(deviceId);
        setShowLogoutModal(true);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDeviceIcon = (info, active) => {
        const lower = info.toLowerCase();
        let icon;
        if (lower.includes('iphone') || lower.includes('android')) icon = <Smartphone size={24} color={active ? colors.primary : colors.textSecondary} />;
        else if (lower.includes('ipad') || lower.includes('tablet')) icon = <Tablet size={24} color={active ? colors.primary : colors.textSecondary} />;
        else icon = <Monitor size={24} color={active ? colors.primary : colors.textSecondary} />;

        return (
            <View style={{ backgroundColor: active ? `${colors.primary}15` : colors.surface }} className="w-14 h-14 rounded-2xl items-center justify-center">
                {icon}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1" edges={['top']}>
            {/* Minimal Header */}
            <View style={{ borderBottomColor: colors.border }} className="px-6 py-4 flex-row items-center justify-between border-b">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-full"
                >
                    <ChevronLeft size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="text-base font-black tracking-tight">Security & Access</Text>
                <TouchableOpacity onPress={onRefresh} className="w-10 h-10 items-center justify-center">
                    <Zap size={18} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Dashboard Header */}
                <View className="px-6 pt-8 pb-4">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black mb-2 uppercase tracking-widest opacity-60">Connected Devices</Text>
                    <Text style={{ color: colors.text }} className="text-3xl font-black leading-tight">Current Sessions</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-bold mt-2 opacity-80">Manage all active hardware connected to your merchant profile.</Text>
                </View>

                {/* Status Overview */}
                <View className="px-6 mt-6">
                    <View style={{ backgroundColor: colors.primary }} className="p-6 rounded-[32px] flex-row items-center shadow-xl shadow-primary/20">
                        <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                            <ShieldCheck size={24} color="white" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-white font-black text-sm">Everything Safe</Text>
                            <Text className="text-white/70 text-[10px] font-bold mt-1">Automatic session monitoring is active for {devices.length} verified paths.</Text>
                        </View>
                    </View>
                </View>

                {/* Devices List */}
                <View className="px-6 mt-10">
                    {loading ? (
                        <View className="py-20 items-center">
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        devices.map((device, index) => (
                            <View key={index} className="mb-8">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        {getDeviceIcon(device.deviceInfo, index === 0)}
                                        <View className="ml-5 flex-1">
                                            <View className="flex-row items-center">
                                                <Text style={{ color: colors.text }} className="text-base font-black mr-2">{device.deviceInfo}</Text>
                                                {index === 0 && (
                                                    <View style={{ backgroundColor: `${colors.success}15`, borderColor: `${colors.success}30` }} className="flex-row items-center px-2 py-0.5 rounded-full border ml-2">
                                                        <View style={{ backgroundColor: colors.success }} className="w-1.5 h-1.5 rounded-full mr-1" />
                                                        <Text style={{ color: colors.success }} className="text-[8px] font-black uppercase">Live</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold mt-1 opacity-70">
                                                {index === 0 ? 'Device in Hand' : `Authorized Path • ${device.os}`}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => confirmLogout(device._id)}
                                        disabled={actionLoading === device._id}
                                        style={{ backgroundColor: `${colors.error}10`, borderColor: `${colors.error}20` }}
                                        className="px-4 py-2 rounded-xl border"
                                    >
                                        {actionLoading === device._id ? (
                                            <ActivityIndicator size="small" color="#EF4444" />
                                        ) : (
                                            <Text className="text-red-500 font-black text-[10px]">LOGOUT</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View className="ml-[76px] mt-2 flex-row items-center">
                                    <Clock size={12} color={colors.textSecondary} opacity={0.5} />
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-2 opacity-50">Last seen {formatDate(device.lastLogin)}</Text>
                                </View>

                                {index < devices.length - 1 && (
                                    <View style={{ backgroundColor: colors.border }} className="h-[1px] mt-8 opacity-30" />
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Security Tips */}
                <View style={{ backgroundColor: colors.surface }} className="mx-6 p-8 rounded-[40px] items-center mt-6">
                    <View style={{ backgroundColor: colors.card }} className="w-12 h-12 rounded-full items-center justify-center mb-4 shadow-sm">
                        <ShieldAlert size={20} color={colors.warning} />
                    </View>
                    <Text style={{ color: colors.text }} className="font-black text-center text-sm">Recognize Your Hardware?</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-center text-[11px] font-bold mt-2 leading-relaxed px-4 opacity-70">
                        We periodically sign out inactive devices to keep your vault secure. If you don't recognize an entry, terminate the session and change your pin.
                    </Text>
                </View>
            </ScrollView>

            {/* Custom Logout Modal */}
            <Modal
                transparent={true}
                visible={showLogoutModal}
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View className="flex-1 bg-black/60 items-center justify-center px-6">
                    <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="w-full rounded-[40px] p-8 overflow-hidden">
                        <View className="items-center">
                            <View style={{ backgroundColor: `${colors.error}15` }} className="w-20 h-20 rounded-full items-center justify-center mb-6">
                                <ShieldAlert size={40} color="#EF4444" strokeWidth={1.5} />
                            </View>

                            <Text style={{ color: colors.text }} className="text-2xl font-black text-center">Terminate Session?</Text>
                            <Text style={{ color: colors.textSecondary }} className="font-bold text-center mt-3 leading-relaxed opacity-70 px-2">
                                This will instantly disconnect the device. Any unsaved merchant data on that device may be lost.
                            </Text>
                        </View>

                        <View className="mt-8 space-y-3">
                            <TouchableOpacity
                                onPress={handleRemoteLogout}
                                disabled={actionLoading !== null}
                                style={{ backgroundColor: '#EF4444' }}
                                className="py-5 rounded-[24px] items-center flex-row justify-center shadow-lg shadow-red-500/20"
                            >
                                {actionLoading !== null ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <LogOut size={18} color="white" />
                                        <Text className="text-white font-black text-sm ml-3">YES, TERMINATE</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowLogoutModal(false)}
                                style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F1F5F9' }}
                                className="py-5 rounded-[24px] items-center mt-3"
                            >
                                <Text style={{ color: colors.text }} className="font-black text-sm">CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LoginHistoryScreen;
