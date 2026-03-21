import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Bell, CheckCircle2, Clock, Trash2, BellRing, Info, Sparkles, Ghost } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../components/CustomText';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const NotificationScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/auth/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await fetch(`${API_BASE_URL}/auth/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state for immediate feedback
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => markAsRead(n._id)));
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!loading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }
    }, [loading]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMins = Math.floor((now - date) / 60000);
        
        if (diffInMins < 1) return t('notifications.just_now') || 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ${t('notifications.ago') || 'ago'}`;
        if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ${t('notifications.ago') || 'ago'}`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            
            {/* Premium Header */}
            <View style={{ borderBottomColor: colors.border }} className="px-6 py-4 flex-row items-center justify-between border-b">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-12 h-12 items-center justify-center rounded-2xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[3px] uppercase opacity-60">{t('notifications.updates') || 'Updates'}</Text>
                    <Text style={{ color: colors.text }} className="text-sm font-black mt-0.5">{t('profile.notifications')}</Text>
                </View>
                <TouchableOpacity
                    onPress={markAllRead}
                    style={{ backgroundColor: colors.surface }}
                    className="w-12 h-12 items-center justify-center rounded-2xl"
                >
                    <CheckCircle2 size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Hero Dashboard */}
                <Animated.View style={{ opacity: fadeAnim, backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}1A` }} className="p-8 rounded-[48px] items-center justify-center relative overflow-hidden border-2 mb-10">
                    <View style={{ backgroundColor: colors.card }} className="w-20 h-20 rounded-[28px] items-center justify-center mb-6 shadow-xl shadow-black/10">
                        <Bell size={36} color={colors.primary} strokeWidth={2.5} />
                        {notifications.some(n => !n.isRead) && (
                            <View style={{ borderColor: colors.card }} className="absolute top-4 right-4 w-4 h-4 bg-error rounded-full border-4 shadow-sm" />
                        )}
                    </View>

                    <Text style={{ color: colors.text }} className="text-3xl font-black text-center tracking-tight leading-8 mb-3">
                        {notifications.filter(n => !n.isRead).length} {t('notifications.new_updates') || 'New Updates'}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-bold text-center px-4 opacity-70">
                        {notifications.length > 0 ? t('notifications.hero_desc_real') || 'Tap messages to acknowledge them. Cleared auto-daily.' : t('notifications.hero_desc_empty') || 'All caught up with latest deals!'}
                    </Text>
                </Animated.View>

                {notifications.length === 0 ? (
                    <View className="items-center justify-center py-10">
                        <View style={{ backgroundColor: colors.surface }} className="w-24 h-24 rounded-[40px] items-center justify-center mb-6 opacity-40">
                            <Ghost size={48} color={colors.textSecondary} />
                        </View>
                        <Text style={{ color: colors.textSecondary }} className="text-sm font-black opacity-30 tracking-widest uppercase">{t('notifications.empty')}</Text>
                    </View>
                ) : (
                    notifications.map((item, index) => (
                        <TouchableOpacity
                            key={item._id}
                            activeOpacity={0.8}
                            onPress={() => {
                                if (!item.isRead) markAsRead(item._id);
                                if (item.title === 'Only 24 hours left for this offer!' || 
                                    item.title === 'Only 2 hours left for this offer!') {
                                    navigation.navigate('ExpiringDeals');
                                } else if (item.title === 'Hot deal nearby! Don’t miss it' || 
                                         item.title === 'Trending Deals near you 15km') {
                                    navigation.navigate('Home');
                                } else if (item.title === 'Recommended offers for you') {
                                    navigation.navigate('Wishlist');
                                } else if (item.title === 'New offers near you') {
                                    navigation.navigate('Home');
                                }
                            }}
                            style={{ 
                                backgroundColor: item.isRead ? 'transparent' : colors.card,
                                borderColor: colors.border
                            }}
                            className={`flex-row p-5 rounded-[32px] border mb-4 relative overflow-hidden shadow-sm`}
                        >
                            {!item.isRead && (
                                <View style={{ backgroundColor: colors.primary }} className="absolute h-full w-1.5 left-0" />
                            )}

                            <View style={{ backgroundColor: item.isRead ? colors.surface : `${colors.primary}10` }} className="w-14 h-14 rounded-[22px] items-center justify-center mr-4">
                                <Info size={24} color={item.isRead ? colors.textSecondary : colors.primary} strokeWidth={2} />
                            </View>

                            <View className="flex-1 pr-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text numberOfLines={1} style={{ color: colors.text }} className={`text-base tracking-tight ${item.isRead ? 'font-black opacity-40' : 'font-black'}`}>
                                        {item.title}
                                    </Text>
                                    {!item.isRead && (
                                        <View style={{ backgroundColor: colors.error }} className="w-2.5 h-2.5 rounded-full ml-2" />
                                    )}
                                </View>
                                <Text numberOfLines={3} style={{ color: colors.textSecondary }} className={`text-xs leading-4 mb-3 font-bold ${item.isRead ? 'opacity-30' : 'opacity-70'}`}>
                                    {item.body}
                                </Text>
                                <View className="flex-row items-center">
                                    <Clock size={12} color={colors.textSecondary} opacity={0.4} />
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black ml-1.5 opacity-40 uppercase tracking-widest">
                                        {formatTime(item.createdAt)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Cleanup Notice Section */}
                <View style={{ backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }} className="mt-8 p-6 rounded-[32px] border-2 border-dashed border-slate-200/50 flex-row items-center">
                    <Sparkles size={16} color={colors.primary} strokeWidth={3} />
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-3 italic flex-1 opacity-50">
                        {t('notifications.cleanup_notice') || 'Note: Notifications are automatically cleared from this history after 24 hours to keep your portal clean.'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationScreen;
