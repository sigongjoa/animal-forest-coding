# 🚀 Production Readiness Roadmap

**상태**: 설계 문서
**작성일**: 2025-12-05
**버전**: 1.0

---

## 📊 현황 분석

### 현재 수준: MVP (Minimum Viable Product)
```
MVP → Product → Platform
 ✅    ⏳      📅

현재: "투자자 피칭 가능" 수준
목표: "대규모 학교에 배포 가능" 수준
```

### 4대 치명적 갭(Gap)

| # | 문제 | 영향 | 난이도 |
|---|------|------|--------|
| 1 | 📱 데이터 지속성 부재 | F5 새로고침 → 모두 초기화 | 중 |
| 2 | 🔐 클라이언트 검증 | F12 개발자 도구로 부정행위 가능 | 높음 |
| 3 | 📦 확장성 제한 | 에피소드 100개 = HTML 100개 파일 | 중 |
| 4 | 🧠 분리된 아키텍처 | 백엔드 API 미활용, 연결 끊김 | 높음 |

---

## 🔧 상세 해결 방안

### 1️⃣ 데이터 지속성 (Data Persistence)

#### 문제 상세 분석
```javascript
// ❌ 현재: 메모리에만 저장
const currentScene = 1;  // 새로고침 → 0으로 초기화
const completedMissions = ['mission_1'];  // 새로고침 → 초기화

// 사용자 입장: "아, 내가 이미 푼 게 없어진다고?"
```

#### 해결 방안 (3단계)

**Step 1: 로컬 스토리지 (localStorage) - 즉시**

```typescript
// services/PersistenceService.ts
class PersistenceService {
  private readonly STORAGE_KEY = 'nook_coding_progress';

  // 게임 상태 저장
  saveGameState(state: GameState): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(state)
      );
      console.log('✅ Game state saved to localStorage');
    } catch (error) {
      console.warn('⚠️ localStorage quota exceeded, using memory fallback');
    }
  }

  // 게임 상태 복원
  loadGameState(): GameState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        console.log('✅ Game state loaded from localStorage');
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from localStorage');
    }
    return null;
  }

  // 주기적 자동 저장 (5초마다)
  enableAutoSave(state$: Observable<GameState>): void {
    state$
      .pipe(debounceTime(5000))
      .subscribe(state => this.saveGameState(state));
  }
}
```

**Step 2: 서버 동기화 (Backend) - 1주**

```typescript
// backend/src/routes/progression.ts
router.post('/api/progression/save', authenticateUser, async (req, res) => {
  const { studentId } = req.user;
  const { completedMissions, points, badges, currentScene } = req.body;

  // 데이터 검증 (중요: 서버에서 재검증)
  const validation = await validateMissionCompletion(
    studentId,
    completedMissions
  );

  if (validation.valid) {
    await db.progression.upsert({
      studentId,
      completedMissions,
      points,
      badges,
      currentScene,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: '진행 상황 저장 완료' });
  } else {
    res.status(403).json({
      success: false,
      error: 'Invalid progression data detected',
    });
  }
});

router.get('/api/progression/load', authenticateUser, async (req, res) => {
  const { studentId } = req.user;

  const progression = await db.progression.findOne({ studentId });

  if (progression) {
    res.json({
      success: true,
      data: {
        completedMissions: progression.completedMissions,
        points: progression.points,
        badges: progression.badges,
        currentScene: progression.currentScene,
      },
    });
  } else {
    res.json({
      success: true,
      data: null, // 첫 로그인
    });
  }
});
```

**Step 3: 충돌 해결 (Conflict Resolution) - 2주**

```typescript
// scenarios/sync-conflict.ts
/**
 * 시나리오: 학생이 집에서 미션 3을 풀고, 학교 PC에서도 미션 3을 풀었을 때
 *
 * 집(Device A):  [mission_1, mission_2, mission_3] - Points: 1500
 * 학교(Device B): [mission_1, mission_2, mission_3] - Points: 1500
 *
 * 두 기기 모두에서 동시에 서버에 저장하려고 함
 * → 어느 것을 믿을 것인가?
 */

// 해결: Vector Clock 또는 Last-Write-Wins
class ConflictResolver {
  resolveConflict(
    serverState: ProgressionState,
    clientState: ProgressionState,
    clientTimestamp: number
  ): ProgressionState {
    // 1. 새로운 미션이 있는가?
    const newMissions = clientState.completedMissions.filter(
      m => !serverState.completedMissions.includes(m)
    );

    // 2. 새로운 미션이 있으면 병합
    if (newMissions.length > 0) {
      return {
        completedMissions: [
          ...new Set([
            ...serverState.completedMissions,
            ...clientState.completedMissions,
          ]),
        ],
        points: serverState.points + (clientState.points - 0),
        lastSync: Date.now(),
      };
    }

    // 3. 동일하면 서버 상태 유지 (최신성 보장)
    return serverState;
  }
}
```

