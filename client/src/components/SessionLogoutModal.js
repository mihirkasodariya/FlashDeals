import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Animated, Platform, DeviceEventEmitter, Pressable } from 'react-native';
import Text from './CustomText';
import { LogOut, ShieldAlert, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const SessionLogoutModal = () => {
    const [visible, setVisible] = useState(false);
    const { colors, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('showSessionLogout', () => {
            setVisible(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        });

        return () => subscription.remove();
    }, []);

    const handleConfirm = () => {
        // Animation before hiding
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent
        >
            <View className="flex-1 items-center justify-center bg-black/70 px-8">
                <Pressable className="absolute inset-0" onPress={handleConfirm} />
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 25 },
                        shadowOpacity: 0.4,
                        shadowRadius: 50,
                        elevation: 30,
                    }}
                    className="w-full rounded-[48px] p-10 items-center border border-white/10"
                >
                    {/* Floating Alert Icon */}
                    <View
                        style={{ backgroundColor: `${colors.error}15` }}
                        className="w-24 h-24 rounded-[36px] items-center justify-center mb-10 shadow-xl shadow-red-500/10"
                    >
                        <ShieldAlert size={48} color="#FF4444" strokeWidth={1.5} />
                    </View>

                    {/* Headline */}
                    <Text
                        style={{ color: colors.text }}
                        className="text-3xl font-black text-center mb-4 tracking-tighter"
                    >
                        Session Expired
                    </Text>

                    {/* Descriptive Message */}
                    <Text
                        style={{ color: colors.textSecondary }}
                        className="text-center font-bold mb-12 leading-6 opacity-60 px-4"
                    >
                        You've been logged in on another device. For your security, this session has been disconnected.
                    </Text>

                    {/* Premium Action Button */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleConfirm}
                        style={{
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 15 },
                            shadowOpacity: 0.35,
                            shadowRadius: 25,
                        }}
                        className="w-full py-6 rounded-[28px] flex-row items-center justify-center"
                    >
                        <Text style={{ color: '#FFFFFF' }} className="font-black text-sm tracking-widest uppercase mr-3">
                            RE-AUTHENTICATE
                        </Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} className="w-6 h-6 rounded-lg items-center justify-center">
                            <ChevronRight size={14} color="#FFFFFF" strokeWidth={4} />
                        </View>
                    </TouchableOpacity>

                    {/* Subtle Security Footnote */}
                    <View className="mt-8 flex-row items-center opacity-30">
                        <LogOut size={12} color={colors.textSecondary} className="mr-2" />
                        <Text style={{ color: colors.textSecondary }} className="text-[10px] font-black tracking-widest uppercase">
                            Secure Exit Activated
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default SessionLogoutModal;
