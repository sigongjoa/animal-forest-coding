# 너굴 코딩 플랫폼 - 종합 기술 & 운영 문서 인덱스

**Last Updated**: 2025-12-05
**Documentation Version**: 3.0 (Standardized Naming Convention)
**File Naming**: `[NUMBER]_[CATEGORY]_[description].md` (see [naming convention](00_INDEX_naming_convention.md))

## 📚 개요

이 인덱스는 너굴 코딩 플랫폼의 **성공적인 소프트웨어 개발**을 위한 모든 문서를 소개합니다.

### 📊 문서 구조
- **Core Documentation**: 기술 아키텍처, 테스트 전략, 로드맵
- **Phase Documentation**: 각 개발 단계별 완료 보고서 및 구현 가이드
- **Production Readiness**: CTO 리뷰 결과 및 프로덕션 배포 준비

---

## 📖 4가지 핵심 문서

### 1️⃣ 기술 아키텍처 및 필수 모듈 정의서
**파일**: `01_CORE_TECHNICAL_ARCHITECTURE.md`

#### 목적
"내 코드가 게임 세상에 영향을 미치는 시뮬레이션"을 구현하기 위해 선행되거나 병행 개발되어야 할 4가지 핵심 기술 영역을 정의

#### 포함 내용
1. **코드 실행 및 검증 엔진**
   - 코드 샌드박스 (3가지 선택지 비교)
   - 유효성 검사기 (정적/동적 분석)
   - 게임 브릿지 (코드 결과 → 게임 상태)
   - MVP 구현 전략

2. **게임 상태 관리 시스템**
   - 상태 관리 라이브러리 선택 가이드
   - 상태 스키마 (TypeScript 타입)
   - 경제 시스템 (돈, 이자)
   - 인벤토리 시스템 (배열 vs ArrayList 구분)
   - 월드 맵 (2D 배열 기반)

3. **핵심 게임 메커니즘**
   - 타일 그리드 렌더러 (2D 배열 시각화)
   - 대화 시스템 (NPC 상호작용)
   - 시간/날씨 시스템
   - 미션 실행 오케스트레이터

4. **콘텐츠 데이터 구조화**
   - 퀘스트/미션 스키마
   - 피드백 시스템
   - 대화 데이터 포맷
   - 실제 JSON 예시

#### 사용 대상
- 백엔드 엔지니어 (코드 실행 엔진 개발)
- 프론트엔드 엔지니어 (게임 시스템 구현)
- 아키텍트 (시스템 설계)
- 기술 리더 (의사결정)

#### 주요 다이어그램
```
Student Code (Java)
    ↓
[Execution Engine]
    ↓
Code Validation & Game Bridge
    ↓
Game State Update (Inventory, Friendship, etc.)
    ↓
Visual Rendering (Dialogue, Map, etc.)
```

---

### 2️⃣ 포괄적 테스트 전략 로드맵
**파일**: `02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md`

#### 목표
**"제대로 된 소프트웨어"**를 만들기 위해 필요한 테스트(QA)부터 배포 후 운영까지의 **모든 단계** 정리

#### 7단계 테스트 로드맵

| 단계 | 레벨 | 목표 | 주체 | 도구 |
|------|------|------|------|------|
| 1️⃣ | Code | "코드가 정상 작동?" | 개발자 | Jest, Pytest |
| 2️⃣ | System | "안정적, 빠르고, 안전?" | 자동화 | Playwright, k6 |
| 3️⃣ | Advanced | "수학적 무결성?" | 개발자 | fast-check |
| 4️⃣ | Product | "사용자가 만족?" | QA | Playwright, BrowserStack |
| 5️⃣ | DevOps | "안전한 배포?" | DevOps | GitHub Actions, ArgoCD |
| 6️⃣ | Operations | "문제를 빨리 알까?" | SRE | Sentry, Datadog |
| 7️⃣ | Docs | "유지보수 가능?" | 팀 | Swagger, Wiki |

