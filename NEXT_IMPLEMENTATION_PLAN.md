# 📋 다음 구현 계획 (Next Implementation Plan)

**작성일**: 2025-12-04
**상태**: 현재까지 완성된 것 기반으로 작성
**목표**: Phase 3.0 ~ Phase 3.3 실행을 위한 구현 항목 정리

---

## 🎯 현재 상태 (Completed)

### ✅ 이미 완성된 것

```
1. 기술 강화 전략 문서
   ├─ 13_TECHNICAL_ENHANCEMENT_STRATEGY (5개 문서, 2,243줄)
   └─ 모듈형 에셋 시스템 & AI NPC 상세 설계

2. AI 코드 검증 프레임워크
   ├─ 14_AI_CODE_VALIDATION_FRAMEWORK (9개 문서, 6,400줄)
   ├─ 테스트 전략, DoD, 체크리스트 포함
   └─ 7단계 품질 로드맵 기반

3. Story Page 구현
   ├─ frontend/public/story.html (728줄)
   ├─ 26개 이미지 통합
   └─ 3단계 IDE 미션 (변수, 실수형, 캐스팅)

4. E2E 테스트
   ├─ 3개 테스트 파일
   ├─ 16개 테스트 케이스
   └─ 81.25% 통과율

📌 다음: 이 기반으로 실제 구현 시작
```

---

## 🚀 Phase 3.0 (준비 단계) - Week 1

### 3.0.1 개발 환경 최종 구성

```
구현 항목:
  □ TypeScript 설정 최적화
    ├─ tsconfig.json 재검토
    ├─ strict mode 활성화
    └─ paths alias 설정

  □ Jest 설정
    ├─ jest.config.ts 작성
    ├─ coverage 설정 (95%+ 목표)
    └─ test utilities 작성

  □ Playwright 설정
    ├─ playwright.config.ts 최종화
    ├─ 3개 브라우저 설정 (Chrome, Firefox, Safari)
    └─ test fixtures 작성

  □ CI/CD 기본 구성
    ├─ GitHub Actions workflow 작성
    ├─ npm test, npm run lint 자동화
    └─ 배포 파이프라인 기본 구조

책임: DevOps / Backend 엔지니어
시간: 2일
결과물: 준비 완료 ✅
```

### 3.0.2 Sample 테스트 구현 (4개)

```
구현 항목:

1️⃣ Stage 1 - AssetManager 단위 테스트
  파일: tests/unit/AssetManager.test.ts
  내용:
    ├─ loadAsset() 테스트 (성공, 실패, 캐시)
    ├─ 캐싱 로직 테스트
    └─ 메타데이터 검증 테스트
  테스트 수: 10+

2️⃣ Stage 2 - Story Page E2E 테스트
  파일: e2e/story-page-sample.spec.ts
  내용:
    ├─ 페이지 로드 테스트
    ├─ 이미지 렌더링 테스트
    └─ IDE 상호작용 테스트
  테스트 수: 5+

3️⃣ Stage 3 - 메타모르픽 테스트 샘플
  파일: tests/advanced/metamorphic-sample.spec.ts
  내용:
    ├─ AI 응답 일관성 테스트
    └─ 캐시 효율성 테스트
  테스트 수: 3+

4️⃣ Stage 4 - 사용자 테스트 샘플
  파일: tests/product/user-satisfaction-sample.spec.ts
  내용:
    └─ 사용성 테스트 시나리오
  테스트 수: 2+

책임: QA 엔지니어
시간: 2일
결과물: Sample 테스트 4개 모두 통과 ✅
```

### 3.0.3 팀 킥오프 및 교육

```
실행 항목:
  □ 팀 킥오프 미팅 (120분)
    ├─ 프레임워크 소개 (30분)
    ├─ 7단계 품질 로드맵 설명 (30분)
    ├─ 각자 역할 설명 (20분)
    └─ Q&A (20분)

  □ 개발팀 교육 (60분)
    ├─ 기술 스택 소개
    ├─ 테스트 작성 방법
    └─ 코드 리뷰 프로세스

  □ 문서 검토
    ├─ 각 팀원이 자신의 담당 영역 문서 읽음
    └─ 질문 정리 및 답변

책임: 프로젝트 리더
시간: 1일
결과물: 팀이 준비 상태 진입 ✅
```

