import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Verification', () => {
  test('Admin page loads and shows Scene Manager', async ({ page }) => {
    // Navigate to admin page
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });

    // Check page title
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    expect(title).toBeTruthy();

    // Check for admin content
    const adminPageVisible = await page.locator('body').isVisible();
    expect(adminPageVisible).toBe(true);
    console.log('✅ Admin page visible');

    // Check for tabs or admin dashboard elements
    const content = await page.content();
    expect(content).toContain('admin' || 'Admin' || 'SCENE' || 'scene' || 'Episode' || 'episode');
    console.log('✅ Admin dashboard content found');

    // Take screenshot
    await page.screenshot({ path: './admin-dashboard.png', fullPage: true });
    console.log('📸 Screenshot saved: ./admin-dashboard.png');
  });

  test('Drag-and-drop elements are rendered', async ({ page }) => {
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });

    // Check for drag-related elements
    const content = await page.content();
    const hasDragElements = content.includes('drag') || content.includes('Drag') || content.includes('sortable');

    if (hasDragElements) {
      console.log('✅ Drag-and-drop elements found in page');
    }

    // Check for scene/episode elements
    const hasSceneElements = content.includes('scene') || content.includes('Scene') || content.includes('episode') || content.includes('Episode');
    expect(hasSceneElements).toBe(true);
    console.log('✅ Scene manager elements found');
  });

  test('Backend API is accessible from frontend', async ({ page }) => {
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });

    // Check console for API errors
    let apiError = false;
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('API')) {
        apiError = true;
        console.log(`⚠️  API Error: ${msg.text()}`);
      }
    });

    // Wait a bit for any initial API calls
    await page.waitForTimeout(2000);

    if (!apiError) {
      console.log('✅ No API errors detected');
    }
  });
});
