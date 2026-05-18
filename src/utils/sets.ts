import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import {
  getBelarusHistoryDefinitions,
  getBelarusHistoryEvents,
  getBelarusHistoryNames,
  getInitialSetsForLanguage,
  getRussianName,
  getWorldHistoryDefinitions,
  getWorldHistoryEvents,
  getWorldHistoryNames,
  preloadDataFromFirestore,
} from './localization';
import { SetItem, SetsData, storage } from './storage';

const t = (key: string) => i18n.t(key);

const VALID_ITEM_TYPES: SetItem['type'][] = [
  'worldHistoryDefinition',
  'worldHistoryName',
  'worldHistoryEvent',
  'belarusHistoryDefinition',
  'belarusHistoryName',
  'belarusHistoryEvent',
];

function normalizeCustomSetItem(item: { name: string; type: string }): SetItem {
  if (VALID_ITEM_TYPES.includes(item.type as SetItem['type'])) {
    return { name: item.name, type: item.type as SetItem['type'] };
  }
  return { name: item.name, type: 'worldHistoryName' };
}

export const getInitialSets = (): SetsData => {
  const language = (i18n.language || 'ru') as ILanguage;
  return {
    removedWorldHistoryDefinitionsNames: [],
    removedWorldHistoryNamesNames: [],
    removedWorldHistoryEventsNames: [],
    removedBelarusHistoryDefinitionsNames: [],
    removedBelarusHistoryNamesNames: [],
    removedBelarusHistoryEventsNames: [],
    customSets: [],
    language,
  };
};

export const getActualSets = (
  removedWorldHistoryDefinitionsNames: string[] = [],
  removedWorldHistoryNamesNames: string[] = [],
  removedWorldHistoryEventsNames: string[] = [],
  removedBelarusHistoryDefinitionsNames: string[] = [],
  removedBelarusHistoryNamesNames: string[] = [],
  removedBelarusHistoryEventsNames: string[] = [],
): {
  worldHistoryDefinitions: SetItem[];
  worldHistoryNames: SetItem[];
  worldHistoryEvents: SetItem[];
  belarusHistoryDefinitions: SetItem[];
  belarusHistoryNames: SetItem[];
  belarusHistoryEvents: SetItem[];
} => {
  const language = (i18n.language || 'ru') as ILanguage;
  const {
    worldHistoryDefinitions: allWDef,
    worldHistoryNames: allWNam,
    worldHistoryEvents: allWEv,
    belarusHistoryDefinitions: allBDef,
    belarusHistoryNames: allBNam,
    belarusHistoryEvents: allBEv,
  } = getInitialSetsForLanguage(language);

  const wDefSet = new Set(removedWorldHistoryDefinitionsNames);
  const wNamSet = new Set(removedWorldHistoryNamesNames);
  const wEvSet = new Set(removedWorldHistoryEventsNames);
  const bDefSet = new Set(removedBelarusHistoryDefinitionsNames);
  const bNamSet = new Set(removedBelarusHistoryNamesNames);
  const bEvSet = new Set(removedBelarusHistoryEventsNames);

  const filterByRemoved = (
    items: SetItem[],
    removed: Set<string>,
    itemType: SetItem['type'],
  ) =>
    items.filter(item => {
      const ru = getRussianName(item.name, itemType);
      return !removed.has(ru);
    });

  return {
    worldHistoryDefinitions: filterByRemoved(
      allWDef,
      wDefSet,
      'worldHistoryDefinition',
    ),
    worldHistoryNames: filterByRemoved(allWNam, wNamSet, 'worldHistoryName'),
    worldHistoryEvents: filterByRemoved(allWEv, wEvSet, 'worldHistoryEvent'),
    belarusHistoryDefinitions: filterByRemoved(
      allBDef,
      bDefSet,
      'belarusHistoryDefinition',
    ),
    belarusHistoryNames: filterByRemoved(
      allBNam,
      bNamSet,
      'belarusHistoryName',
    ),
    belarusHistoryEvents: filterByRemoved(allBEv, bEvSet, 'belarusHistoryEvent'),
  };
};

