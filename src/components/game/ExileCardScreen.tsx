import { AppButton, AppText, ScreenContainer } from '@/components';
import { BORDER_RADIUS } from '@/constants';
import { commonColors } from '@/styles/colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type ExileCardScreenProps = {
  playerNumber: number;
  isSpy: boolean;
  isExileCardFlipped: boolean;
  exileCardScale: Animated.AnimatedInterpolation<string | number>;
  exileCardFade: Animated.AnimatedInterpolation<string | number>;
  exileFrontRotateY: Animated.AnimatedInterpolation<string | number>;
  exileBackRotateY: Animated.AnimatedInterpolation<string | number>;
  exileFrontOpacity: Animated.AnimatedInterpolation<string | number>;
  exileBackOpacity: Animated.AnimatedInterpolation<string | number>;
  onContinue: () => void;
};

export const ExileCardScreen = ({
  playerNumber,
  isSpy,
  isExileCardFlipped,
  exileCardScale,
  exileCardFade,
  exileFrontRotateY,
  exileBackRotateY,
  exileFrontOpacity,
  exileBackOpacity,
  onContinue,
}: ExileCardScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenContainer type="view">
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View />
        <View style={styles.cardContainer}>
          {Platform.OS === 'ios' ? (
            // Для iOS используем простую анимацию появления
            <>
              {!isExileCardFlipped ? (
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [{ scale: exileCardScale }],
                      opacity: exileCardFade,
                    },
                  ]}
                >
                  <Image
                    source={require('@/assets/images/welcome_bg.jpg')}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </Animated.View>
              ) : (
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardBack,
                    {
                      backgroundColor: theme.colors.background,
                      transform: [{ scale: exileCardScale }],
                      opacity: exileCardFade,
                    },
                  ]}
                >
                  <View style={styles.cardBackContent}>
                    <AppText
                      textAlign="center"
                      variant="titleLarge"
                      style={{ color: theme.colors.onBackground }}
                      mb={16}
                    >
                      {t('labels.playerNumber', { number: playerNumber })}
                    </AppText>
                    <AppText
                      textAlign="center"
                      variant="displayLarge"
                      style={[
                        styles.roleText,
                        {
                          color: isSpy
                            ? commonColors.red
                            : theme.colors.primary,
                        },
                      ]}
                    >
                      {isSpy ? t('labels.spy') : t('labels.player')}
                    </AppText>
                  </View>
                </Animated.View>
              )}
            </>
          ) : (
            // Для Android используем анимацию поворота
            <>
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [
                      { scale: exileCardScale },
                      { rotateY: exileFrontRotateY },
                    ],
                    opacity: exileCardFade,
                  },
                ]}
              >
                <Animated.View style={{ opacity: exileFrontOpacity }}>
                  <Image
                    source={require('@/assets/images/welcome_bg.jpg')}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </Animated.View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.card,
                  styles.cardBack,
                  {
                    backgroundColor: theme.colors.background,
                    transform: [
                      { scale: exileCardScale },
                      { rotateY: exileBackRotateY },
                    ],
                    opacity: exileCardFade,
                  },
                ]}
              >
                <Animated.View style={{ opacity: exileBackOpacity }}>
                  <View style={styles.cardBackContent}>
                    <AppText
                      textAlign="center"
                      variant="titleLarge"
                      style={{ color: theme.colors.onBackground }}
                      mb={16}
                    >
                      {t('labels.playerNumber', { number: playerNumber })}
                    </AppText>
                    <AppText
                      textAlign="center"
                      variant="displayLarge"
                      style={[
                        styles.roleText,
                        {
                          color: isSpy
                            ? commonColors.red
                            : theme.colors.primary,
                        },
                      ]}
                    >
                      {isSpy ? t('labels.spy') : t('labels.player')}
                    </AppText>
                  </View>
                </Animated.View>
              </Animated.View>
            </>
          )}
        </View>

        {isExileCardFlipped ? (
          <AppButton onPress={onContinue} style={styles.button}>
            {t('buttons.resume')}
          </AppButton>
        ) : (
          <View style={styles.emptyView} />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 0.7,
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    ...(Platform.OS === 'android' ? { position: 'absolute' } : {}),
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.CARD,
    borderWidth: 8,
    borderColor: commonColors.white,
    shadowColor: commonColors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: commonColors.white,
    ...(Platform.OS === 'android' ? { backfaceVisibility: 'hidden' } : {}),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.SMALL,
  },
  cardBack: {
    backgroundColor: commonColors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: commonColors.white,
  },
  cardBackContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 56,
    fontWeight: 'bold',
    textShadowColor: commonColors.textShadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    minWidth: 200,
    marginBottom: 40,
  },
  emptyView: {
    height: 45,
  },
});
