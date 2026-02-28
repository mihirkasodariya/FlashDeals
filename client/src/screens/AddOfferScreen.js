import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft, Camera, Calendar, Tag, FileText, Type } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const CATEGORIES = ['Food', 'Grocery', 'Fashion', 'Electronics', 'Health', 'Other'];

const AddOfferScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);

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
                        <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-black text-primary">Select Date</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="bg-primary/5 px-6 py-2 rounded-xl"
                                >
                                    <Text className="text-primary font-black text-sm">Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={value}
                                mode="date"
                                display="inline"
                                onChange={onChange}
                                minimumDate={minDate}
                                themeVariant="light"
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
            Alert.alert('Error', 'Please fill all fields and select an image');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
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
                Alert.alert('Success', 'Offer added successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', data.message || 'Failed to add offer');
            }
        } catch (error) {
            console.error('Add offer error:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="flex-row items-center px-6 py-4 border-b border-surface">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center bg-surface rounded-xl">
                    <ChevronLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-black text-primary">Add New Flash Deal</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Image Picker */}
                <TouchableOpacity
                    onPress={pickImage}
                    className="w-full h-48 bg-surface rounded-[32px] overflow-hidden items-center justify-center border-2 border-dashed border-primary/20"
                >
                    {image ? (
                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="items-center">
                            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                                <Camera size={32} color={colors.primary} />
                            </View>
                            <Text className="text-primary/60 font-bold">Select Offer Image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="mt-8 space-y-6 pb-20">
                    <View>
                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-2 ml-1">Offer Title</Text>
                        <View className="flex-row items-center bg-surface px-4 py-3 rounded-2xl">
                            <Type size={18} color={colors.primary} className="mr-3" />
                            <TextInput
                                className="flex-1 font-bold text-primary"
                                placeholder="E.g. 50% Off on All Pizzas"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    <View className="mt-6">
                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-2 ml-1">Detail Description</Text>
                        <View className="flex-row items-start bg-surface px-4 py-4 rounded-2xl min-h-[120px]">
                            <FileText size={18} color={colors.primary} className="mr-3 mt-1" />
                            <TextInput
                                className="flex-1 font-bold text-primary"
                                placeholder="Tell users about the deal, terms, etc."
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <View className="mt-6">
                        <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-2 ml-1">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-2">
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`mr-3 px-6 py-3 rounded-2xl ${category === cat ? 'bg-primary' : 'bg-surface'}`}
                                >
                                    <Text className={`font-black text-xs ${category === cat ? 'text-white' : 'text-primary'}`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="flex-row gap-4 mt-6">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-2 ml-1">Start Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowStartPicker(true)}
                                className="flex-row items-center bg-surface px-4 py-4 rounded-2xl"
                            >
                                <Calendar size={18} color={colors.primary} className="mr-3" />
                                <Text className="flex-1 font-bold text-primary text-xs">
                                    {startDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {renderDatePicker(showStartPicker, startDate, onStartDateChange, new Date(), () => setShowStartPicker(false))}
                        </View>

                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-textSecondary tracking-widest mb-2 ml-1">End Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowEndPicker(true)}
                                className="flex-row items-center bg-surface px-4 py-4 rounded-2xl"
                            >
                                <Calendar size={18} color={colors.primary} className="mr-3" />
                                <Text className="flex-1 font-bold text-primary text-xs">
                                    {endDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {renderDatePicker(showEndPicker, endDate, onEndDateChange, startDate, () => setShowEndPicker(false))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className="px-6 py-6 border-t border-surface bg-white">
                <TouchableOpacity
                    onPress={handleAddOffer}
                    disabled={loading}
                    className="w-full bg-primary py-5 rounded-[24px] items-center shadow-lg shadow-primary/30"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-black text-sm tracking-widest">Publish Flash Deal</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddOfferScreen;
