import React, { useState, useRef } from 'react';
import Text from './CustomText';
import { View, TextInput, Animated, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const FloatingInput = ({ label, value, onChangeText, secureTextEntry, keyboardType, error, ...props }) => {
    const { colors, isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!value) {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    const labelStyle = {
        position: 'absolute',
        left: 15,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 5],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.textSecondary, colors.text],
        }),
    };

    return (
        <View className="mb-4 w-full">
            <View
                style={{ 
                    backgroundColor: isFocused ? colors.background : colors.surface, 
                    borderColor: error ? 'red' : (isFocused ? colors.primary : colors.border),
                    borderWidth: isFocused ? 2 : 1
                }}
                className={`h-[60px] rounded-lg px-4 pt-4 flex-row items-center`}
            >
                <Animated.Text style={labelStyle}>
                    {label}
                </Animated.Text>
                <TextInput
                    style={{ color: colors.text }}
                    className="flex-1 text-base h-full pt-1.5"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    placeholder=""
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="p-2.5"
                    >
                        {showPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}
        </View>
    );
};

export default FloatingInput;