**Phase 3.0 Go/No-go 기준**: 위 3항목 모두 완료 → GO ✅

---

## 🏗️ Phase 3.1 (MVP) - 2주

### 3.1.1 AssetManager 구현

```
구현 항목:
파일: frontend/src/services/AssetManager.ts

핵심 기능:
  □ Asset 로드 (DB 또는 파일)
    ├─ loadAsset(id: string): Asset
    └─ 에러 처리

  □ 캐싱 시스템
    ├─ 인메모리 캐시 구현
    ├─ 최대 크기 제한 (1000개)
    └─ LRU(Least Recently Used) 정책

  □ 메타데이터 관리
    ├─ Asset 크기, 포맷 추적
    ├─ 레이어 정보 저장
    └─ 타입 정보 저장

  □ 에러 처리
    ├─ Asset 없음 → 에러
    ├─ 잘못된 포맷 → 에러
    └─ 타임아웃 처리

테스트:
  □ 10+ 단위 테스트
  □ 통합 테스트 (SceneComposer와)
  □ 커버리지: ≥95%

책임: Frontend 엔지니어
시간: 2일
결과물: AssetManager.ts (200-300줄) ✅
```

### 3.1.2 SceneComposer 구현

```
구현 항목:
파일: frontend/src/services/SceneComposer.ts

핵심 기능:
  □ Scene 구성 (JSON 기반)
    ├─ composeScene(sceneJson): Scene
    ├─ 레이어 조합
    └─ 유효성 검사

  □ Z-index 자동 정렬
    ├─ background: z=1
    ├─ character: z=10-20
    └─ ui: z=100

  □ Canvas 렌더링 준비
    ├─ 각 레이어 위치 계산
    ├─ 크기 조정
    └─ 메모리 최적화

  □ 에러 처리
    ├─ 필수 필드 검사
    ├─ 잘못된 좌표 검사
    └─ 레이어 순환 참조 검사

테스트:
  □ 10+ 단위 테스트
  □ E2E 테스트
  □ 커버리지: ≥95%

책임: Frontend 엔지니어
시간: 2일
결과물: SceneComposer.ts (250-350줄) ✅
```

### 3.1.3 NookAIService 구현 (기본)

```
구현 항목:
파일: backend/src/services/NookAIService.ts

핵심 기능:
  □ Claude API 통합
    ├─ generateFeedback(input): Response
    ├─ API 호출
    └─ 응답 처리

  □ System Prompt 적용
    ├─ 너굴 페르소나 설정
    ├─ 교사 역할 명시
    └─ 격려 톤 정의

  □ 15가지 오류 타입 분류
    ├─ VariableDeclaration
    ├─ TypeError
    ├─ SyntaxError
    ├─ LogicError
    ├─ ... (총 15가지)
    └─ 각 타입별 프롬프트 템플릿

  □ 응답 검증
    ├─ 필수 필드 확인
    ├─ 길이 검사 (20-500자)
    └─ 특수 문자 검사

테스트:
  □ 15+ 단위 테스트
  □ API 호출 테스트
  □ 커버리지: ≥90%

책임: Backend 엔지니어
시간: 3일
결과물: NookAIService.ts (300-400줄) ✅
```

### 3.1.4 FeedbackCache 구현

```
구현 항목:
파일: backend/src/services/FeedbackCache.ts

핵심 기능:
  □ 캐시 저장/조회
    ├─ set(key, value)
    ├─ get(key)
    └─ delete(key)

  □ 크기 관리
    ├─ 최대 크기 설정 (1000개)
    ├─ LRU 정책 구현
    └─ 메모리 모니터링

  □ 통계 수집
    ├─ 캐시 히트율 추적
    ├─ 미스율 추적
    └─ 성능 메트릭

  □ Redis 연동 (선택사항)
    └─ 분산 캐싱 지원

테스트:
  □ 10+ 단위 테스트
  □ 성능 테스트
  □ 커버리지: ≥95%

책임: Backend 엔지니어
시간: 2일
결과물: FeedbackCache.ts (200-250줄) ✅
```

