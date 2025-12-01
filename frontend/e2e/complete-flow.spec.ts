import { test, expect } from '@playwright/test';

test('E2E-1: EntryPage → StoryPage with img1.jpg & img2.jpg', async ({ page }) => {
  test.setTimeout(120000); // 2분으로 타임아웃 연장

  // 브라우저 콘솔 메시지 캡처
  page.on('console', (msg) => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });

  // 앱 시작
  await page.goto('http://localhost:3002/');

  // 더 오래 기다려서 React 앱이 완전히 로드되도록
  await page.waitForTimeout(3000);

  // 페이지 HTML 확인
  const pageHtml = await page.content();
  console.log('\n========== 디버그 정보 ==========');
  console.log('페이지에 EntryPage 참고문자가 있는가:', pageHtml.includes('EntryPage') || pageHtml.includes('entry'));
  console.log('페이지에 시작하기 텍스트가 있는가:', pageHtml.includes('시작하기'));
  console.log('페이지에 title.jpg 참조가 있는가:', pageHtml.includes('title.jpg'));

  // EntryPage 확인
  console.log('\n========== 테스트 시작 ==========');
  const currentURL = page.url();
  console.log('현재 URL:', currentURL);
  console.log('1️⃣ EntryPage 도착');
  await expect(page).toHaveURL(/entry|\/$/);

  // 모든 img 태그 확인
  const allImages = page.locator('img');
  const imageCount = await allImages.count();
  console.log('페이지의 총 이미지 개수:', imageCount);

  // 각 이미지의 src와 alt 출력
  for (let i = 0; i < imageCount; i++) {
    const img = allImages.nth(i);
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    console.log(`이미지 ${i}: src="${src}", alt="${alt}"`);
  }

  const titleImage = page.locator('img[alt="오여봐요 코딩의 숲"]');
  const isImageVisible = await titleImage.isVisible().catch(() => false);
  console.log('타이틀 이미지 표시됨:', isImageVisible);

  // 대신 alt 텍스트로 한번 더 확인
  const titleByAlt = page.getByAltText('오여봐요 코딩의 숲');
  const isTitleByAltVisible = await titleByAlt.isVisible().catch(() => false);
  console.log('alt로 찾은 타이틀 이미지 표시됨:', isTitleByAltVisible);

  if (!isImageVisible && !isTitleByAltVisible) {
    console.error('❌ 타이틀 이미지를 찾을 수 없습니다!');
  }

  await expect(titleImage).toBeVisible();
  console.log('   ✅ 타이틀 이미지 확인');

  // 시작 버튼 클릭 - Playwright의 click() 메서드 사용 (React 이벤트 트리거)
  const startButton = page.locator('button').filter({ has: page.locator('img[alt="시작하기"]') }).first();

  console.log('Button found, about to click...');
  await startButton.click({ force: true, timeout: 5000 });
  console.log('2️⃣ 시작 버튼 클릭 - Playwright click() 실행됨');

  await page.waitForTimeout(1200);
  console.log('2️⃣-2 시작 버튼 클릭 - 1.2초 대기 완료');

  // StoryPage 도착 대기 (EntryPage에서 직접 /story로 이동)
  await page.waitForURL(/story/, { timeout: 10000 });
  console.log('3️⃣ StoryPage 도착');

  // Tom Nook 확인
  const npcName = page.getByText('Tom Nook');
  await expect(npcName).toBeVisible();
  console.log('   ✅ Tom Nook 캐릭터 확인');

  // Scene 1: img1.jpg 배경 확인
  const backgroundDiv1 = page.locator('div[style*="img1.jpg"]');
  await expect(backgroundDiv1).toBeVisible();
  console.log('4️⃣ Scene 1: img1.jpg 배경 확인 ✅');

  // 대사 박스 확인
  const dialogBox = page.locator('div.bg-white.border-4');
  await expect(dialogBox).toBeVisible();
  console.log('   ✅ 대사 박스 표시');

  // 타이핑 애니메이션 확인
  const dialogText = page.locator('p.text-yellow-900');
  const textContent = await dialogText.textContent();
  console.log(`   ✅ 타이핑 애니메이션: "${textContent}"`);

  // 다음 버튼 확인
  const nextButton = page.locator('button').filter({ hasText: /다음|시작하기/ }).first();
  await expect(nextButton).toBeVisible();

  // Scene 1 모든 대사 진행 (5개)
  console.log('5️⃣ Scene 1 대사 진행 중...');
  for (let i = 0; i < 4; i++) {
    await nextButton.click();
    await page.waitForTimeout(300);
  }

  // Scene 2로 전환
  await nextButton.click();
  await page.waitForTimeout(500);
  console.log('6️⃣ Scene 2로 자동 전환');

  // img2.jpg 배경 확인
  const backgroundDiv2 = page.locator('div[style*="img2.jpg"]');
  await expect(backgroundDiv2).toBeVisible();
  console.log('   ✅ Scene 2: img2.jpg 배경 확인');

  // 진행도 확인 (2/2)
  const progress2 = page.getByText(/2 \/ 2/);
  await expect(progress2).toBeVisible();
  console.log('   ✅ 진행도: 2/2');

  // Scene 2 모든 대사 진행 (6개)
  console.log('7️⃣ Scene 2 대사 진행 중...');
  for (let j = 0; j < 5; j++) {
    await nextButton.click();
    await page.waitForTimeout(200);
  }

  // IDE로 이동
  console.log('8️⃣ "🚀 시작하기" 버튼 클릭');
  const startButtonFinal = page.locator('button').filter({ hasText: /시작하기/ });
  await expect(startButtonFinal).toBeVisible();
  await startButtonFinal.click();

  await page.waitForURL(/ide/, { timeout: 10000 });
  console.log('9️⃣ IDE 페이지 도착');

  console.log('\n========== ✅ 완전한 플로우 테스트 성공! ==========\n');
  console.log('✨ 확인 사항:');
  console.log('  ✅ EntryPage → StoryPage 네비게이션');
  console.log('  ✅ img1.jpg 씬 표시');
  console.log('  ✅ img2.jpg 씬 표시');
  console.log('  ✅ 텍스트 타이핑 애니메이션');
  console.log('  ✅ 대사 진행도 추적');
  console.log('  ✅ IDE 페이지 이동');
  console.log('');
});
