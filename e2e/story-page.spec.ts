import { test, expect } from '@playwright/test';

const STORY_URL = 'http://localhost:3000/story.html';

test.describe('Episode 1: 너굴 코딩 - 공짜는 없다구리! (Story Page)', () => {

  test('✅ Page loads successfully', async ({ page }) => {
    await page.goto(STORY_URL);
    // Verify page title
    await expect(page).toHaveTitle(/너굴 코딩.*에피소드 1/);

    // Verify container
    await expect(page.locator('.container')).toBeVisible();
  });

  test('✅ Scene Navigation: 1 -> 2 -> 3', async ({ page }) => {
    await page.goto(STORY_URL);

    // Scene 1 Active
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toHaveClass(/active/);
    await expect(scene1.locator('.character-sprite')).toBeVisible();

    // Go to Scene 2
    await scene1.locator('button:has-text("다음")').click();

    const scene2 = page.locator('[data-scene="2"]');
    await expect(scene2).toHaveClass(/active/);
    await expect(scene2.locator('.nook-quote')).toContainText('49,800');

    // Go to Scene 3
    await scene2.locator('button:has-text("다음")').click();

    const scene3 = page.locator('[data-scene="3"]');
    await expect(scene3).toHaveClass(/active/);
    await expect(scene3.locator('button:has-text("IDE 시작하기")')).toBeVisible();
  });

  test('✅ IDE Activation', async ({ page }) => {
    await page.goto(STORY_URL);
    // Fast forward to Scene 3
    await page.locator('[data-scene="1"] button').click();
    await page.locator('[data-scene="2"] button').click();

    // Click Start IDE
    await page.locator('[data-scene="3"] button').click();

    const ide = page.locator('#ideSection');
    await expect(ide).toBeVisible();
    await expect(page.locator('#mission-1')).toBeVisible();
  });

  test('✅ Mission 1: Variable Declaration (Success)', async ({ page }) => {
    await page.goto(STORY_URL);
    // Navigate to IDE
    await page.locator('[data-scene="1"] button').click();
    await page.locator('[data-scene="2"] button').click();
    await page.locator('[data-scene="3"] button').click();

    // Type Code
    const editor = page.locator('#editor-step1');
    await editor.fill('int loan = 49800;');

    // Run
    await page.locator('#mission-1 .run-button').click();

    // Verify Output
    const output = page.locator('#output-content-step1');
    await expect(output).toContainText('Success');

    // Verify Next Button
    const nextBtn = page.locator('#next-step1');
    await expect(nextBtn).toBeVisible();
  });

  test('✅ Mission 1: Variable Declaration (Fail)', async ({ page }) => {
    await page.goto(STORY_URL);
    // Navigate to IDE
    await page.locator('[data-scene="1"] button').click();
    await page.locator('[data-scene="2"] button').click();
    await page.locator('[data-scene="3"] button').click();

    // Type Wrong Code
    const editor = page.locator('#editor-step1');
    await editor.fill('loan = 49800;'); // missing type

    // Run
    await page.locator('#mission-1 .run-button').click();

    // Verify Error
    const output = page.locator('#output-content-step1');
    await expect(output).toContainText('Failed');

    // Verify Next Button Hidden
    const nextBtn = page.locator('#next-step1');
    await expect(nextBtn).toBeHidden();
  });

  test('✅ Full Mission Flow: Step 1 -> Step 2 -> Step 3 -> Completion', async ({ page }) => {
    await page.goto(STORY_URL);
    // Navigate to IDE
    await page.locator('[data-scene="1"] button').click();
    await page.locator('[data-scene="2"] button').click();
    await page.locator('[data-scene="3"] button').click();

    // Step 1
    await page.locator('#editor-step1').fill('int loan = 49800;');
    await page.locator('#mission-1 .run-button').click();
    await page.locator('#next-step1').click();

    // Step 2
    await expect(page.locator('#mission-2')).toBeVisible();
    await page.locator('#editor-step2').fill('double interestRate = 0.05;');
    await page.locator('#mission-2 .run-button').click();
    await page.locator('#next-step2').click();

    // Step 3
    await expect(page.locator('#mission-3')).toBeVisible();
    await page.locator('#editor-step3').fill('int interest = (int)(loan * interestRate);');
    await page.locator('#mission-3 .run-button').click();

    // Final Completion
    const finishBtn = page.locator('#next-step3');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click(); // Should go to Scene 4

    // Verify Scene 4
    const scene4 = page.locator('[data-scene="4"]');
    await expect(scene4).toHaveClass(/active/);
    await expect(scene4).toContainText('축하해');
  });

  test('✅ Progress Bar Updates', async ({ page }) => {
    await page.goto(STORY_URL);
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible();

    // Scene 1: Item 1 active
    await expect(progressBar.locator('.progress-item').nth(0)).toHaveClass(/active/);

    // Go to Scene 2
    await page.locator('[data-scene="1"] button').click();

    // Scene 2: Item 1 completed, Item 2 active
    await expect(progressBar.locator('.progress-item').nth(0)).toHaveClass(/completed/);
    await expect(progressBar.locator('.progress-item').nth(1)).toHaveClass(/active/);
  });

});
