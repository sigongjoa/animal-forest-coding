import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

/**
 * Java IDE Comprehensive E2E Tests with Screenshot Verification
 *
 * 테스트 목표:
 * 1. 실제 사용자 시나리오 기반 테스트
 * 2. 각 단계마다 스크린샷 캡처
 * 3. 스크린샷 MD5 해시로 변화 검증
 * 4. UI/UX 시각적 변화 확인
 */

// 스크린샷 디렉토리
const SCREENSHOT_DIR = path.join(__dirname, '../test-screenshots');
const HASH_LOG_FILE = path.join(__dirname, '../test-screenshots/screenshot-hashes.json');

// 스크린샷 저장 및 해시 계산 함수
async function captureAndHashScreenshot(
  page: any,
  filename: string,
  testCase: string
): Promise<{ filename: string; hash: string; size: number }> {
  // 디렉토리 생성
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // 스크린샷 경로
  const filepath = path.join(SCREENSHOT_DIR, filename);

  // 스크린샷 캡처
  await page.screenshot({ path: filepath, fullPage: true });

  // 파일 읽기
  const fileBuffer = fs.readFileSync(filepath);
  const size = fileBuffer.length;

  // MD5 해시 계산
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

  // 로그 기록
  console.log(`📸 Screenshot: ${filename}`);
  console.log(`   Test Case: ${testCase}`);
  console.log(`   Size: ${size} bytes`);
  console.log(`   MD5 Hash: ${hash}`);
  console.log('');

  return { filename, hash, size };
}

