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
    StyleSheet,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, MapPin, Store, Sparkles, CheckCircle2, ChevronRight, Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import FloatingInput from '../components/FloatingInput';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { API_BASE_URL } from '../config';
import { colors } from '../theme/colors';

const EditStoreScreen = ({ navigation, route }) => {
    const { vendorData } = route.params || {};

    const [formData, setFormData] = useState({
        storeName: vendorData?.storeName || '',
        storeAddress: vendorData?.storeAddress || '',
    });
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dynamic base URL for static files
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

    const handlePickLogo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "We need your permission to access photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLogo(result.assets[0]);
        }
    };

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

            const uploadData = new FormData();
            uploadData.append('storeName', formData.storeName);
            uploadData.append('storeAddress', formData.storeAddress);

            if (logo) {
                const filename = logo.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                uploadData.append('profileImage', {
                    uri: Platform.OS === 'ios' ? logo.uri.replace('file://', '') : logo.uri,
                    name: filename,
                    type
                });
            }

            const response = await fetch(`${API_BASE_URL}/vendor/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
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

    const logoSource = logo
        ? { uri: logo.uri }
        : vendorData?.storeImage
            ? { uri: `${STATIC_BASE_URL}${vendorData.storeImage}` }
            : null;

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
                    {/* Brand Banner */}
                    <LinearGradient
                        colors={[colors.primary, '#004D40']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={Platform.OS === 'ios' ? { paddingBottom: 110, paddingTop: 40, alignItems: 'center' } : {}}
                        className={`px-8 items-center ${Platform.OS === 'ios' ? '' : 'pt-10 pb-20'}`}
                    >
                        <TouchableOpacity
                            onPress={handlePickLogo}
                            activeOpacity={0.9}
                            className="w-24 h-24 bg-white rounded-[32px] items-center justify-center shadow-2xl mb-4 overflow-hidden relative"
                        >
                            {logoSource ? (
                                <Image source={logoSource} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <Store size={40} color={colors.primary} strokeWidth={2} />
                            )}
                            <View className="absolute bottom-0 right-0 left-0 bg-black/30 py-1 items-center">
                                <Camera size={14} color="white" strokeWidth={2.5} />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-white font-black text-2xl tracking-tighter text-center">Edit Brand Identity</Text>
                        <Text className="text-white/60 text-[11px] font-black tracking-[3px] mt-1 text-center">Management Hub</Text>
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
                                    <Text className="text-[10px] font-black text-primary tracking-[2px] ml-3">Business Name</Text>
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
                                    <Text className="text-[10px] font-black text-secondary tracking-[2px] ml-3">Physical Address</Text>
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
                                            <Text className="text-white font-black text-sm tracking-[3px] mr-3">Publish Changes</Text>
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
                            <Text className="text-success font-black text-[9px] tracking-widest ml-2">Updates Reflected In Real-Time</Text>
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
