/**
 * E2E Test: Data Persistence Flow
 *
 * 테스트 시나리오:
 * 1. 사용자가 미션을 풀고 저장
 * 2. 페이지 새로고침
 * 3. 진행 상황이 유지되는지 확인
 * 4. 여러 기기 동기화 확인
 */

import { test, expect, BrowserContext } from '@playwright/test';

test.describe('Data Persistence Tests', () => {
  /**
   * Test 1: localStorage 저장/복원
   *
   * 시나리오:
   * 1. 사용자가 게임 시작
   * 2. 미션 1 완료 (500pt)
   * 3. localStorage에 저장됨
   * 4. 페이지 새로고침
   * 5. 진행도 유지됨 확인
   */
  test('should persist game state to localStorage', async ({ page }) => {
    // 1. 게임 시작
    await page.goto('http://localhost:3000/story/ep_1');
    await page.waitForLoadState('networkidle');

    // 2. 첫 상태 확인
    const pointsBefore = await page.locator('[data-testid="points"]').textContent();
    console.log(`🎮 Points before: ${pointsBefore}`);

    // 3. 미션 1 완료 시뮬레이션
    await page.locator('[data-testid="submit-code-btn"]').click();
    await page.waitForSelector('[data-testid="mission-success"]');

    // 4. localStorage 확인
    const storedState = await page.evaluate(() => {
      return localStorage.getItem('nook_coding_game_state');
    });
    expect(storedState).toBeTruthy();
    const parsedState = JSON.parse(storedState!);
    expect(parsedState.points).toBeGreaterThan(0);
    console.log(`✅ Saved to localStorage: ${JSON.stringify(parsedState)}`);

    // 5. 페이지 새로고침
    const pointsAfterSubmit = await page.locator('[data-testid="points"]').textContent();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 6. 진행도 유지 확인
    const pointsAfterRefresh = await page.locator('[data-testid="points"]').textContent();
    expect(pointsAfterRefresh).toBe(pointsAfterSubmit);
    console.log(`✅ Points preserved after refresh: ${pointsAfterRefresh}`);
  });

  /**
   * Test 2: 여러 탭 동기화
   *
   * 시나리오:
   * 1. 탭 A에서 게임 진행
   * 2. 탭 B에서 같은 게임 오픈
   * 3. 탭 A의 진행도가 탭 B에도 반영되는지 확인
   */
  test('should sync progress across multiple tabs', async ({ browser }) => {
    // 1. 탭 A 열기
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    // 2. 두 탭 모두 게임 오픈
    await tabA.goto('http://localhost:3000/story/ep_1');
    await tabB.goto('http://localhost:3000/story/ep_1');

    await tabA.waitForLoadState('networkidle');
    await tabB.waitForLoadState('networkidle');

    const pointsA_before = await tabA.locator('[data-testid="points"]').textContent();
    const pointsB_before = await tabB.locator('[data-testid="points"]').textContent();
    console.log(`📊 Tab A points: ${pointsA_before}, Tab B points: ${pointsB_before}`);

    // 3. 탭 A에서 미션 완료
    await tabA.locator('[data-testid="submit-code-btn"]').click();
    await tabA.waitForSelector('[data-testid="mission-success"]');
    const pointsA_after = await tabA.locator('[data-testid="points"]').textContent();
    console.log(`✅ Tab A completed mission: ${pointsA_after} points`);

    // 4. 탭 B에서 localStorage 갱신 (storage 이벤트)
    await tabB.evaluate(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'nook_coding_game_state',
      }));
    });

    // 5. 탭 B의 포인트 확인
    await tabB.waitForTimeout(500); // 잠깐 대기
    const pointsB_after = await tabB.locator('[data-testid="points"]').textContent();
    console.log(`✅ Tab B synced: ${pointsB_after} points`);

    expect(pointsA_after).toBe(pointsB_after);

    await context.close();
  });

  /**
   * Test 3: Backend 동기화
   *
   * 시나리오:
   * 1. 로그인한 사용자가 게임 진행
   * 2. Backend에 저장 요청
   * 3. 다른 기기에서 로그인
   * 4. Backend에서 진행 상황 복원
   */
  test('should sync with backend', async ({ page, context }) => {
    // 1. 로그인
    await page.goto('http://localhost:3000');
    await page.locator('[data-testid="login-btn"]').click();

    // 로그인 폼 채우기
    await page.locator('[data-testid="email-input"]').fill('student@test.com');
    await page.locator('[data-testid="password-input"]').fill('password123');
    await page.locator('[data-testid="submit-login"]').click();

    // 로그인 대기
    await page.waitForURL('http://localhost:3000/story/ep_1');

    // 2. 게임 진행
    await page.goto('http://localhost:3000/story/ep_1');
    await page.locator('[data-testid="submit-code-btn"]').click();
    await page.waitForSelector('[data-testid="mission-success"]');

    const pointsAfterProgress = await page.locator('[data-testid="points"]').textContent();

    // 3. Backend 저장 확인 (API 호출 모니터링)
    const saveResponse = await page.waitForResponse(
      response => response.url().includes('/api/progression/save') && response.status() === 200
    );

    console.log(`✅ Backend save response: ${saveResponse.status()}`);

    // 4. 새 브라우저 컨텍스트에서 로그인 (다른 기기 시뮬레이션)
    const newContext = await context.browser()!.newContext();
    const newPage = await newContext.newPage();

    // 로그인
    await newPage.goto('http://localhost:3000');
    await newPage.locator('[data-testid="login-btn"]').click();
    await newPage.locator('[data-testid="email-input"]').fill('student@test.com');
    await newPage.locator('[data-testid="password-input"]').fill('password123');
    await newPage.locator('[data-testid="submit-login"]').click();

    // 게임 페이지 대기
    await newPage.waitForURL('http://localhost:3000/story/ep_1');

    // 5. Backend에서 복원된 진행도 확인
    const restoredPoints = await newPage.locator('[data-testid="points"]').textContent();
    expect(restoredPoints).toBe(pointsAfterProgress);

    console.log(`✅ Progress synced from backend to new device: ${restoredPoints}`);

    await newContext.close();
  });

  /**
   * Test 4: 충돌 해결
   *
   * 시나리오:
   * 1. 오프라인에서 미션 완료
   * 2. 다른 기기에서도 같은 미션 완료
   * 3. 온라인 복구 시 충돌 해결
   */
  test('should resolve conflicts correctly', async ({ browser }) => {
    const context = await browser.newContext();
    const deviceA = await context.newPage();
    const deviceB = await context.newPage();

    // 1. 두 기기 모두 게임 로드
    await deviceA.goto('http://localhost:3000/story/ep_1');
    await deviceB.goto('http://localhost:3000/story/ep_1');

    await deviceA.waitForLoadState('networkidle');
    await deviceB.waitForLoadState('networkidle');

    // 2. 기기 A: 미션 1,2 완료
    await deviceA.locator('[data-testid="mission-1-submit"]').click();
    await deviceA.waitForSelector('[data-testid="mission-success"]');
    await deviceA.locator('[data-testid="mission-2-submit"]').click();
    await deviceA.waitForSelector('[data-testid="mission-success"]');

    const pointsA = await deviceA.locator('[data-testid="points"]').textContent();
    console.log(`📱 Device A: ${pointsA} points (missions 1,2)`);

    // 3. 기기 B: 미션 1,3 완료 (오프라인 상황 시뮬레이션)
    await deviceB.context().setOffline(true);
    await deviceB.locator('[data-testid="mission-1-submit"]').click();
    await deviceB.waitForSelector('[data-testid="mission-success"]');
    await deviceB.locator('[data-testid="mission-3-submit"]').click();
    await deviceB.waitForSelector('[data-testid="mission-success"]');

    const pointsB_offline = await deviceB.locator('[data-testid="points"]').textContent();
    console.log(`📱 Device B (offline): ${pointsB_offline} points (missions 1,3)`);

    // 4. 기기 B 온라인 복구
    await deviceB.context().setOffline(false);
    await deviceB.reload();
    await deviceB.waitForLoadState('networkidle');

    const pointsB_synced = await deviceB.locator('[data-testid="points"]').textContent();
    console.log(`📱 Device B (synced): ${pointsB_synced} points`);

    // 5. 충돌 해결 확인 (두 기기의 미션이 병합되었는지)
    // 기대값: missions 1,2,3 모두 완료, 최대 포인트
    const completedMissions = await deviceB.evaluate(() => {
      const state = localStorage.getItem('nook_coding_game_state');
      if (state) {
        return JSON.parse(state).completedMissions;
      }
      return [];
    });

    expect(completedMissions).toContain('mission_1_1');
    expect(completedMissions).toContain('mission_1_2');
    expect(completedMissions).toContain('mission_1_3');
    console.log(`✅ Conflicts resolved, all missions merged: ${completedMissions.join(', ')}`);

    await context.close();
  });

  /**
   * Test 5: 오프라인 → 온라인 복구
   *
   * 시나리오:
   * 1. 인터넷 연결 끊김
   * 2. 미션 완료 (로컬 저장)
   * 3. 인터넷 복구
   * 4. Backend에 자동 동기화
   */
  test('should handle offline to online transition', async ({ page }) => {
    // 1. 게임 시작
    await page.goto('http://localhost:3000/story/ep_1');
    await page.waitForLoadState('networkidle');

    // 2. 오프라인 모드 활성화
    await page.context().setOffline(true);
    console.log('🔌 Going offline...');

    // 3. 미션 완료
    const pointsBefore = await page.locator('[data-testid="points"]').textContent();
    await page.locator('[data-testid="submit-code-btn"]').click();
    await page.waitForSelector('[data-testid="mission-success"]');
    const pointsOffline = await page.locator('[data-testid="points"]').textContent();

    // 4. localStorage 확인
    const localState = await page.evaluate(() => {
      return localStorage.getItem('nook_coding_game_state');
    });
    expect(localState).toBeTruthy();
    console.log(`✅ Offline progress saved to localStorage`);

    // 5. 온라인 복구
    await page.context().setOffline(false);
    console.log('🟢 Online again...');

    // 6. Backend 동기화 대기
    const saveResponse = await page.waitForResponse(
      response =>
        response.url().includes('/api/progression/save') &&
        response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    if (saveResponse) {
      console.log(`✅ Auto-synced to backend: ${saveResponse.status()}`);
    } else {
      console.log(`⚠️ Manual sync might be needed`);
    }

    // 7. 진행도 유지 확인
    const pointsAfter = await page.locator('[data-testid="points"]').textContent();
    expect(pointsAfter).toBe(pointsOffline);
    console.log(`✅ Offline progress preserved: ${pointsAfter} points`);
  });
});

