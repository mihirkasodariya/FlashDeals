import React, { useRef, useState } from 'react';
import { View, TextInput, Keyboard, useWindowDimensions } from 'react-native';

const OTPInput = ({ length = 6, onComplete }) => {
    const { width } = useWindowDimensions();
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputs = useRef([]);

    // Calculate box width dynamically
    const boxWidth = Math.min(45, (width - 80) / length);
    const boxHeight = boxWidth * 1.2;

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < length - 1) {
            inputs.current[index + 1].focus();
        }

        if (newOtp.every(val => val.length === 1)) {
            onComplete(newOtp.join(''));
            Keyboard.dismiss();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <View className="flex-row justify-between w-full my-8">
            {otp.map((digit, index) => (
                <TextInput
                    key={index}
                    style={{ width: boxWidth, height: boxHeight }}
                    className={`border-1.5 rounded-lg text-center text-xl font-bold text-primary ${otp[index] ? 'border-secondary bg-white' : 'border-gray-200 bg-surface'
                        }`}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    ref={(ref) => (inputs.current[index] = ref)}
                    autoFocus={index === 0}
                />
            ))}
        </View>
    );
};

export default OTPInput;