### 3.1.5 API 엔드포인트 구현

```
구현 항목:
파일: backend/src/routes/feedback.ts

엔드포인트:
  □ POST /api/feedback
    ├─ 요청: { errorType, userCode, userLevel }
    ├─ 응답: { message, encouragementLevel, ... }
    ├─ 에러 처리
    └─ Rate limiting

  □ GET /api/feedback/stats (선택)
    ├─ 캐시 통계 반환
    └─ 비용 추적

테스트:
  □ 10+ 통합 테스트
  □ 성능 테스트
  □ 보안 테스트

책임: Backend 엔지니어
시간: 1일
결과물: feedback.ts (150-200줄) ✅
```

### 3.1.6 Story Page - IDE 통합

```
구현 항목:
파일: frontend/public/story.html (수정)

통합 내용:
  □ AssetManager 연동
    ├─ 에셋 로드
    ├─ Scene 구성
    └─ 렌더링

  □ NookAIService 연동
    ├─ 코드 검증
    ├─ AI 피드백 요청
    └─ 피드백 표시

  □ 사용자 상호작용
    ├─ 코드 입력
    ├─ 제출 버튼
    └─ 진행 상황 추적

테스트:
  □ E2E 테스트 작성 (5+ 시나리오)
  □ 응답 시간 검증 (< 1.5초)
  └─ 메모리 검증

책임: Frontend 엔지니어
시간: 2일
결과물: story.html 수정 + E2E 테스트 ✅
```

### 3.1.7 정적 분석 및 품질 검증

```
실행 항목:
  □ TypeScript 타입 체크
    └─ tsc --noEmit (오류 0개)

  □ ESLint 실행
    └─ npm run lint (Critical 0개)

  □ 보안 감사
    └─ npm audit (High/Critical 0개)

  □ 복잡도 분석
    └─ 모든 함수 < 20 복잡도

책임: 모든 엔지니어
시간: 1일
결과물: 모든 기준 통과 ✅
```

**Phase 3.1 Go/No-go 기준**:
- 모든 구현 완료
- 테스트 90%+ 통과
- 커버리지 95%+
- 보안/성능 기준 달성
→ GO ✅

---

## ⚡ Phase 3.2 (최적화) - 1주

### 3.2.1 캐시 최적화

```
구현 항목:
  □ 캐시 히트율 개선 (목표: > 80%)
    ├─ 캐시 키 전략 개선
    ├─ 프리페칭 로직 추가
    └─ 만료 시간 조정

  □ 메모리 최적화
    ├─ 에셋 크기 압축
    ├─ 응답 압축 (gzip)
    └─ 메모리 사용 < 50MB

  □ 응답 시간 개선
    ├─ 데이터베이스 쿼리 최적화
    ├─ 인덱싱 추가
    └─ 응답 시간 < 600ms

책임: Backend 엔지니어
시간: 2일
결과물: 성능 목표 달성 ✅
```

### 3.2.2 프롬프트 엔지니어링

```
구현 항목:
  □ System Prompt 최적화
    ├─ 너굴 페르소나 정교화
    ├─ 격려 메시지 다양화
    └─ 오류별 피드백 템플릿 개선

  □ 응답 품질 평가
    ├─ 응답 길이 검증 (20-500자)
    ├─ 톤 평가 (격려, 교육적)
    └─ 정확성 평가

책임: AI/Backend 엔지니어
시간: 2일
결과물: 프롬프트 최적화 완료 ✅
```

### 3.2.3 모니터링 구성

```
구현 항목:
  □ Prometheus 메트릭
    ├─ API 응답 시간
    ├─ 캐시 히트율
    ├─ 에러율
    └─ API 호출 수

  □ 대시보드 (Grafana)
    ├─ 실시간 메트릭 표시
    ├─ 알림 규칙 설정
    └─ 로그 수집

책임: DevOps 엔지니어
시간: 1일
결과물: 모니터링 시스템 구축 ✅
```

### 3.2.4 파일럿 테스트 (5명 학생)

