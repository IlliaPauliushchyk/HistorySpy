import { languages } from '@/mocks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage } from 'i18next';
import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import * as RNLocalize from 'react-native-localize';

export const useGetInitialLanguage = () => {
  const [language, setLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRTL, setIsRTL] = useState(false);
  const [rtlKey, setRtlKey] = useState(0);

  const getLanguage = async () => {
    setLoading(true);
    const systemLanguage = RNLocalize.getLocales()[0].languageCode;
    const savedLanguage = await AsyncStorage.getItem('language');
    let targetLanguage = savedLanguage ?? systemLanguage;
    if (
      targetLanguage !== 'ru' &&
      targetLanguage !== 'en' &&
      targetLanguage !== 'be'
    ) {
      targetLanguage = 'ru';
    }

    const shouldBeRTL = false;

    I18nManager.forceRTL(shouldBeRTL);
    I18nManager.allowRTL(true);

    if (I18nManager.isRTL !== shouldBeRTL) {
      setRtlKey(prev => prev + 1);
    }

    setIsRTL(shouldBeRTL);

    await changeLanguage(targetLanguage);
    setLanguage(targetLanguage);
    setLoading(false);
  };

  const selecteLanguage = async (selectedLanguage: (typeof languages)[0]) => {
    await AsyncStorage.setItem('language', selectedLanguage.code);

    const shouldBeRTL = false;

    setIsRTL(shouldBeRTL);
    changeLanguage(selectedLanguage.code);
    setLanguage(selectedLanguage.code);
  };

  const applyRTLChange = (shouldBeRTL: boolean, languageCode: string) => {
    I18nManager.forceRTL(shouldBeRTL);
    I18nManager.allowRTL(true);
    setIsRTL(shouldBeRTL);
    setRtlKey(prev => prev + 1);
    changeLanguage(languageCode);
    setLanguage(languageCode);
  };

  useEffect(() => {
    getLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RNLocalize.getLocales()[0].languageCode]);

  return { language, loading, selecteLanguage, isRTL, rtlKey, applyRTLChange };
};