**Step 4: 구조**

```
Backend DB (PostgreSQL)
    ↕ (동기화)
Redux Store (메모리)
    ↕ (로컬 저장)
localStorage (브라우저)
```

#### 구현 체크리스트
- [ ] PersistenceService 작성
- [ ] localStorage 저장/복원 로직 구현
- [ ] `/api/progression/save` 엔드포인트 작성
- [ ] `/api/progression/load` 엔드포인트 작성
- [ ] 충돌 해결 로직 구현
- [ ] E2E 테스트: 새로고침 후 진행 상황 유지 확인
- [ ] E2E 테스트: 여러 기기 동기화 확인

**예상 소요 시간**: 2주
**복잡도**: 중상

---

### 2️⃣ 보안 및 부정행위 방지 (Server-Side Validation)

#### 문제 상세 분석
```javascript
// ❌ 현재: 클라이언트 검증
// story.html 라인 627
if (code.includes('int loan') && code.includes('49800')) {
    // ✅ 성공! → 이 로직을 F12로 보고 복사할 수 있음
}

// 🎯 부정행위 시나리오:
// 1. 학생이 F12 → Network 탭 열기
// 2. "success": true 응답을 조작해서 재전송
// 또는
// 3. 브라우저 콘솔에서 직접 completedMissions = ['mission_1', 'mission_2', 'mission_3']로 설정
```

#### 해결 방안 (2단계)

**Step 1: 서버 사이드 검증 (Backend Validation)**

```typescript
// backend/src/services/CodeValidationService.ts
class CodeValidationService {
  /**
   * 코드를 서버에서 검증하고 채점
   * 클라이언트는 결과만 표시
   */
  async validateCodeOnServer(
    code: string,
    missionId: string,
    studentId: string
  ): Promise<ValidationResult> {
    // 1. 코드 무결성 확인
    const codeHash = this.hashCode(code);
    const previousHash = await this.getLastSubmissionHash(
      studentId,
      missionId
    );

    // 2. 중복 제출 감지
    if (codeHash === previousHash) {
      return {
        passed: false,
        error: 'Duplicate submission detected',
        cached: true,
      };
    }

    // 3. 서버에서 검증 (정규식 + 실행)
    const patterns = this.getMissionPatterns(missionId);
    const normalizedCode = this.normalizeCode(code);
    const matches = patterns.every(p => p.test(normalizedCode));

    // 4. 추가 검증: 코드 실행 (Sandbox)
    if (matches) {
      try {
        const output = await this.executeCodeInSandbox(
          code,
          missionId
        );
        const testsPassed = await this.runTestCases(
          output,
          missionId
        );

        if (testsPassed) {
          // 5. 성공 기록
          await this.recordMissionCompletion(
            studentId,
            missionId,
            code,
            codeHash
          );

          return {
            passed: true,
            points: this.getMissionPoints(missionId),
            message: 'Mission completed successfully!',
          };
        }
      } catch (sandboxError) {
        return {
          passed: false,
          error: `Runtime error: ${sandboxError.message}`,
        };
      }
    }

    return {
      passed: false,
      error: 'Code does not meet requirements',
    };
  }

  /**
   * 모든 제출 기록을 감시하는 "감시(Audit)" 로직
   */
  async auditStudentSubmissions(studentId: string): Promise<AuditReport> {
    const submissions = await db.submissions.find({ studentId });

    return {
      totalSubmissions: submissions.length,
      unusualPatterns: this.detectCheating(submissions),
      recommendations: [],
    };
  }

  /**
   * 부정행위 감지
   */
  private detectCheating(submissions: Submission[]): CheatingIndicator[] {
    const indicators: CheatingIndicator[] = [];

    // 패턴 1: 너무 빨리 푸는 경우
    for (let i = 0; i < submissions.length - 1; i++) {
      const timeDiff = submissions[i + 1].createdAt.getTime() -
                      submissions[i].createdAt.getTime();

      if (timeDiff < 3000) { // 3초 이내 = 의심스러움
        indicators.push({
          type: 'TOO_FAST',
          severity: 'HIGH',
          submission: submissions[i],
          message: 'Solution submitted suspiciously fast',
        });
      }
    }

    // 패턴 2: 정확히 같은 코드 (복사?)
    const codeGroups = new Map<string, Submission[]>();
    submissions.forEach(sub => {
      const normalized = this.normalizeCode(sub.code);
      if (!codeGroups.has(normalized)) {
        codeGroups.set(normalized, []);
      }
      codeGroups.get(normalized)!.push(sub);
    });

    codeGroups.forEach((subs, code) => {
      if (subs.length > 1) {
        indicators.push({
          type: 'DUPLICATE_CODE',
          severity: 'HIGH',
          submissions: subs,
          message: 'Identical code submitted multiple times',
        });
      }
    });

    return indicators;
  }
}
```

