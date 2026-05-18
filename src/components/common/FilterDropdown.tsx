import { AppText } from '@/components/common/AppText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import {
  Icon,
  IconButton,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FilterDropdownOption = {
  value: string;
  label: string;
  icon: string;
};

type Props = {
  options: FilterDropdownOption[];
  value: string;
  onSelect: (value: string, index: number) => void;
  alignRight?: boolean;
};

const ITEM_HEIGHT = 44;
const ANIMATION_DURATION = 200;
const LIST_WIDTH_RATIO = 0.9;

export const FilterDropdown = ({
  options,
  value,
  onSelect,
  alignRight = true,
}: Props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const currentOption = options.find(o => o.value === value);
  const currentLabel = currentOption?.label ?? options[0]?.label ?? '';

  const COLUMNS = 2;
  const rowCount = Math.ceil(options.length / COLUMNS);
  const maxHeight = rowCount * ITEM_HEIGHT;
  const listWidth = Dimensions.get('window').width * LIST_WIDTH_RATIO;

  const toggle = useCallback(() => {
    const toValue = open ? 0 : 1;
    Animated.timing(expandAnim, {
      toValue,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
    setOpen(!open);
  }, [open, expandAnim]);

  const handleSelect = useCallback(
    (selectedValue: string, index: number) => {
      onSelect(selectedValue, index);
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
      setOpen(false);
    },
    [onSelect, expandAnim],
  );

  useEffect(() => {
    if (!open) {
      expandAnim.setValue(0);
    }
  }, [open, expandAnim]);

  return (
    <View style={[styles.container, alignRight && styles.containerRight]}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
      >
        <View style={styles.triggerTextContainer}>
          <AppText
            variant="bodyMedium"
            style={[
              styles.triggerText,
              { color: theme.colors.primary },
              alignRight && styles.triggerTextRight,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentLabel}
          </AppText>
        </View>
        <Animated.View
          style={{
            transform: [
              {
                rotate: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <Icon source="chevron-down" size={18} color={theme.colors.primary} />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.list,
          alignRight ? styles.listRight : styles.listLeft,
          {
            width: listWidth,
            borderColor: theme.colors.outline,
            backgroundColor: theme.colors.surface,
            maxHeight: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxHeight],
            }),
            opacity: expandAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 1],
            }),
          },
        ]}
      >
        <View style={styles.twoColumns}>
          {options.map((opt, index) => (
            <TouchableRipple
              key={opt.value}
              onPress={() => handleSelect(opt.value, index)}
              style={[
                styles.item,
                styles.itemHalfWidth,
                value === opt.value && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
            >
              <View style={styles.itemContent}>
                <IconButton icon={opt.icon} size={20} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <AppText
                    variant="bodyMedium"
                    fontWeight={value === opt.value ? 'bold' : undefined}
                    color={
                      value === opt.value ? theme.colors.primary : undefined
                    }
                    style={styles.itemText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {opt.label}
                  </AppText>
                </View>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    position: 'relative',
    maxWidth: '100%',
    flexShrink: 1,
    minWidth: 0,
  },
  containerRight: {
    alignItems: 'flex-end',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
    maxWidth: '100%',
    minWidth: 0,
  },
  triggerPressed: {
    opacity: 0.7,
  },
  triggerTextContainer: {
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  triggerText: {
    textDecorationLine: 'underline',
  },
  triggerTextRight: {
    textAlign: 'right',
  },
  list: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 10,
  },
  listRight: {
    right: 0,
  },
  listLeft: {
    left: 0,
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  itemHalfWidth: {
    width: '50%',
    minWidth: '50%',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    margin: 0,
  },
  itemTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  itemText: {
    fontSize: 16,
  },
});
