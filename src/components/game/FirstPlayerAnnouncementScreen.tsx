import { AppText } from '@/components';
import { FONT_SIZES } from '@/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type FirstPlayerAnnouncementScreenProps = {
  firstPlayer: number;
  firstPlayerAnnouncementOpacity: Animated.Value;
  firstPlayerAnnouncementScale: Animated.Value;
};

export const FirstPlayerAnnouncementScreen = ({
  firstPlayer,
  firstPlayerAnnouncementOpacity,
  firstPlayerAnnouncementScale,
}: FirstPlayerAnnouncementScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={[styles.blackScreen, { backgroundColor: theme.colors.background }]}
    >
      <Animated.View
        style={{
          opacity: firstPlayerAnnouncementOpacity,
          transform: [{ scale: firstPlayerAnnouncementScale }],
          alignItems: 'center',
        }}
      >
        <AppText
          variant="headlineMedium"
          style={styles.firstPlayerTitle}
          mb={20}
        >
          {t('game.firstPlayerGoes')}
        </AppText>
        <AppText
          variant="displayLarge"
          style={[styles.firstPlayerNumber, { color: theme.colors.primary }]}
          fontWeight="bold"
          mb={40}
        >
          {t('labels.playerNumber', { number: firstPlayer })}
        </AppText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  blackScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstPlayerTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  firstPlayerNumber: {
    fontSize: FONT_SIZES.FIRST_PLAYER_NUMBER,
    textAlign: 'center',
  },
});
