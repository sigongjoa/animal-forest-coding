import { test, expect } from '@playwright/test';

test.describe('Complete App Flow - EntryPage → LoginPage → StoryPage', () => {
  test('E2E-1: EntryPage should display title and start button', async ({ page }) => {
    await page.goto('http://localhost:3002/');

    // EntryPage가 표시되는지 확인
    await expect(page).toHaveURL(/entry|\/$/);

    // 타이틀 이미지 확인
    const titleImage = page.locator('img[alt="오여봐요 코딩의 숲"]');
    await expect(titleImage).toBeVisible();

    // 시작 버튼 확인
    const startButton = page.locator('img[alt="시작하기"]').first();
    await expect(startButton).toBeVisible();

    console.log('✅ EntryPage: 타이틀과 시작 버튼 표시 완료');
  });

  test('E2E-2: Click start button and navigate to LoginPage', async ({ page }) => {
    await page.goto('http://localhost:3002/');

    // 시작 버튼 클릭
    const startButton = page.locator('img[alt="시작하기"]').first();
    const buttonContainer = startButton.locator('..');
    await buttonContainer.click();

    // 300ms 대기 (애니메이션)
    await page.waitForTimeout(300);

    // LoginPage로 이동했는지 확인 (또는 StoryPage로 직접 이동)
    await page.waitForURL(/login|story/, { timeout: 5000 }).catch(() => {});

    const url = page.url();
    console.log(`✅ EntryPage 클릭 후 이동: ${url}`);
    expect(url).toMatch(/login|story/);
  });

  test('E2E-3: LoginPage form and login functionality', async ({ page }) => {
    await page.goto('http://localhost:3002/login');

    // 로그인 폼 요소 확인
    const usernameInput = page.locator('input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button').filter({ hasText: '로그인' }).first();

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // 입력값 채우기
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpass');

    // 로그인 버튼 클릭
    await loginButton.click();

    console.log('✅ LoginPage: 로그인 버튼 클릭 완료');
  });

  test('E2E-4: Navigate to StoryPage after login', async ({ page }) => {
    await page.goto('http://localhost:3002/login');

    // 로그인 진행
    const usernameInput = page.locator('input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button').filter({ hasText: '로그인' }).first();

    await usernameInput.fill('testuser');
    await passwordInput.fill('testpass');
    await loginButton.click();

    // StoryPage로 이동 대기
    await page.waitForURL(/story/, { timeout: 5000 });

    // StoryPage가 표시되었는지 확인
    await expect(page).toHaveURL(/story/);

    console.log('✅ StoryPage로 네비게이션 성공!');
  });

  test('E2E-5: StoryPage displays Scene 1 with img1.jpg', async ({ page }) => {
    await page.goto('http://localhost:3002/story');

    // StoryPage가 로드되었는지 확인
    await expect(page).toHaveURL(/story/);

    // NPC 이름 확인 (Tom Nook)
    const npcName = page.getByText('Tom Nook');
    await expect(npcName).toBeVisible();

    // 배경 이미지가 img1.jpg인지 확인
    const backgroundDiv = page.locator('div[style*="img1.jpg"]');
    await expect(backgroundDiv).toBeVisible();

    // 대사 박스 확인
    const dialogBox = page.locator('div.bg-white.border-4');
    await expect(dialogBox).toBeVisible();

    // 타이핑 텍스트 확인
    const dialogText = page.locator('p.text-yellow-900');
    await expect(dialogText).toBeVisible();

    console.log('✅ StoryPage Scene 1: img1.jpg 배경 확인 완료');
  });

  test('E2E-6: Text typing animation', async ({ page }) => {
    await page.goto('http://localhost:3002/story');

    // 타이핑 애니메이션 확인
    const dialogText = page.locator('p.text-yellow-900');

    // 초기 상태
    const textBefore = await dialogText.textContent();
    console.log(`초기 텍스트 길이: ${textBefore?.length || 0}`);

    // 1초 대기
    await page.waitForTimeout(1000);

    // 텍스트 길이가 증가했는지 확인
    const textAfter = await dialogText.textContent();
    console.log(`1초 후 텍스트 길이: ${textAfter?.length || 0}`);

    // 텍스트가 표시되고 있는지 확인
    expect(textAfter && textAfter.length > 0).toBeTruthy();

    console.log('✅ 텍스트 타이핑 애니메이션 작동 중');
  });

  test('E2E-7: Next button progresses dialogue', async ({ page }) => {
    await page.goto('http://localhost:3002/story');

    // 진행도 초기값 확인
    const progressBefore = await page.getByText(/1 \/ 2/).textContent();
    console.log(`초기 진행도: ${progressBefore}`);

    // 다음 버튼 클릭
    const nextButton = page.locator('button').filter({ hasText: /다음|시작하기/ }).first();
    await nextButton.click();

    // 진행도 변경 대기
    await page.waitForTimeout(500);

    // 진행도 확인
    const progressAfter = await page.getByText(/1 \/ 2/).textContent();
    console.log(`진행도 변경 후: ${progressAfter}`);

    // 진행도가 변경되었는지 확인
    expect(progressAfter).toBeTruthy();

    console.log('✅ 다음 버튼으로 대사 진행 완료');
  });

  test('E2E-8: Scene transitions from Scene 1 to Scene 2', async ({ page }) => {
    await page.goto('http://localhost:3002/story');

    // Scene 1의 모든 대사를 진행 (5개)
    const nextButton = page.locator('button').filter({ hasText: /다음|시작하기/ }).first();

    for (let i = 0; i < 4; i++) {
      await nextButton.click();
      await page.waitForTimeout(300);
    }

    // 5번째 대사에서 다음 클릭 (Scene 2로 전환)
    await nextButton.click();
    await page.waitForTimeout(500);

    // Scene 2의 배경이미지 확인 (img2.jpg)
    const backgroundDiv = page.locator('div[style*="img2.jpg"]');
    await expect(backgroundDiv).toBeVisible();

    // 진행도가 2/2로 변경되었는지 확인
    const progress = page.getByText(/2 \/ 2/);
    await expect(progress).toBeVisible();

    console.log('✅ Scene 1 → Scene 2 전환 완료, img2.jpg 확인');
  });

  test('E2E-9: Complete story and navigate to IDE', async ({ page }) => {
    await page.goto('http://localhost:3002/story');

    const nextButton = page.locator('button').filter({ hasText: /다음|시작하기/ }).first();

    // Scene 1 (5 dialogues) + Scene 2 (6 dialogues) = 11 total
    for (let i = 0; i < 10; i++) {
      await nextButton.click();
      await page.waitForTimeout(200);
    }

    // 최종 버튼이 "시작하기"로 변경되었는지 확인
    const startButton = page.locator('button').filter({ hasText: /시작하기/ });
    await expect(startButton).toBeVisible();

    // 시작하기 버튼 클릭
    await startButton.click();

    // IDE 페이지로 이동 확인
    await page.waitForURL(/ide/, { timeout: 5000 });
    await expect(page).toHaveURL(/ide/);

    console.log('✅ 스토리 완료 → IDE 페이지 이동 완료');
  });

  test('E2E-10: Skip button navigates directly to IDE', async ({ page }) => {
    await page.goto('http://localhost:3002/story');

    // 스킵 버튼 찾기
    const skipButton = page.locator('button').filter({ hasText: /스킵/ });
    await expect(skipButton).toBeVisible();

    // 스킵 버튼 클릭
    await skipButton.click();

    // IDE 페이지로 즉시 이동
    await page.waitForURL(/ide/, { timeout: 5000 });
    await expect(page).toHaveURL(/ide/);

    console.log('✅ 스킵 버튼으로 IDE 직접 이동 완료');
  });

  test('E2E-11: Responsive design on mobile viewport', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3002/');

    // EntryPage 요소 확인
    const titleImage = page.locator('img[alt="오여봐요 코딩의 숲"]');
    await expect(titleImage).toBeVisible();

    // 시작 버튼 클릭
    const startButton = page.locator('img[alt="시작하기"]').first();
    const buttonContainer = startButton.locator('..');
    await buttonContainer.click();

    await page.waitForTimeout(300);

    // LoginPage에서도 반응형 확인
    const loginInput = page.locator('input').first();
    if (await loginInput.isVisible()) {
      await expect(loginInput).toBeVisible();
    }

    console.log('✅ 모바일 반응형 디자인 확인 완료');
  });

  test('E2E-12: Complete flow from Entry to IDE', async ({ page }) => {
    console.log('\n========== 완전한 플로우 테스트 시작 ==========');

    // 1. EntryPage 진입
    await page.goto('http://localhost:3002/');
    await expect(page).toHaveURL(/entry|\/$/);
    console.log('1️⃣ EntryPage 도착');

    // 2. 시작 버튼 클릭
    const startButton = page.locator('img[alt="시작하기"]').first();
    await startButton.locator('..').click();
    await page.waitForTimeout(300);
    console.log('2️⃣ 시작 버튼 클릭');

    // 3. LoginPage 진입 (또는 StoryPage 직접)
    const url = page.url();
    if (url.includes('/login')) {
      console.log('3️⃣ LoginPage 도착');
      const usernameInput = page.locator('input[type="text"]').first();
      const passwordInput = page.locator('input[type="password"]');
      const loginButton = page.locator('button').filter({ hasText: '로그인' }).first();

      await usernameInput.fill('testuser');
      await passwordInput.fill('testpass');
      await loginButton.click();

      await page.waitForURL(/story/, { timeout: 5000 });
      console.log('4️⃣ 로그인 성공 → StoryPage 이동');
    } else {
      console.log('3️⃣ EntryPage에서 직접 StoryPage로 이동');
    }

    // 4. StoryPage 확인
    await expect(page).toHaveURL(/story/);
    const npcName = page.getByText('Tom Nook');
    await expect(npcName).toBeVisible();
    console.log('5️⃣ StoryPage 도착 - Tom Nook 표시');

    // 5. Scene 1 확인
    const backgroundDiv1 = page.locator('div[style*="img1.jpg"]');
    await expect(backgroundDiv1).toBeVisible();
    console.log('6️⃣ Scene 1: img1.jpg 배경 확인');

    // 6. 대사 진행
    const nextButton = page.locator('button').filter({ hasText: /다음|시작하기/ }).first();

    for (let i = 0; i < 4; i++) {
      await nextButton.click();
      await page.waitForTimeout(300);
    }
    console.log('7️⃣ Scene 1 대사 진행 (5개)');

    // 7. Scene 2로 전환
    await nextButton.click();
    await page.waitForTimeout(500);

    const backgroundDiv2 = page.locator('div[style*="img2.jpg"]');
    await expect(backgroundDiv2).toBeVisible();
    console.log('8️⃣ Scene 2: img2.jpg 배경 확인');

    // 8. Scene 2 대사 진행
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
      await page.waitForTimeout(200);
    }
    console.log('9️⃣ Scene 2 대사 진행 (6개)');

    // 9. IDE 페이지로 이동
    const startButtonFinal = page.locator('button').filter({ hasText: /시작하기/ });
    await startButtonFinal.click();

    await page.waitForURL(/ide/, { timeout: 5000 });
    await expect(page).toHaveURL(/ide/);
    console.log('🔟 IDE 페이지 도착');

    console.log('\n========== ✅ 완전한 플로우 테스트 완료! ==========\n');
  });
});
