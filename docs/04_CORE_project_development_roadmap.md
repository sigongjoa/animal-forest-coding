# 너굴 코딩 플랫폼 - 프로젝트 개발 로드맵

## 📋 개요

이 문서는 **"내 코드가 게임 세상에 영향을 미치는"** 너굴 코딩 플랫폼을 구축하기 위한 **6개월 개발 로드맵**을 제시합니다.

총 4개 Phase, 12개 Sprint로 구성되며, 각 Phase는 구체적인 마일스톤과 DoD를 가집니다.

---

## 🎯 프로젝트 비전 & 목표

### 비전
**"학생들이 직접 작성한 Java 코드로 동물의 숲 게임 세상을 조작하는 체험형 코딩 교육 플랫폼"**

### 전략적 목표

| 순번 | 목표 | 성과 지표 |
|------|------|---------|
| 1 | 코드-게임 루프 구축 | 코드 실행 → 게임 상태 변경 100% 자동화 |
| 2 | 학습 효과 극대화 | 학생 만족도 4.5/5 이상 |
| 3 | 확장성 있는 아키텍처 | 새로운 미션 추가 < 1시간 |
| 4 | 안정적인 운영 | 가용성 99.9%, 오류 자동 감지 |

---

## 📅 전체 로드맵 타임라인

```
Phase 1: MVP 기초 인프라 (2주)
  ├─ Sprint 1: 코드 실행 엔진
  └─ Sprint 2: 기본 게임 상태

Phase 2: 게임 시스템 확충 (3주)
  ├─ Sprint 3: 게임 렌더러
  ├─ Sprint 4: 대화 시스템
  └─ Sprint 5: 게임 기계치

Phase 3: 스토리라인 & 콘텐츠 (2주)
  ├─ Sprint 6: 콘텐츠 데이터
  └─ Sprint 7: 스토리 구현

Phase 4: 출시 & 운영 (2주)
  ├─ Sprint 8: 성능 최적화
  ├─ Sprint 9: 보안 강화
  └─ Sprint 10: 모니터링 & 배포

총 기간: 9주
버퍼: 1주 (예비)
출시: 10주차
```

---

## Phase 1️⃣: MVP 기초 인프라 (Week 1-2)

### 목표
"학생의 코드를 실행하고, 게임 상태를 관리할 수 있는가?"

### Phase 1 범위

```
✅ 완료 예정:
- 백엔드 코드 실행 API (Java 미지원, JS만)
- 프론트엔드 IDE 윈도우 (이미 구현됨)
- Redux 게임 상태 관리
- 3개 기초 미션 (변수, 조건문, 루프)
- 기본 게임 브릿지 (Bells 변경)

❌ 제외:
- TileGrid 렌더러
- 완전한 스토리라인
- 정적 분석
```

### Sprint 1: 코드 실행 엔진 (Week 1)

#### 목표: 백엔드에서 Java/JS 코드를 실행하고 결과를 반환

#### 기술 스택
- 백엔드: Node.js + Express
- 언어: JavaScript (Phase 2에서 Java 추가)
- 컴파일러: Babel (JavaScript)

#### 구현 항목

| # | 항목 | 우선순위 | 담당 |
|---|------|---------|------|
| 1.1 | ExecutionService 작성 | 높음 | Backend |
| 1.2 | CodeValidator 작성 | 높음 | Backend |
| 1.3 | GameBridge 기초 | 높음 | Backend |
| 1.4 | `/api/code/execute` 엔드포인트 | 높음 | Backend |
| 1.5 | IDE ↔ Backend 연동 | 높음 | Frontend |
| 1.6 | 테스트 작성 (45개 테스트) | 중간 | Backend |

#### 상세 작업 계획

**1.1 ExecutionService.ts** (1일)
```typescript
// backend/src/services/CodeExecutionService.ts
export async function executeCode(
  code: string,
  testCases: TestCase[]
): Promise<ExecutionResult> {
  try {
    // 1. Babel로 코드 파싱 및 변환
    const compiled = await compileCode(code);

    // 2. VM2 또는 Node VM에서 실행
    const results = await Promise.all(
      testCases.map(tc => runTest(compiled, tc))
    );

    return {
      success: true,
      output: results,
      executionTime: Date.now()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: null
    };
  }
}
```

