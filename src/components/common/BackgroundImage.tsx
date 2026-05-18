import { ANIMATION_DURATION } from '@/constants';
import { defaultContainerStyle } from '@/styles';
import React, { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

type BackgroundImageProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
};

export const BackgroundImage = ({
  children,
  style,
  animated = false,
}: BackgroundImageProps) => {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom + 40;
  const marginTop = -insets.top;
  const marginBottom = -insets.bottom;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (animated) {
      // Начинаем анимацию пульсации
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: ANIMATION_DURATION.VERY_LONG,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.VERY_LONG,
            useNativeDriver: true,
          }),
        ]),
      );
      animationRef.current = animation;
      animation.start();

      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    } else {
      // Плавно возвращаем к исходному размеру перед остановкой
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Плавная анимация возвращения к значению 1
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.NORMAL,
        useNativeDriver: true,
      }).start();
    }
  }, [animated, scaleAnim]);

  // Всегда используем AnimatedImageBackground для поддержки анимации возвращения
  const Component = AnimatedImageBackground;

  return (
    <View
      style={[
        styles.wrapper,
        { marginBottom, paddingBottom, marginTop },
        style,
      ]}
    >
      <Component
        style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
        imageStyle={styles.imageStyle}
        source={require('@/assets/images/welcome_bg.jpg')}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...defaultContainerStyle,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    width: '110%', // Увеличиваем размер чтобы покрыть при масштабировании
    height: '110%',
    left: '-5%', // Центрируем увеличенное изображение
    top: '-5%',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 1,
  },
});
