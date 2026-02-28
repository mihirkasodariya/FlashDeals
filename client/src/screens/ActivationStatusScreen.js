import React from 'react';
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import { } from '@react-navigation/native';

const ActivationStatusScreen = ({ navigation }) => {
    const steps = [
        { title: 'Application Submitted', status: 'completed', desc: 'Your registration details have been received.' },
        { title: 'Under Review', status: 'active', desc: 'Our team is verifying your documents.' },
        { title: 'Store Activation', status: 'pending', desc: 'Your store will be live shortly.' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="items-center mt-14 mb-10">
                <ShieldCheck size={40} color="#00A49F" />
                <Text className="text-2xl font-bold text-primary mt-4 mb-2">Registration Pending</Text>
                <Text className="text-sm text-gray-500 text-center leading-tight">Thank you for joining FlashDeals! Your vendor account is currently being processed.</Text>
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
                            <Text className={`text-base font-bold ${step.status === 'pending' ? 'text-gray-400' : 'text-primary'}`}>{step.title}</Text>
                            <Text className="text-[13px] text-gray-500 mt-1">{step.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View className="flex-row bg-blue-50 p-4 rounded-xl mt-10 items-center">
                <Clock size={20} color="#3A77FF" />
                <View className="ml-3">
                    <Text className="text-sm font-bold text-accent">Estimated Time</Text>
                    <Text className="text-[12px] text-gray-500 mt-0.5">Account activation usually takes between 24 - 48 hours.</Text>
                </View>
            </View>

            <View className="mt-auto mb-10">
                <CustomButton
                    title="Return To Home"
                    onPress={() => navigation.navigate('Login')}
                    variant="outline"
                />
                <TouchableOpacity className="items-center mt-4">
                    <Text className="text-gray-500 underline text-sm">Contact Support</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ActivationStatusScreen;
