import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
    LayoutAnimation
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
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const PrivacyCenterScreen = ({ navigation, route }) => {
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
        <SafeAreaView className="flex-1 bg-[#FDFDFF]" edges={['top']}>
            {/* Glossy Header */}
            <View className="px-6 py-5 flex-row items-center justify-between bg-white border-b border-slate-100 shadow-sm shadow-slate-200/20">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-11 h-11 items-center justify-center bg-slate-50 rounded-2xl border border-slate-100"
                >
                    <ChevronLeft size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-lg font-black text-primary tracking-tight">Privacy Center</Text>
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
                    <View className="bg-primary p-8 rounded-[40px] relative overflow-hidden shadow-2xl shadow-primary/30">
                        {/* Decorative background circle */}
                        <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />

                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                                <ShieldCheck size={28} color="white" />
                            </View>
                            <Text className="ml-4 text-white font-black text-xl tracking-tight">Security Guarantee</Text>
                        </View>

                        <Text className="text-white font-bold text-lg leading-relaxed">
                            All your data is safe and secure with us. We use advanced encryption protocols to protect every piece of your information.
                        </Text>

                        <View className="flex-row items-center mt-6 bg-white/10 self-start px-4 py-2 rounded-full border border-white/20">
                            <CheckCircle2 size={14} color="#4ADE80" strokeWidth={3} />
                            <Text className="text-white/90 text-[10px] font-black tracking-widest ml-2">Verified Protection</Text>
                        </View>
                    </View>
                </View>

                {/* Policy List Title */}
                <View className="px-6 mt-12 mb-6">
                    <Text className="text-[10px] font-black text-slate-400 tracking-[1px]">Legal Hub</Text>
                    <Text className="text-2xl font-black text-primary mt-2">Security & Privacy</Text>
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
                            className={`bg-white rounded-[32px] p-6 mb-4 border border-slate-100 shadow-sm ${expandedPolicy === policy.id ? 'border-primary/20' : ''}`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        style={{ backgroundColor: `${policy.color}15` }}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <policy.icon size={22} color={policy.color} strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-base font-black text-primary tracking-tight">{policy.title}</Text>
                                </View>
                                <View
                                    className={`w-8 h-8 rounded-full items-center justify-center ${expandedPolicy === policy.id ? 'bg-primary' : 'bg-slate-50'}`}
                                >
                                    <ChevronDown
                                        size={16}
                                        color={expandedPolicy === policy.id ? 'white' : '#94A3B8'}
                                        style={{ transform: [{ rotate: expandedPolicy === policy.id ? '180deg' : '0deg' }] }}
                                    />
                                </View>
                            </View>

                            {expandedPolicy === policy.id && (
                                <View className="mt-6 pt-6 border-t border-slate-50">
                                    <Text className="text-slate-500 text-sm font-bold leading-relaxed">
                                        {policy.content}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Transparency Summary */}
                <View className="mx-6 mt-8 p-10 bg-[#F8FAFF] rounded-[48px] border border-blue-50 items-center">
                    <View className="w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 shadow-sm shadow-blue-200">
                        <Info size={28} color={colors.secondary} strokeWidth={2.5} />
                    </View>
                    <Text className="text-primary font-black text-center text-xl tracking-tight">Zero-Leaking Protocol</Text>
                    <Text className="text-slate-400 text-center text-[13px] font-bold mt-3 leading-relaxed px-2">
                        Your trust is built on our commitment to transparency. We do not share merchant data with any third-party aggregators.
                    </Text>

                    <View className="h-[1px] w-full bg-slate-200/50 my-8" />

                    <Text className="text-slate-300 font-extrabold text-[9px] tracking-[2px]">FlashDeals Trust Engine</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyCenterScreen;
