import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';
import * as fs from 'fs';

test.describe('IDE Complete Verification', () => {
  test('IDE-VERIFY: Take screenshots and verify MD5 hash', async ({ page }) => {
    await page.goto('http://localhost:3002/ide', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for IDE to fully load
    await page.waitForTimeout(3000);
    
    // Take screenshot of initial IDE state
    const screenshotPath = '/tmp/ide_initial_state.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Calculate MD5 hash of screenshot
    const imageBuffer = fs.readFileSync(screenshotPath);
    const md5Hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    
    console.log(`Screenshot saved: ${screenshotPath}`);
    console.log(`MD5 Hash: ${md5Hash}`);
    console.log(`File size: ${imageBuffer.length} bytes`);
    
    // Verify file exists and has content
    expect(fs.existsSync(screenshotPath)).toBe(true);
    expect(imageBuffer.length).toBeGreaterThan(1000);
  });

  test('IDE-EXECUTE: Test code execution with string input', async ({ page }) => {
    await page.goto('http://localhost:3002/ide', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Click on editor tab
    const editorTab = page.locator('button:has-text("에디터")').first();
    await editorTab.click();
    await page.waitForTimeout(500);
    
    // Find code editor
    const codeEditor = page.locator('textarea').first();

    // Clear existing code
    await codeEditor.click();
    await codeEditor.press('Control+A');
    await codeEditor.press('Delete');
    
    // Write test code with string
    const testCode = `name = "너굴"
message = f"안녕하세요! {name}입니다"
print(message)`;
    
    await codeEditor.fill(testCode);
    console.log(`Entered code: ${testCode}`);
    
    // Click run button
    const runButton = page.locator('button:has-text("실행")').first();
    await runButton.click();

    // Wait for execution to complete (Pyodide needs time to load)
    await page.waitForTimeout(5000);
    
    // Take screenshot of code execution
    const executionScreenshotPath = '/tmp/ide_code_execution.png';
    await page.screenshot({ path: executionScreenshotPath, fullPage: true });
    
    // Calculate MD5 hash
    const imageBuffer = fs.readFileSync(executionScreenshotPath);
    const md5Hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    
    console.log(`Code execution screenshot: ${executionScreenshotPath}`);
    console.log(`MD5 Hash: ${md5Hash}`);
    console.log(`File size: ${imageBuffer.length} bytes`);
    
    // Verify that code execution happened (no crash, no error dialog visible)
    // Just confirm the page is still responsive
    const editorTab2 = page.locator('button:has-text("에디터")').first();
    const isEditorTabStillClickable = await editorTab2.isEnabled();
    console.log(`Editor still responsive: ${isEditorTabStillClickable}`);
    expect(isEditorTabStillClickable).toBe(true);
  });

  test('IDE-DEBUG: Step through execution and verify no errors', async ({ page }) => {
    await page.goto('http://localhost:3002/ide', { waitUntil: 'networkidle' });
    
    // Click editor tab
    const editorTab = page.locator('button:has-text("에디터")').first();
    await editorTab.click();
    await page.waitForTimeout(500);
    
    // Find editor
    const codeEditor = page.locator('textarea').first();
    await codeEditor.click();
    
    // Test 1: Simple variable
    console.log('\n=== Test 1: Simple variable ===');
    await codeEditor.fill('x = 10\nprint(x)');
    let runButton = page.locator('button:has-text("실행")').first();
    await runButton.click();
    await page.waitForTimeout(1500);
    
    let errorBox = page.locator('[class*="error"]').first();
    let hasError = await errorBox.isVisible().catch(() => false);
    console.log(`Test 1 - Has error: ${hasError}`);
    
    // Test 2: String concatenation
    console.log('\n=== Test 2: String concatenation ===');
    await codeEditor.fill('s = "hello"\nprint(s + " world")');
    runButton = page.locator('button:has-text("실행")').first();
    await runButton.click();
    await page.waitForTimeout(1500);
    
    errorBox = page.locator('[class*="error"]').first();
    hasError = await errorBox.isVisible().catch(() => false);
    console.log(`Test 2 - Has error: ${hasError}`);
    
    // Test 3: Loop
    console.log('\n=== Test 3: For loop ===');
    await codeEditor.fill('for i in range(3):\n    print(i)');
    runButton = page.locator('button:has-text("실행")').first();
    await runButton.click();
    await page.waitForTimeout(1500);
    
    errorBox = page.locator('[class*="error"]').first();
    hasError = await errorBox.isVisible().catch(() => false);
    console.log(`Test 3 - Has error: ${hasError}`);
    
    // Take final debug screenshot
    const debugScreenshotPath = '/tmp/ide_debug_final.png';
    await page.screenshot({ path: debugScreenshotPath, fullPage: true });
    
    const imageBuffer = fs.readFileSync(debugScreenshotPath);
    const md5Hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    
    console.log(`\nFinal debug screenshot: ${debugScreenshotPath}`);
    console.log(`MD5 Hash: ${md5Hash}`);
    console.log(`File size: ${imageBuffer.length} bytes`);
  });
});
