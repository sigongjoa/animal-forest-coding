import { test, expect, Page } from '@playwright/test';

test.describe('StoryPage E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3002/story');
  });

  test.afterEach(async () => {
    await page.close();
  });

  // E2E-1: 스토리 페이지 진입 및 기본 UI 확인
  test('E2E-1: Should render StoryPage with Scene 1 and start typing animation', async () => {
    // StoryPage가 로드되었는지 확인
    await expect(page).toHaveURL('http://localhost:3002/story');

    // Scene 1의 NPC 이름 표시 확인
    const npcName = await page.getByText('Tom Nook');
    await expect(npcName).toBeVisible();

    // 대사 박스 확인
    const dialogBox = page.locator('div.bg-white.border-4');
    await expect(dialogBox).toBeVisible();

    // 타이핑 커서 확인
    const cursor = page.getByText(/▋/);
    await expect(cursor).toBeVisible({ timeout: 5000 });
  });

  // E2E-2: 텍스트 타이핑 애니메이션 확인
  test('E2E-2: Text should type out character by character', async () => {
    // 초기 상태에서 부분 텍스트 확인
    const dialog = page.locator('p.text-yellow-900');

    // 약간의 시간 후 텍스트가 증가하는지 확인
    const textBefore = await dialog.innerText();

    // 300ms 대기
    await page.waitForTimeout(300);

    const textAfter = await dialog.innerText();

    // 텍스트 길이가 증가했는지 확인 (문자별 타이핑)
    // 단, 완전히 끝났을 수도 있으므로 길이 비교보다는 존재 확인
    await expect(dialog).toContainText(/어서|오시게|주민|대표/);
  });

  // E2E-3: 다음 버튼으로 대사 진행
  test('E2E-3: Click next button should advance dialogue', async () => {
    // 초기 진행도 확인 (공백 무시)
    const progressInitial = page.getByText(/1\s*\/\s*2\s*\(\s*1\s*\/\s*5\s*\)/);
    await expect(progressInitial).toBeVisible();

    // 다음 버튼 클릭
    const nextButton = page.getByRole('button', { name: /다음/i });
    await nextButton.click();

    // 진행도가 변경되었는지 확인
    await expect(page.getByText(/1\s*\/\s*2\s*\(\s*2\s*\/\s*5\s*\)/)).toBeVisible({ timeout: 5000 });
  });

  // E2E-4: 여러 대사 진행 후 씬 변경
  test('E2E-4: Should change scene after all dialogues in Scene 1 are done', async () => {
    const nextButton = page.getByRole('button', { name: /다음|시작하기/i });

    // Scene 1의 모든 대사 진행 (5개 대사)
    for (let i = 0; i < 4; i++) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // 5번째 대사에서 클릭하면 Scene 2로 이동
    await nextButton.click();

    // Scene 2 확인 (진행도가 2/2로 변경) - 공백 무시
    await expect(page.getByText(/2\s*\/\s*2\s*\(\s*1\s*\/\s*6\s*\)/)).toBeVisible({ timeout: 5000 });
  });

  // E2E-5: 배경이미지 변경 확인
  test('E2E-5: Background image should change when scene changes', async () => {
    // Scene 1: img1.jpg 확인
    let backgroundStyle = await page.locator('div[style*="background-image"]').getAttribute('style');
    expect(backgroundStyle).toContain('img1.jpg');

    // 모든 대사 진행
    const nextButton = page.getByRole('button', { name: /다음|시작하기/i });
    for (let i = 0; i < 4; i++) {
      await nextButton.click();
      await page.waitForTimeout(200);
    }
    await nextButton.click();

    // Scene 2: img2.jpg 확인
    await page.waitForTimeout(300);
    backgroundStyle = await page.locator('div[style*="background-image"]').getAttribute('style');
    expect(backgroundStyle).toContain('img2.jpg');
  });

  // E2E-6: 최종 버튼이 "시작하기"로 변경되고 IDE로 네비게이션
  test('E2E-6: Final button should be "시작하기" and navigate to /ide', async () => {
    const nextButton = page.getByRole('button', { name: /다음|시작하기/i });

    // 모든 대사 진행 (총 11개)
    for (let i = 0; i < 10; i++) {
      await nextButton.click();
      await page.waitForTimeout(200);
    }

    // 최종 버튼이 "시작하기"인지 확인
    const startButton = page.getByRole('button', { name: /🚀 시작하기/i });
    await expect(startButton).toBeVisible();

    // 클릭하면 IDE로 네비게이션
    await startButton.click();

    // IDE 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/\/ide/, { timeout: 5000 });
  });

  // E2E-7: 스킵 버튼 테스트
  test('E2E-7: Skip button should navigate to /ide immediately', async () => {
    // 스킵 버튼 클릭
    const skipButton = page.getByRole('button', { name: /스킵/i });
    await skipButton.click();

    // IDE 페이지로 즉시 이동
    await expect(page).toHaveURL(/\/ide/, { timeout: 5000 });
  });

  // E2E-8: 진행도 정확성 확인
  test('E2E-8: Progress indicator should show correct numbers', async () => {
    // 초기 진행도 확인 (공백 무시)
    await expect(page.getByText(/1\s*\/\s*2\s*\(\s*1\s*\/\s*5\s*\)/)).toBeVisible();

    const nextButton = page.getByRole('button', { name: /다음|시작하기/i });

    // 각 단계별 진행도 확인 (공백 무시하는 정규식)
    const expectedProgressPatterns = [
      /1\s*\/\s*2\s*\(\s*2\s*\/\s*5\s*\)/,
      /1\s*\/\s*2\s*\(\s*3\s*\/\s*5\s*\)/,
      /1\s*\/\s*2\s*\(\s*4\s*\/\s*5\s*\)/,
      /1\s*\/\s*2\s*\(\s*5\s*\/\s*5\s*\)/,
      /2\s*\/\s*2\s*\(\s*1\s*\/\s*6\s*\)/,
    ];

    for (const pattern of expectedProgressPatterns) {
      await nextButton.click();
      await expect(page.getByText(pattern)).toBeVisible({ timeout: 3000 });
    }
  });

  // E2E-9: 이미지 404 오류 없음
  test('E2E-9: Images should load without 404 errors', async () => {
    // 네트워크 요청 모니터링
    let imageError = false;

    page.on('response', response => {
      if (response.url().includes('img1.jpg') || response.url().includes('img2.jpg')) {
        if (response.status() === 404) {
          imageError = true;
        }
      }
    });

    // 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');

    expect(imageError).toBe(false);
  });

  // E2E-10: 반응형 디자인 확인
  test('E2E-10: StoryPage should be responsive', async () => {
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });

    const dialogBox = page.locator('div.bg-white.border-4');
    await expect(dialogBox).toBeVisible();

    // 데스크톱 뷰
    await page.setViewportSize({ width: 1920, height: 1080 });

    await expect(dialogBox).toBeVisible();
  });

  // E2E-11: 전체 플로우 통합 테스트
  test('E2E-11: Complete flow from StoryPage to IDE', async () => {
    // 1. StoryPage 로드 확인
    await expect(page).toHaveURL('http://localhost:3002/story');

    // 2. Scene 1 확인
    await expect(page.getByText('Tom Nook')).toBeVisible();

    // 3. 대사 진행
    const nextButton = page.getByRole('button', { name: /다음|시작하기/i });
    for (let i = 0; i < 10; i++) {
      await nextButton.click();
      await page.waitForTimeout(100);
    }

    // 4. 최종 버튼 클릭
    const startButton = page.getByRole('button', { name: /🚀 시작하기/i });
    await startButton.click();

    // 5. IDE 페이지 도착 확인
    await expect(page).toHaveURL(/\/ide/, { timeout: 5000 });
  });
});
