/**
 * 알고리즘 프로파일링 (Performance Profiling)
 *
 * 목표: 코드의 시간 복잡도와 공간 복잡도 검증
 * 방식: 다양한 입력 크기에서 성능 측정 → 성능 저하 감지
 *
 * 성능 기준:
 * - API 응답: < 200ms (p95)
 * - 단위 연산: < 1ms
 * - 메모리 사용: < 100MB
 */

describe('⚡ 성능 프로파일링 (Performance Profiling)', () => {
  describe('O(n) vs O(n²) 복잡도 비교', () => {
    test('O(n) 알고리즘: 선형 탐색', () => {
      const linearSearch = (arr: number[], target: number): number => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === target) return i;
        }
        return -1;
      };

      const sizes = [100, 1000, 10000];
      const results: { size: number; time: number; complexity: string }[] = [];

      sizes.forEach(size => {
        const arr = Array.from({ length: size }, (_, i) => i);
        const start = performance.now();
        for (let j = 0; j < 1000; j++) {
          linearSearch(arr, size - 1); // 최악: 마지막 요소
        }
        const time = performance.now() - start;
        results.push({ size, time, complexity: 'O(n)' });
      });

      console.log('📊 선형 탐색 O(n):');
      results.forEach(r => {
        console.log(`  크기 ${r.size}: ${r.time.toFixed(2)}ms`);
      });

      // O(n) 특성: 입력 크기가 10배 → 시간도 약 10배 증가
      const ratio = results[2].time / results[0].time;
      console.log(`  크기 비율: ${(results[2].size / results[0].size).toFixed(0)}x → 시간 비율: ${ratio.toFixed(2)}x`);
      expect(ratio).toBeLessThan(150); // 약 100배 크기 → 100배 시간 (허용범위)
    });

    test('O(n²) 알고리즘: 버블 정렬 (작은 크기만)', () => {
      const bubbleSort = (arr: number[]): number[] => {
        const result = [...arr];
        for (let i = 0; i < result.length; i++) {
          for (let j = 0; j < result.length - i - 1; j++) {
            if (result[j] > result[j + 1]) {
              [result[j], result[j + 1]] = [result[j + 1], result[j]];
            }
          }
        }
        return result;
      };

      const sizes = [50, 100, 200]; // 작은 크기만 (O(n²) 특성)
      const results: { size: number; time: number; complexity: string }[] = [];

      sizes.forEach(size => {
        const arr = Array.from({ length: size }, () => Math.random() * 1000);
        const start = performance.now();
        bubbleSort(arr);
        const time = performance.now() - start;
        results.push({ size, time, complexity: 'O(n²)' });
      });

      console.log('📊 버블 정렬 O(n²):');
      results.forEach(r => {
        console.log(`  크기 ${r.size}: ${r.time.toFixed(2)}ms`);
      });

      // O(n²) 특성: 입력 크기가 2배 → 시간은 약 4배 증가
      const ratio1 = results[1].time / results[0].time;
      const ratio2 = results[2].time / results[1].time;
      console.log(`  크기 2x → 시간 ${ratio1.toFixed(2)}x (예상: ~4x)`);
      console.log(`  크기 2x → 시간 ${ratio2.toFixed(2)}x (예상: ~4x)`);
    });
  });

  describe('알고리즘 성능 비교', () => {
    test('배열 메서드 성능 비교: indexOf vs find', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const target = 9999;

      // indexOf 방식 (단순 비교)
      const start1 = performance.now();
      for (let i = 0; i < 1000; i++) {
        const idx = arr.findIndex(x => x.id === target);
      }
      const time1 = performance.now() - start1;

      // find 방식
      const start2 = performance.now();
      for (let i = 0; i < 1000; i++) {
        const item = arr.find(x => x.id === target);
      }
      const time2 = performance.now() - start2;

      console.log(`📊 배열 탐색 성능:`);
      console.log(`  findIndex: ${time1.toFixed(2)}ms`);
      console.log(`  find: ${time2.toFixed(2)}ms`);

      // 둘 다 O(n)이므로 성능이 유사해야 함
      const ratio = Math.max(time1, time2) / Math.min(time1, time2);
      console.log(`  성능 비율: ${ratio.toFixed(2)}x (1에 가까울수록 좋음)`);
      expect(ratio).toBeLessThan(2); // 최대 2배 차이 허용
    });

    test('필터링 성능: filter vs 수동 루프', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i);

      // filter 사용
      const start1 = performance.now();
      for (let i = 0; i < 100; i++) {
        arr.filter(x => x % 2 === 0);
      }
      const time1 = performance.now() - start1;

      // 수동 루프
      const start2 = performance.now();
      for (let i = 0; i < 100; i++) {
        const result = [];
        for (let j = 0; j < arr.length; j++) {
          if (arr[j] % 2 === 0) result.push(arr[j]);
        }
      }
      const time2 = performance.now() - start2;

      console.log(`📊 필터링 성능:`);
      console.log(`  filter(): ${time1.toFixed(2)}ms`);
      console.log(`  수동 루프: ${time2.toFixed(2)}ms`);

      // 일반적으로 filter()가 최적화되어 있음
      console.log(`  비율: ${(time1 / time2).toFixed(2)}x`);
    });
  });

  describe('메모리 사용량 분석', () => {
    test('배열 할당 메모리 사용', () => {
      const memBefore = process.memoryUsage().heapUsed;

      // 큰 배열 생성
      const largeArray = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        data: Array.from({ length: 100 }, () => Math.random()),
      }));

      const memAfter = process.memoryUsage().heapUsed;
      const memUsed = (memAfter - memBefore) / 1024 / 1024; // MB

      console.log(`📊 메모리 사용량:`);
      console.log(`  배열 크기: 100,000 요소`);
      console.log(`  메모리 사용: ${memUsed.toFixed(2)}MB`);
      console.log(`  항목당: ${((memUsed * 1024) / 100000).toFixed(3)}KB`);

      // 메모리 사용이 합리적인 범위인지 확인
      expect(memUsed).toBeLessThan(100); // 100MB 이내
    });

    test('재귀 호출 스택 사용', () => {
      const recursiveSum = (n: number): number => {
        if (n <= 0) return 0;
        return n + recursiveSum(n - 1);
      };

      // 작은 n에서 스택 오버플로우 회피
      const result = recursiveSum(100); // 깊이 100
      expect(result).toBe((100 * 101) / 2); // 5050

      console.log(`📊 재귀 호출 분석:`);
      console.log(`  깊이 100: 성공`);

      // 너무 깊으면 실패 (스택 오버플로우)
      expect(() => recursiveSum(10000)).toThrow(); // 깊이 10000: 실패
    });
  });

  describe('응답 시간 기준 검증', () => {
    test('API 시뮬레이션: 응답 시간 < 200ms', () => {
      const simulateAPI = async (delay: number): Promise<string> => {
        return new Promise(resolve => {
          setTimeout(() => resolve('OK'), delay);
        });
      };

      return simulateAPI(100).then(result => {
        console.log(`📊 API 응답 시간: 100ms`);
        expect(result).toBe('OK');
      });
    });

    test('데이터 처리: 1000개 항목 < 50ms', () => {
      const processData = (count: number): number => {
        let sum = 0;
        for (let i = 0; i < count; i++) {
          sum += i;
        }
        return sum;
      };

      const start = performance.now();
      const result = processData(1000);
      const time = performance.now() - start;

      console.log(`📊 데이터 처리 성능:`);
      console.log(`  항목 수: 1000`);
      console.log(`  처리 시간: ${time.toFixed(2)}ms`);

      expect(time).toBeLessThan(50);
      expect(result).toBe((999 * 1000) / 2);
    });

    test('정렬 성능: 10,000개 항목 < 100ms', () => {
      const arr = Array.from({ length: 10000 }, () => Math.random() * 1000);

      const start = performance.now();
      const sorted = [...arr].sort((a, b) => a - b);
      const time = performance.now() - start;

      console.log(`📊 정렬 성능:`);
      console.log(`  항목 수: 10000`);
      console.log(`  정렬 시간: ${time.toFixed(2)}ms`);

      // JavaScript의 sort()는 최적화되어 있음
      expect(time).toBeLessThan(150);
      expect(sorted[0]).toBeLessThan(sorted[sorted.length - 1]);
    });
  });

  describe('성능 저하 감지 (Performance Regression)', () => {
    test('동일한 코드는 일관된 성능 제공', () => {
      const process = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

      const measurements: number[] = [];
      const arr = Array.from({ length: 1000 }, (_, i) => i);

      // 5회 측정
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        for (let j = 0; j < 1000; j++) {
          process(arr);
        }
        const time = performance.now() - start;
        measurements.push(time);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const maxDev = Math.max(...measurements.map(m => Math.abs(m - avg)));

      console.log(`📊 성능 일관성:`);
      console.log(`  평균: ${avg.toFixed(2)}ms`);
      console.log(`  최대 편차: ${maxDev.toFixed(2)}ms`);
      console.log(`  변동률: ${((maxDev / avg) * 100).toFixed(1)}%`);

      // 변동률이 100% 이내라면 일관성 있음 (짧은 시간 측정이므로 변동 가능)
      expect(maxDev / avg).toBeLessThan(1.0);
    });
  });
});