#### 각 단계별 상세 내용

**1단계: 개발자 테스트 (Code Level)**
- 단위 테스트 (Unit Test)
- 통합 테스트 (Integration Test)
- 정적 분석 (ESLint, Pylint)

**2단계: 시스템 테스트 (System Level)**
- E2E 테스트 (사용자 시나리오)
- 성능 테스트 (응답 시간, 부하)
- 보안 스캔 (SAST, npm audit)

**3단계: 심화 논리 검증 (Advanced Logic)**
- 속성 기반 테스트 (Property-based)
- 데이터 무결성 테스트
- 엣지 케이스 검증

**4단계: QA 사용자 테스트 (Product Level)**
- 사용성 테스트 (Usability)
- 호환성 테스트 (다중 브라우저/기기)
- 탐색적 테스트 (자유로운 테스트)
- 시각적 회귀 (UI 깨짐 방지)

**5단계: 배포 자동화 (DevOps)**
- CI (지속적 통합)
- CD (지속적 배포)
- IaC (인프라 코드화)

**6단계: 모니터링 (Observability)**
- 에러 트래킹 (Sentry)
- 성능 모니터링 (APM)
- 사용자 분석 (Analytics)

**7단계: 문서화 (Documentation)**
- API 문서 (Swagger)
- README & Wiki
- 트러블슈팅 가이드

#### 실제 테스트 코드 예시 포함
```typescript
// Unit Test 예시
describe('Economy Slice', () => {
  it('should add bells correctly', () => { ... });
  it('should prevent integer overflow', () => { ... });
});

// E2E Test 예시
test('should complete mission_01_variables', async ({ page }) => { ... });

// Performance Test 예시
export default function () {
  const response = http.post('/api/code/execute', ...);
  check(response, { 'status is 200': r => r.status === 200 });
}
```

#### 사용 대상
- QA 엔지니어 (테스트 전략 수립)
- 개발자 (테스트 작성)
- DevOps (배포 자동화)
- 기술 리더 (품질 관리)

---

### 3️⃣ Definition of Done (DoD) 체크리스트
**파일**: `03_DEFINITION_OF_DONE.md`

#### 목표
**"기능/작업이 언제 진정으로 완료되었는가?"**를 명확히 정의

#### 3가지 DoD 레벨

**1. 기능 단위 DoD (Feature-Level)**
언제: 단일 기능(예: "코드 실행 기능")을 개발할 때
항목:
- 개발 (코딩, 스타일, 타입 검사)
- 단위 테스트 (80%+ 커버리지)
- 통합 테스트
- 정적 분석 (ESLint, TypeScript)
- 문서화 (주석, JSDoc)
- 코드 리뷰 (승인)
- 배포 준비

**2. 마일스톤 단위 DoD (Milestone-Level)**
언제: Sprint/Phase 종료 시
항목:
- 모든 기능이 기능 단위 DoD 통과
- E2E 테스트 통과 (주요 시나리오)
- 성능 테스트 통과 (응답 < 500ms)
- 보안 검사 통과 (npm audit)
- 문서화 완성 (Phase 완료 보고서)
- 릴리스 준비 (버전, 태그)

**3. 출시 단위 DoD (Release-Level)**
언제: 프로덕션 배포 전
항목:
- 전체 통합 테스트 통과
- 사용자 수용 테스트(UAT) 완료
- 성능/보안 감사 통과
- 문서 100% 업데이트
- 마이그레이션 가이드
- 롤백 계획
- 모니터링 준비
- 최종 승인

#### 실제 사용 예시

**GitHub Issue Template**:
```markdown
# [Feature] 기능명

## 완료 체크리스트 (DoD)

### 개발
- [ ] 코드 작성 완료
- [ ] ESLint 통과
- [ ] TypeScript 통과

### 테스트
- [ ] 단위 테스트 작성 (80%+)
- [ ] 모든 테스트 통과

### 문서화
- [ ] 함수 JSDoc 작성
- [ ] README 업데이트

### 검토
- [ ] 코드 리뷰 승인
```

