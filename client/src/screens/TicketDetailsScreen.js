import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Modal,
    Pressable,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Calendar,
    Hash,
    Layers,
    MessageSquare,
    Info,
    X,
    Clock,
    ShieldCheck
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import CustomButton from '../components/CustomButton';

const { width, height } = Dimensions.get('window');

const TicketDetailsScreen = ({ navigation, route }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const { ticket } = route.params;
    const [infoVisible, setInfoVisible] = useState(false);

    const getStatusTheme = (status) => {
        switch (status) {
            case 'Open': return { color: '#3B82F6', text: t('support.status_open'), iconColor: '#DBEAFE' };
            case 'In Review': return { color: '#F59E0B', text: t('support.status_review'), iconColor: '#FEF3C7' };
            case 'Resolved': return { color: '#10B981', text: t('support.status_resolved'), iconColor: '#D1FAE5' };
            case 'Closed': return { color: '#64748B', text: t('support.status_closed'), iconColor: '#F1F5F9' };
            default: return { color: '#94A3B8', text: t('support.status_pending'), iconColor: '#F8FAFC' };
        }
    };

    const statusTheme = getStatusTheme(ticket.status);
    const imageUri = ticket.attachment
        ? `${API_BASE_URL.replace('/api', '')}${ticket.attachment}`
        : null;

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
                    <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-[2px] uppercase opacity-60">{t('support.ticket_status')}</Text>
                    <View className="flex-row items-center mt-0.5">
                        <View style={{ backgroundColor: statusTheme.color }} className="w-1.5 h-1.5 rounded-full mr-2" />
                        <Text style={{ color: statusTheme.color }} className="text-xs font-black tracking-widest uppercase">{t(`support.status_${ticket.status.toLowerCase().replace(' ', '_')}`)}</Text>
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

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Hero Status Card */}
                <View className="mx-6 mt-8 p-10 rounded-[48px] items-center justify-center relative overflow-hidden" style={{ backgroundColor: statusTheme.color }}>
                    <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5" />

                    <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center mb-6 backdrop-blur-md">
                        <MessageSquare size={36} color="white" strokeWidth={2.5} />
                    </View>

                    <Text className="text-white text-3xl font-black text-center tracking-tight leading-8">
                        {statusTheme.text}
                    </Text>
                    <Text className="text-white/70 text-sm font-bold mt-2 font-mono">ID: {ticket.ticketId}</Text>
                </View>

                {/* Quick Info Grid */}
                <View className="flex-row px-6 mt-6 justify-between">
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-[48%] p-5 rounded-[32px] items-center border shadow-sm">
                        <Calendar size={20} color={colors.primary} opacity={0.6} />
                        <Text style={{ color: colors.textSecondary }} className="text-[9px] font-black mt-3 mb-1 uppercase opacity-60">{t('support.created_date')}</Text>
                        <Text style={{ color: colors.text }} className="text-[11px] font-black">{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-[48%] p-5 rounded-[32px] items-center border shadow-sm">
                        <Layers size={20} color={colors.primary} opacity={0.6} />
                        <Text style={{ color: colors.textSecondary }} className="text-[9px] font-black mt-3 mb-1 uppercase opacity-60">{t('support.category')}</Text>
                        <Text style={{ color: colors.text }} className="text-[11px] font-black uppercase" numberOfLines={1}>{t(`support.cat_${ticket.category.toLowerCase()}`)}</Text>
                    </View>
                </View>

                {/* Subject & Description */}
                <View className="px-8 mt-10">
                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-[3px] mb-4 uppercase opacity-40">{t('support.ticket_subject')}</Text>
                    <Text style={{ color: colors.text }} className="text-xl font-black leading-8 mb-8 tracking-tight">
                        {ticket.subject}
                    </Text>

                    <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-[3px] mb-4 uppercase opacity-40">{t('support.description_details')}</Text>
                    <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-8 rounded-[40px] border shadow-sm">
                        <Text style={{ color: colors.textSecondary }} className="text-base font-bold leading-relaxed opacity-80">
                            {ticket.description}
                        </Text>
                    </View>
                </View>

                {/* Attachment */}
                {imageUri && (
                    <View className="px-6 mt-10">
                        <View className="mb-6 px-2">
                            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-[3px] uppercase opacity-40">{t('support.support_attachment')}</Text>
                        </View>

                        <View style={{ borderColor: colors.border }} className="rounded-[48px] overflow-hidden border-4 shadow-2xl shadow-black/10">
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: width - 48 }}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Info Popup Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={infoVisible}
                onRequestClose={() => setInfoVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <Pressable className="absolute inset-0" onPress={() => setInfoVisible(false)} />

                    <View style={{ backgroundColor: colors.card }} className="w-[90%] rounded-[48px] p-10 items-center shadow-2xl">
                        <View style={{ backgroundColor: `${colors.primary}10` }} className="w-24 h-24 rounded-[32px] items-center justify-center mb-8">
                            <ShieldCheck size={48} color={colors.primary} strokeWidth={2.5} />
                        </View>

                        <Text style={{ color: colors.text }} className="text-2xl font-black text-center leading-tight mb-4">
                            {t('support.under_analysis')}
                        </Text>

                        <Text style={{ color: colors.textSecondary }} className="font-bold text-sm text-center leading-relaxed mb-10 px-2 opacity-60">
                            {t('support.analyzing_desc')}
                        </Text>

                        {/* Timeline Item */}
                        <View style={{ backgroundColor: colors.surface }} className="w-full rounded-[32px] p-6 flex-row items-center mb-10">
                            <View style={{ backgroundColor: colors.card }} className="w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-sm">
                                <Clock size={20} color={colors.primary} strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-1 opacity-40">{t('support.expected_response')}</Text>
                                <Text style={{ color: colors.text }} className="text-sm font-black">{t('support.within_time')}</Text>
                            </View>
                        </View>

                        <CustomButton
                            title={t('support.understood')}
                            onPress={() => setInfoVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default TicketDetailsScreen;
