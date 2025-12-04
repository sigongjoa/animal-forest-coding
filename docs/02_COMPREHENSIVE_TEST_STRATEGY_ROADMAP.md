# 너굴 코딩 플랫폼 - 포괄적 테스트 전략 로드맵

## 📋 개요

이 문서는 **"제대로 된 소프트웨어"**를 만들기 위해 필요한 테스트(Quality Assurance)부터 배포 후 운영(Operations)까지의 **모든 단계**를 정리한 것입니다.

7단계 로드맵:
1. 개발자 테스트 (Code Level)
2. 시스템 및 비기능 테스트 (System Level)
3. 심화 논리 검증 (Advanced Logic)
4. QA 및 사용자 테스트 (Product Level)
5. 배포 및 운영 자동화 (DevOps & CI/CD)
6. 모니터링 및 유지보수 (Observability)
7. 문서화 (Documentation)

---

## 1️⃣ 단계: 개발자 테스트 (Code Level)

### 📌 목표
"코드가 의도한 대로, 에러 없이 작동하는가?"

### 1.1 단위 테스트 (Unit Test)

**정의**: 함수나 클래스 등 가장 작은 단위를 개별적으로 검증

**예시 - 경제 시스템 테스트**:
```typescript
// frontend/src/store/slices/__tests__/economySlice.test.ts
import { economySlice, addBells, applyLoanInterest } from '../economySlice';

describe('Economy Slice', () => {
  let state: EconomyState;

  beforeEach(() => {
    state = {
      bells: 10000,
      loan: 0,
      transactionHistory: []
    };
  });

  it('should add bells correctly', () => {
    const newState = economySlice.reducer(
      state,
      addBells(5000)
    );

    expect(newState.bells).toBe(15000);
    expect(newState.transactionHistory.length).toBe(1);
    expect(newState.transactionHistory[0].type).toBe('INCOME');
  });

  it('should apply loan interest correctly', () => {
    state.loan = 1000;
    const newState = economySlice.reducer(
      state,
      applyLoanInterest()
    );

    expect(newState.loan).toBe(1050); // 1000 * 1.05
  });

  it('should prevent integer overflow', () => {
    state.bells = Number.MAX_SAFE_INTEGER - 100;

    const newState = economySlice.reducer(
      state,
      addBells(200)
    );

    // 오버플로우 방지 또는 경고
    expect(newState.bells).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  });
});
```

**테스트 커버리지 목표**: 80% 이상

**추천 도구**:
- **Jest** (React/Node.js 표준)
- **Vitest** (Vite 기반, 더 빠름)
- **Mocha** (구성 유연함)

**실행 방법**:
```bash
npm run test:unit -- --coverage
```

---

### 1.2 통합 테스트 (Integration Test)

**정의**: 모듈 간의 상호작용(DB, API 등)을 검증

**예시 - 백엔드 코드 실행 API 테스트**:
```typescript
// backend/src/__tests__/CodeExecutionAPI.integration.test.ts
import request from 'supertest';
import app from '../app';

describe('Code Execution API', () => {
  it('should execute Java code and return results', async () => {
    const response = await request(app)
      .post('/api/code/execute')
      .send({
        code: `
          public int calculateSum(int[] arr) {
            int sum = 0;
            for(int i = 0; i < arr.length; i++) {
              sum += arr[i];
            }
            return sum;
          }
        `,
        testCases: [
          { input: [[1, 2, 3]], expectedOutput: 6 },
          { input: [[10, 20]], expectedOutput: 30 }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.results.length).toBe(2);
    expect(response.body.results[0]).toBe(6);
  });

  it('should handle compilation errors gracefully', async () => {
    const response = await request(app)
      .post('/api/code/execute')
      .send({
        code: 'int x = ;', // 문법 오류
        testCases: []
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Syntax');
  });

  it('should handle timeout', async () => {
    const response = await request(app)
      .post('/api/code/execute')
      .send({
        code: `
          while(true) {} // 무한 루프
        `,
        testCases: []
      });

    expect(response.status).toBe(408); // Timeout
    expect(response.body.error).toContain('timeout');
  });
});
```

**추천 도구**:
- **Supertest** (Express/Node.js API 테스트)
- **pytest-django** (Django 백엔드)
- **Jest** (전체 통합 테스트)

