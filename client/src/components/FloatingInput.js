import React, { useState, useRef } from 'react';
import { View, TextInput, Text, Animated, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

const FloatingInput = ({ label, value, onChangeText, secureTextEntry, keyboardType, error, ...props }) => {
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
            outputRange: ['#54757C', '#002F34'],
        }),
    };

    return (
        <View className="mb-4 w-full">
            <View
                className={`h-[60px] rounded-lg border px-4 pt-4 flex-row items-center ${isFocused ? 'border-primary bg-white border-2' : 'border-gray-200 bg-surface'
                    } ${error ? 'border-red-500' : ''}`}
            >
                <Animated.Text style={labelStyle}>
                    {label}
                </Animated.Text>
                <TextInput
                    className="flex-1 text-base text-primary h-full pt-1.5"
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
                            <EyeOff size={20} color="#54757C" />
                        ) : (
                            <Eye size={20} color="#54757C" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}
        </View>
    );
};

export default FloatingInput;
