import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from '../components/CustomText';
import {
    View,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';

const ActivationStatusScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const steps = [
        { title: t('activation_status.step1_title'), status: 'completed', desc: t('activation_status.step1_desc') },
        { title: t('activation_status.step2_title'), status: 'active', desc: t('activation_status.step2_desc') },
        { title: t('activation_status.step3_title'), status: 'pending', desc: t('activation_status.step3_desc') },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 }}>
            <View className="items-center mt-14 mb-10">
                <ShieldCheck size={40} color={colors.primary} />
                <Text style={{ color: colors.text }} className="text-2xl font-bold mt-4 mb-2">{t('activation_status.reg_pending')}</Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm text-center leading-tight">{t('activation_status.thank_you')}</Text>
            </View>

            <View className="pl-2.5">
                {steps.map((step, index) => (
                    <View key={index} className="flex-row h-20">
                        <View className="items-center mr-5">
                            <View className={`w-7 h-7 rounded-full bg-surface border-2 border-gray-200 justify-center items-center z-1 ${step.status === 'completed' ? 'bg-primary border-primary' :
                                step.status === 'active' ? 'bg-secondary border-secondary' : ''
                                }`}>
                                {step.status === 'completed' ? (
                                    <CheckCircle2 size={16} color="#FFFFFF" />
                                ) : step.status === 'active' ? (
                                    <Clock size={16} color="#FFFFFF" />
                                ) : null}
                            </View>
                            {index < steps.length - 1 && (
                                <View className={`w-[2px] flex-1 bg-gray-200 -mt-[2px] -mb-[2px] ${step.status === 'completed' ? 'bg-primary' : ''}`} />
                            )}
                        </View>
                        <View className="flex-1 pt-0.5">
                            <Text style={{ color: step.status === 'pending' ? colors.textSecondary : colors.text }} className={`text-base font-bold`}>{step.title}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-[13px] mt-1">{step.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ backgroundColor: `${colors.accent}1A` }} className="flex-row p-4 rounded-xl mt-10 items-center">
                <Clock size={20} color={colors.accent} />
                <View className="ml-3">
                    <Text style={{ color: colors.accent }} className="text-sm font-bold">{t('activation_status.estimated_time')}</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-[12px] mt-0.5">{t('activation_status.estimated_desc')}</Text>
                </View>
            </View>

            <View className="mt-auto mb-10">
                <CustomButton
                    title={t('activation_status.return_home')}
                    onPress={() => navigation.navigate('Login')}
                    variant="outline"
                />
                <TouchableOpacity className="items-center mt-4" onPress={() => navigation.navigate('SupportCenter')}>
                    <Text style={{ color: colors.textSecondary }} className="underline text-sm">{t('profile.support_center')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ActivationStatusScreen;