---

### 1.3 정적 분석 (Static Analysis)

**정의**: 코드를 실행하지 않고 문법 오류, 스타일, 잠재적 버그를 검사

**예시 도구 설정**:
```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-implicit-coercion": "error",
    "eqeqeq": ["error", "always"],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

```python
# backend/pyproject.toml (Python)
[tool.mypy]
python_version = "3.9"
strict = true
disallow_untyped_defs = true
```

**실행 방법**:
```bash
npm run lint
mypy backend/src
pylint backend/src
```

**체크리스트**:
- [ ] ESLint/Pylint 설정 완료
- [ ] Type checking 활성화 (TypeScript/mypy)
- [ ] Husky pre-commit hook 설정

---

## 2️⃣ 단계: 시스템 및 비기능 테스트 (System Level)

### 📌 목표
"시스템이 안정적이고, 빠르고, 안전한가?"

### 2.1 E2E 테스트 (End-to-End)

**정의**: 사용자의 시작부터 끝까지의 흐름을 실제 브라우저 환경에서 시뮬레이션

**예시 - 미션 완료 E2E 테스트**:
```typescript
// e2e/mission_complete.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mission Completion Flow', () => {
  test('should complete mission_01_variables', async ({ page }) => {
    // 1. IDE 페이지 접속
    await page.goto('http://localhost:3000/ide');
    await expect(page).toHaveTitle(/IDE/);

    // 2. 미션 선택
    await page.click('button:has-text("Mission 1: Variables")');
    await expect(page.locator('.mission-description')).toContainText('Initialize a variable');

    // 3. 코드 작성
    await page.locator('.code-editor').click();
    await page.keyboard.type('int x = 10;');

    // 4. 실행
    await page.click('button:has-text("Run")');

    // 5. 성공 메시지 확인
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.points')).toContainText('100 points');

    // 6. 게임 상태 변경 확인
    await expect(page.locator('.bells-display')).toContainText('5000 bells'); // 이전: 0 → 5000
  });

  test('should show error for incorrect solution', async ({ page }) => {
    await page.goto('http://localhost:3000/ide');
    await page.click('button:has-text("Mission 1: Variables")');

    // 잘못된 코드
    await page.locator('.code-editor').click();
    await page.keyboard.type('int x;'); // 초기화 안함

    await page.click('button:has-text("Run")');

    // 오류 표시
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.hint')).toBeVisible();
  });

  test('should display dialogue after mission', async ({ page }) => {
    await page.goto('http://localhost:3000/ide');
    await page.click('button:has-text("Mission 1: Variables")');

    // 올바른 코드 실행
    await page.locator('.code-editor').click();
    await page.keyboard.type('int x = 10; System.out.println(x);');
    await page.click('button:has-text("Run")');
    await page.click('button:has-text("Continue")');

    // 너굴 대화 표시
    await expect(page.locator('[data-character="tom-nook"]')).toBeVisible();
    await expect(page.locator('.dialogue-text')).toContainText('Great job!');
  });
});
```

**추천 도구**:
- **Playwright** (모던, 빠름, 다중 브라우저)
- **Cypress** (DX 우수, 디버깅 용이)
- **Selenium** (레거시, 안정적)

**실행 방법**:
```bash
npx playwright test e2e/
npx playwright test --headed  # 브라우저 보이기
```

---

### 2.2 성능/부하 테스트 (Performance)

**정의**: 트래픽이 몰릴 때 시스템의 응답 속도와 안정성 검증

**예시 - k6 성능 테스트**:
```javascript
// performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,           // 동시 사용자 100명
  duration: '30s',    // 30초 동안
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 응답이 500ms 이하
    http_req_failed: ['rate<0.1'],    // 실패율 10% 이하
  },
};