**테스트 케이스**:
```typescript
describe('ExecutionService', () => {
  test('should execute simple variable assignment', async () => {
    const result = await executeCode('let x = 10;', []);
    expect(result.success).toBe(true);
  });

  test('should handle syntax errors', async () => {
    const result = await executeCode('let x = ;', []);
    expect(result.success).toBe(false);
  });

  // ... 총 10개 테스트
});
```

**1.2 CodeValidator.ts** (1일)
```typescript
// backend/src/services/CodeValidatorService.ts
export function validateCode(
  code: string,
  rules: CodeRule[]
): ValidationResult {
  const ast = parse(code);

  const results = rules.map(rule => ({
    name: rule.name,
    passed: rule.validator(ast)
  }));

  return {
    allPassed: results.every(r => r.passed),
    results
  };
}
```

**1.3 GameBridge.ts** (1일)
```typescript
// backend/src/services/GameBridgeService.ts
export async function bridgeCodeToGame(
  executionResult: ExecutionResult,
  missionId: string
): Promise<GameStateUpdate> {
  const update: GameStateUpdate = {};

  // 미션별 게임 효과 매핑
  if (missionId === 'm_01_variables') {
    update.bells = 5000;  // 성공시 5000 벨
  }

  return update;
}
```

**1.4 API 엔드포인트** (1일)
```typescript
// backend/src/routes/codeRoutes.ts
router.post('/api/code/execute', async (req, res) => {
  const { code, testCases, missionId } = req.body;

  const executionResult = await executeCode(code, testCases);
  const gameUpdate = await bridgeCodeToGame(executionResult, missionId);

  res.json({
    success: executionResult.success,
    output: executionResult.output,
    gameUpdate
  });
});
```

**1.5 Frontend 연동** (1일)
```typescript
// frontend/src/services/codeAPI.ts
export async function runCode(
  code: string,
  missionId: string
): Promise<CodeExecutionResult> {
  const response = await fetch('http://localhost:5000/api/code/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      missionId,
      testCases: MISSIONS[missionId].testCases
    })
  });

  return response.json();
}
```

#### DoD (Sprint 1)
- [ ] ExecutionService 구현 완료
- [ ] CodeValidator 구현 완료
- [ ] 45개 단위 테스트 통과 (100% 커버리지)
- [ ] 12개 통합 테스트 통과
- [ ] 코드 리뷰 승인
- [ ] ESLint/TypeScript 통과
- [ ] Swagger 문서 작성

#### 위험 요소 & 대응
| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| Java 컴파일 복잡도 | 중간 | 높음 | Phase 1은 JS만 구현, Phase 2에 Java 미룬다 |
| 보안 (코드 실행) | 높음 | 높음 | VM2 격리, 타임아웃(5초), 리소스 제한 |
| 성능 (컴파일) | 낮음 | 중간 | 캐싱 도입 (Phase 2) |

---

### Sprint 2: 기본 게임 상태 & 미션 (Week 2)

#### 목표: Redux 상태 관리 & 3개 기초 미션 구현

#### 기술 스택
- Redux Toolkit
- React 컴포넌트

#### 구현 항목

| # | 항목 | 우선순위 | 담당 |
|---|------|---------|------|
| 2.1 | Redux Store 초기화 | 높음 | Frontend |
| 2.2 | economySlice (Bells) | 높음 | Frontend |
| 2.3 | progressSlice | 높음 | Frontend |
| 2.4 | MissionSelector 컴포넌트 | 높음 | Frontend |
| 2.5 | 3개 기초 미션 콘텐츠 | 높음 | Content |
| 2.6 | E2E 테스트 | 중간 | QA |

#### 상세 작업 계획

**2.1 Redux Store**:
```typescript
// frontend/src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import economyReducer from './slices/economySlice';
import progressReducer from './slices/progressSlice';

export const store = configureStore({
  reducer: {
    economy: economyReducer,
    progress: progressReducer
  }
});
```

