import {
  AnimatedSetCard,
  AppButton,
  EditSetItemsModal,
  ScreenContainer,
} from '@/components';
import { Screens } from '@/constants';
import { useEditSets } from '@/hooks';
import { logEditSetsOpened } from '@/utils/analytics';
import { getLocalizedName } from '@/utils/localization';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, useTheme } from 'react-native-paper';

export type EditSetsRouteParams = { openTab?: 'builtin' | 'custom' };

export const EditSetsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<{ params: EditSetsRouteParams }, 'params'>>();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>(() =>
    route.params?.openTab === 'custom' ? 'custom' : 'builtin',
  );

  const {
    loading,
    editingSets,
    editingSetId,
    showEditModal,
    modifiedSets,
    createCardOpacity,
    createCardTranslateY,
    loadData,
    handleEditSet,
    handleResetSet,
    handleDeleteCustomSet,
    handleDeleteItemFromSet,
    handleCloseEditModal,
  } = useEditSets();

  const handleEditSetClick = useCallback(
    (setId: string) => {
      const set = editingSets.find(s => s.id === setId);
      if (!set) return;
      if (set.isCustom) {
        const selectedItems = set.items.map(item => {
          const localizedName = getLocalizedName(item.name, item.type);
          return `${item.type}-${localizedName}`;
        });
        navigation.navigate(
          Screens.createCustomSet as never,
          {
            editingCustomSetId: setId,
            customSetName: set.name,
            selectedItems,
            filterType: 'all',
          } as never,
        );
      } else {
        handleEditSet(setId);
      }
    },
    [editingSets, handleEditSet, navigation],
  );

  const handleCreateCustomSetClick = useCallback(() => {
    navigation.navigate(
      Screens.createCustomSet as never,
      {
        editingCustomSetId: null,
        customSetName: '',
        selectedItems: [],
        filterType: 'all',
      } as never,
    );
  }, [navigation]);

  const baseSets = editingSets.filter(s => !s.isCustom);
  const customSets = editingSets.filter(s => s.isCustom);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const openTab = route.params?.openTab || 'builtin';
      if (openTab === 'custom') {
        setActiveTab('custom');
      }
      // Логируем открытие экрана редактирования наборов
      logEditSetsOpened(openTab);
    }, [loadData, route.params?.openTab]),
  );

  const editingSet = editingSets.find(s => s.id === editingSetId);

  if (loading) {
    return (
      <ScreenContainer
        navigation={navigation}
        title={t('titles.editSets')}
        loading={true}
      >
        <View />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      navigation={navigation}
      type="view"
      title={t('titles.editSets')}
    >
      <View style={styles.wrapper}>
        <View style={styles.tabRow}>
          <Button
            mode={activeTab === 'builtin' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('builtin')}
            style={[styles.tabButton, { flex: 1 }]}
            contentStyle={styles.tabButtonContent}
          >
            {t('labels.builtInSets')}
          </Button>
          <Button
            mode={activeTab === 'custom' ? 'contained' : 'outlined'}
            onPress={() => setActiveTab('custom')}
            style={[styles.tabButton, { flex: 1 }]}
            contentStyle={styles.tabButtonContent}
          >
            {t('labels.mySets')}
          </Button>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
        >
          {activeTab === 'builtin' &&
            baseSets.map((set, index) => {
              const isModified = modifiedSets.has(set.name);
              return (
                <AnimatedSetCard
                  key={set.id}
                  editingSet={set}
                  index={index}
                  isModified={isModified}
                  onEdit={() => handleEditSetClick(set.id)}
                  onReset={
                    isModified ? () => handleResetSet(set.id) : undefined
                  }
                  theme={theme}
                />
              );
            })}

          {activeTab === 'custom' && (
            <>
              {customSets.map((set, index) => {
                const isModified = modifiedSets.has(set.name);
                return (
                  <AnimatedSetCard
                    key={set.id}
                    editingSet={set}
                    index={index}
                    isModified={isModified}
                    onEdit={() => handleEditSetClick(set.id)}
                    onDelete={() => handleDeleteCustomSet(set.id)}
                    theme={theme}
                  />
                );
              })}
              <Animated.View
                style={{
                  opacity: createCardOpacity,
                  transform: [{ translateY: createCardTranslateY }],
                }}
              >
                <Card style={styles.setCard}>
                  <Card.Content>
                    <AppButton
                      mode="outlined"
                      onPress={handleCreateCustomSetClick}
                      icon="plus"
                    >
                      {t('buttons.createCustomSet')}
                    </AppButton>
                  </Card.Content>
                </Card>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </View>

      {/* Модальное окно редактирования элементов набора */}
      {editingSetId && editingSet && (
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
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },
  tabButton: {
    minHeight: 44,
  },
  tabButtonContent: {
    paddingVertical: 6,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingTop: 4,
  },
  setCard: {
    marginBottom: 16,
  },
});
