import {
  AppButton,
  AppText,
  PlayersSpiesPicker,
  TimePicker,
} from '@/components';
import { BuiltinSetGroupAccordion } from '@/forms/components/BuiltinSetGroupAccordion';
import { FormikHelpers, useFormik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Switch,
  useTheme,
} from 'react-native-paper';
import * as Yup from 'yup';
import { logSetInfoViewed, logSetSelected } from '@/utils/analytics';

export type GameSettingsFormValues = {
  playersCount: number;
  spiesCount: number;
  roundTime: number | null; // null означает бесконечное время
  infiniteTime: boolean;
  setType: string;
  suggestQuestionEnabled: boolean; // кнопка «Предложить вопрос» во время игры
};

export type GameSettingsFormSubmitHandler = (
  values: GameSettingsFormValues,
  formikHelpers: FormikHelpers<GameSettingsFormValues>,
) => void | Promise<void>;

const gameSettingsValidationSchema = (t: (key: string) => string) =>
  Yup.object({
    playersCount: Yup.number()
      .required(t('validation.playersCountRequired'))
      .min(3, t('validation.playersCountMin'))
      .max(20, t('validation.playersCountMax'))
      .integer(t('validation.playersCountInteger')),
    spiesCount: Yup.number()
      .required(t('validation.spiesCountRequired'))
      .min(1, t('validation.spiesCountMin'))
      .integer(t('validation.spiesCountInteger'))
      .test(
        'lessThanPlayers',
        t('validation.spiesCountLessThanPlayers'),
        function (value) {
          const playersCount = this.parent.playersCount;
          return value !== undefined && value < playersCount;
        },
      ),
    roundTime: Yup.number()
      .nullable()
      .when('infiniteTime', {
        is: false,
        then: schema =>
          schema
            .required(t('validation.roundTimeRequired'))
            .min(30, t('validation.roundTimeMin'))
            .max(600, t('validation.roundTimeMax'))
            .integer(t('validation.roundTimeInteger')),
        otherwise: schema => schema.nullable(),
      }),
    infiniteTime: Yup.boolean().required(),
    setType: Yup.string().required(t('validation.setTypeRequired')),
    suggestQuestionEnabled: Yup.boolean().required(),
  });

type Props = {
  onSubmit: GameSettingsFormSubmitHandler;
  initialValues: GameSettingsFormValues;
  loading?: boolean;
  error?: string;
  onEditSetsPress?: (activeTab: 'builtin' | 'custom') => void;
  onInfoSetPress?: (setId: string) => void;
  onCreateSetPress?: () => void;
  availableSets?: AvailableSet[];
  hideSubmitButton?: boolean;
  onSubmitPress?: (handleSubmit: () => void) => void;
};

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;
const MIN_SPIES = 1;
const MIN_ROUND_TIME = 30;
const MAX_ROUND_TIME = 600;

type AnimatedCardProps = {
  children: React.ReactNode;
  index: number;
};

import {
  ANIMATION_DELAY,
  ANIMATION_DURATION,
  ANIMATION_VALUES,
} from '@/constants';

const AnimatedCard = ({ children, index }: AnimatedCardProps) => {
  const cardOpacity = useRef(
    new Animated.Value(ANIMATION_VALUES.OPACITY_START),
  ).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: ANIMATION_VALUES.OPACITY_END,
        duration: ANIMATION_DURATION.NORMAL,
        delay: index * ANIMATION_DELAY.CARD_STAGGER,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: ANIMATION_DURATION.NORMAL,
        delay: index * ANIMATION_DELAY.CARD_STAGGER,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [{ translateY: cardTranslateY }],
      }}
    >
      {children}
    </Animated.View>
  );
};

type SetTypeButtonProps = {
  label: string;
  icon?: string;
  isSelected: boolean;
  onPress: () => void;
  onInfoPress?: () => void;
  style?: any;
};

type AvailableSet = {
  id: string;
  name: string;
  type: 'base' | 'custom';
  isModified: boolean;
};

type BuiltinGroupId = 'worldHistory' | 'belarusHistory';

type BuiltinSetGroup = {
  id: BuiltinGroupId;
  title: string;
  setIds: string[];
};

