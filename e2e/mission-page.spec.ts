import { test, expect } from '@playwright/test';

test.describe('Mission Page & IDE Flow', () => {
    test('should navigate through story and submit code', async ({ page }) => {
        // 1. Navigate to Mission Page (Mocking the route directly)
        await page.goto('http://localhost:3000/mission/mission-001');

        // 3. Verify Story Mode
        await expect(page.locator('h1')).toContainText('Welcome to Animal Forest');

        // Check for story dialogue
        const dialogueBox = page.getByTestId('dialogue-box');
        await expect(dialogueBox).toBeVisible({ timeout: 10000 });

        // Use Escape key to skip intro scenario (added for accessibility and testing)
        // Wait a bit for scenario to be fully interactive
        await page.waitForTimeout(2000);
        await page.keyboard.press('Escape');

        // Wait for IDE transition
        await page.waitForTimeout(1000);

        // Start Mission Button (Interactive Mode Transition if any)
        const startButton = page.getByRole('button', { name: /Start Mission|시작하기/i });
        if (await startButton.isVisible()) {
            await startButton.click();
        }

        // 4. Verify IDE Mode
        // Wait for IDE to load (Step Title h2)
        await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });

        // 5. Simulate Code Entry
        // For E2E, we verify the Run button exists and clicks it
        const runButton = page.getByRole('button', { name: /Run Code|실행/i });
        await expect(runButton).toBeVisible();
        await runButton.click();

        // 7. Verify Feedback area appears (or console output)
        const feedbackArea = page.locator('.text-lg.font-bold, .bg-gray-900.text-white');
        await expect(feedbackArea).toBeVisible({ timeout: 10000 });
    });
});
