import {
  AppButton,
  AppText,
  BackgroundImage,
  ScreenContainer,
} from '@/components';
import { Screens } from '@/constants';
import { logNewGameFromHome } from '@/utils/analytics';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

const LOGO_SIZE = Dimensions.get('window').width * 0.35;
const LOGO_BORDER_RADIUS = LOGO_SIZE / 2;

export const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [isAnimated, setIsAnimated] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Запускаем анимацию когда экран в фокусе
      setIsAnimated(true);
      return () => {
        // Останавливаем анимацию когда экран теряет фокус
        setIsAnimated(false);
      };
    }, []),
  );

  const handleNewGamePress = () => {
    logNewGameFromHome();
    navigation.navigate(Screens.gameSettings);
  };

  return (
    <ScreenContainer>
      <BackgroundImage animated={isAnimated}>
        {/* <Image
          source={require('@/assets/images/app_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
        <Card>
          <Card.Content style={styles.content}>
            <AppText
              mt={-5}
              mb={10}
              textAlign="center"
              fontWeight={'bold'}
              variant="headlineMedium"
            >
              {t('titles.home')}
            </AppText>
            <AppButton onPress={handleNewGamePress} mb={10}>
              {t('buttons.newGame')}
            </AppButton>
            <AppButton
              mode="outlined"
              onPress={() => navigation.navigate(Screens.editSets)}
              mb={10}
            >
              {t('buttons.editSets')}
            </AppButton>
            <AppButton
              mode="outlined"
              onPress={() => navigation.navigate(Screens.language)}
              mb={10}
            >
              {t('buttons.language')}
            </AppButton>
            <AppButton
              mode="outlined"
              onPress={() => navigation.navigate(Screens.rules)}
            >
              {t('buttons.rules')}
            </AppButton>
          </Card.Content>
        </Card>
      </BackgroundImage>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignSelf: 'center',
    position: 'absolute',
    top: 40,
    zIndex: 2,
    marginTop: 20,
    borderRadius: LOGO_BORDER_RADIUS,
  },
  content: {
    paddingHorizontal: 25,
  },
});
