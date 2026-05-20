import { AppButton, AppText, Input } from '@/components';
import { PADDING } from '@/constants';
import {
  CUSTOM_SET_GRADE_FILTER_OPTIONS,
  CustomSetGradeFilter,
  customSetFilterToParamValue,
  parseCustomSetGradeFilter,
} from '@/constants/builtinCurriculum';
import { ILanguage } from '@/hooks/localization';
import i18n from '@/localization/i18n';
import { commonColors } from '@/styles/colors';
import { collectBuiltinItemsForCustomSetFilter } from '@/utils/customSetGradeFilter';
import { getLocalizedName, getRussianName } from '@/utils/localization';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

export type CustomSetModalFilterType = CustomSetGradeFilter | string;

type CustomSetModalProps = {
  visible: boolean;
  editingCustomSetId: string | null;
  customSetName: string;
  selectedItemsForCustomSet: Set<string>;
  filterType: CustomSetModalFilterType;
  onClose: () => void;
  onNameChange: (text: string) => void;
  onFilterChange: (filter: CustomSetGradeFilter) => void;
  onItemToggle: (key: string) => void;
  onSave: () => void;
};

export const CustomSetModal = ({
  visible,
  editingCustomSetId,
  customSetName,
  selectedItemsForCustomSet,
  filterType: filterTypeProp,
  onClose,
  onNameChange,
  onFilterChange,
  onItemToggle,
  onSave,
}: CustomSetModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  const filterType = parseCustomSetGradeFilter(
    typeof filterTypeProp === 'string'
      ? filterTypeProp
      : customSetFilterToParamValue(filterTypeProp),
  );

  const toggleDropdown = useCallback(() => {
    const toValue = dropdownOpen ? 0 : 1;
    Animated.timing(dropdownHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen, dropdownHeight]);

  const handleFilterSelect = useCallback(
    (value: string) => {
      onFilterChange(parseCustomSetGradeFilter(value));
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setDropdownOpen(false);
    },
    [onFilterChange, dropdownHeight],
  );

  useEffect(() => {
    if (!visible) {
      setDropdownOpen(false);
      dropdownHeight.setValue(0);
    }
  }, [visible, dropdownHeight]);

  const filterOptions = CUSTOM_SET_GRADE_FILTER_OPTIONS.map(opt => ({
    ...opt,
    label: t(opt.labelKey),
  }));

  const currentFilter = filterOptions.find(
    o => o.value === customSetFilterToParamValue(filterType),
  );
  const currentFilterLabel = currentFilter
    ? currentFilter.label
    : t('labels.all');

  const allItems = React.useMemo(() => {
    const currentLanguage = (i18n.language || 'ru') as ILanguage;
    return collectBuiltinItemsForCustomSetFilter(currentLanguage, filterType);
  }, [filterType]);

  const selectedRussianNames = React.useMemo(() => {
    const names = new Set<string>();
    selectedItemsForCustomSet.forEach(key => {
      const dash = key.indexOf('-');
      if (dash === -1) return;
      const type = key.slice(0, dash);
      const name = key.slice(dash + 1);
      names.add(getRussianName(name, type as never));
    });
    return names;
  }, [selectedItemsForCustomSet]);

  const dropdownMaxHeight = filterOptions.length * 48;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalCard}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <AppText variant="titleLarge" fontWeight="bold">
                {editingCustomSetId ? t('sets.editSet') : t('sets.createSet')}
              </AppText>
              <IconButton icon="close" size={24} onPress={onClose} />
            </View>
            <Divider style={styles.modalDivider} />
            <View style={styles.input}>
              <Input
                label={t('labels.setName')}
                value={customSetName}
                onChangeText={onNameChange}
              />
            </View>
            <AppText
              variant="bodySmall"
              mb={8}
              color={theme.colors.onSurfaceVariant}
            >
              {t('labels.selectMinimum5')}
            </AppText>

            <View style={styles.dropdownContainer}>
              <Button
                mode="outlined"
                onPress={toggleDropdown}
                icon={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                contentStyle={[
                  styles.dropdownButtonContent,
                  { flexDirection: 'row-reverse' },
                ]}
                style={[styles.dropdownButton, { borderWidth: 1 }]}
              >
                {currentFilterLabel}
              </Button>

              <Animated.View
                style={[
                  styles.dropdownList,
                  {
                    maxHeight: dropdownHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, dropdownMaxHeight],
                    }),
                    opacity: dropdownHeight,
                    borderWidth: dropdownHeight.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 1],
                    }),
                    borderColor: theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                {filterOptions.map(opt => (
                  <TouchableRipple
                    key={opt.value}
                    onPress={() => handleFilterSelect(opt.value)}
                    style={[
                      styles.dropdownItem,
                      customSetFilterToParamValue(filterType) === opt.value && {
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                  >
                    <View style={styles.dropdownItemContent}>
                      <IconButton
                        icon={opt.icon}
                        size={20}
                        style={styles.dropdownItemIcon}
                      />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          customSetFilterToParamValue(filterType) ===
                            opt.value && {
                            color: theme.colors.primary,
                            fontWeight: 'bold',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </Animated.View>
            </View>

            <View style={styles.selectionContainer}>
              <FlatList
                data={allItems}
                keyExtractor={(item, index) =>
                  `${item.type}-${item.name}-${index}`
                }
                renderItem={({ item }) => {
                  const key = `${item.type}-${item.name}`;
                  const russianName = getRussianName(item.name, item.type);
                  const isSelected = selectedRussianNames.has(russianName);

                  return (
                    <Pressable
                      onPress={() => onItemToggle(key)}
                      style={styles.selectionItem}
                    >
                      <Checkbox
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => onItemToggle(key)}
                      />
                      <Text style={styles.selectionItemText}>
                        {getLocalizedName(item.name, item.type)}
                      </Text>
                    </Pressable>
                  );
                }}
                style={styles.selectionList}
                nestedScrollEnabled
              />
            </View>
            <View style={styles.customSetButtons}>
              <AppButton
                mode="outlined"
                onPress={onClose}
                style={[styles.button, { marginRight: 12 }]}
              >
                {t('buttons.cancel')}
              </AppButton>
              <AppButton
                mode="contained"
                onPress={onSave}
                style={styles.button}
                disabled={selectedItemsForCustomSet.size < 5}
              >
                {editingCustomSetId
                  ? t('buttons.save')
                  : t('buttons.createCustomSet')}{' '}
                ({selectedItemsForCustomSet.size}/5+)
              </AppButton>
            </View>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: commonColors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.LARGE,
  },
  modalCard: {
    width: '100%',
    maxWidth: Math.min(SCREEN_WIDTH - 40, 500),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalDivider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  dropdownContainer: {
    marginBottom: 12,
    zIndex: 10,
  },
  dropdownButton: {
    width: '100%',
  },
  dropdownButtonContent: {
    paddingVertical: 4,
    minHeight: 48,
  },
  dropdownList: {
    overflow: 'hidden',
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemIcon: {
    margin: 0,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  selectionContainer: {
    maxHeight: 300,
  },
  selectionList: {
    flexGrow: 0,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectionItemText: {
    flex: 1,
    marginLeft: 8,
  },
  customSetButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
  },
});
