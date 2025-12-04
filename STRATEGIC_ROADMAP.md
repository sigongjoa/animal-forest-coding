# 🗺️ Strategic Roadmap: MVP → Production

**작성자**: Claude Code
**작성일**: 2025-12-05
**상태**: 전략 수립 완료

---

## 📍 현재 위치

```
🏁 START (MVP)
  ✅ 핵심 기능 구현
  ✅ 테스트 100% 통과
  ✅ 기술 부채 문서화
  ❌ 프로덕션 준비 미완료
         ↓
🚧 여기서 우리는 지금 있음
         ↓
🎯 GOAL (Production)
  ✅ 데이터 지속성
  ✅ 서버 사이드 검증
  ✅ 확장 가능한 구조
  ✅ 통합 아키텍처
  ✅ 배포 준비 완료
```

---

## 🎯 전략적 목표 (Strategic Goals)

### Tier 1: 기본 생존 (Survival) - 8주
> "학생들이 정상적으로 게임을 할 수 있도록"

| 목표 | 결과 | 영향 |
|------|------|------|
| **데이터 지속성** | F5 새로고침 후에도 진행 상황 유지 | 학생 만족도 ⬆️⬆️ |
| **서버 검증** | 부정행위 100% 차단 | 공정성 ⬆️⬆️ |
| **확장성** | 에피소드 100개도 관리 가능 | 운영 비용 ⬇️ |

### Tier 2: 안정성 (Stability) - 8-16주
> "대규모 학교에 배포 가능하도록"

| 목표 | 결과 | 영향 |
|------|------|------|
| **성능 최적화** | 평균 응답시간 < 500ms | 사용자 경험 ⬆️ |
| **에러 처리** | 99.9% 가용성 | 신뢰도 ⬆️ |
| **모니터링** | 실시간 대시보드 | 운영 효율 ⬆️ |

### Tier 3: 성장성 (Growth) - 16주 이상
> "엔터프라이즈 수준으로"

| 목표 | 결과 | 영향 |
|------|------|------|
| **다언어 지원** | 100개국 언어 | 글로벌 확장 |
| **협업 기능** | 실시간 코드 공유 | 학습 효과 |
| **고급 분석** | 학습 진행도 시각화 | 성과 증명 |

---

## 🔥 4대 치명적 갭 (Critical Gaps)

### Gap 1: 📱 데이터 지속성

**현상**: "F5 누르니까 0부터 시작"

```
학생의 불만:
"어? 내가 방금 미션 1 풀었는데...
 새로고침하니까 또 안 풀린 것처럼 나와?"

→ 앱을 신뢰 불가능하다고 판단
→ 다시는 안 쓴다
```

**영향**: ⭐⭐⭐ (즉각적 이탈)

**해결**: 2주
- localStorage (즉시 효과)
- Backend 저장 (완전한 동기화)
- 충돌 해결 (복합 기기)

---

### Gap 2: 🔐 클라이언트 검증

**현상**: F12로 정답 보기 → 부정행위

```
악의 있는 학생:
1. F12 열기 → Developer Tools
2. story.html 소스 검사
3. if (code.includes('int loan')) 발견
4. 콘솔에서 completedMissions = ['1', '2', '3'] 입력
5. 모든 미션 완료 (거짓)

또는:
1. Network 탭에서 요청 감시
2. "success": true 응답 intercept
3. "points": 1000으로 수정해서 재전송

결과: 평가 시스템 완전 무너짐
```

**영향**: ⭐⭐⭐⭐ (신뢰 붕괴)

**해결**: 3주
- 서버 사이드 검증
- 샌드박스 실행
- 부정행위 감지 (ML)

---

### Gap 3: 📦 확장성 제약

**현상**: 하드코딩의 늪

```
기획자: "에피소드 10개 추가해 주세요"

개발자:
1. story.html 복사 → story_2.html
2. story_2.html 복사 → story_3.html
... (반복 8번)
9. story_10.html 복사
10. 각 파일에서 dialogue, missions, patterns 수정
11. HTML 파일 10개 모두 테스트

결과: 5일 걸림 (쉬운 작업이 아님)

그 다음:
기획자: "아, 너굴 이미지 위치를 변경해야 해"

개발자: 😱 (10개 파일 또 수정...)
```

**영향**: ⭐⭐⭐ (개발 속도 저하)

**해결**: 2주
- 데이터 기반 아키텍처
- JSON 마이그레이션
- React 컴포넌트 재사용

---

### Gap 4: 🧠 분리된 아키텍처

**현상**: 백엔드와 프론트엔드가 따로 놀음

```
백엔드 (Node.js):
✅ 인증 시스템
✅ Rate Limiter
✅ 에러 핸들링
✅ 데이터베이스

프론트엔드 (story.html):
❌ story.html이 독자적으로 동작
❌ 백엔드 API 미활용
❌ 상태 공유 불가
❌ 로그인 정보 연결 안 됨

문제:
- "로그인한 유저만 게임 가능" 기능 추가 시
  → 전체 아키텍처 뜯어고쳐야 함
- "선생님 대시보드로 학생 진행 상황 추적" 기능 추가 시
  → 데이터 모델 재설계 필요
```

