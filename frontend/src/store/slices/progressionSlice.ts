/**
 * Redux Slice: progressionSlice
 *
 * 역할: 게임 진행 상황 상태 관리
 * - 완료한 미션
 * - 포인트
 * - 배지
 * - 현재 미션 인덱스
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { persistenceService, GameState } from '../../services/PersistenceService';

interface ProgressionState {
  // 게임 상태
  studentId: string | null;
  episodeId: string | null;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];

  // UI 상태
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSavedAt: number | null;

  // 동기화 상태
  isSynced: boolean;
  lastSyncedAt: number | null;
}

const initialState: ProgressionState = {
  studentId: null,
  episodeId: null,
  completedMissions: [],
  currentMissionIndex: 0,
  points: 0,
  badges: [],
  loading: false,
  saving: false,
  error: null,
  lastSavedAt: null,
  isSynced: false,
  lastSyncedAt: null,
};

/**
 * Async Thunk: 게임 상태 복원
 * - localStorage에서 로드
 * - Backend에서 로드
 * - 충돌 해결
 */
export const restoreGameState = createAsyncThunk(
  'progression/restoreGameState',
  async ({ studentId, token }: { studentId: string; token: string }) => {
    const state = await persistenceService.restoreGameState(studentId, token);
    return state;
  }
);

/**
 * Async Thunk: 백엔드에 저장
 */
export const saveToBackend = createAsyncThunk(
  'progression/saveToBackend',
  async (
    { state, token }: { state: GameState; token: string },
    { rejectWithValue }
  ) => {
    const result = await persistenceService.saveToBackend(state, token);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  }
);

// Slice
const progressionSlice = createSlice({
  name: 'progression',
  initialState,
  reducers: {
    // 미션 완료
    completeMission: (state, action: PayloadAction<{
      missionId: string;
      points: number;
      badge?: string;
    }>) => {
      const { missionId, points, badge } = action.payload;

      // 중복 방지
      if (!state.completedMissions.includes(missionId)) {
        state.completedMissions.push(missionId);
        state.points += points;

        if (badge && !state.badges.includes(badge)) {
          state.badges.push(badge);
        }

        // 다음 미션으로
        state.currentMissionIndex++;
        state.lastSavedAt = Date.now();
      }
    },

    // 현재 미션 변경
    setCurrentMission: (state, action: PayloadAction<number>) => {
      state.currentMissionIndex = action.payload;
    },

    // 에피소드 초기화
    setEpisode: (state, action: PayloadAction<{
      studentId: string;
      episodeId: string;
    }>) => {
      state.studentId = action.payload.studentId;
      state.episodeId = action.payload.episodeId;
    },

    // 에러 초기화
    clearError: (state) => {
      state.error = null;
    },

    // 전체 진행 상황 설정 (복원 후)
    setProgression: (state, action: PayloadAction<GameState>) => {
      const { completedMissions, currentMissionIndex, points, badges, studentId, episodeId } = action.payload;
      state.completedMissions = completedMissions;
      state.currentMissionIndex = currentMissionIndex;
      state.points = points;
      state.badges = badges;
      state.studentId = studentId;
      state.episodeId = episodeId;
      state.isSynced = true;
      state.lastSyncedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    // 복원 상태
    builder
      .addCase(restoreGameState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreGameState.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.completedMissions = action.payload.completedMissions;
          state.currentMissionIndex = action.payload.currentMissionIndex;
          state.points = action.payload.points;
          state.badges = action.payload.badges;
          state.studentId = action.payload.studentId;
          state.episodeId = action.payload.episodeId;
          state.isSynced = true;
          state.lastSyncedAt = Date.now();
        }
      })
      .addCase(restoreGameState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore game state';
      });

    // 백엔드 저장 상태
    builder
      .addCase(saveToBackend.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveToBackend.fulfilled, (state) => {
        state.saving = false;
        state.isSynced = true;
        state.lastSyncedAt = Date.now();
        state.lastSavedAt = Date.now();
      })
      .addCase(saveToBackend.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string || 'Failed to save to backend';
        state.isSynced = false;
      });
  },
});

export const {
  completeMission,
  setCurrentMission,
  setEpisode,
  clearError,
  setProgression,
} = progressionSlice.actions;

export default progressionSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================

export const selectProgression = (state: { progression: ProgressionState }) =>
  state.progression;

export const selectCompletedMissions = (state: { progression: ProgressionState }) =>
  state.progression.completedMissions;

export const selectPoints = (state: { progression: ProgressionState }) =>
  state.progression.points;

export const selectBadges = (state: { progression: ProgressionState }) =>
  state.progression.badges;

export const selectCurrentMissionIndex = (state: { progression: ProgressionState }) =>
  state.progression.currentMissionIndex;

export const selectIsSynced = (state: { progression: ProgressionState }) =>
  state.progression.isSynced;

export const selectProgressionLoading = (state: { progression: ProgressionState }) =>
  state.progression.loading;

export const selectProgressionError = (state: { progression: ProgressionState }) =>
  state.progression.error;
