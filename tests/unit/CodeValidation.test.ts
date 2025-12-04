/**
 * 코드 검증 로직 단위 테스트
 *
 * 개선: 정규식 기반 검증으로 공백, 주석 변화에 견고하게 대응
 */

describe('Code Validation Improvements', () => {
  // 코드 정규화 함수 (story.html에서 추출)
  function normalizeCode(code: string): string {
    // 1. 한 줄 주석 제거 (//)
    code = code.replace(/\/\/.*$/gm, '');
    // 2. 멀티 라인 주석 제거 (/* ... */)
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    // 3. 연속된 공백을 단일 공백으로 정규화
    code = code.replace(/\s+/g, ' ');
    // 4. 앞뒤 공백 제거
    return code.trim();
  }

  // 정규식 기반 검증
  function validatePattern(
    code: string,
    patterns: RegExp[],
    requireAll: boolean = true
  ): boolean {
    const normalized = normalizeCode(code);
    if (requireAll) {
      return patterns.every(pattern => pattern.test(normalized));
    } else {
      return patterns.some(pattern => pattern.test(normalized));
    }
  }

  describe('Test 1: Whitespace Normalization', () => {
    it('should handle variable spacing variations', () => {
      const code1 = 'int  loan  =  49800;'; // 많은 공백
      const code2 = 'int loan = 49800;'; // 정상 공백
      const code3 = 'int loan=49800;'; // 공백 없음

      const pattern = /\bint\s+loan\s*=\s*49800\b/;

      expect(pattern.test(normalizeCode(code1))).toBe(true);
      expect(pattern.test(normalizeCode(code2))).toBe(true);
      expect(pattern.test(normalizeCode(code3))).toBe(true);
    });

    it('should handle newlines in code', () => {
      const code = `int loan
        = 49800;`;

      const pattern = /\bint\s+loan\s*=\s*49800\b/;
      expect(pattern.test(normalizeCode(code))).toBe(true);
    });
  });

  describe('Test 2: Comment Removal', () => {
    it('should remove single-line comments', () => {
      const code = `int loan = 49800; // 이것은 빚입니다`;
      const normalized = normalizeCode(code);

      expect(normalized).toBe('int loan = 49800;');
      expect(normalized).not.toContain('//');
    });

    it('should remove multi-line comments', () => {
      const code = `/* 변수 선언 */
        int loan = 49800;`;

      const normalized = normalizeCode(code);
      expect(normalized).toContain('int loan = 49800');
      expect(normalized).not.toContain('/*');
    });

    it('should handle nested comment-like patterns', () => {
      const code = `int loan = 49800; // URL: http://example.com`;
      const normalized = normalizeCode(code);

      expect(normalized).toBe('int loan = 49800;');
    });
  });

  describe('Test 3: Step 1 Validation (int loan = 49800)', () => {
    it('should accept exact match', () => {
      const code = 'int loan = 49800;';
      const patterns = [
        /\bint\s+loan\s*=\s*49800\b/,
        /\bint\s+loan/,
        /49800/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should accept code with comments', () => {
      const code = `int loan = 49800; // 빚`;
      const patterns = [
        /\bint\s+loan\s*=\s*49800\b/,
        /\bint\s+loan/,
        /49800/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should accept code with extra whitespace', () => {
      const code = `int  loan   =   49800  ;`;
      const patterns = [
        /\bint\s+loan\s*=\s*49800\b/,
        /\bint\s+loan/,
        /49800/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should reject missing type', () => {
      const code = 'loan = 49800;';
      const patterns = [
        /\bint\s+loan\s*=\s*49800\b/,
        /\bint\s+loan/,
        /49800/
      ];

      expect(validatePattern(code, patterns, true)).toBe(false);
    });

    it('should reject wrong value', () => {
      const code = 'int loan = 50000;';
      const patterns = [
        /\bint\s+loan\s*=\s*49800\b/,
        /\bint\s+loan/,
        /49800/
      ];

      // 49800이 없으므로 거부
      expect(validatePattern(code, patterns, true)).toBe(false);
    });
  });

  describe('Test 4: Step 2 Validation (double interestRate = 0.05)', () => {
    it('should accept exact match', () => {
      const code = 'double interestRate = 0.05;';
      const patterns = [
        /\bdouble\s+interestRate\s*=\s*0\.05\b/,
        /\bdouble\s+interestRate/,
        /0\.05/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should accept with creative variable naming in comments', () => {
      const code = `double interestRate = 0.05; // 5% interest`;
      const patterns = [
        /\bdouble\s+interestRate\s*=\s*0\.05\b/,
        /\bdouble\s+interestRate/,
        /0\.05/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should reject if using int instead of double', () => {
      const code = 'int interestRate = 0;';
      const patterns = [
        /\bdouble\s+interestRate\s*=\s*0\.05\b/,
        /\bdouble\s+interestRate/,
        /0\.05/
      ];

      expect(validatePattern(code, patterns, true)).toBe(false);
    });
  });

  describe('Test 5: Step 3 Validation (int interest with casting)', () => {
    it('should accept correct casting syntax', () => {
      const code = 'int interest = (int) (loan * interestRate);';
      const patterns = [
        /\(int\)\s*\(?\s*loan\s*\*\s*interestRate\s*\)?/,
        /\bint\s+interest\s*=/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should accept casting with different whitespace', () => {
      const code = 'int interest = (int)(loan * interestRate);';
      const patterns = [
        /\(int\)\s*\(?\s*loan\s*\*\s*interestRate\s*\)?/,
        /\bint\s+interest\s*=/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should accept casting with comments', () => {
      const code = `int interest = (int) (loan * interestRate); // 이자 계산`;
      const patterns = [
        /\(int\)\s*\(?\s*loan\s*\*\s*interestRate\s*\)?/,
        /\bint\s+interest\s*=/
      ];

      expect(validatePattern(code, patterns, true)).toBe(true);
    });

    it('should reject missing (int) casting', () => {
      const code = 'int interest = loan * interestRate;';
      const patterns = [
        /\(int\)\s*\(?\s*loan\s*\*\s*interestRate\s*\)?/,
        /\bint\s+interest\s*=/
      ];

      expect(validatePattern(code, patterns, true)).toBe(false);
    });

    it('should reject double type instead of int', () => {
      const code = 'double interest = (int) (loan * interestRate);';
      const patterns = [
        /\(int\)\s*\(?\s*loan\s*\*\s*interestRate\s*\)?/,
        /\bint\s+interest\s*=/
      ];

      expect(validatePattern(code, patterns, true)).toBe(false);
    });
  });

  describe('Test 6: Edge Cases', () => {
    it('should handle variable with underscore in name', () => {
      // 이 테스트는 현재 구현에서는 실패할 것으로 예상
      // 하지만 향후 개선 사항을 나타냄
      const code = 'int my_loan = 49800;';
      const patterns = [/\bint\s+loan\b/];

      // 현재는 실패 - 이는 의도된 동작 (정확한 변수명 확인)
      expect(validatePattern(code, patterns, true)).toBe(false);
    });

    it('should handle multiple statements on one line', () => {
      const code = 'int loan = 49800; double interestRate = 0.05;';
      const patterns1 = [/\bint\s+loan\s*=\s*49800\b/];
      const patterns2 = [/\bdouble\s+interestRate\s*=\s*0\.05\b/];

      expect(validatePattern(code, patterns1, true)).toBe(true);
      expect(validatePattern(code, patterns2, true)).toBe(true);
    });

    it('should be case-sensitive for keywords', () => {
      const code = 'INT loan = 49800;';
      const patterns = [/\bint\s+loan/];

      expect(validatePattern(code, patterns, true)).toBe(false);
    });
  });

  describe('Test 7: Performance', () => {
    it('should normalize code quickly', () => {
      const largeCode = 'int loan = 49800; // ' + 'comment'.repeat(1000);
      const start = performance.now();

      normalizeCode(largeCode);

      const time = performance.now() - start;
      expect(time).toBeLessThan(100); // 100ms 이내
    });

    it('should validate patterns quickly', () => {
      const code = 'int loan = 49800;';
      const patterns = [/\bint\s+loan\s*=\s*49800\b/];
      const start = performance.now();

      validatePattern(code, patterns, true);

      const time = performance.now() - start;
      expect(time).toBeLessThan(10); // 10ms 이내
    });
  });
});
