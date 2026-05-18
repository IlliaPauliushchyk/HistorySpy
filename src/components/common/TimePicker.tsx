import { AppText } from '@/components/common/AppText';
import {
  ANIMATION_DURATION,
  ANIMATION_VALUES,
  BORDER_RADIUS,
  PICKER_SIZES,
} from '@/constants';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

type TimePickerProps = {
  value: number; // значение в секундах
  onChange: (seconds: number) => void;
  minSeconds?: number;
  maxSeconds?: number;
  label?: string;
};

export const TimePicker = ({
  value,
  onChange,
  minSeconds = 30,
  maxSeconds = 600,
  label,
}: TimePickerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  // Анимации для цифр
  const minutesOpacity = useRef(new Animated.Value(1)).current;
  const minutesScale = useRef(new Animated.Value(1)).current;
  const secondsOpacity = useRef(new Animated.Value(1)).current;
  const secondsScale = useRef(new Animated.Value(1)).current;
  const prevMinutesRef = useRef(minutes);
  const prevSecondsRef = useRef(seconds);

  // Анимация при изменении минут
  useEffect(() => {
    if (prevMinutesRef.current !== minutes) {
      minutesOpacity.setValue(ANIMATION_VALUES.OPACITY_START);
      minutesScale.setValue(ANIMATION_VALUES.SCALE_START);
      Animated.parallel([
        Animated.timing(minutesOpacity, {
          toValue: ANIMATION_VALUES.OPACITY_END,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.spring(minutesScale, {
          toValue: ANIMATION_VALUES.SCALE_END,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      prevMinutesRef.current = minutes;
    }
  }, [minutes, minutesOpacity, minutesScale]);

  // Анимация при изменении секунд
  useEffect(() => {
    if (prevSecondsRef.current !== seconds) {
      secondsOpacity.setValue(ANIMATION_VALUES.OPACITY_START);
      secondsScale.setValue(ANIMATION_VALUES.SCALE_START);
      Animated.parallel([
        Animated.timing(secondsOpacity, {
          toValue: ANIMATION_VALUES.OPACITY_END,
          duration: ANIMATION_DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.spring(secondsScale, {
          toValue: ANIMATION_VALUES.SCALE_END,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      prevSecondsRef.current = seconds;
    }
  }, [seconds, secondsOpacity, secondsScale]);

  const handleMinutesChange = (delta: number) => {
    const newMinutes = Math.max(0, Math.min(9, minutes + delta));
    const newValue = newMinutes * 60 + seconds;
    if (newValue >= minSeconds && newValue <= maxSeconds) {
      onChange(newValue);
    }
  };

  const handleSecondsChange = (delta: number) => {
    let newSeconds = seconds + delta;
    let newMinutes = minutes;

    // Обработка переполнения секунд
    if (newSeconds >= 60) {
      newMinutes += 1;
      newSeconds = newSeconds % 60;
    } else if (newSeconds < 0) {
      newMinutes -= 1;
      newSeconds = 60 + newSeconds;
    }

    // Проверяем границы минут
    if (newMinutes < 0) {
      newMinutes = 0;
      newSeconds = 0;
    } else if (newMinutes > 9) {
      newMinutes = 9;
      newSeconds = 59;
    }

    const newValue = newMinutes * 60 + newSeconds;
    if (newValue >= minSeconds && newValue <= maxSeconds) {
      onChange(newValue);
    }
  };

  const handleSecondsChangeUp = () => {
    handleSecondsChange(5);
  };

  const handleSecondsChangeDown = () => {
    handleSecondsChange(-5);
  };

  const formatTime = (val: number) => {
    return val.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText
          variant="bodyMedium"
          mb={16}
          color={theme.colors.onSurfaceVariant}
        >
          {label}
        </AppText>
      )}
      <View style={styles.timePickerContainer}>
        {/* Минуты */}
        <View style={styles.timeBlock}>
          <View style={styles.timeLabelContainer}>
            <AppText variant="bodySmall" color={theme.colors.onSurfaceVariant}>
              {t('labels.minutes')}
            </AppText>
          </View>
          <View style={styles.counterContainer}>
            <IconButton
              icon="chevron-up"
              size={24}
              onPress={() => handleMinutesChange(1)}
              disabled={
                minutes >= 9 || (minutes + 1) * 60 + seconds > maxSeconds
              }
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
                    opacity: minutesOpacity,
                    transform: [{ scale: minutesScale }],
                  },
                ]}
              >
                <AppText
                  variant="headlineMedium"
                  fontWeight="bold"
                  style={styles.valueText}
                >
                  {formatTime(minutes)}
                </AppText>
              </Animated.View>
            </View>
            <IconButton
              icon="chevron-down"
              size={24}
              onPress={() => handleMinutesChange(-1)}
              disabled={minutes <= 0 || minutes * 60 + seconds <= minSeconds}
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

        {/* Секунды */}
        <View style={styles.timeBlock}>
          <View style={styles.timeLabelContainer}>
            <AppText variant="bodySmall" color={theme.colors.onSurfaceVariant}>
              {t('labels.seconds')}
            </AppText>
          </View>
          <View style={styles.counterContainer}>
            <IconButton
              icon="chevron-up"
              size={24}
              onPress={handleSecondsChangeUp}
              disabled={
                minutes * 60 + seconds + 5 > maxSeconds ||
                (minutes === 9 && seconds >= 55)
              }
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
                    opacity: secondsOpacity,
                    transform: [{ scale: secondsScale }],
                  },
                ]}
              >
                <AppText
                  variant="headlineMedium"
                  fontWeight="bold"
                  style={styles.valueText}
                >
                  {formatTime(seconds)}
                </AppText>
              </Animated.View>
            </View>
            <IconButton
              icon="chevron-down"
              size={24}
              onPress={handleSecondsChangeDown}
              disabled={
                minutes * 60 + seconds - 5 < minSeconds ||
                (minutes === 0 && seconds === 0)
              }
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
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabelContainer: {
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
