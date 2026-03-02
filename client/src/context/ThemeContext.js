import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('appTheme');
            if (savedTheme === 'dark') {
                setIsDarkMode(true);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
    };

    const theme = {
        isDarkMode,
        toggleTheme,
        colors: {
            primary: isDarkMode ? '#4bb2f9' : '#002F34',
            secondary: isDarkMode ? '#4bb2f9' : '#00A49F',
            accent: isDarkMode ? '#4bb2f9' : '#3A77FF',
            success: isDarkMode ? '#27AE60' : '#27AE60',
            error: isDarkMode ? '#EB5757' : '#EB5757',
            warning: isDarkMode ? '#F2994A' : '#F2994A',
            // Dynamic Colors
            background: isDarkMode ? '#000000' : '#FFFFFF',
            surface: isDarkMode ? '#111111' : '#F5F7F8',
            card: isDarkMode ? '#1A1A1A' : '#FFFFFF',
            text: isDarkMode ? '#FFFFFF' : '#002F34',
            textSecondary: isDarkMode ? '#AAAAAA' : '#54757C',
            border: isDarkMode ? '#333333' : '#DDE5E9',
            white: '#FFFFFF',
            black: '#000000',
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