```
실행 항목:
  □ 학생 모집 (5명)
  □ 3 스텝 완료 요청
  □ 만족도 조사 (1-5점)
  □ 피드백 수집
  □ 결과: 평균 만족도 ≥ 80%

책임: PM / 교육팀
시간: 3일
결과물: 파일럿 결과 리포트 ✅
```

**Phase 3.2 Go/No-go 기준**:
- 성능 목표 달성
- 사용자 만족도 > 80%
- 모니터링 구성 완료
→ GO ✅

---

## 🌟 Phase 3.3 (배포) - 2주

### 3.3.1 최종 검증

```
실행 항목:
  □ 모든 Stage 1-7 테스트 실행
    ├─ Stage 1: Unit tests
    ├─ Stage 2: E2E tests
    ├─ Stage 3: Advanced logic tests
    ├─ Stage 4: Product level tests
    ├─ Stage 5: DevOps validation
    ├─ Stage 6: Monitoring check
    └─ Stage 7: Documentation review

  □ 커버리지 확인: 95%+
  □ 성능 지표 확인: 기준 달성
  □ 보안 검증: 통과

책임: QA 엔지니어
시간: 2일
결과물: 최종 검증 리포트 ✅
```

### 3.3.2 Staging 배포

```
실행 항목:
  □ Docker 이미지 빌드
    └─ docker build -t nook-coding:latest .

  □ Staging 환경 배포
    ├─ docker-compose up (staging)
    ├─ 헬스 체크
    └─ 기본 테스트

  □ Staging 테스트 (모든 기능)
    ├─ E2E 테스트 전체 실행
    └─ 성능 검증

책임: DevOps 엔지니어
시간: 1일
결과물: Staging 배포 완료 ✅
```

### 3.3.3 Production 배포

```
실행 항목:
  □ 배포 전 최종 확인
    ├─ 데이터베이스 백업
    ├─ 롤백 계획 수립
    └─ 팀 대기

  □ Production 배포
    ├─ 블루-그린 배포 (무중단)
    ├─ 헬스 체크 (5분 대기)
    └─ 트래픽 점진적 전환

  □ 배포 후 모니터링 (24시간)
    ├─ 에러율 < 1%
    ├─ 응답 시간 < 2초
    ├─ 리소스 사용 정상
    └─ 사용자 피드백 모니터링

책임: DevOps + 전체 팀
시간: 1일 (배포) + 1일 (모니터링)
결과물: Production 배포 성공 ✅
```

### 3.3.4 문서화 및 마무리

```
구현 항목:
  □ 배포 문서 작성
    ├─ 배포 절차
    ├─ 롤백 절차
    └─ 트러블슈팅 가이드

  □ 런북 작성
    ├─ 일반적인 문제와 해결책
    ├─ 성능 튜닝 가이드
    └─ 로그 분석 방법

  □ 팀 회고 (Retrospective)
    ├─ 잘된 점
    ├─ 개선 필요 사항
    └─ 다음 에피소드 계획

책임: PM / 모든 팀원
시간: 1일
결과물: 완전한 문서화 ✅
```

**Phase 3.3 Go/No-go 기준**:
- 모든 검증 통과
- Production 배포 성공
- 24시간 모니터링 완료
→ DEPLOY COMPLETE ✅

---

## 📊 전체 일정

```
Week 1: Phase 3.0 (준비)
  ├─ 개발 환경 구성 (2일)
  ├─ Sample 테스트 (2일)
  └─ 팀 교육 (1일)

Week 2-3: Phase 3.1 (MVP)
  ├─ AssetManager 구현 (2일)
  ├─ SceneComposer 구현 (2일)
  ├─ NookAIService 구현 (3일)
  ├─ API 엔드포인트 (1일)
  ├─ 통합 & 테스트 (4일)
  └─ 정적 분석 (1일)

Week 4: Phase 3.2 (최적화)
  ├─ 캐시 최적화 (2일)
  ├─ 프롬프트 엔지니어링 (2일)
  ├─ 모니터링 구성 (1일)
  └─ 파일럿 테스트 (3일)

Week 5-6: Phase 3.3 (배포)
  ├─ 최종 검증 (2일)
  ├─ Staging 배포 (1일)
  ├─ Production 배포 (1일)
  ├─ 24시간 모니터링 (1일)
  └─ 문서화 (1일)

총 6주 → 완벽한 배포! 🚀
```

