import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, MapPin, Store } from 'lucide-react-native';
import FloatingInput from '../components/FloatingInput';
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
            // Priority given to _id as it comes from MongoDB
            const userId = vendorData?._id || vendorData?.userId || '65dad723924372001c8a1234';

            const response = await fetch(`${API_BASE_URL}/vendor/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-surface">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-primary">Edit Store Details</Text>
                <TouchableOpacity onPress={handleUpdate} disabled={loading}>
                    <Text className={`font-bold ${loading ? 'text-gray-400' : 'text-secondary'}`}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 30, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-surface rounded-2xl items-center justify-center border border-border">
                            <Store size={40} color={colors.secondary} />
                        </View>
                        <Text className="mt-4 text-primary font-bold text-lg">Your Business Identity</Text>
                        <Text className="text-xs text-textSecondary text-center px-6 mt-1">
                            These details are visible to users when they view your offers.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-textSecondary uppercase tracking-widest mb-4">Basic Info</Text>
                        <FloatingInput
                            label="Store / Shop Name"
                            value={formData.storeName}
                            onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                        />
                    </View>

                    <View className="mb-8">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm font-bold text-textSecondary uppercase tracking-widest">Location Info</Text>
                            <TouchableOpacity className="flex-row items-center">
                                <MapPin size={14} color={colors.secondary} />
                                <Text className="text-secondary text-xs font-bold ml-1">Pin on Map</Text>
                            </TouchableOpacity>
                        </View>
                        <FloatingInput
                            label="Full Store Address"
                            value={formData.storeAddress}
                            onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                            multiline={true}
                        />
                    </View>

                    <CustomButton
                        title="Update Store Details"
                        onPress={handleUpdate}
                        loading={loading}
                    />

                    <Text className="text-center text-[10px] text-textSecondary mt-6 leading-4">
                        Note: Significant changes to store name may require a quick re-verification by our team.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditStoreScreen;
