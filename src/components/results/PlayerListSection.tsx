import { AppText } from '@/components';
import { BORDER_RADIUS, MARGIN, PADDING } from '@/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

type Player = {
  index: number;
  role: 'spy' | 'player';
  isExiled: boolean;
};

type PlayerListSectionProps = {
  title: string;
  players: Player[];
};

export const PlayerListSection = ({ title, players }: PlayerListSectionProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (players.length === 0) {
    return null;
  }

  return (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <AppText
          variant="titleLarge"
          fontWeight="bold"
          mb={16}
          style={{ color: theme.colors.onSurface }}
        >
          {title}
        </AppText>
        <FlatList
          data={players}
          keyExtractor={(item, index) => `${item.index}-${index}`}
          scrollEnabled={players.length > 6}
          showsVerticalScrollIndicator={players.length > 6}
          renderItem={({ item }) => (
            <View
              style={[
                styles.playerCard,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <AppText
                variant="bodyLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t('labels.playerNumber', { number: item.index })}
              </AppText>
              {item.isExiled && (
                <AppText style={{ color: theme.colors.onSurfaceVariant }}>
                  💀
                </AppText>
              )}
            </View>
          )}
          style={styles.playersListContainer}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: 16,
  },
  playersListContainer: {
    maxHeight: 300,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PADDING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    marginBottom: MARGIN.SMALL,
  },
});

