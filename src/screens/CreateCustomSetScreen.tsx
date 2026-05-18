import {
  AppButton,
  AppText,
  FilterDropdown,
  Input,
  useAlert,
} from '@/components';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import {
  getBelarusHistoryDefinitions,
  getBelarusHistoryEvents,
  getBelarusHistoryNames,
  getLocalizedName,
  getRussianName,
  getWorldHistoryDefinitions,
  getWorldHistoryEvents,
  getWorldHistoryNames,
} from '@/utils/localization';
import { SetItem } from '@/utils/storage';
// Аналитика для кастомных наборов отключена - импорт удален
import { saveCustomSetToStorage } from '@/utils/sets';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { Checkbox, Searchbar, useTheme } from 'react-native-paper';

const FILTER_OPTIONS = [
  { value: 'all', labelKey: 'labels.all', icon: 'format-list-bulleted' },
  {
    value: 'worldHistoryDefinition',
    labelKey: 'labels.worldHistoryDefinitions',
    icon: 'book-open-variant',
  },
  {
    value: 'worldHistoryName',
    labelKey: 'labels.worldHistoryNames',
    icon: 'account',
  },
  {
    value: 'worldHistoryEvent',
    labelKey: 'labels.worldHistoryEvents',
    icon: 'calendar-clock',
  },
  {
    value: 'belarusHistoryDefinition',
    labelKey: 'labels.belarusHistoryDefinitions',
    icon: 'book-open-page-variant',
  },
  {
    value: 'belarusHistoryName',
    labelKey: 'labels.belarusHistoryNames',
    icon: 'account-tie',
  },
  {
    value: 'belarusHistoryEvent',
    labelKey: 'labels.belarusHistoryEvents',
    icon: 'flag',
  },
] as const;

const ITEM_TYPES: SetItem['type'][] = [
  'worldHistoryDefinition',
  'worldHistoryName',
  'worldHistoryEvent',
  'belarusHistoryDefinition',
  'belarusHistoryName',
  'belarusHistoryEvent',
];

type FilterType = (typeof FILTER_OPTIONS)[number]['value'];

export type CreateCustomSetRouteParams = {
  editingCustomSetId?: string | null;
  customSetName?: string;
  selectedItems?: string[];
  filterType?: FilterType;
};

const parseKeyToRussianName = (key: string): string | null => {
  for (const type of ITEM_TYPES) {
    const prefix = `${type}-`;
    if (key.startsWith(prefix)) {
      return getRussianName(key.slice(prefix.length), type);
    }
  }
  return null;
};

const getKeysByRussianName = (
  selectedKeys: Set<string>,
  russianName: string,
): string[] => {
  const result: string[] = [];
  selectedKeys.forEach(key => {
    if (parseKeyToRussianName(key) === russianName) result.push(key);
  });
  return result;
};

