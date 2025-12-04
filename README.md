# Animal Forest Coding 🦝

**동물의 숲 테마의 교육용 프로그래밍 학습 플랫폼**

> 너굴이와 함께 파이썬을 배우며 무인도를 발전시키세요!

---

## 🚀 빠른 시작

### 개발 환경 시작

```bash
# 백엔드
cd backend
npm install
npm run dev

# 프론트엔드 (새 터미널)
cd frontend
npm install
npm start
```

**기본 URL**: http://localhost:3000

### 프로덕션 배포

⚠️ **CTO 프로덕션 준비 리뷰 완료**

[**프로덕션 배포 가이드**](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md)를 참고하세요 (60-90분 소요)

---

## 📚 문서

### 🎯 가장 먼저 읽어야 할 문서

| 대상 | 문서 | 소요시간 |
|------|------|---------|
| **모두** | [**마스터 인덱스**](docs/00_DOCUMENTATION_INDEX.md) | 5분 |
| **새 개발자** | [기술 아키텍처](docs/01_CORE_TECHNICAL_ARCHITECTURE.md) | 20분 |
| **배포 담당** | [프로덕션 배포 가이드](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md) | 2분 |

### 📂 전체 문서 구조

```
docs/
├── 📖 기술 & 아키텍처
│   ├── 01_CORE_TECHNICAL_ARCHITECTURE.md
│   ├── 02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md
│   ├── 03_DEFINITION_OF_DONE.md
│   └── 04_PROJECT_DEVELOPMENT_ROADMAP.md
│
├── 🧪 테스트 & 검증
│   ├── 05-09_TEST_REPORTS/
│   ├── 10_COMPATIBILITY_TEST_PLAN.md
│   ├── 11_MONITORING_OBSERVABILITY_PLAN.md
│   └── 12_STORY_PAGE_E2E_TEST_REPORT.md
│
├── 🎯 기술 시스템
│   ├── 13_TECHNICAL_ENHANCEMENT_STRATEGY/
│   └── 14_AI_CODE_VALIDATION_FRAMEWORK/
│
├── 📋 Phase별 구현
│   └── PHASE_DOCUMENTATION/
│       ├── PHASE_1_COMPLETION_SUMMARY.md
│       ├── PHASE_1_IMPLEMENTATION_GUIDE.md
│       ├── SESSION_2_STORY_PAGE_GUIDE.md
│       ├── REPOSITORY_CLEANUP.md
│       └── SESSION_COMPLETION_REPORT.md
│
└── 🚀 프로덕션 배포
    └── PRODUCTION_READINESS/
        ├── START_HERE_PRODUCTION_FIXES.md ⭐ 시작하기
        ├── CTO_REVIEW_ACTION_PLAN.md
        ├── PRODUCTION_READINESS_FIX_PLAN.md
        ├── QUICK_START_FIX_GUIDE.md
        └── IMPLEMENTATION_STATUS.md
```

**[더보기: 전체 문서 인덱스](docs/00_DOCUMENTATION_INDEX.md)**

---

## 🏗️ 프로젝트 구조

```
animal-forest-coding/
├── backend/                    # Express.js 서버
│   ├── src/
│   │   ├── index.ts           # 서버 진입점
│   │   ├── routes/            # API 라우트
│   │   └── services/          # 비즈니스 로직
│   └── package.json
│
├── frontend/                   # React 애플리케이션
│   ├── src/
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── services/         # API 클라이언트
│   │   └── store/            # Redux 상태 관리
│   └── package.json
│
├── tests/                      # Jest 테스트
│   ├── unit/
│   ├── integration/
│   └── product/
│
├── e2e/                        # Playwright E2E 테스트
│
├── docs/                       # 📖 전체 문서 (지금 읽으세요!)
│
└── CLAUDE.md                   # Claude Code 프로젝트 설정
```

---

## 🎯 핵심 기능

### 🎓 학습 미션 시스템
- 파이썬 기초부터 고급까지 12개 미션
- 실시간 코드 검증 및 피드백
- NPC와의 대화 기반 학습
- 포인트 & 뱃지 진행도 추적

