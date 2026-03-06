import React, { useState } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft, Camera, Calendar, Tag, FileText, Type } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { colors as staticColors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const CATEGORY_KEYS = ['food', 'grocery', 'fashion', 'electronics', 'health', 'other'];

const AddOfferScreen = ({ navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryKey, setCategoryKey] = useState(CATEGORY_KEYS[0]);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const onStartDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
        }
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowEndPicker(false);
        }
        if (selectedDate) setEndDate(selectedDate);
    };

    const renderDatePicker = (show, value, onChange, minDate, onClose) => {
        if (!show) return null;

        if (Platform.OS === 'ios') {
            return (
                <Modal transparent animationType="fade">
                    <View className="flex-1 justify-end bg-black/40">
                        <View style={{ backgroundColor: colors.card }} className="rounded-t-[40px] p-8 pb-12 shadow-2xl">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text style={{ color: colors.text }} className="text-xl font-black text-primary">{t('store.select_date')}</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={{ backgroundColor: `${colors.primary}10` }}
                                    className="px-6 py-2 rounded-xl"
                                >
                                    <Text style={{ color: colors.primary }} className="font-black text-sm">{t('store.done')}</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={value}
                                mode="date"
                                display="inline"
                                onChange={onChange}
                                minimumDate={minDate}
                                themeVariant={isDarkMode ? 'dark' : 'light'}
                                accentColor={colors.primary}
                            />
                        </View>
                    </View>
                </Modal>
            );
        }

        return (
            <DateTimePicker
                value={value}
                mode="date"
                display="default"
                onChange={onChange}
                minimumDate={minDate}
            />
        );
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleAddOffer = async () => {
        if (!title || !description || !image || !startDate || !endDate) {
            Alert.alert(t('common.error'), t('store.fill_all_fields'));
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', categoryKey);
            formData.append('startDate', startDate.toISOString());
            formData.append('endDate', endDate.toISOString());

            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
                name: filename,
                type
            });

            const response = await fetch(`${API_BASE_URL}/offers/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert(t('common.success'), t('store.offer_added'));
                navigation.goBack();
            } else {
                Alert.alert(t('common.error'), data.message || t('store.failed_add_offer'));
            }
        } catch (error) {
            console.error('Add offer error:', error);
            Alert.alert(t('common.error'), t('common.server_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <View style={{ borderBottomColor: colors.border }} className="flex-row items-center px-6 py-4 border-b">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.surface }}
                    className="w-10 h-10 items-center justify-center rounded-xl"
                >
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={{ color: colors.text }} className="ml-4 text-xl font-black">{t('store.add_new_offer')}</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Image Picker */}
                <TouchableOpacity
                    onPress={pickImage}
                    style={{ backgroundColor: colors.card, borderColor: isDarkMode ? `${colors.primary}33` : `${colors.primary}20` }}
                    className="w-full h-56 rounded-[48px] overflow-hidden items-center justify-center border-2 border-dashed"
                >
                    {image ? (
                        <View className="w-full h-full">
                            <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                            <View style={{ backgroundColor: colors.primary }} className="absolute bottom-4 right-4 w-10 h-10 rounded-2xl items-center justify-center shadow-lg">
                                <Camera size={20} color="white" />
                            </View>
                        </View>
                    ) : (
                        <View className="items-center">
                            <View style={{ backgroundColor: `${colors.primary}10` }} className="w-20 h-20 rounded-[32px] items-center justify-center mb-4">
                                <Camera size={36} color={colors.primary} strokeWidth={1.5} />
                            </View>
                            <Text style={{ color: colors.primary }} className="font-black text-xs tracking-widest uppercase opacity-60">{t('store.select_banner')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-1 opacity-40">{t('store.tap_upload')}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="mt-8 space-y-6 pb-20">
                    <View>
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-2 ml-1 uppercase">{t('store.offer_title')}</Text>
                        <View style={{ backgroundColor: colors.surface }} className="flex-row items-center px-4 py-4 rounded-2xl">
                            <Type size={18} color={colors.primary} className="mr-3" />
                            <TextInput
                                style={{ color: colors.text }}
                                className="flex-1 font-bold"
                                placeholder={t('store.title_placeholder')}
                                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    <View className="mt-6">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-2 ml-1 uppercase">{t('store.detail_desc')}</Text>
                        <View style={{ backgroundColor: colors.surface }} className="flex-row items-start px-4 py-4 rounded-2xl min-h-[120px]">
                            <FileText size={18} color={colors.primary} className="mr-3 mt-1" />
                            <TextInput
                                style={{ color: colors.text }}
                                className="flex-1 font-bold"
                                placeholder={t('store.desc_placeholder')}
                                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <View className="mt-6">
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-2 ml-1 uppercase">{t('support.category')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-2">
                            {CATEGORY_KEYS.map(catKey => (
                                <TouchableOpacity
                                    key={catKey}
                                    onPress={() => setCategoryKey(catKey)}
                                    style={{ backgroundColor: categoryKey === catKey ? colors.primary : colors.surface }}
                                    className="mr-3 px-6 py-3 rounded-2xl"
                                >
                                    <Text style={{ color: categoryKey === catKey ? '#FFFFFF' : colors.textSecondary }} className="font-black text-xs">{t(`categories.${catKey}`)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="flex-row gap-4 mt-6">
                        <View className="flex-1">
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-2 ml-1 uppercase">{t('store.start_date')}</Text>
                            <TouchableOpacity
                                onPress={() => setShowStartPicker(true)}
                                style={{ backgroundColor: colors.surface }}
                                className="flex-row items-center px-4 py-4 rounded-2xl"
                            >
                                <Calendar size={18} color={colors.primary} className="mr-3" />
                                <Text style={{ color: colors.text }} className="flex-1 font-black text-sm">
                                    {startDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {renderDatePicker(showStartPicker, startDate, onStartDateChange, new Date(), () => setShowStartPicker(false))}
                        </View>

                        <View className="flex-1">
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest mb-2 ml-1 uppercase">{t('store.end_date')}</Text>
                            <TouchableOpacity
                                onPress={() => setShowEndPicker(true)}
                                style={{ backgroundColor: colors.surface }}
                                className="flex-row items-center px-4 py-4 rounded-2xl"
                            >
                                <Calendar size={18} color={colors.primary} className="mr-3" />
                                <Text style={{ color: colors.text }} className="flex-1 font-black text-sm">
                                    {endDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {renderDatePicker(showEndPicker, endDate, onEndDateChange, startDate, () => setShowEndPicker(false))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={{ borderTopColor: colors.border, backgroundColor: colors.background }} className="px-6 py-6 border-t">
                <TouchableOpacity
                    onPress={handleAddOffer}
                    disabled={loading}
                    className="w-full bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-primary/30"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest">{t('store.publish_offer')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddOfferScreen;