export const calculateRemovedNames = (
  fullList: SetItem[],
  currentList: SetItem[],
): string[] => {
  const removedNames: string[] = [];
  const currentSet = new Set<string>();

  currentList.forEach(item => {
    const russianName = getRussianName(item.name, item.type);
    currentSet.add(russianName);
  });

  fullList.forEach(item => {
    const russianName = getRussianName(item.name, item.type);
    if (!currentSet.has(russianName)) {
      removedNames.push(russianName);
    }
  });

  return removedNames;
};

export const loadSetsData = async (): Promise<SetsData> => {
  const currentLanguage = (i18n.language || 'ru') as ILanguage;

  await Promise.all([
    preloadDataFromFirestore(currentLanguage, false),
    currentLanguage !== 'ru'
      ? preloadDataFromFirestore('ru', false)
      : Promise.resolve(),
  ]);

  const saved = await storage.loadSets();

  const {
    worldHistoryDefinitions: fullWDef,
    worldHistoryNames: fullWNam,
    worldHistoryEvents: fullWEv,
    belarusHistoryDefinitions: fullBDef,
    belarusHistoryNames: fullBNam,
    belarusHistoryEvents: fullBEv,
  } = getInitialSetsForLanguage(currentLanguage);

  if (saved) {
    const migratedCustomSets = (saved.customSets || []).map(customSet => ({
      ...customSet,
      items: customSet.items.map(item => {
        const norm = normalizeCustomSetItem(item);
        return {
          name: getRussianName(item.name, norm.type),
          type: norm.type,
        };
      }),
    }));

    const ru = getInitialSetsForLanguage('ru');
    const nameSet = (items: SetItem[]) => new Set(items.map(i => i.name));

    const valid = (removed: string[] | undefined, full: SetItem[]) => {
      const allowed = nameSet(full);
      return (removed || []).filter(n => allowed.has(n));
    };

    const updatedSets: SetsData = {
      removedWorldHistoryDefinitionsNames: valid(
        saved.removedWorldHistoryDefinitionsNames,
        ru.worldHistoryDefinitions,
      ),
      removedWorldHistoryNamesNames: valid(
        saved.removedWorldHistoryNamesNames,
        ru.worldHistoryNames,
      ),
      removedWorldHistoryEventsNames: valid(
        saved.removedWorldHistoryEventsNames,
        ru.worldHistoryEvents,
      ),
      removedBelarusHistoryDefinitionsNames: valid(
        saved.removedBelarusHistoryDefinitionsNames,
        ru.belarusHistoryDefinitions,
      ),
      removedBelarusHistoryNamesNames: valid(
        saved.removedBelarusHistoryNamesNames,
        ru.belarusHistoryNames,
      ),
      removedBelarusHistoryEventsNames: valid(
        saved.removedBelarusHistoryEventsNames,
        ru.belarusHistoryEvents,
      ),
      customSets: migratedCustomSets,
      language: currentLanguage,
    };

    await storage.saveSets(updatedSets);
    return updatedSets;
  }

  const initial = getInitialSets();
  await storage.saveSets(initial);
  return initial;
};

export const getSetByName = (
  setsData: SetsData,
  setName: string,
): SetItem[] | null => {
  const actual = getActualSets(
    setsData.removedWorldHistoryDefinitionsNames,
    setsData.removedWorldHistoryNamesNames,
    setsData.removedWorldHistoryEventsNames,
    setsData.removedBelarusHistoryDefinitionsNames,
    setsData.removedBelarusHistoryNamesNames,
    setsData.removedBelarusHistoryEventsNames,
  );

  if (setName === 'worldHistoryDefinitions') {
    return actual.worldHistoryDefinitions;
  }
  if (setName === 'worldHistoryNames') {
    return actual.worldHistoryNames;
  }
  if (setName === 'worldHistoryEvents') {
    return actual.worldHistoryEvents;
  }
  if (setName === 'belarusHistoryDefinitions') {
    return actual.belarusHistoryDefinitions;
  }
  if (setName === 'belarusHistoryNames') {
    return actual.belarusHistoryNames;
  }
  if (setName === 'belarusHistoryEvents') {
    return actual.belarusHistoryEvents;
  }

  const customSet = setsData.customSets.find(set => set.id === setName);
  return customSet ? customSet.items : null;
};

