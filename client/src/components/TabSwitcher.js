import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const TabSwitcher = ({ tabs, activeTab, onTabChange }) => {
    return (
        <View className="flex-row bg-surface rounded-lg p-1 mb-6">
            {tabs.map((tab, index) => {
                const isActive = activeTab === index;
                return (
                    <TouchableOpacity
                        key={index}
                        className={`flex-1 py-3 items-center rounded-md ${isActive ? 'bg-white shadow-sm' : ''}`}
                        onPress={() => onTabChange(index)}
                    >
                        <Text className={`text-sm font-semibold tracking-tight ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default TabSwitcher;