**2.2 economySlice**:
```typescript
export const economySlice = createSlice({
  name: 'economy',
  initialState: { bells: 0 },
  reducers: {
    addBells: (state, action) => {
      state.bells += action.payload;
    }
  }
});
```

**2.5 미션 콘텐츠**:
```json
[
  {
    "id": "m_01_variables",
    "title": "변수 선언",
    "testCases": [
      { "input": [], "expectedOutput": 10 }
    ]
  },
  {
    "id": "m_02_conditionals",
    "title": "조건문"
  },
  {
    "id": "m_03_loops",
    "title": "루프"
  }
]
```

#### DoD (Sprint 2)
- [ ] Redux Store 완성
- [ ] economySlice 완성
- [ ] progressSlice 완성
- [ ] MissionSelector 컴포넌트 완성
- [ ] 3개 미션 콘텐츠 완성
- [ ] E2E 테스트 5개 통과
- [ ] 전체 통합 테스트 통과

---

### Phase 1 Summary

| 지표 | 목표 | 예상 결과 |
|------|------|---------|
| 구현된 기능 | 코드 실행 + 기본 상태 | ✅ 100% |
| 단위 테스트 | 80%+ 커버리지 | ✅ 95% |
| E2E 테스트 | 주요 경로 | ✅ 5개 통과 |
| API 응답 | < 500ms | ✅ 예상 300ms |
| 미션 수 | 3개 | ✅ 3개 |

---

## Phase 2️⃣: 게임 시스템 확충 (Week 3-5)

### 목표
"게임 세상이 보이고, 주민과 대화할 수 있는가?"

### Phase 2 범위

```
✅ 구현 예정:
- TileGridRenderer (2D 배열 시각화)
- DialogueOverlay (캐릭터 대화)
- EnvironmentSystem (시간/날씨)
- GameEventSystem (코드 결과 → 게임 효과)
- 6개 추가 미션 (총 9개)

🔧 개선:
- Java 코드 컴파일 지원 (CheerpJ 또는 백엔드)
- 정적 분석 기초
```

### Sprint 3: 타일 그리드 렌더러 (Week 3)

#### 목표: 2D 배열 지도 렌더링

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 3.1 | TileGridRenderer 컴포넌트 | Frontend |
| 3.2 | Tile 데이터 구조 | Frontend |
| 3.3 | Grid 클릭 이벤트 | Frontend |
| 3.4 | worldSlice Redux | Frontend |
| 3.5 | E2E 테스트 | QA |

#### 구현 코드

```typescript
// frontend/src/components/TileGridRenderer.tsx
export const TileGridRenderer: React.FC = () => {
  const tiles = useSelector(state => state.world.tiles);
  const dispatch = useDispatch();

  const handleTileClick = (x: number, y: number) => {
    dispatch(removeTile({ x, y })); // 잡초 제거
  };

  return (
    <div className="grid-container">
      {tiles.map((row, y) =>
        row.map((tile, x) => (
          <Tile
            key={`${x}-${y}`}
            type={tile.type}
            onClick={() => handleTileClick(x, y)}
          />
        ))
      )}
    </div>
  );
};
```

#### DoD (Sprint 3)
- [ ] TileGridRenderer 구현 완료
- [ ] 성능 (80x80 그리드 < 100ms 렌더링)
- [ ] 모바일 반응형
- [ ] 테스트 20개 통과

---

### Sprint 4: 대화 시스템 (Week 4)

#### 목표: NPC와 대화하기

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 4.1 | DialogueOverlay 컴포넌트 | Frontend |
| 4.2 | 대화 데이터 스키마 | Content |
| 4.3 | 캐릭터 이미지/애니메이션 | Design |
| 4.4 | 타이핑 효과 | Frontend |

#### 대화 데이터 예시

```json
{
  "id": "isabelle_welcome",
  "character": "isabelle",
  "lines": [
    {
      "text": "환영합니다!",
      "emotion": "happy"
    },
    {
      "text": "코드로 섬을 만들어봅시다!",
      "emotion": "excited"
    }
  ]
}
```

#### DoD (Sprint 4)
- [ ] DialogueOverlay 구현
- [ ] 5개 대화 시나리오 추가
- [ ] 타이핑 효과 부드럽게
- [ ] 테스트 15개 통과