**Step 2: 샌드박스 실행 (Sandboxed Execution)**

```typescript
// backend/src/services/CodeSandboxService.ts
class CodeSandboxService {
  /**
   * Pyodide 또는 WebAssembly를 사용한 안전한 코드 실행
   * (또는 Docker 컨테이너 격리)
   */
  async executeInSandbox(code: string, language: string): Promise<Output> {
    // 옵션 1: Pyodide (Python 용)
    if (language === 'python') {
      return await this.executePython(code);
    }

    // 옵션 2: Node VM (JavaScript 용)
    if (language === 'javascript') {
      return await this.executeJavaScript(code);
    }

    // 옵션 3: Docker (안전성 최고)
    if (language === 'java' || language === 'cpp') {
      return await this.executeInDocker(code, language);
    }

    throw new Error(`Unsupported language: ${language}`);
  }

  private async executePython(code: string): Promise<Output> {
    try {
      const worker = new Worker('pyodide-worker.js');

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          worker.terminate();
          reject(new Error('Execution timeout (5 seconds)'));
        }, 5000);

        worker.onmessage = (event) => {
          clearTimeout(timeout);
          worker.terminate();
          resolve(event.data);
        };

        worker.postMessage({ code });
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: '',
      };
    }
  }

  private async executeInDocker(
    code: string,
    language: string
  ): Promise<Output> {
    // Docker 이미지를 사용해 격리된 환경에서 실행
    const container = await this.docker.createContainer({
      Image: `code-sandbox-${language}:latest`,
      Cmd: ['sh', '-c', code],
      Memory: 256 * 1024 * 1024, // 256MB 제한
      MemorySwap: 256 * 1024 * 1024,
      Timeout: 5000, // 5초 타임아웃
    });

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    // ... 결과 수집 ...

    await container.remove();

    return output;
  }
}
```

**Step 3: API 엔드포인트**

```typescript
// backend/src/routes/validation.ts
/**
 * POST /api/missions/submit
 * 클라이언트: 코드만 전송
 * 서버: 검증, 실행, 채점 후 결과 반환
 */
router.post(
  '/api/missions/:missionId/submit',
  authenticateUser,
  rateLimit('5 per minute'), // 1분에 5개까지만
  async (req, res) => {
    const { studentId } = req.user;
    const { missionId } = req.params;
    const { code } = req.body;

    try {
      // 1. 코드 검증
      const result = await codeValidationService.validateCodeOnServer(
        code,
        missionId,
        studentId
      );

      // 2. 감시/감시 로직
      await auditService.recordSubmission(studentId, missionId, code);

      // 3. 부정행위 감지
      if (auditService.isCheatingSuspected(studentId)) {
        logger.warn(`Potential cheating by ${studentId}`);
        // 선택: 경고, 또는 자동 제출 중지
      }

      // 4. 응답
      res.json({
        success: result.passed,
        message: result.message,
        points: result.points,
        feedback: result.feedback,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server validation failed',
      });
    }
  }
);
```

#### 구현 체크리스트
- [ ] CodeValidationService 작성
- [ ] 서버 사이드 검증 로직 구현
- [ ] 부정행위 감지 로직 구현
- [ ] 샌드박스 실행 환경 설정
- [ ] `/api/missions/:missionId/submit` 엔드포인트 작성
- [ ] Rate Limiting 설정 (1분 5회)
- [ ] 감시(Audit) 로깅 구현
- [ ] E2E 테스트: 부정행위 감지 확인

**예상 소요 시간**: 3주
**복잡도**: 높음

---

### 3️⃣ 확장성 (Scalability & Data-Driven Design)

