import { Slices } from '@/constants';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { gameSettingsReducer } from './slices';

const reducers = combineReducers({
  [Slices.gameSettings]: gameSettingsReducer,
});

export const store = configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './slices';