---

### Sprint 5: 게임 기계치 & 미션 확충 (Week 5)

#### 목표: 환경 시스템 + 6개 추가 미션

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 5.1 | EnvironmentSystem (시간/날씨) | Frontend |
| 5.2 | GameEventSystem | Backend |
| 5.3 | 6개 추가 미션 콘텐츠 | Content |
| 5.4 | 통합 테스트 | QA |

#### 미션 리스트 (총 9개)

| 미션 | 개념 | 난도 |
|------|------|------|
| m_01 | 변수 | 쉬움 |
| m_02 | 조건문 | 쉬움 |
| m_03 | 루프 | 쉬움 |
| m_04 | 배열 (고정) | 쉬움 |
| m_05 | 함수 | 중간 |
| m_06 | ArrayList | 중간 |
| m_07 | 2D 배열 | 중간 |
| m_08 | 객체지향 | 어려움 |
| m_09 | 예외 처리 | 어려움 |

#### DoD (Phase 2)
- [ ] TileGridRenderer 완성
- [ ] DialogueOverlay 완성
- [ ] EnvironmentSystem 완성
- [ ] 9개 미션 모두 구현
- [ ] E2E 테스트 15개 통과
- [ ] 성능 지표 통과 (응답 < 500ms)

---

## Phase 3️⃣: 스토리라인 & 고도화 (Week 6-7)

### 목표
"게임이 흐르는 이야기를 가지고 있는가?"

### Phase 3 범위

```
✅ 구현 예정:
- 전체 스토리라인 (너굴 빚 → 섬 테라포밍 → ...)
- 고급 게임 메커니즘 (친밀도, 경제 시뮬레이션)
- 정적 분석 완성 (AST 기반 검증)
- 성능 최적화

🎨 개선:
- UI/UX 디자인 고도화
- 캐릭터 상호작용 확대
```

### Sprint 6: 스토리 통합 (Week 6)

#### 목표: 모든 미션이 통일된 이야기로 연결

#### 스토리라인 개요

```
Act 1: 도착 (m_01-03)
└─ 너굴: "빚을 졌어요!" (500,000 벨)

Act 2: 첫 수입 (m_04-06)
└─ 낚시, 채집으로 벨 모으기
└─ 친구들과 거래

Act 3: 섬 개발 (m_07-09)
└─ 2D 배열로 지형 설계
└─ 구조물 건설
└─ 섬의 가치 증대

Ending: 빚 상환
└─ 너굴: "멋진 섬이 됐어요!"
```

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 6.1 | 스토리 데이터 작성 | Content |
| 6.2 | 스토리 트리거 로직 | Backend |
| 6.3 | 스토리 UI | Frontend |
| 6.4 | 통합 테스트 | QA |

#### DoD (Sprint 6)
- [ ] 전체 스토리라인 완성
- [ ] 모든 미션이 스토리와 연결
- [ ] 스토리 E2E 테스트 통과
- [ ] 스토리 데이터 완성도 100%

---

### Sprint 7: 고도화 & 최적화 (Week 7)

#### 목표: 성능, 보안, 안정성 향상

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 7.1 | 정적 분석 완성 | Backend |
| 7.2 | 캐싱 (Redis) | Backend |
| 7.3 | 번들 최적화 | Frontend |
| 7.4 | 보안 감사 | DevOps |
| 7.5 | 부하 테스트 | QA |

#### DoD (Phase 3)
- [ ] 스토리라인 완성도 100%
- [ ] 정적 분석 정확도 90%+
- [ ] 응답 시간 < 300ms
- [ ] 번들 크기 < 1MB (gzip)
- [ ] 보안 취약점 0개 (Critical)
- [ ] 부하 테스트 (100 동시 사용자) 통과

---

## Phase 4️⃣: 출시 & 운영 (Week 8-9)

### 목표
"안정적으로 운영할 수 있는 플랫폼인가?"

### Phase 4 범위

```
✅ 구현 예정:
- 성능 최적화
- 보안 강화
- 모니터링 & 로깅
- 배포 자동화
- 사용자 문서

🎯 출시 준비:
- 최종 QA
- 릴리스 노트
- 사용자 교육
```

