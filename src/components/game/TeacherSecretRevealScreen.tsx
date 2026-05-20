import {
  AppButton,
  AppText,
  NewGameButton,
  ScreenContainer,
} from '@/components';
import { BORDER_RADIUS } from '@/constants';
import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  isBuiltinSetTypeId,
} from '@/constants/builtinCurriculum';
import { getLocalizedName } from '@/utils/localization';
import { AdaptiveCardText } from '@/components/game/AdaptiveCardText';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type TeacherSecretRevealScreenProps = {
  selectedPerson: string;
  setType?: string;
  onContinue: () => void;
  onReselectPerson?: () => void;
  onNewGame?: () => void;
};

export const TeacherSecretRevealScreen = ({
  selectedPerson,
  setType,
  onContinue,
  onReselectPerson,
  onNewGame,
}: TeacherSecretRevealScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const itemType =
    setType && isBuiltinSetTypeId(setType)
      ? BUILTIN_SET_ID_TO_ITEM_TYPE[setType]
      : undefined;

  const displayName = getLocalizedName(selectedPerson, itemType);
  const [cardContentHeight, setCardContentHeight] = useState(0);

  const onCardOverlayLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    if (height > 0) {
      setCardContentHeight(height);
    }
  }, []);

  const characterTextMaxHeight =
    cardContentHeight > 0 ? Math.max(72, cardContentHeight - 56) : undefined;

  return (
    <ScreenContainer type="view">
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="titleLarge" textAlign="center" fontWeight="bold">
            {t('game.teacherRevealTitle')}
          </AppText>
          <AppText
            variant="bodyMedium"
            textAlign="center"
            mt={8}
            style={{ opacity: 0.75 }}
          >
            {t('game.teacherRevealSubtitle')}
          </AppText>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Image
            source={require('@/assets/images/welcome_bg.jpg')}
            style={styles.cardImageBg}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay} onLayout={onCardOverlayLayout}>
            <AppText
              textAlign="center"
              variant="titleMedium"
              style={{ opacity: 0.8, color: theme.colors.onBackground }}
              mb={16}
            >
              {t('labels.character')}
            </AppText>
            <AdaptiveCardText
              text={displayName}
              color={theme.colors.primary}
              maxHeight={characterTextMaxHeight}
              maxFontSize={48}
              minFontSize={16}
              maxLines={3}
              fontWeight="bold"
            />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          {onReselectPerson && (
            <AppButton
              onPress={onReselectPerson}
              mode="outlined"
              style={styles.actionButton}
            >
              {t('buttons.reselectPerson')}
            </AppButton>
          )}
          {onNewGame && (
            <NewGameButton
              onPress={onNewGame}
              mode="outlined"
              confirmBeforePress
              style={styles.actionButton}
            />
          )}
          <AppButton onPress={onContinue} style={styles.actionButton}>
            {t('buttons.next')}
          </AppButton>
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
  header: {
    width: '100%',
  },
  card: {
    width: '100%',
    aspectRatio: 0.7,
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.CARD,
    borderWidth: 8,
    overflow: 'hidden',
  },
  cardImageBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    minWidth: 200,
  },
});
