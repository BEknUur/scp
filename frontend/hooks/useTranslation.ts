import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useI18nTranslation(namespace);
  
  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
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
