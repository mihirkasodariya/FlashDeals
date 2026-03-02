import React from 'react';
import Text from './CustomText';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors as staticColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

const CustomButton = ({ title, onPress, loading, variant = 'primary', style, textStyle, className }) => {
    const { colors, isDarkMode } = useTheme();
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    let containerClasses = `h-[50px] rounded-[36px] justify-center items-center w-full my-2 shadow-lg px-10 ${className || ""}`;

    let dynamicBg = colors.primary;
    let dynamicBorderColor = colors.primary;
    let borderWidth = 0;

    if (variant === 'secondary') {
        dynamicBg = colors.secondary;
        dynamicBorderColor = colors.secondary;
    } else if (variant === 'outline') {
        dynamicBg = 'transparent';
        dynamicBorderColor = colors.primary;
        borderWidth = 2;
    }

    let textClasses = "text-base font-bold tracking-tight";
    let dynamicTextColor = '#FFFFFF';

    if (variant === 'outline') {
        dynamicTextColor = isDarkMode ? '#FFFFFF' : colors.primary;
    } else {
        dynamicTextColor = '#FFFFFF';
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            className={containerClasses}
            style={[{ backgroundColor: dynamicBg, borderColor: dynamicBorderColor, borderWidth }, style]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : "#FFFFFF"} />
            ) : (
                <Text className={textClasses} style={[textStyle, { color: dynamicTextColor }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;
