import { configureStore } from '@reduxjs/toolkit';
import progressionReducer from './slices/progressionSlice';

export const store = configureStore({
  reducer: {
    progression: progressionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