#### 문제 상세 분석
```
❌ 현재 구조:
story.html (728줄)
  ├─ runStep1() { if (code.includes('int loan') ... }
  ├─ runStep2() { if (code.includes('double interestRate') ... }
  └─ runStep3() { if (code.includes('(int)') ... }

에피소드 100개 = story_ep1.html, story_ep2.html, ..., story_ep100.html
변경 요청: "로그인 버튼을 위로 옮겨줘"
→ 100개 파일 수정 필요 😱
```

#### 해결 방안 (Data-Driven Architecture)

**Step 1: 데이터 모델 정의**

```typescript
// shared/types/Episode.ts
export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'java' | 'python' | 'cpp';
  points: number;
  timeLimit: number; // 초

  // 코드 검증
  validationPatterns: string[]; // 정규식
  testCases: TestCase[];

  // 교육 콘텐츠
  template: string; // 기본 코드 템플릿
  dialogue: DialogueSegment[];
  hints: string[];

  // 피드백
  successMessage: string;
  failureMessages: Map<string, string>;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  episodeNumber: number;
  theme: string; // "너굴의 빚", "섬 개발", etc
  missions: Mission[];
  storySequence: StoryScene[];
  rewards: Badge[];
}

// 예시 데이터
export const EPISODE_1: Episode = {
  id: 'ep_1',
  title: '너굴의 빚',
  episodeNumber: 1,
  theme: 'bank_system',
  missions: [
    {
      id: 'mission_1_1',
      title: '변수 선언',
      description: '너굴의 빚을 정수형으로 선언하세요',
      difficulty: 'beginner',
      language: 'java',
      points: 500,
      timeLimit: 600,
      validationPatterns: [
        '\\bint\\s+loan\\s*=\\s*49800\\b',
        '\\bint\\s+loan\\b',
        '49800',
      ],
      testCases: [
        {
          input: '',
          expectedOutput: 'loan = 49800',
          description: '변수 선언 확인',
        },
      ],
      template: `public class BankSystem {
    public static void main(String[] args) {
        // 여기에 코드를 작성하세요
    }
}`,
      dialogue: [
        {
          character: 'Nook',
          text: '어라, 계산기가 없네! 내 빚을 저장할 수 있는 변수를 만들어줄 래?',
          emotion: 'curious',
        },
      ],
      hints: ['정수형은 int입니다', '변수명은 loan입니다'],
      successMessage: '✅ 성공! int 타입을 올바르게 사용했습니다.',
      failureMessages: new Map([
        ['MISSING_TYPE', '❌ int 타입이 필요합니다'],
        ['WRONG_VALUE', '❌ 값이 49800이어야 합니다'],
      ]),
    },
    // ... 더 많은 미션
  ],
  storySequence: [
    {
      type: 'dialogue',
      character: 'Nook',
      text: '공짜는 없다구리!',
    },
  ],
  rewards: [
    {
      id: 'bell_100',
      name: '100벨',
      icon: '🔔',
    },
  ],
};
```

**Step 2: 데이터 기반 React 컴포넌트**

```typescript
// frontend/src/components/StoryEngine/StoryEngine.tsx
interface StoryEngineProps {
  episode: Episode;
  studentId: string;
}

export const StoryEngine: React.FC<StoryEngineProps> = ({
  episode,
  studentId,
}) => {
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const mission = episode.missions[currentMissionIndex];

  return (
    <div className="story-engine">
      {/* 모든 렌더링이 데이터로부터 자동 생성 */}
      <StoryHeader episode={episode} />
      <MissionPanel
        mission={mission}
        onSubmit={handleSubmitCode}
      />
      <CodeEditor
        template={mission.template}
        language={mission.language}
      />
      <ValidationResult mission={mission} />
    </div>
  );
};
```

**Step 3: 데이터 저장소 (Database)**

```typescript
// backend/src/data/episodes.ts
// 또는 MongoDB 컬렉션

export const EPISODES: Episode[] = [
  EPISODE_1,
  EPISODE_2,
  // ... Episode 100개
];

// API
router.get('/api/episodes/:episodeId', async (req, res) => {
  const episode = await db.episodes.findOne({
    id: req.params.episodeId,
  });
  res.json({ success: true, data: episode });
});

router.get('/api/missions/:missionId', async (req, res) => {
  const mission = await db.missions.findOne({
    id: req.params.missionId,
  });
  res.json({ success: true, data: mission });
});
```

