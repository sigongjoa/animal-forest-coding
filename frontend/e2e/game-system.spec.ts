import { test, expect } from '@playwright/test';

test.describe('Game System Integration', () => {

    test('Mission Success should award Bells', async ({ page }) => {
        // 1. Navigate to Mission 101
        await page.goto('http://localhost:3000/mission/mission-101');

        // Wait for load
        await expect(page.getByText('Loading Mission')).toBeHidden();

        // 2. Check Initial Bells (Click "My Island" tab)
        await page.click('text=My Island 🏝️');
        const bellsDisplay = page.getByTestId('bells-display');
        await expect(bellsDisplay).toContainText('0 Bells');

        // 3. Enter Code
        // Note: Monaco Editor is hard to type into directly with Playwright sometimes,
        // but we can try locator or keyboard.
        await page.click('.monaco-editor');
        await page.keyboard.press('Control+A');
        await page.keyboard.type('int x = 10; System.out.println(x);');

        // 4. Run Code
        await page.click('text=Run Code');

        // 5. Wait for Validation
        // Expect success message
        await expect(page.getByText('Test Passed!')).toBeVisible({ timeout: 10000 });

        // 6. Check Bells Updated
        await expect(bellsDisplay).toContainText('100 Bells');
    });

});
