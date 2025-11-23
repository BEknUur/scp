import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import enCommon from '../locales/en/common.json';
import ruCommon from '../locales/ru/common.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      console.log('🔍 Detecting language...');
      const savedLanguage = await AsyncStorage.getItem('user-language');
      console.log('📦 Saved language from storage:', savedLanguage);
      if (savedLanguage) {
        console.log('✅ Using saved language:', savedLanguage);
        callback(savedLanguage);
      } else {
        console.log('⚠️ No saved language, using default: en');
        callback('en');
      }
    } catch (error) {
      console.error('❌ Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {
    console.log('🚀 Language detector initialized');
  },
  cacheUserLanguage: async (lng: string) => {
    try {
      console.log('💾 Caching language:', lng);
      await AsyncStorage.setItem('user-language', lng);
      console.log('✅ Language cached successfully');
    } catch (error) {
      console.error('❌ Error caching language:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    debug: __DEV__,

    resources: {
      en: {
        common: enCommon,
      },
      ru: {
        common: ruCommon,
      },
    },

    defaultNS: 'common',
    ns: ['common'],

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    // Enable language detection
    detection: {
      order: ['asyncStorage'],
      caches: ['asyncStorage'],
    },
  })
  .then(() => {
    console.log('🎉 i18n initialized successfully, current language:', i18n.language);
  })
  .catch((error) => {
    console.error('❌ i18n initialization error:', error);
  });

export default i18n;
