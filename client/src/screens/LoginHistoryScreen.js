import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
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
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const LoginHistoryScreen = ({ navigation }) => {
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
                // If it's the current device (index 0), logout locally too
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
        if (lower.includes('iphone') || lower.includes('android')) icon = <Smartphone size={24} color={active ? colors.primary : '#64748B'} />;
        else if (lower.includes('ipad') || lower.includes('tablet')) icon = <Tablet size={24} color={active ? colors.primary : '#64748B'} />;
        else icon = <Monitor size={24} color={active ? colors.primary : '#64748B'} />;

        return (
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${active ? 'bg-primary/10' : 'bg-slate-100'}`}>
                {icon}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Minimal Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
                >
                    <ChevronLeft size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-base font-black text-primary tracking-tight">Security & Access</Text>
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
                    <Text className="text-[10px] font-black text-slate-400 mb-2">Connected Devices</Text>
                    <Text className="text-3xl font-black text-primary leading-tight">Current Sessions</Text>
                    <Text className="text-sm text-slate-400 font-bold mt-2">Manage all active hardware connected to your merchant profile.</Text>
                </View>

                {/* Status Overview */}
                <View className="px-6 mt-6">
                    <View className="bg-primary p-6 rounded-[32px] flex-row items-center border border-primary/20 shadow-xl shadow-primary/30">
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
                                                <Text className="text-base font-black text-primary mr-2">{device.deviceInfo}</Text>
                                                {index === 0 && (
                                                    <View className="flex-row items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100 ml-2">
                                                        <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                                                        <Text className="text-[8px] font-black text-green-600">Live</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-slate-400 text-[11px] font-bold mt-1">
                                                {index === 0 ? 'Device in Hand' : `Authorized Path • ${device.os}`}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => confirmLogout(device._id)}
                                        disabled={actionLoading === device._id}
                                        className="px-4 py-2 bg-red-50 rounded-xl border border-red-100"
                                    >
                                        {actionLoading === device._id ? (
                                            <ActivityIndicator size="small" color="#EF4444" />
                                        ) : (
                                            <Text className="text-red-500 font-black text-[10px]">Logout</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View className="ml-[76px] mt-2 flex-row items-center">
                                    <Clock size={12} color="#94A3B8" />
                                    <Text className="text-[10px] text-slate-400 font-bold ml-2">Last seen {formatDate(device.lastLogin)}</Text>
                                </View>

                                {index < devices.length - 1 && (
                                    <View className="h-[1px] bg-slate-50 mt-8" />
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Security Tips */}
                <View className="mx-6 p-8 bg-slate-50 rounded-[40px] border border-slate-100 items-center mt-6">
                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
                        <ShieldAlert size={20} color={colors.secondary} />
                    </View>
                    <Text className="text-primary font-black text-center text-sm">Recognize Your Hardware?</Text>
                    <Text className="text-slate-400 text-center text-[11px] font-bold mt-2 leading-relaxed px-4">
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
                    <View className="bg-white w-full rounded-[40px] p-8 overflow-hidden">
                        <View className="items-center">
                            <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
                                <ShieldAlert size={40} color="#EF4444" strokeWidth={1.5} />
                            </View>

                            <Text className="text-2xl font-black text-primary text-center">Terminate Session?</Text>
                            <Text className="text-slate-400 font-bold text-center mt-3 leading-relaxed">
                                This will instantly disconnect the device. Any unsaved merchant data on that device may be lost.
                            </Text>
                        </View>

                        <View className="mt-8 space-y-3">
                            <TouchableOpacity
                                onPress={handleRemoteLogout}
                                disabled={actionLoading !== null}
                                className="bg-red-500 py-5 rounded-[24px] items-center flex-row justify-center"
                            >
                                {actionLoading !== null ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <LogOut size={18} color="white" />
                                        <Text className="text-white font-black text-sm ml-3">Yes, Terminate</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowLogoutModal(false)}
                                className="bg-slate-100 py-5 rounded-[24px] items-center mt-3"
                            >
                                <Text className="text-slate-500 font-black text-sm">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LoginHistoryScreen;
