import { test, expect } from '@playwright/test';

const STORY_URL = 'http://localhost:3002/story.html';

test.describe('Episode 1: Story Page - Complete Validation', () => {

  test('✅ Page loads successfully with all scenes', async ({ page }) => {
    const response = await page.goto(STORY_URL);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/너굴 코딩.*에피소드 1/);

    // Verify all 4 scenes exist
    const scenes = page.locator('[data-scene]');
    expect(await scenes.count()).toBe(4);
  });

  test('✅ Scene 1: Opening displays correctly', async ({ page }) => {
    await page.goto(STORY_URL);

    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toHaveClass(/active/);
    await expect(scene1.locator('img').first()).toBeVisible();

    // Check for Nook dialogue
    const dialogue = scene1.locator('.nook-quote');
    const text = await dialogue.textContent();
    expect(text).toContain('반갑');
  });

  test('✅ Scene navigation: Scene 1 → Scene 2', async ({ page }) => {
    await page.goto(STORY_URL);

    // Click "다음" button
    const nextBtn = page.locator('[data-scene="1"] button:has-text("다음")');
    await nextBtn.click();

    // Scene 2 should be active
    const scene2 = page.locator('[data-scene="2"]');
    await expect(scene2).toHaveClass(/active/);

    // Scene 1 should be hidden
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).not.toHaveClass(/active/);
  });

  test('✅ Scene 2: Story content displays with debt amount', async ({ page }) => {
    await page.goto(STORY_URL);

    const nextBtn = page.locator('[data-scene="1"] button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    const text = await scene2.textContent();

    // Check for debt amount
    expect(text).toContain('49,800') || expect(text).toContain('49800');

    // Check for multiple images
    const images = scene2.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
  });

  test('✅ Scene 3: Mission preparation', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to Scene 3
    let nextBtn = page.locator('[data-scene="1"] button:has-text("다음")');
    await nextBtn.click();

    nextBtn = page.locator('[data-scene="2"] button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    await expect(scene3).toHaveClass(/active/);

    // IDE start button should be visible
    const startBtn = scene3.locator('button:has-text("IDE 시작")');
    await expect(startBtn).toBeVisible();
  });

  test('✅ IDE Section: Appears after mission start', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to Scene 3
    let nextBtn = page.locator('[data-scene="1"] button:has-text("다음")');
    await nextBtn.click();

    nextBtn = page.locator('[data-scene="2"] button:has-text("다음")');
    await nextBtn.click();

    // Click IDE start
    const startBtn = page.locator('[data-scene="3"] button:has-text("IDE 시작")');
    await startBtn.click();

    // IDE section should be active
    const ideSection = page.locator('.ide-section');
    await expect(ideSection).toHaveClass(/active/);

    // Step 1 should be visible
    const mission1 = page.locator('#mission-1');
    expect(await mission1.evaluate(el => el.style.display)).not.toBe('none');
  });

  test('✅ Step 1: Code validation - SUCCESS (int loan = 49800)', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Enter correct Step 1 code
    const editor = page.locator('#editor-step1');
    await editor.clear();
    await editor.type('int loan = 49800;');

    // Run Step 1
    const runBtn = page.locator('#mission-1 button:has-text("▶ 코드 실행")');
    await runBtn.click();

    // Check output for success
    const output = page.locator('#output-content-step1');
    const text = await output.textContent();
    expect(text).toContain('✅') && expect(text).toContain('성공');

    // Next button should be visible
    const nextBtn = page.locator('#next-step1');
    expect(await nextBtn.evaluate(el => el.style.display)).not.toBe('none');
  });

  test('✅ Step 1: Code validation - FAILURE (missing int)', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Enter incorrect code (missing "int")
    const editor = page.locator('#editor-step1');
    await editor.clear();
    await editor.type('loan = 49800;');

    // Run Step 1
    const runBtn = page.locator('#mission-1 button:has-text("▶ 코드 실행")');
    await runBtn.click();

    // Check output for error
    const output = page.locator('#output-content-step1');
    const text = await output.textContent();
    expect(text).toContain('❌') || expect(text).toContain('오류');

    // Next button should be hidden
    const nextBtn = page.locator('#next-step1');
    expect(await nextBtn.evaluate(el => el.style.display)).toBe('none');
  });

  test('✅ Step 2: Accessible after Step 1 success', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Step 1
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Complete Step 1
    const editor1 = page.locator('#editor-step1');
    await editor1.clear();
    await editor1.type('int loan = 49800;');
    await page.locator('#mission-1 button:has-text("▶ 코드 실행")').click();

    // Click next button
    await page.locator('#next-step1').click();

    // Step 2 should now be visible
    const mission2 = page.locator('#mission-2');
    expect(await mission2.evaluate(el => el.style.display)).not.toBe('none');
  });

  test('✅ Step 2: Code validation - SUCCESS (double interestRate = 0.05)', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Step 1
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    const editor1 = page.locator('#editor-step1');
    await editor1.clear();
    await editor1.type('int loan = 49800;');
    await page.locator('#mission-1 button:has-text("▶ 코드 실행")').click();
    await page.locator('#next-step1').click();

    // Complete Step 2
    const editor2 = page.locator('#editor-step2');
    await editor2.clear();
    await editor2.type('int loan = 49800;\ndouble interestRate = 0.05;');
    await page.locator('#mission-2 button:has-text("▶ 코드 実行")').first().click();

    // Check output for success
    const output = page.locator('#output-content-step2');
    const text = await output.textContent();
    expect(text).toContain('✅') || expect(text).toContain('성공');
  });

  test('✅ Step 3: Type casting validation - FAILURE without cast', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Steps 1 & 2
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Complete Step 1
    const editor1 = page.locator('#editor-step1');
    await editor1.clear();
    await editor1.type('int loan = 49800;');
    await page.locator('#mission-1 button:has-text("▶ 코드 실행")').click();
    await page.locator('#next-step1').click();

    // Complete Step 2
    const editor2 = page.locator('#editor-step2');
    await editor2.clear();
    await editor2.type('int loan = 49800;\ndouble interestRate = 0.05;');
    await page.locator('#mission-2 button:has-text("▶ 코드 실행")').first().click();
    await page.locator('#next-step2').click();

    // Attempt Step 3 WITHOUT casting
    const editor3 = page.locator('#editor-step3');
    await editor3.clear();
    await editor3.type('int loan = 49800;\ndouble interestRate = 0.05;\nint interest = loan * interestRate;');
    await page.locator('#mission-3 button:has-text("▶ 코드 실행")').click();

    // Should show type mismatch error
    const output = page.locator('#output-content-step3');
    const text = await output.textContent();
    expect(text).toContain('❌') || expect(text).toContain('Type mismatch');
  });

  test('✅ Step 3: Type casting validation - SUCCESS with cast', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Steps 1 & 2
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Complete Step 1
    const editor1 = page.locator('#editor-step1');
    await editor1.clear();
    await editor1.type('int loan = 49800;');
    await page.locator('#mission-1 button:has-text("▶ 코드 실행")').click();
    await page.locator('#next-step1').click();

    // Complete Step 2
    const editor2 = page.locator('#editor-step2');
    await editor2.clear();
    await editor2.type('int loan = 49800;\ndouble interestRate = 0.05;');
    await page.locator('#mission-2 button:has-text("▶ 코드 실행")').first().click();
    await page.locator('#next-step2').click();

    // Complete Step 3 WITH casting
    const editor3 = page.locator('#editor-step3');
    await editor3.clear();
    await editor3.type('int loan = 49800;\ndouble interestRate = 0.05;\nint interest = (int)(loan * interestRate);');
    await page.locator('#mission-3 button:has-text("▶ 코드 실행")').click();

    // Should show success and result
    const output = page.locator('#output-content-step3');
    const text = await output.textContent();
    expect(text).toContain('✅') && expect(text).toContain('2490');
  });

  test('✅ Scene 4: Completion screen accessible', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete all 3 steps
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Step 1
    const editor1 = page.locator('#editor-step1');
    await editor1.clear();
    await editor1.type('int loan = 49800;');
    await page.locator('#mission-1 button:has-text("▶ 코드 실행")').click();
    await page.locator('#next-step1').click();

    // Step 2
    const editor2 = page.locator('#editor-step2');
    await editor2.clear();
    await editor2.type('int loan = 49800;\ndouble interestRate = 0.05;');
    await page.locator('#mission-2 button:has-text("▶ 코드 실행")').first().click();
    await page.locator('#next-step2').click();

    // Step 3
    const editor3 = page.locator('#editor-step3');
    await editor3.clear();
    await editor3.type('int loan = 49800;\ndouble interestRate = 0.05;\nint interest = (int)(loan * interestRate);');
    await page.locator('#mission-3 button:has-text("▶ 코드 실행")').click();

    // Scene 4 complete button should be visible
    const completeBtn = page.locator('#next-step3');
    await expect(completeBtn).toBeVisible();

    // Click it to go to Scene 4
    await completeBtn.click();

    // Scene 4 should be active
    const scene4 = page.locator('[data-scene="4"]');
    await expect(scene4).toHaveClass(/active/);

    // Scene 4 should show completion message
    const scene4Text = await scene4.textContent();
    expect(scene4Text).toContain('미션 완료') || expect(scene4Text).toContain('2490');
  });

  test('✅ Progress bar updates through scenes', async ({ page }) => {
    await page.goto(STORY_URL);

    const progressBar = page.locator('.progress');
    await expect(progressBar).toBeVisible();

    // Initial state
    let items = page.locator('.progress-item');
    let activeCount = await items.locator('.active, .completed').count();
    expect(activeCount).toBeGreaterThan(0);

    // After navigation
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    activeCount = await items.locator('.active, .completed').count();
    expect(activeCount).toBeGreaterThan(0);
  });

  test('✅ Mobile responsiveness (375px viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(STORY_URL);

    // Container should adapt
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Scene should be visible
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toBeVisible();

    // Image should fit within viewport
    const img = scene1.locator('img').first();
    const box = await img.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test('✅ Reset button functionality', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE
    await page.locator('[data-scene="1"] button:has-text("다음")').click();
    await page.locator('[data-scene="2"] button:has-text("다음")').click();
    await page.locator('[data-scene="3"] button:has-text("IDE 시작")').click();

    // Modify code
    const editor = page.locator('#editor-step1');
    const originalValue = await editor.inputValue();
    await editor.fill('modified code here');

    // Click reset
    await page.locator('#mission-1 button:has-text("🔄 초기화")').click();

    // Code should be restored
    const resetValue = await editor.inputValue();
    expect(resetValue).toBe(originalValue);
  });

});
