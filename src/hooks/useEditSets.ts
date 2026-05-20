import { useAlert } from '@/components';
import { TIMEOUTS } from '@/constants';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import { logSetItemDeleted, logSetReset } from '@/utils/analytics';
import { getInitialSetsForLanguage } from '@/utils/localization';
import {
  calculateRemovedNames,
  getActualSets,
  loadSetsData,
  validateSet,
} from '@/utils/sets';
import {
  BUILTIN_SET_TYPE_IDS,
  BuiltinSetTypeId,
  setIdToRemovedKey,
} from '@/constants/builtinCurriculum';
import {
  createEmptySetsData,
  setRemovedNames,
  SetItem,
  SetsData,
  storage,
} from '@/utils/storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';

export type EditingSet = {
  id: string;
  name: string;
  items: SetItem[];
  isCustom: boolean;
};

const REMOVED_KEYS = Object.fromEntries(
  BUILTIN_SET_TYPE_IDS.map(id => [id, setIdToRemovedKey(id)]),
) as Record<BuiltinSetTypeId, keyof SetsData>;

export const useEditSets = () => {
  const { t } = useTranslation();
  const { alert } = useAlert();

  const [setsData, setSetsData] = useState<SetsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSets, setEditingSets] = useState<EditingSet[]>([]);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const createCardOpacity = useRef(new Animated.Value(0)).current;
  const createCardTranslateY = useRef(new Animated.Value(20)).current;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadSetsData();
      setSetsData(data);
      initializeEditingSets(data);
    } catch (error) {
      console.error('Ошибка при загрузке наборов:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeEditingSets = useCallback(
    (data: SetsData) => {
      const actual = getActualSets(data);

      const sets: EditingSet[] = BUILTIN_SET_TYPE_IDS.map(id => ({
        id,
        name: t(`labels.${id}`),
        items: [...actual[id]],
        isCustom: false,
      }));

      data.customSets.forEach(customSet => {
        sets.push({
          id: customSet.id,
          name: customSet.name,
          items: [...customSet.items],
          isCustom: true,
        });
      });

      setEditingSets(sets);
    },
    [t],
  );

  const saveSetsData = useCallback(
    async (updatedEditingSets: EditingSet[]) => {
      if (!setsData) return false;

      try {
        for (const editingSet of updatedEditingSets) {
          const validation = validateSet(editingSet.items, editingSet.isCustom);
          if (!validation.valid) {
            alert({
              title: t('messages.validationError'),
              message: `${editingSet.name}: ${validation.error}`,
            });
            return false;
          }
        }

        const currentLanguage = (i18n.language || 'ru') as ILanguage;
        const full = getInitialSetsForLanguage(currentLanguage);

        const updatedSetsData: SetsData = {
          ...createEmptySetsData(currentLanguage),
          customSets: updatedEditingSets
            .filter(s => s.isCustom)
            .map(s => ({
              id: s.id,
              name: s.name,
              items: s.items,
              isCustom: true,
              modifiedAt: Date.now(),
            })),
          language: currentLanguage,
        };

        for (const id of BUILTIN_SET_TYPE_IDS) {
          setRemovedNames(
            updatedSetsData,
            id,
            calculateRemovedNames(
              full[id],
              updatedEditingSets.find(s => s.id === id)?.items || [],
            ),
          );
        }

        await storage.saveSets(updatedSetsData);
        setSetsData(updatedSetsData);
        return true;
      } catch (error) {
        console.error('Ошибка при сохранении наборов:', error);
        alert({
          title: t('messages.error'),
          message: t('messages.saveSetsError'),
        });
        return false;
      }
    },
    [setsData, alert, t],
  );

  const handleEditSet = useCallback(
    (setId: string) => {
      const editingSet = editingSets.find(s => s.id === setId);
      if (!editingSet) return;

      if (!editingSet.isCustom) {
        setEditingSetId(setId);
        setShowEditModal(true);
      }
    },
    [editingSets],
  );

  const handleResetSet = useCallback(
    (setId: string) => {
      alert({
        title: t('messages.resetSetTitle'),
        message: t('messages.resetSetMessage'),
        cancelText: t('buttons.cancel'),
        confirmText: t('buttons.reset'),
        onCancel: () => {},
        onConfirm: () => {
          const empty = getActualSets(createEmptySetsData());
          const resetItems = empty[setId as BuiltinSetTypeId] || null;
          if (!resetItems) {
            return;
          }

          const editingSet = editingSets.find(s => s.id === setId);
          if (editingSet && !editingSet.isCustom) {
            logSetReset({
              setType: setId,
              setName: editingSet.name,
              isCustom: false,
            });
          }

          setEditingSets(prev => {
            const updated = prev.map(set =>
              set.id === setId ? { ...set, items: [...resetItems] } : set,
            );
            setTimeout(() => saveSetsData(updated), 0);
            return updated;
          });
        },
      });
    },
    [alert, t, saveSetsData, editingSets],
  );

  const handleDeleteCustomSet = useCallback(
    (setId: string) => {
      alert({
        title: t('messages.deleteSetTitle'),
        message: t('messages.deleteSetMessage'),
        cancelText: t('buttons.cancel'),
        confirmText: t('buttons.delete'),
        onCancel: () => {},
        onConfirm: async () => {
          setEditingSets(prev => {
            const updated = prev.filter(set => set.id !== setId);
            setTimeout(() => saveSetsData(updated), 0);
            return updated;
          });
        },
      });
    },
    [alert, t, saveSetsData, editingSets],
  );

  const handleDeleteItemFromSet = useCallback(
    (setId: string, index: number) => {
      const editingSet = editingSets.find(s => s.id === setId);
      if (!editingSet) return;

      const newItems = editingSet.items.filter((_, i) => i !== index);
      const validation = validateSet(newItems, editingSet.isCustom);
      if (!validation.valid) {
        alert({
          title: t('messages.error'),
          message: validation.error || t('validation.cannotDeleteElement'),
        });
        return;
      }

      const deletedItem = editingSet.items[index];
      if (!editingSet.isCustom) {
        logSetItemDeleted({
          setType: setId,
          setName: editingSet.name,
          isCustom: false,
          itemType: deletedItem.type,
        });
      }

      setEditingSets(prev => {
        const updated = prev.map(set =>
          set.id === setId ? { ...set, items: newItems } : set,
        );
        setTimeout(() => saveSetsData(updated), TIMEOUTS.STATE_UPDATE);
        return updated;
      });
    },
    [editingSets, alert, t, saveSetsData],
  );

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingSetId(null);
  }, []);

  const getModifiedSets = useCallback(() => {
    if (!setsData) return new Set<string>();
    const modified = new Set<string>();

    for (const id of BUILTIN_SET_TYPE_IDS) {
      const key = REMOVED_KEYS[id];
      const arr = setsData[key] as string[] | undefined;
      if ((arr?.length || 0) > 0) {
        modified.add(t(`labels.${id}`));
      }
    }

    return modified;
  }, [setsData, t]);

  const modifiedSets = getModifiedSets();

  useEffect(() => {
    const delay = editingSets.length * 50;
    Animated.parallel([
      Animated.timing(createCardOpacity, {
        toValue: 1,
        duration: 300,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(createCardTranslateY, {
        toValue: 0,
        duration: 300,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [editingSets.length, createCardOpacity, createCardTranslateY]);

  return {
    setsData,
    loading,
    editingSets,
    editingSetId,
    showEditModal,
    modifiedSets,
    createCardOpacity,
    createCardTranslateY,
    loadData,
    handleEditSet,
    handleResetSet,
    handleDeleteCustomSet,
    handleDeleteItemFromSet,
    handleCloseEditModal,
  };
};
