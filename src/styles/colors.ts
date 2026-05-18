import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import merge from 'deepmerge';
import { MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';

const PaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Основной — латунь / печать (акцент досье)
    primary: 'rgb(198, 162, 108)',
    onPrimary: 'rgb(26, 22, 18)',
    primaryContainer: 'rgb(72, 56, 38)',
    onPrimaryContainer: 'rgb(242, 228, 204)',

    // Вторичный — пергамент / выцветшая бумага
    secondary: 'rgb(212, 204, 188)',
    onSecondary: 'rgb(28, 24, 20)',
    secondaryContainer: 'rgb(58, 52, 46)',
    onSecondaryContainer: 'rgb(232, 224, 210)',

    // Третичный — сургуч / тайное досье
    tertiary: 'rgb(158, 58, 68)',
    onTertiary: 'rgb(255, 248, 245)',
    tertiaryContainer: 'rgb(88, 28, 36)',
    onTertiaryContainer: 'rgb(255, 210, 214)',

    // Ошибка — тревога, срыв операции
    error: 'rgb(220, 90, 82)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(120, 32, 32)',
    onErrorContainer: 'rgb(255, 218, 214)',

    // Фон — тёмный «ночной архив», без зелени поля
    background: 'rgb(14, 13, 16)',
    onBackground: 'rgb(226, 220, 210)',

    // Поверхность — чуть светлее, тёплый графит
    surface: 'rgb(26, 24, 28)',
    onSurface: 'rgb(226, 220, 210)',

    surfaceVariant: 'rgb(62, 56, 64)',
    onSurfaceVariant: 'rgb(196, 188, 178)',

    outline: 'rgb(132, 124, 118)',
    outlineVariant: 'rgb(56, 52, 58)',

    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',

    inverseSurface: 'rgb(226, 220, 210)',
    inverseOnSurface: 'rgb(42, 38, 36)',
    inversePrimary: 'rgb(150, 118, 72)',

    // Слои карточек — тёплые приподнятые плоскости
    elevation: {
      level0: 'transparent',
      level1: 'rgb(32, 29, 34)',
      level2: 'rgb(36, 32, 38)',
      level3: 'rgb(40, 36, 42)',
      level4: 'rgb(44, 39, 46)',
      level5: 'rgb(48, 42, 50)',
    },

    surfaceDisabled: 'rgba(226, 220, 210, 0.12)',
    onSurfaceDisabled: 'rgba(226, 220, 210, 0.38)',

    // Затемнение модалок — сепия, не «полевая» зелень
    backdrop: 'rgba(18, 12, 10, 0.88)',
  },
};

const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDefaultTheme,
});

export const CombinedDefaultTheme = merge(LightTheme, PaperTheme);

export const commonColors = {
  lightRed: 'rgba(255, 50, 50, 0.5)',
  lightGreen: 'rgba(50, 200, 50, 0.5)',
  lightPrimary: 'rgba(198, 162, 108, 0.22)',
  // Основные цвета
  red: '#FF0000', // Цвет шпиона
  white: '#FFFFFF', // Белый цвет
  black: '#000000', // Черный цвет
  green: '#4CAF50', // Зеленый цвет для победителей
  // Полупрозрачные цвета
  modalOverlay: 'rgba(0, 0, 0, 0.5)', // Затемнение для модальных окон
  alertOverlay: 'rgba(0, 0, 0, 0.7)', // Затемнение для алертов
  textShadow: 'rgba(0, 0, 0, 0.3)', // Тень для текста
};