const SetTypeButton = ({
  label,
  icon,
  isSelected,
  onPress,
  onInfoPress,
  style,
}: SetTypeButtonProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.setTypeButtonCustom,
        style,
        {
          backgroundColor: isSelected ? theme.colors.primary : 'transparent',
          borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
          borderWidth: 1,
          borderRadius: 28,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.setTypeButtonContentCustom}
        activeOpacity={0.7}
      >
        {icon && (
          <IconButton
            icon={icon}
            size={20}
            iconColor={
              isSelected ? theme.colors.onPrimary : theme.colors.onSurface
            }
            style={styles.setTypeButtonIcon}
          />
        )}
        <AppText
          variant="bodyMedium"
          style={[
            styles.setTypeButtonText,
            {
              color: isSelected
                ? theme.colors.onPrimary
                : theme.colors.onSurface,
            },
          ]}
          numberOfLines={2}
          textAlign="left"
        >
          {label}
        </AppText>
      </TouchableOpacity>
      {onInfoPress && (
        <IconButton
          icon="information-outline"
          size={20}
          iconColor={
            isSelected ? theme.colors.onPrimary : theme.colors.onSurface
          }
          onPress={onInfoPress}
          style={[styles.setTypeButtonIcon, styles.setTypeButtonInfoIcon]}
        />
      )}
    </View>
  );
};

const baseSetIds = [
  'worldHistoryDefinitions',
  'worldHistoryNames',
  'worldHistoryEvents',
  'belarusHistoryDefinitions',
  'belarusHistoryNames',
  'belarusHistoryEvents',
];

