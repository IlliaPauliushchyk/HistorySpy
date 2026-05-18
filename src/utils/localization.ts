import { DATA_SOURCE } from '@/constants';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import { belarusHistoryDefinitions as belarusHistoryDefinitionsRu } from '@/mocks/belarusHistoryDefinitions';
import { belarusHistoryDefinitions as belarusHistoryDefinitionsEn } from '@/mocks/belarusHistoryDefinitions-en';
import { belarusHistoryDefinitions as belarusHistoryDefinitionsBe } from '@/mocks/belarusHistoryDefinitions-be';
import { belarusHistoryEvents as belarusHistoryEventsRu } from '@/mocks/belarusHistoryEvents';
import { belarusHistoryEvents as belarusHistoryEventsEn } from '@/mocks/belarusHistoryEvents-en';
import { belarusHistoryEvents as belarusHistoryEventsBe } from '@/mocks/belarusHistoryEvents-be';
import { belarusHistoryNames as belarusHistoryNamesRu } from '@/mocks/belarusHistoryNames';
import { belarusHistoryNames as belarusHistoryNamesEn } from '@/mocks/belarusHistoryNames-en';
import { belarusHistoryNames as belarusHistoryNamesBe } from '@/mocks/belarusHistoryNames-be';
import {
  belarusHistoryDefinitionsHints,
  belarusHistoryDefinitionsHintsBe,
  belarusHistoryDefinitionsHintsEn,
  belarusHistoryEventsHints,
  belarusHistoryEventsHintsBe,
  belarusHistoryEventsHintsEn,
  belarusHistoryNamesHints,
  belarusHistoryNamesHintsBe,
  belarusHistoryNamesHintsEn,
  worldHistoryDefinitionsHints,
  worldHistoryDefinitionsHintsBe,
  worldHistoryDefinitionsHintsEn,
  worldHistoryEventsHints,
  worldHistoryEventsHintsBe,
  worldHistoryEventsHintsEn,
  worldHistoryNamesHints,
  worldHistoryNamesHintsBe,
  worldHistoryNamesHintsEn,
} from '@/mocks/hints';
import type { CurriculumHintsMap } from '@/mocks/hints/types';
import { worldHistoryDefinitions as worldHistoryDefinitionsRu } from '@/mocks/worldHistoryDefinitions';
import { worldHistoryDefinitions as worldHistoryDefinitionsEn } from '@/mocks/worldHistoryDefinitions-en';
import { worldHistoryDefinitions as worldHistoryDefinitionsBe } from '@/mocks/worldHistoryDefinitions-be';
import { worldHistoryEvents as worldHistoryEventsRu } from '@/mocks/worldHistoryEvents';
import { worldHistoryEvents as worldHistoryEventsEn } from '@/mocks/worldHistoryEvents-en';
import { worldHistoryEvents as worldHistoryEventsBe } from '@/mocks/worldHistoryEvents-be';
import { worldHistoryNames as worldHistoryNamesRu } from '@/mocks/worldHistoryNames';
import { worldHistoryNames as worldHistoryNamesEn } from '@/mocks/worldHistoryNames-en';
import { worldHistoryNames as worldHistoryNamesBe } from '@/mocks/worldHistoryNames-be';
import {
  getBelarusHistoryDefinitionsFromFirestore,
  getBelarusHistoryEventsFromFirestore,
  getBelarusHistoryNamesFromFirestore,
  getWorldHistoryDefinitionsFromFirestore,
  getWorldHistoryEventsFromFirestore,
  getWorldHistoryNamesFromFirestore,
} from './firestore';
import { SetItem } from './storage';

type NamesCache = { [key in ILanguage]?: string[] | null };

let worldHistoryDefinitionsCache: NamesCache = {};
let worldHistoryNamesCache: NamesCache = {};
let worldHistoryEventsCache: NamesCache = {};
let belarusHistoryDefinitionsCache: NamesCache = {};
let belarusHistoryNamesCache: NamesCache = {};
let belarusHistoryEventsCache: NamesCache = {};

