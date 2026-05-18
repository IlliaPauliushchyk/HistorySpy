import { AppButton, AppText, NewGameButton, ScreenContainer } from '@/components';
import { TIMER_SIZES } from '@/constants';
import { Player } from '@/hooks/useActiveGame';
import { formatTime } from '@/utils/formatTime';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { ChooseWinnerModal } from './ChooseWinnerModal';
import { EditTimeModal } from './EditTimeModal';
import { QuestionTopicsModal } from './QuestionTopicsModal';

const QUESTION_TOPICS_COUNT = 30;

type ActiveGameTimerScreenProps = {
  isInfinite: boolean;
  timeLeft: number | null;
  isPaused: boolean;
  players: Player[];
  selectedPlayerIndex: number | null;
  activeGameOpacity: Animated.AnimatedInterpolation<string | number>;
  activeGameTranslateY: Animated.AnimatedInterpolation<string | number>;
  topBlockTranslateY: Animated.AnimatedInterpolation<string | number>;
  bottomBlockTranslateY: Animated.AnimatedInterpolation<string | number>;
  endGameOpacityAnimation: Animated.Value;
  isEditing: boolean;
  editTimeValue: string;
  showEndGameChoice: boolean;
  insetsTop: number;
  suggestQuestionEnabled: boolean;
  onEdit: () => void;
  onPause: () => void;
  onRestart: () => void;
  onEndGame: () => void;
  onSelectPlayer: (index: number) => void;
  onExilePlayer: () => void;
  onTimeChange: (value: number) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onChoosePlayers: () => void;
  onChooseSpies: () => void;
  onCloseEndGameChoice: () => void;
  onNewGame: () => void;
};

