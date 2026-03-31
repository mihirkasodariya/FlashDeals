import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Animated, Platform, Pressable } from 'react-native';
import * as Network from 'expo-network';
import Text from './CustomText';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const NoInternetModal = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [visible, setVisible] = useState(false);
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const checkConnection = async () => {
        try {
            const state = await Network.getNetworkStateAsync();
            const connected = state.isConnected && state.isInternetReachable !== false;

            if (connected !== isConnected) {
                console.log("Connection state changed:", connected);
                setIsConnected(connected);

                if (!connected) {
                    setVisible(true);
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();
                } else {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setVisible(false));
                }
            }
        } catch (error) {
            console.error("Check connection error:", error);
        }
    };

    useEffect(() => {
        // Initial check
        checkConnection();

        // Polling as a fallback for expo-network which lacks listeners
        const interval = setInterval(checkConnection, 3000);

        return () => clearInterval(interval);
    }, [isConnected]);

    const handleRetry = () => {
        checkConnection();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
        >
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <Pressable className="absolute inset-0" onPress={() => setVisible(false)} />
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.3,
                        shadowRadius: 40,
                        elevation: 25,
                    }}
                    className="w-full rounded-[40px] p-8 items-center border border-white/5"
                >
                    {/* Icon Container with Pulse Effect Placeholder */}
                    <View
                        style={{ backgroundColor: `${colors.error}15` }}
                        className="w-24 h-24 rounded-[32px] items-center justify-center mb-8"
                    >
                        <WifiOff size={44} color={colors.error} strokeWidth={1.5} />
                    </View>

                    {/* Text Section */}
                    <Text
                        style={{ color: colors.text }}
                        className="text-2xl font-black text-center mb-3 tracking-tight"
                    >
                        Connection Lost
                    </Text>

                    <Text
                        style={{ color: colors.textSecondary }}
                        className="text-center font-medium mb-10 leading-6 opacity-70"
                    >
                        Oops! It seems your internet is on vacation. Please check your connection to continue hunting for deals.
                    </Text>

                    {/* Action Button */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleRetry}
                        style={{
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.3,
                            shadowRadius: 20,
                        }}
                        className="w-full py-5 rounded-[24px] flex-row items-center justify-center"
                    >
                        <RefreshCw size={18} color="#FFFFFF" className="mr-3" />
                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest uppercase">
                            RETRY
                        </Text>
                    </TouchableOpacity>

                    {/* Footer Hint */}
                    <TouchableOpacity className="mt-6 flex-row items-center opacity-40">
                        <AlertCircle size={12} color={colors.textSecondary} className="mr-2" />
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-bold">
                            Check Wifi or Mobile Data settings
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default NoInternetModal;
