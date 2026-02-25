import React from 'react';
import { View, Text } from 'react-native';

const ProgressSteps = ({ currentStep, totalSteps = 2 }) => {
    return (
        <View className="flex-row items-center justify-center mb-8">
            {[...Array(totalSteps)].map((_, index) => (
                <React.Fragment key={index}>
                    <View className={`w-[30px] h-[30px] rounded-full justify-center items-center border ${index < currentStep ? 'bg-primary border-primary' :
                            index === currentStep ? 'bg-secondary border-secondary' : 'bg-surface border-gray-200'
                        }`}>
                        <Text className={`text-sm font-bold ${index <= currentStep ? 'text-white' : 'text-gray-400'}`}>
                            {index + 1}
                        </Text>
                    </View>
                    {index < totalSteps - 1 && (
                        <View className={`w-10 h-[2px] mx-2.5 ${index < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
};

export default ProgressSteps;
