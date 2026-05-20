import {
  AppButton,
  AppText,
  FilterDropdown,
  Input,
  useAlert,
} from '@/components';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import {
  BUILTIN_SET_ID_TO_ITEM_TYPE,
  CUSTOM_SET_GRADE_FILTER_OPTIONS,
  CurriculumItemType,
  CustomSetGradeFilter,
  customSetFilterToParamValue,
  parseCustomSetGradeFilter,
} from '@/constants/builtinCurriculum';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import {
  getLocalizedName,
  getRussianName,
} from '@/utils/localization';
import { collectBuiltinItemsForCustomSetFilter } from '@/utils/customSetGradeFilter';
import { SetItem } from '@/utils/storage';
import { saveCustomSetToStorage } from '@/utils/sets';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { Checkbox, Searchbar, useTheme } from 'react-native-paper';

const ITEM_TYPES: CurriculumItemType[] = Object.values(
  BUILTIN_SET_ID_TO_ITEM_TYPE,
);

export type CreateCustomSetRouteParams = {
  editingCustomSetId?: string | null;
  customSetName?: string;
  selectedItems?: string[];
  /** `all`, `5`, `9` или устаревший itemType */
  filterType?: string;
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
  const [filterType, setFilterType] = useState<CustomSetGradeFilter>(() =>
    parseCustomSetGradeFilter(params.filterType),
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
      CUSTOM_SET_GRADE_FILTER_OPTIONS.map(opt => ({
        value: opt.value,
        label: t(opt.labelKey),
        icon: opt.icon,
      })),
    [t],
  );

  const filterDropdownValue = customSetFilterToParamValue(filterType);

  const allItems = useMemo(() => {
    const lang = (i18n.language || 'ru') as ILanguage;
    let filteredByType = collectBuiltinItemsForCustomSetFilter(
      lang,
      filterType,
    );

    if (!searchQuery.trim()) return filteredByType;
    const query = searchQuery.trim().toLowerCase();

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
                value={filterDropdownValue}
                onSelect={(v, index) => {
                  index !== 0 && Keyboard.dismiss();
                  setFilterType(parseCustomSetGradeFilter(v));
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