**영향**: ⭐⭐⭐⭐ (기능 추가 불가)

**해결**: 1주
- React 통합
- Redux 상태 관리
- API 연결

---

## 💪 해결 전략 (Solution Strategy)

### Phase 1: 데이터 지속성 (2주)

```
목표: 사용자가 아무리 새로고침해도 진행 상황 유지

구현:
1. localStorage에 저장
   ├─ 즉각적 효과 (UI 반응)
   └─ 로컬 안전성 제공

2. Backend DB 저장
   ├─ 서버 신뢰성
   └─ 여러 기기 동기화

3. 충돌 해결
   ├─ Vector Clock
   └─ Last-Write-Wins

테스트:
✓ 새로고침 후 진행도 유지
✓ 여러 탭에서 동시 수정
✓ 오프라인 → 온라인 복구
```

**Key Files**:
- `services/PersistenceService.ts`
- `backend/routes/progression.ts`

---

### Phase 2: 서버 검증 (3주)

```
목표: 부정행위 100% 차단

구현:
1. 서버 사이드 검증
   ├─ 클라이언트 → 코드만 전송
   └─ 서버 → 검증, 실행, 채점

2. 샌드박스 실행
   ├─ Docker (격리된 환경)
   ├─ Pyodide (Python 웹 실행)
   └─ Node VM (JavaScript)

3. 부정행위 감지
   ├─ 너무 빨리 푼 경우
   ├─ 정확히 같은 코드
   ├─ 비정상 패턴
   └─ 자동 신고

테스트:
✓ F12로 부정행위 시도 → 차단
✓ 코드 실행 후 자동 채점
✓ 감시 로그 기록
```

**Key Files**:
- `services/CodeValidationService.ts`
- `services/CodeSandboxService.ts`
- `backend/routes/validation.ts`

---

### Phase 3: 데이터 기반 설계 (2주)

```
목표: 에피소드 100개도 쉽게 관리

구현:
1. 데이터 모델
   ├─ Episode (1~100개)
   ├─ Mission (미션별 상세)
   └─ ValidationRule (검증 규칙)

2. React 컴포넌트
   ├─ StoryEngine (데이터 읽음)
   ├─ MissionPanel (동적 렌더)
   └─ CodeEditor (템플릿 자동 로드)

3. 데이터 마이그레이션
   ├─ story.html → JSON
   ├─ 하드코딩 제거
   └─ 재사용 가능한 구조

테스트:
✓ 새 에피소드 추가 (5분)
✓ 디자인 변경 (1파일만 수정)
✓ 다언어 지원 (JSON 하나면 됨)
```

**Key Files**:
- `shared/types/Episode.ts`
- `components/StoryEngine.tsx`
- `data/episodes.json`

---

### Phase 4: 통합 아키텍처 (1주)

```
목표: 백엔드와 프론트엔드 완전 통합

구현:
1. React 통합
   ├─ StoryPage 컴포넌트
   ├─ Redux 상태 관리
   └─ API 미들웨어

2. 인증 연결
   ├─ 로그인 필수
   ├─ 토큰 기반 API 호출
   └─ 권한 확인

3. 데이터 흐름
   ├─ Backend DB → API → Redux → React
   └─ 양방향 동기화

테스트:
✓ 로그인 사용자만 접근
✓ 실시간 점수 동기화
✓ 여러 탭 안전성
```

**Key Files**:
- `pages/StoryPage.tsx`
- `store/storySlice.ts`
- `middleware/api.ts`

---

## 📊 리소스 할당 (Resource Allocation)

### 팀 구성 (가정)

```
┌─ Backend Lead (1명)
│   ├─ PersistenceService
│   ├─ CodeValidationService
│   └─ API 엔드포인트
│
├─ Frontend Lead (1명)
│   ├─ StoryEngine 컴포넌트
│   ├─ Redux 통합
│   └─ UI/UX 리팩토링
│
├─ DevOps/Infra (1명)
│   ├─ Docker 샌드박스
│   ├─ 배포 파이프라인
│   └─ 모니터링
│
└─ QA/Testing (1명)
    ├─ E2E 테스트
    ├─ 부정행위 테스트
    └─ 성능 테스트
```

### 시간 배분

```
Phase 1 (2주) - 2명 (Backend + Frontend)
Phase 2 (3주) - 2.5명 (Backend + DevOps + QA)
Phase 3 (2주) - 2명 (Frontend + QA)
Phase 4 (1주) - 2명 (Backend + Frontend)
───────────────────
Total: 8주, 평균 2명 투입
```

---

## ✅ 성공 기준 (Success Criteria)

