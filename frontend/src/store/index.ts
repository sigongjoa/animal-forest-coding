import { configureStore } from '@reduxjs/toolkit';
import progressionReducer from './slices/progressionSlice';
import economyReducer from './slices/economySlice';
import worldReducer from './slices/worldSlice';

export const store = configureStore({
  reducer: {
    progression: progressionReducer,
    economy: economyReducer,
    world: worldReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