export const getAvailableSets = (
  setsData: SetsData,
): Array<{
  id: string;
  name: string;
  type: 'base' | 'custom';
  isModified: boolean;
}> => {
  const baseIds = [
    'worldHistoryDefinitions',
    'worldHistoryNames',
    'worldHistoryEvents',
    'belarusHistoryDefinitions',
    'belarusHistoryNames',
    'belarusHistoryEvents',
  ] as const;

  const sets: Array<{
    id: string;
    name: string;
    type: 'base' | 'custom';
    isModified: boolean;
  }> = baseIds.map(id => ({
    id,
    name: t(`labels.${id}`),
    type: 'base' as const,
    isModified: false,
  }));

  sets[0].isModified =
    (setsData.removedWorldHistoryDefinitionsNames?.length || 0) > 0;
  sets[1].isModified = (setsData.removedWorldHistoryNamesNames?.length || 0) > 0;
  sets[2].isModified = (setsData.removedWorldHistoryEventsNames?.length || 0) > 0;
  sets[3].isModified =
    (setsData.removedBelarusHistoryDefinitionsNames?.length || 0) > 0;
  sets[4].isModified =
    (setsData.removedBelarusHistoryNamesNames?.length || 0) > 0;
  sets[5].isModified =
    (setsData.removedBelarusHistoryEventsNames?.length || 0) > 0;

  setsData.customSets.forEach(customSet => {
    sets.push({
      id: customSet.id,
      name: customSet.name,
      type: 'custom' as const,
      isModified: true,
    });
  });

  return sets;
};

export const saveCustomSetToStorage = async (params: {
  editingCustomSetId: string | null;
  customSetName: string;
  selectedItemKeys: string[];
  t: (key: string) => string;
}): Promise<{ success: boolean; error?: string; setId?: string }> => {
  const { editingCustomSetId, customSetName, selectedItemKeys, t } = params;
  const selectedSet = new Set(selectedItemKeys);

  if (!customSetName.trim()) {
    return { success: false, error: t('messages.setNameRequired') };
  }
  if (selectedSet.size < 5) {
    return { success: false, error: t('messages.customSetMin5Error') };
  }

  const currentLanguage = (i18n.language || 'ru') as ILanguage;
  const allItems: { name: string; type: SetItem['type'] }[] = [
    ...getWorldHistoryDefinitions(currentLanguage).map(name => ({
      name,
      type: 'worldHistoryDefinition' as const,
    })),
    ...getWorldHistoryNames(currentLanguage).map(name => ({
      name,
      type: 'worldHistoryName' as const,
    })),
    ...getWorldHistoryEvents(currentLanguage).map(name => ({
      name,
      type: 'worldHistoryEvent' as const,
    })),
    ...getBelarusHistoryDefinitions(currentLanguage).map(name => ({
      name,
      type: 'belarusHistoryDefinition' as const,
    })),
    ...getBelarusHistoryNames(currentLanguage).map(name => ({
      name,
      type: 'belarusHistoryName' as const,
    })),
    ...getBelarusHistoryEvents(currentLanguage).map(name => ({
      name,
      type: 'belarusHistoryEvent' as const,
    })),
  ];

  const items: SetItem[] = allItems
    .filter(item => selectedSet.has(`${item.type}-${item.name}`))
    .map(item => ({
      name: getRussianName(item.name, item.type),
      type: item.type,
    }));

  const setsData = await loadSetsData();
  let customSets = [...(setsData.customSets || [])];

  let setId: string;
  if (editingCustomSetId) {
    setId = editingCustomSetId;
    customSets = customSets.map(cs =>
      cs.id === editingCustomSetId
        ? {
            id: cs.id,
            name: customSetName.trim(),
            items,
            isCustom: true,
            modifiedAt: Date.now(),
          }
        : cs,
    );
  } else {
    setId = `custom-${Date.now()}`;
    customSets.push({
      id: setId,
      name: customSetName.trim(),
      items,
      isCustom: true,
      modifiedAt: Date.now(),
    });
  }

  const updatedSetsData: SetsData = {
    ...setsData,
    customSets,
    language: currentLanguage,
  };

  await storage.saveSets(updatedSetsData);
  return { success: true, setId };
};

export const validateSet = (
  items: SetItem[],
  isCustom: boolean,
): { valid: boolean; error?: string } => {
  if (isCustom) {
    if (items.length < 5) {
      return {
        valid: false,
        error: t('validation.customSetMin5'),
      };
    }
  } else {
    if (items.length < 10) {
      return {
        valid: false,
        error: t('validation.baseSetMin10'),
      };
    }
  }
  return { valid: true };
};
