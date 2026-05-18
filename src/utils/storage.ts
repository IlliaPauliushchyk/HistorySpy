import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_SETTINGS_KEY = '@gameSettings';
const SETS_KEY = '@sets';

/** Встроенные наборы (школьные: всемирная история и история Беларуси). */
export const BUILTIN_SET_TYPE_IDS = [
  'worldHistoryDefinitions',
  'worldHistoryNames',
  'worldHistoryEvents',
  'belarusHistoryDefinitions',
  'belarusHistoryNames',
  'belarusHistoryEvents',
] as const;

export type BuiltinSetTypeId = (typeof BUILTIN_SET_TYPE_IDS)[number];

const LEGACY_SET_TYPES = new Set<string>([
  'players',
  'coaches',
  'both',
  'legends',
  'ballonDor',
  'worldCupWinners',
  'goalkeepers',
  'forwards',
  'defenders',
  'midfielders',
  'captains',
  'youngTalents',
  'goldenBoot',
  'europeanLegends',
  'africanLegends',
  'centralAsianLegends',
  'belarusianLegends',
  'russianLegends',
  'ukrainianLegends',
]);

export function normalizeBuiltinSetType(
  setType: string | undefined | null,
): string {
  if (!setType) {
    return 'worldHistoryNames';
  }
  if (BUILTIN_SET_TYPE_IDS.includes(setType as BuiltinSetTypeId)) {
    return setType;
  }
  if (LEGACY_SET_TYPES.has(setType)) {
    return 'worldHistoryNames';
  }
  return setType;
}

export type GameSettingsData = {
  playersCount: number;
  spiesCount: number;
  roundTime: number | null;
  infiniteTime: boolean;
  setType: BuiltinSetTypeId | string;
  suggestQuestionEnabled?: boolean;
};

export type SetItem = {
  name: string;
  type:
    | 'worldHistoryDefinition'
    | 'worldHistoryName'
    | 'worldHistoryEvent'
    | 'belarusHistoryDefinition'
    | 'belarusHistoryName'
    | 'belarusHistoryEvent';
};

export type SetData = {
  id: string;
  name: string;
  items: SetItem[];
  isCustom: boolean;
  modifiedAt: number;
};

export type SetsData = {
  removedWorldHistoryDefinitionsNames?: string[];
  removedWorldHistoryNamesNames?: string[];
  removedWorldHistoryEventsNames?: string[];
  removedBelarusHistoryDefinitionsNames?: string[];
  removedBelarusHistoryNamesNames?: string[];
  removedBelarusHistoryEventsNames?: string[];
  customSets: SetData[];
  language?: string;
};

function migrateGameSettings(raw: GameSettingsData): GameSettingsData {
  return {
    ...raw,
    setType: normalizeBuiltinSetType(raw.setType),
  };
}

export const storage = {
  saveGameSettings: async (settings: GameSettingsData): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(GAME_SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Ошибка при сохранении настроек игры:', error);
      throw error;
    }
  },

  loadGameSettings: async (): Promise<GameSettingsData | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(GAME_SETTINGS_KEY);
      if (jsonValue == null) {
        return null;
      }
      const parsed = JSON.parse(jsonValue) as GameSettingsData;
      return migrateGameSettings(parsed);
    } catch (error) {
      console.error('Ошибка при загрузке настроек игры:', error);
      return null;
    }
  },

  removeGameSettings: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(GAME_SETTINGS_KEY);
    } catch (error) {
      console.error('Ошибка при удалении настроек игры:', error);
      throw error;
    }
  },

  saveSets: async (sets: SetsData): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(sets);
      await AsyncStorage.setItem(SETS_KEY, jsonValue);
    } catch (error) {
      console.error('Ошибка при сохранении наборов:', error);
      throw error;
    }
  },

  loadSets: async (): Promise<SetsData | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(SETS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Ошибка при загрузке наборов:', error);
      return null;
    }
  },
};