#### DoD 준수율 추적 템플릿
```
주간 DoD 준수율 (Week of Dec 4-10)

기능별:
┌─────────────────────────────┬─────┐
│ Code Execution API          │ 100%│
│ IDE Window Component        │ 95% │ ⚠️ 1개 리뷰 코멘트 해결 중
│ Redux Store Setup           │ 100%│
└─────────────────────────────┴─────┘

전체: 92% ✅
```

#### 사용 대상
- Scrum Master / Project Manager (진행 추적)
- 개발팀 (작업 완료 확인)
- QA (완료도 검증)

---

### 4️⃣ 프로젝트 개발 로드맵
**파일**: `04_PROJECT_DEVELOPMENT_ROADMAP.md`

#### 목표
**6개월** 개발 로드맵 제시
- 4개 Phase
- 10개 Sprint
- 100+ Deliverables

#### 타임라인 개요

```
Phase 1: MVP 기초 인프라 (2주)
  ├─ Sprint 1: 코드 실행 엔진 (1주)
  └─ Sprint 2: 기본 게임 상태 (1주)

Phase 2: 게임 시스템 확충 (3주)
  ├─ Sprint 3: 타일 그리드 렌더러
  ├─ Sprint 4: 대화 시스템
  └─ Sprint 5: 환경 시스템 + 미션

Phase 3: 스토리라인 & 고도화 (2주)
  ├─ Sprint 6: 스토리 통합
  └─ Sprint 7: 성능 최적화

Phase 4: 출시 & 운영 (2주)
  ├─ Sprint 8: 성능 최적화
  ├─ Sprint 9: 보안 & 모니터링
  └─ Sprint 10: 최종 출시

총 기간: 9주 + 1주 버퍼 = 10주
```

#### Phase별 상세 내용

**Phase 1: MVP 기초 인프라 (Week 1-2)**
목표: 코드를 실행하고 게임 상태를 관리할 수 있는가?

Sprint 1 (1주):
- ExecutionService 구현
- CodeValidator 구현
- API 엔드포인트 (`/api/code/execute`)
- 45개 단위 테스트
- 도구: Jest, Express

Sprint 2 (1주):
- Redux Store 구축
- economySlice (돈 관리)
- progressSlice (진행도 관리)
- 3개 기초 미션
- E2E 테스트 5개

**Phase 2: 게임 시스템 확충 (Week 3-5)**
목표: 게임이 보이고, 주민과 대화할 수 있는가?

Sprint 3 (1주):
- TileGridRenderer (80x80 지도)
- 성능: 100ms 이하 렌더링
- Grid 클릭 이벤트

Sprint 4 (1주):
- DialogueOverlay (캐릭터 대화)
- 타이핑 효과
- 선택지 시스템

Sprint 5 (1주):
- EnvironmentSystem (시간/날씨)
- 6개 추가 미션 (총 9개)
- GameEventSystem

**Phase 3: 스토리라인 & 고도화 (Week 6-7)**
목표: 게임이 흐르는 이야기를 가지고 있는가?

Sprint 6 (1주):
- 전체 스토리라인 (너굴 빚 → 섬 개발 → 상환)
- 스토리 트리거 로직
- 미션 간 연계

Sprint 7 (1주):
- 정적 분석 완성
- 캐싱 (Redis)
- 번들 최적화

**Phase 4: 출시 & 운영 (Week 8-10)**
목표: 안정적으로 운영할 수 있는가?

Sprint 8 (1주):
- 성능 최적화
- 번들 크기 < 900KB
- 응답 시간 < 200ms

Sprint 9 (1주):
- 보안 강화 (SSL, 환경변수)
- Sentry 통합
- Datadog 모니터링

Sprint 10 (1주):
- 최종 QA
- 프로덕션 배포
- 배포 후 모니터링