const worldHistoryDefinitionsMocks: { [key in ILanguage]: string[] } = {
  ru: worldHistoryDefinitionsRu,
  en: worldHistoryDefinitionsEn,
  be: worldHistoryDefinitionsBe,
};

const worldHistoryNamesMocks: { [key in ILanguage]: string[] } = {
  ru: worldHistoryNamesRu,
  en: worldHistoryNamesEn,
  be: worldHistoryNamesBe,
};

const worldHistoryEventsMocks: { [key in ILanguage]: string[] } = {
  ru: worldHistoryEventsRu,
  en: worldHistoryEventsEn,
  be: worldHistoryEventsBe,
};

const belarusHistoryDefinitionsMocks: { [key in ILanguage]: string[] } = {
  ru: belarusHistoryDefinitionsRu,
  en: belarusHistoryDefinitionsEn,
  be: belarusHistoryDefinitionsBe,
};

const belarusHistoryNamesMocks: { [key in ILanguage]: string[] } = {
  ru: belarusHistoryNamesRu,
  en: belarusHistoryNamesEn,
  be: belarusHistoryNamesBe,
};

const belarusHistoryEventsMocks: { [key in ILanguage]: string[] } = {
  ru: belarusHistoryEventsRu,
  en: belarusHistoryEventsEn,
  be: belarusHistoryEventsBe,
};

async function preloadNamesSet(
  language: ILanguage,
  force: boolean,
  cache: NamesCache,
  mocks: { [key in ILanguage]: string[] },
  fetcher: (lang: ILanguage) => Promise<string[] | null>,
  label: string,
): Promise<void> {
  if (!force && cache[language] !== undefined) {
    return;
  }
  if (DATA_SOURCE === 'mocks') {
    cache[language] = mocks[language];
    return;
  }
  try {
    const data = await fetcher(language);
    if (data && data.length > 0) {
      cache[language] = data;
    } else {
      cache[language] = mocks[language];
    }
  } catch (error) {
    console.warn(`Failed to load ${label} from Firestore, using mocks:`, error);
    cache[language] = mocks[language];
  }
}

function getCachedNames(
  language: ILanguage,
  cache: NamesCache,
  mocks: { [key in ILanguage]: string[] },
): string[] {
  if (cache[language]) {
    return cache[language]!;
  }
  if (mocks[language]) {
    return mocks[language]!;
  }
  return [];
}

export const preloadWorldHistoryDefinitionsFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> =>
  preloadNamesSet(
    language,
    force,
    worldHistoryDefinitionsCache,
    worldHistoryDefinitionsMocks,
    getWorldHistoryDefinitionsFromFirestore,
    'worldHistoryDefinitions',
  );

export const getWorldHistoryDefinitions = (language: ILanguage): string[] =>
  getCachedNames(language, worldHistoryDefinitionsCache, worldHistoryDefinitionsMocks);

export const preloadWorldHistoryNamesFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> =>
  preloadNamesSet(
    language,
    force,
    worldHistoryNamesCache,
    worldHistoryNamesMocks,
    getWorldHistoryNamesFromFirestore,
    'worldHistoryNames',
  );

export const getWorldHistoryNames = (language: ILanguage): string[] =>
  getCachedNames(language, worldHistoryNamesCache, worldHistoryNamesMocks);

export const preloadWorldHistoryEventsFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> =>
  preloadNamesSet(
    language,
    force,
    worldHistoryEventsCache,
    worldHistoryEventsMocks,
    getWorldHistoryEventsFromFirestore,
    'worldHistoryEvents',
  );

export const getWorldHistoryEvents = (language: ILanguage): string[] =>
  getCachedNames(language, worldHistoryEventsCache, worldHistoryEventsMocks);

export const preloadBelarusHistoryDefinitionsFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> =>
  preloadNamesSet(
    language,
    force,
    belarusHistoryDefinitionsCache,
    belarusHistoryDefinitionsMocks,
    getBelarusHistoryDefinitionsFromFirestore,
    'belarusHistoryDefinitions',
  );

