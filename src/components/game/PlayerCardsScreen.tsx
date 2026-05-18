import {
  AppButton,
  AppText,
  NewGameButton,
  ScreenContainer,
} from '@/components';
import { BORDER_RADIUS } from '@/constants';
import { Player } from '@/hooks/useActiveGame';
import { commonColors } from '@/styles/colors';
import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  CurriculumItemType,
  getLocalizedHint,
  getLocalizedName,
  hasBuiltinHint,
} from '@/utils/localization';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AdaptiveHintText } from './AdaptiveHintText';

export type CardFace = 'front' | 'role' | 'hint';

type PlayerCardsScreenProps = {
  currentPlayer: Player;
  players: Player[];
  selectedPerson: string;
  setType?: string;
  cardFace: CardFace;
  cardScale: Animated.AnimatedInterpolation<string | number>;
  cardFade: Animated.AnimatedInterpolation<string | number>;
  frontRotateY: Animated.AnimatedInterpolation<string | number>;
  backRotateY: Animated.AnimatedInterpolation<string | number>;
  onShowCard: () => void;
  onShowHint: () => void;
  onNextCard: () => void;
  onReselectPerson?: () => void;
  onNewGame?: () => void;
};

export const PlayerCardsScreen = ({
  currentPlayer,
  players,
  selectedPerson,
  setType,
  cardFace,
  cardScale,
  cardFade,
  frontRotateY,
  backRotateY,
  onShowCard,
  onShowHint,
  onNextCard,
  onReselectPerson,
  onNewGame,
}: PlayerCardsScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [cardContentHeight, setCardContentHeight] = useState(0);

  const onCardBackLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    if (height > 0) {
      setCardContentHeight(height);
    }
  }, []);

  const hintTextMaxHeight = useMemo(() => {
    if (cardContentHeight <= 0) {
      return undefined;
    }
    // Заголовок + отступы; остальное — под текст пояснения
    return Math.max(100, cardContentHeight - 88);
  }, [cardContentHeight]);

  const itemType: CurriculumItemType | undefined = setType
    ? BUILTIN_SET_ID_TO_ITEM_TYPE[setType]
    : undefined;

  const canShowHint = useMemo(
    () =>
      cardFace === 'role' &&
      currentPlayer.role !== 'spy' &&
      Boolean(itemType) &&
      hasBuiltinHint(selectedPerson, itemType),
    [cardFace, currentPlayer.role, itemType, selectedPerson],
  );

  const hintText = useMemo(() => {
    if (cardFace !== 'hint' || !itemType) {
      return '';
    }
    return getLocalizedHint(selectedPerson, itemType);
  }, [cardFace, itemType, selectedPerson]);

  const renderCardBack = () => (
    <View style={styles.cardBackContent} onLayout={onCardBackLayout}>
      {cardFace === 'hint' ? (
        <>
          <AppText
            textAlign="center"
            variant="titleLarge"
            style={{
              opacity: 0.8,
              color: theme.colors.onBackground,
            }}
            mb={16}
          >
            {t('labels.hintTitle')}
          </AppText>
          <AdaptiveHintText
            text={hintText}
            color={theme.colors.onBackground}
            maxHeight={hintTextMaxHeight}
          />
        </>
      ) : (
        <>
          {currentPlayer.role !== 'spy' && (
            <AppText
              textAlign="center"
              variant="titleLarge"
              style={{
                opacity: 0.8,
                color: theme.colors.onBackground,
              }}
              mb={16}
            >
              {t('labels.character')}:
            </AppText>
          )}
          <AppText
            textAlign="center"
            variant="displayLarge"
            style={[
              styles.roleText,
              {
                color:
                  currentPlayer.role === 'spy'
                    ? commonColors.red
                    : theme.colors.primary,
              },
            ]}
          >
            {currentPlayer.role === 'spy'
              ? t('labels.spy')
              : selectedPerson
              ? getLocalizedName(selectedPerson, itemType)
              : ''}
          </AppText>
          {canShowHint && (
            <AppText
              textAlign="center"
              variant="bodySmall"
              style={[styles.tapHint, { color: theme.colors.onBackground }]}
              mt={16}
            >
              {t('game.tapForHint')}
            </AppText>
          )}
        </>
      )}
    </View>
  );

  const backWrapper = (children: React.ReactNode) => {
    const content = (
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          {
            backgroundColor: theme.colors.background,
            transform: [{ scale: cardScale }],
            opacity: cardFade,
            ...(Platform.OS === 'android'
              ? { transform: [{ scale: cardScale }, { rotateY: backRotateY }] }
              : {}),
          },
        ]}
      >
        {children}
      </Animated.View>
    );

    if (canShowHint) {
      return (
        <Pressable onPress={onShowHint} style={styles.cardPressable}>
          {content}
        </Pressable>
      );
    }

    return content;
  };

  return (
    <ScreenContainer type="view">
      <View style={styles.container}>
        <AppText
          variant="titleLarge"
          style={styles.playerInfo}
          textAlign="center"
        >
          {t('game.playerOfTotal', {
            current: currentPlayer.index,
            total: players.length,
          })}
        </AppText>

        <View style={styles.cardContainer}>
          {Platform.OS === 'ios' ? (
            <>
              {cardFace === 'front' ? (
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [{ scale: cardScale }],
                      opacity: cardFade,
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
                backWrapper(renderCardBack())
              )}
            </>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [
                      { scale: cardScale },
                      { rotateY: frontRotateY },
                    ],
                    opacity: cardFade,
                  },
                ]}
              >
                <Image
                  source={require('@/assets/images/welcome_bg.jpg')}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </Animated.View>

              {backWrapper(renderCardBack())}
            </>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          {onReselectPerson && (
            <AppButton
              onPress={onReselectPerson}
              mode="outlined"
              style={styles.reselectButton}
            >
              {t('buttons.reselectPerson')}
            </AppButton>
          )}
          {onNewGame && (
            <NewGameButton
              onPress={onNewGame}
              mode="outlined"
              confirmBeforePress
              style={styles.newGameButton}
            />
          )}
          {cardFace === 'front' ? (
            <AppButton onPress={onShowCard} style={styles.button}>
              {t('buttons.show')}
            </AppButton>
          ) : (
            <AppButton onPress={onNextCard} style={styles.button}>
              {t('buttons.next')}
            </AppButton>
          )}
        </View>
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
  playerInfo: {
    fontWeight: 'bold',
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 0.7,
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPressable: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'android' ? { position: 'absolute' } : {}),
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 12,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
  },
  roleText: {
    fontSize: 56,
    fontWeight: 'bold',
    textShadowColor: commonColors.textShadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tapHint: {
    opacity: 0.65,
  },
  button: {
    minWidth: 200,
  },
  reselectButton: {
    minWidth: 200,
    marginBottom: 0,
  },
  newGameButton: {
    minWidth: 200,
  },
});