export default function () {
  // 1. 코드 실행 요청
  const execResponse = http.post(
    'http://localhost:5000/api/code/execute',
    JSON.stringify({
      code: 'int x = 10;',
      testCases: []
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(execResponse, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // 2. 게임 상태 조회
  const stateResponse = http.get('http://localhost:3000/api/game/state');
  check(stateResponse, {
    'state loaded': (r) => r.status === 200,
  });

  sleep(1);
}
```

**실행 방법**:
```bash
k6 run performance/load-test.js
```

**성능 목표**:
| 지표 | 목표 |
|------|------|
| API 응답 시간 (p95) | < 500ms |
| 동시 사용자 100명 | 실패율 < 10% |
| TileGrid 렌더링 | < 100ms (80x80) |

---

### 2.3 보안 스캔 (Security/SAST)

**정의**: 코드 내의 보안 취약점(해킹 위험) 자동 탐지

**예시 - SonarQube 설정**:
```yaml
# sonar-project.properties
sonar.projectKey=animal-forest-coding
sonar.projectName=Animal Forest Coding Platform
sonar.sources=src
sonar.exclusions=node_modules/**,**/*.test.ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.security.hotspots.reviewed.percentage=100
```

**추천 도구**:
- **SonarQube** (완전한 코드 품질 분석)
- **Bandit** (Python 보안)
- **npm audit** (의존성 취약점)
- **OWASP Dependency-Check**

**실행 방법**:
```bash
npm audit
npm audit fix
npx bandit -r backend/src
```

**체크리스트**:
- [ ] SQL Injection 방지
- [ ] XSS(Cross-Site Scripting) 방지
- [ ] CSRF 토큰 검증
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] API 인증/인가 검증

---

## 3️⃣ 단계: 심화 논리 검증 (Advanced Logic)

### 📌 목표
"수학적 무결성과 엣지 케이스를 완벽하게 방어하는가?"

### 3.1 속성 기반 테스트 (Property-based Testing)

**정의**: 수천 개의 무작위 값을 대입하여 '불변의 법칙'이 깨지는지 검증

**예시 - fast-check**:
```typescript
// src/__tests__/economySlice.property.test.ts
import fc from 'fast-check';
import { economySlice, addBells } from '../economySlice';

describe('Economy Slice - Property Based Tests', () => {
  it('should maintain invariant: bells >= 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100000, max: 100000 }),
        (amount) => {
          let state = {
            bells: 1000,
            loan: 0,
            transactionHistory: []
          };

          // 수많은 무작위 추가/제거
          const updatedState = economySlice.reducer(state, addBells(amount));

          // 불변식: bells는 항상 0 이상
          return updatedState.bells >= 0 || amount < 0; // 음수면 0 이상 유지
        }
      )
    );
  });

  it('should satisfy commutativity: order doesnt matter', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 0, max: 10000 }),
        (a, b) => {
          let state1 = { bells: 0, loan: 0, transactionHistory: [] };
          let state2 = { ...state1 };

          // State 1: a 추가 후 b 추가
          state1 = economySlice.reducer(state1, addBells(a));
          state1 = economySlice.reducer(state1, addBells(b));

          // State 2: b 추가 후 a 추가
          state2 = economySlice.reducer(state2, addBells(b));
          state2 = economySlice.reducer(state2, addBells(a));

          // 두 결과가 같아야 함
          return state1.bells === state2.bells;
        }
      )
    );
  });
});
```

**추천 도구**:
- **fast-check** (JavaScript/TypeScript)
- **Hypothesis** (Python)
- **QuickCheck** (Haskell)

---

### 3.2 데이터 무결성 테스트 (Data Integrity)

**정의**: 데이터의 정확성, 유실 여부, 정밀도(소수점 등) 검증

**예시 - DB 데이터 무결성**:
```typescript
// backend/src/__tests__/DataIntegrity.test.ts
import { AppDataSource } from '../data-source';
import { User, GameProgress } from '../entities';