export const getBelarusHistoryDefinitions = (language: ILanguage): string[] =>
  getCachedNames(
    language,
    belarusHistoryDefinitionsCache,
    belarusHistoryDefinitionsMocks,
  );

export const preloadBelarusHistoryNamesFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> =>
  preloadNamesSet(
    language,
    force,
    belarusHistoryNamesCache,
    belarusHistoryNamesMocks,
    getBelarusHistoryNamesFromFirestore,
    'belarusHistoryNames',
  );

export const getBelarusHistoryNames = (language: ILanguage): string[] =>
  getCachedNames(language, belarusHistoryNamesCache, belarusHistoryNamesMocks);

export const preloadBelarusHistoryEventsFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> =>
  preloadNamesSet(
    language,
    force,
    belarusHistoryEventsCache,
    belarusHistoryEventsMocks,
    getBelarusHistoryEventsFromFirestore,
    'belarusHistoryEvents',
  );

export const getBelarusHistoryEvents = (language: ILanguage): string[] =>
  getCachedNames(language, belarusHistoryEventsCache, belarusHistoryEventsMocks);

export const preloadDataFromFirestore = async (
  language: ILanguage,
  force: boolean = false,
): Promise<void> => {
  await Promise.allSettled([
    preloadWorldHistoryDefinitionsFromFirestore(language, force),
    preloadWorldHistoryNamesFromFirestore(language, force),
    preloadWorldHistoryEventsFromFirestore(language, force),
    preloadBelarusHistoryDefinitionsFromFirestore(language, force),
    preloadBelarusHistoryNamesFromFirestore(language, force),
    preloadBelarusHistoryEventsFromFirestore(language, force),
  ]);
};

export const clearFirestoreCache = (): void => {
  worldHistoryDefinitionsCache = {};
  worldHistoryNamesCache = {};
  worldHistoryEventsCache = {};
  belarusHistoryDefinitionsCache = {};
  belarusHistoryNamesCache = {};
  belarusHistoryEventsCache = {};
};

export const getInitialSetsForLanguage = (
  language: ILanguage,
): {
  worldHistoryDefinitions: SetItem[];
  worldHistoryNames: SetItem[];
  worldHistoryEvents: SetItem[];
  belarusHistoryDefinitions: SetItem[];
  belarusHistoryNames: SetItem[];
  belarusHistoryEvents: SetItem[];
} => {
  const wDef = getWorldHistoryDefinitions(language);
  const wNam = getWorldHistoryNames(language);
  const wEv = getWorldHistoryEvents(language);
  const bDef = getBelarusHistoryDefinitions(language);
  const bNam = getBelarusHistoryNames(language);
  const bEv = getBelarusHistoryEvents(language);

  return {
    worldHistoryDefinitions: wDef.map(name => ({
      name,
      type: 'worldHistoryDefinition' as const,
    })),
    worldHistoryNames: wNam.map(name => ({
      name,
      type: 'worldHistoryName' as const,
    })),
    worldHistoryEvents: wEv.map(name => ({
      name,
      type: 'worldHistoryEvent' as const,
    })),
    belarusHistoryDefinitions: bDef.map(name => ({
      name,
      type: 'belarusHistoryDefinition' as const,
    })),
    belarusHistoryNames: bNam.map(name => ({
      name,
      type: 'belarusHistoryName' as const,
    })),
    belarusHistoryEvents: bEv.map(name => ({
      name,
      type: 'belarusHistoryEvent' as const,
    })),
  };
};

export type CurriculumItemType =
  | 'worldHistoryDefinition'
  | 'worldHistoryName'
  | 'worldHistoryEvent'
  | 'belarusHistoryDefinition'
  | 'belarusHistoryName'
  | 'belarusHistoryEvent';

