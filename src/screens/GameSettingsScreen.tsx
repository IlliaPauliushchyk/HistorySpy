import { AppButton, EditSetItemsModal, ScreenContainer } from '@/components';
import { Screens } from '@/constants';
import {
  GameSettingsForm,
  GameSettingsFormSubmitHandler,
  GameSettingsFormValues,
} from '@/forms';
import { useEditSets } from '@/hooks';
import { AppDispatch } from '@/store';
import { setGameSettings } from '@/store/slices';
import { storage } from '@/utils';
import { logGameSettingsOpened, logGameStarted } from '@/utils/analytics';
import { getAvailableSets } from '@/utils/sets';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const initialFormValues: GameSettingsFormValues = {
  playersCount: 6,
  spiesCount: 1,
  roundTime: 60,
  infiniteTime: false,
  setType: 'worldHistoryNames',
  suggestQuestionEnabled: false,
};

export const GameSettingsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const formSubmitRef = useRef<(() => void) | null>(null);
  const {
    loadData,
    setsData,
    editingSetId,
    showEditModal,
    editingSets,
    handleEditSet,
    handleDeleteItemFromSet,
    handleCloseEditModal,
  } = useEditSets();

  const availableSets = setsData ? getAvailableSets(setsData) : [];

  // Обновляем список наборов при возврате на экран
  useFocusEffect(
    useCallback(() => {
      loadData();
      logGameSettingsOpened();
    }, [loadData]),
  );

  const handleInfoSetPress = useCallback(
    (setId: string) => {
      handleEditSet(setId);
    },
    [handleEditSet],
  );

  const handleSubmit: GameSettingsFormSubmitHandler = async (
    values,
    helpers,
  ) => {
    setLoading(true);
    try {
      // Сохраняем в Redux state
      dispatch(setGameSettings(values));

      // Сохраняем в AsyncStorage
      await storage.saveGameSettings(values);

      // Логируем начало игры
      logGameStarted(values);

      // Переходим на экран активной игры
      navigation.navigate(Screens.activeGame);
    } catch (error) {
      console.error('Ошибка при сохранении настроек игры:', error);
      // Можно установить ошибку через helpers.setFieldError или показать уведомление
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenContainer
        navigation={navigation}
        type="scrollView"
        title={t('titles.gameSettings')}
        style={styles.scrollContent}
      >
        <GameSettingsForm
          initialValues={initialFormValues}
          onSubmit={handleSubmit}
          loading={loading}
          hideSubmitButton
          onSubmitPress={handleSubmit => {
            formSubmitRef.current = handleSubmit;
          }}
          onEditSetsPress={activeTab => {
            navigation.navigate(Screens.editSets, { openTab: activeTab });
          }}
          onInfoSetPress={handleInfoSetPress}
          onCreateSetPress={() => {
            navigation.navigate(Screens.editSets, { openTab: 'custom' });
          }}
          availableSets={availableSets}
        />
      </ScreenContainer>
      <View
        style={[
          styles.fixedButtonContainer,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <AppButton
          mode="contained"
          loading={loading}
          onPress={() => {
            if (formSubmitRef.current) {
              formSubmitRef.current();
            }
          }}
          style={styles.submitButton}
        >
          {t('game.startGame')}
        </AppButton>
      </View>

      {editingSetId &&
        (() => {
          const editingSet = editingSets.find(s => s.id === editingSetId);
          return editingSet ? (
            <EditSetItemsModal
              visible={showEditModal}
              editingSetId={editingSetId}
              editingSetName={editingSet.name}
              items={editingSet.items}
              onClose={handleCloseEditModal}
              onDeleteItem={(index: number) =>
                handleDeleteItemFromSet(editingSetId, index)
              }
            />
          ) : null;
        })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Отступ для фиксированной кнопки
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    width: '100%',
  },
});
