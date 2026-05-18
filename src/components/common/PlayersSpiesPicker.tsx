import { AppText } from '@/components/common/AppText';
import {
  ANIMATION_DURATION,
  ANIMATION_VALUES,
  PICKER_SIZES,
  BORDER_RADIUS,
} from '@/constants';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type PlayersSpiesPickerProps = {
  playersCount: number;
  spiesCount: number;
  onPlayersChange: (count: number) => void;
  onSpiesChange: (count: number) => void;
  minPlayers?: number;
  maxPlayers?: number;
  minSpies?: number;
};

export const PlayersSpiesPicker = ({
  playersCount,
  spiesCount,
  onPlayersChange,
  onSpiesChange,
  minPlayers = 3,
  maxPlayers = 20,
  minSpies = 1,
}: PlayersSpiesPickerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Анимации для цифр игроков
  const playersOpacity = useRef(new Animated.Value(1)).current;
  const playersScale = useRef(new Animated.Value(1)).current;
  const prevPlayersRef = useRef(playersCount);

  // Анимации для цифр шпионов
  const spiesOpacity = useRef(new Animated.Value(1)).current;
  const spiesScale = useRef(new Animated.Value(1)).current;
  const prevSpiesRef = useRef(spiesCount);

  // Анимация при изменении количества игроков
  useEffect(() => {
    if (prevPlayersRef.current !== playersCount) {
      playersOpacity.setValue(ANIMATION_VALUES.OPACITY_START);
      playersScale.setValue(ANIMATION_VALUES.SCALE_START);
      Animated.parallel([
        Animated.timing(playersOpacity, {
          toValue: ANIMATION_VALUES.OPACITY_END,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.spring(playersScale, {
          toValue: ANIMATION_VALUES.SCALE_END,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      prevPlayersRef.current = playersCount;
    }
  }, [playersCount, playersOpacity, playersScale]);

  // Анимация при изменении количества шпионов
  useEffect(() => {
    if (prevSpiesRef.current !== spiesCount) {
      spiesOpacity.setValue(ANIMATION_VALUES.OPACITY_START);
      spiesScale.setValue(ANIMATION_VALUES.SCALE_START);
      Animated.parallel([
        Animated.timing(spiesOpacity, {
          toValue: ANIMATION_VALUES.OPACITY_END,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.spring(spiesScale, {
          toValue: ANIMATION_VALUES.SCALE_END,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      prevSpiesRef.current = spiesCount;
    }
  }, [spiesCount, spiesOpacity, spiesScale]);

  const handlePlayersChange = (delta: number) => {
    const newValue = Math.max(minPlayers, Math.min(maxPlayers, playersCount + delta));
    onPlayersChange(newValue);
    
    // Автоматически корректируем количество шпионов если нужно
    if (spiesCount >= newValue) {
      onSpiesChange(Math.max(minSpies, newValue - 1));
    }
  };

  const handleSpiesChange = (delta: number) => {
    const maxSpies = playersCount - 1;
    const newValue = Math.max(minSpies, Math.min(maxSpies, spiesCount + delta));
    onSpiesChange(newValue);
  };

  const formatValue = (val: number) => {
    return val.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {/* Игроки */}
        <View style={styles.pickerBlock}>
          <View style={styles.labelContainer}>
            <AppText variant="bodySmall" color={theme.colors.onSurfaceVariant}>
              {t('labels.players')}
            </AppText>
          </View>
          <View style={styles.counterContainer}>
            <IconButton
              icon="chevron-up"
              size={24}
              onPress={() => handlePlayersChange(1)}
              disabled={playersCount >= maxPlayers}
              iconColor={theme.colors.primary}
              style={styles.iconButton}
            />
            <View
              style={[
                styles.valueContainer,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Animated.View
                style={[
                  styles.animatedValueContainer,
                  {
                    opacity: playersOpacity,
                    transform: [{ scale: playersScale }],
                  },
                ]}
              >
                <AppText
                  variant="headlineMedium"
                  fontWeight="bold"
                  style={styles.valueText}
                >
                  {formatValue(playersCount)}
                </AppText>
              </Animated.View>
            </View>
            <IconButton
              icon="chevron-down"
              size={24}
              onPress={() => handlePlayersChange(-1)}
              disabled={playersCount <= minPlayers}
              iconColor={theme.colors.primary}
              style={styles.iconButton}
            />
          </View>
        </View>

        <View style={styles.separator}>
          <AppText
            variant="headlineSmall"
            fontWeight="bold"
            color={theme.colors.primary}
          >
            :
          </AppText>
        </View>

        {/* Шпионы */}
        <View style={styles.pickerBlock}>
          <View style={styles.labelContainer}>
            <AppText variant="bodySmall" color={theme.colors.onSurfaceVariant}>
              {t('labels.spy')}
            </AppText>
          </View>
          <View style={styles.counterContainer}>
            <IconButton
              icon="chevron-up"
              size={24}
              onPress={() => handleSpiesChange(1)}
              disabled={spiesCount >= playersCount - 1}
              iconColor={theme.colors.primary}
              style={styles.iconButton}
            />
            <View
              style={[
                styles.valueContainer,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Animated.View
                style={[
                  styles.animatedValueContainer,
                  {
                    opacity: spiesOpacity,
                    transform: [{ scale: spiesScale }],
                  },
                ]}
              >
                <AppText
                  variant="headlineMedium"
                  fontWeight="bold"
                  style={styles.valueText}
                >
                  {formatValue(spiesCount)}
                </AppText>
              </Animated.View>
            </View>
            <IconButton
              icon="chevron-down"
              size={24}
              onPress={() => handleSpiesChange(-1)}
              disabled={spiesCount <= minSpies}
              iconColor={theme.colors.primary}
              style={styles.iconButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  pickerBlock: {
    alignItems: 'center',
    flex: 1,
  },
  labelContainer: {
    marginBottom: 8,
  },
  counterContainer: {
    alignItems: 'center',
  },
  valueContainer: {
    width: PICKER_SIZES.VALUE_CONTAINER,
    height: PICKER_SIZES.VALUE_CONTAINER,
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  valueText: {
    textAlign: 'center',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  iconButton: {
    margin: 0,
  },
  animatedValueContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

