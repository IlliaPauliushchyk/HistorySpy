import { AppButton, AppText } from '@/components';
import { commonColors } from '@/styles/colors';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

type AlertOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertContextType = {
  alert: (options: AlertOptions) => void;
};

export const AlertContext = React.createContext<AlertContextType | undefined>(
  undefined,
);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = React.useState(false);
  const [options, setOptions] = React.useState<AlertOptions | null>(null);
  const theme = useTheme();

  const alert = React.useCallback((alertOptions: AlertOptions) => {
    setOptions(alertOptions);
    setVisible(true);
  }, []);

  const handleConfirm = () => {
    options?.onConfirm?.();
    setVisible(false);
    setOptions(null);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setVisible(false);
    setOptions(null);
  };

  const handleBackdropPress = () => {
    // Не закрываем при нажатии на фон, только через кнопки
  };

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          <Pressable onPress={e => e.stopPropagation()}>
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <AppText
                  variant="headlineSmall"
                  fontWeight="bold"
                  mb={16}
                  textAlign="center"
                  style={{ color: theme.colors.onSurface }}
                >
                  {options?.title || 'Подтверждение'}
                </AppText>
                <AppText
                  variant="bodyLarge"
                  mb={24}
                  textAlign="center"
                  style={{ color: theme.colors.onSurface }}
                >
                  {options?.message || ''}
                </AppText>
                <View style={styles.buttonsContainer}>
                  {options?.cancelText && (
                    <AppButton
                      mode="outlined"
                      onPress={handleCancel}
                      style={[styles.button, styles.cancelButton]}
                    >
                      {options.cancelText || 'Отмена'}
                    </AppButton>
                  )}
                  <AppButton
                    mode="contained"
                    onPress={handleConfirm}
                    style={[styles.button, styles.confirmButton]}
                  >
                    {options?.confirmText || 'Подтвердить'}
                  </AppButton>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: commonColors.alertOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 16,
    elevation: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  cancelButton: {
    flex: 0,
  },
  confirmButton: {
    flex: 0,
  },
});
