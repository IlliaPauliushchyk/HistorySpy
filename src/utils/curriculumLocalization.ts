import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  BUILTIN_SET_TYPE_IDS,
  BuiltinSetTypeId,
  CurriculumItemType,
} from '@/constants/builtinCurriculum';
import { DATA_SOURCE } from '@/constants';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import {
  curriculumHintsBe,
  curriculumHintsEn,
  curriculumHintsRu,
} from '@/mocks/hints';
import type { CurriculumHintsMap } from '@/mocks/hints/types';
import { SetItem } from './storage';
import { BUILTIN_MOCKS } from './builtinMocks';
import { getBuiltinSetFromFirestore } from './firestore';

type NamesCache = Partial<Record<ILanguage, string[]>>;

const caches: Record<BuiltinSetTypeId, NamesCache> = Object.fromEntries(
  BUILTIN_SET_TYPE_IDS.map(id => [id, {}]),
) as Record<BuiltinSetTypeId, NamesCache>;

async function preloadSet(
  setId: BuiltinSetTypeId,
  language: ILanguage,
  force: boolean,
): Promise<void> {
  const cache = caches[setId];
  if (!force && cache[language] !== undefined) {
    return;
  }
  const mocks = BUILTIN_MOCKS[setId];
  if (DATA_SOURCE === 'mocks') {
    cache[language] = mocks[language];
    return;
  }
  try {
    const data = await getBuiltinSetFromFirestore(setId, language);
    cache[language] = data?.length ? data : mocks[language];
  } catch (error) {
    console.warn(`Failed to load ${setId} from Firestore, using mocks:`, error);
    cache[language] = mocks[language];
  }
}

function getSetNames(setId: BuiltinSetTypeId, language: ILanguage): string[] {
  const cache = caches[setId];
  if (cache[language]?.length) {
    return cache[language]!;
  }
  return BUILTIN_MOCKS[setId][language] ?? [];
}

export const getBuiltinSet = (
  setId: BuiltinSetTypeId,
  language: ILanguage,
): string[] => getSetNames(setId, language);

export const preloadBuiltinSetFromFirestore = async (
  setId: BuiltinSetTypeId,
  language: ILanguage,
  force: boolean = false,
): Promise<void> => preloadSet(setId, language, force);

export const preloadDataFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> => {
  await Promise.allSettled(
    BUILTIN_SET_TYPE_IDS.map(setId =>
      preloadSet(setId, language, force),
    ),
  );
};

export const clearFirestoreCache = (): void => {
  BUILTIN_SET_TYPE_IDS.forEach(setId => {
    caches[setId] = {};
  });
};

export const getInitialSetsForLanguage = (
  language: ILanguage,
): Record<BuiltinSetTypeId, SetItem[]> => {
  const result = {} as Record<BuiltinSetTypeId, SetItem[]>;
  for (const setId of BUILTIN_SET_TYPE_IDS) {
    const itemType = BUILTIN_SET_ID_TO_ITEM_TYPE[setId];
    result[setId] = getSetNames(setId, language).map(name => ({
      name,
      type: itemType,
    }));
  }
  return result;
};

export type { CurriculumItemType };
export { BUILTIN_SET_ID_TO_ITEM_TYPE };

const ALL_ITEM_TYPES = Object.values(
  BUILTIN_SET_ID_TO_ITEM_TYPE,
) as CurriculumItemType[];

function resolveItemType(
  name: string,
  type: CurriculumItemType | undefined,
  language: ILanguage,
): CurriculumItemType | null {
  if (type) {
    return type;
  }
  for (const itemType of ALL_ITEM_TYPES) {
    const setId = BUILTIN_SET_TYPE_IDS.find(
      id => BUILTIN_SET_ID_TO_ITEM_TYPE[id] === itemType,
    );
    if (setId && getSetNames(setId, language).includes(name)) {
      return itemType;
    }
  }
  return null;
}

function getArraysForType(
  itemType: CurriculumItemType,
  language: ILanguage,
): { ru: string[]; loc: string[] } {
  const setId = BUILTIN_SET_TYPE_IDS.find(
    id => BUILTIN_SET_ID_TO_ITEM_TYPE[id] === itemType,
  ) as BuiltinSetTypeId;
  return {
    ru: getSetNames(setId, 'ru'),
    loc: getSetNames(setId, language),
  };
}

export const getLocalizedName = (
  russianName: string,
  type?: CurriculumItemType,
): string => {
  const currentLanguage = (i18n.language || 'ru') as ILanguage;
  if (currentLanguage === 'ru') {
    return russianName;
  }
  const actualType = resolveItemType(russianName, type, 'ru');
  if (!actualType) {
    return russianName;
  }
  const { ru, loc } = getArraysForType(actualType, currentLanguage);
  const index = ru.indexOf(russianName);
  return index === -1 ? russianName : loc[index] || russianName;
};

export const getRussianName = (
  localizedName: string,
  type?: CurriculumItemType,
): string => {
  const currentLanguage = (i18n.language || 'ru') as ILanguage;
  if (currentLanguage === 'ru') {
    return localizedName;
  }
  const actualType = resolveItemType(localizedName, type, currentLanguage);
  if (!actualType) {
    return localizedName;
  }
  const { ru, loc } = getArraysForType(actualType, currentLanguage);
  const index = loc.indexOf(localizedName);
  return index === -1 ? localizedName : ru[index] || localizedName;
};

const CURRICULUM_HINTS: Record<ILanguage, CurriculumHintsMap> = {
  ru: curriculumHintsRu,
  en: curriculumHintsEn,
  be: curriculumHintsBe,
};

export const getLocalizedHint = (
  name: string,
  type?: CurriculumItemType,
): string => {
  const ruKey = type ? getRussianName(name, type) : name;
  const language = (i18n.language || 'ru') as ILanguage;
  const hints = CURRICULUM_HINTS[language] ?? CURRICULUM_HINTS.ru;
  return hints[ruKey] ?? CURRICULUM_HINTS.ru[ruKey] ?? '';
};

export const hasBuiltinHint = (
  name: string,
  type?: CurriculumItemType,
): boolean => getLocalizedHint(name, type).length > 0;
