import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, MapPin, Store } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from '../components/FloatingInput';
import AddressAutocomplete from '../components/AddressAutocomplete';
import CustomButton from '../components/CustomButton';

import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../config';
import { colors } from '../theme/colors';

const EditStoreScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { vendorData } = route.params || {};

    const [formData, setFormData] = useState({
        storeName: vendorData?.storeName || '',
        storeAddress: vendorData?.storeAddress || '',
    });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!formData.storeName || !formData.storeAddress) {
            Alert.alert("Error", "Please fill all store details");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert("Error", "Session expired. Please login again.");
                navigation.replace('Login');
                return;
            }

            const userId = vendorData?._id;
            if (!userId) {
                Alert.alert("Error", "User data not found");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/vendor/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                Alert.alert("Success", "Store details updated successfully", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Update Failed", data.message || "Something went wrong");
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Server connection failed");
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FAFAFA]">
            {/* Elegant Header */}
            <View className="bg-white px-6 pb-6 pt-2 shadow-sm flex-row items-center border-b border-surface">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-surface rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                <View className="ml-4">
                    <Text className="text-[10px] font-black text-secondary uppercase tracking-[3px] mb-0.5">Management</Text>
                    <Text className="text-xl font-black text-primary">Edit Store Profile</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="bg-white rounded-[40px] p-8 shadow-sm border border-surface">
                        <View className="items-center mb-10">
                            <View className="w-24 h-24 bg-primary/5 rounded-[32px] items-center justify-center border border-primary/10">
                                <Store size={48} color={colors.primary} strokeWidth={1} />
                            </View>
                            <Text className="mt-6 text-primary font-black text-2xl tracking-tight">Business Hub</Text>
                            <Text className="text-[11px] text-textSecondary text-center px-4 mt-2 font-medium leading-5 opacity-60 uppercase tracking-widest">
                                Brand settings & physical presence
                            </Text>
                        </View>

                        <View className="space-y-8">
                            <View>
                                <Text className="text-[10px] font-black text-textSecondary uppercase tracking-widest mb-3 ml-1 opacity-50">Legal Store Name</Text>
                                <FloatingInput
                                    label="Enter Store Name"
                                    value={formData.storeName}
                                    onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                                />
                            </View>

                            <View className="mt-8">
                                <Text className="text-[10px] font-black text-textSecondary uppercase tracking-widest mb-3 ml-1 opacity-50">Verified Location</Text>
                                <AddressAutocomplete
                                    label="Search Shop Address"
                                    value={formData.storeAddress}
                                    onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                                />
                            </View>

                            <View className="mt-12">
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleUpdate}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={[colors.primary, '#1e293b']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="py-5 rounded-[24px] items-center shadow-lg"
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-black text-sm uppercase tracking-widest">Publish Changes</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View className="mt-10 items-center px-6">
                        <View className="flex-row items-center bg-secondary/10 px-4 py-2 rounded-full">
                            <Save size={12} color={colors.secondary} />
                            <Text className="text-secondary font-black text-[9px] uppercase tracking-widest ml-2">Changes are live instantly</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};


export default EditStoreScreen;
