import { AppButton, AppText, TimePicker } from '@/components';
import { BORDER_RADIUS, PADDING } from '@/constants';
import { commonColors } from '@/styles/colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';
import { Portal, useTheme } from 'react-native-paper';

type EditTimeModalProps = {
  visible: boolean;
  timeValue: string;
  onTimeChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const EditTimeModal = ({
  visible,
  timeValue,
  onTimeChange,
  onSave,
  onCancel,
}: EditTimeModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <AppText
              variant="headlineSmall"
              mb={16}
              style={{ color: theme.colors.onSurface }}
              fontWeight="bold"
            >
              {t('game.editTime')}
            </AppText>
            <TimePicker
              value={parseInt(timeValue, 10) || 60}
              onChange={onTimeChange}
              minSeconds={30}
              maxSeconds={600}
            />
            <View style={styles.modalButtons}>
              <AppButton
                mode="outlined"
                onPress={onCancel}
                style={styles.modalButton}
              >
                {t('buttons.cancel')}
              </AppButton>
              <AppButton
                mode="contained"
                onPress={onSave}
                style={styles.modalButton}
              >
                {t('buttons.save')}
              </AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: commonColors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: BORDER_RADIUS.CARD,
    padding: PADDING.MODAL,
    width: '80%',
    maxWidth: 400,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});
