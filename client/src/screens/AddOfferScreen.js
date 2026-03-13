import React, { useState } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, Calendar, Tag, FileText, Type, Package as LucidePackage, CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomCalendar from '../components/CustomCalendar';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as staticColors } from '../theme/colors';
import { API_BASE_URL } from '../config';

// CATEGORY_KEYS will be fetched dynamically from the backend

const AddOfferScreen = ({ route, navigation }) => {
    const { colors, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { offerToEdit } = route.params || {};
    const isEditing = !!offerToEdit;

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(offerToEdit?.image ? `${API_BASE_URL.replace('/api', '')}${offerToEdit.image}` : null);
    const [title, setTitle] = useState(offerToEdit?.title || '');
    const [description, setDescription] = useState(offerToEdit?.description || '');
    const [categories, setCategories] = useState([]);
    const [categoryKey, setCategoryKey] = useState(
        offerToEdit?.category?._id || offerToEdit?.category || ''
    );

    const fetchCategories = async () => {
        try {
            const resp = await fetch(`${API_BASE_URL}/categories?activeOnly=true`);
            const data = await resp.json();
            if (data.success) {
                setCategories(data.categories);
                
                // If editing and category is a name string, find its ID
                if (offerToEdit && typeof offerToEdit.category === 'string') {
                    const matchedCat = data.categories.find(c => 
                        c.name.toLowerCase() === offerToEdit.category.toLowerCase() ||
                        c._id === offerToEdit.category
                    );
                    if (matchedCat) setCategoryKey(matchedCat._id);
                }

                if (!offerToEdit && data.categories.length > 0 && !categoryKey) {
                    setCategoryKey(data.categories[0]._id);
                }
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    React.useEffect(() => {
        fetchCategories();
    }, []);

    const [startDate, setStartDate] = useState(offerToEdit ? new Date(offerToEdit.startDate) : new Date());
    const [endDate, setEndDate] = useState(offerToEdit ? new Date(offerToEdit.endDate) : new Date(Date.now() + 86400000));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const renderDatePicker = () => {
        return (
            <>
                <CustomCalendar
                    visible={showStartPicker}
                    onClose={() => setShowStartPicker(false)}
                    mode="single"
                    initialDate={startDate}
                    onSelectDate={(date) => {
                        setStartDate(date);
                        if (date > endDate) {
                            setEndDate(new Date(date.getTime() + 86400000));
                        }
                    }}
                />
                <CustomCalendar
                    visible={showEndPicker}
                    onClose={() => setShowEndPicker(false)}
                    mode="single"
                    minDate={startDate}
                    initialDate={endDate}
                    onSelectDate={(date) => {
                        setEndDate(date);
                    }}
                />
            </>
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

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handlePublishOffer = async () => {
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
            formData.append('category', categoryKey); // This is now the categoryId
            formData.append('startDate', startDate.toISOString());
            formData.append('endDate', endDate.toISOString());

            // Only append image if it's a new one (starts with file:// or /Data/)
            if (image.startsWith('file://') || image.startsWith('content://') || !offerToEdit) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('image', {
                    uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
                    name: filename,
                    type
                });
            }

            const url = isEditing
                ? `${API_BASE_URL}/offers/edit/${offerToEdit._id}`
                : `${API_BASE_URL}/offers/add`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setSuccessMsg(isEditing ? t('store.offer_updated') : t('store.offer_added'));
                setShowSuccessModal(true);
            } else {
                Alert.alert(t('common.error'), data.message || t('store.failed_publish_offer'));
            }
        } catch (error) {
            console.error('Publish offer error:', error);
            Alert.alert(t('common.error'), t('common.server_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigation.goBack();
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
                <Text style={{ color: colors.text }} className="ml-4 text-xl font-black">{isEditing ? t('store.edit_offer') : t('store.add_new_offer')}</Text>
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
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat._id}
                                    onPress={() => setCategoryKey(cat._id)}
                                    style={{ backgroundColor: categoryKey === cat._id ? colors.primary : colors.surface }}
                                    className="mr-3 px-6 py-3 rounded-2xl"
                                >
                                    <Text style={{ color: categoryKey === cat._id ? '#FFFFFF' : colors.textSecondary }} className="font-black text-xs">{cat.name}</Text>
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

                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={{ borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }} className="px-6 py-6 border-t">
                <TouchableOpacity
                    onPress={handlePublishOffer}
                    disabled={loading}
                    className="w-full bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-primary/30"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest">{isEditing ? t('store.update_offer') : t('store.publish_offer')}</Text>
                    )}
                </TouchableOpacity>
            </View>
            <Modal transparent visible={showSuccessModal} animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/80 px-8">
                    <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="w-full rounded-[40px] p-8 items-center shadow-2xl">
                        <View style={{ backgroundColor: `${colors.success}15` }} className="w-20 h-20 rounded-[30px] items-center justify-center mb-6">
                            <CheckCircle2 size={40} color={colors.success} strokeWidth={1.5} />
                        </View>
                        <Text style={{ color: colors.text }} className="text-2xl font-black text-center mb-2 tracking-tight">{t('common.success')}</Text>
                        <Text style={{ color: colors.textSecondary }} className="text-center font-bold mb-8 leading-6 opacity-70">{successMsg}</Text>

                        <TouchableOpacity
                            onPress={handleModalClose}
                            style={{ backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC' }}
                            className="w-full py-5 rounded-[24px] flex-row items-center justify-center"
                        >
                            <CheckCircle2 size={16} color={colors.primary} className="mr-2" />
                            <Text style={{ color: colors.primary }} className="font-black text-sm tracking-tight">{t('common.cool') || 'Done'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {renderDatePicker()}
        </SafeAreaView>
    );
};

export default AddOfferScreen;