#### 리소스 할당
```
팀 구성 (4명):
- 백엔드 엔지니어 1명
- 프론트엔드 엔지니어 1명
- DevOps 0.5명
- QA 1명
- 콘텐츠 0.5명

예산: ~$71,000 (3개월)
```

#### 성공 지표 (KPIs)

| Phase | KPI | 목표 |
|-------|-----|------|
| 1 | 코드 실행 성공률 | 100% |
| 2 | 미션 완료율 | 80%+ |
| 3 | 테스트 커버리지 | 85%+ |
| 4 | 배포 성공 | 100% |
| 최종 | 사용자 만족도 | 4.5/5 |

#### 위험 관리 (Risk Register)

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| Java 컴파일 복잡도 | 중간 | 높음 | Phase 1은 JS만 |
| 코드 실행 보안 | 높음 | 높음 | VM2 격리, 타임아웃 |
| 성능 저하 | 중간 | 중간 | 조기 성능 테스트 |
| 스토리 완성도 | 낮음 | 높음 | 콘텐츠 전문가 |

#### 사용 대상
- Project Manager (계획 수립)
- Scrum Master (Sprint 관리)
- 기술 리더 (의사결정)
- 모든 팀원 (공유 비전)

---

## 🎯 문서 사용 가이드

### 시나리오별 추천 문서

#### 시나리오 1: "프로젝트 시작 (주간 1)"
**읽을 문서 순서**:
1. `04_PROJECT_DEVELOPMENT_ROADMAP.md` - 전체 그림 파악
2. `01_CORE_TECHNICAL_ARCHITECTURE.md` - 기술 설계 이해
3. `03_DEFINITION_OF_DONE.md` - DoD 정의 및 공유

#### 시나리오 2: "Sprint 진행 중 (매주)"
**체크할 문서**:
- `03_DEFINITION_OF_DONE.md` - 각 기능의 DoD 검증
- `04_PROJECT_DEVELOPMENT_ROADMAP.md` - 현재 Sprint 목표 확인
- `02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md` - 테스트 진행도 추적

#### 시나리오 3: "테스트/QA 단계"
**주요 문서**:
- `02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md` (메인)
  - 각 테스트 레벨별 상세 내용
  - 도구 선택 및 설정
  - 실제 코드 예시

#### 시나리오 4: "배포 준비 (Week 9)"
**체크리스트**:
- `03_DEFINITION_OF_DONE.md` → 출시 단위 DoD
- `02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md` → 5-6단계 (DevOps, Observability)
- `01_CORE_TECHNICAL_ARCHITECTURE.md` → 성능 목표 확인

#### 시나리오 5: "새로운 기능 추가"
**프로세스**:
1. `04_PROJECT_DEVELOPMENT_ROADMAP.md` - 어느 Sprint에 들어갈지 결정
2. `01_CORE_TECHNICAL_ARCHITECTURE.md` - 기술 설계
3. `03_DEFINITION_OF_DONE.md` - DoD 정의
4. `02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md` - 테스트 계획

---

## 📊 문서 통계

```
총 4개 문서, ~130 페이지 (마크다운)

분량 분석:
├─ 01_CORE_TECHNICAL_ARCHITECTURE.md      : ~50 페이지
├─ 02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP : ~40 페이지
├─ 03_DEFINITION_OF_DONE.md               : ~25 페이지
└─ 04_PROJECT_DEVELOPMENT_ROADMAP.md      : ~40 페이지

콘텐츠 분석:
├─ 체크리스트: 100+개
├─ 코드 예시: 30+개
├─ 다이어그램: 20+개
├─ 테이블: 50+개
└─ 섹션: 200+개
```

---

## 🚀 다음 스텝

### 즉시 수행 (Week 1 시작 전)

1. **팀 미팅**
   - 모든 문서 검토
   - DoD 합의
   - 리소스 확정

2. **개발 환경 세팅**
   - Git 저장소 생성
   - CI/CD 파이프라인 구축
   - 로컬 개발 환경 준비

