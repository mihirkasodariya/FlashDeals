import React, { useState } from 'react';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
    LayoutAnimation,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ShieldCheck,
    Lock,
    FileText,
    Info,
    Shield,
    ChevronDown,
    Zap,
    EyeOff,
    CheckCircle2,
    Headphones
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const PrivacyCenterScreen = ({ navigation, route }) => {
    const { colors, isDarkMode } = useTheme();
    const scrollViewRef = React.useRef(null);
    const [expandedPolicy, setExpandedPolicy] = useState(null);
    const [itemPositions, setItemPositions] = useState({});

    React.useEffect(() => {
        if (route.params?.expandPolicy) {
            const policyId = route.params.expandPolicy;
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpandedPolicy(policyId);

            // Wait for positions to be captured and layout to settle
            setTimeout(() => {
                if (itemPositions[policyId] !== undefined && scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({
                        y: itemPositions[policyId] + 350, // 350 offset for hero section
                        animated: true
                    });
                }
            }, 500);
        }
    }, [route.params?.expandPolicy, itemPositions]);

    const togglePolicy = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedPolicy(expandedPolicy === id ? null : id);
    };

    const policies = [
        {
            id: 'privacy',
            title: 'Privacy Policy',
            icon: Shield,
            color: '#3B82F6',
            content: 'We collect minimal data necessary for deal synchronization. This includes your storefront location, business hours, and offer history. We do not track your personal activities outside the app.'
        },
        {
            id: 'terms',
            title: 'Terms of Service',
            icon: FileText,
            color: '#8B5CF6',
            content: 'By using FlashDeals, you agree to provide accurate business information. Offers must be genuine and active during the specified timeframes.'
        },
        {
            id: 'data',
            title: 'Data Protection & Usage',
            icon: Lock,
            color: '#10B981',
            content: 'Your business data is stored on secure cloud servers with restricted access. We use this data only to connect local customers with your deals.'
        },
        {
            id: 'cookies',
            title: 'Cookie & Tracking Policy',
            icon: Zap,
            color: '#F59E0B',
            content: 'We use local identifiers to keep you logged in and remember your preferences. No third-party tracking scripts are used for advertising.'
        },
        {
            id: 'deletion',
            title: 'Data Deletion Policy',
            icon: EyeOff,
            color: '#EF4444',
            content: 'You have the right to request permanent deletion of your account. Once requested, all your merchant data is purged from our systems within 48 hours.'
        },
        {
            id: 'support',
            title: 'Support Policy',
            icon: Headphones,
            color: '#6366F1',
            content: 'Our dedicated support team is available to assist with technical integration and merchant disputes. We guarantee a response to critical tickets within 60 minutes.'
        }
    ];

    return (
        <SafeAreaView style={{ backgroundColor: isDarkMode ? colors.background : '#FDFDFF' }} className="flex-1" edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? colors.background : '#FDFDFF'} />

            {/* Header */}
            <View style={{ backgroundColor: isDarkMode ? colors.card : '#FFFFFF', borderBottomColor: colors.border }} className="px-6 py-5 flex-row items-center justify-between border-b shadow-sm">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: isDarkMode ? colors.surface : '#F8FAFC', borderColor: colors.border }}
                    className="w-11 h-11 items-center justify-center rounded-2xl border"
                >
                    <ChevronLeft size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="text-lg font-black tracking-tight">Privacy Center</Text>
                <View className="w-11" />
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Security Guarantee Banner */}
                <View className="px-6 mt-8">
                    <View style={{ backgroundColor: colors.primary }} className="p-8 rounded-[40px] relative overflow-hidden shadow-2xl shadow-black/20">
                        {/* Decorative background circle */}
                        <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />

                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                                <ShieldCheck size={28} color="white" />
                            </View>
                            <Text className="ml-4 text-white font-black text-xl tracking-tight">Security Guarantee</Text>
                        </View>

                        <Text style={{ color: '#FFFFFF' }} className="text-white font-bold text-lg leading-relaxed">
                            All your data is safe and secure with us. We use advanced encryption protocols to protect every piece of your information.
                        </Text>

                        <View className="flex-row items-center mt-6 bg-white/10 self-start px-4 py-2 rounded-full border border-white/20">
                            <CheckCircle2 size={14} color="#4ADE80" strokeWidth={3} />
                            <Text style={{ color: '#FFFFFF' }} className="text-white/90 text-[10px] font-black tracking-widest ml-2 uppercase">Verified Protection</Text>
                        </View>
                    </View>
                </View>

                {/* Policy List Title */}
                <View className="px-6 mt-12 mb-6">
                    <Text style={{ color: colors.secondary }} className="text-[10px] font-black tracking-[3px] uppercase">Legal Hub</Text>
                    <Text style={{ color: colors.text }} className="text-2xl font-black mt-2">Security & Privacy</Text>
                </View>

                {/* Interactive Policy Cards */}
                <View className="px-6">
                    {policies.map((policy) => (
                        <TouchableOpacity
                            key={policy.id}
                            activeOpacity={0.7}
                            onLayout={(event) => {
                                const { y } = event.nativeEvent.layout;
                                setItemPositions(prev => ({ ...prev, [policy.id]: y }));
                            }}
                            onPress={() => togglePolicy(policy.id)}
                            style={{
                                backgroundColor: colors.card,
                                borderColor: expandedPolicy === policy.id ? colors.primary + '40' : colors.border
                            }}
                            className="rounded-[32px] p-6 mb-4 border shadow-sm"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        style={{ backgroundColor: `${policy.color}15` }}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <policy.icon size={22} color={policy.color} strokeWidth={2.5} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-base font-black tracking-tight">{policy.title}</Text>
                                </View>
                                <View
                                    style={{ backgroundColor: expandedPolicy === policy.id ? colors.primary : colors.surface }}
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                >
                                    <ChevronDown
                                        size={16}
                                        color={expandedPolicy === policy.id ? 'white' : colors.textSecondary}
                                        style={{ transform: [{ rotate: expandedPolicy === policy.id ? '180deg' : '0deg' }] }}
                                    />
                                </View>
                            </View>

                            {expandedPolicy === policy.id && (
                                <View style={{ borderTopColor: isDarkMode ? '#ffffff10' : '#00000005' }} className="mt-6 pt-6 border-t">
                                    <Text style={{ color: colors.textSecondary }} className="text-sm font-bold leading-relaxed opacity-80">
                                        {policy.content}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Transparency Summary */}
                <View style={{ backgroundColor: isDarkMode ? colors.card + '50' : '#F8FAFF', borderColor: colors.border }} className="mx-6 mt-8 p-10 rounded-[48px] border items-center">
                    <View style={{ backgroundColor: colors.card }} className="w-16 h-16 rounded-3xl items-center justify-center mb-6 shadow-sm shadow-blue-200">
                        <Info size={28} color={colors.secondary} strokeWidth={2.5} />
                    </View>
                    <Text style={{ color: colors.text }} className="font-black text-center text-xl tracking-tight">Zero-Leaking Protocol</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-center text-[13px] font-bold mt-3 leading-relaxed px-2 opacity-60">
                        Your trust is built on our commitment to transparency. We do not share merchant data with any third-party aggregators.
                    </Text>

                    <View style={{ backgroundColor: colors.border }} className="h-[1px] w-full my-8 opacity-30" />

                    <Text style={{ color: colors.textSecondary }} className="font-extrabold text-[9px] tracking-[3px] uppercase opacity-30">FlashDeals Trust Engine</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyCenterScreen;