export const ActiveGameTimerScreen = ({
  isInfinite,
  timeLeft,
  isPaused,
  players,
  selectedPlayerIndex,
  activeGameOpacity,
  activeGameTranslateY,
  topBlockTranslateY,
  bottomBlockTranslateY,
  endGameOpacityAnimation,
  isEditing,
  editTimeValue,
  showEndGameChoice,
  insetsTop,
  suggestQuestionEnabled,
  onEdit,
  onPause,
  onRestart,
  onEndGame,
  onSelectPlayer,
  onExilePlayer,
  onTimeChange,
  onSaveEdit,
  onCancelEdit,
  onChoosePlayers,
  onChooseSpies,
  onCloseEndGameChoice,
  onNewGame,
}: ActiveGameTimerScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [playersListWidth, setPlayersListWidth] = useState<number>(0);
  const [suggestedQuestion, setSuggestedQuestion] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const pausedForSuggestModalRef = useRef(false);
  const gap = 12;
  const playerItemWidth =
    playersListWidth > 0 ? (playersListWidth - gap) / 2 - 0.5 : '48%';

  return (
    <>
      <ScreenContainer
        type="scrollView"
        containerStyle={{ paddingTop: insetsTop }}
      >
        <Animated.View
          style={[
            styles.timerContainer,
            {
              opacity: activeGameOpacity,
              transform: [{ translateY: activeGameTranslateY }],
            },
          ]}
        >
          {/* Круговой таймер */}
          <View style={styles.timerCircleContainer}>
            {isInfinite ? (
              <View style={styles.timerCircleWrapper}>
                <Svg
                  width={TIMER_SIZES.CIRCLE}
                  height={TIMER_SIZES.CIRCLE}
                  style={styles.timerSvg}
                >
                  <Circle
                    cx={TIMER_SIZES.CIRCLE / 2}
                    cy={TIMER_SIZES.CIRCLE / 2}
                    r={TIMER_SIZES.CIRCLE_RADIUS}
                    stroke={theme.colors.primary}
                    strokeWidth={TIMER_SIZES.STROKE_WIDTH}
                    fill="none"
                  />
                </Svg>
                <View style={styles.timerTextContainer}>
                  <AppText
                    variant="displayLarge"
                    style={{ color: theme.colors.primary }}
                    fontWeight="bold"
                  >
                    ∞
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={styles.timerCircleWrapper}>
                <Svg width={240} height={240} style={styles.timerSvg}>
                  <Circle
                    cx="120"
                    cy="120"
                    r="112"
                    stroke={theme.colors.primary}
                    strokeWidth="16"
                    fill="none"
                  />
                </Svg>
                <View style={styles.timerTextContainer}>
                  <AppText
                    variant="displayMedium"
                    style={{ color: theme.colors.primary }}
                    fontWeight="bold"
                  >
                    {timeLeft !== null ? formatTime(timeLeft) : '0:00'}
                  </AppText>
                </View>
              </View>
            )}
          </View>

          {/* Кнопки управления */}
          <View style={styles.timerControls}>
            <IconButton
              mode="contained"
              icon="pencil"
              size={32}
              iconColor={theme.colors.primary}
              onPress={onEdit}
              disabled={isInfinite}
            />
            <IconButton
              mode="contained"
              icon={isPaused ? 'play' : 'pause'}
              size={32}
              iconColor={theme.colors.primary}
              onPress={onPause}
              disabled={isInfinite}
            />
            <IconButton
              mode="contained"
              icon="restart"
              size={32}
              iconColor={theme.colors.primary}
              onPress={onRestart}
              disabled={isInfinite}
            />
          </View>

          {/* Кнопка закончить игру */}
          <AppButton
            mt={15}
            mode="outlined"
            onPress={onEndGame}
            style={styles.endGameButton}
          >
            {t('buttons.endGame')}
          </AppButton>
          <NewGameButton
            onPress={onNewGame}
            mode="outlined"
            confirmBeforePress
            style={styles.newGameButton}
            mt={12}
          />

          {/* Предложить вопрос — один случайный из 30 */}
          {suggestQuestionEnabled && (
            <Pressable
              style={styles.howToAskButton}
              onPress={() => {
                if (!isInfinite && !isPaused) {
                  onPause();
                  pausedForSuggestModalRef.current = true;
                }
                const num = Math.floor(Math.random() * QUESTION_TOPICS_COUNT) + 1;
                setSuggestedQuestion(t(`rules.questionTopic${num}`));
                setShowQuestionModal(true);
              }}
            >
              <AppText
                variant="bodyMedium"
                style={{ color: theme.colors.primary }}
              >
                {t('buttons.suggestQuestionButton')}
              </AppText>
            </Pressable>
          )}

          {/* Список игроков */}
          <Card style={styles.playersCard}>
            <Card.Content>
              <AppText
                variant="titleMedium"
                mb={16}
                fontWeight="bold"
                textAlign="center"
              >
                {t('labels.players')}
              </AppText>
              <View
                style={styles.playersList}
                onLayout={event => {
                  const { width } = event.nativeEvent.layout;
                  setPlayersListWidth(width);
                }}
              >
                {players.map((player, index) => (
                  <Pressable
                    key={index}
                    onPress={() => onSelectPlayer(index)}
                    style={[
                      styles.playerItem,
                      {
                        width: playerItemWidth,
                        backgroundColor:
                          selectedPlayerIndex === index
                            ? theme.colors.primaryContainer
                            : theme.colors.surfaceVariant,
                        borderWidth: 2,
                        borderColor:
                          selectedPlayerIndex === index
                            ? theme.colors.primary
                            : 'transparent',
                      },
                    ]}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={{
                        color:
                          selectedPlayerIndex === index
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurfaceVariant,
                      }}
                      fontWeight="bold"
                    >
                      {t('labels.playerNumber', { number: player.index })}
                    </AppText>
                  </Pressable>
                ))}
              </View>

              {/* Кнопка изгнать */}
              <AppButton
                mode="contained"
                onPress={onExilePlayer}
                disabled={selectedPlayerIndex === null}
                style={styles.exileButton}
              >
                {t('buttons.exile')}
              </AppButton>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScreenContainer>

      {/* Модальное окно редактирования времени */}
      <EditTimeModal
        visible={isEditing}
        timeValue={editTimeValue}
        onTimeChange={onTimeChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
      />

      {/* Модалка выбора победителя */}
      <ChooseWinnerModal
        visible={showEndGameChoice}
        endGameOpacityAnimation={endGameOpacityAnimation}
        topBlockTranslateY={topBlockTranslateY}
        bottomBlockTranslateY={bottomBlockTranslateY}
        onChoosePlayers={onChoosePlayers}
        onChooseSpies={onChooseSpies}
        onClose={onCloseEndGameChoice}
      />

      {/* Модалка с одним случайным вопросом */}
      <QuestionTopicsModal
        visible={showQuestionModal && suggestedQuestion !== null}
        question={suggestedQuestion ?? ''}
        onClose={() => {
          if (pausedForSuggestModalRef.current) {
            onPause();
            pausedForSuggestModalRef.current = false;
          }
          setShowQuestionModal(false);
          setSuggestedQuestion(null);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  timerCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    position: 'relative',
  },
  timerCircleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 40,
  },
  endGameButton: {
    width: Dimensions.get('window').width - 40,
  },
  newGameButton: {
    width: Dimensions.get('window').width - 40,
  },
  howToAskButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  playersCard: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  playersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  playerItem: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exileButton: {
    width: '100%',
    marginTop: 8,
  },
});