describe('Data Integrity Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should maintain foreign key constraints', async () => {
    const userRepository = AppDataSource.getRepository(User);
    const progressRepository = AppDataSource.getRepository(GameProgress);

    // 유저 생성
    const user = await userRepository.save({ username: 'student1' });

    // 진행도 생성
    const progress = await progressRepository.save({
      userId: user.id,
      completedMissions: 5,
      totalPoints: 500
    });

    // 유저 삭제 시 진행도도 함께 삭제되는지 확인
    await userRepository.remove(user);

    const orphanedProgress = await progressRepository.findBy({
      userId: user.id
    });

    expect(orphanedProgress).toHaveLength(0);
  });

  it('should prevent data loss during transaction', async () => {
    const userRepository = AppDataSource.getRepository(User);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.save(User, {
        username: 'student2'
      });

      throw new Error('Simulated error');
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // 롤백되었으므로 데이터 없음
    const savedUser = await userRepository.findBy({ username: 'student2' });
    expect(savedUser).toHaveLength(0);
  });

  it('should handle decimal precision in economy calculations', async () => {
    // 이자율 계산: 10원 단위 오차 없음
    const principal = 100000;
    const rate = 0.05;
    const period = 12;

    const compound = principal * Math.pow(1 + rate, period);

    // 동전으로 환산 (최소 단위)
    const bellsTotal = Math.round(compound);

    expect(bellsTotal % 1).toBe(0); // 정수
    expect(bellsTotal).toBeGreaterThan(principal);
  });
});
```

---

## 4️⃣ 단계: QA 및 사용자 테스트 (Product Level)

### 📌 목표
"사용자가 만족하는가? 비즈니스 가치가 있는가?"

### 4.1 사용성 테스트 (Usability)

**정의**: UI/UX의 편의성과 직관성을 평가

**테스트 시나리오**:
```markdown
## Scenario 1: 신규 사용자 온보딩

1. 사용자가 처음 로그인했을 때
   - 기대: 튜토리얼이 자동으로 시작
   - 확인: [필수] 너굴이 환영 메시지 표시

2. IDE 페이지 진입
   - 기대: 설명 없이도 버튼 기능 이해 가능
   - 확인: [필수] "Run", "Reset", "Hint" 버튼이 명확

3. 코드 실행
   - 기대: 성공/실패 상태 즉시 파악
   - 확인: [필수] 녹색/빨간색 배경 구분

## Scenario 2: 힌트 시스템

1. 사용자가 "Hint" 버튼 클릭
   - 기대: 진행적 힌트 공개 (1차 → 2차 → 3차)
   - 확인: [필수] 각 힌트는 이전보다 구체적

2. 정답 직전 힌트
   - 기대: 스포일러 아님 (코드 구조만 제시)
   - 확인: [권장] 완전한 코드는 보여주지 않음
```

**수행 방법**:
- A/B 테스트: 사용자 그룹 2~5명 분할, 각각 다른 UI 테스트
- 태스크 기반 테스트: "미션 1 완료해보세요" 지시 후 행동 관찰
- 인터뷰: 사용 후 "어떤 부분이 헷갈렸나요?"

---

### 4.2 호환성 테스트 (Compatibility)

**정의**: 다양한 기기(PC, 모바일)와 브라우저에서의 동작 확인

**테스트 매트릭스**:

| 브라우저 | Windows | macOS | iOS | Android |
|---------|---------|-------|-----|---------|
| Chrome (최신) | ✅ | ✅ | N/A | ✅ |
| Safari (최신) | N/A | ✅ | ✅ | N/A |
| Firefox (최신) | ✅ | ✅ | N/A | ✅ |
| Edge (최신) | ✅ | ✅ | N/A | N/A |

**테스트 체크리스트**:
- [ ] 터치 이벤트 (모바일)
- [ ] 반응형 레이아웃 (768px, 1024px, 1440px)
- [ ] 성능 (CPU 저사양 디바이스에서도 60fps)
- [ ] 접근성 (스크린 리더, 키보드 네비게이션)

**도구**:
- **BrowserStack**: 실제 기기 테스트
- **Sauce Labs**: 클라우드 기반 브라우저
- **Chrome DevTools**: 모바일 에뮬레이션

---

### 4.3 탐색적 테스트 (Exploratory Testing)

**정의**: 정해진 시나리오 없이 QA의 직관으로 자유롭게 테스트

**테스트 차터 (Test Charter)** - 30분 타이머:
```
시간: 30분
테스트 대상: Mission 2 (Control Flow)
집중 영역: "뭔가 이상한 게 있을까?"

예상 테스트 활동:
- 코드를 여러 번 실행하면 상태 초기화되나?
- 오류 메시지 후 다시 실행하면 이전 오류가 남나?
- 매우 긴 코드(1000줄)는 처리되나?
- 특수 문자($, @, #)가 포함되면?
- 동시에 여러 미션을 실행하면?

발견 사항:
- [ ] 버그 1: ...
- [ ] 개선 사항 1: ...
```

---

### 4.4 시각적 회귀 (Visual Regression)

**정의**: 업데이트 전후의 화면 픽셀을 비교하여 UI 깨짐 방지

**예시 - Percy**:
```typescript
// e2e/visual-regression.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('should render IDE without visual regressions', async ({ page }) => {
  await page.goto('http://localhost:3000/ide');
  await page.waitForSelector('.ide-container');

  // Percy 스냅샷 캡처
  await percySnapshot(page, 'IDE Page');
});

