import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
    StyleSheet,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
import { colors } from '../theme/colors';

// Dummy Notifications Data
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

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(NOTIFICATIONS);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIconInfo = (type) => {
        switch (type) {
            case 'deal': return { icon: Flame, color: '#EF4444', bg: '#FEE2E2' };
            case 'store': return { icon: Store, color: '#3B82F6', bg: '#DBEAFE' };
            case 'system': return { icon: CheckCircle2, color: '#10B981', bg: '#D1FAE5' };
            default: return { icon: Bell, color: '#64748B', bg: '#F1F5F9' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Ultra Modern Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 items-center justify-center bg-slate-50 rounded-2xl"
                >
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-[10px] font-black text-slate-400 tracking-[2px]">Updates</Text>
                    <Text className="text-sm font-black text-primary mt-0.5">Notifications</Text>
                </View>
                <TouchableOpacity
                    onPress={markAllRead}
                    className="w-12 h-12 items-center justify-center bg-slate-50 rounded-2xl"
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
                <View className="mx-6 mt-8 p-10 rounded-[48px] items-center justify-center relative overflow-hidden bg-primary/5 border-2 border-primary/10">
                    <View className="w-20 h-20 bg-white rounded-[28px] items-center justify-center mb-6 shadow-xl shadow-primary/20">
                        <Bell size={36} color={colors.primary} strokeWidth={2.5} />
                        {notifications.some(n => !n.read) && (
                            <View className="absolute top-4 right-4 w-4 h-4 bg-error rounded-full border-4 border-white" />
                        )}
                    </View>

                    <Text className="text-primary text-3xl font-black text-center tracking-tight leading-8 mb-3">
                        Stay In{"\n"}The Loop
                    </Text>
                    <Text className="text-slate-500 text-sm font-bold text-center px-4">
                        Don't miss out on hot deals, new stores, and important updates.
                    </Text>
                </View>

                {/* Notification List */}
                <View className="px-6 mt-12">
                    <Text className="text-[11px] font-black text-slate-400 tracking-[2px] mb-6 ml-2">Recent Alerts</Text>

                    {notifications.map((notification) => {
                        const { icon: Icon, color, bg } = getIconInfo(notification.type);

                        return (
                            <TouchableOpacity
                                key={notification.id}
                                className={`mb-4 p-5 rounded-[32px] border ${notification.read ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200/60'
                                    }`}
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
                                                className={`flex-1 text-base font-black tracking-tight leading-tight ${notification.read ? 'text-primary/70' : 'text-primary'}`}
                                            >
                                                {notification.title}
                                            </Text>
                                            {!notification.read && (
                                                <View className="w-2.5 h-2.5 bg-error rounded-full ml-2 mt-1" />
                                            )}
                                        </View>
                                        <Text
                                            className={`text-xs font-bold leading-relaxed mb-3 ${notification.read ? 'text-slate-400' : 'text-slate-500'}`}
                                            numberOfLines={2}
                                        >
                                            {notification.description}
                                        </Text>

                                        <View className="flex-row items-center">
                                            <Clock size={12} color="#94A3B8" strokeWidth={2.5} />
                                            <Text className="text-[10px] font-black tracking-widest text-slate-400 ml-1.5 uppercase">
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
                            <Text className="text-slate-400 font-bold text-center">You have no new notifications.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationScreen;
