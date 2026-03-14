import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Platform,
    Modal,
    Pressable,
    StatusBar,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
    Keyboard,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Calendar,
    Layers,
    MessageSquare,
    Info,
    Clock,
    ShieldCheck,
    Send,
    User,
    Shield,
    MoreHorizontal,
    Paperclip,
    ArrowUp
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TicketDetailsScreen = ({ navigation, route }) => {
    const { colors, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { ticket: initialTicket = { messages: [], subject: '', ticketId: '', status: '', description: '', category: '' } } = route.params || {};

    const [ticket, setTicket] = useState(initialTicket);
    const [infoVisible, setInfoVisible] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef();

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, () => {
            setKeyboardVisible(true);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 600);
        return () => clearTimeout(timeout);
    }, [ticket.messages]);

    const fetchTicket = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const found = data.tickets.find(t => t._id === ticket._id);
                if (found) setTicket(found);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/tickets/reply/${ticket._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: replyText })
            });

            const data = await res.json();
            if (data.success) {
                setReplyText('');
                if (data.ticket) setTicket(data.ticket);
                else fetchTicket();
                Keyboard.dismiss();
            } else {
                Alert.alert('Error', data.message || t('support.reply_failed'));
            }
        } catch (error) {
            Alert.alert('Error', t('support.reply_failed'));
        } finally {
            setSending(false);
        }
    };

    const getStatusTheme = (status) => {
        switch (status) {
            case 'Open': return { colors: ['#4F46E5', '#3730A3'], text: 'Open' };
            case 'In Review': return { colors: ['#F59E0B', '#B45309'], text: 'In Review' };
            case 'Resolved': return { colors: ['#10B981', '#065F46'], text: 'Resolved' };
            case 'Closed': return { colors: ['#6B7280', '#374151'], text: 'Closed' };
            default: return { colors: ['#9CA3AF', '#4B5563'], text: 'Pending' };
        }
    };

    const statusTheme = getStatusTheme(ticket.status);
    const imageUri = ticket.attachment ? `${API_BASE_URL.replace('/api', '')}${ticket.attachment}` : null;

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <SafeAreaView 
                edges={['top']} 
                style={{ backgroundColor: colors.background }}
                onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
            >
                <View style={{ borderBottomColor: colors.border }} className="px-6 py-4 flex-row items-center justify-between border-b">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ backgroundColor: colors.surface }}
                        className="w-12 h-12 items-center justify-center rounded-2xl"
                    >
                        <ChevronLeft size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[3px] capitalize opacity-40">
                            {t('support.ticket_status')}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <View style={{ backgroundColor: statusTheme.colors[0] }} className="w-1.5 h-1.5 rounded-full mr-2 shadow-sm" />
                            <Text style={{ color: colors.text }} className="text-sm font-black tracking-widest capitalize">
                                {statusTheme.text}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setInfoVisible(true)}
                        style={{ backgroundColor: colors.surface }}
                        className="w-12 h-12 items-center justify-center rounded-2xl"
                    >
                        <Info size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : headerHeight}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchTicket} tintColor={colors.primary} />
                    }
                >
                    {/* Floating Header Card */}
                    <View className="mx-6 mt-8">
                         <LinearGradient 
                            colors={statusTheme.colors} 
                            start={{ x: 0, y: 0 }} 
                            end={{ x: 1, y: 1 }} 
                            style={{ borderRadius: 32, padding: 24 }}
                            className="shadow-2xl shadow-indigo-500/30"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} className="px-3 py-1.5 rounded-full self-start mb-4 backdrop-blur-md">
                                        <Text className="text-white text-[10px] font-black tracking-[1px] capitalize">ID #{ticket.ticketId}</Text>
                                    </View>
                                    <Text className="text-white text-2xl font-black leading-tight tracking-tight">{ticket.subject}</Text>
                                </View>
                                <View className="w-16 h-16 bg-white/20 rounded-3xl items-center justify-center ml-4 backdrop-blur-xl border border-white/20">
                                    <MessageSquare size={32} color="white" strokeWidth={2.5} />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Minimal Information Grid */}
                    <View className="flex-row px-6 mt-6 gap-4">
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="flex-1 p-5 rounded-3xl border shadow-sm">
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black capitalize opacity-30 mb-2 tracking-widest">Ticket Created Date</Text>
                            <View className="flex-row items-center">
                                <Calendar size={14} color={colors.primary} style={{ marginRight: 6 }} />
                                <Text style={{ color: colors.text }} className="text-xs font-black">{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="flex-1 p-5 rounded-3xl border shadow-sm">
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black capitalize opacity-30 mb-2 tracking-widest">{t('support.category')}</Text>
                            <View className="flex-row items-center">
                                <Layers size={14} color={colors.primary} style={{ marginRight: 6 }} />
                                <Text style={{ color: colors.text }} className="text-xs font-black capitalize" numberOfLines={1}>{t(`support.cat_${ticket.category.toLowerCase()}`)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Discussion Section */}
                    <View className="px-6 mt-12 mb-8">
                        <View className="flex-row items-center justify-between mb-8 px-2">
                             <Text style={{ color: colors.textSecondary }} className="text-[12px] font-black tracking-[4px] capitalize opacity-20">Details</Text>
                             <View className="h-[1px] flex-1 bg-border/40 ml-6" />
                        </View>

                        {/* Initial Description as first message */}
                        <View className="flex-row mb-8 justify-start">
                            <View className="flex-1 max-w-[90%]">
                                <View style={{ backgroundColor: colors.surface }} className="p-6 rounded-[32px] rounded-tl-none border border-border/30">
                                    <View className="flex-row items-center mb-4 opacity-40">
                                        <Info size={14} color={colors.textSecondary} />
                                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black capitalize tracking-widest ml-2">Original Issue</Text>
                                    </View>
                                    <Text style={{ color: colors.textSecondary }} className="text-[15px] font-medium leading-relaxed italic opacity-80">{ticket.description}</Text>
                                    {imageUri && (
                                        <View className="mt-6 rounded-2xl overflow-hidden shadow-sm border border-border/10">
                                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 220, backgroundColor: colors.surface }} resizeMode="cover" />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Conversation Thread */}
                        {ticket.messages && ticket.messages.map((msg, index) => {
                            const isAdmin = msg.senderRole === 'admin';
                            return (
                                <View key={index} className={`flex-row mb-6 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                    <View className="max-w-[85%]">
                                        {isAdmin ? (
                                            <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="px-6 py-5 rounded-[28px] rounded-tl-mini border shadow-sm">
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <View className="flex-row items-center">
                                                        <View className="w-5 h-5 rounded-full bg-indigo-500 items-center justify-center mr-2">
                                                            <Shield size={10} color="white" />
                                                        </View>
                                                        <Text style={{ color: colors.primary }} className="text-[10px] font-bold capitalize tracking-widest">Support Team</Text>
                                                    </View>
                                                    <Text style={{ color: colors.textSecondary }} className="text-[8px] font-black opacity-30 ml-4">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <Text style={{ color: colors.text }} className="text-[15px] font-bold leading-relaxed">{msg.message}</Text>
                                            </View>
                                        ) : (
                                            <LinearGradient 
                                                colors={[colors.primary, colors.primary + 'EE']}
                                                style={{ borderRadius: 28, borderBottomRightRadius: 4, padding: 20 }}
                                                className="shadow-xl shadow-indigo-500/30"
                                            >
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text style={{ color: 'rgba(255,255,255,0.7)' }} className="text-[10px] font-bold capitalize tracking-widest">{t('support.you')}</Text>
                                                    <Text style={{ color: 'rgba(255,255,255,0.4)' }} className="text-[8px] font-black ml-4">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <Text style={{ color: 'white' }} className="text-[15px] font-bold leading-relaxed">{msg.message}</Text>
                                            </LinearGradient>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Floating Modern Input Bar */}
                {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                    <View
                        style={{
                            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : (isKeyboardVisible ? 10 : 30),
                            backgroundColor: 'transparent'
                        }}
                        className="px-6"
                    >
                        <View 
                            style={{ 
                                backgroundColor: isDarkMode ? '#1e1e2dEE' : '#ffffffEE',
                                borderColor: colors.border
                            }} 
                            className="flex-row items-end p-2 rounded-[32px] border shadow-2xl backdrop-blur-2xl"
                        >
                            <TouchableOpacity className="w-11 h-11 items-center justify-center rounded-full opacity-40">
                                <Paperclip size={20} color={colors.text} />
                            </TouchableOpacity>
                            
                            <View className="flex-1 px-4 py-1">
                                <TextInput
                                    style={{ color: colors.text, maxHeight: 120 }}
                                    className="py-2 text-[15px] font-bold"
                                    placeholder={t('support.type_reply')}
                                    placeholderTextColor={isDarkMode ? '#ffffff20' : '#00000020'}
                                    value={replyText}
                                    onChangeText={setReplyText}
                                    multiline
                                    onFocus={() => {
                                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleReply}
                                disabled={sending || !replyText.trim()}
                                style={{
                                    backgroundColor: replyText.trim() ? colors.primary : colors.surface,
                                    width: 44,
                                    height: 44
                                }}
                                className="rounded-[22px] items-center justify-center shadow-lg"
                            >
                                {sending ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <ArrowUp size={24} color={replyText.trim() ? "white" : colors.textSecondary} strokeWidth={3} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>

            <Modal animationType="fade" transparent={true} visible={infoVisible} onRequestClose={() => setInfoVisible(false)}>
                <View className="flex-1 justify-center items-center bg-black/60 px-6 backdrop-blur-sm">
                    <Pressable className="absolute inset-0" onPress={() => setInfoVisible(false)} />
                    <View style={{ backgroundColor: colors.card }} className="w-[85%] rounded-[48px] p-10 items-center shadow-2xl">
                        <View style={{ backgroundColor: `${colors.primary}15` }} className="w-20 h-20 rounded-[32px] items-center justify-center mb-8">
                            <ShieldCheck size={44} color={colors.primary} strokeWidth={2.5} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-black text-center mb-3">{t('support.analyzing')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="font-bold text-sm text-center mb-10 px-2 opacity-50 leading-relaxed">{t('support.stay_tuned')}</Text>
                        <CustomButton title={t('support.close')} onPress={() => setInfoVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TicketDetailsScreen;