### Sprint 8: 성능 최적화 (Week 8)

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 8.1 | 프론트엔드 번들 분석 | Frontend |
| 8.2 | 이미지 최적화 | Frontend |
| 8.3 | API 캐싱 | Backend |
| 8.4 | 데이터베이스 인덱스 | Backend |
| 8.5 | CDN 설정 | DevOps |

#### 성능 목표

| 지표 | 현재 (예상) | 목표 |
|------|-----------|------|
| 초기 로드 시간 | 3.5s | < 2.5s |
| API 응답 (p95) | 400ms | < 200ms |
| 번들 크기 | 1.2MB | < 900KB |
| Lighthouse Score | 75 | > 90 |

---

### Sprint 9: 보안 & 모니터링 (Week 9)

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 9.1 | SSL/TLS 인증서 | DevOps |
| 9.2 | 환경 변수 관리 | DevOps |
| 9.3 | Sentry 통합 | Backend |
| 9.4 | 성능 모니터링 (Datadog) | DevOps |
| 9.5 | 알림 규칙 설정 | DevOps |
| 9.6 | 최종 보안 감사 | Security |

#### 보안 체크리스트
- [ ] 환경 변수 (.env) 안전
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] CSRF 토큰 확인
- [ ] 레이트 리미팅 활성화
- [ ] 로그인 재시도 제한
- [ ] 패스워드 해싱 (bcrypt)

---

### Sprint 10: 최종 출시 (Week 10)

#### 구현 항목
| # | 항목 | 담당 |
|---|------|------|
| 10.1 | 최종 QA | QA |
| 10.2 | 릴리스 노트 작성 | Content |
| 10.3 | 사용자 가이드 | Content |
| 10.4 | 배포 (프로덕션) | DevOps |
| 10.5 | 배포 후 모니터링 | DevOps |

#### 배포 체크리스트
- [ ] 모든 테스트 통과
- [ ] 성능 지표 확인
- [ ] 모니터링 활성화
- [ ] 롤백 계획 수립
- [ ] 알림 채널 준비
- [ ] 팀 준비

#### DoD (Phase 4)
- [ ] 모든 기능 완성도 100%
- [ ] 테스트 커버리지 > 85%
- [ ] 성능 지표 달성
- [ ] 보안 감사 통과
- [ ] 배포 완료
- [ ] 모니터링 1주일 안정적

---

## 📊 주간 진행도 추적 (Burndown Chart 템플릿)

```
Week 1:
├─ Sprint 1 Work Items: 15개
├─ Completed: 12개 (80%)
├─ Remaining: 3개
└─ 상태: 진행 중, 일정 내

Week 2:
├─ Sprint 1+2 Work Items: 25개
├─ Completed: 22개 (88%)
├─ Remaining: 3개 (마이그레이션 지연)
└─ 상태: 진행 중, 약간 지연

...

Week 9-10:
├─ Phase 4 Work Items: 20개
├─ Completed: 20개 (100%)
├─ Remaining: 0개
└─ 상태: 완료, 출시 준비
```

---

## 🎯 릴리스 버전 전략

### Semantic Versioning (SemVer)

```
v0.1.0-alpha   (Week 2) - MVP 알파
v0.2.0-beta    (Week 5) - 게임 시스템 베타
v0.9.0-rc1     (Week 8) - 출시 후보 1
v1.0.0         (Week 10) - 정식 출시
```

### 버전별 기능

| 버전 | 기능 | 미션 수 | 상태 |
|------|------|--------|------|
| 0.1.0-alpha | 코드 실행, 기본 상태 | 3개 | 개발중 |
| 0.2.0-beta | 게임 렌더링, 대화 | 9개 | 개발중 |
| 0.9.0-rc | 스토리라인, 최적화 | 9개 | 테스트 |
| 1.0.0 | 완전한 플랫폼 | 9개 | 출시 |

---

## 🚨 위험 관리 (Risk Register)

