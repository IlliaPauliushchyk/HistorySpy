import {
  ActiveGameTimerScreen,
  AppText,
  ExileCardScreen,
  FirstPlayerAnnouncementScreen,
  PlayerCardsScreen,
  ScreenContainer,
  TeacherSecretRevealScreen,
} from '@/components';
import { Screens } from '@/constants';
import { useActiveGame } from '@/hooks';
import {
  EventArg,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Dimensions, StyleSheet, View } from 'react-native';

export const ActiveGameScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const gameLogic = useActiveGame();

  const {
    gameSettings,
    showExileCard,
    exiledPlayerIndex,
    exiledPlayerNumber,
    exiledPlayerRole,
    isExileCardFlipped,
    players,
    showBlackScreen,
    firstPlayer,
    gameStarted,
    timeLeft,
    isPaused,
    isEditing,
    editTimeValue,
    selectedPlayerIndex,
    showEndGameChoice,
    selectedPerson,
    teacherRevealDismissed,
    cardFace,
    insets,
    exileCardScale,
    exileCardFade,
    exileFrontRotateY,
    exileBackRotateY,
    exileFrontOpacity,
    exileBackOpacity,
    firstPlayerAnnouncementOpacity,
    firstPlayerAnnouncementScale,
    endGameTopAnimation,
    endGameBottomAnimation,
    endGameOpacityAnimation,
    activeGameAppearAnimation,
    cardScale,
    cardFade,
    frontRotateY,
    backRotateY,
    handleShowCard,
    handleShowHint,
    handleNextCard,
    handlePause,
    handleRestart,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleContinueAfterExile,
    handleEndGame,
    handleChooseWinner,
    handleCloseEndGameChoice,
    handleExilePlayer,
    handleReselectPerson,
    handleTeacherRevealContinue,
    setSelectedPlayerIndex,
    setEditTimeValue,
  } = gameLogic;

  const handleNewGamePress = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: Screens.home }],
    });
  }, [navigation]);

  // Блокируем кнопку назад через useFocusEffect
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerBackVisible: false,
        gestureEnabled: false,
      });

      const onBackPress = () => {
        // Если открыт экран выбора победителя, закрываем его
        if (showEndGameChoice) {
          handleCloseEndGameChoice();
          return true;
        }
        // В остальных случаях блокируем возврат
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      const unsubscribeBeforeRemove = navigation.addListener(
        'beforeRemove',
        (e: EventArg<'beforeRemove', true, any>) => {
          // Предотвращаем только действия типа GO_BACK или POP
          // Разрешаем другие действия навигации (например, REPLACE, RESET, NAVIGATE)
          if (
            e.data?.action?.type === 'GO_BACK' ||
            e.data?.action?.type === 'POP'
          ) {
            // Если открыт экран выбора победителя, закрываем его вместо навигации назад
            if (showEndGameChoice) {
              e.preventDefault();
              handleCloseEndGameChoice();
              return;
            }
            e.preventDefault();
          }
        },
      );

      return () => {
        backHandler.remove();
        unsubscribeBeforeRemove();
      };
    }, [navigation, showEndGameChoice, handleCloseEndGameChoice]),
  );

  if (!gameSettings) {
    return (
      <ScreenContainer type="view" title={t('titles.game')}>
        <View style={styles.container}>
          <AppText>{t('messages.gameSettingsNotFound')}</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const isTeacherMode = Boolean(gameSettings.showSecretForTeacherEnabled);

  // Экран с карточкой изгнания
  if (showExileCard && exiledPlayerIndex !== null && gameSettings) {
    // Используем сохраненную роль изгнанного игрока, чтобы не зависеть от обновлений списка
    const isSpy = exiledPlayerRole === 'spy';
    const playerNumber =
      exiledPlayerNumber ||
      players[exiledPlayerIndex]?.index ||
      exiledPlayerIndex + 1;

    return (
      <ExileCardScreen
        playerNumber={playerNumber}
        isSpy={isSpy}
        isExileCardFlipped={isExileCardFlipped}
        exileCardScale={exileCardScale}
        exileCardFade={exileCardFade}
        exileFrontRotateY={exileFrontRotateY}
        exileBackRotateY={exileBackRotateY}
        exileFrontOpacity={exileFrontOpacity}
        exileBackOpacity={exileBackOpacity}
        onContinue={handleContinueAfterExile}
      />
    );
  }

  const awaitingTeacherReveal =
    Boolean(gameSettings.showSecretForTeacherEnabled) &&
    !teacherRevealDismissed &&
    !gameStarted &&
    !showExileCard;

  if (awaitingTeacherReveal) {
    if (!selectedPerson) {
      return null;
    }
    return (
      <TeacherSecretRevealScreen
        selectedPerson={selectedPerson}
        setType={gameSettings.setType}
        onContinue={handleTeacherRevealContinue}
        onReselectPerson={handleReselectPerson}
        onNewGame={handleNewGamePress}
      />
    );
  }

  // Черный экран после всех карточек с информацией о первом игроке
  if (showBlackScreen && firstPlayer !== null && !gameStarted) {
    return (
      <FirstPlayerAnnouncementScreen
        firstPlayer={firstPlayer}
        firstPlayerAnnouncementOpacity={firstPlayerAnnouncementOpacity}
        firstPlayerAnnouncementScale={firstPlayerAnnouncementScale}
      />
    );
  }

  // Экран с таймером
  if (gameStarted && gameSettings) {
    const isInfinite = gameSettings.infiniteTime;

    // Интерполяции для модалки выбора победителя
    const { height } = Dimensions.get('window');
    const halfHeight = height / 2;
    const topBlockTranslateY = endGameTopAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-halfHeight, 0],
    });
    const bottomBlockTranslateY = endGameBottomAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [halfHeight, 0],
    });

    const activeGameOpacity = activeGameAppearAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const activeGameTranslateY = activeGameAppearAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
    });

    return (
      <ActiveGameTimerScreen
        isInfinite={isInfinite}
        timeLeft={timeLeft}
        isPaused={isPaused}
        players={players}
        selectedPlayerIndex={selectedPlayerIndex}
        activeGameOpacity={activeGameOpacity}
        activeGameTranslateY={activeGameTranslateY}
        topBlockTranslateY={topBlockTranslateY}
        bottomBlockTranslateY={bottomBlockTranslateY}
        endGameOpacityAnimation={endGameOpacityAnimation}
        isEditing={isEditing}
        editTimeValue={editTimeValue}
        showEndGameChoice={showEndGameChoice}
        insetsTop={insets.top}
        suggestQuestionEnabled={gameSettings?.suggestQuestionEnabled ?? false}
        onEdit={handleEdit}
        onPause={handlePause}
        onRestart={handleRestart}
        onEndGame={handleEndGame}
        onSelectPlayer={setSelectedPlayerIndex}
        onExilePlayer={handleExilePlayer}
        onTimeChange={(value: number) => setEditTimeValue(value.toString())}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onChoosePlayers={() => handleChooseWinner('players')}
        onChooseSpies={() => handleChooseWinner('spies')}
        onCloseEndGameChoice={handleCloseEndGameChoice}
        onNewGame={isTeacherMode ? undefined : handleNewGamePress}
      />
    );
  }

  // Основной экран с карточками
  const currentPlayer = players[gameLogic.currentPlayerIndex];

  if (!currentPlayer) {
    return null;
  }

  return (
    <PlayerCardsScreen
      currentPlayer={currentPlayer}
      players={players}
      selectedPerson={selectedPerson}
      setType={gameSettings?.setType}
      cardFace={cardFace}
      cardScale={cardScale}
      cardFade={cardFade}
      frontRotateY={frontRotateY}
      backRotateY={backRotateY}
      onShowCard={handleShowCard}
      onShowHint={handleShowHint}
      onNextCard={handleNextCard}
      onReselectPerson={isTeacherMode ? undefined : handleReselectPerson}
      onNewGame={isTeacherMode ? undefined : handleNewGamePress}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
