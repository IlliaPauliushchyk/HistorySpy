import {
  AppText,
  MenuRadioItem,
  ScreenContainer,
  useAlert,
} from '@/components';
import { useGetInitialLanguage } from '@/hooks';
import { languages } from '@/mocks';
import { logLanguageChanged, logLanguageScreenOpened } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  I18nManager,
  NativeModules,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// Функция для перезагрузки приложения
const reloadApp = () => {
  try {
    if (NativeModules.DevSettings && NativeModules.DevSettings.reload) {
      NativeModules.DevSettings.reload();
      return;
    }
    try {
      const { DevSettings } = require('react-native');
      if (DevSettings && DevSettings.reload) {
        DevSettings.reload();
        return;
      }
    } catch (e) {
      // Игнорируем ошибку
    }
    console.warn(
      'Could not reload app automatically. Please restart the app manually.',
    );
  } catch (e) {
    console.warn('Could not reload app:', e);
  }
};

export const LanguageScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language, loading, selecteLanguage, applyRTLChange } =
    useGetInitialLanguage();
  const { alert } = useAlert();
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<{ [key: string]: View | null }>({});
  const hasScrolledRef = useRef(false);

  // Прокрутка к выбранному языку
  const scrollToSelectedLanguage = (langCode: string | null) => {
    if (!langCode || !scrollViewRef.current) return;

    // Используем setTimeout для обеспечения рендеринга элементов
    setTimeout(() => {
      const itemRef = itemRefs.current[langCode];
      if (itemRef && scrollViewRef.current) {
        itemRef.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 50), // Отступ сверху 50px
              animated: true,
            });
          },
          () => {
            // Fallback: прокрутка по примерной позиции
            const selectedIndex = languages.findIndex(
              lang => lang.code === langCode,
            );
            if (selectedIndex !== -1) {
              const estimatedItemHeight = 60; // Примерная высота элемента
              const estimatedY = selectedIndex * estimatedItemHeight;
              scrollViewRef.current?.scrollTo({
                y: Math.max(0, estimatedY - 50),
                animated: true,
              });
            }
          },
        );
      }
    }, 300);
  };

  // Прокрутка только при первом открытии экрана
  useEffect(() => {
    if (!loading && language && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      scrollToSelectedLanguage(language);
    }
  }, [loading, language]);

  // Логируем открытие экрана выбора языка
  useEffect(() => {
    if (!loading) {
      logLanguageScreenOpened();
    }
  }, [loading]);

  const handleLanguageSelect = async (
    selectedLanguage: (typeof languages)[0],
  ) => {
    const shouldBeRTL = false;
    const currentIsRTL = I18nManager.isRTL;

    // Если нужно переключить RTL (на арабский или с арабского), показываем модальное окно
    if (currentIsRTL !== shouldBeRTL) {
      alert({
        title: t('messages.rtlRestartTitle'),
        message: t('messages.rtlRestartMessage'),
        confirmText: t('messages.rtlRestartConfirm'),
        cancelText: t('messages.rtlRestartCancel'),
        onConfirm: async () => {
          const oldLanguage = language || 'ru';
          // Сначала сохраняем язык в AsyncStorage, чтобы при перезагрузке он правильно загрузился
          await AsyncStorage.setItem('language', selectedLanguage.code);

          // Логируем изменение языка
          logLanguageChanged({
            oldLanguage,
            newLanguage: selectedLanguage.code,
            requiresRestart: true,
          });

          // Применяем изменения RTL
          applyRTLChange(shouldBeRTL, selectedLanguage.code);

          // Перезагружаем приложение
          setTimeout(() => {
            reloadApp();
          }, 300);
        },
        onCancel: () => {
          // Отменяем изменение языка
        },
      });
    } else {
      // Если RTL не меняется, просто меняем язык без перезагрузки
      const oldLanguage = language || 'ru';
      logLanguageChanged({
        oldLanguage,
        newLanguage: selectedLanguage.code,
        requiresRestart: false,
      });
      selecteLanguage(selectedLanguage);
    }
  };

  return (
    <ScreenContainer
      loading={loading}
      title={t('titles.language')}
      navigation={navigation}
    >
      <AppText variant="bodyLarge" mh={20} mb={10} mt={0}>
        {t('text.language')}
      </AppText>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.card}>
          {languages.map(item => (
            <View
              key={item.code}
              ref={ref => {
                itemRefs.current[item.code] = ref;
              }}
            >
              <MenuRadioItem
                title={t(item.title)}
                checked={item.code === language}
                onPress={() => handleLanguageSelect(item)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  card: {
    marginBottom: 20,
  },
});
