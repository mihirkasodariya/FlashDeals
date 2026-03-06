import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Linking,
    Platform,
    Dimensions,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    Pressable,
    KeyboardAvoidingView,
    Image,
    StyleSheet,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Headphones,
    Mail,
    MessageSquarePlus,
    History,
    ChevronRight,
    HelpCircle,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Send,
    Camera,
    Image as ImageIcon,
    Plus,
    RefreshCw,
    Shield
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const SupportCenterScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        subject: '',
        description: '',
        category: 'General'
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, [i18n.language]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('support.permission_denied'), t('support.gallery_permission_desc'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!form.subject || !form.description) {
            Alert.alert(t('common.error'), t('support.fill_fields'));
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('userToken');

            const formData = new FormData();
            formData.append('subject', form.subject);
            formData.append('description', form.description);
            formData.append('category', form.category);

            if (image) {
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('attachment', {
                    uri: image,
                    name: `ticket-image.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            const response = await fetch(`${API_BASE_URL}/tickets/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert(t('common.success'), t('support.ticket_success'));
                setIsModalVisible(false);
                setForm({ subject: '', description: '', category: 'General' });
                setImage(null);
                fetchTickets();
            } else {
                Alert.alert(t('common.error'), data.message);
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('support.failed_ticket'));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return '#3B82F6';
            case 'In Review': return '#F59E0B';
            case 'Resolved': return '#10B981';
            case 'Closed': return '#64748B';
            default: return '#94A3B8';
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
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] uppercase opacity-60">{t('support.help_center')}</Text>
                    <Text style={{ color: colors.text }} className="text-sm font-black mt-0.5">{t('support.title')}</Text>
                </View>
                <TouchableOpacity
                    onPress={fetchTickets}
                    style={{ backgroundColor: colors.surface }}
                    className="w-12 h-12 items-center justify-center rounded-2xl"
                >
                    <RefreshCw size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Hero Support Card */}
                <View className="mx-6 mt-8 p-10 rounded-[48px] items-center justify-center relative overflow-hidden" style={{ backgroundColor: isDarkMode ? colors.primary + '20' : colors.primary }}>
                    {/* Decorative background shapes */}
                    <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5" />

                    <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center mb-6 backdrop-blur-md">
                        <Headphones size={36} color={isDarkMode ? colors.primary : "white"} strokeWidth={2.5} />
                    </View>

                    <Text style={{ color: isDarkMode ? colors.text : "white" }} className="text-3xl font-black text-center tracking-tight leading-8">
                        {t('support.hero_title')}
                    </Text>
                    <Text style={{ color: isDarkMode ? colors.textSecondary : 'rgba(255, 255, 255, 0.6)' }} className="text-xs font-bold text-center mt-3 px-10">
                        {t('support.hero_desc')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        style={{ backgroundColor: isDarkMode ? colors.primary : "white" }}
                        className="mt-8 px-8 py-4 rounded-2xl shadow-xl shadow-black/10 flex-row items-center"
                    >
                        <Plus size={18} color={isDarkMode ? "white" : colors.primary} strokeWidth={3} />
                        <Text style={{ color: isDarkMode ? "white" : colors.primary }} className="font-black text-sm ml-2">{t('support.new_ticket')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Contact Actions */}
                <View className="px-6 mt-8 flex-row justify-between">
                    <TouchableOpacity
                        onPress={() => Linking.openURL('mailto:support@flashdeals.com')}
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        className="w-[48%] p-6 rounded-[32px] items-center justify-center border"
                    >
                        <View style={{ backgroundColor: '#3B82F615' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3">
                            <Mail size={22} color="#3B82F6" strokeWidth={2.5} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-[11px] font-black uppercase">{t('support.email_support')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-[9px] font-bold mt-1 opacity-50">{t('support.email_desc')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('PrivacyCenter', { expandPolicy: 'support' })}
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        className="w-[48%] p-6 rounded-[32px] items-center justify-center border"
                    >
                        <View style={{ backgroundColor: '#8B5CF615' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3">
                            <Shield size={22} color="#8B5CF6" strokeWidth={2.5} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-[11px] font-black uppercase">{t('support.policy_support')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-[9px] font-bold mt-1 opacity-50">{t('support.policy_desc')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Ticket History Section */}
                <View className="px-8 mt-12">
                    <View className="flex-row items-center justify-between mb-8">
                        <View>
                            <Text style={{ color: colors.secondary }} className="text-[11px] font-black tracking-[3px] mb-1 uppercase">{t('support.ticket_history')}</Text>
                            <Text style={{ color: colors.text }} className="text-base font-black">{t('support.active_requests')}</Text>
                        </View>
                        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="px-3 py-1.5 rounded-xl border">
                            <Text style={{ color: colors.primary }} className="text-[10px] font-black">{t('support.total_tickets', { count: tickets.length })}</Text>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={colors.primary} size="large" className="my-10" />
                    ) : tickets.map((ticket, index) => (
                        <TouchableOpacity
                            key={ticket._id || index}
                            onPress={() => navigation.navigate('TicketDetails', { ticket })}
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            className="p-6 rounded-[32px] mb-6 border shadow-sm"
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: colors.surface }} className="w-8 h-8 rounded-xl items-center justify-center mr-3">
                                        <History size={14} color={colors.textSecondary} strokeWidth={2.5} />
                                    </View>
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest opacity-60">{ticket.ticketId}</Text>
                                </View>
                                <View
                                    style={{ backgroundColor: `${getStatusColor(ticket.status)}15` }}
                                    className="px-3 py-1.5 rounded-full"
                                >
                                    <Text style={{ color: getStatusColor(ticket.status) }} className="text-[9px] font-black tracking-widest uppercase">
                                        {t(`support.status_${ticket.status.toLowerCase().replace(' ', '_')}`)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ color: colors.text }} className="text-base font-black leading-tight mb-4" numberOfLines={1}>
                                {ticket.subject}
                            </Text>

                            <View style={{ backgroundColor: colors.border }} className="h-[1px] mb-4 opacity-30" />

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Clock size={12} color={colors.textSecondary} opacity={0.5} />
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold ml-1.5 opacity-60">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text style={{ color: colors.secondary }} className="text-[10px] font-black mr-2 italic uppercase">{t(`support.cat_${ticket.category.toLowerCase()}`)}</Text>
                                    <ChevronRight size={14} color={colors.textSecondary} opacity={0.3} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {!loading && tickets.length === 0 && (
                        <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-[40px] p-12 items-center border border-dashed">
                            <View style={{ backgroundColor: colors.surface }} className="w-16 h-16 rounded-[24px] items-center justify-center shadow-sm mb-6">
                                <AlertCircle size={32} color={colors.textSecondary} opacity={0.3} />
                            </View>
                            <Text style={{ color: colors.text }} className="font-black text-sm">{t('support.no_tickets')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="font-bold text-xs mt-2 text-center opacity-60">
                                {t('support.no_tickets_desc')}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Premium Create Ticket Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                statusBarTranslucent={true}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <Pressable className="absolute inset-0" onPress={() => setIsModalVisible(false)} />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View style={{ backgroundColor: colors.card }} className="rounded-t-[48px] shadow-2xl overflow-hidden">
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={{ padding: 32, paddingBottom: 40 }}
                            >
                                <View className="flex-row items-center justify-between mb-8">
                                    <View>
                                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] uppercase opacity-60">{t('support.request_title')}</Text>
                                        <Text style={{ color: colors.text }} className="text-2xl font-black">{t('support.new_ticket')}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setIsModalVisible(false)}
                                        style={{ backgroundColor: colors.surface }}
                                        className="w-12 h-12 rounded-2xl items-center justify-center"
                                    >
                                        <X size={20} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-2 uppercase opacity-60">{t('support.category')}</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-8"
                                    contentContainerStyle={{ paddingLeft: 4 }}
                                >
                                    {['General', 'Technical', 'Billing', 'Verification', 'Other'].map((cat) => {
                                        const catKey = `support.cat_${cat.toLowerCase()}`;
                                        return (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setForm(prev => ({ ...prev, category: cat }))}
                                                style={{ backgroundColor: form.category === cat ? colors.primary : colors.surface }}
                                                className={`px-6 py-4 rounded-2xl mr-3 border-2 ${form.category === cat ? 'border-primary' : 'border-transparent'}`}
                                            >
                                                <Text style={{ color: form.category === cat ? 'white' : colors.textSecondary }} className="text-xs font-black">{t(catKey)}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-2 uppercase opacity-60">{t('support.subject')}</Text>
                                <TextInput
                                    style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                                    className="rounded-2xl px-6 py-5 mb-8 font-bold border"
                                    placeholder={t('support.subject_placeholder')}
                                    placeholderTextColor={isDarkMode ? '#ffffff40' : '#CBD5E1'}
                                    value={form.subject}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, subject: text }))}
                                />

                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-3 ml-2 uppercase opacity-60">{t('support.description')}</Text>
                                <TextInput
                                    style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                                    className="rounded-[32px] px-6 py-6 mb-8 font-bold border h-40"
                                    placeholder={t('support.description_placeholder')}
                                    placeholderTextColor={isDarkMode ? '#ffffff40' : '#CBD5E1'}
                                    multiline
                                    textAlignVertical="top"
                                    value={form.description}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                                />

                                <View className="flex-row items-center justify-between mb-4 ml-2">
                                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest uppercase opacity-60">{t('support.attachment')}</Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-[9px] font-bold tracking-tight opacity-40">{t('support.optional')}</Text>
                                </View>
                                <View className="mb-10">
                                    {!image ? (
                                        <TouchableOpacity
                                            onPress={pickImage}
                                            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                            className="border-2 border-dashed rounded-[40px] p-10 items-center justify-center"
                                        >
                                            <View style={{ backgroundColor: colors.card }} className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm mb-4">
                                                <Camera size={26} color={colors.primary} />
                                            </View>
                                            <Text style={{ color: colors.textSecondary }} className="font-bold text-xs opacity-60">{t('support.add_photo')}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View className="relative">
                                            <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[40px] overflow-hidden border h-56">
                                                <Image
                                                    source={{ uri: image }}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setImage(null)}
                                                style={{ backgroundColor: colors.card }}
                                                className="absolute -top-3 -right-3 w-12 h-12 rounded-full items-center justify-center shadow-2xl border"
                                            >
                                                <X size={22} color={colors.primary} strokeWidth={3} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreateTicket}
                                    disabled={submitting}
                                    className="bg-primary py-6 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-primary/40"
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Send size={18} color="white" strokeWidth={2.5} />
                                            <Text className="text-white font-black text-base tracking-widest ml-3">{t('support.submit')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SupportCenterScreen;
