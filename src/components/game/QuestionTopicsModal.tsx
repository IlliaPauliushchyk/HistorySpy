import { AppButton, AppText } from '@/components';
import { commonColors } from '@/styles/colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, Pressable, StyleSheet } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

type QuestionTopicsModalProps = {
  visible: boolean;
  question: string;
  onClose: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export const QuestionTopicsModal = ({
  visible,
  question,
  onClose,
}: QuestionTopicsModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Modal
      statusBarTranslucent
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
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
                {t('rules.questionTopicsTitle')}
              </AppText>
              <AppText
                variant="bodyLarge"
                mb={24}
                textAlign="center"
                style={{ color: theme.colors.onSurface }}
              >
                {question}
              </AppText>
              <AppButton onPress={onClose} style={styles.closeButton}>
                {t('buttons.close')}
              </AppButton>
            </Card.Content>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

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
  closeButton: {
    marginTop: 8,
  },
});
