# Phase 1 구현 가이드: 데이터 지속성

**상태**: 🚀 구현 시작
**예상 기간**: 2주
**복잡도**: 중

---

## 📋 목차

1. [개요](#개요)
2. [구현된 컴포넌트](#구현된-컴포넌트)
3. [통합 단계](#통합-단계)
4. [테스트](#테스트)
5. [배포](#배포)

---

## 개요

### 목표
사용자가 페이지를 새로고침해도 게임 진행 상황이 유지되어야 합니다.

### 구현 전략
```
1단계: localStorage에 저장 (즉각적)
2단계: Backend에 저장 (동기화)
3단계: 충돌 해결 (다중 기기)
```

---

## 구현된 컴포넌트

### 1. Frontend Service: PersistenceService

**파일**: `frontend/src/services/PersistenceService.ts`

**역할**:
- localStorage 저장/복원
- Backend 동기화
- 충돌 해결
- 자동 저장

**사용법**:
```typescript
import { persistenceService } from '@/services/PersistenceService';

// 게임 상태 복원
const state = await persistenceService.restoreGameState(studentId, token);

// 수동 저장
await persistenceService.manualSave(gameState, token);

// 자동 저장 시작
persistenceService.startAutoSave(getState, token);
```

### 2. Backend API: Progression Routes

**파일**: `backend/src/routes/progression.ts`

**엔드포인트**:

#### POST /api/progression/save
게임 상태를 Backend에 저장합니다.

**요청**:
```bash
curl -X POST http://localhost:5000/api/progression/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "episodeId": "ep_1",
    "completedMissions": ["mission_1_1", "mission_1_2"],
    "currentMissionIndex": 2,
    "points": 1000,
    "badges": ["badge_1"]
  }'
```

**응답**:
```json
{
  "success": true,
  "message": "Progression saved successfully",
  "data": {
    "savedAt": "2025-12-05T10:30:00.000Z",
    "lastModified": 1733350200000
  }
}
```

#### GET /api/progression/load
저장된 게임 상태를 복원합니다.

**요청**:
```bash
curl http://localhost:5000/api/progression/load \
  -H "Authorization: Bearer <token>"
```

**응답**:
```json
{
  "success": true,
  "data": {
    "episodeId": "ep_1",
    "completedMissions": ["mission_1_1", "mission_1_2"],
    "currentMissionIndex": 2,
    "points": 1000,
    "badges": ["badge_1"],
    "lastModified": 1733350200000
  }
}
```

### 3. Redux Slice: progressionSlice

**파일**: `frontend/src/store/slices/progressionSlice.ts`

**State**:
```typescript
interface ProgressionState {
  // 게임 상태
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];

  // UI 상태
  loading: boolean;
  saving: boolean;
  error: string | null;

  // 동기화 상태
  isSynced: boolean;
  lastSyncedAt: number | null;
}
```

**Actions**:
```typescript
// 미션 완료
dispatch(completeMission({
  missionId: 'mission_1_1',
  points: 500,
  badge: 'badge_1'
}));

// 상태 복원
dispatch(restoreGameState({ studentId, token }));

// Backend 저장
dispatch(saveToBackend({ state, token }));
```

**Selectors**:
```typescript
// 상태 조회
const progression = useSelector(selectProgression);
const points = useSelector(selectPoints);
const isSynced = useSelector(selectIsSynced);
```

### 4. E2E 테스트

**파일**: `e2e/persistence-flow.spec.ts`

**테스트 케이스**:
1. localStorage 저장/복원
2. 여러 탭 동기화
3. Backend 동기화
4. 충돌 해결
5. 오프라인 → 온라인 복구

---

## 통합 단계

### Step 1: API 등록 (Backend)

`backend/src/routes/api.ts`에 이미 추가됨:
```typescript
import progressionRouter from './progression';

// 라우터 마운트
router.use('/progression', progressionRouter);
```

✅ 완료

### Step 2: Redux Store 설정 (Frontend)

`frontend/src/store/index.ts` 수정:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import progressionReducer from './slices/progressionSlice';

export const store = configureStore({
  reducer: {
    // ... 기존 reducers
    progression: progressionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Step 3: 자동 저장 설정

`frontend/src/App.tsx` 또는 `StoryPage.tsx`:

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { persistenceService } from '@/services/PersistenceService';
import {
  restoreGameState,
  selectProgression
} from '@/store/slices/progressionSlice';

export const App = () => {
  const dispatch = useDispatch();
  const { studentId } = useSelector(selectProgression);

  // 앱 시작 시 상태 복원
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (userId && token) {
      dispatch(restoreGameState({
        studentId: userId,
        token
      }));
    }
  }, [dispatch]);

  // 자동 저장 설정
  useEffect(() => {
    if (studentId) {
      const token = localStorage.getItem('token');
      const unsubscribe = store.subscribe(() => {
        const state = store.getState().progression;
        persistenceService.startAutoSave(
          () => ({
            studentId,
            episodeId: state.episodeId || 'ep_1',
            completedMissions: state.completedMissions,
            currentMissionIndex: state.currentMissionIndex,
            points: state.points,
            badges: state.badges,
            lastModified: Date.now(),
          }),
          token || ''
        );
      });

      return unsubscribe;
    }
  }, [studentId]);

  return (
    // ... 앱 컴포넌트
  );
};
```

### Step 4: 미션 완료 시 상태 업데이트

Story/Mission 컴포넌트:

```typescript
import { useDispatch } from 'react-redux';
import { completeMission } from '@/store/slices/progressionSlice';

export const MissionComplete = () => {
  const dispatch = useDispatch();

  const handleMissionComplete = async () => {
    // ... 미션 검증 로직

    // Redux 상태 업데이트
    dispatch(completeMission({
      missionId: 'mission_1_1',
      points: 500,
      badge: 'badge_1', // 선택사항
    }));

    // PersistenceService가 자동으로 저장
  };

  return (
    <button onClick={handleMissionComplete}>
      제출
    </button>
  );
};
```

---

## 테스트

### 단위 테스트 (Unit Tests)

`tests/unit/PersistenceService.test.ts` 작성:

```typescript
import { PersistenceService } from '@/services/PersistenceService';

describe('PersistenceService', () => {
  let service: PersistenceService;

  beforeEach(() => {
    service = new PersistenceService();
    localStorage.clear();
  });

  test('should save and restore state from localStorage', () => {
    const state = {
      studentId: 'student_1',
      episodeId: 'ep_1',
      completedMissions: ['mission_1'],
      currentMissionIndex: 1,
      points: 500,
      badges: [],
      lastModified: Date.now(),
    };

    service.saveToLocalStorage(state);
    const restored = service.loadFromLocalStorage();

    expect(restored).toEqual(state);
  });

  test('should handle conflict resolution', () => {
    const serverState = {
      completedMissions: ['mission_1', 'mission_2'],
      points: 1000,
      // ...
    };

    const localState = {
      completedMissions: ['mission_1', 'mission_3'],
      points: 1100,
      // ...
    };

    const resolved = service.resolveConflict(serverState, localState);

    expect(resolved.completedMissions).toContain('mission_1');
    expect(resolved.completedMissions).toContain('mission_2');
    expect(resolved.completedMissions).toContain('mission_3');
  });
});
```

### E2E 테스트

이미 작성됨: `e2e/persistence-flow.spec.ts`

**실행**:
```bash
npm run e2e -- persistence-flow.spec.ts
```

---

## 배포

### 프리플라이트 체크리스트

- [ ] 모든 단위 테스트 통과
- [ ] 모든 E2E 테스트 통과
- [ ] localStorage 용량 처리 테스트
- [ ] 손상된 데이터 복구 테스트
- [ ] 오프라인 모드 테스트
- [ ] 여러 기기 동기화 테스트

### 배포 명령어

```bash
# 1. 테스트 실행
npm test -- persistence-flow
npm run e2e -- persistence-flow.spec.ts

# 2. 빌드
npm run build

# 3. 배포
npm run deploy
```

---

## 모니터링

배포 후 모니터링:

```
메트릭:
- localStorage 저장 성공률
- Backend 동기화 성공률
- 데이터 손실 사건
- 충돌 해결 빈도

로그:
- /api/progression/save 응답 시간
- /api/progression/load 응답 시간
- 에러 발생 빈도
```

---

## 트러블슈팅

### 문제 1: localStorage quota exceeded

**증상**: 저장 실패, 게임 상태 손실

**해결**:
```typescript
// PersistenceService에서 자동 처리됨
// 오래된 데이터 정리 후 재시도
```

### 문제 2: 손상된 localStorage 데이터

**증상**: 게임 시작 실패

**해결**:
```typescript
// 손상된 JSON 파싱 실패 시
// try-catch에서 null 반환
// 신선한 시작으로 복구
```

### 문제 3: Backend 동기화 실패

**증상**: 새 기기에서 진행 상황 안 보임

**해결**:
```typescript
// 1. localStorage에서 먼저 복원
// 2. Backend 복구 시 로컬과 병합
// 3. 인터넷 복구 시 자동 재시도
```

---

## 다음 단계

Phase 1 완료 후:

### Phase 2: 서버 사이드 검증 (3주)
- CodeValidationService 구현
- 샌드박스 환경 설정
- 부정행위 감지 로직

### Phase 3: 데이터 기반 설계 (2주)
- Episode/Mission 모델 정의
- StoryEngine 컴포넌트
- 데이터 마이그레이션

---

## 참고 자료

- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Redux Documentation](https://redux.js.org/)
- [Conflict Resolution Patterns](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
- [Offline-First Architecture](https://offlinefirst.org/)

---

**상태**: ✅ 구현 완료 → 통합 단계 진행 중

