/**
 * 돌연변이 테스트 (Mutation Testing)
 *
 * 목표: 테스트 코드의 품질 검증
 * 방식: 코드를 의도적으로 변형(돌연변이) → 테스트가 실패하면 테스트 품질 우수
 *
 * 예시:
 * - == → !== 변경
 * - && → || 변경
 * - true → false 변경
 * - +1 → -1 변경
 */

describe('🧬 Mutation Testing - 테스트 품질 검증', () => {
  describe('산술 연산 돌연변이', () => {
    test('더하기를 빼기로 변경해도 테스트가 실패해야 함', () => {
      const add = (a: number, b: number): number => a + b; // 테스트: a + b
      // 돌연변이: a - b로 변경되면 다른 결과 → 테스트 실패 ✅
      expect(add(2, 3)).toBe(5);
      expect(add(10, 20)).toBe(30);
    });

    test('곱하기를 나누기로 변경해도 테스트가 실패해야 함', () => {
      const multiply = (a: number, b: number): number => a * b;
      // 돌연변이: a / b로 변경 → 다른 결과
      expect(multiply(4, 5)).toBe(20);
      expect(multiply(10, 2)).toBe(20);
    });
  });

  describe('논리 연산 돌연변이', () => {
    test('&&를 ||로 변경해도 테스트가 실패해야 함', () => {
      const isValid = (hasName: boolean, hasEmail: boolean): boolean =>
        hasName && hasEmail; // 둘 다 필요
      // 돌연변이: && → || 변경 → 논리 변경
      expect(isValid(true, true)).toBe(true);
      expect(isValid(true, false)).toBe(false);
      expect(isValid(false, false)).toBe(false);
    });

    test('비교 연산자 변경 감지', () => {
      const isGreater = (a: number, b: number): boolean => a > b;
      // 돌연변이: > → < 또는 >= 등으로 변경
      expect(isGreater(10, 5)).toBe(true);
      expect(isGreater(5, 10)).toBe(false);
      expect(isGreater(5, 5)).toBe(false);
    });

    test('== 와 === 변경 감지', () => {
      const isEqual = (a: any, b: any): boolean => a === b;
      // 돌연변이: === → == 변경
      expect(isEqual('5', 5)).toBe(false); // === 에서 false
      expect(isEqual(5, 5)).toBe(true);
    });
  });

  describe('조건문 돌연변이', () => {
    test('if 조건 반전 감지', () => {
      const getDiscount = (age: number): number => {
        if (age >= 65) {
          return 20; // 시니어 할인 20%
        }
        return 0;
      };
      // 돌연변이: >= → < 로 변경하면 결과가 반대
      expect(getDiscount(70)).toBe(20);
      expect(getDiscount(30)).toBe(0);
      expect(getDiscount(65)).toBe(20);
    });

    test('null 체크 제거 감지', () => {
      const processUser = (user: any): string => {
        if (user === null) {
          return 'Invalid user';
        }
        return user.name;
      };
      // 돌연변이: null 체크 제거 → NPE 발생
      expect(processUser({ name: 'John' })).toBe('John');
      expect(processUser(null)).toBe('Invalid user');
    });
  });

  describe('변수 값 돌연변이', () => {
    test('상수 값 변경 감지', () => {
      const MIN_AGE = 18;
      const isAdult = (age: number): boolean => age >= MIN_AGE;
      // 돌연변이: MIN_AGE = 18 → 17 또는 19로 변경
      expect(isAdult(18)).toBe(true);
      expect(isAdult(17)).toBe(false);
    });

    test('루프 카운터 변경 감지', () => {
      const sumArray = (arr: number[]): number => {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) { // i < arr.length
          sum += arr[i];
        }
        return sum;
      };
      // 돌연변이: i < arr.length → i <= arr.length (마지막 요소 중복)
      // 또는 i = 1 시작 (첫 요소 건너뜀)
      expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
      expect(sumArray([])).toBe(0);
      expect(sumArray([10])).toBe(10);
    });
  });

  describe('함수 호출 돌연변이', () => {
    test('함수 호출 제거 감지', () => {
      const processData = (data: string[]): number => {
        const trimmed = data.map(d => d.trim()); // trim() 호출이 중요
        return trimmed.filter(d => d.length > 0).length;
      };
      // 돌연변이: trim() 제거 → 공백이 포함되어 다른 결과
      expect(processData(['hello', ' world ', '  ', 'test'])).toBe(3);
      expect(processData(['  '])).toBe(0);
    });

    test('배열 메서드 변경 감지', () => {
      const findFirst = (arr: number[], target: number): number | undefined => {
        return arr.find(x => x === target); // find 사용
      };
      // 돌연변이: find → filter 변경 → 배열 반환
      expect(findFirst([1, 2, 3, 4], 3)).toBe(3);
      expect(findFirst([1, 2, 3, 4], 5)).toBeUndefined();
    });
  });

  describe('반환값 돌연변이', () => {
    test('반환 값 변경 감지', () => {
      const isEven = (n: number): boolean => {
        if (n % 2 === 0) {
          return true; // 짝수
        }
        return false; // 홀수
      };
      // 돌연변이: true → false, false → true 변경
      expect(isEven(4)).toBe(true);
      expect(isEven(5)).toBe(false);
      expect(isEven(0)).toBe(true);
    });

    test('기본값 변경 감지', () => {
      const getStatus = (code: number): string => {
        switch (code) {
          case 200:
            return 'OK';
          case 404:
            return 'Not Found';
          default:
            return 'Unknown'; // 기본값
        }
      };
      // 돌연변이: 'Unknown' → 'Error' 변경
      expect(getStatus(200)).toBe('OK');
      expect(getStatus(404)).toBe('Not Found');
      expect(getStatus(500)).toBe('Unknown');
    });
  });

  describe('경계값 돌연변이', () => {
    test('경계 조건 <= vs <', () => {
      const isInRange = (n: number): boolean => {
        return n >= 0 && n <= 100; // 0~100 포함
      };
      // 돌연변이: <= → < 변경 → 경계값 실패
      expect(isInRange(0)).toBe(true);
      expect(isInRange(100)).toBe(true);
      expect(isInRange(101)).toBe(false);
      expect(isInRange(-1)).toBe(false);
    });
  });

  describe('테스트 효율성 분석', () => {
    test('강력한 테스트: 많은 돌연변이를 탐지', () => {
      // 이 테스트는 다양한 케이스를 포함해 많은 돌연변이를 잡을 수 있음
      const validate = (email: string): boolean => {
        if (!email) return false; // null/empty 체크
        if (!email.includes('@')) return false; // @ 포함 확인
        if (email.length < 5) return false; // 최소 길이
        return true;
      };

      // 다양한 경계값과 시나리오
      expect(validate('')).toBe(false);
      expect(validate('test')).toBe(false);
      expect(validate('test@')).toBe(true);
      expect(validate('a@b.c')).toBe(true);
      expect(validate('test@example.com')).toBe(true);
    });

    test('약한 테스트: 적은 돌연변이만 탐지', () => {
      const add = (a: number, b: number): number => a + b;
      // 단 하나의 케이스만 테스트 → 많은 돌연변이를 놓칠 수 있음
      expect(add(1, 1)).toBe(2);
      // 음수, 0, 큰 수는 테스트하지 않음
    });
  });
});

/**
 * 돌연변이 테스트 결과 해석
 *
 * Killed Mutations: 테스트가 탐지한 돌연변이 (좋음)
 * Survived Mutations: 테스트가 놓친 돌연변이 (나쁨 - 테스트 품질 향상 필요)
 *
 * 성공 기준: Killed Rate ≥ 80%
 * 즉, 적어도 80% 이상의 돌연변이를 테스트가 탐지해야 함
 */
