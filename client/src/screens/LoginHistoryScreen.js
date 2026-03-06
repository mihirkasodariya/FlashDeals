import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t, i18n } = useTranslation();
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

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language === 'hi' ? 'hi-IN' : 'gu-IN', {
            day: 'numeric',
            month: 'short'
        }) + ' ' + t('login_history.at') + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <Text style={{ color: colors.text }} className="text-base font-black tracking-tight">{t('login_history.security_access')}</Text>
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
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black mb-2 uppercase tracking-widest opacity-60">{t('login_history.connected_devices')}</Text>
                    <Text style={{ color: colors.text }} className="text-3xl font-black leading-tight">{t('login_history.current_sessions')}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-bold mt-2 opacity-80">{t('login_history.manage_hardware')}</Text>
                </View>

                {/* Status Overview */}
                <View className="px-6 mt-6">
                    <View style={{ backgroundColor: colors.primary }} className="p-6 rounded-[32px] flex-row items-center shadow-xl shadow-primary/20">
                        <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                            <ShieldCheck size={24} color="white" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text style={{ color: 'white' }} className="font-black text-sm">{t('login_history.everything_safe')}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.7)' }} className="text-[10px] font-bold mt-1">{t('login_history.monitoring_active', { count: devices.length })}</Text>
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
                                                        <Text style={{ color: colors.success }} className="text-[8px] font-black uppercase">{t('login_history.live')}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold mt-1 opacity-70">
                                                {index === 0 ? t('login_history.device_in_hand') : `${t('login_history.authorized_path')} • ${device.os}`}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="ml-[76px] mt-2 flex-row items-center">
                                    <Clock size={12} color={colors.textSecondary} opacity={0.5} />
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-2 opacity-50">{t('login_history.last_seen')} {formatDate(device.lastLogin)}</Text>
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
                    <Text style={{ color: colors.text }} className="font-black text-center text-sm">{t('login_history.recognize_hardware')}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-center text-[11px] font-bold mt-2 leading-relaxed px-4 opacity-70">
                        {t('login_history.security_policy_desc')}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginHistoryScreen;
