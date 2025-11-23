import { useTranslation as useI18nTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useI18nTranslation(namespace);

  const changeLanguage = async (language: string) => {
    try {
      console.log('🔄 useTranslation: Changing language to:', language);
      await i18n.changeLanguage(language);
      console.log('🔄 useTranslation: i18n.changeLanguage completed');
      // i18n will automatically call cacheUserLanguage from the language detector
      // but we'll also save it directly to ensure it's saved
      await AsyncStorage.setItem('user-language', language);
      console.log('✅ useTranslation: Language changed and saved successfully');
    } catch (error) {
      console.error('❌ useTranslation: Error changing language:', error);
      throw error;
    }
  };

  const currentLanguage = i18n.language;

  const isRTL = false; // Neither English nor Russian are RTL

  return {
    t,
    changeLanguage,
    currentLanguage,
    isRTL,
    i18n,
  };
};

export default useTranslation;