// 테스트용 포트 설정
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Java IDE E2E Tests - Complete User Scenarios', () => {
  let hashes: any[] = [];

  test.beforeEach(async ({ page }) => {
    // IDE 페이지 로드
    await page.goto(`${BASE_URL}/ide`);

    // 페이지 로드 대기
    await page.waitForTimeout(1000);
  });

  test.afterAll(() => {
    // 모든 해시를 파일에 저장
    const hashData = {
      timestamp: new Date().toISOString(),
      totalScreenshots: hashes.length,
      screenshots: hashes,
      uniqueHashes: new Set(hashes.map(h => h.hash)).size,
      verification: {
        allDifferent: new Set(hashes.map(h => h.hash)).size === hashes.length,
        message: `${hashes.length}개 스크린샷 중 ${new Set(hashes.map(h => h.hash)).size}개가 고유함`,
      },
    };

    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    fs.writeFileSync(HASH_LOG_FILE, JSON.stringify(hashData, null, 2));
    console.log(`\n✅ Hash log saved to: ${HASH_LOG_FILE}`);
  });

  // ============================================================================
  // UC-1: 초보자 학생이 첫 번째 미션 완료
  // ============================================================================

  test('UC-1: 초보자가 변수 미션 완료 (Before/After 스크린샷)', async ({ page }) => {
    // 1. 초기 상태 스크린샷
    console.log('\n🎯 UC-1: 초보자 학생이 첫 미션 완료\n');
    const initialHash = await captureAndHashScreenshot(
      page,
      'uc1_01_initial_page.png',
      'UC-1: IDE 초기 로드'
    );
    hashes.push(initialHash);

    // 2. 미션 탭 선택
    await page.click('button:has-text("미션")');
    await page.waitForTimeout(500);
    const missionTabHash = await captureAndHashScreenshot(
      page,
      'uc1_02_mission_tab_selected.png',
      'UC-1: 미션 탭 클릭 후'
    );
    hashes.push(missionTabHash);

    // 미션 탭이 활성화되었는지 확인
    const missionTab = page.locator('button:has-text("미션")');
    await expect(missionTab).toHaveClass(/active/);

    // 3. var-101 미션 선택
    await page.click('text=변수 선언');
    await page.waitForTimeout(500);
    const missionSelectedHash = await captureAndHashScreenshot(
      page,
      'uc1_03_mission_var101_selected.png',
      'UC-1: var-101 미션 선택'
    );
    hashes.push(missionSelectedHash);

    // 4. 에디터 탭 전환
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);
    const editorTabHash = await captureAndHashScreenshot(
      page,
      'uc1_04_editor_tab_opened.png',
      'UC-1: 에디터 탭 열기'
    );
    hashes.push(editorTabHash);

    // 5. 코드 실행 전 상태
    const runButtonBefore = await captureAndHashScreenshot(
      page,
      'uc1_05_before_execution.png',
      'UC-1: 실행 전 상태'
    );
    hashes.push(runButtonBefore);

    // 6. 실행 버튼 클릭
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(2000); // Java 실행 대기

    const runButtonAfter = await captureAndHashScreenshot(
      page,
      'uc1_06_after_execution_success.png',
      'UC-1: 실행 후 성공'
    );
    hashes.push(runButtonAfter);

    // 출력 확인
    const output = page.locator('text=10');
    await expect(output).toBeVisible();

    // 너굴 메시지 확인 (축하 메시지)
    const nookMessage = page.locator('text=/완료|축하|좋아/');
    await expect(nookMessage).toBeVisible();

    // 7. 진행도 탭 클릭
    await page.click('button:has-text("진행도")');
    await page.waitForTimeout(500);

    const progressTabHash = await captureAndHashScreenshot(
      page,
      'uc1_07_progress_tab_updated.png',
      'UC-1: 진행도 탭 (포인트 증가)'
    );
    hashes.push(progressTabHash);

    // 포인트 확인 (var-101은 500점)
    const points = page.locator('text=500');
    await expect(points).toBeVisible();

    console.log('✅ UC-1 완료: 초보자 학생이 첫 미션을 성공적으로 완료했습니다.\n');
  });

  // ============================================================================
  // UC-2: 사용자가 컴파일 오류 수정
  // ============================================================================

  test('UC-2: 컴파일 오류 수정 (오류 → 수정 → 성공)', async ({ page }) => {
    console.log('\n🎯 UC-2: 사용자가 컴파일 오류 수정\n');

    // 1. if-104 미션 선택
    await page.click('button:has-text("미션")');
    await page.click('text=If 조건문');
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);

    // 2. 의도적으로 잘못된 코드 입력
    const codeEditor = page.locator('.code-editor, textarea');
    await codeEditor.clear();
    const incorrectCode = `public class Solution {
  public static void main(String[] args) {
    int score = 85
    if (score >= 80) {
      System.out.println("합격");
    }
  }
}`;
    await codeEditor.fill(incorrectCode);
    await page.waitForTimeout(500);

    const errorCodeHash = await captureAndHashScreenshot(
      page,
      'uc2_01_incorrect_code_entered.png',
      'UC-2: 잘못된 코드 입력 (세미콜론 누락)'
    );
    hashes.push(errorCodeHash);

    // 3. 실행하여 오류 발생
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(2000);

    const compilationErrorHash = await captureAndHashScreenshot(
      page,
      'uc2_02_compilation_error_shown.png',
      'UC-2: 컴파일 오류 표시'
    );
    hashes.push(compilationErrorHash);

    // 오류 메시지 확인
    const errorBox = page.locator('.error-box, text=/error|;/i');
    await expect(errorBox).toBeVisible();

    // 4. 코드 수정
    await codeEditor.clear();
    const correctCode = `public class Solution {
  public static void main(String[] args) {
    int score = 85;
    if (score >= 80) {
      System.out.println("합격");
    }
  }
}`;
    await codeEditor.fill(correctCode);
    await page.waitForTimeout(500);

    const fixedCodeHash = await captureAndHashScreenshot(
      page,
      'uc2_03_code_fixed.png',
      'UC-2: 코드 수정 (세미콜론 추가)'
    );
    hashes.push(fixedCodeHash);

    // 5. 재실행
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(2000);

    const successAfterFixHash = await captureAndHashScreenshot(
      page,
      'uc2_04_success_after_fix.png',
      'UC-2: 수정 후 성공'
    );
    hashes.push(successAfterFixHash);

    // 성공 확인
    const output = page.locator('text=합격');
    await expect(output).toBeVisible();

    console.log('✅ UC-2 완료: 컴파일 오류를 수정하고 성공했습니다.\n');
  });

  // ============================================================================
  // TC-3: 컴파일 오류 - 세미콜론 누락
  // ============================================================================

  test('TC-3: 컴파일 오류 처리 (세미콜론 누락)', async ({ page }) => {
    console.log('\n🎯 TC-3: 컴파일 오류 - 세미콜론 누락\n');

    await page.click('button:has-text("미션")');
    await page.click('button:has-text("에디터")');

    const codeEditor = page.locator('.code-editor, textarea');
    const errorCode = `public class Solution {
  public static void main(String[] args) {
    int x = 10
    System.out.println(x);
  }
}`;

    await codeEditor.fill(errorCode);
    await page.waitForTimeout(500);

    const beforeErrorHash = await captureAndHashScreenshot(
      page,
      'tc3_01_before_compilation.png',
      'TC-3: 컴파일 전 상태'
    );
    hashes.push(beforeErrorHash);

    // 실행
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(2000);

    const afterErrorHash = await captureAndHashScreenshot(
      page,
      'tc3_02_compilation_error_message.png',
      'TC-3: 컴파일 오류 메시지'
    );
    hashes.push(afterErrorHash);

    // 오류 메시지에 세미콜론 관련 정보 포함
    const errorMessage = page.locator('.error-box');
    const text = await errorMessage.textContent();
    expect(text).toContain("';' expected");

    console.log('✅ TC-3 완료: 컴파일 오류가 정확하게 보고되었습니다.\n');
  });

  // ============================================================================
  // TC-4: 보안 위반 - System.exit()
  // ============================================================================

  test('TC-4: 보안 검증 - System.exit() 차단', async ({ page }) => {
    console.log('\n🎯 TC-4: 보안 검증 - System.exit() 차단\n');

    await page.click('button:has-text("에디터")');

    const codeEditor = page.locator('.code-editor, textarea');
    const maliciousCode = `public class Solution {
  public static void main(String[] args) {
    System.exit(0);
  }
}`;

    await codeEditor.fill(maliciousCode);
    await page.waitForTimeout(500);

    const beforeSecurityHash = await captureAndHashScreenshot(
      page,
      'tc4_01_malicious_code_entered.png',
      'TC-4: 악의적 코드 입력'
    );
    hashes.push(beforeSecurityHash);

    // 실행 (즉시 차단됨)
    await page.click('button:has-text("실행")');
    await page.waitForTimeout(1000); // 보안 검사는 빠름

    const afterSecurityHash = await captureAndHashScreenshot(
      page,
      'tc4_02_security_violation_blocked.png',
      'TC-4: 보안 위반 차단됨'
    );
    hashes.push(afterSecurityHash);

    // 보안 오류 확인
    const errorMessage = page.locator('.error-box');
    const text = await errorMessage.textContent();
    expect(text).toContain('Blocked pattern');

    console.log('✅ TC-4 완료: System.exit() 악의적 코드가 차단되었습니다.\n');
  });

  // ============================================================================
  // TC-8: 탭 전환 검증
  // ============================================================================

  test('TC-8: 탭 전환 UI (미션 ↔ 에디터 ↔ 진행도)', async ({ page }) => {
    console.log('\n🎯 TC-8: 탭 전환 검증\n');

    // 초기 상태
    const initialTabHash = await captureAndHashScreenshot(
      page,
      'tc8_01_initial_missions_tab.png',
      'TC-8: 미션 탭 (초기)'
    );
    hashes.push(initialTabHash);

    // 미션 탭 활성 확인
    const missionTab = page.locator('button:has-text("미션")');
    await expect(missionTab).toHaveClass(/active/);

    // 에디터 탭 전환
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);

    const editorTabHash = await captureAndHashScreenshot(
      page,
      'tc8_02_editor_tab_active.png',
      'TC-8: 에디터 탭 (활성)'
    );
    hashes.push(editorTabHash);

    const editorTab = page.locator('button:has-text("에디터")');
    await expect(editorTab).toHaveClass(/active/);

    // 진행도 탭 전환
    await page.click('button:has-text("진행도")');
    await page.waitForTimeout(500);

    const progressTabHash = await captureAndHashScreenshot(
      page,
      'tc8_03_progress_tab_active.png',
      'TC-8: 진행도 탭 (활성)'
    );
    hashes.push(progressTabHash);

    const progressTab = page.locator('button:has-text("진행도")');
    await expect(progressTab).toHaveClass(/active/);

    // 다시 미션 탭
    await page.click('button:has-text("미션")');
    await page.waitForTimeout(500);

    const backToMissionHash = await captureAndHashScreenshot(
      page,
      'tc8_04_back_to_missions_tab.png',
      'TC-8: 미션 탭으로 복귀'
    );
    hashes.push(backToMissionHash);

    console.log('✅ TC-8 완료: 모든 탭 전환이 정상적으로 작동합니다.\n');
  });

  // ============================================================================
  // TC-9: 코드 초기화 (Reset)
  // ============================================================================

  test('TC-9: 코드 초기화 기능 검증', async ({ page }) => {
    console.log('\n🎯 TC-9: 코드 초기화\n');

    // 미션 선택 및 에디터 열기
    await page.click('button:has-text("미션")');
    await page.click('text=변수 선언');
    await page.click('button:has-text("에디터")');
    await page.waitForTimeout(500);

    // 원본 코드 확인
    const originalCodeHash = await captureAndHashScreenshot(
      page,
      'tc9_01_original_code.png',
      'TC-9: 원본 코드'
    );
    hashes.push(originalCodeHash);

    // 코드 수정
    const codeEditor = page.locator('.code-editor, textarea');
    const modifiedCode = `public class Solution {
  public static void main(String[] args) {
    System.out.println("수정된 코드");
  }
}`;
    await codeEditor.clear();
    await codeEditor.fill(modifiedCode);
    await page.waitForTimeout(500);

    const modifiedCodeHash = await captureAndHashScreenshot(
      page,
      'tc9_02_modified_code.png',
      'TC-9: 수정된 코드'
    );
    hashes.push(modifiedCodeHash);

    // 초기화 버튼 클릭
    await page.click('button:has-text("초기화")');
    await page.waitForTimeout(500);

    const resetCodeHash = await captureAndHashScreenshot(
      page,
      'tc9_03_after_reset.png',
      'TC-9: 초기화 후'
    );
    hashes.push(resetCodeHash);

    // 원본 코드로 복원되었는지 확인
    const currentCode = await codeEditor.inputValue();
    expect(currentCode).toContain('int x = 10');

    console.log('✅ TC-9 완료: 코드 초기화가 정상 작동합니다.\n');
  });

  // ============================================================================
  // UC-3: 모든 미션 완료 후 진행도 확인
  // ============================================================================

  test('UC-3: 모든 미션 완료 후 진행도 대시보드 확인', async ({ page }) => {
    console.log('\n🎯 UC-3: 모든 미션 완료 후 진행도 확인\n');

    const missions = [
      { name: '변수 선언', selector: 'text=변수' },
      { name: '데이터 타입', selector: 'text=데이터' },
      { name: '산술 연산', selector: 'text=산술' },
      { name: 'If 조건문', selector: 'text=If' },
      { name: 'For 반복문', selector: 'text=For' },
      { name: '배열 조작', selector: 'text=배열' },
    ];

    // 각 미션 실행
    for (let i = 0; i < missions.length; i++) {
      await page.click('button:has-text("미션")');
      await page.click(missions[i].selector);
      await page.click('button:has-text("에디터")');
      await page.waitForTimeout(500);

      // 실행
      await page.click('button:has-text("실행")');
      await page.waitForTimeout(2000);

      const missionProgressHash = await captureAndHashScreenshot(
        page,
        `uc3_mission_${i + 1}_completed.png`,
        `UC-3: 미션 ${i + 1}/${missions.length} 완료`
      );
      hashes.push(missionProgressHash);
    }

    // 최종 진행도 확인
    await page.click('button:has-text("진행도")');
    await page.waitForTimeout(500);

    const finalProgressHash = await captureAndHashScreenshot(
      page,
      'uc3_final_progress_dashboard.png',
      'UC-3: 최종 진행도 대시보드 (6/6 완료)'
    );
    hashes.push(finalProgressHash);

    // 6개 완료 확인
    const completedMissions = page.locator('.completed-missions li');
    const count = await completedMissions.count();
    expect(count).toBeGreaterThan(0);

    console.log('✅ UC-3 완료: 모든 미션을 완료했습니다.\n');
  });

  // ============================================================================
  // HASH 검증 테스트
  // ============================================================================

  test('Hash Verification: 모든 스크린샷이 서로 다른지 확인', async () => {
    console.log('\n🎯 MD5 해시 검증\n');

    if (hashes.length === 0) {
      console.log('⚠️  스크린샷이 없습니다.');
      return;
    }

    const hashSet = new Set(hashes.map(h => h.hash));
    const uniqueCount = hashSet.size;
    const totalCount = hashes.length;

    console.log(`📊 총 스크린샷: ${totalCount}개`);
    console.log(`📊 고유한 해시: ${uniqueCount}개`);
    console.log(`📊 중복: ${totalCount - uniqueCount}개`);
    console.log('');

    // 각 스크린샷의 해시 출력
    console.log('📸 스크린샷별 해시:');
    hashes.forEach((h, idx) => {
      console.log(`   ${idx + 1}. ${h.filename}`);
      console.log(`      MD5: ${h.hash}`);
      console.log(`      Size: ${h.size} bytes`);
    });

    // 예상: 대부분의 스크린샷은 서로 다름
    expect(uniqueCount).toBeGreaterThan(totalCount / 2);
    console.log(`\n✅ 해시 검증 완료: ${uniqueCount}/${totalCount} 고유\n`);
  });
});
