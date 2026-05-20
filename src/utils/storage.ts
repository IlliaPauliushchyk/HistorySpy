import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  BUILTIN_SET_TYPE_IDS,
  BuiltinSetTypeId,
  DEFAULT_BUILTIN_SET_TYPE,
  LEGACY_SET_ID_MIGRATION,
  isBuiltinSetTypeId,
  setIdToRemovedKey,
} from '@/constants/builtinCurriculum';
import { CurriculumItemType } from './curriculumLocalization';

const GAME_SETTINGS_KEY = '@gameSettings';
const SETS_KEY = '@sets';

export { BUILTIN_SET_TYPE_IDS, BUILTIN_SET_ID_TO_ITEM_TYPE };
export type { BuiltinSetTypeId };

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
  ...Object.keys(LEGACY_SET_ID_MIGRATION),
]);

export function normalizeBuiltinSetType(
  setType: string | undefined | null,
): string {
  if (!setType) {
    return DEFAULT_BUILTIN_SET_TYPE;
  }
  if (isBuiltinSetTypeId(setType)) {
    return setType;
  }
  if (LEGACY_SET_ID_MIGRATION[setType]) {
    return LEGACY_SET_ID_MIGRATION[setType];
  }
  if (LEGACY_SET_TYPES.has(setType)) {
    return DEFAULT_BUILTIN_SET_TYPE;
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
  showSecretForTeacherEnabled?: boolean;
};

export type SetItem = {
  name: string;
  type: CurriculumItemType;
};

export type SetData = {
  id: string;
  name: string;
  items: SetItem[];
  isCustom: boolean;
  modifiedAt: number;
};

export type SetsData = {
  customSets: SetData[];
  language?: string;
  removedWorldHistory5DefinitionsNames?: string[];
  removedWorldHistory5NamesNames?: string[];
  removedWorldHistory5EventsNames?: string[];
  removedWorldHistory9DefinitionsNames?: string[];
  removedWorldHistory9NamesNames?: string[];
  removedWorldHistory9EventsNames?: string[];
  removedBelarusHistory5DefinitionsNames?: string[];
  removedBelarusHistory5NamesNames?: string[];
  removedBelarusHistory5EventsNames?: string[];
  removedBelarusHistory9DefinitionsNames?: string[];
  removedBelarusHistory9NamesNames?: string[];
  removedBelarusHistory9EventsNames?: string[];
};

function emptyRemovedKeys(): Omit<SetsData, 'customSets' | 'language'> {
  return Object.fromEntries(
    BUILTIN_SET_TYPE_IDS.map(id => [setIdToRemovedKey(id), []]),
  ) as Omit<SetsData, 'customSets' | 'language'>;
}

function migrateGameSettings(raw: GameSettingsData): GameSettingsData {
  return {
    ...raw,
    setType: normalizeBuiltinSetType(raw.setType),
    showSecretForTeacherEnabled: raw.showSecretForTeacherEnabled ?? true,
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

export const createEmptySetsData = (language?: string): SetsData => ({
  ...emptyRemovedKeys(),
  customSets: [],
  language,
});

export function getRemovedNames(
  setsData: SetsData,
  setId: BuiltinSetTypeId,
): string[] {
  return setsData[setIdToRemovedKey(setId)] ?? [];
}

export function setRemovedNames(
  setsData: SetsData,
  setId: BuiltinSetTypeId,
  names: string[],
): void {
  setsData[setIdToRemovedKey(setId)] = names;
}
