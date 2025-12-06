import { test, expect } from '@playwright/test';

test.describe('Mission Page & IDE Flow', () => {
    test('should navigate through story and submit code', async ({ page }) => {
        // 1. Navigate to Mission Page (Mocking the route directly)
        await page.goto('http://localhost:3000/mission/mission-001');

        // 2. Mock API responses if necessary (or relying on backend mock mode)
        // Here we assume the backend is running and serving mock data from our JSON

        // 3. Verify Story Mode
        await expect(page.locator('h1')).toContainText('Welcome to Animal Forest');

        // Check for story dialogue
        const dialogueBox = page.getByTestId('dialogue-box');
        await expect(dialogueBox).toBeVisible({ timeout: 10000 });

        // Click 'Next' through dialogue
        // Assuming there are 3 dialogue lines
        // Click through dialogue
        // New interactive scenario uses 'dialogue-box' click to advance
        // We will keep clicking until the dialogue box disappears or IDE appears
        let attempts = 0;
        while (attempts < 20) {
            const dialogueBox = page.getByTestId('dialogue-box');
            if (await dialogueBox.isVisible()) {
                await dialogueBox.click();
                await page.waitForTimeout(500); // Wait for transition/animation
            } else {
                // If dialogue box is gone, check if we are in IDE mode
                if (await page.locator('.monaco-editor, textarea').isVisible()) {
                    break;
                }
            }
            attempts++;
        }

        // Start Mission Button
        const startButton = page.locator('button:has-text("Start Mission")');
        if (await startButton.isVisible()) {
            await startButton.click();
        }

        // 4. Verify IDE Mode
        const editor = page.locator('.monaco-editor, textarea'); // Fallback to textarea if monaco not loaded
        await expect(page.locator('h2')).toBeVisible(); // Step Title

        // 5. Simulate Code Entry (using textarea fallback for simplicity or specialized monaco input)
        // Note: Monaco is hard to type into with Playwright directly without specific helpers

        // 6. Click Run/Validate
        const runButton = page.locator('button:has-text("Run Code")');
        await expect(runButton).toBeVisible();
        await runButton.click();

        // 7. Verify Feedback area appears
        const feedbackArea = page.locator('div:has-text("Feedback")').or(page.locator('.text-lg.font-bold'));
        await expect(feedbackArea).toBeVisible();
    });
});
