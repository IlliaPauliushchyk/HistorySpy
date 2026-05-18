import { Screens } from '@/constants';
import { useNavigation } from '@react-navigation/native';
import {
  EventArg,
  useFocusEffect,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

export const useActiveGameResults = () => {
  const navigation = useNavigation<any>();

  // Блокируем кнопку назад
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerBackVisible: false,
        gestureEnabled: false,
      });

      const onBackPress = () => {
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      const unsubscribeBeforeRemove = navigation.addListener(
        'beforeRemove',
        (e: EventArg<'beforeRemove', true, any>) => {
          // Предотвращаем только действия типа GO_BACK или POP
          // Разрешаем другие действия навигации (например, RESET, NAVIGATE)
          if (
            e.data?.action?.type === 'GO_BACK' ||
            e.data?.action?.type === 'POP'
          ) {
            e.preventDefault();
          }
        },
      );

      return () => {
        backHandler.remove();
        unsubscribeBeforeRemove();
      };
    }, [navigation]),
  );

  const handleNewGame = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: Screens.home }],
    });
  }, [navigation]);

  return {
    handleNewGame,
  };
};

