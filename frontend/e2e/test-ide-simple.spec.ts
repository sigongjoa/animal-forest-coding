import { test, expect } from '@playwright/test';

test.describe('IDE Simple Test', () => {
  test('Check if IDE page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3002/ide', { waitUntil: 'networkidle' });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if we can see the IDE header
    const header = await page.locator('h2').first().innerText();
    console.log(`IDE Header: ${header}`);
    expect(header).toContain('너굴포트');

    // Wait longer for Pyodide to load
    await page.waitForTimeout(5000);

    // Click editor tab
    const editorTab = page.locator('button:has-text("에디터")').first();
    await editorTab.click();
    await page.waitForTimeout(500);

    // Get the textarea code
    const textarea = page.locator('textarea').first();
    const initialCode = await textarea.inputValue();
    console.log(`Initial code length: ${initialCode.length}`);

    // Try to click run button
    const runButton = page.locator('button:has-text("실행")').first();
    const isRunButtonEnabled = await runButton.isEnabled();
    console.log(`Run button enabled: ${isRunButtonEnabled}`);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/ide_simple_test.png' });
  });
});