3. **Phase 1 Sprint 1 시작**
   - Sprint 목표 확정
   - 작업 분배
   - 첫 번째 PR 생성

### 주간 활동 (매주)

- **월**: 이전주 리뷰 + 현주 계획
- **화-목**: 개발 진행 + 테스트
- **금**: Sprint 리뷰 + 회고 + 문서 업데이트

### 마일스톤별 활동

- **Phase 종료**: 완료 보고서 작성
- **주요 기능**: 아키텍처 리뷰
- **출시 전**: 최종 보안 감사

---

## 📞 문서 관련 Q&A

### Q: 문서를 어떻게 유지보수할까?
**A**: 각 문서 헤더에 "최종 업데이트" 날짜 추가, 월 1회 검토 및 갱신

### Q: 문서 버전관리는?
**A**: Git에 커밋, 각 Phase 완료 시 버전 업그레이드

### Q: 새로운 팀원이 조인했을 때?
**A**:
1. 04_PROJECT_DEVELOPMENT_ROADMAP.md 읽기 (30분)
2. 01_CORE_TECHNICAL_ARCHITECTURE.md 읽기 (1시간)
3. 03_DEFINITION_OF_DONE.md 학습 (30분)
4. 현재 Sprint 작업 배정

### Q: 문서와 실제 코드가 맞지 않을 때?
**A**: 코드 > 문서. 항상 실제 코드가 진실. 문서 업데이트.

---

## 📝 최종 체크리스트

프로젝트 시작 전:
- [ ] 4가지 문서 모두 읽음
- [ ] 팀 전체가 DoD에 동의
- [ ] 로드맵 일정 수락
- [ ] 리소스 할당 완료
- [ ] 개발 환경 준비 완료
- [ ] 첫 Sprint 준비 완료

---

## 📚 추가 참고 자료

- `TDD.md` - Test-Driven Development 가이드
- `SDD.md` - Software Design Document
- `QUICK_START.md` - 빠른 시작 가이드
- `API.md` - API 명세

---

---

## 📂 추가 문서 (Subdirectories)

### Phase Documentation (단계별 구현)

**위치**: `docs/PHASE_DOCUMENTATION/`

| 파일 | 내용 | 대상 |
|------|------|------|
| `PHASE_1_COMPLETION_SUMMARY.md` | Phase 1 완료 보고서 | 개발팀, PM |
| `PHASE_1_IMPLEMENTATION_GUIDE.md` | Phase 1 구현 가이드 | 개발자 |
| `SESSION_2_STORY_PAGE_GUIDE.md` | 스토리 페이지 구현 | 프론트엔드 |
| `REPOSITORY_CLEANUP.md` | 저장소 정리 보고서 | DevOps |
| `SESSION_COMPLETION_REPORT.md` | 세션 완료 보고서 | PM, CTO |

### Production Readiness (프로덕션 배포 준비)

**위치**: `docs/PRODUCTION_READINESS/`

| 파일 | 내용 | 대상 | 필독 순서 |
|------|------|------|----------|
| `START_HERE_PRODUCTION_FIXES.md` | **🚀 시작하기** | 모두 | 1️⃣ |
| `CTO_REVIEW_ACTION_PLAN.md` | CTO 리뷰 & 액션 플랜 | 기술팀 | 2️⃣ |
| `PRODUCTION_READINESS_FIX_PLAN.md` | 상세 구현 가이드 (5,000+줄) | 개발자 | 3️⃣ |
| `QUICK_START_FIX_GUIDE.md` | 빠른 시작 (터미널 명령어) | 개발자 | 3️⃣ |
| `IMPLEMENTATION_STATUS.md` | 진행상황 추적 및 체크리스트 | PM, 개발팀 | 진행 중 |

### 기술 시스템 (Technical Systems)

**위치**: `docs/13_TECHNICAL_ENHANCEMENT_STRATEGY/`, `docs/14_AI_CODE_VALIDATION_FRAMEWORK/`

