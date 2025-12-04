/**
 * PersistenceService: 게임 상태를 localStorage와 Backend에 저장
 *
 * 역할:
 * 1. localStorage: 즉각적 저장 (새로고침 후 복구)
 * 2. Backend: 서버 동기화 (여러 기기 연동)
 * 3. 충돌 해결: 여러 기기에서 동시 수정 시 처리
 */

export interface GameState {
  studentId: string;
  episodeId: string;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];
  lastModified: number; // timestamp
}

export interface SyncResult {
  success: boolean;
  message: string;
  serverState?: GameState;
  conflictResolved?: boolean;
}

export class PersistenceService {
  private readonly STORAGE_KEY = 'nook_coding_game_state';
  private readonly AUTO_SAVE_INTERVAL = 5000; // 5초
  private autoSaveInterval: NodeJS.Timeout | null = null;

  /**
   * localStorage에 게임 상태 저장
   */
  saveToLocalStorage(state: GameState): boolean {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      console.log('✅ Game state saved to localStorage');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('⚠️ localStorage quota exceeded, clearing old data');
          this.clearOldData();
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
            return true;
          } catch {
            console.error('❌ Failed to save even after cleanup');
            return false;
          }
        }
      }
      console.error('❌ Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * localStorage에서 게임 상태 복원
   */
  loadFromLocalStorage(): GameState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        console.log('✅ Game state loaded from localStorage');
        return state;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from localStorage:', error);
      // 손상된 데이터는 무시하고 null 반환
    }
    return null;
  }

  /**
   * 백엔드에 게임 상태 저장 (동기화)
   */
  async saveToBackend(state: GameState, token: string): Promise<SyncResult> {
    try {
      const response = await fetch('/api/progression/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(state),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Game state saved to backend');
      return result;
    } catch (error) {
      console.error('❌ Failed to sync with backend:', error);
      return {
        success: false,
        message: 'Backend sync failed',
      };
    }
  }

  /**
   * 백엔드에서 게임 상태 복원
   */
  async loadFromBackend(token: string): Promise<GameState | null> {
    try {
      const response = await fetch('/api/progression/load', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        console.log('✅ Game state loaded from backend');
        return result.data;
      }
    } catch (error) {
      console.error('⚠️ Failed to load from backend:', error);
    }
    return null;
  }

  /**
   * 게임 상태 복원 전략 (우선순위)
   *
   * 1. Backend 상태 로드
   * 2. 로컬 상태와 비교
   * 3. 충돌 시 해결
   * 4. 최종 상태 반환
   */
  async restoreGameState(
    studentId: string,
    token: string
  ): Promise<GameState | null> {
    console.log('🔄 Restoring game state...');

    // 1. localStorage에서 로컬 상태 로드
    const localState = this.loadFromLocalStorage();

    // 2. Backend에서 서버 상태 로드
    const serverState = await this.loadFromBackend(token);

    // 3. 충돌 해결
    if (localState && serverState) {
      const resolved = this.resolveConflict(serverState, localState);
      console.log('⚖️ Conflict resolved:', resolved);
      return resolved;
    }

    // 4. 하나만 있으면 그것 사용
    const finalState = serverState || localState;
    if (finalState) {
      console.log('✅ Game state restored');
    } else {
      console.log('ℹ️ No saved state found (fresh start)');
    }

    return finalState;
  }

  /**
   * 두 상태 간 충돌 해결
   *
   * 규칙:
   * 1. 새로운 미션이 있으면 병합
   * 2. 포인트는 더 높은 값 사용
   * 3. 최신 수정 시간 기준
   */
  private resolveConflict(
    serverState: GameState,
    localState: GameState
  ): GameState {
    console.log('⚖️ Resolving conflict between states...');

    // 새로운 미션 찾기 (local에만 있는 미션)
    const newMissions = localState.completedMissions.filter(
      m => !serverState.completedMissions.includes(m)
    );

    // 병합된 미션 목록
    const mergedMissions = Array.from(
      new Set([
        ...serverState.completedMissions,
        ...localState.completedMissions,
      ])
    );

    // 포인트: 더 높은 값 사용
    const mergedPoints = Math.max(serverState.points, localState.points);

    // 배지: 모두 포함
    const mergedBadges = Array.from(
      new Set([...serverState.badges, ...localState.badges])
    );

    const resolvedState: GameState = {
      studentId: serverState.studentId,
      episodeId: serverState.episodeId,
      completedMissions: mergedMissions,
      currentMissionIndex: Math.max(
        serverState.currentMissionIndex,
        localState.currentMissionIndex
      ),
      points: mergedPoints,
      badges: mergedBadges,
      lastModified: Date.now(),
    };

    console.log(
      `✅ Merged ${newMissions.length} new missions, ${mergedMissions.length} total`
    );

    return resolvedState;
  }

  /**
   * 자동 저장 시작 (Redux 상태 변경 감시)
   *
   * 사용:
   * ```
   * store.subscribe(() => {
   *   const state = store.getState();
   *   persistenceService.startAutoSave(state, token);
   * });
   * ```
   */
  startAutoSave(getState: () => GameState, token: string): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(async () => {
      const state = getState();

      // 1. 로컬 저장 (즉각적)
      this.saveToLocalStorage(state);

      // 2. 백엔드 동기화 (비동기)
      if (token) {
        await this.saveToBackend(state, token);
      }
    }, this.AUTO_SAVE_INTERVAL);

    console.log(`✅ Auto-save started (every ${this.AUTO_SAVE_INTERVAL}ms)`);
  }

  /**
   * 자동 저장 중지
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏸️  Auto-save stopped');
    }
  }

  /**
   * 수동 저장 (중요한 순간에)
   */
  async manualSave(
    state: GameState,
    token: string
  ): Promise<SyncResult> {
    console.log('💾 Manual save triggered');

    // 1. 로컬 저장
    this.saveToLocalStorage(state);

    // 2. 백엔드 동기화
    return await this.saveToBackend(state, token);
  }

  /**
   * 게임 상태 초기화 (개발/테스트용)
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️  All local data cleared');
  }

  /**
   * 오래된 데이터 정리 (quota 초과 시)
   */
  private clearOldData(): void {
    // 간단한 구현: 가장 오래된 데이터 1개 제거
    // 실제로는 더 정교한 LRU 전략 필요
    const keys = Object.keys(localStorage);
    if (keys.length > 0) {
      localStorage.removeItem(keys[0]);
      console.log('🧹 Cleaned up old data from localStorage');
    }
  }

  /**
   * 디버깅: 현재 상태 확인
   */
  debugGetState(): GameState | null {
    return this.loadFromLocalStorage();
  }

  /**
   * 디버깅: 저장소 크기 확인
   */
  debugGetStorageSize(): number {
    const state = this.loadFromLocalStorage();
    if (!state) return 0;
    return new Blob([JSON.stringify(state)]).size;
  }
}

// Singleton 인스턴스
export const persistenceService = new PersistenceService();
