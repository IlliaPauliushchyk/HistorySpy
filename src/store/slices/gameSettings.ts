import { Slices } from '@/constants';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export type GameSettings = {
  playersCount: number;
  spiesCount: number;
  roundTime: number | null;
  infiniteTime: boolean;
  setType: string;
  suggestQuestionEnabled?: boolean;
  showSecretForTeacherEnabled?: boolean;
};

type GameSettingsState = {
  gameSettings: GameSettings | null;
};

const initialState: GameSettingsState = {
  gameSettings: null,
};

const gameSettingsSlice = createSlice({
  name: Slices.gameSettings,
  initialState,
  reducers: {
    setGameSettings: (state, action: PayloadAction<GameSettings>) => {
      state.gameSettings = action.payload;
    },

    resetGameSettings: state => {
      state.gameSettings = initialState.gameSettings;
    },
  },
});

export const selectGameSettings = (state: RootState) =>
  state.gameSettings.gameSettings;

export const {
  actions: { setGameSettings, resetGameSettings },
  reducer: gameSettingsReducer,
} = gameSettingsSlice;
