import { AppButton, AppText } from '@/components';
import { PADDING } from '@/constants';
import { commonColors } from '@/styles/colors';
import { SetItem } from '@/utils/storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, useTheme } from 'react-native-paper';
import { AnimatedListItem } from './AnimatedListItem';

type EditSetItemsModalProps = {
  visible: boolean;
  editingSetId: string | null;
  editingSetName: string | null;
  items: SetItem[];
  onClose: () => void;
  onDeleteItem?: (index: number) => void;
  readOnly?: boolean;
};

export const EditSetItemsModal = ({
  visible,
  editingSetId,
  editingSetName,
  items,
  onClose,
  onDeleteItem,
  readOnly = false,
}: EditSetItemsModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!editingSetId || !editingSetName) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalCard}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTextContainer}>
                <AppText
                  variant="titleLarge"
                  fontWeight="bold"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {editingSetName}
                </AppText>
              </View>
              <IconButton icon="close" size={24} onPress={onClose} />
            </View>
            <Divider style={styles.modalDivider} />
            <FlatList
              data={items}
              keyExtractor={(item, index) =>
                `${editingSetId}-${index}-${item.name}`
              }
              renderItem={({ item, index }) => (
                <AnimatedListItem
                  item={item}
                  index={index}
                  onDelete={readOnly ? undefined : () => onDeleteItem?.(index)}
                  theme={theme}
                  readOnly={readOnly}
                />
              )}
              style={styles.modalList}
            />
            <AppButton
              mode="contained"
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              {t('buttons.close')}
            </AppButton>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: commonColors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING.LARGE,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalHeaderTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  modalDivider: {
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  modalCloseButton: {
    marginTop: 8,
  },
});
