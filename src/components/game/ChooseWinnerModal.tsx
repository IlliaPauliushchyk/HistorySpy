import { AppText } from '@/components';
import { commonColors } from '@/styles/colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

type ChooseWinnerModalProps = {
  visible: boolean;
  endGameOpacityAnimation: Animated.Value;
  topBlockTranslateY: Animated.AnimatedInterpolation<string | number>;
  bottomBlockTranslateY: Animated.AnimatedInterpolation<string | number>;
  onChoosePlayers: () => void;
  onChooseSpies: () => void;
  onClose: () => void;
};

export const ChooseWinnerModal = ({
  visible,
  endGameOpacityAnimation,
  topBlockTranslateY,
  bottomBlockTranslateY,
  onChoosePlayers,
  onChooseSpies,
  onClose,
}: ChooseWinnerModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Modal
      statusBarTranslucent
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.endGameFullScreen,
          {
            opacity: endGameOpacityAnimation,
          },
        ]}
      >
        <Pressable style={styles.endGameBlock} onPress={onChoosePlayers}>
          <Animated.View
            style={[
              styles.endGameTopBlock,
              {
                transform: [{ translateY: topBlockTranslateY }],
              },
            ]}
          >
            <AppText
              variant="displayMedium"
              fontWeight="bold"
              style={{ color: commonColors.white }}
              textAlign="center"
            >
              {t('results.playersWon')}
            </AppText>
          </Animated.View>
        </Pressable>

        <Pressable style={styles.endGameBlock} onPress={onChooseSpies}>
          <Animated.View
            style={[
              styles.endGameBottomBlock,
              {
                backgroundColor: theme.colors.background,
                transform: [{ translateY: bottomBlockTranslateY }],
              },
            ]}
          >
            <AppText
              variant="displayMedium"
              fontWeight="bold"
              style={{ color: commonColors.red }}
              textAlign="center"
            >
              {t('results.spiesWon')}
            </AppText>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  endGameFullScreen: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  endGameBlock: {
    flex: 1,
  },
  endGameTopBlock: {
    flex: 1,
    backgroundColor: commonColors.green,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  endGameBottomBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