| # | 위험 | 확률 | 영향 | 점수 | 대응 |
|---|------|------|------|------|------|
| 1 | Java 컴파일 복잡도 | 중간 | 높음 | 7 | Phase 1은 JS만, Phase 2 Java 추가 |
| 2 | 코드 실행 보안 | 높음 | 높음 | 9 | VM2 격리, 타임아웃, 리뷰 |
| 3 | 성능 저하 | 중간 | 중간 | 6 | 조기 성능 테스트, 캐싱 |
| 4 | 스토리 완성도 | 낮음 | 높음 | 5 | Content 전문가 고용 |
| 5 | 배포 문제 | 낮음 | 높음 | 5 | 철저한 테스트, 롤백 계획 |

---

## 📋 리소스 할당

### 팀 구성 (권장)

| 역할 | 명수 | 책임 |
|------|------|------|
| 백엔드 엔지니어 | 1명 | 코드 실행 엔진, API |
| 프론트엔드 엔지니어 | 1명 | IDE, 게임 UI |
| DevOps/인프라 | 0.5명 | 배포, 모니터링 |
| QA | 1명 | 테스트, 품질 관리 |
| 콘텐츠 | 0.5명 | 미션, 스토리 |
| **총 인력** | **4명** | - |

### 예산 (3개월 기준)
```
월급: 4명 × $5,000 × 3개월 = $60,000
클라우드 인프라: $3,000/월 × 3 = $9,000
도구 & 라이선스: $2,000
총: ~$71,000
```

---

## 📈 성공 지표 (KPIs)

### Phase 별 성공 지표

| Phase | KPI | 목표 | 측정 방법 |
|-------|-----|------|---------|
| Phase 1 | 코드 실행 성공률 | 100% | 테스트 |
| Phase 1 | API 응답 시간 | < 500ms | 부하 테스트 |
| Phase 2 | 미션 완료율 | 80%+ | 사용자 테스트 |
| Phase 2 | 게임 성능 (FPS) | > 60fps | DevTools |
| Phase 3 | 전체 테스트 커버리지 | > 85% | Jest |
| Phase 4 | 배포 성공 | 100% | CI/CD |
| Phase 4 | 시스템 가용성 | > 99.5% | 모니터링 |

### 최종 목표 (출시 후)

| 지표 | 목표 |
|------|------|
| 사용자 만족도 | 4.5/5 |
| 월간 활성 사용자 | 1000+ |
| 코드 작성 시간 | 평균 15분 |
| 코드 실행 성공률 | 95%+ |
| 시스템 가용성 | 99.9% |

---

## 🔄 정기 리뷰 & 조정

### 주간 리뷰 (매주 금요일)
```
1. 완료한 작업 검토
2. Burn-down chart 확인
3. 병목 지점 파악
4. 위험 요소 검토
5. 다음주 계획 조정
```

### 2주 스프린트 리뷰 (Sprint 끝)
```
1. Sprint Goal 달성 여부
2. 모든 DoD 확인
3. 팀 회고 (Retrospective)
4. 다음 Sprint 계획
```

### 월간 Phase 리뷰
```
1. Phase 목표 달성도
2. 전체 로드맵 조정
3. 스코프 변경 논의
4. 다음 Phase 준비
```

---

## 📝 체크리스트 (프로젝트 시작 전)

- [ ] 팀 모집 완료
- [ ] 개발 환경 세팅 완료
- [ ] Git 저장소 생성
- [ ] CI/CD 파이프라인 구축
- [ ] 디자인 시스템 정의
- [ ] 데이터베이스 스키마 설계
- [ ] API 스펙 정의
- [ ] 모니터링 도구 선정
- [ ] 커뮤니케이션 채널 구성 (Slack, etc)
- [ ] 코드 리뷰 프로세스 정의
- [ ] DoD & Definition of Ready 승인

---

## 🎉 프로젝트 완료 후

### 1차 릴리스 후 계획

#### 단기 (1-2개월)
- 사용자 피드백 수집
- 버그 Hotfix
- 성능 최적화

#### 중기 (3-6개월)
- 새로운 미션 추가 (10-20개)
- 고급 기능 (멀티플레이, 리더보드)
- 모바일 앱 개발

#### 장기 (6개월+)
- 프로그래밍 언어 확대 (Python, C++)
- AI 기반 튜터링
- 글로벌 확장

