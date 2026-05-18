import { AppButton, AppText } from '@/components';
import { SetItem } from '@/utils/storage';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

type EditingSet = {
  id: string;
  name: string;
  items: SetItem[];
  isCustom: boolean;
};

type AnimatedSetCardProps = {
  editingSet: EditingSet;
  index: number;
  isModified: boolean;
  onEdit: () => void;
  onReset?: () => void;
  onDelete?: () => void;
  theme: any;
};

export const AnimatedSetCard = ({
  editingSet,
  index,
  isModified,
  onEdit,
  onReset,
  onDelete,
  theme,
}: AnimatedSetCardProps) => {
  const { t } = useTranslation();
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;

  // Анимация появления карточки при монтировании
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50, // Задержка для каждой карточки
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }],
        },
      ]}
    >
      <Card style={styles.setCard}>
        <Card.Content>
          <View style={styles.setCardHeader}>
            <View style={styles.setCardTitleRow}>
              <View style={styles.setCardTitleContent}>
                <AppText variant="titleMedium" fontWeight="bold">
                  {editingSet.name}
                  {isModified && !editingSet.isCustom && (
                    <AppText
                      size={10}
                      color={theme.colors.primary}
                      style={styles.modifiedText}
                    >
                      {' '}
                      ({t('sets.modified')})
                    </AppText>
                  )}
                </AppText>
              </View>
            </View>
            <Text style={styles.setItemCount}>
              {editingSet.items.length} {t('labels.elements')}
            </Text>
            <View style={styles.setCardActions}>
              <AppButton
                mode="contained"
                onPress={onEdit}
                style={styles.editButton}
                compact
              >
                {t('buttons.edit')}
              </AppButton>
              {!editingSet.isCustom && isModified && onReset && (
                <AppButton
                  mode="outlined"
                  onPress={onReset}
                  style={styles.resetButton}
                  compact
                >
                  {t('buttons.reset')}
                </AppButton>
              )}
              {editingSet.isCustom && onDelete && (
                <AppButton
                  mode="outlined"
                  onPress={onDelete}
                  style={styles.resetButton}
                  compact
                >
                  {t('buttons.delete')}
                </AppButton>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  setCard: {
    marginBottom: 16,
  },
  setCardHeader: {
    width: '100%',
  },
  setCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setCardTitleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  setItemCount: {
    marginTop: 8,
    opacity: 0.7,
  },
  modifiedText: {
    opacity: 0.7,
    fontSize: 12,
  },
  setCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
  },
  resetButton: {
    flex: 1,
  },
});
