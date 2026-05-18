import { Screens } from '@/constants';
import {
  ActiveGameResultsScreen,
  ActiveGameScreen,
  CreateCustomSetScreen,
  EditSetsScreen,
  GameSettingsScreen,
  HomeScreen,
  LanguageScreen,
  RulesScreen,
} from '@/screens';
import { noHeaderScreenOptions } from '@/styles';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={noHeaderScreenOptions}>
      <Stack.Screen name={Screens.home} component={HomeScreen} />
      <Stack.Screen name={Screens.language} component={LanguageScreen} />
      <Stack.Screen name={Screens.rules} component={RulesScreen} />
      <Stack.Screen
        name={Screens.gameSettings}
        component={GameSettingsScreen}
      />
      <Stack.Screen name={Screens.activeGame} component={ActiveGameScreen} />
      <Stack.Screen
        name={Screens.activeGameResults}
        component={ActiveGameResultsScreen}
      />
      <Stack.Screen name={Screens.editSets} component={EditSetsScreen} />
      <Stack.Screen
        name={Screens.createCustomSet}
        component={CreateCustomSetScreen}
      />
    </Stack.Navigator>
  );
};