**Step 4: 엑셀/CMS 통합 (최종 목표)**

```
엑셀 (스프레드시트)
  ↓ (자동 변환)
JSON
  ↓ (API)
Backend DB
  ↓ (API)
Frontend React
  ↓
사용자 화면
```

기획자가 엑셀에서 직접 미션 데이터를 수정하면, 자동으로 게임에 반영되는 구조.

#### 구현 체크리스트
- [ ] Episode/Mission 데이터 타입 정의
- [ ] EPISODE_1 데이터 마이그레이션 (JSON)
- [ ] StoryEngine 리액트 컴포넌트 작성
- [ ] `/api/episodes/:episodeId` 엔드포인트 작성
- [ ] `/api/missions/:missionId` 엔드포인트 작성
- [ ] 데이터 검증 스키마 설정 (Zod/Yup)
- [ ] E2E 테스트: 여러 에피소드 렌더링 확인

**예상 소요 시간**: 2주
**복잡도**: 중

---

### 4️⃣ 통합 아키텍처 (Unified Architecture)

#### 문제 상세 분석
```
현재:
┌─────────────────────┐
│   Backend (Node)    │
│  ├─ API Routes      │
│  ├─ Auth            │
│  └─ Rate Limiter    │
└─────────────────────┘
         ↕ (느슨한 연결)
┌─────────────────────┐
│  Frontend (React)   │
│  ├─ LoginPage       │
│  ├─ MainPage        │
│  └─ story.html 🚩   │
└─────────────────────┘

문제: story.html이 독자적으로 동작
```

#### 해결 방안

**Step 1: story.html → React 컴포넌트 이동**

```typescript
// frontend/src/pages/StoryPage.tsx
interface StoryPageProps {
  episodeId: string;
}

/**
 * 기존: story.html (Vanilla JS 728줄)
 * 변경: StoryPage.tsx (React 컴포넌트)
 *
 * 이제 store, auth, API가 자연스럽게 연결됨
 */
export const StoryPage: React.FC<StoryPageProps> = ({ episodeId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const { episode, loading } = useSelector(selectEpisode);

  useEffect(() => {
    // 백엔드에서 에피소드 데이터 로드
    dispatch(fetchEpisode(episodeId));
  }, [episodeId, dispatch]);

  if (loading) return <LoadingSpinner />;

  return (
    <StoryContainer>
      <StoryHeader episode={episode} />
      <ProgressBar episode={episode} />
      <StoryEngine
        episode={episode}
        studentId={user.id}
        onMissionComplete={() => dispatch(saveMissionCompletion())}
      />
    </StoryContainer>
  );
};
```

**Step 2: 상태 관리 통합 (Redux)**

```typescript
// frontend/src/store/slices/storySlice.ts
export const storySlice = createSlice({
  name: 'story',
  initialState: {
    episode: null,
    currentMissionIndex: 0,
    completedMissions: [],
    points: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentMission(state, action) {
      state.currentMissionIndex = action.payload;
    },
    completeMission(state, action) {
      state.completedMissions.push(action.payload);
      state.points += action.payload.points;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEpisode.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEpisode.fulfilled, (state, action) => {
        state.episode = action.payload;
        state.loading = false;
      });
  },
});

export const submitCode = createAsyncThunk(
  'story/submitCode',
  async (
    { missionId, code }: { missionId: string; code: string },
    { getState }
  ) => {
    const { auth } = getState() as RootState;

    // 백엔드 API 호출
    const response = await api.post(
      `/missions/${missionId}/submit`,
      { code },
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );

    return response.data;
  }
);
```

**Step 3: 인증 연결**

```typescript
// 이제 로그인한 사용자만 story.html에 접근 가능
router.get('/story/:episodeId', authRequired, (req, res) => {
  const { episodeId } = req.params;
  const { user } = req;

  // 사용자의 진행 상황과 함께 렌더
  res.render('story', {
    episodeId,
    userId: user.id,
    userName: user.name,
  });
});
```

**Step 4: 아키텍처 통합도**

