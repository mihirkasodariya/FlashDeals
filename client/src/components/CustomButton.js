import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

const CustomButton = ({ title, onPress, loading, variant = 'primary', style, textStyle }) => {
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    let containerClasses = "h-[50px] rounded-[36px] justify-center items-center w-full my-2 shadow-2xl px-10";
    if (variant === 'primary') containerClasses += " bg-primary shadow-primary/40";
    if (variant === 'secondary') containerClasses += " bg-secondary shadow-secondary/40";
    if (variant === 'outline') containerClasses += " bg-transparent border-2 border-primary";

    let textClasses = "text-base font-bold tracking-tight";
    if (variant === 'outline') textClasses += " text-primary";
    else textClasses += " text-white";

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            className={containerClasses}
            style={style}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? "#002F34" : "#FFFFFF"} />
            ) : (
                <Text className={textClasses} style={textStyle}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;
