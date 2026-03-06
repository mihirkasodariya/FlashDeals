import React, { useState, useEffect } from 'react';
import Text from './CustomText';
import { View, Modal, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { X, ChevronRight, MapPin, Search, ChevronLeft, Navigation2 } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const LocationSelectorModal = ({ visible, onClose, onSelectLocation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [step, setStep] = useState('state'); // state, district, city, village
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const dummyLocations = {
        states: ['Gujarat', 'Maharashtra', 'Rajasthan', 'Delhi'],
        districts: {
            'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
        },
        cities: {
            'Ahmedabad': ['Ahmedabad City', 'Daskroi', 'Detroj-Rampura'],
            'Surat': ['Surat City', 'Choryasi', 'Olpad'],
        },
        villages: {
            'Ahmedabad City': ['Bopal', 'Satellite', 'Vastrapur', 'Prahladnagar'],
            'Surat City': ['Adajan', 'Vesu', 'Varachha', 'Piplod'],
        }
    };

    const currentList = () => {
        let list = [];
        if (step === 'state') list = dummyLocations.states;
        else if (step === 'district') list = dummyLocations.districts[selectedState] || [];
        else if (step === 'city') list = dummyLocations.cities[selectedDistrict] || [];
        else if (step === 'village') list = dummyLocations.villages[selectedCity] || [];

        return list.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const handleSelect = (item) => {
        if (step === 'state') {
            setSelectedState(item);
            setStep('district');
        } else if (step === 'district') {
            setSelectedDistrict(item);
            setStep('city');
        } else if (step === 'city') {
            setSelectedCity(item);
            setStep('village');
        } else if (step === 'village') {
            onSelectLocation(`${item}, ${selectedCity}, ${selectedDistrict}, ${selectedState}`);
            handleClose();
        }
        setSearchQuery('');
    };

    const handleBack = () => {
        if (step === 'district') setStep('state');
        else if (step === 'city') setStep('district');
        else if (step === 'village') setStep('city');
    };

    const handleClose = () => {
        setStep('state');
        setSelectedState(null);
        setSelectedDistrict(null);
        setSelectedCity(null);
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/60">
                <View style={{ backgroundColor: colors.card }} className="rounded-t-[40px] h-[85%] shadow-2xl">
                    {/* Premium Handle */}
                    <View style={{ backgroundColor: colors.border }} className="w-12 h-1 rounded-full self-center mt-4 mb-2" />

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4">
                        <View className="flex-row items-center flex-1">
                            {step !== 'state' && (
                                <TouchableOpacity onPress={handleBack} style={{ backgroundColor: colors.surface }} className="mr-4 w-10 h-10 rounded-full items-center justify-center">
                                    <ChevronLeft size={20} color={colors.primary} strokeWidth={3} />
                                </TouchableOpacity>
                            )}
                            <View>
                                <Text style={{ color: colors.secondary }} className="text-[10px] font-black uppercase tracking-widest mb-0.5">{t('location_selector.hub')}</Text>
                                <Text style={{ color: colors.text }} className="text-2xl font-black">
                                    {step === 'state' ? t('location_selector.choose_state') :
                                        step === 'district' ? t('location_selector.select_district') :
                                            step === 'city' ? t('location_selector.select_city') : t('location_selector.select_village')}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={{ backgroundColor: colors.surface }} className="w-10 h-10 rounded-full items-center justify-center">
                            <X size={20} color={colors.primary} strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    {/* Modern Search */}
                    <View className="px-6 py-4">
                        <View style={{ backgroundColor: colors.surface }} className="flex-row items-center rounded-2xl px-5 py-4 border border-transparent">
                            <Search size={20} color={colors.textSecondary} strokeWidth={2.5} />
                            <TextInput
                                style={{ color: colors.text }}
                                className="flex-1 ml-3 font-bold text-sm"
                                placeholder={t('location_selector.find_placeholder', { step: t('location_selector.select_' + step).replace(t('location_selector.choose_state').split(' ')[0], '').trim().split(' ')[1] || step })}
                                placeholderTextColor={colors.textSecondary + '80'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Selection Visual Path */}
                    {(selectedState || selectedDistrict || selectedCity) && (
                        <View className="px-6 py-2 flex-row flex-wrap gap-2">
                            {selectedState && (
                                <View className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                    <Text className="text-[10px] text-primary font-black uppercase">{selectedState}</Text>
                                </View>
                            )}
                            {selectedDistrict && (
                                <View className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                    <Text className="text-[10px] text-primary font-black uppercase">{selectedDistrict}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Options List */}
                    <FlatList
                        data={currentList()}
                        keyExtractor={(item) => item}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 }}
                        ListHeaderComponent={step === 'state' && (
                            <TouchableOpacity
                                style={{ backgroundColor: `${colors.secondary}1A`, borderColor: `${colors.secondary}1A` }}
                                className="flex-row items-center p-6 rounded-3xl mb-4 border"
                                onPress={() => {
                                    onSelectLocation('Current Location (GPS)');
                                    handleClose();
                                }}
                            >
                                <View style={{ backgroundColor: `${colors.secondary}33` }} className="w-12 h-12 rounded-2xl items-center justify-center">
                                    <Navigation2 size={22} color={colors.secondary} strokeWidth={3} />
                                </View>
                                <View className="ml-4">
                                    <Text style={{ color: colors.text }} className="font-black text-base">{t('location_selector.detect_current')}</Text>
                                    <Text style={{ color: colors.secondary }} className="font-bold text-xs uppercase tracking-tighter">{t('location_selector.using_gps')}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ borderBottomColor: colors.surface }}
                                className="flex-row items-center justify-between py-5 border-b"
                                onPress={() => handleSelect(item)}
                            >
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: `${colors.primary}1A` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                                        <MapPin size={18} color={colors.primary} />
                                    </View>
                                    <Text style={{ color: colors.text }} className="text-base font-bold">{item}</Text>
                                </View>
                                <ChevronRight size={18} color={colors.border} strokeWidth={3} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Search size={48} color={colors.border} />
                                <Text style={{ color: colors.textSecondary }} className="font-bold mt-4">{t('location_selector.not_found')}</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};


export default LocationSelectorModal;
