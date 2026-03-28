import React, { useState, useEffect } from 'react';
import Text from './CustomText';
import { View, Modal, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { X, ChevronRight, MapPin, Search, ChevronLeft, Navigation2 } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const LocationSelectorModal = ({ visible, onClose, onSelectLocation }) => {
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [selectedState, setSelectedState] = useState('Gujarat');
    const [selectedDistrict, setSelectedDistrict] = useState('Surat');
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const dummyLocations = {
        states: ['Gujarat'],
        districts: {
            'Gujarat': ['Surat'],
        },
        villages: {
            'Surat': [
                'Adajan', 'Vesu', 'Varachha', 'Mota Varachha', 'Piplod', 'Katargam', 'Nanpura', 'Udhna', 'Rander', 'Pal', 'Bhatar', 
                'Majura Gate', 'City Light', 'Althan', 'Amroli', 'Sarthana', 'Puna Gam', 'Bhestan', 'Pandesara', 'Dindoli', 
                'Limbayat', 'Sachin', 'Hajira', 'Chowk Bazar', 'Ring Road', 'Sahara Darwaja', 'Station Area', 'Khatodara', 
                'Sosyo Circle Area', 'Ghod Dod Road', 'Magdalla', 'Dumas', 'Bhimrad', 'Saroli', 'Mughalsarai', 'Sayedpura', 
                'Singanpor', 'Ved Road', 'Dabholi', 'Jehangirpura', 'Variav', 'Kosad', 'Godadara', 'Parvat Patiya', 'Kumbharia', 
                'Kadodara', 'Utran', 'Palanpur Patia', 'Olpad Road', 'Udhna Magdalla Road'
            ],
        },
        societies: {
            'Adajan': ['LP Savani Area', 'Anand Mahal Road', 'Honey Park Area', 'Star Bazaar Area', 'Adajan Char Rasta', 'Navyug College Area', 'L P Savani Road', 'Green City', 'Madhav Bagh Area', 'Prime Arcade Area', 'Jalaram Society Area'],
            'Vesu': ['VIP Road Area', 'Shyam Mandir Area', 'Vesu Canal Road', 'G D Goenka Road Area', 'Nandini Residency', 'Sangini Residency', 'Rajhans Belliza', 'Agrawal Vidya Vihar Area', 'Someshwara Enclave', 'Jolly Residency Area'],
            'Katargam': ['Gotalawadi', 'Dhanmora Area', 'Gajera School Area', 'Akhand Anand College Area', 'Hariom Nagar', 'Patel Nagar', 'Rama Krishna Society', 'Laxminagar', 'Dabholi Char Rasta', 'Kantareswar Mahadev Area', 'Singanpor Road', 'Ankur Char Rasta', 'Katargam Darwaja', 'Kuberji World Area', 'Fulpada Area', 'Umiyadham Temple Area', 'Amba Talavadi Area', 'Lalita Chowk Area'],
            'Nanpura': ['Dutch Garden Area', 'Athwa Gate Area', 'Kadiwala School Area', 'Police Line Area', 'Mughalsarai Area'],
            'Varachha': ['Mini Bazar', 'Hirabaug', 'Kapodra', 'Yogi Chowk', 'Mangadh Chowk', 'Rachana Circle', 'Gitanjali Circle', 'Matawadi', 'L H Road', 'Baroda Rayon Area', 'Spinning Mill Area'],
            'Mota Varachha': ['Sudama Chowk', 'Lajamani Chowk', 'VIP Circle Area', 'Abhishree Residency', 'Riverview Heights', 'Gopin Village', 'Shivdhara Heights Area'],
            'Ghod Dod Road': ['Jolly Arcade Area', 'Ram Chowk Area', 'Megh Mayur Area', 'Standard Chartered Bank Area', 'St Xaviers School Area', 'Subhash Chowk Area'],
            'Piplod': ['Valentine Cinema Area', 'Lakeview Area', 'VR Mall Area', 'Dumas Road Area', 'SNDT College Area', 'Iscon Mall Area'],
            'Rander': ['Rander Town', 'Tadwadi', 'Mora Bhagal Area', 'Fata Talav Area', 'Jahangirabad Area'],
            'Pal': ['Pal Lake Area', 'Gaurav Path', 'Palanpur Canal Road', 'Pal Gam', 'L P Savani Circle Area', 'Palanpur Jakatnaka Area'],
            'Amroli': ['Amroli Bridge Area', 'Amroli Chokdi', 'Amroli Gam', 'Chhapra Bhatha Road', 'Anjani Industrial Area', 'Abhishek Residency Area', 'Silver Point Area', 'Avenue Area', 'Gokal Nagar', 'New Amroli Area'],
            'Sarthana': ['Nature Park Area', 'Sarthana Jakatnaka', 'Lajamani Area', 'Sarthana Community Hall', 'Shyamdham Chowk Area'],
            'Althan': ['Althan Bhatar Road', 'Someshwar Enclave', 'Shubh Enclave', 'Althan Canal Road', 'Althan Tenement Area'],
            'Bhatar': ['Bhatar Char Rasta', 'New City Light Area', 'Sanket Tower Area', 'Uma Bhavan Area', 'Bhatar Road'],
            'Udhna': ['Udhna Darwaja', 'Bhavna Park Area', 'Udhna Railway Station Area', 'Udhna GIDC Area', 'Udhna Silk Mill Area'],
            'Pandesara': ['GIDC Area', 'Pandesara Housing', 'Batliboi Area', 'Pandesara Gam'],
            'Dindoli': ['Dindoli Bridge Area', 'Om Nagar', 'Royal Star Town', 'Sai Point Area', 'Nava Gham Area', 'Kharvasa Road Area'],
            'Bhestan': ['Bhestan Garden Area', 'Bhestan Housing Area', 'Bhestan Station Area'],
            'Sachin': ['Sachin GIDC', 'Sachin Station Area', 'Pali Gam', 'Kansad Area', 'Sachin GIDC Main Road'],
            'Limbayat': ['Nilgiri Circle', 'Limbayat Health Center Area', 'Madina Masjid Area', 'Udhna Yard Area'],
            'Godadara': ['Godadara Bridge Area', 'Maharana Pratap Chowk', 'Godadara Canal Road Area'],
            'Parvat Patiya': ['Magob', 'Model Town Area', 'Dumbhal Area', 'Amazonia Area'],
            'Kumbharia': ['Vishwa Karma Arcade Area', 'Kumbharia Jakatnaka', 'Nature Valley Area'],
            'Kadodara': ['Kadodara Char Rasta', 'Hanuman Mandir Area', 'Kadodara GIDC Area'],
            'Puna Gam': ['Puna Canal Road', 'Reshma Chowk', 'Sita Nagar', 'Puna Jakatnaka Area', 'Silicon City Area'],
            'Jehangirpura': ['Dabholi Bridge Area', 'Asaktashram Area', 'Jehangirpura Garden', 'Botanical Garden Area'],
            'City Light': ['Science Centre Area', 'City Light Shopping Centre', 'Agrasen Bhawan Area', 'SNDT Road Area'],
            'Station Area': ['Sufi Baug Area', 'Delhi Gate Area', 'Lal Darwaja', 'Railway Station Main Road'],
            'Dumas': ['Dumas Beach Area', 'Airport Road Area', 'Sultanabad Area', 'Dumas Gam'],
            'Hajira': ['Reliance GIDC Area', 'Essar GIDC Area', 'Adani Port Area', 'L&T GIDC Area'],
            'Magdalla': ['Magdalla Port Area', 'ONGC Colony Area', 'Silent Zone Area', 'Magdalla Village Area'],
            'Saroli': ['Textile Market Area', 'Kadodara Road Area', 'Saroli GIDC Area'],
            'Khatodara': ['GIDC Khatodara Area', 'Sub Jail Area', 'Sosyo Circle Path'],
            'Chowk Bazar': ['Hope Bridge Area', 'Dutch Garden Area', 'Old City Area', 'Gandhi Baug Area'],
            'Sosyo Circle Area': ['Bamroli Road', 'Navjivan Circle Area', 'Social Circle Area'],
            'Ring Road': ['Kinnary Cinema Area', 'Majura Gate Road', 'Textile Market Ring Road Area']
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

                    const response = await fetch(`https://photon.komoot.io/api/?q=${searchQuery}&limit=15&lat=21.1702&lon=72.8311&lang=en`);
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
                    const combined = [...localResults, ...apiResults]
                        .filter((v, i, a) => a.findIndex(t => t.name === v.name && t.display === v.display) === i)
                        .sort((a,b) => a.name.localeCompare(b.name));
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
                        const response = await fetch(`https://photon.komoot.io/api/?q=${selectedVillage}&limit=10&lat=21.1702&lon=72.8311&lang=en`);
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

    const [step, setStep] = useState('village'); // Current browsing step

    const currentList = () => {
        if (searchQuery) return searchResults;

        let list = [];
        if (step === 'state') {
            list = dummyLocations.states.map(s => ({ type: 'state', name: s, display: s }));
        } else if (step === 'district') {
            const data = dummyLocations.districts[selectedState] || [];
            list = data.map(d => ({ type: 'district', name: d, parent: selectedState, display: d }));
        } else if (step === 'village') {
            const data = dummyLocations.villages[selectedDistrict] || [];
            if (data.length === 0) {
                // Fallback if no specific areas are defined for this city/district
                list = [{ type: 'area', name: `Main ${selectedDistrict} Area`, parent: selectedDistrict, display: `Main ${selectedDistrict} Area` }];
            } else {
                list = data.map(v => ({ type: 'area', name: v, parent: selectedDistrict, display: v }));
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

        // Alphabetical sorting
        return list.sort((a, b) => a.name.localeCompare(b.name));
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
            setStep('village');
        } else if (step === 'village') {
            setSelectedVillage(item.name);
            setStep('society');
        } else if (step === 'society') {
            onSelectLocation(`${item.name}, ${selectedVillage}, ${selectedDistrict}, ${selectedState}, India`);
            handleClose();
        }
    };

    const handleBack = () => {
        if (step === 'society') setStep('village');
    };

    const handleClose = () => {
        setStep('village');
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
                            {step !== 'village' && (
                                <TouchableOpacity onPress={handleBack} style={{ backgroundColor: colors.surface }} className="mr-4 w-10 h-10 rounded-full items-center justify-center">
                                    <ChevronLeft size={20} color={colors.primary} strokeWidth={3} />
                                </TouchableOpacity>
                            )}
                            <View>
                                <Text style={{ color: colors.secondary }} className="text-[10px] font-black uppercase tracking-widest mb-0.5">{t('location_selector.hub')}</Text>
                                <Text style={{ color: colors.text }} className="text-2xl font-black">
                                    {step === 'village' ? t('location_selector.select_village') : t('location_selector.select_society')}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={{ backgroundColor: colors.surface }} className="w-10 h-10 rounded-full items-center justify-center">
                            <X size={20} color={colors.primary} strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    {/* Modern Search */}
                    <View className="px-6 py-2">
                        <View style={{ backgroundColor: colors.surface }} className="flex-row items-center rounded-2xl px-5 py-2.5 border border-transparent">
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
                    <View className="px-6 py-2 flex-row flex-wrap gap-2">
                        <TouchableOpacity
                            onPress={() => {
                                setStep('state'); // Normally state, but keep it for navigation flow
                                setSelectedDistrict('Surat');
                                setSelectedVillage(null);
                            }}
                            className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10"
                        >
                            <Text className="text-[10px] text-primary font-black uppercase">Gujarat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setStep('village');
                                setSelectedVillage(null);
                            }}
                            className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10"
                        >
                            <Text className="text-[10px] text-primary font-black uppercase">Surat</Text>
                        </TouchableOpacity>

                        {selectedVillage && (
                            <View className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                                <Text className="text-[10px] text-primary font-black uppercase">{selectedVillage}</Text>
                            </View>
                        )}
                    </View>

                    {/* Options List */}
                    <FlatList
                        data={currentList()}
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 }}
                        ListHeaderComponent={!searchQuery && step === 'village' && (
                            <View>
                                <TouchableOpacity
                                    style={{ backgroundColor: `${colors.secondary}1A`, borderColor: `${colors.secondary}1A` }}
                                    className="flex-row items-center p-6 rounded-3xl mb-6 border"
                                    onPress={() => {
                                        onSelectLocation('Current Location');
                                        handleClose();
                                    }}
                                >
                                    <View style={{ backgroundColor: `${colors.secondary}33` }} className="w-12 h-12 rounded-2xl items-center justify-center">
                                        <Navigation2 size={22} color={colors.secondary} strokeWidth={3} />
                                    </View>
                                    <View className="ml-4">
                                        <Text style={{ color: colors.text }} className="font-black text-base">Current Location (GPS)</Text>
                                        <Text style={{ color: colors.secondary }} className="font-bold text-xs uppercase tracking-tighter">{t('location_selector.using_gps')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Choose Area in Surat</Text>
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
