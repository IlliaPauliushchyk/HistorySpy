import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  BUILTIN_SET_TYPE_IDS,
  BuiltinSetTypeId,
  setIdToRemovedKey,
} from '@/constants/builtinCurriculum';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import {
  getBuiltinSet,
  getInitialSetsForLanguage,
  getRussianName,
  preloadDataFromFirestore,
} from './localization';
import {
  createEmptySetsData,
  getRemovedNames,
  setRemovedNames,
  SetItem,
  SetsData,
  storage,
} from './storage';

const t = (key: string) => i18n.t(key);

function normalizeCustomSetItem(item: {
  name: string;
  type: string;
}): SetItem {
  const valid = Object.values(BUILTIN_SET_ID_TO_ITEM_TYPE);
  if (valid.includes(item.type as SetItem['type'])) {
    return { name: item.name, type: item.type as SetItem['type'] };
  }
  return { name: item.name, type: 'worldHistory5Name' };
}

export const getInitialSets = (): SetsData => {
  const language = (i18n.language || 'ru') as ILanguage;
  return createEmptySetsData(language);
};

export const getActualSets = (
  setsData: SetsData,
): Record<BuiltinSetTypeId, SetItem[]> => {
  const language = (i18n.language || 'ru') as ILanguage;
  const all = getInitialSetsForLanguage(language);
  const result = {} as Record<BuiltinSetTypeId, SetItem[]>;

  for (const setId of BUILTIN_SET_TYPE_IDS) {
    const itemType = BUILTIN_SET_ID_TO_ITEM_TYPE[setId];
    const removed = new Set(getRemovedNames(setsData, setId));

    result[setId] = all[setId].filter(item => {
      const ru = getRussianName(item.name, itemType);
      return !removed.has(ru);
    });
  }

  return result;
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
  const ru = getInitialSetsForLanguage('ru');

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

    const updatedSets: SetsData = {
      ...createEmptySetsData(currentLanguage),
      customSets: migratedCustomSets,
      language: currentLanguage,
    };

    for (const setId of BUILTIN_SET_TYPE_IDS) {
      const allowed = new Set(ru[setId].map(i => i.name));
      const raw = getRemovedNames(saved, setId);
      setRemovedNames(
        updatedSets,
        setId,
        raw.filter(n => allowed.has(n)),
      );
    }

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
  const actual = getActualSets(setsData);

  if (BUILTIN_SET_TYPE_IDS.includes(setName as BuiltinSetTypeId)) {
    return actual[setName as BuiltinSetTypeId];
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
  const sets: Array<{
    id: string;
    name: string;
    type: 'base' | 'custom';
    isModified: boolean;
  }> = BUILTIN_SET_TYPE_IDS.map(id => {
    const removed = getRemovedNames(setsData, id);
    return {
      id,
      name: t(`labels.${id}`),
      type: 'base' as const,
      isModified: (removed?.length || 0) > 0,
    };
  });

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
  const { editingCustomSetId, customSetName, selectedItemKeys, t: translate } =
    params;
  const selectedSet = new Set(selectedItemKeys);

  if (!customSetName.trim()) {
    return { success: false, error: translate('messages.setNameRequired') };
  }
  if (selectedSet.size < 5) {
    return { success: false, error: translate('messages.customSetMin5Error') };
  }

  const currentLanguage = (i18n.language || 'ru') as ILanguage;
  const initial = getInitialSetsForLanguage(currentLanguage);
  const allItems: SetItem[] = BUILTIN_SET_TYPE_IDS.flatMap(setId =>
    initial[setId].map(item => ({ ...item })),
  );

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
  } else if (items.length < 10) {
    return {
      valid: false,
      error: t('validation.baseSetMin10'),
    };
  }
  return { valid: true };
};