export const GameSettingsForm = ({
  onSubmit,
  initialValues,
  loading = false,
  error,
  onEditSetsPress,
  onInfoSetPress,
  onCreateSetPress,
  availableSets = [],
  hideSubmitButton = false,
  onSubmitPress,
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>(() =>
    baseSetIds.includes(initialValues.setType) ? 'builtin' : 'custom',
  );
  const [openBuiltinGroup, setOpenBuiltinGroup] =
    useState<BuiltinGroupId>('worldHistory');
  const baseSets = availableSets.filter(s => s.type === 'base');
  const customSets = availableSets.filter(s => s.type === 'custom');
  const hasCustomSets = customSets.length > 0;
  const baseSetsById = useMemo(
    () => new Map(baseSets.map(set => [set.id, set])),
    [baseSets],
  );

  const builtinSetGroups = useMemo<BuiltinSetGroup[]>(
    () => [
      {
        id: 'worldHistory',
        title: t('labels.groupWorldHistory'),
        setIds: [
          'worldHistoryDefinitions',
          'worldHistoryNames',
          'worldHistoryEvents',
        ],
      },
      {
        id: 'belarusHistory',
        title: t('labels.groupBelarusHistory'),
        setIds: [
          'belarusHistoryDefinitions',
          'belarusHistoryNames',
          'belarusHistoryEvents',
        ],
      },
    ],
    [t],
  );

  const formik = useFormik<GameSettingsFormValues>({
    initialValues,
    validationSchema: gameSettingsValidationSchema(t),
    enableReinitialize: true,
    onSubmit,
  });

  const {
    values,
    touched,
    errors,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
  } = formik;

  // Анимация для блока выбора времени
  // Инициализируем в зависимости от начального значения infiniteTime
  const timePickerHeight = useRef(
    new Animated.Value(initialValues.infiniteTime ? 0 : 1),
  ).current;
  const timePickerOpacity = useRef(
    new Animated.Value(initialValues.infiniteTime ? 0 : 1),
  ).current;
  const timePickerContentHeight = useRef<number | null>(null);

  useEffect(() => {
    if (onSubmitPress) {
      onSubmitPress(handleSubmit);
    }
  }, [handleSubmit, onSubmitPress]);

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  // Обработка переключения бесконечного времени
  const handleInfiniteTimeToggle = (value: boolean) => {
    setFieldValue('infiniteTime', value);
    if (value) {
      setFieldValue('roundTime', null);
      // Схлопываем блок с выбором времени
      Animated.parallel([
        Animated.timing(timePickerHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(timePickerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      setFieldValue('roundTime', 60); // Значение по умолчанию
      // Показываем блок с выбором времени
      if (timePickerContentHeight.current !== null) {
        Animated.parallel([
          Animated.timing(timePickerHeight, {
            toValue: ANIMATION_VALUES.OPACITY_END,
            duration: ANIMATION_DURATION.NORMAL,
            useNativeDriver: false,
          }),
          Animated.timing(timePickerOpacity, {
            toValue: ANIMATION_VALUES.OPACITY_END,
            duration: ANIMATION_DURATION.NORMAL,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }
  };

  const maxSpies = values.playersCount - 1;
  const iconMap: Record<string, string> = {
    worldHistoryDefinitions: 'book-open-variant',
    worldHistoryNames: 'account',
    worldHistoryEvents: 'calendar-clock',
    belarusHistoryDefinitions: 'book-open-page-variant',
    belarusHistoryNames: 'account-tie',
    belarusHistoryEvents: 'flag',
  };

  return (
    <View style={styles.container}>
      {/* Блок 1: Игроки и шпионы */}
      <AnimatedCard index={0}>
        <Card style={styles.card}>
          <Card.Content>
            <AppText variant="titleMedium" mb={16} fontWeight="bold">
              {t('labels.players')} & {t('labels.spy')}
            </AppText>
            <PlayersSpiesPicker
              playersCount={values.playersCount}
              spiesCount={values.spiesCount}
              onPlayersChange={count => {
                setFieldValue('playersCount', count);
                handleBlur('playersCount');
              }}
              onSpiesChange={count => {
                setFieldValue('spiesCount', count);
                handleBlur('spiesCount');
              }}
              minPlayers={MIN_PLAYERS}
              maxPlayers={MAX_PLAYERS}
              minSpies={MIN_SPIES}
            />
            {errors.playersCount && touched.playersCount && (
              <AppText variant="bodySmall" mt={8} color={theme.colors.error}>
                {errors.playersCount}
              </AppText>
            )}
            {errors.spiesCount && touched.spiesCount && (
              <AppText variant="bodySmall" mt={8} color={theme.colors.error}>
                {errors.spiesCount}
              </AppText>
            )}
          </Card.Content>
        </Card>
      </AnimatedCard>

      {/* Блок 2: Время раунда */}
      <AnimatedCard index={1}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.timeHeader}>
              <AppText variant="titleMedium" fontWeight="bold">
                {t('labels.roundTime')}
              </AppText>
              <View style={styles.switchRow}>
                <AppText variant="bodyMedium">
                  {t('labels.infiniteTime')}
                </AppText>
                <Switch
                  value={values.infiniteTime}
                  onValueChange={handleInfiniteTimeToggle}
                />
              </View>
            </View>
            <Animated.View
              style={{
                height: timePickerHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, timePickerContentHeight.current || 200],
                }),
                opacity: timePickerOpacity,
                overflow: 'hidden',
              }}
            >
              <View
                onLayout={event => {
                  const { height } = event.nativeEvent.layout;
                  if (timePickerContentHeight.current === null && height > 0) {
                    timePickerContentHeight.current = height;
                  }
                }}
              >
                <TimePicker
                  value={values.roundTime || 60}
                  onChange={(value: number) => {
                    setFieldValue('roundTime', value);
                    handleBlur('roundTime');
                  }}
                  minSeconds={MIN_ROUND_TIME}
                  maxSeconds={MAX_ROUND_TIME}
                />
                {errors.roundTime && touched.roundTime && (
                  <AppText
                    variant="bodySmall"
                    mt={8}
                    color={theme.colors.error}
                  >
                    {errors.roundTime}
                  </AppText>
                )}
                <AppText
                  variant="bodySmall"
                  mt={8}
                  color={theme.colors.onSurfaceVariant}
                >
                  {t('labels.roundTimeRecommended')}
                </AppText>
              </View>
            </Animated.View>
            <Animated.View
              style={{
                opacity: timePickerOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              }}
            >
              {values.infiniteTime && (
                <AppText
                  variant="bodyMedium"
                  mt={12}
                  color={theme.colors.primary}
                >
                  {t('game.roundTimeInfinite')}
                </AppText>
              )}
            </Animated.View>
            <Divider style={styles.divider} />
            <View style={styles.switchRow}>
              <AppText variant="bodyMedium">
                {t('labels.suggestQuestion')}
              </AppText>
              <Switch
                value={values.suggestQuestionEnabled}
                onValueChange={value => {
                  setFieldValue('suggestQuestionEnabled', value);
                }}
              />
            </View>
          </Card.Content>
        </Card>
      </AnimatedCard>

      {/* Блок 3: Наборы */}
      <AnimatedCard index={2}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.setTypeHeader}>
              <AppText variant="titleMedium" fontWeight="bold">
                {t('labels.set')}
              </AppText>
              {onEditSetsPress && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => onEditSetsPress(activeTab)}
                />
              )}
            </View>
            <View style={styles.tabRow}>
              <Button
                mode={activeTab === 'builtin' ? 'contained' : 'outlined'}
                onPress={() => setActiveTab('builtin')}
                compact
                style={[styles.tabButton, { flex: 1 }]}
                contentStyle={styles.tabButtonContent}
                labelStyle={styles.tabButtonLabel}
              >
                {t('labels.builtInSets')}
              </Button>
              <Button
                mode={activeTab === 'custom' ? 'contained' : 'outlined'}
                onPress={() => setActiveTab('custom')}
                compact
                style={[styles.tabButton, { flex: 1 }]}
                contentStyle={styles.tabButtonContent}
                labelStyle={styles.tabButtonLabel}
              >
                {t('labels.mySets')}
              </Button>
            </View>
            <Divider style={styles.tabDivider} />
            <View style={styles.setTypeContainer}>
              {activeTab === 'builtin' && (
                <>
                  {builtinSetGroups.map(group => {
                    const groupSets = group.setIds
                      .map(setId => baseSetsById.get(setId))
                      .filter((set): set is AvailableSet => !!set);
                    if (!groupSets.length) return null;

                    return (
                      <BuiltinSetGroupAccordion
                        key={group.id}
                        title={group.title}
                        sets={groupSets}
                        isOpen={openBuiltinGroup === group.id}
                        onToggle={() => {
                          setOpenBuiltinGroup(prev =>
                            prev === group.id ? prev : group.id,
                          );
                        }}
                        renderSetButton={set => (
                          <SetTypeButton
                            key={set.id}
                            label={`${set.name}${set.isModified ? ' *' : ''}`}
                            icon={iconMap[set.id]}
                            isSelected={values.setType === set.id}
                            onPress={() => {
                              setFieldValue('setType', set.id);
                              logSetSelected({
                                setType: set.id,
                                setName: set.name,
                                isCustom: false,
                                isModified: set.isModified,
                              });
                            }}
                            onInfoPress={
                              onInfoSetPress
                                ? () => {
                                    onInfoSetPress(set.id);
                                    logSetInfoViewed({
                                      setType: set.id,
                                      setName: set.name,
                                      isCustom: false,
                                    });
                                  }
                                : undefined
                            }
                            style={styles.setTypeButtonFull}
                          />
                        )}
                      />
                    );
                  })}
                </>
              )}
              {activeTab === 'custom' && (
                <>
                  {hasCustomSets
                    ? customSets.map(set => (
                        <SetTypeButton
                          key={set.id}
                          label={set.name}
                          isSelected={values.setType === set.id}
                          onPress={() => {
                            setFieldValue('setType', set.id);
                            // Аналитика для кастомных наборов отключена
                          }}
                          style={styles.setTypeButtonFull}
                        />
                      ))
                    : onCreateSetPress && (
                        <AppButton
                          mode="outlined"
                          onPress={onCreateSetPress}
                          icon="plus"
                          style={styles.createSetButton}
                        >
                          {t('buttons.createSet')}
                        </AppButton>
                      )}
                </>
              )}
            </View>
            {errors.setType && touched.setType && (
              <AppText variant="bodySmall" mt={8} color={theme.colors.error}>
                {errors.setType}
              </AppText>
            )}
          </Card.Content>
        </Card>
      </AnimatedCard>

      {/* Кнопка отправки */}
      {!hideSubmitButton && (
        <AppButton
          mode="contained"
          loading={loading}
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {t('game.startGame')}
        </AppButton>
      )}

      {error && (
        <AppText variant="bodySmall" mt={16} color={theme.colors.error}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    marginVertical: 12,
  },
  timeInput: {
    marginTop: 8,
  },
  setTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: -12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  tabButton: {
    minHeight: 32,
  },
  tabButtonContent: {
    paddingVertical: 0,
  },
  tabButtonLabel: {
    fontSize: 13,
  },
  tabDivider: {
    marginVertical: 10,
  },
  setTypeContainer: {
    gap: 12,
  },
  createSetButton: {
    width: '100%',
    minHeight: 48,
  },
  setTypeButton: {
    flex: 1,
    minHeight: 48,
  },
  setTypeButtonHalf: {
    flex: 1,
  },
  setTypeButtonFull: {
    width: '100%',
  },
  setTypeButtonContent: {
    paddingVertical: 8,
    minHeight: 48,
  },
  setTypeButtonCustom: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  setTypeButtonContentCustom: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  setTypeButtonIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setTypeButtonIcon: {
    margin: 0,
  },
  setTypeButtonInfoIcon: {
    marginRight: 4,
  },
  setTypeButtonText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
