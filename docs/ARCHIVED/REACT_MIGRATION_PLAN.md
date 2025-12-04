# React 마이그레이션 계획: story.html → React 컴포넌트

## 개요

현재 `frontend/public/story.html`은 **728라인의 Vanilla JS/HTML** 파일로 작성되어 있습니다. 이는 MVP 개발을 위한 일회성 구현이었지만, **장기적으로는 기술 부채가 될 수 있습니다**.

### 현재 상태의 문제점

1. **아키텍처 파편화**
   - 메인 앱은 React + TypeScript + Tailwind로 구성
   - story.html은 Vanilla JS + inline CSS
   - 상태 공유 불가능 (로그인 정보, 벨 획득 내역, 프로그레스 등)

2. **코드 중복**
   - 버튼 스타일, 헤더, 모달 등을 React와 HTML CSS에서 이중 관리
   - 디자인 변경 시 두 곳을 모두 수정해야 함

3. **유지보수 어려움**
   - 상태 관리 로직이 명확하지 않음
   - 테스트 작성이 어려움 (Playwright E2E만 가능)
   - 재사용 가능한 컴포넌트 분리 불가능

4. **확장성 제한**
   - 새로운 에피소드 추가 시 HTML 파일 자체를 수정해야 함
   - 프로그래밍 언어 변경 시 (Python → Java → C) 검증 로직을 새로 작성해야 함

---

## 마이그레이션 전략

### Phase 1: 준비 (1-2주)

#### 1.1 현재 story.html 분석
- [x] 기능 목록 파악
  - Mission 1~3 (변수 선언, 이자 계산, 타입 캐스팅)
  - 코드 검증 로직 (normalizeCode, validatePattern)
  - UI 상태 관리 (currentScene, progress)
  - 난이도 설정

#### 1.2 기존 React 컴포넌트 구조 분석
- [ ] App.tsx 구조 검토
- [ ] 기존 상태 관리 방식 확인 (Context API vs Redux vs Zustand)
- [ ] 스타일링 방식 확인 (Tailwind, CSS-in-JS)

#### 1.3 데이터 모델 정의
```typescript
// 변경 전: story.html에 하드코딩된 데이터

// 변경 후: 타입 안전 데이터 모델
interface Mission {
  id: string;
  title: string;
  description: string;
  language: 'java' | 'python' | 'cpp'; // 확장성
  validationPatterns: RegExp[];
  successMessage: string;
  errorMessages: Map<string, string>; // 상황별 메시지
}

interface Episode {
  id: string;
  title: string;
  missions: Mission[];
}

interface StudentProgress {
  studentId: string;
  episodeId: string;
  completedMissions: Set<string>;
  totalPoints: number;
  badges: string[];
}
```

### Phase 2: 컴포넌트 설계 (1주)

#### 2.1 React 컴포넌트 트리
```
<App>
  <StoryPage episodeId="ep1">
    <StoryHeader title={episode.title} />
    <ProgressBar completed={progress.length} total={episode.missions.length} />

    <StoryScene missionId={currentMission.id}>
      <SceneImage image={currentMission.image} />
      <Dialogue character="Nook" text={currentMission.dialogue} />

      <CodeEditor
        initialCode={currentMission.template}
        language={currentMission.language}
        onCode={setCode}
      />

      <CodeValidationResult
        passed={validationResult?.passed}
        message={validationResult?.message}
        feedback={nookFeedback}
      />

      <ActionButtons
        onRun={handleRun}
        onReset={handleReset}
        onNext={handleNext}
      />
    </StoryScene>

    <NookCharacter reaction={currentReaction} />
  </StoryPage>
</App>
```

#### 2.2 주요 컴포넌트

| 컴포넌트 | 책임 | 데이터 소스 |
|---------|------|---------|
| `<StoryPage>` | 페이지 레이아웃, 상태 관리 | Redux/Context |
| `<CodeEditor>` | 코드 입력 필드, 구문 강조 | Monaco/Ace Editor |
| `<CodeValidator>` | 코드 검증 로직 | ValidationService |
| `<NookCharacter>` | 너굴 캐릭터, 반응 애니메이션 | MissionProgress |
| `<MissionPanel>` | 미션 정보 표시 | Mission 데이터 |

### Phase 3: 서비스 계층 (1주)

#### 3.1 ValidationService 추상화
```typescript
// 기존: story.html에 하드코딩
if (code.includes('int loan') && code.includes('49800')) { ... }

// 새로운: 서비스 기반
class CodeValidationService {
  normalizeCode(code: string): string { ... }
  validateMission(code: string, mission: Mission): ValidationResult { ... }
  getDetailedFeedback(code: string, mission: Mission): FeedbackMessage { ... }
}
```

#### 3.2 상태 관리 (Redux 권장)
```typescript
// actions/missionActions.ts
export const submitCode = (code: string, missionId: string) => async (dispatch) => {
  const validation = await validationService.validateMission(code, mission);
  dispatch(setValidationResult(validation));

  if (validation.passed) {
    dispatch(completeMission(missionId));
    dispatch(addPoints(mission.points));
  }
};

// reducers/missionReducer.ts
interface MissionState {
  currentMissionId: string;
  completedMissions: Set<string>;
  totalPoints: number;
  validationResult: ValidationResult | null;
}
```

