import { AppText } from '@/components';
import { ANIMATION_DURATION, ANIMATION_VALUES } from '@/constants';
import { getLocalizedName } from '@/utils/localization';
import { SetItem } from '@/utils/storage';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

type AnimatedListItemProps = {
  item: SetItem;
  index: number;
  onDelete?: () => void;
  theme: any;
  readOnly?: boolean;
};

export const AnimatedListItem = ({
  item,
  onDelete,
  theme,
  readOnly = false,
}: AnimatedListItemProps) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;
  const [itemHeight, setItemHeight] = useState<number | null>(null);

  const handleDelete = () => {
    if (!onDelete) return;
    // Запускаем анимацию схлопывания
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: ANIMATION_VALUES.OPACITY_START,
        duration: ANIMATION_DURATION.NORMAL,
        useNativeDriver: false,
      }),
      Animated.timing(heightAnim, {
        toValue: ANIMATION_VALUES.OPACITY_START,
        duration: ANIMATION_DURATION.NORMAL,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, itemHeight || 56],
  });

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          height: animatedHeight,
          overflow: 'hidden',
        },
      ]}
      onLayout={event => {
        if (itemHeight === null) {
          const { height } = event.nativeEvent.layout;
          setItemHeight(height);
        }
      }}
    >
      <View style={styles.modalItemRow}>
        <AppText style={styles.modalItemText}>
          {getLocalizedName(item.name, item.type)}
        </AppText>
        {!readOnly && onDelete && (
          <IconButton
            icon="delete"
            size={20}
            onPress={handleDelete}
            iconColor={theme.colors.error}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalItemText: {
    flex: 1,
  },
});
