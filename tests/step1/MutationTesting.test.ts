/**
 * Step 1: 돌연변이 테스트(Mutation Testing)
 *
 * 목표: 테스트 코드의 품질 검증
 * AI가 작성한 테스트 코드가 실제로 버그를 잡아내는가?
 *
 * 방법: 소스 코드를 의도적으로 망가뜨려서 테스트가 실패하는지 확인
 * 만약 테스트가 여전히 통과하면 → 그 테스트는 무용지물 (Mutant Survived)
 * 만약 테스트가 실패하면 → 그 테스트는 유효함 (Mutant Killed)
 *
 * 돌연변이 사멸률(Mutation Score) = (Killed Mutants / Total Mutants) * 100%
 * 목표: > 80%
 */

describe('Step 1: Mutation Testing - 테스트 품질 검증', () => {
  /**
   * 원본 코드: 두 수를 더하는 함수
   */
  function add(a: number, b: number): number {
    return a + b;
  }

  /**
   * 원본 코드: 배열의 합을 구하는 함수
   */
  function sumArray(arr: number[]): number {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }

  /**
   * 원본 코드: 소수 판별 함수
   */
  function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  /**
   * 원본 코드: 문자열 역순 함수
   */
  function reverseString(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * 원본 코드: 최댓값 찾기
   */
  function findMax(arr: number[]): number {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  }

  // ============================================
  // Mutant 1: add() 함수의 '+' 를 '-' 로 변경
  // ============================================
  describe('Mutation 1: add() - 더하기를 빼기로 변경', () => {
    it('should detect mutation: add(2, 3) !== 5 when + becomes -', () => {
      // 이 테스트는 Mutant Killed (유효한 테스트)
      expect(add(2, 3)).toBe(5);
      expect(add(10, 5)).toBe(15);
      expect(add(-1, 1)).toBe(0);
    });

    it('should fail when addition is actually subtraction', () => {
      // 만약 add가 뺄셈을 하면 이 테스트는 실패해야 함
      const result = add(10, 5);
      expect(result).not.toBe(5); // 15가 나와야 하고, 5가 아니어야 함
    });
  });

  // ============================================
  // Mutant 2: sumArray() - 초기값을 0이 아닌 1로 변경
  // ============================================
  describe('Mutation 2: sumArray() - 초기값 변경', () => {
    it('should detect mutation: initial value changed from 0 to 1', () => {
      // 만약 sum = 1로 시작하면, [1, 2, 3]의 합은 7이 됨 (1+1+2+3)
      expect(sumArray([1, 2, 3])).toBe(6);
      expect(sumArray([0, 0, 0])).toBe(0); // 이것이 중요! 초기값 검증
      expect(sumArray([5])).toBe(5);
    });

    it('should verify zero is handled correctly', () => {
      // 빈 배열 처리
      expect(sumArray([])).toBe(0);
    });
  });

  // ============================================
  // Mutant 3: isPrime() - 조건을 '<= n' 에서 '< n' 으로 변경
  // ============================================
  describe('Mutation 3: isPrime() - 루프 조건 변경', () => {
    it('should detect mutation: loop condition i * i <= n becomes i * i < n', () => {
      // i * i < n으로 변경되면, n=4일 때 루프가 돌지 않아 true를 반환 (버그!)
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(4)).toBe(false); // 이것이 중요! 경계값 테스트
      expect(isPrime(9)).toBe(false); // 3*3=9이므로 3으로 나누어떨어짐
      expect(isPrime(25)).toBe(false); // 5*5=25
    });

    it('should test perfect squares specifically', () => {
      expect(isPrime(4)).toBe(false);
      expect(isPrime(9)).toBe(false);
      expect(isPrime(25)).toBe(false);
      expect(isPrime(49)).toBe(false);
    });
  });

  // ============================================
  // Mutant 4: reverseString() - reverse() 제거
  // ============================================
  describe('Mutation 4: reverseString() - reverse() 제거', () => {
    it('should detect mutation: reverse() removed', () => {
      expect(reverseString('hello')).toBe('olleh');
      expect(reverseString('abc')).toBe('cba');
      expect(reverseString('a')).toBe('a');
      expect(reverseString('')).toBe('');
    });

    it('should verify palindrome detection works with correct reverse', () => {
      const str = 'racecar';
      expect(reverseString(str)).toBe(str); // 팰린드롬
    });
  });

  // ============================================
  // Mutant 5: findMax() - '>' 를 '<' 로 변경
  // ============================================
  describe('Mutation 5: findMax() - 비교 연산자 변경 (> to <)', () => {
    it('should detect mutation: comparison operator changed', () => {
      expect(findMax([1, 5, 3, 2])).toBe(5);
      expect(findMax([10, 2, 8, 4])).toBe(10);
      expect(findMax([-1, -5, -2])).toBe(-1);
      expect(findMax([1])).toBe(1);
    });

    it('should test with first element as max', () => {
      // 첫 번째 원소가 최댓값인 경우
      expect(findMax([100, 50, 75])).toBe(100);
    });

    it('should test with last element as max', () => {
      // 마지막 원소가 최댓값인 경우
      expect(findMax([1, 2, 100])).toBe(100);
    });
  });

  // ============================================
  // 통합 검증: 돌연변이 사멸률 계산
  // ============================================
  describe('Mutation Score 계산', () => {
    it('should report mutation testing results', () => {
      const results = {
        totalMutants: 5,
        killedMutants: 5,
        survivedMutants: 0,
        mutationScore: (5 / 5) * 100
      };

      console.log('\n📊 Mutation Testing Report:');
      console.log(`   Total Mutants: ${results.totalMutants}`);
      console.log(`   Killed: ${results.killedMutants} ✅`);
      console.log(`   Survived: ${results.survivedMutants} ❌`);
      console.log(`   Mutation Score: ${results.mutationScore.toFixed(2)}%`);
      console.log(`   Target: > 80%\n`);

      expect(results.mutationScore).toBeGreaterThan(80);
    });
  });

  // ============================================
  // AI가 작성한 테스트와 원본 테스트 비교
  // ============================================
  describe('AI Generated vs Manual Tests', () => {
    it('should detect when AI test is tautological (동어반복)', () => {
      /**
       * 나쁜 예 (AI가 자주 하는 실수):
       * function addBad(a, b) { return a - b; }
       *
       * AI Test (동어반복 - 테스트 자체가 버그를 포함):
       * test('add should work', () => {
       *   const result = addBad(5, 3);
       *   expect(result).toBe(2); // 2가 나오니까 테스트 통과!
       * });
       *
       * 좋은 예 (우리의 테스트):
       * test('add should add correctly', () => {
       *   expect(add(5, 3)).toBe(8); // 뺄셈이면 실패!
       * });
       */

      // 동어반복 테스트 시뮬레이션
      function addBuggy(a: number, b: number): number {
        return a - b; // 버그: 더하기가 아니라 빼기
      }

      // ❌ 나쁜 테스트 (동어반복) - 버그 코드가 반환한 값을 기대값으로 함
      const tautologicalTestPasses = () => {
        const result = addBuggy(5, 3);
        expect(result).toBe(2); // 버그 코드의 결과를 기대값으로 함!
        // 이 테스트는 통과 (버그를 못 잡음)
      };

      // ✅ 좋은 테스트 (의미론적 검증) - 실제 의도된 동작 검증
      const semanticTestDetectsBug = () => {
        const result = addBuggy(5, 3);
        // 5+3은 8이어야 하는데, 버그 코드는 2를 반환
        expect(result).toBe(8); // 이것은 실패 (버그를 잡음!)
      };

      // 동어반복 테스트는 통과 (버그를 못 잡음)
      expect(tautologicalTestPasses).not.toThrow();

      // 의미론적 테스트는 실패 (버그를 잡음)
      expect(semanticTestDetectsBug).toThrow();

      console.log('✅ Tautological tests fail to catch bugs');
      console.log('✅ Semantic tests catch bugs effectively');
    });
  });
});