### Phase 4: 점진적 마이그레이션 (2-3주)

#### 4.1 병렬 운영
```bash
# Phase 3 마지막
/story.html        # 기존 (deprecated 표시)
/story-react       # 새로운 (테스트 중)

# Phase 4 완료
/story             # 새로운 (기본값)
/story-legacy      # 기존 (legacy로 표시)
```

#### 4.2 마이그레이션 체크리스트
- [ ] Episode 1 마이그레이션 + 테스트
- [ ] Episode 2 마이그레이션 + 테스트
- [ ] Episode 3 마이그레이션 + 테스트
- [ ] E2E 테스트 통과 (기존과 동일)
- [ ] 사용자 수용 테스트 (UAT)
- [ ] 기존 HTML 파일 제거

### Phase 5: 최적화 및 확장 (지속적)

#### 5.1 기능 확장
- [ ] 다언어 지원 (Python, C++, Rust 등)
- [ ] 협업 코딩 (실시간 공동 작업)
- [ ] 고급 에디터 (Monaco, Ace)
- [ ] 코드 실행 (Pyodide, WebAssembly)

#### 5.2 성능 최적화
- [ ] 지연 로딩 (Lazy loading)
- [ ] 코드 스플리팅 (Code splitting)
- [ ] 캐싱 전략 개선

---

## 구현 세부사항

### CodeValidator 컴포넌트 예시

```tsx
// frontend/src/components/CodeValidator/CodeValidator.tsx
interface CodeValidatorProps {
  code: string;
  mission: Mission;
  onValidationResult: (result: ValidationResult) => void;
}

export const CodeValidator: React.FC<CodeValidatorProps> = ({
  code,
  mission,
  onValidationResult,
}) => {
  const [isValidating, setIsValidating] = React.useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validationService.validateMission(code, mission);
      onValidationResult(result);

      if (result.passed) {
        // NookAIService에서 피드백 생성
        const feedback = await nookAIService.generateFeedback({
          studentId: currentUser.id,
          missionId: mission.id,
          code,
          language: mission.language,
          submittedAt: new Date(),
        });

        dispatch(addFeedback(feedback));
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="code-validator">
      <button onClick={handleValidate} disabled={isValidating}>
        {isValidating ? '검증 중...' : '코드 실행'}
      </button>
    </div>
  );
};
```

---

## 마이그레이션 일정 (예상)

| Phase | 작업 | 기간 | 상태 |
|-------|------|------|------|
| 1 | 준비 + 분석 | 1-2주 | ⏳ 미정 |
| 2 | 컴포넌트 설계 | 1주 | ⏳ 미정 |
| 3 | 서비스 + 상태 관리 | 1주 | ⏳ 미정 |
| 4 | 점진적 마이그레이션 | 2-3주 | ⏳ 미정 |
| 5 | 최적화 + 확장 | 지속적 | ⏳ 미정 |

**전체 예상: 5-8주**

---

## 위험 요소 및 대응책

| 위험 | 영향 | 대응 |
|------|------|------|
| 기존 기능 손실 | 중 | E2E 테스트 커버 (100% 동일 동작) |
| 성능 저하 | 중 | 번들 크기 측정, 코드 스플리팅 적용 |
| 개발 시간 초과 | 높음 | 단계별 릴리스, 점진적 마이그레이션 |
| 사용자 혼동 | 낮음 | 공개 공지, 토론토 기간 설정 |

---

## 이점

1. **통일된 아키텍처**: 전체 앱이 React로 구성
2. **상태 공유**: 로그인 정보, 진행도, 벨 등을 앱 전역에서 관리
3. **테스트 가능**: 유닛 테스트, 통합 테스트 작성 용이
4. **유지보수 개선**: 코드 재사용, 중복 제거
5. **확장성 증대**: 새로운 에피소드, 언어 추가 용이
6. **성능**: 필요시 React 최적화 기법 적용 가능
7. **팀 생산성**: 모든 개발자가 React 패턴 사용

---

## 체크리스트 (TODO)

### 지금 당장 (다음 1주)
- [ ] Phase 1 시작: 현재 story.html 기능 목록화
- [ ] 데이터 모델 정의서 작성
- [ ] 팀 내 마이그레이션 전략 토론

### 단기 (1-2주)
- [ ] 컴포넌트 설계 문서 작성
- [ ] 프로토타입 구현 (Episode 1)
- [ ] E2E 테스트 설계

### 중기 (3-4주)
- [ ] 전체 마이그레이션 구현
- [ ] QA 및 사용자 테스트
- [ ] 기존 HTML 파일 제거

---

## 참고 자료

- [React Best Practices](https://react.dev/)
- [Redux for State Management](https://redux.js.org/)
- [Tailwind CSS with React](https://tailwindcss.com/docs/guides/nextjs)
- [Code Validation Patterns](./CLAUDE.md#code-validation)

---

**작성자**: Claude Code
**작성일**: 2025-12-05
**상태**: 계획 (Plan)
**우선순위**: 높음 (High)
