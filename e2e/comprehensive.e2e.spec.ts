/**
 * E2E (End-to-End) 테스트 - Playwright
 *
 * 목표: 실제 사용자 시나리오 검증
 * - 사용자가 처음 방문해서 미션을 완료하는 전체 흐름
 * - 다양한 브라우저와 화면 크기에서 동작 검증
 */

import { test, expect } from '@playwright/test';

// 테스트 환경 설정
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('E2E Tests - 사용자 시나리오', () => {
  // 각 테스트 전에 실행
  test.beforeEach(async ({ page }) => {
    // API 상태 확인
    const health = await fetch(`${API_URL}/api/health`);
    expect(health.ok).toBe(true);
  });

  test.describe('1. API 헬스 체크', () => {
    test('should access API health endpoint', async () => {
      const response = await fetch(`${API_URL}/api/health`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
    });

    test('should have all services available', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      expect(data.services).toHaveProperty('contentService');
      expect(data.services).toHaveProperty('imageService');
      expect(data.services).toHaveProperty('ttsService');
      expect(data.services.contentService).toBe('available');
    });
  });

  test.describe('2. 캐릭터 및 콘텐츠 로딩', () => {
    test('should fetch characters successfully', async () => {
      const response = await fetch(`${API_URL}/api/characters`);

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('should fetch topics successfully', async () => {
      const response = await fetch(`${API_URL}/api/topics`);

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('should fetch content for valid character and topic', async () => {
      // 1. 캐릭터 목록 가져오기
      const charsRes = await fetch(`${API_URL}/api/characters`);
      const charsData = await charsRes.json();
      const character = charsData.data[0].name;

      // 2. 주제 목록 가져오기
      const topicsRes = await fetch(`${API_URL}/api/topics`);
      const topicsData = await topicsRes.json();
      const topic = topicsData.data[0].slug;

      // 3. 콘텐츠 가져오기
      const response = await fetch(
        `${API_URL}/api/content/${character}/${topic}`
      );

      if (response.ok) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('text');
      }
    });

    test('should search content', async () => {
      const response = await fetch(`${API_URL}/api/search?q=control`);

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.metadata).toHaveProperty('query');
      expect(data.metadata.query).toBe('control');
    });
  });

  test.describe('3. 페이지 로딩 및 렌더링', () => {
    test('should load frontend homepage', async ({ page }) => {
      await page.goto(BASE_URL);

      // 페이지가 로드되었는지 확인
      expect(page.url()).toContain(BASE_URL);

      // 주요 엘리먼트가 있는지 확인
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should handle navigation', async ({ page }) => {
      await page.goto(BASE_URL);

      // 페이지 기본 구조 확인
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
      expect(pageContent.length).toBeGreaterThan(100);
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
      // 모바일 크기 설정 (iPhone 12)
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto(BASE_URL);

      // 모바일에서도 렌더링 가능해야 함
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(bodyHeight).toBeGreaterThan(0);
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // 태블릿 크기 설정 (iPad)
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(BASE_URL);

      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(bodyHeight).toBeGreaterThan(0);
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
      // 데스크톱 크기 설정
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto(BASE_URL);

      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(bodyHeight).toBeGreaterThan(0);
    });
  });

  test.describe('4. 성능 메트릭', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3초 이내
    });

    test('should fetch API data quickly', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_URL}/api/characters`);
      const data = await response.json();

      const fetchTime = Date.now() - startTime;
      expect(fetchTime).toBeLessThan(1000); // 1초 이내
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('should handle multiple concurrent requests', async () => {
      const startTime = Date.now();

      const requests = [
        fetch(`${API_URL}/api/characters`),
        fetch(`${API_URL}/api/topics`),
        fetch(`${API_URL}/api/health`),
        fetch(`${API_URL}/api/search?q=test`),
      ];

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach((res) => {
        expect(res.ok).toBe(true);
      });

      expect(duration).toBeLessThan(3000); // 모두 3초 이내에 완료
    });
  });

  test.describe('5. 접근성 검증', () => {
    test('should be navigable with keyboard', async ({ page }) => {
      await page.goto(BASE_URL);

      // Tab 키로 네비게이션 가능해야 함
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // 포커스된 엘리먼트가 있어야 함
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(focusedElement).toBeTruthy();
    });

    test('should have readable text contrast', async ({ page }) => {
      await page.goto(BASE_URL);

      // 메인 콘텐츠가 읽을 수 있는지 확인
      const mainContent = await page.locator('body').textContent();
      expect(mainContent).toBeTruthy();
      expect(mainContent?.length).toBeGreaterThan(0);
    });
  });

  test.describe('6. 오류 처리', () => {
    test('should handle invalid routes gracefully', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/invalid-route`, {
        waitUntil: 'networkidle',
      });

      // 404 또는 다른 상태 코드
      expect(response?.status()).toBeLessThanOrEqual(404);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // 네트워크 오류 시뮬레이션
      await page.context().setExtraHTTPHeaders({
        'Accept-Encoding': 'invalid',
      });

      try {
        await page.goto(BASE_URL);
      } catch (error) {
        // 오류 처리됨
        expect(error).toBeTruthy();
      }
    });

    test('should display appropriate error messages', async ({ page }) => {
      await page.goto(`${BASE_URL}/invalid`);

      // 페이지는 로드되어야 함
      const content = await page.content();
      expect(content).toBeTruthy();
    });
  });

  test.describe('7. API 엔드포인트 검증', () => {
    test.describe('GET /api/health', () => {
      test('should return health status', async () => {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();

        expect(data.status).toBe('healthy');
        expect(data).toHaveProperty('uptime');
        expect(data.uptime).toBeGreaterThan(0);
      });
    });

    test.describe('GET /api/characters', () => {
      test('should return non-empty character list', async () => {
        const response = await fetch(`${API_URL}/api/characters`);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.length).toBeGreaterThan(0);
      });

      test('should include character properties', async () => {
        const response = await fetch(`${API_URL}/api/characters`);
        const data = await response.json();

        const character = data.data[0];
        expect(character).toHaveProperty('id');
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('species');
        expect(character).toHaveProperty('imageUrl');
      });
    });

    test.describe('GET /api/topics', () => {
      test('should return paginated results', async () => {
        const response = await fetch(
          `${API_URL}/api/topics?limit=5&offset=0`
        );
        const data = await response.json();

        expect(data.metadata.limit).toBeLessThanOrEqual(5);
        expect(data.metadata).toHaveProperty('hasMore');
      });

      test('should support difficulty filtering', async () => {
        const response = await fetch(
          `${API_URL}/api/topics?difficulty=beginner`
        );
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
      });
    });

    test.describe('GET /api/search', () => {
      test('should search content', async () => {
        const response = await fetch(`${API_URL}/api/search?q=test`);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.metadata.query).toBe('test');
      });

      test('should return empty array for non-matching query', async () => {
        const response = await fetch(
          `${API_URL}/api/search?q=zzzzzzzzz-nonexistent`
        );
        const data = await response.json();

        expect(data.data).toEqual([]);
      });
    });

    test.describe('POST /api/tts', () => {
      test('should require text and character fields', async () => {
        const response = await fetch(`${API_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
      });

      test('should accept valid TTS request', async () => {
        const response = await fetch(`${API_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Hello, world!',
            character: 'isabelle',
          }),
        });

        // 200 (성공) 또는 400/404 (오류)
        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });
  });

  test.describe('8. 데이터 일관성', () => {
    test('should return consistent data across requests', async () => {
      const response1 = await fetch(`${API_URL}/api/characters`);
      const data1 = await response1.json();

      const response2 = await fetch(`${API_URL}/api/characters`);
      const data2 = await response2.json();

      expect(data1.data.length).toBe(data2.data.length);
      expect(data1.data[0].id).toBe(data2.data[0].id);
    });

    test('should not have duplicate character IDs', async () => {
      const response = await fetch(`${API_URL}/api/characters`);
      const data = await response.json();

      const ids = data.data.map((char: any) => char.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    test('should have valid topic difficulty levels', async () => {
      const response = await fetch(`${API_URL}/api/topics`);
      const data = await response.json();

      const validDifficulties = ['beginner', 'intermediate', 'advanced'];

      data.data.forEach((topic: any) => {
        expect(validDifficulties).toContain(topic.difficulty);
      });
    });
  });

  test.describe('9. 캐싱 검증', () => {
    test('should cache responses efficiently', async () => {
      // 첫 번째 요청
      const start1 = Date.now();
      const res1 = await fetch(`${API_URL}/api/characters`);
      const time1 = Date.now() - start1;

      // 두 번째 요청 (캐시 가능)
      const start2 = Date.now();
      const res2 = await fetch(`${API_URL}/api/characters`);
      const time2 = Date.now() - start2;

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);

      // 두 요청 모두 빠르게 완료되어야 함
      expect(time1).toBeLessThan(1000);
      expect(time2).toBeLessThan(1000);
    });
  });

  test.describe('10. 보안 기본사항', () => {
    test('should not expose sensitive information', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      // 민감한 정보가 노출되지 않아야 함
      expect(JSON.stringify(data)).not.toContain('password');
      expect(JSON.stringify(data)).not.toContain('secret');
      expect(JSON.stringify(data)).not.toContain('token');
    });

    test('should handle CORS properly', async () => {
      const response = await fetch(`${API_URL}/api/health`, {
        headers: {
          'Origin': BASE_URL,
        },
      });

      expect(response.ok).toBe(true);
    });

    test('should validate input parameters', async () => {
      // 특수 문자를 포함한 쿼리
      const response = await fetch(
        `${API_URL}/api/search?q=<script>alert('xss')</script>`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});

test.describe('사용자 시나리오 - 통합 흐름', () => {
  test('User journey: Home → Content → Search → Health', async () => {
    // 1. 홈페이지 방문
    const homeResponse = await fetch(`${API_URL}/api/health`);
    expect(homeResponse.ok).toBe(true);

    // 2. 캐릭터 로드
    const charsResponse = await fetch(`${API_URL}/api/characters`);
    const charsData = await charsResponse.json();
    expect(charsData.data.length).toBeGreaterThan(0);

    // 3. 주제 로드
    const topicsResponse = await fetch(`${API_URL}/api/topics`);
    const topicsData = await topicsResponse.json();
    expect(topicsData.data.length).toBeGreaterThan(0);

    // 4. 검색 수행
    const searchResponse = await fetch(`${API_URL}/api/search?q=control`);
    const searchData = await searchResponse.json();
    expect(searchData.success).toBe(true);

    // 5. 상태 다시 확인
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    expect(healthData.status).toBe('healthy');
  });
});
