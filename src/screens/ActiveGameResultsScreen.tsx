import {
  CharacterCard,
  NewGameButton,
  PlayerListSection,
  ScreenContainer,
} from '@/components';
import { MARGIN, PADDING } from '@/constants';
import { useActiveGameResults } from '@/hooks';
import { logGameResultsViewed, logNewGameFromResults } from '@/utils/analytics';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

type GameResult = {
  players: Array<{
    index: number;
    role: 'spy' | 'player';
    isExiled: boolean;
  }>;
  winner: 'players' | 'spies';
  character: string;
  setType: string;
};

type Props = {
  route: {
    params: {
      result: GameResult;
    };
  };
};

export const ActiveGameResultsScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { result } = route.params;
  const { handleNewGame } = useActiveGameResults();

  useEffect(() => {
    logGameResultsViewed({
      winner: result.winner,
      setType: result.setType,
    });
  }, [result.winner, result.setType]);

  const handleNewGamePress = () => {
    logNewGameFromResults();
    handleNewGame();
  };

  const winners = result.players.filter(
    p =>
      (result.winner === 'players' && p.role === 'player') ||
      (result.winner === 'spies' && p.role === 'spy'),
  );
  const losers = result.players.filter(
    p =>
      (result.winner === 'players' && p.role === 'spy') ||
      (result.winner === 'spies' && p.role === 'player'),
  );

  const winnerTitle =
    result.winner === 'players'
      ? t('results.playersWon')
      : t('results.spiesWon');

  const loserTitle =
    result.winner === 'players'
      ? t('results.spiesLost')
      : t('results.playersLost');

  return (
    <ScreenContainer type="scrollView" title={t('titles.gameResults')}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <PlayerListSection title={winnerTitle} players={winners} />
        <PlayerListSection title={loserTitle} players={losers} />
        <CharacterCard character={result.character} setType={result.setType} />
        <NewGameButton onPress={handleNewGamePress} style={styles.newGameButton} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: PADDING.LARGE,
    paddingBottom: MARGIN.EXTRA_LARGE,
  },
  newGameButton: {
    width: '100%',
  },
});
