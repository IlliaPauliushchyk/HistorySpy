import { AppButton, useAlert } from '@/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, ViewStyle } from 'react-native';

type NewGameButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  mt?: number;
  mode?: 'text' | 'outlined' | 'contained';
  confirmBeforePress?: boolean;
};

export const NewGameButton = ({
  onPress,
  style,
  mt,
  mode = 'contained',
  confirmBeforePress = false,
}: NewGameButtonProps) => {
  const { t } = useTranslation();
  const { alert } = useAlert();

  const handlePress = React.useCallback(() => {
    if (!confirmBeforePress) {
      onPress();
      return;
    }

    alert({
      title: t('messages.newGameConfirmTitle'),
      message: t('messages.newGameConfirmMessage'),
      confirmText: t('buttons.confirm'),
      cancelText: t('buttons.cancel'),
      onConfirm: onPress,
    });
  }, [alert, confirmBeforePress, onPress, t]);

  return (
    <AppButton mode={mode} onPress={handlePress} style={style} mt={mt}>
      {t('buttons.newGame')}
    </AppButton>
  );
};