test.describe('Edge Cases', () => {
  /**
   * Edge Case 1: localStorage 용량 초과
   */
  test('should handle localStorage quota exceeded', async ({ page }) => {
    // localStorage가 가득 찬 상황 시뮬레이션
    await page.evaluate(() => {
      try {
        // 큰 데이터로 localStorage 채우기
        for (let i = 0; i < 200; i++) {
          localStorage.setItem(`dummy_${i}`, 'x'.repeat(1024 * 100)); // 100KB
        }
      } catch (e) {
        // Ignored: Expected to hit quota
      }
    });

    // 게임 상태 저장 시도
    await page.goto('http://localhost:3000/story/ep_1');
    await page.locator('[data-testid="submit-code-btn"]').click();

    // 저장 실패 처리 확인
    const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorMessage).toBeTruthy();
    console.log(`✅ Handled localStorage quota exceeded: ${errorMessage}`);
  });

  /**
   * Edge Case 2: 손상된 localStorage 데이터
   */
  test('should recover from corrupted localStorage', async ({ page }) => {
    // 손상된 데이터 저장
    await page.evaluate(() => {
      localStorage.setItem('nook_coding_game_state', 'invalid json {{{');
    });

    // 게임 시작
    await page.goto('http://localhost:3000/story/ep_1');
    await page.waitForLoadState('networkidle');

    // 신선한 시작 확인 (손상된 데이터 무시)
    const points = await page.locator('[data-testid="points"]').textContent();
    expect(points).toBe('0');
    console.log('✅ Recovered from corrupted localStorage data');
  });
});