test('should render dialogue without regressions', async ({ page }) => {
  await page.goto('http://localhost:3000/ide');
  await page.click('button:has-text("Mission 1")');
  await page.locator('.code-editor').click();
  await page.keyboard.type('int x = 10;');
  await page.click('button:has-text("Run")');

  await percySnapshot(page, 'Dialogue Overlay');
});
```

**도구**:
- **Percy.io**: 클라우드 기반 시각 회귀
- **Pixelmatch**: 오픈소스, 로컬 실행
- **Applitools**: AI 기반 시각 검증

---

## 5️⃣ 단계: 배포 및 운영 자동화 (DevOps & CI/CD)

### 📌 목표
"테스트를 통과한 코드가 사람 손을 안 타고 안전하게 배포되는가?"

### 5.1 CI (지속적 통합)

**정의**: 코드가 수정될 때마다 자동으로 테스트를 실행

**.github/workflows/ci.yml**:
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      # 1. 의존성 설치
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci

      # 2. 린트 검사
      - run: npm run lint

      # 3. 타입 검사
      - run: npm run type-check

      # 4. 단위 테스트
      - run: npm run test:unit -- --coverage

      # 5. 통합 테스트
      - run: npm run test:integration

      # 6. 성능 테스트 (선택)
      - run: npm run test:performance || true

      # 7. 보안 스캔
      - run: npm audit --audit-level=moderate

      # 8. 커버리지 업로드
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run build:backend

      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            frontend/build
            backend/dist
```

---

### 5.2 CD (지속적 배포)

**정의**: 테스트를 통과하면 자동으로 서버에 업로드 및 배포

**.github/workflows/cd.yml** (AWS를 예시로):
```yaml
name: CD Pipeline

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      # 1. AWS 자격증명 설정
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-1

      # 2. Docker 이미지 빌드
      - run: |
          docker build -t animal-forest-coding:${{ github.sha }} .
          docker tag animal-forest-coding:${{ github.sha }} animal-forest-coding:latest

      # 3. ECR에 푸시
      - run: |
          aws ecr get-login-password --region ap-southeast-1 | \
          docker login --username AWS --password-stdin ${{ secrets.AWS_ECR_URL }}
          docker push ${{ secrets.AWS_ECR_URL }}/animal-forest-coding:${{ github.sha }}

      # 4. ECS 서비스 업데이트
      - run: |
          aws ecs update-service \
            --cluster animal-forest-coding \
            --service app \
            --force-new-deployment

      # 5. 배포 후 헬스 체크
      - run: |
          sleep 60
          curl -f https://app.animalforestcoding.com/health || exit 1

      # 6. 배포 알림
      - uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Production deployment successful",
              "attachments": [
                {
                  "text": "Commit: ${{ github.sha }}"
                }
              ]
            }
```

---

### 5.3 인프라 코드화 (IaC)

**정의**: 서버 세팅(네트워크, OS 등)을 코드로 관리

**예시 - Terraform**:
```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "animal-forest-vpc"
  }
}

# EC2 인스턴스
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 LTS
  instance_type = "t3.medium"
  vpc_security_group_ids = [aws_security_group.app.id]

  tags = {
    Name = "animal-forest-app"
  }
}

# RDS 데이터베이스
resource "aws_db_instance" "main" {
  identifier     = "animal-forest-db"
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.micro"
  allocated_storage = 20

  db_name  = "animalforest"
  username = var.db_username
  password = var.db_password

  skip_final_snapshot = false
  final_snapshot_identifier = "animal-forest-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name = "animal-forest-db"
  }
}

output "app_ip" {
  value = aws_instance.app_server.public_ip
}
```

**배포 명령**:
```bash
terraform init
terraform plan
terraform apply
```

---

## 6️⃣ 단계: 모니터링 및 유지보수 (Observability)