/** Встроенный setId → тип элемента для локализации и getRussianName. */
export const BUILTIN_SET_ID_TO_ITEM_TYPE: Record<string, CurriculumItemType> =
  {
    worldHistoryDefinitions: 'worldHistoryDefinition',
    worldHistoryNames: 'worldHistoryName',
    worldHistoryEvents: 'worldHistoryEvent',
    belarusHistoryDefinitions: 'belarusHistoryDefinition',
    belarusHistoryNames: 'belarusHistoryName',
    belarusHistoryEvents: 'belarusHistoryEvent',
  };

export const getLocalizedName = (
  russianName: string,
  type?: CurriculumItemType,
): string => {
  const currentLanguage = (i18n.language || 'ru') as ILanguage;
  if (currentLanguage === 'ru') {
    return russianName;
  }

  let actualType: CurriculumItemType = type || 'worldHistoryName';
  if (!type) {
    if (getWorldHistoryDefinitions('ru').indexOf(russianName) !== -1) {
      actualType = 'worldHistoryDefinition';
    } else if (getWorldHistoryNames('ru').indexOf(russianName) !== -1) {
      actualType = 'worldHistoryName';
    } else if (getWorldHistoryEvents('ru').indexOf(russianName) !== -1) {
      actualType = 'worldHistoryEvent';
    } else if (getBelarusHistoryDefinitions('ru').indexOf(russianName) !== -1) {
      actualType = 'belarusHistoryDefinition';
    } else if (getBelarusHistoryNames('ru').indexOf(russianName) !== -1) {
      actualType = 'belarusHistoryName';
    } else if (getBelarusHistoryEvents('ru').indexOf(russianName) !== -1) {
      actualType = 'belarusHistoryEvent';
    } else {
      return russianName;
    }
  }

  const ruArr =
    actualType === 'worldHistoryDefinition'
      ? getWorldHistoryDefinitions('ru')
      : actualType === 'worldHistoryName'
      ? getWorldHistoryNames('ru')
      : actualType === 'worldHistoryEvent'
      ? getWorldHistoryEvents('ru')
      : actualType === 'belarusHistoryDefinition'
      ? getBelarusHistoryDefinitions('ru')
      : actualType === 'belarusHistoryName'
      ? getBelarusHistoryNames('ru')
      : getBelarusHistoryEvents('ru');

  const index = ruArr.indexOf(russianName);
  if (index === -1) {
    return russianName;
  }

  const locArr =
    actualType === 'worldHistoryDefinition'
      ? getWorldHistoryDefinitions(currentLanguage)
      : actualType === 'worldHistoryName'
      ? getWorldHistoryNames(currentLanguage)
      : actualType === 'worldHistoryEvent'
      ? getWorldHistoryEvents(currentLanguage)
      : actualType === 'belarusHistoryDefinition'
      ? getBelarusHistoryDefinitions(currentLanguage)
      : actualType === 'belarusHistoryName'
      ? getBelarusHistoryNames(currentLanguage)
      : getBelarusHistoryEvents(currentLanguage);

  return locArr[index] || russianName;
};

