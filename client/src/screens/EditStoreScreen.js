import React, { useState } from 'react';
import Text from '../components/CustomText';
import {
    View,
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
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';

const EditStoreScreen = ({ navigation, route }) => {
    const { colors, isDarkMode } = useTheme();
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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            {/* Header */}
            {/* Header like Register */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="text-lg font-bold">Store Profile</Text>
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 15, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center mb-10 mt-4">
                        <TouchableOpacity
                            onPress={handlePickLogo}
                            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                            className="w-28 h-28 rounded-[32px] border-2 border-dashed items-center justify-center overflow-hidden"
                        >
                            {logoSource ? (
                                <Image
                                    source={logoSource}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="items-center">
                                    <Store size={40} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                                </View>
                            )}
                            <View style={{ backgroundColor: colors.primary }} className="absolute bottom-0 left-0 right-0 py-1.5 items-center">
                                <Text className="text-[8px] font-black text-white tracking-widest uppercase">Change Logo</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={{ color: colors.textSecondary }} className="mt-4 font-bold text-xs uppercase tracking-widest opacity-60">Update Store Identity</Text>
                    </View>


                    <View className="space-y-6">
                        <FloatingInput
                            label="Legal Store Name"
                            value={formData.storeName}
                            onChangeText={(val) => setFormData({ ...formData, storeName: val })}
                        />

                        <View className="mt-4">
                            <AddressAutocomplete
                                label="Physical Address"
                                placeholder="Verify your store location"
                                value={formData.storeAddress}
                                onChangeText={(val) => setFormData({ ...formData, storeAddress: val })}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handleUpdate}
                            disabled={loading}
                            className="mt-6"
                        >
                            <LinearGradient
                                colors={[colors.primary, isDarkMode ? '#4bb2f9' : '#004D40']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <View className="flex-row items-center justify-center">
                                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-[3px] mr-3">Publish Changes</Text>
                                        <ChevronRight size={18} color="white" strokeWidth={3} />
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-12 items-center">
                        <View style={{ backgroundColor: isDarkMode ? `${colors.success}20` : `${colors.success}10`, borderColor: `${colors.success}33` }} className="flex-row items-center px-5 py-3 rounded-2xl border">
                            <Sparkles size={16} color={colors.success} />
                            <Text style={{ color: isDarkMode ? colors.text : colors.success }} className="font-black text-[10px] tracking-widest ml-3">Real-Time Sync Active</Text>
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
    gradientButton: {
        paddingVertical: 18,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    }
});

export default EditStoreScreen;
