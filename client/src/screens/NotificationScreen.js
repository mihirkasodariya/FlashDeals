import React, { useState } from 'react';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Platform,
    StyleSheet,
    Animated,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Bell,
    CheckCircle2,
    Settings,
    Clock,
    Tag,
    Store,
    Flame,
    MoreVertical
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'Massive Deal Alert! 🔥',
        description: '50% OFF at Burger King for the next 2 hours only. Grab your meal now!',
        time: '5 mins ago',
        type: 'deal',
        read: false
    },
    {
        id: '2',
        title: 'New Store Nearby 🏪',
        description: 'Tech Hub just joined FlashDeals. Check out their opening discounts.',
        time: '2 hours ago',
        type: 'store',
        read: true
    },
    {
        id: '3',
        title: 'Your Order is Confirmed ✅',
        description: 'Your coupon for Fashion Street has been generated successfully.',
        time: 'Yesterday',
        type: 'system',
        read: true
    }
];

const NotificationScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const [notifications, setNotifications] = useState(NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIconInfo = (type) => {
        switch (type) {
            case 'deal': return { icon: Flame, color: '#EF4444', bg: isDarkMode ? '#EF444420' : '#FEE2E2' };
            case 'store': return { icon: Store, color: colors.secondary, bg: isDarkMode ? `${colors.secondary}20` : '#DBEAFE' };
            case 'system': return { icon: CheckCircle2, color: colors.success, bg: isDarkMode ? `${colors.success}20` : '#D1FAE5' };
            default: return { icon: Bell, color: colors.textSecondary, bg: colors.surface };
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1" edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={{ borderBottomColor: colors.border }} className="px-6 py-4 flex-row items-center justify-between border-b">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-12 h-12 items-center justify-center rounded-2xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[3px] uppercase opacity-60">Updates</Text>
                    <Text style={{ color: colors.text }} className="text-sm font-black mt-0.5">Notifications</Text>
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
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Hero Section */}
                <View style={{ backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}1A` }} className="mx-6 mt-8 p-10 rounded-[48px] items-center justify-center relative overflow-hidden border-2">
                    <View style={{ backgroundColor: colors.card }} className="w-20 h-20 rounded-[28px] items-center justify-center mb-6 shadow-xl shadow-black/10">
                        <Bell size={36} color={colors.primary} strokeWidth={2.5} />
                        {notifications.some(n => !n.read) && (
                            <View style={{ borderColor: colors.card }} className="absolute top-4 right-4 w-4 h-4 bg-error rounded-full border-4" />
                        )}
                    </View>

                    <Text style={{ color: colors.text }} className="text-3xl font-black text-center tracking-tight leading-8 mb-3">
                        Stay In{"\n"}The Loop
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm font-bold text-center px-4 opacity-70">
                        Don't miss out on hot deals, new stores, and important updates.
                    </Text>
                </View>

                {/* Notification List */}
                <View className="px-6 mt-12">
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-[4px] mb-6 ml-2 uppercase opacity-40">Recent Alerts</Text>

                    {notifications.map((notification) => {
                        const { icon: Icon, color, bg } = getIconInfo(notification.type);

                        return (
                            <TouchableOpacity
                                key={notification.id}
                                style={{
                                    backgroundColor: notification.read ? colors.background : colors.card,
                                    borderColor: colors.border
                                }}
                                className="mb-4 p-5 rounded-[32px] border"
                            >
                                <View className="flex-row items-start">
                                    <View
                                        style={{ backgroundColor: bg }}
                                        className="w-14 h-14 rounded-[20px] items-center justify-center mr-4"
                                    >
                                        <Icon size={24} color={color} strokeWidth={2.5} />
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row items-start justify-between mb-1.5">
                                            <Text
                                                style={{ color: notification.read ? colors.text + '70' : colors.text }}
                                                className="flex-1 text-base font-black tracking-tight leading-tight"
                                            >
                                                {notification.title}
                                            </Text>
                                            {!notification.read && (
                                                <View className="w-2.5 h-2.5 bg-error rounded-full ml-2 mt-1" />
                                            )}
                                        </View>
                                        <Text
                                            style={{ color: colors.textSecondary }}
                                            className={`text-xs font-bold leading-relaxed mb-3 ${notification.read ? 'opacity-50' : 'opacity-80'}`}
                                            numberOfLines={2}
                                        >
                                            {notification.description}
                                        </Text>

                                        <View className="flex-row items-center">
                                            <Clock size={12} color={colors.textSecondary} opacity={0.5} strokeWidth={2.5} />
                                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest ml-1.5 uppercase opacity-50">
                                                {notification.time}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {notifications.length === 0 && (
                        <View className="py-12 items-center">
                            <Text style={{ color: colors.textSecondary }} className="font-bold text-center opacity-50">You have no new notifications.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationScreen;