export const getRussianName = (
  localizedName: string,
  type?: CurriculumItemType,
): string => {
  const currentLanguage = (i18n.language || 'ru') as ILanguage;
  if (currentLanguage === 'ru') {
    return localizedName;
  }

  let actualType: CurriculumItemType = type || 'worldHistoryName';
  if (!type) {
    const cur = currentLanguage;
    if (getWorldHistoryDefinitions(cur).indexOf(localizedName) !== -1) {
      actualType = 'worldHistoryDefinition';
    } else if (getWorldHistoryNames(cur).indexOf(localizedName) !== -1) {
      actualType = 'worldHistoryName';
    } else if (getWorldHistoryEvents(cur).indexOf(localizedName) !== -1) {
      actualType = 'worldHistoryEvent';
    } else if (getBelarusHistoryDefinitions(cur).indexOf(localizedName) !== -1) {
      actualType = 'belarusHistoryDefinition';
    } else if (getBelarusHistoryNames(cur).indexOf(localizedName) !== -1) {
      actualType = 'belarusHistoryName';
    } else if (getBelarusHistoryEvents(cur).indexOf(localizedName) !== -1) {
      actualType = 'belarusHistoryEvent';
    } else {
      const ruChecks = [
        ...getWorldHistoryDefinitions('ru'),
        ...getWorldHistoryNames('ru'),
        ...getWorldHistoryEvents('ru'),
        ...getBelarusHistoryDefinitions('ru'),
        ...getBelarusHistoryNames('ru'),
        ...getBelarusHistoryEvents('ru'),
      ];
      if (ruChecks.indexOf(localizedName) !== -1) {
        return localizedName;
      }
      return localizedName;
    }
  }

  const locArr =
    actualType === 'worldHistoryDefinition'
      ? getWorldHistoryDefinitions(currentLanguage)
      : actualType === 'worldHistoryName'
      ? getWorldHistoryNames(currentLanguage)
      : actualType === 'worldHistoryEvent'
      ? getWorldHistoryEvents(currentLanguage)
      : actualType === 'belarusHistoryDefinition'
      ? getBelarusHistoryDefinitions(currentLanguage)
      : actualType === 'belarusHistoryName'
      ? getBelarusHistoryNames(currentLanguage)
      : getBelarusHistoryEvents(currentLanguage);

  const index = locArr.indexOf(localizedName);
  if (index === -1) {
    return localizedName;
  }

  const ruArr =
    actualType === 'worldHistoryDefinition'
      ? getWorldHistoryDefinitions('ru')
      : actualType === 'worldHistoryName'
      ? getWorldHistoryNames('ru')
      : actualType === 'worldHistoryEvent'
      ? getWorldHistoryEvents('ru')
      : actualType === 'belarusHistoryDefinition'
      ? getBelarusHistoryDefinitions('ru')
      : actualType === 'belarusHistoryName'
      ? getBelarusHistoryNames('ru')
      : getBelarusHistoryEvents('ru');

  return ruArr[index] || localizedName;
};

const HINTS_BY_ITEM_TYPE: Record<
  CurriculumItemType,
  { ru: CurriculumHintsMap; en: CurriculumHintsMap; be: CurriculumHintsMap }
> = {
  worldHistoryDefinition: {
    ru: worldHistoryDefinitionsHints,
    en: worldHistoryDefinitionsHintsEn,
    be: worldHistoryDefinitionsHintsBe,
  },
  worldHistoryName: {
    ru: worldHistoryNamesHints,
    en: worldHistoryNamesHintsEn,
    be: worldHistoryNamesHintsBe,
  },
  worldHistoryEvent: {
    ru: worldHistoryEventsHints,
    en: worldHistoryEventsHintsEn,
    be: worldHistoryEventsHintsBe,
  },
  belarusHistoryDefinition: {
    ru: belarusHistoryDefinitionsHints,
    en: belarusHistoryDefinitionsHintsEn,
    be: belarusHistoryDefinitionsHintsBe,
  },
  belarusHistoryName: {
    ru: belarusHistoryNamesHints,
    en: belarusHistoryNamesHintsEn,
    be: belarusHistoryNamesHintsBe,
  },
  belarusHistoryEvent: {
    ru: belarusHistoryEventsHints,
    en: belarusHistoryEventsHintsEn,
    be: belarusHistoryEventsHintsBe,
  },
};

export const getLocalizedHint = (
  name: string,
  type?: CurriculumItemType,
): string => {
  if (!type) {
    return '';
  }
  const ruKey = getRussianName(name, type);
  const language = (i18n.language || 'ru') as ILanguage;
  const maps = HINTS_BY_ITEM_TYPE[type];
  return maps[language][ruKey] ?? maps.ru[ruKey] ?? '';
};

export const hasBuiltinHint = (
  name: string,
  type?: CurriculumItemType,
): boolean => getLocalizedHint(name, type).length > 0;
