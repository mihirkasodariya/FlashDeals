import React from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomText = (props) => {
    const { colors } = useTheme();
    return (
        <RNText
            {...props}
            style={[{ color: colors.text }, props.style]}
        />
    );
};

export default CustomText;
