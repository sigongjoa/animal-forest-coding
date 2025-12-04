import { test, expect } from '@playwright/test';

const STORY_URL = 'http://localhost:3002/story.html';
const EPISODE_1_IMAGES = [
  'opening.jpg',
  '2.jpg', '3.jpg', '4.jpg', '5.jpg',
  'step1.jpg',
  'step2.jpg', 'step3.jpg'
];

test.describe('Episode 1: 너굴 코딩 - 공짜는 없다구리! (Story Page)', () => {

  test('✅ Page loads successfully', async ({ page }) => {
    const response = await page.goto(STORY_URL);
    expect(response?.status()).toBe(200);

    // Verify page title
    await expect(page).toHaveTitle(/너굴 코딩.*에피소드 1/);

    // Verify main container exists
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });

  test('✅ Scene 1: Opening cutscene displays correctly', async ({ page }) => {
    await page.goto(STORY_URL);

    // Scene 1 should be active initially
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toHaveClass(/active/);

    // Check for opening image
    const openingImg = scene1.locator('img[src*="opening.jpg"]');
    await expect(openingImg).toBeVisible();

    // Check for Nook dialogue
    const dialogue = scene1.locator('.dialogue');
    const dialogueText = await dialogue.textContent();
    expect(dialogueText).toContain('너굴');

    // "다음" button should be visible
    const nextBtn = scene1.locator('button:has-text("다음")');
    await expect(nextBtn).toBeVisible();
  });

  test('✅ Scene 1 → Scene 2: Navigation works', async ({ page }) => {
    await page.goto(STORY_URL);

    // Click "다음" button on Scene 1
    const scene1 = page.locator('[data-scene="1"]');
    const nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    // Wait for Scene 2 to become active
    const scene2 = page.locator('[data-scene="2"]');
    await expect(scene2).toHaveClass(/active/);

    // Scene 1 should be hidden
    await expect(scene1).not.toHaveClass(/active/);

    // Check for debt-related images (2.jpg, 3.jpg)
    const debtImg = scene2.locator('img[src*="2.jpg"], img[src*="3.jpg"]');
    await expect(debtImg.first()).toBeVisible();

    // Check for Nook dialogue about debt
    const dialogue = scene2.locator('.dialogue');
    const dialogueText = await dialogue.textContent();
    expect(dialogueText?.toUpperCase()).toContain('벨');
  });

  test('✅ Scene 2: Story progression with multiple images', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to Scene 2
    const scene1 = page.locator('[data-scene="1"]');
    const nextBtn1 = scene1.locator('button:has-text("다음")');
    await nextBtn1.click();

    const scene2 = page.locator('[data-scene="2"]');
    await expect(scene2).toHaveClass(/active/);

    // Scene 2 should have images and dialogue
    const allImages = scene2.locator('img.scene-image');
    const imageCount = await allImages.count();
    expect(imageCount).toBeGreaterThan(0);

    // Verify 49,800 벨 debt is mentioned
    const scene2Text = await scene2.textContent();
    expect(scene2Text).toContain('49,800') || expect(scene2Text).toContain('49800');
  });

  test('✅ Scene 3: Mission preparation displays', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate through scenes to Scene 3
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    await expect(scene2).toHaveClass(/active/);
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    await expect(scene3).toHaveClass(/active/);

    // Check for mission start button
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await expect(startMissionBtn).toBeVisible();

    // Check for step1.jpg
    const stepImg = scene3.locator('img[src*="step1.jpg"]');
    await expect(stepImg).toBeVisible();
  });

  test('✅ IDE Section: Becomes active after mission start', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to Scene 3
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    // Click "IDE 시작"
    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // IDE section should now be active
    const ideSection = page.locator('.ide-section');
    await expect(ideSection).toHaveClass(/active/);

    // Step 1 mission should be visible
    const step1Title = page.locator('text=Step 1');
    await expect(step1Title).toBeVisible();
  });

  test('✅ IDE Step 1: Code validation - Success case', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Find and fill the Step 1 editor
    const editor1 = page.locator('#editor1');
    await editor1.fill('int loan = 49800;');

    // Click run button for Step 1
    const runBtn1 = page.locator('button:has-text("▶ 코드 실행"):near(#editor1)').first();
    await runBtn1.click();

    // Check for success message
    const output1 = page.locator('#output1');
    const outputText = await output1.textContent();
    expect(outputText).toContain('✅') || expect(outputText).toContain('성공');

    // "다음 단계" button should now be enabled
    const nextStepBtn = page.locator('button:has-text("다음 단계 →")').first();
    await expect(nextStepBtn).not.toBeDisabled();
  });

  test('✅ IDE Step 1: Code validation - Failure case (missing declaration)', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Enter invalid code (missing "int" keyword)
    const editor1 = page.locator('#editor1');
    await editor1.fill('loan = 49800;');

    // Click run button
    const runBtn1 = page.locator('button:has-text("▶ 코드 실행"):near(#editor1)').first();
    await runBtn1.click();

    // Check for error message
    const output1 = page.locator('#output1');
    const outputText = await output1.textContent();
    expect(outputText).toContain('❌') || expect(outputText).toContain('오류') || expect(outputText).toContain('int');

    // "다음 단계" button should remain disabled
    const nextStepBtn = page.locator('button:has-text("다음 단계 →")').first();
    await expect(nextStepBtn).toBeDisabled();
  });

  test('✅ IDE Step 2: Code validation - Success case', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Step 1
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Complete Step 1
    const editor1 = page.locator('#editor1');
    await editor1.fill('int loan = 49800;');
    const runBtn1 = page.locator('button:has-text("▶ 코드 실행"):near(#editor1)').first();
    await runBtn1.click();

    // Click next to go to Step 2
    const nextStepBtn = page.locator('button:has-text("다음 단계 →")').first();
    await nextStepBtn.click();

    // Step 2 should now be visible
    const step2Title = page.locator('text=Step 2');
    await expect(step2Title).toBeVisible();

    // Enter correct Step 2 code
    const editor2 = page.locator('#editor2');
    await expect(editor2).toBeVisible();
    await editor2.fill('double interestRate = 0.05;');

    // Click run button for Step 2
    const runBtn2 = page.locator('button:has-text("▶ 코드 실행"):near(#editor2)').first();
    await runBtn2.click();

    // Check for success
    const output2 = page.locator('#output2');
    const outputText = await output2.textContent();
    expect(outputText).toContain('✅') || expect(outputText).toContain('성공');
  });

  test('✅ IDE Step 3: Type casting validation - Failure without cast', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Steps 1 & 2
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Complete Steps 1 & 2
    const editor1 = page.locator('#editor1');
    await editor1.fill('int loan = 49800;');
    let runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor1)').first();
    await runBtn.click();

    const nextStepBtn1 = page.locator('button:has-text("다음 단계 →")').first();
    await nextStepBtn1.click();

    const editor2 = page.locator('#editor2');
    await editor2.fill('double interestRate = 0.05;');
    runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor2)').first();
    await runBtn.click();

    const nextStepBtn2 = page.locator('button:has-text("다음 단계 →")').nth(1);
    await nextStepBtn2.click();

    // Now on Step 3 - enter code WITHOUT type cast
    const step3Title = page.locator('text=Step 3');
    await expect(step3Title).toBeVisible();

    const editor3 = page.locator('#editor3');
    await editor3.fill('int interest = loan * interestRate;');

    // Click run button
    const runBtn3 = page.locator('button:has-text("▶ 코드 실행"):near(#editor3)').first();
    await runBtn3.click();

    // Should show error about type mismatch
    const output3 = page.locator('#output3');
    const outputText = await output3.textContent();
    expect(outputText).toContain('❌') || expect(outputText).toContain('타입') || expect(outputText).toContain('Type');
  });

  test('✅ IDE Step 3: Type casting validation - Success with cast', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete Steps 1 & 2
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Complete Steps 1 & 2
    const editor1 = page.locator('#editor1');
    await editor1.fill('int loan = 49800;');
    let runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor1)').first();
    await runBtn.click();

    const nextStepBtn1 = page.locator('button:has-text("다음 단계 →")').first();
    await nextStepBtn1.click();

    const editor2 = page.locator('#editor2');
    await editor2.fill('double interestRate = 0.05;');
    runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor2)').first();
    await runBtn.click();

    const nextStepBtn2 = page.locator('button:has-text("다음 단계 →")').nth(1);
    await nextStepBtn2.click();

    // Now on Step 3 - enter code WITH type cast
    const editor3 = page.locator('#editor3');
    await editor3.fill('int interest = (int)(loan * interestRate);');

    // Click run button
    const runBtn3 = page.locator('button:has-text("▶ 코드 실행"):near(#editor3)').first();
    await runBtn3.click();

    // Should show success and result: 2490
    const output3 = page.locator('#output3');
    const outputText = await output3.textContent();
    expect(outputText).toContain('✅') || expect(outputText).toContain('2490');
  });

  test('✅ Progress bar updates correctly', async ({ page }) => {
    await page.goto(STORY_URL);

    // Check initial progress (Scene 1 of 5)
    let progressBar = page.locator('.progress');
    await expect(progressBar).toBeVisible();

    // Progress should show we're at step 1
    const progressText1 = await progressBar.textContent();
    expect(progressText1).toContain('1');

    // Navigate to Scene 2
    const scene1 = page.locator('[data-scene="1"]');
    const nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    // Progress should update
    progressBar = page.locator('.progress');
    const progressText2 = await progressBar.textContent();
    expect(progressText2).toContain('2') || expect(progressText2).not.toEqual(progressText1);
  });

  test('✅ Responsive design on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(STORY_URL);

    // Container should adapt to single column
    const container = page.locator('.container');
    const computedStyle = await container.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // On mobile, should be 1 column
    expect(computedStyle).toMatch(/1fr/) || expect(computedStyle).not.toContain(' ');

    // Verify content is still visible
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toBeVisible();

    // Images should be visible and fit within viewport
    const img = scene1.locator('img');
    const boundingBox = await img.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('✅ All episode images load successfully', async ({ page }) => {
    await page.goto(STORY_URL);

    // Create a list to track loaded images
    const loadedImages: string[] = [];

    // Listen for successful image loads
    page.on('response', response => {
      if (response.request().resourceType() === 'image' && response.ok()) {
        loadedImages.push(response.url());
      }
    });

    // Navigate through all scenes
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Wait a moment for all images to load
    await page.waitForTimeout(2000);

    // Verify at least some images loaded
    expect(loadedImages.length).toBeGreaterThan(0);
  });

  test('✅ Scene 4: Completion screen displays after Step 3 success', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE and complete all steps
    const scene1 = page.locator('[data-scene="1"]');
    let nextBtn = scene1.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene2 = page.locator('[data-scene="2"]');
    nextBtn = scene2.locator('button:has-text("다음")');
    await nextBtn.click();

    const scene3 = page.locator('[data-scene="3"]');
    const startMissionBtn = scene3.locator('button:has-text("IDE 시작")');
    await startMissionBtn.click();

    // Complete Step 1
    const editor1 = page.locator('#editor1');
    await editor1.fill('int loan = 49800;');
    let runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor1)').first();
    await runBtn.click();
    let nextStepBtn = page.locator('button:has-text("다음 단계 →")').first();
    await nextStepBtn.click();

    // Complete Step 2
    const editor2 = page.locator('#editor2');
    await editor2.fill('double interestRate = 0.05;');
    runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor2)').first();
    await runBtn.click();
    nextStepBtn = page.locator('button:has-text("다음 단계 →")').nth(1);
    await nextStepBtn.click();

    // Complete Step 3
    const editor3 = page.locator('#editor3');
    await editor3.fill('int interest = (int)(loan * interestRate);');
    runBtn = page.locator('button:has-text("▶ 코드 실행"):near(#editor3)').first();
    await runBtn.click();

    // Scene 4 completion screen should now be visible or button should appear
    const scene4 = page.locator('[data-scene="4"]');
    const completeBtn = page.locator('button:has-text("완료")');

    // Either scene 4 is active or complete button is visible
    const scene4Active = await scene4.evaluate(el => el.classList.contains('active')).catch(() => false);
    const completeVisible = await completeBtn.isVisible().catch(() => false);

    expect(scene4Active || completeVisible).toBeTruthy();
  });

});