---

## 👥 팀 구성 (3-4명)

```
1️⃣ Frontend 엔지니어 (1명)
  담당:
  ├─ AssetManager 구현
  ├─ SceneComposer 구현
  ├─ Story Page 통합
  └─ E2E 테스트 작성

2️⃣ Backend 엔지니어 (1명)
  담당:
  ├─ NookAIService 구현
  ├─ FeedbackCache 구현
  ├─ API 엔드포인트
  └─ 성능 최적화

3️⃣ QA 엔지니어 (1명)
  담당:
  ├─ Sample 테스트 구현
  ├─ 테스트 자동화
  ├─ 최종 검증
  └─ 테스트 리포트

4️⃣ DevOps/PM (1명, 선택)
  담당:
  ├─ CI/CD 파이프라인
  ├─ 배포 자동화
  ├─ 모니터링 구성
  └─ 프로젝트 관리
```

---

## 💰 예상 비용

```
개발 비용: $51,000 (6주 × 4명)
  ├─ Senior 1명 × $20/hour × 240h = $4,800
  ├─ Mid 2명 × $15/hour × 240h = $7,200
  └─ Junior 1명 × $10/hour × 240h = $2,400

API 비용 (Phase 3.1-3.2):
  ├─ 개발 중: $10-20/월
  └─ 예상: $150 (6주)

호스팅 비용:
  ├─ Staging: $100/월
  ├─ Production: $200/월
  └─ 예상: $50 (6주)

인프라 (선택):
  ├─ Monitoring: $50/월
  └─ 예상: $25 (6주)

총 추정 비용: ~$51,225
```

---

## 🔍 의존성 및 위험 요소

### 의존성
```
1. Claude API 키 확보
   └─ 미리 신청 및 테스트 필요

2. 데이터베이스 접근
   └─ Asset 저장소 준비 필요

3. GitHub 저장소 접근
   └─ 이미 준비됨 ✅

4. 개발 팀 풀타임
   └─ 6주 집중력 필요
```

### 위험 요소
```
1. 프롬프트 엔지니어링 실패
   대응: System Prompt 버전 관리 + A/B 테스트

2. 캐시 효율이 낮음 (< 60%)
   대응: 캐시 키 전략 개선 + Redis 고려

3. 성능 목표 미달성
   대응: 데이터베이스 최적화 + CDN 도입

4. 사용자 테스트 만족도 < 80%
   대응: UX 개선 + 피드백 반영
```

---

## ✅ 체크리스트 (지금 바로)

```
구현 시작 전 확인사항:

기술:
  ☐ Node.js v18+ 설치
  ☐ npm 최신 버전
  ☐ TypeScript 설정 확인
  ☐ Jest 설정 완료
  ☐ Playwright 설치 완료

팀:
  ☐ 팀원 확정 (3-4명)
  ☐ 일정 예약 완료
  ☐ 역할 분담 확인
  ☐ 커뮤니케이션 채널 준비

환경:
  ☐ GitHub 저장소 활성화
  ☐ CI/CD 기본 구성
  ☐ Claude API 키 획득
  ☐ 개발 환경 최종 점검
```

---

## 🎯 최종 목표

```
6주 후:
✅ 완벽한 테스트 커버리지 (95%+)
✅ AI 기반 동적 피드백 시스템
✅ 모듈형 에셋 시스템 (레고 블록 방식)
✅ 프로덕션 배포 완료
✅ 사용자 만족도 80%+
✅ 완벽한 문서화
✅ 자동화된 CI/CD
✅ 24/7 모니터링

→ 완벽한 "코딩섬" 플랫폼 런칭! 🚀
```

---

**🦝 이제 준비가 완료되었습니다. 구현을 시작하세요!**

**다음 단계**:
1. 팀원 확정
2. 일정 예약
3. Phase 3.0 킥오프 미팅
4. 구현 시작! 💪