export const CreateCustomSetScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as CreateCustomSetRouteParams;
  const { t } = useTranslation();
  const theme = useTheme();
  const { alert } = useAlert();

  const [customSetName, setCustomSetName] = useState(
    params.customSetName ?? '',
  );
  const [selectedItemsForCustomSet, setSelectedItemsForCustomSet] = useState<
    Set<string>
  >(new Set(params.selectedItems ?? []));
  const [filterType, setFilterType] = useState<FilterType>(
    params.filterType ?? 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const editingCustomSetId = params.editingCustomSetId ?? null;

  const selectedRussianNames = useMemo(() => {
    const names = new Set<string>();
    selectedItemsForCustomSet.forEach(key => {
      const rn = parseKeyToRussianName(key);
      if (rn) names.add(rn);
    });
    return names;
  }, [selectedItemsForCustomSet]);

  const filterOptions = useMemo(
    () =>
      FILTER_OPTIONS.map(opt => ({
        value: opt.value,
        label: t(opt.labelKey),
        icon: opt.icon,
      })),
    [t],
  );

  const allItems = useMemo(() => {
    const lang = (i18n.language || 'ru') as ILanguage;
    const items: SetItem[] = [
      ...getWorldHistoryDefinitions(lang).map(name => ({
        name,
        type: 'worldHistoryDefinition' as const,
      })),
      ...getWorldHistoryNames(lang).map(name => ({
        name,
        type: 'worldHistoryName' as const,
      })),
      ...getWorldHistoryEvents(lang).map(name => ({
        name,
        type: 'worldHistoryEvent' as const,
      })),
      ...getBelarusHistoryDefinitions(lang).map(name => ({
        name,
        type: 'belarusHistoryDefinition' as const,
      })),
      ...getBelarusHistoryNames(lang).map(name => ({
        name,
        type: 'belarusHistoryName' as const,
      })),
      ...getBelarusHistoryEvents(lang).map(name => ({
        name,
        type: 'belarusHistoryEvent' as const,
      })),
    ];
    let filteredByType =
      filterType === 'all'
        ? items
        : items.filter(item => item.type === filterType);

    // При "Все" убираем дубли — один человек в нескольких категориях показываем один раз
    if (filterType === 'all') {
      const seen = new Set<string>();
      filteredByType = filteredByType.filter(item => {
        const rn = getRussianName(item.name, item.type);
        if (seen.has(rn)) return false;
        seen.add(rn);
        return true;
      });
    }

    if (!searchQuery.trim()) return filteredByType;
    const query = searchQuery.trim().toLowerCase();

    // Аналитика для кастомных наборов отключена - не логируем использование поиска
    // при создании/редактировании кастомных наборов

    return filteredByType.filter(item => {
      const localized = getLocalizedName(item.name, item.type).toLowerCase();
      const russian = getRussianName(item.name, item.type).toLowerCase();
      return localized.includes(query) || russian.includes(query);
    });
  }, [filterType, searchQuery]);

  const handleItemToggle = useCallback(
    (key: string, russianName: string) => {
      setSelectedItemsForCustomSet(prev => {
        const newSet = new Set(prev);
        if (selectedRussianNames.has(russianName)) {
          getKeysByRussianName(prev, russianName).forEach(k =>
            newSet.delete(k),
          );
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    },
    [selectedRussianNames],
  );

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const result = await saveCustomSetToStorage({
      editingCustomSetId,
      customSetName,
      selectedItemKeys: Array.from(selectedItemsForCustomSet),
      t,
    });
    setSaving(false);
    if (result.success) {
      // Аналитика для кастомных наборов отключена для защиты конфиденциальности
      navigation.goBack();
    } else if (result.error) {
      alert({ title: t('messages.error'), message: result.error });
    }
  }, [
    saving,
    editingCustomSetId,
    customSetName,
    selectedItemsForCustomSet,
    t,
    navigation,
    alert,
  ]);

  const title = editingCustomSetId ? t('sets.editSet') : t('sets.createSet');

  return (
    <ScreenContainer navigation={navigation} type="view" title={title}>
      <View style={styles.content}>
        <View style={styles.formSection}>
          <Input
            label={t('labels.setName')}
            value={customSetName}
            onChangeText={setCustomSetName}
          />
          <View style={styles.filterRow}>
            <AppText
              variant="bodySmall"
              color={theme.colors.onSurfaceVariant}
              style={styles.filterRowLabel}
            >
              {t('labels.selectMinimum5')}
            </AppText>
            <View style={styles.filterDropdownWrap}>
              <FilterDropdown
                options={filterOptions}
                value={filterType}
                onSelect={(v, index) => {
                  index !== 0 && Keyboard.dismiss();
                  setFilterType(v as FilterType);
                }}
                alignRight
              />
            </View>
          </View>
          <Searchbar
            placeholder={t('labels.searchPlayer')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchbarInput}
          />
        </View>

        <View style={styles.selectionContainer}>
          <FlatList
            data={allItems}
            keyExtractor={(item, i) => `${item.type}-${item.name}-${i}`}
            renderItem={({ item }) => {
              const key = `${item.type}-${item.name}`;
              const russianName = getRussianName(item.name, item.type);
              const isSelected = selectedRussianNames.has(russianName);

              return (
                <Pressable
                  onPress={() => handleItemToggle(key, russianName)}
                  style={styles.selectionItem}
                >
                  <Checkbox
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => handleItemToggle(key, russianName)}
                  />
                  <AppText
                    variant="bodyMedium"
                    style={styles.selectionItemText}
                  >
                    {getLocalizedName(item.name, item.type)}
                  </AppText>
                </Pressable>
              );
            }}
            style={styles.selectionList}
            contentContainerStyle={styles.selectionListContent}
            nestedScrollEnabled
          />
        </View>

        <View style={styles.buttons}>
          <AppButton
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, { marginRight: 12 }]}
            disabled={saving}
          >
            {t('buttons.cancel')}
          </AppButton>
          <AppButton
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            disabled={selectedItemsForCustomSet.size < 5 || saving}
          >
            {editingCustomSetId
              ? t('buttons.save')
              : t('buttons.createCustomSet')}{' '}
            ({selectedItemsForCustomSet.size}/5+)
          </AppButton>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16 },
  formSection: { marginBottom: 8 },
  searchbar: { marginTop: 8, elevation: 0 },
  searchbarInput: { minHeight: 40 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  filterRowLabel: {
    flexShrink: 0,
  },
  filterDropdownWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  selectionContainer: { flex: 1, minHeight: 200 },
  selectionList: { flexGrow: 1 },
  selectionListContent: { paddingBottom: 16 },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectionItemText: { flex: 1, marginLeft: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 12, paddingBottom: 16 },
  button: { flex: 1 },
});
