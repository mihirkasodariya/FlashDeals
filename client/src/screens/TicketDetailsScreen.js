import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Modal,
    Pressable,
    BlurView
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
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import CustomButton from '../components/CustomButton';

const { width, height } = Dimensions.get('window');

const TicketDetailsScreen = ({ navigation, route }) => {
    const { ticket } = route.params;
    const [infoVisible, setInfoVisible] = useState(false);

    const getStatusTheme = (status) => {
        switch (status) {
            case 'Open': return { color: '#3B82F6', text: 'Open Ticket', iconColor: '#DBEAFE' };
            case 'In Review': return { color: '#F59E0B', text: 'Being Reviewed', iconColor: '#FEF3C7' };
            case 'Resolved': return { color: '#10B981', text: 'Resolved', iconColor: '#D1FAE5' };
            case 'Closed': return { color: '#64748B', text: 'Closed', iconColor: '#F1F5F9' };
            default: return { color: '#94A3B8', text: 'Pending', iconColor: '#F8FAFC' };
        }
    };

    const statusTheme = getStatusTheme(ticket.status);
    const imageUri = ticket.attachment
        ? `${API_BASE_URL.replace('/api', '')}${ticket.attachment}`
        : null;

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
                    <Text className="text-[10px] font-black text-slate-400 tracking-[2px]">Ticket Status</Text>
                    <View className="flex-row items-center mt-0.5">
                        <View style={{ backgroundColor: statusTheme.color }} className="w-1.5 h-1.5 rounded-full mr-2" />
                        <Text style={{ color: statusTheme.color }} className="text-xs font-black tracking-widest">{ticket.status}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setInfoVisible(true)}
                    className="w-12 h-12 items-center justify-center bg-slate-50 rounded-2xl"
                >
                    <Info size={20} color="#0F172A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Hero Status Card */}
                <View className="mx-6 mt-8 p-10 rounded-[48px] items-center justify-center relative overflow-hidden" style={{ backgroundColor: statusTheme.color }}>
                    {/* Decorative background shapes */}
                    <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5" />

                    <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center mb-6 backdrop-blur-md">
                        <MessageSquare size={36} color="white" strokeWidth={2.5} />
                    </View>

                    <Text className="text-white text-3xl font-black text-center tracking-tight leading-8">
                        {statusTheme.text}
                    </Text>
                    <Text className="text-white/70 text-sm font-bold mt-2">ID: {ticket.ticketId}</Text>
                </View>

                {/* Quick Info Grid - Modern Glass Style */}
                <View className="flex-row px-6 mt-6 justify-between">
                    <View className="bg-slate-50 w-[48%] p-5 rounded-[32px] items-center">
                        <Calendar size={20} color="#64748B" />
                        <Text className="text-[9px] font-black text-slate-400 mt-3 mb-1">Date</Text>
                        <Text className="text-[11px] font-black text-primary">{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View className="bg-slate-50 w-[48%] p-5 rounded-[32px] items-center">
                        <Layers size={20} color="#64748B" />
                        <Text className="text-[9px] font-black text-slate-400 mt-3 mb-1">Category</Text>
                        <Text className="text-[11px] font-black text-primary" numberOfLines={1}>{ticket.category}</Text>
                    </View>
                </View>

                {/* Subject & Description - Premium Typography */}
                <View className="px-8 mt-10">
                    <Text className="text-[11px] font-black text-slate-400 tracking-[2px] mb-4">Subject</Text>
                    <Text className="text-xl font-black text-primary leading-8 mb-8">
                        {ticket.subject}
                    </Text>

                    <Text className="text-[11px] font-black text-slate-400 tracking-[2px] mb-4">Description</Text>
                    <View className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
                        <Text className="text-slate-500 text-base font-bold leading-relaxed">
                            {ticket.description}
                        </Text>
                    </View>
                </View>

                {/* Attachment - High Impact View */}
                {imageUri && (
                    <View className="px-6 mt-10">
                        <View className="mb-6 px-2">
                            <Text className="text-[11px] font-black text-slate-400 tracking-[2px]">Attachment</Text>
                        </View>

                        <View className="rounded-[48px] overflow-hidden border-4 border-slate-50 shadow-2xl shadow-black/10">
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: width - 48 }}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Custom Info Popup Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={infoVisible}
                onRequestClose={() => setInfoVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40 px-6">
                    <Pressable className="absolute inset-0" onPress={() => setInfoVisible(false)} />

                    <View className="bg-white w-[90%] rounded-[48px] p-10 items-center shadow-2xl">
                        <View className="w-24 h-24 bg-blue-50 rounded-[32px] items-center justify-center mb-8">
                            <ShieldCheck size={48} color="#3B82F6" strokeWidth={2.5} />
                        </View>

                        <Text className="text-2xl font-black text-primary text-center leading-tight mb-4">
                            Your Ticket is{"\n"}under Review
                        </Text>

                        <Text className="text-slate-400 font-bold text-sm text-center leading-relaxed mb-10 px-2">
                            Our support experts are carefully analyzing your request to provide the best possible solution.
                        </Text>

                        {/* Timeline Item */}
                        <View className="w-full bg-slate-50 rounded-[32px] p-6 flex-row items-center mb-10">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                                <Clock size={20} color="#3B82F6" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] font-black text-slate-400 tracking-widest mb-1">EXPECTED RESPONSE</Text>
                                <Text className="text-sm font-black text-primary">Within 24 to 48 hours</Text>
                            </View>
                        </View>

                        <CustomButton
                            title="Understood"
                            onPress={() => setInfoVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default TicketDetailsScreen;
