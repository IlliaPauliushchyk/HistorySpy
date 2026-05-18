import { withStatusBar } from '@/hocs';
import { ActiveGameResultsScreen as ActiveGameResults } from './ActiveGameResultsScreen';
import { ActiveGameScreen as ActiveGame } from './ActiveGameScreen';
import { CreateCustomSetScreen as CreateCustomSet } from './CreateCustomSetScreen';
import { EditSetsScreen as EditSets } from './EditSetsScreen';
import { GameSettingsScreen as GameSettings } from './GameSettingsScreen';
import { HomeScreen as Home } from './HomeScreen';
import { LanguageScreen as Language } from './LanguageScreen';
import { RulesScreen as Rules } from './RulesScreen';

export const ActiveGameScreen = withStatusBar(ActiveGame);
export const ActiveGameResultsScreen = withStatusBar(ActiveGameResults);
export const CreateCustomSetScreen = withStatusBar(CreateCustomSet);
export const EditSetsScreen = withStatusBar(EditSets);
export const GameSettingsScreen = withStatusBar(GameSettings);
export const HomeScreen = withStatusBar(Home);
export const LanguageScreen = withStatusBar(Language);
export const RulesScreen = withStatusBar(Rules);
