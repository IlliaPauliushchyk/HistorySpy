import { useAlert } from '@/components';
import {
  ANIMATION_DELAY,
  ANIMATION_DURATION,
  ANIMATION_VALUES,
  Screens,
  SPRING_CONFIG,
  TIMEOUTS,
  TIMER_INTERVAL,
} from '@/constants';
import {
  BuiltinSetTypeId,
  isBuiltinSetTypeId,
} from '@/constants/builtinCurriculum';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import { selectGameSettings } from '@/store/slices';
import {
  logCardNext,
  logCardShown,
  logFirstPlayerAnnounced,
  logGameEnded,
  logGamePaused,
  logGameResumed,
  logPersonReselected,
  logPlayerExiled,
  logTimerEdited,
  logTimerRestarted,
} from '@/utils/analytics';
import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  getBuiltinSet,
  hasBuiltinHint,
} from '@/utils/localization';
import { getSetByName, loadSetsData } from '@/utils/sets';
import { SetsData } from '@/utils/storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

type PlayerRole = 'spy' | 'player';

export type Player = {
  index: number;
  role: PlayerRole;
};

export const useActiveGame = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const gameSettings = useSelector(selectGameSettings);
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [cardFace, setCardFace] = useState<'front' | 'role' | 'hint'>('front');
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState('');
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(
    null,
  );
  const [exiledPlayerIndex, setExiledPlayerIndex] = useState<number | null>(
    null,
  );
  const [exiledPlayerNumber, setExiledPlayerNumber] = useState<number | null>(
    null,
  );
  const [exiledPlayerRole, setExiledPlayerRole] = useState<
    'spy' | 'player' | null
  >(null);
  const [showExileCard, setShowExileCard] = useState(false);
  const [isExileCardFlipped, setIsExileCardFlipped] = useState(false);
  const [wasTimerRunningBeforeExile, setWasTimerRunningBeforeExile] =
    useState(false);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [exiledPlayers, setExiledPlayers] = useState<Set<number>>(new Set());
  const [showEndGameChoice, setShowEndGameChoice] = useState(false);
  const [setsData, setSetsData] = useState<SetsData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [teacherRevealDismissed, setTeacherRevealDismissed] = useState(false);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const cardAppearAnimation = useRef(new Animated.Value(1)).current;
  const exileCardAppearAnimation = useRef(new Animated.Value(0)).current;
  const exileCardFlipAnimation = useRef(new Animated.Value(0)).current;
  const endGameTopAnimation = useRef(new Animated.Value(0)).current;
  const endGameBottomAnimation = useRef(new Animated.Value(0)).current;
  const endGameOpacityAnimation = useRef(new Animated.Value(0)).current;
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Анимации для черного экрана с объявлением первого игрока
  const firstPlayerAnnouncementOpacity = useRef(new Animated.Value(0)).current;
  const firstPlayerAnnouncementScale = useRef(new Animated.Value(0.8)).current;
  // Анимация появления активной игры
  const activeGameAppearAnimation = useRef(new Animated.Value(0)).current;

  // Загружаем данные наборов при монтировании и при смене языка
  useEffect(() => {
    loadSetsData().then(data => {
      setSetsData(data);
    });
  }, [i18n.language]);

  // Функция для выбора случайного персонажа
  const selectRandomPerson = useCallback(() => {
    if (!gameSettings || !setsData) return '';

    // Получаем набор по типу
    const setItems = getSetByName(setsData, gameSettings.setType);
    if (!setItems || setItems.length === 0) {
      // Fallback на данные текущего языка если набор не найден
      const currentLanguage = (i18n.language || 'ru') as ILanguage;
      const availableNames: string[] = isBuiltinSetTypeId(gameSettings.setType)
        ? getBuiltinSet(
            gameSettings.setType as BuiltinSetTypeId,
            currentLanguage,
          )
        : [];
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      return availableNames[randomIndex] || '';
    }

    // Извлекаем только имена из SetItem[]
    const availableNames = setItems.map(item => item.name);

    // Выбираем одного случайного персонажа
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    return availableNames[randomIndex] || '';
  }, [gameSettings, setsData]);

  // Инициализируем выбранного персонажа при изменении настроек игры или данных наборов
  useEffect(() => {
    if (gameSettings && setsData && !selectedPerson) {
      const person = selectRandomPerson();
      setSelectedPerson(person);
    }
  }, [gameSettings, setsData, selectRandomPerson, selectedPerson]);

  // Обработчик перевыбора персонажа и перезапуска игры
  const handleReselectPerson = useCallback(() => {
    logPersonReselected();
    alert({
      title: t('messages.reselectPersonTitle'),
      message: t('messages.reselectPersonMessage'),
      confirmText: t('buttons.confirm'),
      cancelText: t('buttons.cancel'),
      onConfirm: () => {
        // Полностью перезапускаем экран через навигацию
        // Это гарантирует полный сброс всего состояния
        navigation.replace(Screens.activeGame as never);
      },
    });
  }, [alert, t, navigation]);

  const showTeacherReveal = Boolean(
    gameSettings?.showSecretForTeacherEnabled &&
      selectedPerson &&
      !teacherRevealDismissed,
  );

  const handleTeacherRevealContinue = useCallback(() => {
    setTeacherRevealDismissed(true);
  }, []);

  // Генерируем распределение игроков и шпионов
  const initialPlayers = useMemo<Player[]>(() => {
    if (!gameSettings) return [];

    const playersArray: Player[] = [];
    const spyIndices = new Set<number>();

    // Выбираем случайные индексы для шпионов
    while (spyIndices.size < gameSettings.spiesCount) {
      const randomIndex = Math.floor(Math.random() * gameSettings.playersCount);
      spyIndices.add(randomIndex);
    }

    // Создаем массив игроков
    for (let i = 0; i < gameSettings.playersCount; i++) {
      playersArray.push({
        index: i + 1,
        role: spyIndices.has(i) ? 'spy' : 'player',
      });
    }

    return playersArray;
  }, [gameSettings]);

  // Инициализируем активных игроков при изменении начальных игроков
  useEffect(() => {
    if (initialPlayers.length > 0 && activePlayers.length === 0) {
      setActivePlayers(initialPlayers);
    }
  }, [initialPlayers, activePlayers.length]);

  // Используем активных игроков для отображения
  const players = activePlayers.length > 0 ? activePlayers : initialPlayers;

  // Сброс состояния и анимация появления при смене игрока
  useEffect(() => {
    setCardFace('front');
    flipAnimation.setValue(0);

    // Анимация появления новой карточки
    cardAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
    Animated.spring(cardAppearAnimation, {
      toValue: ANIMATION_VALUES.SCALE_END,
      tension: SPRING_CONFIG.TENSION,
      friction: SPRING_CONFIG.FRICTION,
      useNativeDriver: true,
    }).start();
  }, [currentPlayerIndex, flipAnimation, cardAppearAnimation]);

  // Обработчик показа карточки
  const handleShowCard = useCallback(() => {
    setCardFace('role');

    // Логируем показ карточки
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      logCardShown({
        playerIndex: currentPlayer.index,
        role: currentPlayer.role,
        currentCardIndex: currentPlayerIndex,
        totalCards: players.length,
      });
    }

    // На iOS используем простую анимацию появления, на Android - поворот
    if (Platform.OS === 'android') {
      Animated.timing(flipAnimation, {
        toValue: ANIMATION_VALUES.FLIP_ROTATION,
        duration: ANIMATION_DURATION.FLIP,
        useNativeDriver: true,
      }).start();
    } else {
      // На iOS просто запускаем анимацию появления задней карточки
      cardAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
      Animated.spring(cardAppearAnimation, {
        toValue: ANIMATION_VALUES.SCALE_END,
        tension: SPRING_CONFIG.TENSION,
        friction: SPRING_CONFIG.FRICTION,
        useNativeDriver: true,
      }).start();
    }
  }, [flipAnimation, cardAppearAnimation, players, currentPlayerIndex]);

  const handleShowHint = useCallback(() => {
    if (cardFace !== 'role') {
      return;
    }
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.role === 'spy' || !gameSettings) {
      return;
    }
    const itemType = isBuiltinSetTypeId(gameSettings.setType)
      ? BUILTIN_SET_ID_TO_ITEM_TYPE[gameSettings.setType]
      : undefined;
    if (!itemType || !hasBuiltinHint(selectedPerson, itemType)) {
      return;
    }

    setCardFace('hint');

    cardAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
    Animated.spring(cardAppearAnimation, {
      toValue: ANIMATION_VALUES.SCALE_END,
      tension: SPRING_CONFIG.TENSION,
      friction: SPRING_CONFIG.FRICTION,
      useNativeDriver: true,
    }).start();
  }, [
    cardFace,
    players,
    currentPlayerIndex,
    gameSettings,
    selectedPerson,
    cardAppearAnimation,
  ]);

  // Проверка условий окончания игры
  const checkGameEnd = useCallback(
    (
      currentPlayers: Player[],
      wasSpyExiled: boolean,
    ): 'players' | 'spies' | null => {
      const activeSpies = currentPlayers.filter(p => p.role === 'spy').length;
      const activePlayersCount = currentPlayers.filter(
        p => p.role === 'player',
      ).length;

      console.log('checkGameEnd:', {
        currentPlayersCount: currentPlayers.length,
        activeSpies,
        activePlayersCount,
        wasSpyExiled,
      });

      // Если изгнали шпиона и шпионов больше не осталось - победа игроков
      if (wasSpyExiled && activeSpies === 0) {
        console.log(
          'Победа игроков: изгнали шпиона и шпионов больше не осталось',
        );
        return 'players';
      }

      // Если шпионов осталось столько же или больше, чем игроков - победа шпионов
      if (activeSpies >= activePlayersCount && activePlayersCount > 0) {
        console.log('Победа шпионов: шпионов >= игроков');
        return 'spies';
      }

      // Если остался один шпион и один игрок - победа шпионов
      if (activeSpies === 1 && activePlayersCount === 1) {
        console.log('Победа шпионов: остался один шпион и один игрок');
        return 'spies';
      }

      // Если остались только шпионы (нет игроков) - победа шпионов
      if (activeSpies > 0 && activePlayersCount === 0) {
        console.log('Победа шпионов: остались только шпионы');
        return 'spies';
      }

      console.log('Игра продолжается');
      return null;
    },
    [],
  );

  // Переход к экрану результатов
  const navigateToResults = useCallback(
    (winner: 'players' | 'spies', currentExiledPlayers?: Set<number>) => {
      if (!gameSettings) return;

      // Используем переданное значение или состояние
      const exiles = currentExiledPlayers || exiledPlayers;
      const allPlayers = initialPlayers.map(player => ({
        index: player.index,
        role: player.role,
        isExiled: exiles.has(player.index),
      }));

      // Вычисляем статистику для аналитики
      const spiesExiled = allPlayers.filter(
        p => p.isExiled && p.role === 'spy',
      ).length;
      const playersExiled = allPlayers.filter(
        p => p.isExiled && p.role === 'player',
      ).length;
      const cardsShown = currentPlayerIndex + 1; // +1 потому что индексация с 0

      // Вычисляем длительность игры (примерно, так как точное время не отслеживается)
      const durationSeconds = gameSettings.infiniteTime
        ? 0
        : (gameSettings.roundTime || 60) - (timeLeft || 0);

      // Логируем завершение игры
      logGameEnded({
        winner,
        durationSeconds,
        cardsShown,
        playersExiled,
        spiesExiled,
        setType: gameSettings.setType,
        character: selectedPerson,
      });

      console.log('navigateToResults called:', {
        winner,
        exilesCount: exiles.size,
        allPlayers: allPlayers.map(p => ({
          index: p.index,
          role: p.role,
          isExiled: p.isExiled,
        })),
      });

      navigation.replace(
        Screens.activeGameResults as never,
        {
          result: {
            players: allPlayers,
            winner,
            character: selectedPerson,
            setType: gameSettings.setType,
          },
        } as never,
      );
    },
    [
      gameSettings,
      exiledPlayers,
      initialPlayers,
      selectedPerson,
      navigation,
      currentPlayerIndex,
      timeLeft,
    ],
  );

  // Запуск таймера
  const startTimer = useCallback(
    (initialTime: number) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            // При окончании времени побеждают шпионы
            setTimeout(() => {
              navigateToResults('spies', exiledPlayers);
            }, TIMEOUTS.TIMER_END_DELAY);
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_INTERVAL.SECOND);
    },
    [navigateToResults, exiledPlayers],
  );

  // Запуск игры
  const handleStartGame = useCallback(() => {
    if (gameSettings) {
      setGameStarted(true);
      setShowBlackScreen(false);
      setIsPaused(false);
      if (!gameSettings.infiniteTime) {
        const initialTime = gameSettings.roundTime || 60;
        setTimeLeft(initialTime);
        startTimer(initialTime);
      }
    }
  }, [gameSettings, startTimer]);

  // Обработчик перехода к следующей карточке
  const handleNextCard = useCallback(() => {
    if (currentPlayerIndex < players.length - 1) {
      // Логируем переход к следующей карточке
      logCardNext({
        currentCardIndex: currentPlayerIndex,
        totalCards: players.length,
      });
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      // Все карточки показаны, переходим к черному экрану
      const randomFirstPlayer =
        Math.floor(Math.random() * gameSettings!.playersCount) + 1;
      setFirstPlayer(randomFirstPlayer);

      // Логируем объявление первого игрока
      logFirstPlayerAnnounced(randomFirstPlayer);

      setShowBlackScreen(true);

      // Запускаем анимацию появления объявления
      firstPlayerAnnouncementOpacity.setValue(ANIMATION_VALUES.OPACITY_START);
      firstPlayerAnnouncementScale.setValue(ANIMATION_VALUES.SCALE_START);
      Animated.parallel([
        Animated.timing(firstPlayerAnnouncementOpacity, {
          toValue: ANIMATION_VALUES.OPACITY_END,
          duration: ANIMATION_DURATION.SLOW,
          useNativeDriver: true,
        }),
        Animated.spring(firstPlayerAnnouncementScale, {
          toValue: ANIMATION_VALUES.SCALE_END,
          tension: SPRING_CONFIG.TENSION,
          friction: SPRING_CONFIG.FRICTION,
          useNativeDriver: true,
        }),
      ]).start();

      // Автоматически скрываем объявление
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(firstPlayerAnnouncementOpacity, {
            toValue: ANIMATION_VALUES.OPACITY_START,
            duration: ANIMATION_DURATION.SLOW,
            useNativeDriver: true,
          }),
          Animated.timing(firstPlayerAnnouncementScale, {
            toValue: ANIMATION_VALUES.SCALE_START,
            duration: ANIMATION_DURATION.SLOW,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // После анимации исчезновения запускаем игру
          handleStartGame();
        });
      }, TIMEOUTS.FIRST_PLAYER_ANNOUNCEMENT);
    }
  }, [
    currentPlayerIndex,
    players.length,
    gameSettings,
    firstPlayerAnnouncementOpacity,
    firstPlayerAnnouncementScale,
    handleStartGame,
  ]);

  // Анимация появления активной игры при старте
  useEffect(() => {
    if (gameStarted && !showExileCard) {
      activeGameAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
      Animated.timing(activeGameAppearAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_END,
        duration: ANIMATION_DURATION.NORMAL,
        useNativeDriver: true,
      }).start();
    }
  }, [gameStarted, showExileCard, activeGameAppearAnimation]);

  // Обработчик закрытия меню выбора победителя
  const handleCloseEndGameChoice = useCallback(() => {
    // Запускаем обратную анимацию
    Animated.parallel([
      Animated.timing(endGameTopAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_START,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(endGameBottomAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_START,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(endGameOpacityAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_START,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // После завершения анимации закрываем меню
      setShowEndGameChoice(false);
      // Возобновляем таймер если он был запущен
      if (timeLeft !== null && timeLeft > 0) {
        setIsPaused(false);
        startTimer(timeLeft);
      }
    });
  }, [timeLeft, startTimer]);

  // Пауза/возобновление таймера
  const handlePause = useCallback(() => {
    if (isPaused) {
      // Возобновляем — используем startTimer, чтобы при достижении 0 корректно завершить игру
      logGameResumed(timeLeft);
      if (timeLeft !== null && timeLeft > 0 && gameSettings) {
        startTimer(timeLeft);
      }
      setIsPaused(false);
    } else {
      // Ставим на паузу
      logGamePaused(timeLeft);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setIsPaused(true);
    }
  }, [isPaused, timeLeft, gameSettings, startTimer]);

  // Перезапуск таймера
  const handleRestart = useCallback(() => {
    if (gameSettings && !gameSettings.infiniteTime) {
      const initialTime = gameSettings.roundTime || 60;
      logTimerRestarted();
      setTimeLeft(initialTime);
      setIsPaused(false);
      startTimer(initialTime);
    }
  }, [gameSettings, startTimer]);

  // Открытие модального окна редактирования
  const handleEdit = useCallback(() => {
    if (timeLeft !== null) {
      setEditTimeValue(timeLeft.toString());
    }
    setIsPaused(true);
    setIsEditing(true);
  }, [timeLeft]);

  // Сохранение отредактированного времени
  const handleSaveEdit = useCallback(() => {
    const newTime = parseInt(editTimeValue, 10);
    if (!isNaN(newTime) && newTime > 0 && gameSettings) {
      const oldTime = timeLeft;
      logTimerEdited({
        oldTime: oldTime || 0,
        newTime,
      });
      setTimeLeft(newTime);
      setIsPaused(false);
      startTimer(newTime);
    }
    setIsEditing(false);
  }, [editTimeValue, gameSettings, startTimer, timeLeft]);

  // Отмена редактирования
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setIsPaused(false);
  }, []);

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Обработчик возврата с карточки изгнания
  const handleContinueAfterExile = useCallback(() => {
    // Получаем информацию об изгнанном игроке из initialPlayers по номеру
    // Это более надежно, чем использовать индекс, так как индексы могут меняться
    const exiledPlayer =
      exiledPlayerNumber !== null
        ? initialPlayers.find(p => p.index === exiledPlayerNumber)
        : exiledPlayerIndex !== null
        ? activePlayers[exiledPlayerIndex]
        : null;
    const wasSpyExiled = exiledPlayer?.role === 'spy';

    // Создаем обновленный список изгнанных игроков (вычисляем, но НЕ обновляем состояние пока)
    const updatedExiledPlayers = new Set(exiledPlayers);
    if (exiledPlayerNumber !== null) {
      updatedExiledPlayers.add(exiledPlayerNumber);
    }

    // Удаляем игрока из списка по индексу (вычисляем, но НЕ обновляем состояние пока)
    let updatedPlayers: Player[] = [];
    if (exiledPlayerIndex !== null) {
      updatedPlayers = activePlayers.filter(
        (_, index) => index !== exiledPlayerIndex,
      );
    } else {
      updatedPlayers = activePlayers;
    }

    // Проверяем условия окончания игры ДО закрытия карточки изгнания
    console.log('handleContinueAfterExile:', {
      exiledPlayerNumber,
      wasSpyExiled,
      updatedPlayersCount: updatedPlayers.length,
      updatedPlayers: updatedPlayers.map(p => ({
        index: p.index,
        role: p.role,
      })),
    });
    const gameWinner = checkGameEnd(updatedPlayers, wasSpyExiled);

    if (gameWinner) {
      console.log('Игра закончена, победитель:', gameWinner);
      // Обновляем состояние изгнанных игроков
      if (exiledPlayerNumber !== null) {
        setExiledPlayers(updatedExiledPlayers);
      }
      // Обновляем активных игроков
      if (exiledPlayerIndex !== null) {
        setActivePlayers(updatedPlayers);
      }
      // Сразу переходим на экран результатов, НЕ закрывая карточку изгнания
      navigateToResults(gameWinner, updatedExiledPlayers);
      return;
    }

    // Если игра продолжается, обновляем состояние и закрываем карточку
    if (exiledPlayerNumber !== null) {
      setExiledPlayers(updatedExiledPlayers);
    }
    if (exiledPlayerIndex !== null) {
      setActivePlayers(updatedPlayers);
    }
    setShowExileCard(false);
    setIsExileCardFlipped(false);
    setExiledPlayerIndex(null);
    setExiledPlayerNumber(null);
    setExiledPlayerRole(null);
    exileCardAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
    exileCardFlipAnimation.setValue(ANIMATION_VALUES.OPACITY_START);

    // Анимация появления активной игры после закрытия карточки изгнания
    // Используем небольшую задержку, чтобы анимация начала работать после обновления состояния
    setTimeout(() => {
      activeGameAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
      Animated.timing(activeGameAppearAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_END,
        duration: ANIMATION_DURATION.NORMAL,
        useNativeDriver: true,
      }).start();
    }, ANIMATION_DELAY.ANIMATION_START);

    // Возобновляем таймер если он был запущен
    if (wasTimerRunningBeforeExile && timeLeft !== null && timeLeft > 0) {
      setIsPaused(false);
      startTimer(timeLeft);
    }
  }, [
    exiledPlayerNumber,
    exiledPlayerIndex,
    initialPlayers,
    activePlayers,
    exiledPlayers,
    checkGameEnd,
    navigateToResults,
    wasTimerRunningBeforeExile,
    timeLeft,
    startTimer,
    exileCardAppearAnimation,
    exileCardFlipAnimation,
    activeGameAppearAnimation,
  ]);

  // Обработчик нажатия на кнопку "Закончить игру"
  const handleEndGame = useCallback(() => {
    // Останавливаем таймер если он идет
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsPaused(true);
    setShowEndGameChoice(true);

    // Запускаем анимации выезжания блоков с opacity
    Animated.parallel([
      Animated.timing(endGameTopAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_END,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(endGameBottomAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_END,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(endGameOpacityAnimation, {
        toValue: ANIMATION_VALUES.OPACITY_END,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
    ]).start();
  }, [endGameTopAnimation, endGameBottomAnimation, endGameOpacityAnimation]);

  // Обработчик выбора победителя
  const handleChooseWinner = useCallback(
    (winner: 'players' | 'spies') => {
      // Запускаем параллельные анимации: закрытие модалки и исчезновение активной игры
      Animated.parallel([
        // Анимация закрытия модалки (обратная)
        Animated.timing(endGameTopAnimation, {
          toValue: ANIMATION_VALUES.OPACITY_START,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
        Animated.timing(endGameBottomAnimation, {
          toValue: ANIMATION_VALUES.OPACITY_START,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
        Animated.timing(endGameOpacityAnimation, {
          toValue: ANIMATION_VALUES.OPACITY_START,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
        // Анимация исчезновения активной игры
        Animated.timing(activeGameAppearAnimation, {
          toValue: ANIMATION_VALUES.OPACITY_START,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // После завершения всех анимаций переходим на экран результатов
        setShowEndGameChoice(false);
        navigateToResults(winner, exiledPlayers);
      });
    },
    [
      endGameTopAnimation,
      endGameBottomAnimation,
      endGameOpacityAnimation,
      activeGameAppearAnimation,
      navigateToResults,
      exiledPlayers,
    ],
  );

  // Обработчик изгнания игрока
  const handleExilePlayer = useCallback(() => {
    if (selectedPlayerIndex !== null) {
      const selectedPlayer = players[selectedPlayerIndex];
      alert({
        title: t('messages.confirmExileTitle'),
        message: t('messages.confirmExileMessage', {
          number: selectedPlayer?.index || selectedPlayerIndex + 1,
        }),
        confirmText: t('buttons.exile'),
        cancelText: t('buttons.cancel'),
        onConfirm: () => {
          // Останавливаем таймер если он идет
          const wasRunning = !isPaused && timeLeft !== null;
          setWasTimerRunningBeforeExile(wasRunning);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          setIsPaused(true);

          // Логируем изгнание игрока
          const remainingPlayers = activePlayers.filter(
            p => p.index !== selectedPlayer?.index,
          ).length;
          const remainingSpies = activePlayers.filter(
            p => p.role === 'spy' && p.index !== selectedPlayer?.index,
          ).length;

          logPlayerExiled({
            playerIndex: selectedPlayer?.index || selectedPlayerIndex,
            role: selectedPlayer?.role || 'player',
            remainingPlayers,
            remainingSpies,
          });

          // Показываем карточку изгнания
          setExiledPlayerIndex(selectedPlayerIndex);
          setExiledPlayerNumber(selectedPlayer?.index || null);
          setExiledPlayerRole(selectedPlayer?.role || null);
          setShowExileCard(true);
          setSelectedPlayerIndex(null);

          // Анимация появления карточки
          exileCardAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
          Animated.spring(exileCardAppearAnimation, {
            toValue: ANIMATION_VALUES.OPACITY_END,
            tension: SPRING_CONFIG.TENSION,
            friction: SPRING_CONFIG.FRICTION,
            useNativeDriver: true,
          }).start();

          // Автоматическое открытие
          setTimeout(() => {
            setIsExileCardFlipped(true);
            // На iOS используем простую анимацию появления, на Android - поворот
            if (Platform.OS === 'android') {
              Animated.timing(exileCardFlipAnimation, {
                toValue: ANIMATION_VALUES.FLIP_ROTATION,
                duration: ANIMATION_DURATION.FLIP,
                useNativeDriver: true,
              }).start();
            } else {
              // На iOS просто запускаем анимацию появления задней карточки
              exileCardAppearAnimation.setValue(ANIMATION_VALUES.OPACITY_START);
              Animated.spring(exileCardAppearAnimation, {
                toValue: ANIMATION_VALUES.OPACITY_END,
                tension: SPRING_CONFIG.TENSION,
                friction: SPRING_CONFIG.FRICTION,
                useNativeDriver: true,
              }).start();
            }
          }, TIMEOUTS.EXILE_CARD_FLIP);
        },
        onCancel: () => {
          // Отмена изгнания
        },
      });
    }
  }, [
    selectedPlayerIndex,
    players,
    alert,
    t,
    isPaused,
    timeLeft,
    exileCardAppearAnimation,
    exileCardFlipAnimation,
  ]);

  // Интерполяция для вращения по оси Y
  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Интерполяция для анимации появления карточки
  const cardScale = cardAppearAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const cardFade = cardAppearAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Интерполяция для анимации карточки изгнания
  const exileCardScale = exileCardAppearAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const exileCardFade = exileCardAppearAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const exileFrontRotateY = exileCardFlipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const exileBackRotateY = exileCardFlipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const exileFrontOpacity = exileCardFlipAnimation.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const exileBackOpacity = exileCardFlipAnimation.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  return {
    // Состояния
    gameSettings,
    currentPlayerIndex,
    cardFace,
    showBlackScreen,
    firstPlayer,
    gameStarted,
    timeLeft,
    isPaused,
    isEditing,
    editTimeValue,
    selectedPlayerIndex,
    exiledPlayerIndex,
    exiledPlayerNumber,
    exiledPlayerRole,
    showExileCard,
    isExileCardFlipped,
    activePlayers,
    exiledPlayers,
    showEndGameChoice,
    selectedPerson,
    showTeacherReveal,
    teacherRevealDismissed,
    players,
    insets,
    // Анимации
    flipAnimation,
    cardAppearAnimation,
    exileCardAppearAnimation,
    exileCardFlipAnimation,
    endGameTopAnimation,
    endGameBottomAnimation,
    endGameOpacityAnimation,
    firstPlayerAnnouncementOpacity,
    firstPlayerAnnouncementScale,
    activeGameAppearAnimation,
    // Интерполяции
    frontRotateY,
    backRotateY,
    cardScale,
    cardFade,
    exileCardScale,
    exileCardFade,
    exileFrontRotateY,
    exileBackRotateY,
    exileFrontOpacity,
    exileBackOpacity,
    // Обработчики
    handleShowCard,
    handleShowHint,
    handleNextCard,
    handleReselectPerson,
    handleTeacherRevealContinue,
    handleStartGame,
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
    setSelectedPlayerIndex,
    setEditTimeValue,
    navigateToResults,
  };
};
