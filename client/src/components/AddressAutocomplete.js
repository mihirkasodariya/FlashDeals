import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { MapPin, Search, X } from 'lucide-react-native';
import { colors } from '../theme/colors';

const AddressAutocomplete = ({ value, onChangeText, placeholder, label }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [query, setQuery] = useState(value);
    const isMounted = useRef(true);
    const timeoutRef = useRef(null);


    useEffect(() => {
        isMounted.current = true;
        setQuery(value);
        return () => { isMounted.current = false; };
    }, [value]);

    const fetchSuggestions = async (text) => {
        if (text.length < 3) {
            if (isMounted.current) setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=6&countrycodes=in&accept-language=en-IN`
            );
            const data = await response.json();
            const indianResults = data.filter(item =>
                item.address && (item.address.country_code === 'in' || item.display_name.toLowerCase().includes('india'))
            );
            if (isMounted.current) {
                setSuggestions(indianResults);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };



    const handleTextChange = (text) => {
        setQuery(text);
        onChangeText(text);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(text);
        }, 500);
    };

    const handleSelect = (item) => {
        const fullAddress = item.display_name;
        setQuery(fullAddress);
        onChangeText(fullAddress);
        setShowSuggestions(false);
        setSuggestions([]);
        Keyboard.dismiss();
    };

    const clearInput = () => {
        setQuery('');
        onChangeText('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <View className="mb-5 z-50">
            {label && <Text className="text-xs font-bold text-textSecondary uppercase mb-2 ml-1">{label}</Text>}
            <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
                <MapPin size={18} color={colors.textSecondary} />
                <TextInput
                    className="flex-1 ml-3 text-primary font-medium"
                    placeholder={placeholder || "Start typing address..."}
                    value={query}
                    onChangeText={handleTextChange}
                    multiline={true}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={clearInput}>
                        <X size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                {loading && <ActivityIndicator size="small" color={colors.secondary} className="ml-2" />}
            </View>

            {showSuggestions && suggestions.length > 0 && (
                <View className="absolute top-[85px] left-0 right-0 bg-white rounded-xl shadow-xl border border-border z-[100] max-h-[300px] overflow-hidden">
                    <ScrollView keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={index.toString()}
                                className="px-4 py-4 border-b border-surface flex-row items-start"
                                onPress={() => handleSelect(item)}
                            >
                                <MapPin size={16} color={colors.secondary} className="mt-1" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-primary font-bold text-sm" numberOfLines={2}>
                                        {item.address.road || item.address.amenity || item.address.house_number || item.display_name.split(',')[0]}
                                    </Text>
                                    <Text className="text-textSecondary text-[11px] mt-0.5" numberOfLines={1}>
                                        {item.address.suburb || item.address.neighbourhood || item.address.residential || ''}
                                        {item.address.city || item.address.town || item.address.village || ''}, {item.address.state || ''}
                                    </Text>
                                    <Text className="text-blue-500 text-[10px] font-bold mt-0.5">
                                        {item.address.postcode ? `PIN: ${item.address.postcode}` : 'India'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default AddressAutocomplete;