```
┌──────────────────────────────────┐
│        Frontend (React)           │
├──────────────────────────────────┤
│  LoginPage │ MainPage │ StoryPage│
│     ↓          ↓           ↓      │
│  Redux Store (통합 상태)          │
│  ├─ auth                         │
│  ├─ story                        │
│  ├─ progression                  │
│  └─ ui                           │
└────────────┬─────────────────────┘
             │ API 호출
┌────────────▼─────────────────────┐
│     Backend (Express.js)         │
├──────────────────────────────────┤
│  ├─ /api/auth/*                  │
│  ├─ /api/episodes/*              │
│  ├─ /api/missions/*/submit       │
│  ├─ /api/progression/*           │
│  └─ Validation, Sandbox, Audit   │
└──────────────────────────────────┘
             │
┌────────────▼─────────────────────┐
│     Database (PostgreSQL)        │
├──────────────────────────────────┤
│  ├─ users                        │
│  ├─ episodes                     │
│  ├─ missions                     │
│  ├─ progressions                 │
│  └─ submissions (audit)          │
└──────────────────────────────────┘
```

#### 구현 체크리스트
- [ ] StoryPage React 컴포넌트 작성
- [ ] Redux slice 생성 (storySlice)
- [ ] API 통합 middleware 작성
- [ ] 인증 미들웨어 연결
- [ ] localStorage ↔ Redux ↔ Backend 동기화
- [ ] E2E 테스트: 전체 흐름 테스트

**예상 소요 시간**: 1주
**복잡도**: 중상

---

## 📅 전체 로드맵 일정

### Timeline: 8주

```
Week 1-2: 데이터 지속성
  ├─ localStorage 구현
  ├─ Backend 엔드포인트
  └─ 동기화 로직

Week 2-4: 서버 사이드 검증
  ├─ CodeValidationService
  ├─ 샌드박스 환경
  └─ 부정행위 감지

Week 3-4: 데이터 기반 설계
  ├─ Episode/Mission 모델
  ├─ StoryEngine 컴포넌트
  └─ 데이터 마이그레이션

Week 5: 통합 아키텍처
  ├─ React 통합
  ├─ Redux 연결
  └─ E2E 테스트

Week 6-8: 테스트 & 배포
  ├─ 전체 E2E 테스트
  ├─ 성능 최적화
  ├─ 보안 감사
  └─ 프로덕션 배포
```

### Gantt Chart

```
데이터 지속성      [████████]
서버 검증          [  ████████████]
데이터 설계            [████████]
통합 아키텍처              [████]
테스트 & 배포                [████████]

Week: 1  2  3  4  5  6  7  8
```

---

## 🎯 우선순위 정렬 (MoSCoW)

### MUST (필수)
- [x] 데이터 지속성 (localStorage)
- [x] 서버 사이드 검증
- [x] 부정행위 감지

### SHOULD (권장)
- [ ] 데이터 기반 설계
- [ ] 통합 아키텍처
- [ ] Redux 연결

### COULD (선택)
- [ ] CMS 통합
- [ ] 다언어 지원
- [ ] 고급 분석 대시보드

### WON'T (제외)
- 지금은 하지 않음: 모바일 앱, 오프라인 모드, 멀티플레이

---

## 📊 성과 지표 (Success Metrics)

### 구현 후 달성 목표

| 지표 | 현재 | 목표 | 측정 |
|------|------|------|------|
| 데이터 유지율 | 0% | 100% | "F5 후 진행도 유지" |
| 검증 신뢰도 | 낮음 | 높음 | "부정행위 감지율" |
| 확장성 | 선형 | 로그 | "에피소드 추가 시간" |
| API 통합도 | 30% | 100% | "API 활용율" |
| 시스템 안정성 | - | 99.9% | "가용성" |

---

## 🚀 다음 액션 아이템

### 즉시 (이번 주)
- [ ] 이 문서 팀 검토
- [ ] 우선순위 확정
- [ ] Sprint 계획 (1주 = 1 Sprint)

### 단기 (1주)
- [ ] Sprint 1: PersistenceService 구현
- [ ] localStorage 저장/복원 로직

### 중기 (2-4주)
- [ ] Sprint 2-3: 서버 사이드 검증
- [ ] CodeValidationService + 샌드박스

### 장기 (5-8주)
- [ ] Sprint 4-5: 데이터 기반 설계
- [ ] Sprint 6-8: 통합 & 배포

---

## 📚 참고 자료

- [Redux Patterns](https://redux.js.org/usage/structuring-reducers)
- [Server-Side Validation Best Practices](https://owasp.org/)
- [Data-Driven UI](https://medium.com/design-systems-monthly)
- [Sandboxing Code Execution](https://nodejs.org/en/docs/guides/running-jest-in-isolated-vm/)

---

**상태**: 설계 완료, 승인 대기
**다음**: 팀 리뷰 → 우선순위 확정 → Sprint 계획
