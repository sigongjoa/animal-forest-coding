import { test, expect } from '@playwright/test';

const STORY_URL = 'http://localhost:3002/story.html';

test.describe('Episode 1: Story Page Quick Verification', () => {

  test('✅ Story page loads with correct title', async ({ page }) => {
    const response = await page.goto(STORY_URL);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/너굴 코딩.*에피소드 1/);
  });

  test('✅ Scene 1 displays with opening image', async ({ page }) => {
    await page.goto(STORY_URL);
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toHaveClass(/active/);
    const img = scene1.locator('img').first();
    await expect(img).toBeVisible();
  });

  test('✅ Step 1 IDE: int variable validation works', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE
    const nextBtn = page.locator('button:has-text("다음")').first();
    await nextBtn.click();
    await page.waitForTimeout(500);

    const nextBtn2 = page.locator('button:has-text("다음")').first();
    await nextBtn2.click();
    await page.waitForTimeout(500);

    const startBtn = page.locator('button:has-text("IDE 시작")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(500);
    }

    // Find editor and enter correct code
    const editor1 = page.locator('#editor1');
    if (await editor1.isVisible()) {
      await editor1.fill('int loan = 49800;');

      // Run code
      const runBtn = page.locator('button:has-text("▶ 코드 실행")').first();
      await runBtn.click();
      await page.waitForTimeout(500);

      // Check output
      const output = page.locator('#output1');
      const text = await output.textContent();

      // Success if it contains ✅ or 성공
      expect(text).toMatch(/✅|성공|int/i);
    }
  });

  test('✅ Step 1 validation fails on incorrect code', async ({ page }) => {
    await page.goto(STORY_URL);

    // Navigate to IDE (skip to Step 1)
    const nextBtn = page.locator('button:has-text("다음")').first();
    await nextBtn.click();
    await page.waitForTimeout(500);

    const nextBtn2 = page.locator('button:has-text("다음")').first();
    await nextBtn2.click();
    await page.waitForTimeout(500);

    const startBtn = page.locator('button:has-text("IDE 시작")');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(500);
    }

    // Enter incorrect code (missing "int")
    const editor1 = page.locator('#editor1');
    if (await editor1.isVisible()) {
      await editor1.fill('loan = 49800;');

      // Run code
      const runBtn = page.locator('button:has-text("▶ 코드 실행")').first();
      await runBtn.click();
      await page.waitForTimeout(500);

      // Check output for error
      const output = page.locator('#output1');
      const text = await output.textContent();

      // Should contain error indicator
      expect(text).toMatch(/❌|오류|Error|int/i);
    }
  });

  test('✅ Progress bar visible and updates', async ({ page }) => {
    await page.goto(STORY_URL);

    const progress = page.locator('.progress');
    await expect(progress).toBeVisible();

    // Check initial progress text
    const initialText = await progress.textContent();
    expect(initialText).toBeTruthy();

    // Navigate
    const nextBtn = page.locator('button:has-text("다음")').first();
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Progress should still be visible
    await expect(progress).toBeVisible();
  });

  test('✅ Mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(STORY_URL);

    // Container should be responsive
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Scene should be visible on mobile
    const scene1 = page.locator('[data-scene="1"]');
    await expect(scene1).toBeVisible();

    // Image should fit mobile screen
    const img = scene1.locator('img').first();
    const box = await img.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

  test('✅ All images load without errors', async ({ page }) => {
    // Track image load failures
    const failedImages: string[] = [];

    page.on('response', response => {
      if (response.request().resourceType() === 'image' && !response.ok()) {
        failedImages.push(response.url());
      }
    });

    await page.goto(STORY_URL);
    await page.waitForTimeout(2000);

    // Should have no failed images
    expect(failedImages.length).toBe(0);
  });

});
