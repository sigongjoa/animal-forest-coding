# 🧪 Test Design Document (TDD)
## Animal Forest Coding - 테스트 전략 및 설계

**Version**: 1.0
**Last Updated**: 2024-11-30
**Test Framework**: Jest

---

## 📋 목차

1. [개요](#개요)
2. [테스트 전략](#테스트-전략)
3. [단위 테스트](#단위-테스트)
4. [통합 테스트](#통합-테스트)
5. [E2E 테스트](#e2e-테스트)
6. [테스트 커버리지](#테스트-커버리지)
7. [테스트 실행](#테스트-실행)
8. [CI/CD 통합](#cicd-통합)

---

## 개요

### 테스트 피라미드

```
        /\
       /  \          E2E Tests (10%)
      /────\         - 전체 사용자 시나리오
     /      \
    /────────\       Integration Tests (30%)
   /          \      - 서비스 간 상호작용
  /────────────\
 /              \    Unit Tests (60%)
/────────────────\   - 개별 함수/메서드
```

### 테스트 목표
- ✅ 코드 커버리지 80% 이상
- ✅ 버그 조기 발견
- ✅ 리팩토링 안전성 확보
- ✅ 문서화 역할

### 테스트 환경
- **프레임워크**: Jest
- **백엔드**: Jest + Supertest
- **프론트엔드**: Jest + React Testing Library
- **E2E**: Playwright (향후)

---

## 테스트 전략

### 1. 단위 테스트 (Unit Tests) - 60%

**목표**: 개별 함수/메서드의 정확성 검증

**테스트 대상**:
- 비즈니스 로직
- 서비스 클래스 메서드
- 유틸리티 함수
- React 컴포넌트 로직

**예제**:
```typescript
describe('ContentService', () => {
  describe('getContent', () => {
    it('should return content for valid character and topic', () => {
      // Arrange
      const service = new ContentService();

      // Act
      const content = service.getContent('Tom Nook', 'variables');

      // Assert
      expect(content).toBeDefined();
      expect(content.character).toBe('Tom Nook');
      expect(content.topic).toBe('variables');
    });

    it('should throw error for invalid character', () => {
      const service = new ContentService();

      expect(() => {
        service.getContent('Invalid Character', 'variables');
      }).toThrow('Invalid character');
    });
  });
});
```

### 2. 통합 테스트 (Integration Tests) - 30%

**목표**: 서비스 간 상호작용 검증

**테스트 대상**:
- API 엔드포인트
- 여러 서비스의 상호작용
- 데이터 흐름
- 미들웨어

**예제**:
```typescript
describe('POST /api/tts', () => {
  it('should generate TTS audio successfully', async () => {
    const response = await request(app)
      .post('/api/tts')
      .send({
        text: '변수란 무엇일까요?',
        character: 'Tom Nook'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.audioUrl).toBeDefined();
  });

  it('should return 429 on rate limit', async () => {
    // 속도 제한까지 요청 반복
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/tts')
        .send({
          text: '테스트',
          character: 'Tom Nook'
        });
    }

    // 11번째 요청은 실패해야 함
    const response = await request(app)
      .post('/api/tts')
      .send({
        text: '테스트',
        character: 'Tom Nook'
      });

    expect(response.status).toBe(429);
  });
});
```

### 3. E2E 테스트 (End-to-End Tests) - 10%

**목표**: 전체 사용자 흐름 검증

**테스트 시나리오**:
1. 캐릭터 선택
2. 주제 조회
3. 콘텐츠 로드
4. 음성 생성 및 재생

**예제** (향후 Playwright):
```typescript
import { test, expect } from '@playwright/test';

test('Complete learning flow', async ({ page }) => {
  // 홈페이지 이동
  await page.goto('http://localhost:3000');

  // 캐릭터 선택
  await page.click('text=Tom Nook');

  // 주제 선택
  await page.click('text=변수');

  // 콘텐츠 로드 대기
  await page.waitForSelector('text=변수란 무엇일까요');

  // 음성 재생 버튼 클릭
  await page.click('button:has-text("재생")');

  // 음성 재생 확인
  const audioPlayer = await page.$('audio');
  expect(audioPlayer).toBeTruthy();
});
```

---

## 단위 테스트

### 백엔드 단위 테스트

#### ContentService 테스트

```typescript
// backend/src/services/__tests__/ContentService.test.ts
import { ContentService } from '../ContentService';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
  });

  describe('getContent', () => {
    it('should return content by character and topic', () => {
      const content = service.getContent('Tom Nook', 'variables');

      expect(content).toMatchObject({
        character: 'Tom Nook',
        topic: 'variables',
        title: expect.any(String),
        text: expect.any(String)
      });
    });

    it('should throw for non-existent character', () => {
      expect(() => {
        service.getContent('Unknown Character', 'variables');
      }).toThrow('Character not found');
    });

    it('should throw for non-existent topic', () => {
      expect(() => {
        service.getContent('Tom Nook', 'unknown-topic');
      }).toThrow('Topic not found');
    });
  });

  describe('getAllCharacters', () => {
    it('should return array of characters', () => {
      const characters = service.getAllCharacters();

      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
      expect(characters[0]).toHaveProperty('name');
      expect(characters[0]).toHaveProperty('id');
    });
  });

  describe('getAllTopics', () => {
    it('should return array of topics', () => {
      const topics = service.getAllTopics();

      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0]).toHaveProperty('name');
      expect(topics[0]).toHaveProperty('slug');
    });

    it('should filter topics by difficulty', () => {
      const beginnerTopics = service.getAllTopics('beginner');

      beginnerTopics.forEach(topic => {
        expect(topic.difficulty).toBe('beginner');
      });
    });
  });
});
```

#### ImageService 테스트

```typescript
// backend/src/services/__tests__/ImageService.test.ts
import { ImageService } from '../ImageService';
import fs from 'fs';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    service = new ImageService();
  });

  describe('getImage', () => {
    it('should return image buffer', () => {
      const buffer = service.getImage('img_variables_001');

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should throw for non-existent image', () => {
      expect(() => {
        service.getImage('non_existent_image');
      }).toThrow('Image not found');
    });
  });

  describe('getImageMetadata', () => {
    it('should return image metadata', () => {
      const metadata = service.getImageMetadata('img_variables_001');

      expect(metadata).toMatchObject({
        id: expect.any(String),
        filename: expect.any(String),
        mimeType: expect.stringMatching(/^image\//),
        size: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number)
      });
    });
  });
});
```

#### AnimalesesTTSService 테스트

```typescript
// backend/src/services/__tests__/AnimalesesTTSService.test.ts
import { AnimalesesTTSService } from '../AnimalesesTTSService';

describe('AnimalesesTTSService', () => {
  let service: AnimalesesTTSService;

  beforeEach(() => {
    service = new AnimalesesTTSService();
  });

  describe('generateTTS', () => {
    it('should generate audio buffer', async () => {
      const audio = await service.generateTTS(
        '변수란 무엇일까요?',
        'Tom Nook'
      );

      expect(Buffer.isBuffer(audio)).toBe(true);
      expect(audio.length).toBeGreaterThan(0);
    });

    it('should throw for invalid character', async () => {
      await expect(
        service.generateTTS('안녕하세요', 'Unknown')
      ).rejects.toThrow('Invalid character');
    });

    it('should throw for empty text', async () => {
      await expect(
        service.generateTTS('', 'Tom Nook')
      ).rejects.toThrow('Text cannot be empty');
    });

    it('should throw for text exceeding max length', async () => {
      const longText = 'a'.repeat(1001);

      await expect(
        service.generateTTS(longText, 'Tom Nook')
      ).rejects.toThrow('Text exceeds maximum length');
    });
  });

  describe('caching', () => {
    it('should cache generated audio', async () => {
      const text = '캐시 테스트';
      const character = 'Tom Nook';

      // 첫 번째 호출
      const audio1 = await service.generateTTS(text, character);

      // 두 번째 호출 (캐시에서)
      const audio2 = service.getCachedAudio(text, character);

      expect(audio2).toBeDefined();
      expect(audio1).toEqual(audio2);
    });

    it('should return null for uncached audio', () => {
      const audio = service.getCachedAudio('uncached text', 'Tom Nook');
      expect(audio).toBeNull();
    });
  });
});
```

### 프론트엔드 단위 테스트

#### CharacterSelector 컴포넌트 테스트

```typescript
// frontend/src/components/__tests__/CharacterSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterSelector } from '../CharacterSelector';

describe('CharacterSelector', () => {
  const mockCharacters = [
    { id: 'char_tom_nook', name: 'Tom Nook', species: 'Raccoon' },
    { id: 'char_isabelle', name: 'Isabelle', species: 'Shih Tzu' }
  ];

  it('should render character list', () => {
    const onSelect = jest.fn();

    render(
      <CharacterSelector
        characters={mockCharacters}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Tom Nook')).toBeInTheDocument();
    expect(screen.getByText('Isabelle')).toBeInTheDocument();
  });

  it('should call onSelect when character is clicked', () => {
    const onSelect = jest.fn();

    render(
      <CharacterSelector
        characters={mockCharacters}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Tom Nook'));

    expect(onSelect).toHaveBeenCalledWith('Tom Nook');
  });

  it('should highlight selected character', () => {
    const onSelect = jest.fn();

    render(
      <CharacterSelector
        characters={mockCharacters}
        selectedCharacter="Tom Nook"
        onSelect={onSelect}
      />
    );

    const selectedElement = screen.getByText('Tom Nook').closest('div');
    expect(selectedElement).toHaveClass('selected');
  });
});
```

#### useContent Hook 테스트

```typescript
// frontend/src/hooks/__tests__/useContent.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useContent } from '../useContent';

describe('useContent', () => {
  it('should load content successfully', async () => {
    const { result } = renderHook(() =>
      useContent('Tom Nook', 'variables')
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBeDefined();
    expect(result.current.content?.character).toBe('Tom Nook');
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() =>
      useContent('Invalid', 'invalid-topic')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.content).toBeNull();
  });
});
```

---

## 통합 테스트

### API 엔드포인트 테스트

```typescript
// backend/src/__tests__/api.test.ts
import request from 'supertest';
import { createServer } from '../server';

describe('API Endpoints', () => {
  let app: Express.Application;

  beforeAll(() => {
    app = createServer();
  });

  describe('GET /api/characters', () => {
    it('should return all characters', async () => {
      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/content/:character/:topic', () => {
    it('should return content', async () => {
      const response = await request(app)
        .get('/api/content/Tom%20Nook/variables')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.character).toBe('Tom Nook');
    });

    it('should return 404 for invalid character', async () => {
      const response = await request(app)
        .get('/api/content/Invalid/variables')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/images/:imageId', () => {
    it('should return image', async () => {
      const response = await request(app)
        .get('/api/images/img_variables_001')
        .expect(200)
        .expect('Content-Type', /image/);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /api/tts', () => {
    it('should generate TTS successfully', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: '변수란 무엇일까요?',
          character: 'Tom Nook'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.audioUrl).toBeDefined();
    });

    it('should validate input', async () => {
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: '', // 빈 텍스트
          character: 'Tom Nook'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce rate limiting', async () => {
      // 10개 요청 성공
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/tts')
          .send({
            text: `테스트 ${i}`,
            character: 'Tom Nook'
          })
          .expect(200);
      }

      // 11번째 요청 실패
      const response = await request(app)
        .post('/api/tts')
        .send({
          text: '테스트 실패',
          character: 'Tom Nook'
        });

      expect(response.status).toBe(429);
    });
  });
});
```

---

## E2E 테스트

### 사용자 시나리오 (향후 Playwright)

```typescript
// e2e/learning-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Learning Flow', () => {
  test('User can select character and learn', async ({ page }) => {
    // 홈페이지 로드
    await page.goto('http://localhost:3000');

    // 캐릭터 선택
    await page.click('text=Tom Nook');
    await expect(page).toHaveURL(/.*selected=Tom%20Nook/);

    // 주제 선택
    await page.click('text=변수와 데이터 타입');
    await page.waitForNavigation();

    // 콘텐츠 로드 대기
    await page.waitForSelector('text=변수란 무엇일까요');

    // 음성 재생 버튼 확인
    const playButton = page.locator('button:has-text("재생")');
    await expect(playButton).toBeVisible();

    // 음성 재생
    await playButton.click();

    // 오디오 플레이어 확인
    const audio = page.locator('audio');
    await expect(audio).toBeVisible();
  });

  test('User can navigate between topics', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.click('text=Isabelle');
    await page.click('text=제어 흐름');

    // 다음 주제로 이동
    await page.click('button:has-text("다음")');

    // URL이 변경되었는지 확인
    expect(page.url()).toContain('topic=');
  });
});
```

---

## 테스트 커버리지

### 목표

```
전체: 80% 이상
- 라인: 80%
- 브랜치: 75%
- 함수: 85%
- 스테이트먼트: 80%
```

### 제외 파일

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/server.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 80,
      statements: 80
    }
  }
}
```

### 커버리지 리포트

```
======================== Coverage Summary =========================
Statements   : 82% ( 205/250 )
Branches     : 78% ( 110/141 )
Functions    : 86% ( 72/84 )
Lines        : 81% ( 195/240 )
===================================================================
```

---

## 테스트 실행

### 설정 파일

```json
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
}
```

```json
// frontend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.tsx']
}
```

### 명령어

```bash
# 모든 테스트 실행
npm test

# 감시 모드
npm test -- --watch

# 커버리지 리포트 생성
npm test -- --coverage

# 특정 파일 테스트
npm test -- ContentService.test.ts

# E2E 테스트 실행
npm run test:e2e
```

### 패키지.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:all": "npm test && npm run test:e2e"
  }
}
```

---

## CI/CD 통합

### GitHub Actions 워크플로우

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 테스트 모범 사례

### 1. AAA 패턴 사용

```typescript
it('should calculate total correctly', () => {
  // Arrange (준비)
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];

  // Act (실행)
  const total = calculateTotal(items);

  // Assert (검증)
  expect(total).toBe(35);
});
```

### 2. 설명적인 테스트 이름

```typescript
// ❌ 나쁜 예
it('works', () => { ... });

// ✅ 좋은 예
it('should return content for valid character and topic', () => { ... });
```

### 3. 한 가지만 테스트

```typescript
// ❌ 나쁜 예
it('should validate and save content', () => {
  const content = validateContent(data);
  saveContent(content);
  expect(content).toBeDefined();
});

// ✅ 좋은 예
it('should validate content correctly', () => {
  const content = validateContent(data);
  expect(content).toBeDefined();
});

it('should save content to database', () => {
  saveContent(content);
  expect(db.find(id)).toBeDefined();
});
```

### 4. 모킹 및 스텁 활용

```typescript
it('should handle API errors', async () => {
  // API 모킹
  jest.spyOn(apiClient, 'getContent')
    .mockRejectedValueOnce(new Error('API Error'));

  const { result } = renderHook(() => useContent('Tom Nook', 'variables'));

  await waitFor(() => {
    expect(result.current.error).toBeDefined();
  });
});
```

---

**다음 문서**: [DEVELOPMENT.md](DEVELOPMENT.md) - 개발 가이드
**관련 문서**: [SDD.md](SDD.md) - 시스템 설계, [API.md](API.md) - API 명세
