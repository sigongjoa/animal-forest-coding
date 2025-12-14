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

export interface ProgressionState {
  // 게임 상태
  studentId: string | null;
  episodeId: string | null;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];
  perfectMissionCount: number;
  speedRunCount: number;

  // UI 상태
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSavedAt: number | null;

  // 동기화 상태
  isSynced: boolean;
  lastSyncedAt: number | null;
}

export const initialState: ProgressionState = {
  studentId: null,
  episodeId: null,
  completedMissions: [],
  currentMissionIndex: 0,
  points: 0,
  badges: [],
  perfectMissionCount: 0,
  speedRunCount: 0,
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
      isPerfect?: boolean;
      isSpeedRun?: boolean;
    }>) => {
      const { missionId, points, badge, isPerfect, isSpeedRun } = action.payload;

      // 중복 방지
      if (!state.completedMissions.includes(missionId)) {
        state.completedMissions.push(missionId);
        state.points += points;

        if (badge && !state.badges.includes(badge)) {
          state.badges.push(badge);
        }

        if (isPerfect) state.perfectMissionCount++;
        if (isSpeedRun) state.speedRunCount++;

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
      const { completedMissions, currentMissionIndex, points, badges, studentId, episodeId, perfectMissionCount, speedRunCount } = action.payload;
      state.completedMissions = completedMissions;
      state.currentMissionIndex = currentMissionIndex;
      state.points = points;
      state.badges = badges;
      state.studentId = studentId;
      state.episodeId = episodeId;
      state.perfectMissionCount = perfectMissionCount || 0;
      state.speedRunCount = speedRunCount || 0;
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
          state.perfectMissionCount = action.payload.perfectMissionCount || 0;
          state.speedRunCount = action.payload.speedRunCount || 0;
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

export const selectLevelStats = (state: { progression: ProgressionState }) => {
  const points = state.progression.points;
  const milestones = [1000, 3000, 5000, 8700];
  let level = 'Novice Coder';

  if (points >= 5000) level = 'Master Programmer';
  else if (points >= 3000) level = 'Expert Developer';
  else if (points >= 1000) level = 'Apprentice Coder';

  const nextMilestone = milestones.find(m => m > points) || 8700;
  const pointsToNext = Math.max(0, nextMilestone - points);

  // Progress calculation for the current level bar (simplified)
  // For extensive level bars, might need previous milestone logic
  const progressPercent = Math.round(((nextMilestone - pointsToNext) / nextMilestone) * 100);

  return {
    level,
    nextLevelPoints: nextMilestone,
    pointsToNext,
    progressPercent
  };
};
