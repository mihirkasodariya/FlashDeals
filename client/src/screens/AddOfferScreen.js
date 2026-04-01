import React, { useState } from 'react';
import Text from '../components/CustomText';
import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, Modal, Pressable, TouchableWithoutFeedback } from 'react-native';
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
    const [image, setImage] = useState(offerToEdit?.image ? (offerToEdit.image.startsWith('http') ? offerToEdit.image : `${API_BASE_URL.replace('/api', '')}${offerToEdit.image}`) : null);
    const [title, setTitle] = useState(offerToEdit?.title || '');
    const [description, setDescription] = useState(offerToEdit?.description || '');
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
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
    const [endDate, setEndDate] = useState(offerToEdit ? new Date(offerToEdit.endDate) : new Date(Date.now() + 7 * 86400000));
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
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Unsaved Changes Guard
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isEditing) {
                return;
            }
            // Check if ANY field has content
            if (!title && !description && !image) {
                return;
            }

            // If offer is already submitted or we are currently loading, don't show the alert
            if (isSubmitted || loading) {
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Store the action and show custom modal
            setPendingAction(e.data.action);
            setShowDiscardModal(true);
        });

        return unsubscribe;
    }, [navigation, title, description, image, loading, categoryKey, startDate, endDate, isSubmitted]);

    const handlePublishOffer = async (statusOverride = 'active', nextAction = null) => {
        const finalStatus = statusOverride;
        if (finalStatus === 'active' && (!title || !image || !categoryKey || !startDate || !endDate)) {
            Alert.alert(t('common.error'), t('store.fill_all_fields'));
            return;
        }

        // At least one detail is needed for a draft save
        if (finalStatus === 'draft' && (!title && !description && !image)) {
            Alert.alert(t('common.error'), 'Please provide at least one detail (Title, Description, or Image) to save as draft.');
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
            formData.append('status', finalStatus);

            // Only append image if it's a new one (starts with file:// or /Data/)
            if (image && (image.startsWith('file://') || image.startsWith('content://') || !offerToEdit)) {
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
                setIsSubmitted(true); // Bypass guard
                setSuccessMsg(finalStatus === 'draft' ? 'Offer saved to drafts!' : (isEditing ? t('store.offer_updated') : t('store.offer_added')));
                
                // Close modals before navigating
                setShowDiscardModal(false);

                if (nextAction) {
                    // If we came from the Guard, just finish the navigation
                    navigation.dispatch(nextAction);
                } else {
                    setShowSuccessModal(true);
                }
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
        // Reset form after success
        setTitle('');
        setDescription('');
        setImage(null);
        setCategoryKey('');
        setStartDate(new Date());
        setEndDate(new Date(Date.now() + 7 * 86400000));
        setIsSubmitted(false);

        navigation.navigate('Main', { screen: 'Store', params: { screen: 'VendorOffers' } });
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
                            <Text style={{ color: colors.primary }} className="font-black text-[11px] tracking-wider opacity-60">{t('store.select_banner')}</Text>
                            <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold mt-1 opacity-40">{t('store.tap_upload')}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="mt-8 space-y-6 pb-20">
                    <View>
                        <View className="flex-row items-center mb-2 ml-1">
                            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-wider">{t('store.offer_title')}</Text>
                            <Text style={{ color: colors.error }} className="ml-1 text-[12px] font-bold">*</Text>
                        </View>
                        <View style={{ backgroundColor: colors.surface }} className="flex-row items-center px-4 py-4 rounded-2xl">
                            <Type size={18} color={colors.primary} className="mr-3" />
                            <TextInput
                                style={{ color: colors.text }}
                                className="flex-1 font-bold"
                                placeholder={t('store.title_placeholder')}
                                placeholderTextColor={isDarkMode ? '#666' : '#dbdbdbff'}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    <View className="mt-6">
                        <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-wider mb-2 ml-1">{t('store.detail_desc')}</Text>
                        <View style={{ backgroundColor: colors.surface }} className="flex-row items-start px-4 py-4 rounded-2xl min-h-[120px]">
                            <FileText size={18} color={colors.primary} className="mr-3 mt-1" />
                            <TextInput
                                style={{ color: colors.text }}
                                className="flex-1 font-bold"
                                placeholder={t('store.desc_placeholder')}
                                placeholderTextColor={isDarkMode ? '#666' : '#dbdbdbff'}
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <View className="mt-6">
                        <View className="flex-row items-center mb-2 ml-1">
                            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-wider">{t('store.select_category')}</Text>
                            <Text style={{ color: colors.error }} className="ml-1 text-[12px] font-bold">*</Text>
                        </View>
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
                            <View className="flex-row items-center mb-2 ml-1">
                                <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-wider">{t('store.start_date')}</Text>
                                <Text style={{ color: colors.error }} className="ml-1 text-[12px] font-bold">*</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowStartPicker(true)}
                                style={{ backgroundColor: colors.surface }}
                                className="flex-row items-center px-4 py-4 rounded-2xl"
                            >
                                <Calendar size={18} color={colors.primary} className="mr-3" />
                                <Text style={{ color: colors.text }} className="flex-1 font-black text-sm ml-2">
                                    {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1">
                            <View className="flex-row items-center mb-2 ml-1">
                                <Text style={{ color: colors.textSecondary }} className="text-[11px] font-black tracking-wider">{t('store.end_date')}</Text>
                                <Text style={{ color: colors.error }} className="ml-1 text-[12px] font-bold">*</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowEndPicker(true)}
                                style={{ backgroundColor: colors.surface }}
                                className="flex-row items-center px-4 py-4 rounded-2xl"
                            >
                                <Calendar size={18} color={colors.primary} className="mr-3" />
                                <Text style={{ color: colors.text }} className="flex-1 font-black text-sm ml-2">
                                    {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={{ borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: Math.max(20, insets.bottom + 20) }} className="px-6 py-4 border-t flex-row gap-3">
                {!isEditing && (
                    <TouchableOpacity
                        onPress={() => handlePublishOffer('draft')}
                        disabled={loading}
                        style={{ backgroundColor: colors.surface }}
                        className="flex-1 py-5 rounded-[24px] items-center border border-surface shadow-sm"
                    >
                        <Text style={{ color: colors.textSecondary }} className="font-black text-sm tracking-tight">Save Draft</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => handlePublishOffer('active')}
                    disabled={loading}
                    className={`${isEditing ? 'flex-1' : 'flex-2'} bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-primary/30`}
                    style={{ flex: isEditing ? 1 : 2 }}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest">{isEditing ? t('store.update_offer') : t('store.publish_offer')}</Text>
                    )}
                </TouchableOpacity>
            </View>
            <Modal transparent visible={showSuccessModal} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setShowSuccessModal(false)}>
                    <View className="flex-1 justify-center items-center bg-black/80 px-8">
                        <TouchableWithoutFeedback onPress={() => {}}>
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
                                    <CheckCircle2 size={16} color={colors.primary} className="mr-6" />
                                    <Text style={{ color: colors.primary }} className="font-black text-sm tracking-tight">{t('common.cool') || 'Done'}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Custom Discard/Save Draft Modal */}
            <Modal transparent visible={showDiscardModal} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setShowDiscardModal(false)}>
                    <View className="flex-1 justify-center items-center bg-black/80 px-8">
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={{ backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }} className="w-full rounded-[40px] p-8 items-center shadow-2xl">
                                <View style={{ backgroundColor: `${colors.primary}10` }} className="w-16 h-16 rounded-[24px] items-center justify-center mb-6">
                                    <LucidePackage size={30} color={colors.primary} strokeWidth={1.5} />
                                </View>
                                <Text style={{ color: colors.text }} className="text-xl font-black text-center mb-2">{t('settings.discard')}</Text>
                                <Text style={{ color: colors.textSecondary }} className="text-center font-bold mb-8 opacity-60">
                                    {isEditing ? 'Do you want to save changes to this offer?' : 'You have unsaved details. Would you like to save this as a draft?'}
                                </Text>

                                <View className="w-full" style={{ gap: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => handlePublishOffer('draft', pendingAction)}
                                        style={{ backgroundColor: isDarkMode ? colors.primary : '#1A1A1A' }}
                                        className="w-full py-5 rounded-[24px] items-center shadow-lg shadow-black/10"
                                    >
                                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-tight">{isEditing ? 'Save Changes' : 'Save Draft'}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowDiscardModal(false);
                                            if (pendingAction) navigation.dispatch(pendingAction);
                                        }}
                                        style={{ backgroundColor: `${colors.error}10` }}
                                        className="w-full py-5 rounded-[24px] items-center border border-red-500/10"
                                    >
                                        <Text className="text-red-500 font-black text-sm tracking-tight">Don't Save</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setShowDiscardModal(false)}
                                        style={{ backgroundColor: isDarkMode ? '#2D374833' : '#F7FAFC' }}
                                        className="w-full py-5 rounded-[24px] items-center"
                                    >
                                        <Text style={{ color: colors.textSecondary }} className="font-bold text-xs opacity-60">Wait, Keep Editing</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            {renderDatePicker()}
        </SafeAreaView>
    );
};

export default AddOfferScreen;
