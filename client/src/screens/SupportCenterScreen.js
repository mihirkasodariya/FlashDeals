import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
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
    StyleSheet
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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const SupportCenterScreen = () => {
    const navigation = useNavigation();
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
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
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
            Alert.alert('Error', 'Please fill in all fields');
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
                Alert.alert('Success', 'Support ticket created successfully');
                setIsModalVisible(false);
                setForm({ subject: '', description: '', category: 'General' });
                setImage(null);
                fetchTickets();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create ticket');
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
                    <Text className="text-[10px] font-black text-slate-400 tracking-[2px]">Help Center</Text>
                    <Text className="text-sm font-black text-primary mt-0.5">Contact Support</Text>
                </View>
                <TouchableOpacity
                    onPress={fetchTickets}
                    className="w-12 h-12 items-center justify-center bg-slate-50 rounded-2xl"
                >
                    <RefreshCw size={20} color="#0F172A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Hero Support Card */}
                <View className="mx-6 mt-8 p-10 rounded-[48px] items-center justify-center relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
                    {/* Decorative background shapes */}
                    <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                    <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5" />

                    <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center mb-6 backdrop-blur-md">
                        <Headphones size={36} color="white" strokeWidth={2.5} />
                    </View>

                    <Text className="text-white text-3xl font-black text-center tracking-tight leading-8">
                        How can we{"\n"}help you?
                    </Text>
                    <Text className="text-white/60 text-xs font-bold text-center mt-3 px-10">
                        Our experts are ready to assist you. Start a new ticket or contact us via email.
                    </Text>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        className="mt-8 bg-white px-8 py-4 rounded-2xl shadow-xl shadow-black/10 flex-row items-center"
                    >
                        <Plus size={18} color={colors.primary} strokeWidth={3} />
                        <Text className="text-primary font-black text-sm ml-2">New Ticket</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Contact Actions */}
                <View className="px-6 mt-8 flex-row justify-between">
                    <TouchableOpacity
                        onPress={() => Linking.openURL('mailto:support@flashdeals.com')}
                        className="bg-slate-50 w-[48%] p-6 rounded-[32px] items-center justify-center border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-blue-100 rounded-2x items-center justify-center mb-3">
                            <Mail size={22} color="#3B82F6" strokeWidth={2.5} />
                        </View>
                        <Text className="text-[11px] font-black text-primary">Email Support</Text>
                        <Text className="text-[9px] font-bold text-slate-400 mt-1">24h response</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('PrivacyCenter', { expandPolicy: 'support' })}
                        className="bg-slate-50 w-[48%] p-6 rounded-[32px] items-center justify-center border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-purple-100 rounded-2x items-center justify-center mb-3">
                            <Shield size={22} color="#8B5CF6" strokeWidth={2.5} />
                        </View>
                        <Text className="text-[11px] font-black text-primary">Support Policy</Text>
                        <Text className="text-[9px] font-bold text-slate-400 mt-1">Read guidelines</Text>
                    </TouchableOpacity>
                </View>

                {/* Ticket History Section */}
                <View className="px-8 mt-12">
                    <View className="flex-row items-center justify-between mb-8">
                        <View>
                            <Text className="text-[11px] font-black text-slate-400 tracking-[2px] mb-1">Ticket history</Text>
                            <Text className="text-base font-black text-primary">Your active requests</Text>
                        </View>
                        <View className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <Text className="text-[10px] font-black text-primary">{tickets.length} Total</Text>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={colors.primary} size="large" className="my-10" />
                    ) : tickets.map((ticket, index) => (
                        <TouchableOpacity
                            key={ticket._id || index}
                            onPress={() => navigation.navigate('TicketDetails', { ticket })}
                            className="bg-white p-6 rounded-[32px] mb-6 border border-slate-100 shadow-sm shadow-slate-200/20"
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-slate-50 rounded-xl items-center justify-center mr-3">
                                        <History size={14} color="#64748B" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-[10px] font-black text-slate-400 tracking-widest">{ticket.ticketId}</Text>
                                </View>
                                <View
                                    style={{ backgroundColor: `${getStatusColor(ticket.status)}15` }}
                                    className="px-3 py-1.5 rounded-full"
                                >
                                    <Text style={{ color: getStatusColor(ticket.status) }} className="text-[9px] font-black tracking-widest">
                                        {ticket.status}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-base font-black text-primary leading-tight mb-4" numberOfLines={1}>
                                {ticket.subject}
                            </Text>

                            <View className="h-[1px] bg-slate-50 mb-4" />

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Clock size={12} color="#94A3B8" />
                                    <Text className="text-[10px] font-bold text-slate-400 ml-1.5">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-[10px] font-black text-primary mr-2 italic">{ticket.category}</Text>
                                    <ChevronRight size={14} color="#CBD5E1" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {!loading && tickets.length === 0 && (
                        <View className="bg-slate-50/50 rounded-[40px] p-12 items-center border border-dashed border-slate-200">
                            <View className="w-16 h-16 bg-white rounded-[24px] items-center justify-center shadow-sm mb-6">
                                <AlertCircle size={32} color="#CBD5E1" />
                            </View>
                            <Text className="text-primary font-black text-sm">No active tickets</Text>
                            <Text className="text-slate-400 font-bold text-xs mt-2 text-center">
                                Need help? Start a new support ticket above.
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
                        <View className="bg-white rounded-t-[48px] shadow-2xl overflow-hidden">
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={{ padding: 32, paddingBottom: 40 }}
                            >
                                <View className="flex-row items-center justify-between mb-8">
                                    <View>
                                        <Text className="text-[10px] font-black text-slate-400 tracking-[2px] mb-1">Support Request</Text>
                                        <Text className="text-2xl font-black text-primary">New Ticket</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setIsModalVisible(false)}
                                        className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center"
                                    >
                                        <X size={20} color="#0F172A" />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-[10px] font-black text-slate-400 tracking-widest mb-3 ml-2">Category</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-8"
                                    contentContainerStyle={{ paddingLeft: 4 }}
                                >
                                    {['General', 'Technical', 'Billing', 'Verification', 'Other'].map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setForm(prev => ({ ...prev, category: cat }))}
                                            className={`px-6 py-4 rounded-2xl mr-3 border-2 ${form.category === cat ? 'bg-primary border-primary' : 'bg-slate-50 border-slate-50'}`}
                                        >
                                            <Text className={`text-xs font-black ${form.category === cat ? 'text-white' : 'text-slate-400'}`}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Text className="text-[10px] font-black text-slate-400 tracking-widest mb-3 ml-2">Subject</Text>
                                <TextInput
                                    className="bg-slate-50 rounded-2xl px-6 py-5 mb-8 font-bold text-primary border border-slate-100"
                                    placeholder="Briefly describe the issue"
                                    placeholderTextColor="#CBD5E1"
                                    value={form.subject}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, subject: text }))}
                                />

                                <Text className="text-[10px] font-black text-slate-400 tracking-widest mb-3 ml-2">Description</Text>
                                <TextInput
                                    className="bg-slate-50 rounded-[32px] px-6 py-6 mb-8 font-bold text-primary border border-slate-100 h-40"
                                    placeholder="Provide details about your request..."
                                    placeholderTextColor="#CBD5E1"
                                    multiline
                                    textAlignVertical="top"
                                    value={form.description}
                                    onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                                />

                                <View className="flex-row items-center justify-between mb-4 ml-2">
                                    <Text className="text-[10px] font-black text-slate-400 tracking-widest">Attachment</Text>
                                    <Text className="text-[9px] font-bold text-slate-300 tracking-tight">Optional</Text>
                                </View>
                                <View className="mb-10">
                                    {!image ? (
                                        <TouchableOpacity
                                            onPress={pickImage}
                                            className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[40px] p-10 items-center justify-center"
                                        >
                                            <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mb-4">
                                                <Camera size={26} color={colors.primary} />
                                            </View>
                                            <Text className="text-slate-400 font-bold text-xs">Add photo or screenshot</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View className="relative">
                                            <View className="bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 h-56">
                                                <Image
                                                    source={{ uri: image }}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setImage(null)}
                                                className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full items-center justify-center shadow-2xl border border-slate-50"
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
                                            <Text className="text-white font-black text-base tracking-widest ml-3">Submit Request</Text>
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
