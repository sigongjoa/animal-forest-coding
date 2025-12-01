# StoryPage 테스트 계획 및 유즈 케이스

## 1. 유즈 케이스 정의

### UC-1: 스토리 페이지 진입 (로그인 후)
**전제조건**: 사용자가 로그인 성공
**흐름**:
1. 로그인 폼에 credentials 입력
2. "로그인" 버튼 클릭
3. 백엔드 API 호출 (/api/login)
4. 토큰 저장 및 /story로 리다이렉트
**기대결과**: StoryPage 렌더링, Scene 1 표시, Tom Nook 대사 시작

### UC-2: 텍스트 타이핑 애니메이션
**전제조건**: StoryPage 표시됨
**흐름**:
1. 첫 대사 자동 재생
2. 문자별로 순차 표시 (50ms 간격)
**기대결과**: 모든 문자가 순서대로 나타남, 커서(▋) 애니메이션

### UC-3: 다음 대사 진행
**전제조건**: 현재 대사가 완료됨
**흐름**:
1. "다음 →" 버튼 클릭
2. currentDialogueIndex 증가
3. displayedText 초기화
4. 다음 대사 타이핑 시작
**기대결과**: 새로운 대사 표시, 진행도 업데이트

### UC-4: 씬 변경
**전제조건**: 현재 씬의 마지막 대사 완료
**흐름**:
1. 마지막 대사에서 "다음 →" 클릭
2. Scene 1 → Scene 2로 변경
3. currentSceneIndex 증가, currentDialogueIndex 초기화
4. 새 배경이미지(img2.jpg) 로드
**기대결과**: 배경이 변경됨, Scene 2의 첫 대사 표시

### UC-5: 스토리 완료 및 IDE 진입
**전제조건**: Scene 2의 마지막 대사 완료
**흐름**:
1. 최종 버튼 "🚀 시작하기" 클릭
2. /ide로 네비게이션
**기대결과**: IDE 페이지로 이동

### UC-6: 스킵 기능
**전제조건**: 어느 스토리 지점에서든
**흐름**:
1. "스킵" 버튼 클릭
2. /ide로 즉시 네비게이션
**기대결과**: 현재 씬/대사 무시하고 IDE로 이동

### UC-7: 진행도 표시
**전제조건**: StoryPage 표시됨
**흐움**:
1. 진행도 표시 확인
2. Scene 및 대사 번호 표시 (e.g., "1 / 2 (3 / 5)")
3. 각 진행 시마다 업데이트
**기대결과**: 정확한 진행도 계산 및 표시

## 2. 단위 테스트 (Unit Tests)

### StoryPage.tsx 테스트
- ✓ 초기 상태: scene 0, dialogue 0
- ✓ 텍스트 타이핑 효과 트리거
- ✓ 다음 대사 핸들러 동작
- ✓ 씬 변경 로직
- ✓ 스킵 핸들러 동작
- ✓ 진행도 계산 정확성

### App.tsx 라우팅 테스트
- ✓ / → /login 리다이렉트
- ✓ /login 경로에 LoginPage 렌더링
- ✓ /story 경로에 StoryPage 렌더링
- ✓ /ide 경로 접근 가능

### LoginPage.tsx 통합 테스트
- ✓ 로그인 성공 시 /story로 리다이렉트
- ✓ 토큰 저장 확인

## 3. E2E 테스트 (Playwright)

### E2E-1: 전체 플로우 테스트
- 로그인 페이지 접속
- Credentials 입력 및 로그인
- StoryPage 자동 로드 확인
- Scene 1 대사 타이핑 애니메이션 재생 확인
- "다음" 버튼으로 대사 진행 (5회)
- Scene 2로 자동 전환 확인
- 최종 대사에서 "🚀 시작하기" 클릭
- IDE 페이지 도달 확인

### E2E-2: 스킵 기능 테스트
- StoryPage 진입
- "스킵" 버튼 클릭
- IDE 페이지 즉시 도달

### E2E-3: 진행도 표시 정확성
- 각 대사 진행 시 진행도 업데이트 확인
- 정확한 번호 표시 (Scene/Dialogue 인덱스)

### E2E-4: 배경이미지 로딩
- Scene 1: img1.jpg 로드 확인
- Scene 2: img2.jpg 로드 확인
- 이미지 404 오류 없음

## 4. 통합 테스트 (Integration Tests)

### Backend 통합
- ✓ /api/login 엔드포인트 동작
- ✓ 유효한 토큰 반환
- ✓ localStorage에 정상 저장

### 라우팅 통합
- ✓ 전체 플로우: /login → /story → /ide
- ✓ URL 변경 감지 및 컴포넌트 변경

### 상태 관리 통합
- ✓ Scene/Dialogue 상태 동기화
- ✓ 타이핑 애니메이션 상태 변환
- ✓ 진행도 계산 정확성

## 5. 테스트 실행 방법

### 1단계: 단위 테스트
```bash
cd frontend
npm test -- --watchAll=false
```

### 2단계: E2E 테스트
```bash
cd frontend
npx playwright install
npm run test:e2e
```

### 3단계: 통합 테스트
```bash
cd frontend
npm run test:integration
```

## 6. 성공 기준

- 모든 유즈 케이스 통과
- 단위 테스트: 100% 통과
- E2E 테스트: 모든 시나리오 통과
- 통합 테스트: 모든 통합 구간 통과
- 백엔드 테스트: pytest로 API 테스트 통과

## 7. 테스트 데이터

### 로그인 credentials
- Username: testuser
- Password: testpass123

### 씬 데이터
- Scene 1: img1.jpg, 5개 대사
- Scene 2: img2.jpg, 6개 대사
- Total: 2 scenes, 11 dialogues