### Phase 1: 데이터 지속성 ✓
- [ ] localStorage 저장/복원 작동
- [ ] Backend 동기화 작동
- [ ] 새로고침 후 진행도 100% 유지
- [ ] 여러 기기 간 동기화 성공

### Phase 2: 서버 검증 ✓
- [ ] F12로 부정행위 시도 차단
- [ ] 코드 샌드박스 실행 성공
- [ ] 부정행위 감지 정확도 > 95%
- [ ] 감시 로깅 활성화

### Phase 3: 데이터 설계 ✓
- [ ] 새 에피소드 추가 시간 < 30분
- [ ] 디자인 변경 1파일만 수정
- [ ] 데이터 검증 스키마 작동
- [ ] 에피소드 100개 렌더링 성능 OK

### Phase 4: 통합 아키텍처 ✓
- [ ] 모든 API 엔드포인트 연결
- [ ] Redux ↔ Backend 동기화 완벽
- [ ] 인증 필수 작동
- [ ] E2E 테스트 100% 통과

---

## 🚀 Go-Live 체크리스트

```
배포 전 최종 확인:

기능 (Features):
☐ 모든 주요 기능 구현
☐ E2E 테스트 100% 통과
☐ 부정행위 감지 활성화

성능 (Performance):
☐ 평균 응답 시간 < 500ms
☐ 페이지 로드 시간 < 3초
☐ 99.9% 가용성 보장

보안 (Security):
☐ HTTPS 적용
☐ 입력 검증 완벽
☐ SQL Injection 방어
☐ XSS 방어
☐ CSRF 토큰 적용

운영 (Operations):
☐ 모니터링 대시보드 구성
☐ 에러 로깅 설정
☐ 백업 전략 수립
☐ 장애 대응 계획 수립

문서 (Documentation):
☐ API 문서 완성
☐ 배포 매뉴얼 작성
☐ 운영 가이드 작성
☐ 사용자 가이드 작성

승인 (Approval):
☐ CTO 최종 검토
☐ 보안팀 승인
☐ 운영팀 승인
☐ 경영진 승인
```

---

## 🎓 학습 목표 (Learning Outcomes)

이 프로젝트를 통해 얻을 수 있는 기술 역량:

### Backend 개발자
```
✓ 데이터 지속성 패턴 (localStorage → Server → DB)
✓ 서버 사이드 검증 (OWASP)
✓ 샌드박싱 기술 (Docker, VM)
✓ 부정행위 감지 알고리즘
✓ 충돌 해결 전략 (Vector Clocks)
```

### Frontend 개발자
```
✓ 데이터 기반 UI 설계
✓ Redux 패턴 (대규모 상태 관리)
✓ React 고급 패턴
✓ API 통합 전략
✓ 성능 최적화
```

### DevOps 엔지니어
```
✓ Docker 컨테이너 격리
✓ CI/CD 파이프라인
✓ 모니터링 시스템
✓ 배포 전략 (Blue-Green, Canary)
✓ 장애 복구 시나리오
```

---

## 📞 다음 단계

### 이번 주
1. **문서 검토** (CTO + Tech Lead)
   - 4대 갭 분석 합의
   - 우선순위 확정

2. **팀 토론** (전체 팀)
   - 리소스 할당 논의
   - 일정 확정

3. **Sprint 계획**
   - Phase 1 상세 계획
   - 작업 분배

### 다음 주
1. **Phase 1 시작**
   - PersistenceService 구현 시작
   - Backend 엔드포인트 작성

2. **주간 스탠드업**
   - 진행 상황 공유
   - 블로킹 이슈 해결

---

## 💡 최종 의견

### MVP vs Product

```
MVP (현재):
- ✅ 기능 완성: 100%
- ✅ 테스트: 100%
- ❌ 프로덕션 준비: 40%

Product (목표, 8주 후):
- ✅ 기능 완성: 100%
- ✅ 테스트: 100%
- ✅ 프로덕션 준비: 100%

+ 안정성, 보안, 확장성 달성
```

### 이 문서의 의미

> 이제 여러분은 **"왜"** 각 단계가 필요한지,
> **"어떻게"** 구현할지,
> **"언제까지"** 걸릴지를 정확히 알고 있습니다.
>
> 다음은 행동(Execution)만 남았습니다.

---

## 📚 참고 자료

- [PersistenceService 구현](./docs/PRODUCTION_READINESS_ROADMAP.md#1️⃣-데이터-지속성-data-persistence)
- [서버 검증 구현](./docs/PRODUCTION_READINESS_ROADMAP.md#2️⃣-보안-및-부정행위-방지-server-side-validation)
- [데이터 기반 설계](./docs/PRODUCTION_READINESS_ROADMAP.md#3️⃣-확장성-scalability--data-driven-design)
- [통합 아키텍처](./docs/PRODUCTION_READINESS_ROADMAP.md#4️⃣-통합-아키텍처-unified-architecture)

---

**작성자**: Claude Code
**최종 업데이트**: 2025-12-05
**상태**: ✅ 전략 수립 완료 → 팀 검토 대기

