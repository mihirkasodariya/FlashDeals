import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { X, ChevronRight, MapPin, Search, ChevronLeft, Navigation2 } from 'lucide-react-native';

import { colors } from '../theme/colors';

const LocationSelectorModal = ({ visible, onClose, onSelectLocation }) => {
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
                <View className="bg-white rounded-t-[40px] h-[85%] shadow-2xl">
                    {/* Premium Handle */}
                    <View className="w-12 h-1 bg-[#E5E7EB] rounded-full self-center mt-4 mb-2" />

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4">
                        <View className="flex-row items-center flex-1">
                            {step !== 'state' && (
                                <TouchableOpacity onPress={handleBack} className="mr-4 w-10 h-10 bg-[#F3F4F6] rounded-full items-center justify-center">
                                    <ChevronLeft size={20} color={colors.primary} strokeWidth={3} />
                                </TouchableOpacity>
                            )}
                            <View>
                                <Text className="text-[10px] font-black text-secondary uppercase tracking-widest mb-0.5">Location Hub</Text>
                                <Text className="text-2xl font-black text-primary">
                                    {step === 'state' ? 'Choose State' :
                                        step === 'district' ? 'Select District' :
                                            step === 'city' ? 'Select City' : 'Select Village'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} className="w-10 h-10 bg-[#F3F4F6] rounded-full items-center justify-center">
                            <X size={20} color={colors.primary} strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    {/* Modern Search */}
                    <View className="px-6 py-4">
                        <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-5 py-4 border border-transparent focus:border-primary/20">
                            <Search size={20} color={colors.textSecondary} strokeWidth={2.5} />
                            <TextInput
                                className="flex-1 ml-3 text-primary font-bold text-sm"
                                placeholder={`Find your ${step}...`}
                                placeholderTextColor="#9CA3AF"
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
                                className="flex-row items-center p-6 bg-secondary/5 rounded-3xl mb-4 border border-secondary/10"
                                onPress={() => {
                                    onSelectLocation('Current Location (GPS)');
                                    handleClose();
                                }}
                            >
                                <View className="w-12 h-12 bg-secondary/20 rounded-2xl items-center justify-center">
                                    <Navigation2 size={22} color={colors.secondary} strokeWidth={3} />
                                </View>
                                <View className="ml-4">
                                    <Text className="text-primary font-black text-base">Detect Current</Text>
                                    <Text className="text-secondary font-bold text-xs uppercase tracking-tighter">Using GPS Precision</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="flex-row items-center justify-between py-5 border-b border-surface"
                                onPress={() => handleSelect(item)}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-primary/5 rounded-xl items-center justify-center mr-4">
                                        <MapPin size={18} color={colors.primary} />
                                    </View>
                                    <Text className="text-primary text-base font-bold">{item}</Text>
                                </View>
                                <ChevronRight size={18} color="#D1D5DB" strokeWidth={3} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Search size={48} color="#E5E7EB" />
                                <Text className="text-textSecondary font-bold mt-4">We couldn't find that place</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};


export default LocationSelectorModal;
