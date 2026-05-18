import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextLayoutEventData,
  View,
  ViewStyle,
} from 'react-native';

const MAX_FONT_SIZE = 22;
const MIN_FONT_SIZE = 13;
const LINE_HEIGHT_RATIO = 1.35;

type AdaptiveHintTextProps = {
  text: string;
  color: string;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
};

export const AdaptiveHintText = ({
  text,
  color,
  maxHeight,
  style,
}: AdaptiveHintTextProps) => {
  const [textWidth, setTextWidth] = useState(0);
  const [fontSize, setFontSize] = useState(MAX_FONT_SIZE);
  const [needsScroll, setNeedsScroll] = useState(false);

  const availableHeight =
    maxHeight != null && maxHeight > 0 ? maxHeight : undefined;

  useEffect(() => {
    setFontSize(MAX_FONT_SIZE);
    setNeedsScroll(false);
  }, [text, textWidth, availableHeight]);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setTextWidth(prev => (prev === width ? prev : width));
    }
  }, []);

  const onTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!availableHeight) {
        return;
      }

      const contentHeight = e.nativeEvent.lines.reduce(
        (sum, line) => sum + line.height,
        0,
      );

      if (contentHeight > availableHeight + 1) {
        if (fontSize > MIN_FONT_SIZE) {
          setFontSize(size => size - 1);
        } else {
          setNeedsScroll(true);
        }
      }
    },
    [availableHeight, fontSize],
  );

  const lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);

  const textElement = (
    <Text
      onTextLayout={onTextLayout}
      style={[
        styles.text,
        {
          fontSize,
          lineHeight,
          color,
          width: textWidth > 0 ? textWidth : '100%',
        },
      ]}
    >
      {text}
    </Text>
  );

  return (
    <View
      style={[
        styles.container,
        maxHeight != null && maxHeight > 0 ? { maxHeight } : null,
        style,
      ]}
      onLayout={onContainerLayout}
    >
      {needsScroll ? (
        <ScrollView
          style={[
            styles.scroll,
            availableHeight != null ? { maxHeight: availableHeight } : null,
          ]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {textElement}
        </ScrollView>
      ) : (
        <View style={styles.centered}>{textElement}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scroll: {
    width: '100%',
    maxHeight: '100%',
  },
  scrollContent: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    textAlign: 'center',
  },
});
