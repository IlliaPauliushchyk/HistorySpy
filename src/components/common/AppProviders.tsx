import { DATA_SOURCE } from '@/constants';
import { ILanguage, useGetInitialLanguage } from '@/hooks';
import '@/localization/i18n';
import { store } from '@/store';
import { CombinedDefaultTheme } from '@/styles';
import {
  clearFirestoreCache,
  preloadDataFromFirestore,
} from '@/utils/localization';
import { NavigationContainer } from '@react-navigation/native';
import React, { ReactNode, useEffect, useState } from 'react';
import { Platform, UIManager, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { AlertProvider } from './Alert';
import { Spinner } from './Spinner';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = {
  children: ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  const {
    language,
    loading: languageLoading,
    rtlKey,
  } = useGetInitialLanguage();
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  // Предзагружаем данные из Firestore при изменении языка
  useEffect(() => {
    if (language) {
      // Очищаем кэш при смене языка, чтобы загрузить актуальные данные
      clearFirestoreCache();
      setFirestoreLoading(true);
      // Принудительно перезагружаем данные при смене языка
      preloadDataFromFirestore(language as ILanguage, true)
        .then(() => {
          const source = DATA_SOURCE === 'mocks' ? 'mocks' : 'Firestore';
          console.log(
            `✅ Data loaded from ${source} for language: ${language}`,
          );
          setFirestoreLoading(false);
        })
        .catch(error => {
          console.warn('⚠️ Failed to preload data, using mocks:', error);
          // Продолжаем работу с моками в случае ошибки
          setFirestoreLoading(false);
        });
    } else {
      // Если язык еще не загружен, не показываем прелоадер Firestore
      setFirestoreLoading(false);
    }
  }, [language]);

  // Показываем прелоадер пока загружается язык или данные из Firestore
  if (languageLoading || firestoreLoading) {
    return (
      <SafeAreaProvider>
        <Provider store={store}>
          <PaperProvider theme={CombinedDefaultTheme}>
            <View style={{ flex: 1 }}>
              <Spinner />
            </View>
          </PaperProvider>
        </Provider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemedApp key={`app-${rtlKey}`}>
          <AlertProvider>{children}</AlertProvider>
        </ThemedApp>
      </Provider>
    </SafeAreaProvider>
  );
};

const ThemedApp = ({ children }: Props) => {
  return (
    <PaperProvider theme={CombinedDefaultTheme}>
      <NavigationContainer theme={CombinedDefaultTheme}>
        {children}
      </NavigationContainer>
    </PaperProvider>
  );
};
