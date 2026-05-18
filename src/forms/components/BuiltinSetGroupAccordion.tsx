import { AppText } from '@/components';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';

type BuiltinSetGroupAccordionProps<TSet> = {
  title: string;
  sets: TSet[];
  isOpen: boolean;
  onToggle: () => void;
  renderSetButton: (set: TSet) => React.ReactNode;
};

export const BuiltinSetGroupAccordion = <TSet,>({
  title,
  sets,
  isOpen,
  onToggle,
  renderSetButton,
}: BuiltinSetGroupAccordionProps<TSet>) => {
  const expandAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [isOpen, expandAnim]);

  const animatedBodyStyle =
    contentHeight > 0
      ? {
          height: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, contentHeight],
          }),
          opacity: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        }
      : {
          opacity: expandAnim,
        };

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8} style={styles.groupHeader}>
        <AppText variant="titleMedium" fontWeight="bold" style={styles.groupTitleText}>
          {title}
        </AppText>
        <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} size={18} />
      </TouchableOpacity>

      <Animated.View style={[styles.groupAnimatedBody, animatedBodyStyle]}>
        <View
          onLayout={event => {
            const measuredHeight = event.nativeEvent.layout.height;
            if (measuredHeight > 0 && measuredHeight !== contentHeight) {
              setContentHeight(measuredHeight);
            }
          }}
          style={styles.groupItems}
        >
          {sets.map(set => renderSetButton(set))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    gap: 8,
  },
  groupHeader: {
    borderRadius: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitleText: {
    fontSize: 18,
  },
  groupAnimatedBody: {
    overflow: 'hidden',
  },
  groupItems: {
    gap: 8,
  },
});
