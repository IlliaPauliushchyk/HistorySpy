import analytics from '@react-native-firebase/analytics';
import { BUILTIN_SET_TYPE_IDS, GameSettingsData } from './storage';

const BUILTIN_SET_TYPES = [...BUILTIN_SET_TYPE_IDS] as const;

type BuiltinSetType = (typeof BUILTIN_SET_TYPES)[number];

// Проверка, является ли набор встроенным
const isBuiltinSet = (setType: string): setType is BuiltinSetType => {
  return BUILTIN_SET_TYPES.includes(setType as BuiltinSetType);
};

// Безопасная отправка события
const safeLogEvent = (
  eventName: string,
  params: Record<string, any>,
): void => {
  try {
    analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

// Установка пользовательских свойств
export const setUserProperty = async (
  name: string,
  value: string | null,
): Promise<void> => {
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.error('Error setting user property:', error);
  }
};

// ==================== События экранов ====================

export const logScreenView = (screenName: string): void => {
  try {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.error('Error logging screen view:', error);
  }
};

// ==================== Настройки и начало игры ====================

export const logGameSettingsOpened = (): void => {
  safeLogEvent('game_settings_opened', {});
};

export const logGameStarted = (settings: GameSettingsData): void => {
  // Получаем язык интерфейса
  let currentLanguage = 'ru';
  try {
    const i18n = require('@/localization/i18n').default;
    currentLanguage = i18n.language || 'ru';
  } catch {
    currentLanguage = 'ru';
  }

  const params: Record<string, any> = {
    players_count: settings.playersCount,
    spies_count: settings.spiesCount,
    round_time: settings.roundTime,
    infinite_time: settings.infiniteTime,
    set_type: settings.setType,
    language: currentLanguage,
  };

  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (!isBuiltinSet(settings.setType)) {
    return;
  }

  safeLogEvent('game_started', params);
};

// ==================== Выбор наборов ====================

export const logSetSelected = (params: {
  setType: string;
  setName?: string;
  isCustom: boolean;
  isModified: boolean;
}): void => {
  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (params.isCustom) {
    return;
  }

  const eventParams: Record<string, any> = {
    set_type: params.setType,
    is_custom: false,
    is_modified: params.isModified,
  };

  // Для встроенных наборов можно добавить set_name (но он уже в set_type)
  if (params.setName && isBuiltinSet(params.setType)) {
    eventParams.set_name = params.setName;
  }

  safeLogEvent('set_selected', eventParams);
};

export const logSetInfoViewed = (params: {
  setType: string;
  setName?: string;
  isCustom: boolean;
}): void => {
  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (params.isCustom) {
    return;
  }

  const eventParams: Record<string, any> = {
    set_type: params.setType,
    is_custom: false,
  };

  if (params.setName && isBuiltinSet(params.setType)) {
    eventParams.set_name = params.setName;
  }

  safeLogEvent('set_info_viewed', eventParams);
};

// ==================== Редактирование наборов ====================

export const logEditSetsOpened = (activeTab: 'builtin' | 'custom'): void => {
  // Не логируем открытие вкладки кастомных наборов (защита конфиденциальности)
  if (activeTab === 'custom') {
    return;
  }
  safeLogEvent('edit_sets_opened', { active_tab: activeTab });
};

export const logSetEdited = (params: {
  setType: string;
  setName?: string;
  isCustom: boolean;
  itemsRemovedCount: number;
}): void => {
  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (params.isCustom) {
    return;
  }

  const eventParams: Record<string, any> = {
    set_type: params.setType,
    items_removed_count: params.itemsRemovedCount,
    is_custom: false,
  };

  if (params.setName && isBuiltinSet(params.setType)) {
    eventParams.set_name = params.setName;
  }

  safeLogEvent('set_edited', eventParams);
};

export const logSetReset = (params: {
  setType: string;
  setName?: string;
  isCustom: boolean;
}): void => {
  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (params.isCustom) {
    return;
  }

  const eventParams: Record<string, any> = {
    set_type: params.setType,
    is_custom: false,
  };

  if (params.setName && isBuiltinSet(params.setType)) {
    eventParams.set_name = params.setName;
  }

  safeLogEvent('set_reset', eventParams);
};

export const logSetItemDeleted = (params: {
  setType: string;
  setName?: string;
  isCustom: boolean;
  itemType: string;
}): void => {
  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (params.isCustom) {
    return;
  }

  const eventParams: Record<string, any> = {
    set_type: params.setType,
    item_type: params.itemType,
    is_custom: false,
  };

  if (params.setName && isBuiltinSet(params.setType)) {
    eventParams.set_name = params.setName;
  }

  safeLogEvent('set_item_deleted', eventParams);
};

// ==================== Кастомные наборы ====================
// Аналитика для кастомных наборов отключена для защиты конфиденциальности пользователей
// Пользователи могут вводить чувствительные данные в названия наборов

// ==================== Действия во время игры ====================

export const logCardShown = (params: {
  playerIndex: number;
  role: 'spy' | 'player';
  currentCardIndex: number;
  totalCards: number;
}): void => {
  safeLogEvent('card_shown', {
    player_index: params.playerIndex,
    role: params.role,
    current_card_index: params.currentCardIndex,
    total_cards: params.totalCards,
  });
};

export const logCardNext = (params: {
  currentCardIndex: number;
  totalCards: number;
}): void => {
  safeLogEvent('card_next', {
    current_card_index: params.currentCardIndex,
    total_cards: params.totalCards,
  });
};

export const logGamePaused = (timeLeft: number | null): void => {
  safeLogEvent('game_paused', {
    time_left: timeLeft ?? 0,
  });
};

export const logGameResumed = (timeLeft: number | null): void => {
  safeLogEvent('game_resumed', {
    time_left: timeLeft ?? 0,
  });
};

export const logTimerEdited = (params: {
  oldTime: number;
  newTime: number;
}): void => {
  safeLogEvent('timer_edited', {
    old_time: params.oldTime,
    new_time: params.newTime,
  });
};

export const logTimerRestarted = (): void => {
  safeLogEvent('timer_restarted', {});
};

export const logPlayerExiled = (params: {
  playerIndex: number;
  role: 'spy' | 'player';
  remainingPlayers: number;
  remainingSpies: number;
}): void => {
  safeLogEvent('player_exiled', {
    player_index: params.playerIndex,
    role: params.role,
    remaining_players: params.remainingPlayers,
    remaining_spies: params.remainingSpies,
  });
};

export const logPersonReselected = (): void => {
  safeLogEvent('person_reselected', {});
};

export const logFirstPlayerAnnounced = (firstPlayerIndex: number): void => {
  safeLogEvent('first_player_announced', {
    first_player_index: firstPlayerIndex,
  });
};

// ==================== Завершение игры ====================

export const logGameEnded = (params: {
  winner: 'players' | 'spies';
  durationSeconds: number;
  cardsShown: number;
  playersExiled: number;
  spiesExiled: number;
  setType: string;
  character: string; // Имя футболиста из публичного списка - безопасно
}): void => {
  const eventParams: Record<string, any> = {
    winner: params.winner,
    duration_seconds: params.durationSeconds,
    cards_shown: params.cardsShown,
    players_exiled: params.playersExiled,
    spies_exiled: params.spiesExiled,
    set_type: params.setType,
    character: params.character, // Безопасно: публичная информация
  };

  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (!isBuiltinSet(params.setType)) {
    return;
  }

  safeLogEvent('game_ended', eventParams);
};

export const logGameResultsViewed = (params: {
  winner: 'players' | 'spies';
  setType: string;
}): void => {
  // Не логируем события для кастомных наборов (защита конфиденциальности)
  if (!isBuiltinSet(params.setType)) {
    return;
  }

  const eventParams: Record<string, any> = {
    winner: params.winner,
    set_type: params.setType,
  };

  safeLogEvent('game_results_viewed', eventParams);
};

// ==================== Язык и локализация ====================

export const logLanguageChanged = (params: {
  oldLanguage: string;
  newLanguage: string;
  requiresRestart: boolean;
}): void => {
  safeLogEvent('language_changed', {
    old_language: params.oldLanguage,
    new_language: params.newLanguage,
    requires_restart: params.requiresRestart,
  });
};

export const logLanguageScreenOpened = (): void => {
  safeLogEvent('language_screen_opened', {});
};

// ==================== Другие действия ====================

export const logRulesViewed = (): void => {
  safeLogEvent('rules_viewed', {});
};

export const logNewGameFromResults = (): void => {
  safeLogEvent('new_game_from_results', {});
};

export const logNewGameFromHome = (): void => {
  safeLogEvent('new_game_from_home', {});
};

export const logSearchUsed = (params: {
  filterType: string;
  queryLength: number;
}): void => {
  safeLogEvent('search_used', {
    filter_type: params.filterType,
    query_length: params.queryLength,
  });
};
