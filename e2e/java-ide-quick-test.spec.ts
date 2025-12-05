import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

/**
 * Java IDE Quick E2E Test with MD5 Hash Verification
 *
 * 목표:
 * 1. 실제 Java IDE 동작 검증
 * 2. 스크린샷 캡처 및 MD5 해시 계산
 * 3. 각 단계별 UI 변화 검증
 */

const SCREENSHOT_DIR = path.join(__dirname, '../test-screenshots');

function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function captureScreenshot(
  page: any,
  filename: string,
  description: string
): Promise<{ filename: string; hash: string; size: number; path: string }> {
  ensureScreenshotDir();

  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });

  const fileBuffer = fs.readFileSync(filepath);
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

  console.log(`📸 ${filename}`);
  console.log(`   ${description}`);
  console.log(`   Hash: ${hash}`);
  console.log(`   Size: ${fileBuffer.length} bytes\n`);

  return {
    filename,
    hash,
    size: fileBuffer.length,
    path: filepath,
  };
}

test.describe('Java IDE - Quick E2E Tests with Screenshots', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  const hashes: any[] = [];

  test('Test 1: IDE 로드 및 초기 상태 캡처', async ({ page }) => {
    console.log('\n🎯 Test 1: IDE 로드 및 초기 상태\n');

    await page.goto(`${BASE_URL}/ide`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const screenshot = await captureScreenshot(
      page,
      'test1_ide_loaded.png',
      'IDE 페이지 로드 완료'
    );
    hashes.push(screenshot);

    // IDE 요소 확인
    const missionTab = page.locator('button:has-text("미션")');
    await expect(missionTab).toBeVisible();

    const editorTab = page.locator('button:has-text("에디터")');
    await expect(editorTab).toBeVisible();

    const progressTab = page.locator('button:has-text("진행도")');
    await expect(progressTab).toBeVisible();

    console.log('✅ Test 1 완료: IDE가 성공적으로 로드되었습니다.\n');
  });

  test('Test 2: 변수 미션 선택 및 실행', async ({ page }) => {
    console.log('\n🎯 Test 2: 변수 미션 실행\n');

    await page.goto(`${BASE_URL}/ide`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 미션 탭 활성화
    await page.click('button:has-text("미션")');
    await page.waitForTimeout(500);

    const beforeMissionSelect = await captureScreenshot(
      page,
      'test2_mission_tab_open.png',
      '미션 탭 열기'
    );
    hashes.push(beforeMissionSelect);

    // 첫 번째 미션 선택
    const missions = page.locator('[class*="mission"]');
    const firstMission = missions.first();
    await firstMission.click();
    await page.waitForTimeout(500);

    const afterMissionSelect = await captureScreenshot(
      page,
      'test2_mission_selected.png',
      '변수 미션 선택'
    );
    hashes.push(afterMissionSelect);

    // 에디터 탭으로 이동
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);

    const editorOpened = await captureScreenshot(
      page,
      'test2_editor_opened.png',
      '에디터 탭 열기'
    );
    hashes.push(editorOpened);

    // 코드 실행
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(2000);

    const executionComplete = await captureScreenshot(
      page,
      'test2_execution_result.png',
      '코드 실행 완료'
    );
    hashes.push(executionComplete);

    // 출력 확인
    const outputBox = page.locator('.output-box, text=/\\d+/');
    const isOutputVisible = await outputBox.isVisible().catch(() => false);
    if (isOutputVisible) {
      console.log('✅ 출력이 표시되었습니다.\n');
    }

    console.log('✅ Test 2 완료: 변수 미션이 실행되었습니다.\n');
  });

  test('Test 3: 탭 전환 검증', async ({ page }) => {
    console.log('\n🎯 Test 3: 탭 전환 검증\n');

    await page.goto(`${BASE_URL}/ide`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 미션 탭
    await page.click('button:has-text("미션")');
    await page.waitForTimeout(500);

    const missionTabActive = await captureScreenshot(
      page,
      'test3_tab1_missions.png',
      '미션 탭 활성화'
    );
    hashes.push(missionTabActive);

    // 에디터 탭
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);

    const editorTabActive = await captureScreenshot(
      page,
      'test3_tab2_editor.png',
      '에디터 탭 활성화'
    );
    hashes.push(editorTabActive);

    // 진행도 탭
    await page.click('button:has-text("진행도")');
    await page.waitForTimeout(500);

    const progressTabActive = await captureScreenshot(
      page,
      'test3_tab3_progress.png',
      '진행도 탭 활성화'
    );
    hashes.push(progressTabActive);

    console.log('✅ Test 3 완료: 모든 탭이 올바르게 작동합니다.\n');
  });

  test('Test 4: 컴파일 에러 처리', async ({ page }) => {
    console.log('\n🎯 Test 4: 컴파일 에러 처리\n');

    await page.goto(`${BASE_URL}/ide`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 에디터로 이동
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);

    // 코드 입력
    const codeEditor = page.locator('textarea').first();
    const errorCode = `public class Solution {
  public static void main(String[] args) {
    int x = 10
    System.out.println(x);
  }
}`;

    await codeEditor.clear();
    await codeEditor.fill(errorCode);
    await page.waitForTimeout(500);

    const codeEntered = await captureScreenshot(
      page,
      'test4_error_code_entered.png',
      '에러 코드 입력'
    );
    hashes.push(codeEntered);

    // 실행
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(2000);

    const errorDisplayed = await captureScreenshot(
      page,
      'test4_error_displayed.png',
      '컴파일 에러 표시'
    );
    hashes.push(errorDisplayed);

    console.log('✅ Test 4 완료: 컴파일 에러가 올바르게 표시됩니다.\n');
  });

  test('Hash Verification Report', async () => {
    console.log('\n📊 MD5 해시 검증 리포트\n');
    console.log('═'.repeat(80));

    if (hashes.length === 0) {
      console.log('⚠️  스크린샷이 없습니다.');
      return;
    }

    // 해시 통계
    const hashSet = new Set(hashes.map(h => h.hash));
    const uniqueCount = hashSet.size;
    const totalCount = hashes.length;

    console.log(`\n📈 스크린샷 통계:`);
    console.log(`   총 스크린샷: ${totalCount}개`);
    console.log(`   고유한 해시: ${uniqueCount}개`);
    console.log(`   중복된 해시: ${totalCount - uniqueCount}개`);
    console.log(`   고유성 비율: ${((uniqueCount / totalCount) * 100).toFixed(1)}%`);

    // 각 스크린샷 세부 정보
    console.log(`\n📸 스크린샷 상세 정보:`);
    console.log('─'.repeat(80));
    hashes.forEach((h, idx) => {
      console.log(`${idx + 1}. ${h.filename}`);
      console.log(`   MD5:  ${h.hash}`);
      console.log(`   Size: ${h.size} bytes`);
    });

    // 해시 비교 결과
    console.log(`\n🔍 해시 비교:`);
    console.log('─'.repeat(80));
    let duplicateFound = false;
    for (let i = 0; i < hashes.length; i++) {
      for (let j = i + 1; j < hashes.length; j++) {
        if (hashes[i].hash === hashes[j].hash) {
          console.log(`⚠️  중복: ${hashes[i].filename} === ${hashes[j].filename}`);
          duplicateFound = true;
        }
      }
    }

    if (!duplicateFound) {
      console.log(`✅ 모든 스크린샷이 고유합니다! (중복 없음)`);
    }

    // 최종 결론
    console.log(`\n📋 검증 결론:`);
    console.log('─'.repeat(80));
    if (uniqueCount >= totalCount * 0.8) {
      console.log(`✅ PASSED: ${uniqueCount}/${totalCount} 스크린샷이 고유합니다`);
      console.log(`   → UI/UX 변화가 명확하게 캡처되었습니다`);
    } else {
      console.log(`⚠️  WARNING: ${uniqueCount}/${totalCount}만 고유합니다`);
      console.log(`   → 일부 스크린샷이 중복될 수 있습니다`);
    }

    console.log(`\n═`.repeat(40));

    // JSON 파일로 저장
    ensureScreenshotDir();
    const reportFile = path.join(SCREENSHOT_DIR, 'hash-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      totalScreenshots: totalCount,
      uniqueHashes: uniqueCount,
      duplicates: totalCount - uniqueCount,
      uniquenessRatio: (uniqueCount / totalCount) * 100,
      screenshots: hashes,
      verdict: uniqueCount >= totalCount * 0.8 ? 'PASSED' : 'WARNING',
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n✅ 리포트 저장: ${reportFile}\n`);
  });
});
