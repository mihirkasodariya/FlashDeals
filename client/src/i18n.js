import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en.json';
import hi from './translations/hi.json';
import gj from './translations/gj.json';
import mr from './translations/mr.json';
import bn from './translations/bn.json';
import ur from './translations/ur.json';
import ta from './translations/ta.json';
import te from './translations/te.json';
import kn from './translations/kn.json';
import ml from './translations/ml.json';
import pa from './translations/pa.json';
import or from './translations/or.json';
import as from './translations/as.json';
import ma from './translations/ma.json';
import sa from './translations/sa.json';
import ar from './translations/ar.json';
import ja from './translations/ja.json';
import zh from './translations/zh.json';
import ko from './translations/ko.json';
import fr from './translations/fr.json';
import de from './translations/de.json';
import it from './translations/it.json';
import es from './translations/es.json';
import pt from './translations/pt.json';
import ru from './translations/ru.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    gj: { translation: gj },
    mr: { translation: mr },
    bn: { translation: bn },
    ur: { translation: ur },
    ta: { translation: ta },
    te: { translation: te },
    kn: { translation: kn },
    ml: { translation: ml },
    pa: { translation: pa },
    or: { translation: or },
    as: { translation: as },
    ma: { translation: ma },
    sa: { translation: sa },
    ar: { translation: ar },
    ja: { translation: ja },
    zh: { translation: zh },
    ko: { translation: ko },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    es: { translation: es },
    pt: { translation: pt },
    ru: { translation: ru }
};

const LANGUAGE_KEY = 'app_language';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // Default to English initially
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

// Load saved language asynchronously
(async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            await i18n.changeLanguage(savedLanguage);
        } else {
            const deviceLocale = Localization.getLocales()[0].languageCode;
            if (resources[deviceLocale]) {
                await i18n.changeLanguage(deviceLocale);
            }
        }
    } catch (error) {
        console.error('Error loading language from storage:', error);
    }
})();

export default i18n;
