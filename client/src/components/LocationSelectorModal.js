import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { X, ChevronRight, MapPin, Search, ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';

const LocationSelectorModal = ({ visible, onClose, onSelectLocation }) => {
    const [step, setStep] = useState('state'); // state, district, city, village
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Dummy data for demo
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
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
                    <View className="flex-row items-center">
                        {step !== 'state' && (
                            <TouchableOpacity onPress={handleBack} className="mr-3">
                                <ChevronLeft size={24} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                        <Text className="text-xl font-bold text-primary">
                            {step === 'state' ? 'Select State' :
                                step === 'district' ? 'Select District' :
                                    step === 'city' ? 'Select City' : 'Select Village/Area'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleClose}>
                        <X size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="px-4 py-3">
                    <View className="flex-row items-center bg-surface rounded-lg px-3 py-2 border border-border">
                        <Search size={20} color={colors.textSecondary} />
                        <TextInput
                            className="flex-1 ml-2 text-primary font-medium"
                            placeholder={`Search ${step}...`}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Current Selection Path */}
                {(selectedState || selectedDistrict || selectedCity) && (
                    <View className="px-4 py-2 bg-surface/50 flex-row flex-wrap">
                        {selectedState && <Text className="text-xs text-textSecondary">{selectedState}</Text>}
                        {selectedDistrict && <Text className="text-xs text-textSecondary"> {'>'} {selectedDistrict}</Text>}
                        {selectedCity && <Text className="text-xs text-textSecondary"> {'>'} {selectedCity}</Text>}
                    </View>
                )}

                {/* Current Location Option */}
                {step === 'state' && (
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-4 border-b border-border"
                        onPress={() => {
                            onSelectLocation('Current Location (GPS)');
                            handleClose();
                        }}
                    >
                        <MapPin size={22} color={colors.accent} />
                        <View className="ml-3">
                            <Text className="text-accent font-bold">Use current location</Text>
                            <Text className="text-textSecondary text-xs">Using GPS</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* List */}
                <FlatList
                    data={currentList()}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-row items-center justify-between px-4 py-4 border-b border-border"
                            onPress={() => handleSelect(item)}
                        >
                            <Text className="text-primary text-base">{item}</Text>
                            <ChevronRight size={20} color={colors.border} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Text className="text-textSecondary">No results found</Text>
                        </View>
                    }
                />
            </View>
        </Modal>
    );
};

export default LocationSelectorModal;
