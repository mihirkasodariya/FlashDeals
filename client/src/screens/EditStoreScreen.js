import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, MapPin, Store, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from '../components/FloatingInput';
import AddressAutocomplete from '../components/AddressAutocomplete';
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
                Alert.alert("Updated!", "Your store profile has been refreshed.", [
                    { text: "Perfect", onPress: () => navigation.goBack() }
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
        <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-surface/30">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    className="w-10 h-10 bg-[#F8FAFC] rounded-full items-center justify-center border border-surface/50"
                >
                    <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-lg font-black text-primary tracking-tight">Store Profile</Text>
                </View>
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Brand Banner - Centered for iPhone */}
                    <LinearGradient
                        colors={[colors.primary, '#004D40']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={Platform.OS === 'ios' ? { paddingBottom: 110, paddingTop: 40, alignItems: 'center' } : {}}
                        className={`px-8 items-center ${Platform.OS === 'ios' ? '' : 'pt-10 pb-20'}`}
                    >
                        <View className="w-20 h-20 bg-white rounded-[28px] items-center justify-center shadow-2xl mb-4">
                            <Store size={40} color={colors.primary} strokeWidth={2} />
                        </View>
                        <Text className="text-white font-black text-2xl tracking-tighter text-center">Edit Brand Identity</Text>
                        <Text className="text-white/60 text-[11px] font-black uppercase tracking-[3px] mt-1 text-center">Management Hub</Text>
                    </LinearGradient>

                    {/* Integrated Form Card */}
                    <View
                        style={[styles.formCard, Platform.OS === 'ios' ? { marginTop: -50 } : { marginTop: -40 }]}
                        className="mx-6 bg-white rounded-[40px] p-8 border border-surface/50 shadow-xl"
                    >
                        <View className="space-y-8">
                            <View>
                                <View className="flex-row items-center mb-4 ml-1">
                                    <View className="w-6 h-6 bg-primary/5 rounded-full items-center justify-center">
                                        <CheckCircle2 size={12} color={colors.primary} strokeWidth={3} />
                                    </View>
                                    <Text className="text-[10px] font-black text-primary uppercase tracking-[2px] ml-3">Business Name</Text>
                                </View>
                                <FloatingInput
                                    label="Legal Store Name"
                                    value={formData.storeName}
                                    onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                                />
                            </View>

                            <View className="mt-6">
                                <View className="flex-row items-center mb-4 ml-1">
                                    <View className="w-6 h-6 bg-secondary/5 rounded-full items-center justify-center">
                                        <MapPin size={12} color={colors.secondary} strokeWidth={3} />
                                    </View>
                                    <Text className="text-[10px] font-black text-secondary uppercase tracking-[2px] ml-3">Physical Address</Text>
                                </View>
                                <AddressAutocomplete
                                    label=""
                                    placeholder="Verify your store location"
                                    value={formData.storeAddress}
                                    onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleUpdate}
                                disabled={loading}
                                style={styles.shadowButton}
                                className="mt-10"
                            >
                                <LinearGradient
                                    colors={[colors.primary, '#004D40']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <View className="flex-row items-center justify-center">
                                            <Text className="text-white font-black text-sm uppercase tracking-[3px] mr-3">Publish Changes</Text>
                                            <ChevronRight size={18} color="white" strokeWidth={3} />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-8 items-center px-10">
                        <View className="flex-row items-center bg-success/5 px-4 py-2.5 rounded-2xl border border-success/10">
                            <Sparkles size={14} color={colors.success} fill={colors.success + '20'} />
                            <Text className="text-success font-black text-[9px] uppercase tracking-widest ml-2">Updates reflected in real-time</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    formCard: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    shadowButton: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    gradientButton: {
        paddingVertical: 18,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    }
});

export default EditStoreScreen;