- 에셋 시스템 설계
- NPC AI 시스템
- 코드 검증 프레임워크

---

## 🎯 문서 선택 가이드

### "나는 새로운 개발자다"
1. `01_CORE_TECHNICAL_ARCHITECTURE.md` (시스템 이해)
2. `04_PROJECT_DEVELOPMENT_ROADMAP.md` (계획 이해)
3. 해당 Phase 문서 (구현 시작)

### "나는 개발을 진행 중이다"
1. 현재 Phase 문서에서 구현 가이드 참고
2. `02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md` (테스트 작성)
3. 해당 섹션의 상세 문서

### "프로덕션 배포를 준비 중이다"
1. `docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md`
2. `docs/PRODUCTION_READINESS/CTO_REVIEW_ACTION_PLAN.md`
3. `docs/PRODUCTION_READINESS/QUICK_START_FIX_GUIDE.md`
4. 각 문제별 구현 및 검증

### "나는 PM/CTO다"
1. `04_PROJECT_DEVELOPMENT_ROADMAP.md` (계획 & 진행)
2. `03_DEFINITION_OF_DONE.md` (품질 기준)
3. 각 Phase 완료 보고서 (진행상황)
4. `docs/PRODUCTION_READINESS/CTO_REVIEW_ACTION_PLAN.md` (배포 준비)

---

## 📋 디렉토리 구조

```
docs/
├── 00_DOCUMENTATION_INDEX.md              ← 마스터 인덱스 (여기서 시작)
├── 00_DOCUMENTATION_STRUCTURE.md          ← 문서 구조 설명
├── 01_CORE_TECHNICAL_ARCHITECTURE.md      ← 기술 아키텍처
├── 02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md ← 테스트 전략
├── 03_DEFINITION_OF_DONE.md               ← 완료 기준
├── 04_PROJECT_DEVELOPMENT_ROADMAP.md      ← 개발 로드맵
├── 05-09_TEST_REPORTS/                    ← 테스트 보고서들
├── 10_COMPATIBILITY_TEST_PLAN.md
├── 11_MONITORING_OBSERVABILITY_PLAN.md
├── 12_STORY_PAGE_E2E_TEST_REPORT.md
├── 13_TECHNICAL_ENHANCEMENT_STRATEGY/     ← 기술 시스템
├── 14_AI_CODE_VALIDATION_FRAMEWORK/       ← 검증 시스템
├── PHASE_DOCUMENTATION/                   ← Phase별 문서
│   ├── PHASE_1_COMPLETION_SUMMARY.md
│   ├── PHASE_1_IMPLEMENTATION_GUIDE.md
│   ├── SESSION_2_STORY_PAGE_GUIDE.md
│   ├── REPOSITORY_CLEANUP.md
│   └── SESSION_COMPLETION_REPORT.md
└── PRODUCTION_READINESS/                  ← 프로덕션 배포
    ├── START_HERE_PRODUCTION_FIXES.md
    ├── CTO_REVIEW_ACTION_PLAN.md
    ├── PRODUCTION_READINESS_FIX_PLAN.md
    ├── QUICK_START_FIX_GUIDE.md
    └── IMPLEMENTATION_STATUS.md
```

---

## 🎉 결론

이 문서들은 **"너굴 코딩 플랫폼"**을 성공적으로 개발, 배포, 운영하기 위한 **종합 가이드**입니다.

핵심:
- 📖 **아키텍처** 문서: 무엇을 만들 것인가?
- 🧪 **테스트 전략** 문서: 어떻게 품질을 보장할 것인가?
- ✅ **DoD** 문서: 언제 완료된 것인가?
- 📅 **로드맵** 문서: 언제 완료할 것인가?
- 🚀 **프로덕션 준비** 문서: 어떻게 배포할 것인가?

이 5가지가 명확하면, 팀은 자신감 있게 개발을 진행할 수 있습니다. 🦝