### 📌 목표
"배포 후 문제가 생겼을 때 바로 알 수 있는가?"

### 6.1 에러 트래킹 (Logging)

**정의**: 실시간으로 발생하는 에러 로그를 수집 및 알림

**예시 - Sentry**:
```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// 백엔드
import Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.errorHandler());

// 에러 발생시 자동 캡처
app.post('/api/code/execute', async (req, res) => {
  try {
    const result = await executeCode(req.body);
    res.json(result);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Code execution failed' });
  }
});
```

---

### 6.2 성능 모니터링 (APM)

**정의**: 서버의 CPU, 메모리, 응답 속도 등을 그래프로 시각화

**예시 - Prometheus + Grafana**:
```typescript
// backend/src/middleware/metrics.ts
import { Registry, Counter, Histogram } from 'prom-client';

const register = new Registry();

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const codeExecutionDuration = new Histogram({
  name: 'code_execution_duration_seconds',
  help: 'Duration of code execution in seconds',
  labelNames: ['mission_id', 'success'],
  registers: [register]
});

// Express 미들웨어
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
});

// 메트릭 엔드포인트
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

**Grafana 대시보드**:
- 응답 시간 분포 (p50, p95, p99)
- 오류율 추이
- 메모리 사용량
- CPU 사용률
- 데이터베이스 쿼리 시간

---

### 6.3 사용자 행동 분석 (Analytics)

**정의**: 사용자가 실제로 어떤 버튼을 많이 누르는지 추적

**예시 - Google Analytics**:
```typescript
// frontend/src/utils/analytics.ts
import { Analytics } from "@segment/analytics-next";

const analytics = new Analytics();

export const trackEvent = (eventName: string, properties?: any) => {
  analytics.track(eventName, properties);
};

// 사용 예시
export const trackMissionStart = (missionId: string) => {
  trackEvent('mission_started', { mission_id: missionId });
};

export const trackCodeRun = (missionId: string, success: boolean) => {
  trackEvent('code_executed', {
    mission_id: missionId,
    success: success
  });
};

export const trackHintViewed = (missionId: string, hintLevel: number) => {
  trackEvent('hint_viewed', {
    mission_id: missionId,
    hint_level: hintLevel
  });
};
```

**분석 지표**:
- 가장 인기 있는 미션
- 평균 완료 시간
- 힌트 사용률
- 드롭아웃 지점 (사용자가 떠나는 지점)

---

## 7️⃣ 단계: 문서화 (Documentation)

### 📌 목표
"개발자가 없어져도 이 소프트웨어를 유지보수할 수 있는가?"

### 7.1 API 문서

**예시 - Swagger**:
```typescript
// backend/src/routes/code.ts
import { Router } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';

const router = Router();

/**
 * @swagger
 * /api/code/execute:
 *   post:
 *     summary: Execute student code
 *     description: Compiles and executes the provided code against test cases
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Student's code
 *               missionId:
 *                 type: string
 *               testCases:
 *                 type: array
 *     responses:
 *       200:
 *         description: Execution completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 output:
 *                   type: string
 *                 errors:
 *                   type: array
 */
router.post('/execute', executeCode);

export default router;
```

**생성 및 배포**:
```bash
npm run swagger-generate
# http://localhost:5000/api-docs에 Swagger UI 표시
```

---

### 7.2 README & Wiki

**체크리스트**:
- [ ] 프로젝트 설치법
- [ ] 로컬 개발 환경 세팅
- [ ] 아키텍처 구조
- [ ] 폴더 구조
- [ ] 기여 가이드 (Code Review 프로세스)
- [ ] 배포 절차
- [ ] 트러블슈팅

---

## 📊 최종 테스트 실행 계획

### 매주 테스트 스케줄
```
월: 개발 테스트 (Unit + Integration)
화: 시스템 테스트 (E2E + Performance)
수: 보안 + 품질 점검
목: QA 테스트 (사용성 + 호환성)
금: 배포 & 모니터링 점검
```

### 테스트 커버리지 목표
| 영역 | 목표 | 현재 |
|------|------|------|
| 단위 테스트 | 80% | - |
| 통합 테스트 | 70% | - |
| E2E 테스트 | 모든 사용자 시나리오 | - |
| 보안 취약점 | 0개 (Critical) | - |

