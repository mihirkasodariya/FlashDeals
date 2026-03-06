import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en.json';
import hi from './translations/hi.json';
import gj from './translations/gj.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    gj: { translation: gj }
};

const LANGUAGE_KEY = 'app_language';

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
        // Fallback to device locale if no language is saved
        savedLanguage = Localization.getLocales()[0].languageCode;
    }

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false // react already safes from xss
            }
        });
};

initI18n();

export default i18n;
