import { AppText, ScreenContainer } from '@/components';
import {
  ANIMATION_DELAY,
  ANIMATION_DURATION,
  ANIMATION_VALUES,
  STEP_NUMBER_SIZE,
} from '@/constants';
import { commonColors } from '@/styles/colors';
import { logRulesViewed } from '@/utils/analytics';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import { Card, Divider, useTheme } from 'react-native-paper';

type AnimatedCardProps = {
  children: React.ReactNode;
  index: number;
};

const AnimatedCard = ({ children, index }: AnimatedCardProps) => {
  const cardOpacity = useRef(new Animated.Value(0)).current;
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

export const RulesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const theme = useTheme();

  useEffect(() => {
    logRulesViewed();
  }, []);

  return (
    <ScreenContainer
      type="scrollView"
      title={t('titles.rules')}
      navigation={navigation}
    >
      <View style={styles.container}>
        {/* Правила игры */}
        <AnimatedCard index={0}>
          <Card style={styles.card}>
            <Card.Content>
              <AppText variant="titleMedium" mb={16} fontWeight="bold">
                {t('rules.gameRules')}
              </AppText>
              <AppText variant="bodyMedium" mb={12}>
                {t('rules.gameRulesDescription')}
              </AppText>
            </Card.Content>
          </Card>
        </AnimatedCard>

        {/* Роли */}
        <AnimatedCard index={1}>
          <Card style={styles.card}>
            <Card.Content>
              <AppText variant="titleMedium" mb={16} fontWeight="bold">
                {t('rules.roles')}
              </AppText>

              <View style={styles.roleSection}>
                <AppText variant="titleSmall" mb={8} fontWeight="bold">
                  {t('labels.player')}
                </AppText>
                <AppText variant="bodyMedium" color={theme.colors.primary}>
                  {t('rules.playerDescription')}
                </AppText>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.roleSection}>
                <AppText variant="titleSmall" mb={8} fontWeight="bold">
                  {t('labels.spy')}
                </AppText>
                <AppText variant="bodyMedium" color={theme.colors.error}>
                  {t('rules.spyDescription')}
                </AppText>
              </View>
            </Card.Content>
          </Card>
        </AnimatedCard>

        {/* Как играть */}
        <AnimatedCard index={2}>
          <Card style={styles.card}>
            <Card.Content>
              <AppText variant="titleMedium" mb={16} fontWeight="bold">
                {t('rules.howToPlay')}
              </AppText>

              <View style={styles.stepSection}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <AppText
                    variant="titleMedium"
                    fontWeight="bold"
                    color={theme.colors.onPrimary}
                  >
                    1
                  </AppText>
                </View>
                <View style={styles.stepContent}>
                  <AppText variant="bodyMedium">{t('rules.step1')}</AppText>
                </View>
              </View>

              <View style={styles.stepSection}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <AppText
                    variant="titleMedium"
                    fontWeight="bold"
                    color={commonColors.white}
                  >
                    2
                  </AppText>
                </View>
                <View style={styles.stepContent}>
                  <AppText variant="bodyMedium">{t('rules.step2')}</AppText>
                </View>
              </View>

              <View style={styles.stepSection}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <AppText
                    variant="titleMedium"
                    fontWeight="bold"
                    color={commonColors.white}
                  >
                    3
                  </AppText>
                </View>
                <View style={styles.stepContent}>
                  <AppText variant="bodyMedium">{t('rules.step3')}</AppText>
                </View>
              </View>

              <View style={styles.stepSection}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <AppText
                    variant="titleMedium"
                    fontWeight="bold"
                    color={commonColors.white}
                  >
                    4
                  </AppText>
                </View>
                <View style={styles.stepContent}>
                  <AppText variant="bodyMedium">{t('rules.step4')}</AppText>
                </View>
              </View>
            </Card.Content>
          </Card>
        </AnimatedCard>

        {/* Условия победы */}
        <AnimatedCard index={3}>
          <Card style={styles.card}>
            <Card.Content>
              <AppText variant="titleMedium" mb={16} fontWeight="bold">
                {t('rules.victoryConditions')}
              </AppText>

              <View style={styles.victorySection}>
                <AppText variant="titleSmall" mb={8} fontWeight="bold">
                  {t('rules.playersWin')}
                </AppText>
                <AppText variant="bodyMedium" color={theme.colors.primary}>
                  {t('rules.playersWinDescription')}
                </AppText>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.victorySection}>
                <AppText variant="titleSmall" mb={8} fontWeight="bold">
                  {t('rules.spiesWin')}
                </AppText>
                <AppText variant="bodyMedium" color={theme.colors.error}>
                  {t('rules.spiesWinDescription')}
                </AppText>
              </View>
            </Card.Content>
          </Card>
        </AnimatedCard>

        {/* Советы */}
        <AnimatedCard index={4}>
          <Card style={styles.card}>
            <Card.Content>
              <AppText variant="titleMedium" mb={16} fontWeight="bold">
                {t('rules.tips')}
              </AppText>
              <AppText variant="bodyMedium" mb={8}>
                • {t('rules.tip1')}
              </AppText>
              <AppText variant="bodyMedium" mb={8}>
                • {t('rules.tip2')}
              </AppText>
              <AppText variant="bodyMedium" mb={8}>
                • {t('rules.tip3')}
              </AppText>
              <AppText variant="bodyMedium">• {t('rules.tip4')}</AppText>
            </Card.Content>
          </Card>
        </AnimatedCard>

        {/* Примеры тем для вопросов */}
        <AnimatedCard index={5}>
          <Card style={styles.card}>
            <Card.Content>
              <AppText variant="titleMedium" mb={8} fontWeight="bold">
                {t('rules.questionTopicsTitle')}
              </AppText>
              <AppText variant="bodyMedium" mb={16}>
                {t('rules.questionTopicsDescription')}
              </AppText>
              <View style={styles.topicList}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                  <AppText
                    key={num}
                    variant="bodyMedium"
                    mb={4}
                    style={styles.topicItem}
                  >
                    {num}. {t(`rules.questionTopic${num}`)}
                  </AppText>
                ))}
              </View>
            </Card.Content>
          </Card>
        </AnimatedCard>
      </View>
    </ScreenContainer>
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
  roleSection: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  stepSection: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: STEP_NUMBER_SIZE.WIDTH,
    height: STEP_NUMBER_SIZE.HEIGHT,
    borderRadius: STEP_NUMBER_SIZE.RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  victorySection: {
    marginBottom: 8,
  },
  topicList: {
    marginTop: 0,
  },
  topicItem: {
    marginBottom: 2,
  },
});
