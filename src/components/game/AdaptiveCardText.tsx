import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextLayoutEventData,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

const LINE_HEIGHT_RATIO = 1.35;

export type AdaptiveCardTextProps = {
  text: string;
  color: string;
  maxHeight?: number;
  maxFontSize?: number;
  minFontSize?: number;
  maxLines?: number;
  fontWeight?: TextStyle['fontWeight'];
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

export const AdaptiveCardText = ({
  text,
  color,
  maxHeight,
  maxFontSize = 22,
  minFontSize = 13,
  maxLines = 12,
  fontWeight = 'normal',
  textStyle,
  style,
}: AdaptiveCardTextProps) => {
  const [textWidth, setTextWidth] = useState(0);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const [needsScroll, setNeedsScroll] = useState(false);

  const availableHeight =
    maxHeight != null && maxHeight > 0 ? maxHeight : undefined;

  useEffect(() => {
    setFontSize(maxFontSize);
    setNeedsScroll(false);
  }, [text, textWidth, availableHeight, maxFontSize, maxLines]);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setTextWidth(prev => (prev === width ? prev : width));
    }
  }, []);

  const onTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      const lines = e.nativeEvent.lines;
      const lineCount = lines.length;
      const contentHeight = lines.reduce((sum, line) => sum + line.height, 0);
      const widestLine = lines.reduce(
        (max, line) => Math.max(max, line.width),
        0,
      );

      const tooManyLines = lineCount > maxLines;
      const tooWide =
        textWidth > 0 && widestLine > textWidth + 1;
      const tooTall =
        availableHeight != null && contentHeight > availableHeight + 1;

      if (
        (tooManyLines || tooWide || tooTall) &&
        fontSize > minFontSize
      ) {
        setFontSize(size => size - 1);
        return;
      }

      if (tooTall && fontSize <= minFontSize) {
        setNeedsScroll(true);
      }
    },
    [availableHeight, fontSize, maxLines, minFontSize, textWidth],
  );

  const lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);

  const textElement = (
    <Text
      onTextLayout={onTextLayout}
      style={[
        styles.text,
        textStyle,
        {
          fontSize,
          lineHeight,
          color,
          fontWeight,
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