### 🎮 게임화 요소
- 동물의 숲 테마의 UI/UX
- 너굴 캐릭터와 상호작용
- 에피소드 기반 스토리 진행
- 리워드 시스템

### 🔧 기술 스택
- **Frontend**: React, TypeScript, Tailwind CSS, Redux
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: SQLite (현재), PostgreSQL (업그레이드 가능)
- **Testing**: Jest, Playwright
- **Execution**: Pyodide (WebAssembly Python)

---

## 🚀 개발 단계

### ✅ Phase 1: 데이터 영속성 (완료)
- Redux 상태 관리
- localStorage 캐싱
- Backend 데이터 동기화
- 오프라인 지원

### ✅ Phase 2: IDE & 코드 검증 (진행 중)
- Pyodide 기반 Python 실행
- 자동 채점 시스템
- 실시간 피드백

### ⏳ Phase 3: 스토리 & 게임 시스템 (예정)
- 풀 스토리 구현
- 게임 세계 구성
- 추가 에피소드

### ⏳ Phase 4: 확장 & 최적화 (예정)
- 멀티플레이어 기능
- 고급 분석
- 성능 최적화

---

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# Watch 모드
npm run test:watch

# Coverage 리포트
npm run test:coverage

# E2E 테스트
npm run e2e

# E2E 테스트 (브라우저 표시)
npm run e2e:headed
```

---

## 📊 현재 상태

| 항목 | 상태 | 상세 |
|------|------|------|
| 데이터 영속성 | ✅ | Phase 1 완료 |
| IDE & 코드 검증 | ✅ | Phase 2 진행 중 |
| 스토리 페이지 | ✅ | 12개 미션 구현 |
| 프로덕션 준비 | ⚠️ | [4개 이슈 해결 필요](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md) |
| 테스트 커버리지 | 📊 | 96.5% (전체 399 테스트) |

---

## ⚙️ 프로덕션 배포

### 🚨 현재 이슈 (CTO 리뷰)

| 우선순위 | 이슈 | 상태 | 수정 시간 |
|----------|------|------|---------|
| 🔴 CRITICAL | 데이터 손실 (메모리 DB) | 해결책 완성 | 15분 |
| 🟠 HIGH | 마크다운 렌더링 미흡 | 해결책 완성 | 10분 |
| 🟠 HIGH | 스토리 진행상황 미저장 | 해결책 완성 | 15분 |
| 🟡 MEDIUM | 스토리 데이터 하드코딩 | 해결책 완성 | 20분 |

**→ [60분 내 해결 가능! (시작하기)](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md)**

---

## 👥 팀 정보

- **프로젝트**: 너굴 코딩 플랫폼 (Animal Forest Coding)
- **목표**: 동물의 숲 테마로 프로그래밍 기초 교육
- **기술 리더**: CTO (프로덕션 리뷰 완료)
- **개발팀**: Full-stack 개발자

---

## 📞 지원

### 문제 해결

1. **개발 중 문제**: [기술 아키텍처 문서](docs/01_CORE_TECHNICAL_ARCHITECTURE.md) 참고
2. **테스트 실패**: [테스트 전략 문서](docs/02_COMPREHENSIVE_TEST_STRATEGY_ROADMAP.md) 참고
3. **배포 이슈**: [프로덕션 가이드](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md) 참고

### 빠른 링크

- 📖 [**전체 문서 인덱스**](docs/00_DOCUMENTATION_INDEX.md) - 모든 문서의 시작점
- 🎯 [**프로덕션 배포 가이드**](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md) - 60분 내 완성
- 🏗️ [**기술 아키텍처**](docs/01_CORE_TECHNICAL_ARCHITECTURE.md) - 시스템 설계
- 📅 [**개발 로드맵**](docs/04_PROJECT_DEVELOPMENT_ROADMAP.md) - 다음 단계

---

## 📝 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🦝 Generated with Claude Code

**마지막 업데이트**: 2025-12-05

🚀 **다음 단계**: [프로덕션 배포 가이드로 이동](docs/PRODUCTION_READINESS/START_HERE_PRODUCTION_FIXES.md)
