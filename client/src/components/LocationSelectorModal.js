import React, { useState, useEffect } from 'react';
import Text from './CustomText';
import { View, Modal, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { X, ChevronRight, MapPin, Search, ChevronLeft, Navigation2 } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const LocationSelectorModal = ({ visible, onClose, onSelectLocation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const dummyLocations = {
        states: ['Gujarat', 'Maharashtra', 'Rajasthan', 'Delhi', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Punjab'],
        districts: {
            'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
            'Karnataka': ['Bangalore', 'Mysore'],
        },
        cities: {
            'Ahmedabad': ['Ahmedabad City', 'Bavla', 'Dholka', 'Viramgam'],
            'Surat': ['Surat City', 'Bardoli', 'Sayan'],
            'Vadodara': ['Vadodara City', 'Padra', 'Waghodia', 'Savli'],
            'Rajkot': ['Rajkot City', 'Gondal', 'Morbi Road Area', 'Shapar'],
            'Gandhinagar': ['Gandhinagar City', 'Kalol', 'Adalaj'],
            'Bhavnagar': ['Bhavnagar City', 'Sihor', 'Palitana'],
            'Jamnagar': ['Jamnagar City', 'Hapa'],
            'Anand': ['Anand City', 'Vidyanagar', 'Karamsad'],
            'Mumbai': ['Mumbai South', 'Mumbai Western Suburbs', 'Navi Mumbai', 'Thane'],
            'Pune': ['Pune City', 'Hinjewadi', 'Baner', 'Wakad'],
            'Bangalore': ['Bangalore North', 'Bangalore South'],
        },
        villages: {
            // Gujarat
            'Ahmedabad City': ['Bopal', 'Satellite', 'Vastrapur', 'Prahladnagar', 'Ghatlodia', 'Naroda'],
            'Surat City': ['Adajan', 'Vesu', 'Varachha', 'Piplod', 'Katargam', 'Nanpura', 'Udhna'],
            'Vadodara City': ['Alkapuri', 'Gotri', 'Akota', 'Karelibaug', 'Manjalpur', 'Sayajigunj', 'Atladra'],
            'Rajkot City': ['Kalavad Road', 'Yagnik Road', 'Mavdi', '150 Feet Ring Road', 'Railnagar'],
            'Gandhinagar City': ['Sector 1-10', 'Sector 11-20', 'Sector 21-30', 'Infocity', 'Sargasan', 'Kudasan'],
            'Bhavnagar City': ['Kaliyabid', 'Bhavnagar Town', 'Ghogha Circle', 'Subhash Nagar'],
            'Jamnagar City': ['Digvijay Plot', 'Navagam', 'Town Hall Area'],
            'Anand City': ['Anand Town', 'Lambhvel Road', 'Amul Dairy Area'],
            'Vidyanagar': ['V V Nagar Town', 'Bakrol Road', 'Nana Bazar'],
            // Maharashtra
            'Mumbai Western Suburbs': ['Andheri West', 'Bandra West', 'Borivali', 'Malad', 'Kandivali'],
            'Thane': ['Hiranandani Estate', 'Ghodbunder Road', 'Majiwada'],
            'Hinjewadi': ['Phase 1', 'Phase 2', 'Phase 3'],
            // Karnataka
            'Bangalore North': ['Hebbal', 'Yelahanka', 'Devanahalli'],
            'Bangalore South': ['Jayanagar', 'JP Nagar', 'Electronic City', 'Whitefield'],
        },
        societies: {
            // Ahmedabad
            'Bopal': ['Iscon Platinum', 'Sky City', 'Sobo Center Area', 'Sterling City', 'Aaryan Gloria', 'Sun South'],
            'Satellite': ['Shyamal', 'Shivranjani', 'Ramdevnagar', 'Venus Atlantis Area', 'Satyagrah Chhavni'],
            'Ghatlodia': ['K K Nagar', 'Chanakyapuri Area', 'Shayona City'],
            // Surat
            'Adajan': ['LP Savani Area', 'Pal Resi', 'Green City', 'Madhav Bagh', 'Honey Park Area', 'TGB Area'],
            'Vesu': ['Nandini Residency', 'Sangini Residency', 'Happy Home Heights', 'Reva', 'Rajhans Belliza'],
            'Katargam': ['Gotalawadi', 'Dhanmora Area', 'Hariom Nagar', 'Patel Nagar', 'Rama Krishna Society'],
            'Nanpura': ['Dutch Garden Area', 'Athwa Gate Area'],
            // Vadodara
            'Alkapuri': ['Concorde', 'Windsor Plaza Area', 'Fortune Towers', 'Shree Siddheshwar', 'Arundeep'],
            'Gotri': ['Iscon Harmony', 'Sahaj Residency', 'Pashabhai Park', 'Arunoday Society', 'Nilamber Circle'],
            'Manjalpur': ['Vrajbhumi', 'Pushpam Tenement', 'SuryDarshan', 'Deep Chambers'],
            'Karelibaug': ['L&T Circle Area', 'Amit Nagar Circle', 'Jay Ratna'],
            // Gandhinagar
            'Sargasan': ['Pramukh Hills', 'Radhe Residency', 'Swagat Flamingo'],
            'Kudasan': ['Kavisha Panorama', 'Shalin Heights', 'Skylon'],
            'Infocity': ['DA-IICT Area', 'TCS Peepul Park Area', 'E-City'],
            // Bhavnagar
            'Kaliyabid': ['Ambika Nagar', 'Vidhyanagar Area', 'Bhaktinagar'],
            // Anand/Vidyanagar
            'V V Nagar Town': ['Bhaikaka Statue Area', 'Mota Bazar', 'Vallabh Residency'],
            'Anand Town': ['Station Road Area', 'Laxmi Cinema Area'],
            // Mumbai
            'Andheri West': ['Lokhandwala Complex', 'Versova Heights', 'Oberoi Springs', 'Yamuna Nagar'],
            'Bandra West': ['Pali Hill Residency', 'Carter Road Area', 'Sea View', 'Link Square'],
            'Hiranandani Estate': ['Rodas Enclave', 'The Walk Area', 'Eagle Ridge'],
            // Bangalore
            'Hebbal': ['RMV Clusters', 'Godrej Woodsman', 'Prestige Misty'],
            'Whitefield': ['Prestige Shantiniketan', 'Brigade Metropolis', 'SJR Brooklyn'],
        }
    };

    // Hybrid Search Logic: Local Dummy Data + Real-world API
    useEffect(() => {
        const fetchPlaces = async () => {
            // Case 1: Manual Search
            if (searchQuery.length >= 2) {
                setLoading(true);
                try {
                    const localResults = [];
                    const query = searchQuery.toLowerCase();
                    Object.keys(dummyLocations.societies).forEach(area => {
                        dummyLocations.societies[area].forEach(soc => {
                            if (soc.toLowerCase().includes(query) || area.toLowerCase().includes(query)) {
                                localResults.push({ type: 'society', name: soc, display: `${soc}, ${area}, India`, isLocal: true });
                            }
                        });
                    });

                    const response = await fetch(`https://photon.komoot.io/api/?q=${searchQuery}&limit=15&lat=23.0225&lon=72.5714&lang=en`);
                    const data = await response.json();
                    const apiResults = data.features.map(f => {
                        const p = f.properties;
                        return {
                            type: p.osm_value === 'residential' || p.osm_key === 'building' ? 'society' : 'area',
                            name: p.name || '',
                            display: `${p.name || ''}${p.street ? ', ' + p.street : ''}${p.city ? ', ' + p.city : ''}, ${p.state || 'India'}`,
                            coords: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }
                        };
                    });
                    const combined = [...localResults, ...apiResults].filter((v, i, a) => a.findIndex(t => t.name === v.name && t.display === v.display) === i);
                    setSearchResults(combined);
                } catch (error) { console.error(error); } finally { setLoading(false); }
                return;
            }

            // Case 2: Hierarchical Browsing - Auto Fetch missing data
            if (step === 'society' && selectedVillage) {
                const localSocs = dummyLocations.societies[selectedVillage] || [];
                if (localSocs.length === 0) {
                    setLoading(true);
                    try {
                        const response = await fetch(`https://photon.komoot.io/api/?q=${selectedVillage}&limit=10&lang=en`);
                        const data = await response.json();
                        const apiResults = data.features.map(f => ({
                            type: 'society',
                            name: f.properties.name || 'Society',
                            display: `${f.properties.name || ''}, ${selectedVillage}, India`,
                            coords: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }
                        }));
                        setSearchResults(apiResults);
                    } catch (e) { } finally { setLoading(false); }
                } else {
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timer = setTimeout(fetchPlaces, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, step, selectedVillage]);

    const [step, setStep] = useState('state'); // Current browsing step

    const currentList = () => {
        if (searchQuery) return searchResults;

        let list = [];
        if (step === 'state') {
            list = dummyLocations.states.map(s => ({ type: 'state', name: s, display: s }));
        } else if (step === 'district') {
            const data = dummyLocations.districts[selectedState] || [];
            list = data.map(d => ({ type: 'district', name: d, parent: selectedState, display: d }));
        } else if (step === 'city') {
            const data = dummyLocations.cities[selectedDistrict] || [];
            list = data.map(c => ({ type: 'city', name: c, parent: selectedDistrict, display: c }));
        } else if (step === 'village') {
            const data = dummyLocations.villages[selectedCity] || [];
            if (data.length === 0) {
                // Fallback if no specific areas are defined for this city
                list = [{ type: 'area', name: `Main ${selectedCity} Area`, parent: selectedCity, display: `Main ${selectedCity} Area` }];
            } else {
                list = data.map(v => ({ type: 'area', name: v, parent: selectedCity, display: v }));
            }
        } else if (step === 'society') {
            const data = dummyLocations.societies[selectedVillage] || [];
            if (data.length === 0) {
                // Fallback if no specific societies are defined for this village/area
                list = [{ type: 'society', name: `Universal Society in ${selectedVillage}`, parent: selectedVillage, display: `Universal Society in ${selectedVillage}` }];
            } else {
                list = data.map(s => ({ type: 'society', name: s, parent: selectedVillage, display: s }));
            }
        }

        return list;
    };

    const handleSelect = (item) => {
        if (item.coords) {
            onSelectLocation(item.display, item.coords);
            handleClose();
            return;
        }

        if (searchQuery) {
            onSelectLocation(item.display.includes(',') ? `${item.display}, India` : `${item.name}, India`);
            handleClose();
            return;
        }

        if (step === 'state') {
            setSelectedState(item.name);
            setStep('district');
        } else if (step === 'district') {
            setSelectedDistrict(item.name);
            setStep('city');
        } else if (step === 'city') {
            setSelectedCity(item.name);
            setStep('village');
        } else if (step === 'village') {
            setSelectedVillage(item.name);
            setStep('society');
        } else if (step === 'society') {
            onSelectLocation(`${item.name}, ${selectedVillage}, ${selectedCity}, ${selectedDistrict}, ${selectedState}, India`);
            handleClose();
        }
    };

    const handleBack = () => {
        if (step === 'district') setStep('state');
        else if (step === 'city') setStep('district');
        else if (step === 'village') setStep('city');
        else if (step === 'society') setStep('village');
    };

    const handleClose = () => {
        setStep('state');
        setSelectedState(null);
        setSelectedDistrict(null);
        setSelectedCity(null);
        setSelectedVillage(null);
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
                                            step === 'city' ? t('location_selector.select_city') :
                                                step === 'village' ? t('location_selector.select_village') : t('location_selector.select_society')}
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
                                placeholder={"Search city, area or society..."}
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
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 }}
                        ListHeaderComponent={!searchQuery && step === 'state' && (
                            <View>
                                <TouchableOpacity
                                    style={{ backgroundColor: `${colors.secondary}1A`, borderColor: `${colors.secondary}1A` }}
                                    className="flex-row items-center p-6 rounded-3xl mb-6 border"
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

                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest mb-4 ml-2">Popular Cities</Text>
                                <View className="flex-row flex-wrap mb-6">
                                    {['Ahmedabad', 'Mumbai', 'Bangalore', 'Delhi', 'Pune'].map(city => (
                                        <TouchableOpacity
                                            key={city}
                                            onPress={() => {
                                                setSearchQuery(city);
                                            }}
                                            style={{ backgroundColor: colors.surface }}
                                            className="px-4 py-2 rounded-xl mr-2 mb-2 border border-surface"
                                        >
                                            <Text style={{ color: colors.text }} className="font-bold text-xs">{city}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Choose State</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ borderBottomColor: colors.surface }}
                                className="flex-row items-center justify-between py-5 border-b"
                                onPress={() => handleSelect(item)}
                            >
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: item.type === 'society' ? `${colors.secondary}1A` : `${colors.primary}1A` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                                        <MapPin size={18} color={item.type === 'society' ? colors.secondary : colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={{ color: colors.text }} className="text-base font-bold">{item.name}</Text>
                                        {item.display.includes(',') && (
                                            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">{item.display}</Text>
                                        )}
                                    </View>
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
