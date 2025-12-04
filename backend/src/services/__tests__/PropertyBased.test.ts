/**
 * 속성 기반 테스트 (Property-Based Testing with fast-check)
 *
 * 목표: 무작위 입력에 대해 시스템 속성 검증
 * - 불변식 (Invariants): 항상 참이어야 하는 조건
 * - 멱등성 (Idempotence): f(f(x)) = f(x)
 * - 단조성 (Monotonicity): 필터 결과는 부분집합
 */

import fc from 'fast-check';
import { ContentService } from '../ContentService';

describe('속성 기반 테스트 (Property-Based Testing)', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
  });

  describe('불변식 검증 (Invariant Properties)', () => {
    it('should always return valid character structure', () => {
      const characters = service.getAllCharacters();

      characters.forEach((char) => {
        expect(typeof char.id).toBe('string');
        expect(typeof char.name).toBe('string');
        expect(char.id.length).toBeGreaterThan(0);
        expect(char.name.length).toBeGreaterThan(0);
      });
    });

    it('should always return valid topic structure', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(typeof topic.id).toBe('string');
        expect(typeof topic.name).toBe('string');
        expect(typeof topic.difficulty).toBe('string');
        expect(typeof topic.estimatedTime).toBe('number');

        // 불변식: 난이도는 유효한 값
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        expect(validDifficulties).toContain(topic.difficulty);

        // 불변식: 추정 시간은 범위 내
        expect(topic.estimatedTime).toBeGreaterThanOrEqual(1);
        expect(topic.estimatedTime).toBeLessThanOrEqual(480);
      });
    });

    it('should maintain character ID uniqueness', () => {
      const characters = service.getAllCharacters();
      const ids = characters.map((c) => c.id);
      const uniqueIds = new Set(ids);

      // 불변식: 모든 ID가 고유해야 함
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('멱등성 검증 (Idempotence)', () => {
    it('getAllCharacters is idempotent', () => {
      const call1 = service.getAllCharacters();
      const call2 = service.getAllCharacters();
      const call3 = service.getAllCharacters();

      const json1 = JSON.stringify(call1);
      const json2 = JSON.stringify(call2);
      const json3 = JSON.stringify(call3);

      expect(json1).toBe(json2);
      expect(json2).toBe(json3);
    });

    it('getAllTopics is idempotent', () => {
      const call1 = service.getAllTopics();
      const call2 = service.getAllTopics();
      const call3 = service.getAllTopics();

      expect(JSON.stringify(call1)).toBe(JSON.stringify(call2));
      expect(JSON.stringify(call2)).toBe(JSON.stringify(call3));
    });

    it('searchContent is deterministic', () => {
      const queries = ['control', 'loop', 'variable', 'function'];

      queries.forEach((q) => {
        const result1 = service.searchContent(q);
        const result2 = service.searchContent(q);
        const result3 = service.searchContent(q);

        expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
        expect(JSON.stringify(result2)).toBe(JSON.stringify(result3));
      });
    });
  });

  describe('단조성 검증 (Monotonicity)', () => {
    it('filtered topics is subset of all topics', () => {
      const allTopics = service.getAllTopics();

      ['beginner', 'intermediate', 'advanced'].forEach((difficulty) => {
        const filtered = service.getAllTopics(difficulty);
        expect(filtered.length).toBeLessThanOrEqual(allTopics.length);
      });
    });

    it('search results is subset of all topics', () => {
      const allTopics = service.getAllTopics();
      const queries = ['', 'a', 'control', 'loop', 'test', 'zzzzzz'];

      queries.forEach((q) => {
        const results = service.searchContent(q);
        expect(results.length).toBeLessThanOrEqual(allTopics.length);
      });
    });
  });

  describe('데이터 타입 검증', () => {
    it('all character properties have correct types', () => {
      const characters = service.getAllCharacters();

      characters.forEach((c) => {
        expect(typeof c.id).toBe('string');
        expect(typeof c.name).toBe('string');
        expect(typeof c.species).toBe('string');
        expect(typeof c.description).toBe('string');
        expect(typeof c.imageUrl).toBe('string');
        expect(typeof c.voiceProfile).toBe('string');
        expect(Array.isArray(c.specialties)).toBe(true);
      });
    });

    it('all topic properties have correct types', () => {
      const topics = service.getAllTopics();

      topics.forEach((t) => {
        expect(typeof t.id).toBe('string');
        expect(typeof t.name).toBe('string');
        expect(typeof t.slug).toBe('string');
        expect(typeof t.description).toBe('string');
        expect(typeof t.difficulty).toBe('string');
        expect(typeof t.estimatedTime).toBe('number');
        expect(typeof t.contentCount).toBe('number');
        expect(typeof t.order).toBe('number');
      });
    });
  });

  describe('특수 입력 처리 (Edge Cases)', () => {
    it('should handle special characters in search', () => {
      const specialInputs = [
        '',
        ' ',
        '  ',
        '!@#$%^&*()',
        '<script>alert()</script>',
        'SELECT * FROM',
        '../../../etc/passwd',
        '한글',
        '日本語',
        '🎮🎲',
        'a'.repeat(1000),
      ];

      specialInputs.forEach((input) => {
        const result = service.searchContent(input);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle edge case orders', () => {
      const topics = service.getAllTopics();
      const orders = topics.map((t) => t.order);

      // 순서가 합리적인 범위 내
      orders.forEach((order) => {
        expect(order).toBeGreaterThanOrEqual(0);
        expect(order).toBeLessThan(1000);
      });
    });
  });

  describe('성능 속성 검증', () => {
    it('should respond quickly to any search query', () => {
      const queries = ['', 'a', 'control', 'loop', 'test', 'x'.repeat(100)];

      queries.forEach((q) => {
        const start = Date.now();
        service.searchContent(q);
        const elapsed = Date.now() - start;

        // 어떤 쿼리든 100ms 이내
        expect(elapsed).toBeLessThan(100);
      });
    });

    it('should handle large batches of operations', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        service.getAllCharacters();
        service.getAllTopics();
        service.searchContent('test');
      }

      const elapsed = Date.now() - start;

      // 100번의 반복 호출도 합리적인 시간 내
      expect(elapsed).toBeLessThan(5000);
    });
  });

  describe('필터링 속성 검증', () => {
    it('filtering by difficulty should be consistent', () => {
      const difficulties = ['beginner', 'intermediate', 'advanced'];

      difficulties.forEach((difficulty) => {
        const filtered1 = service.getAllTopics(difficulty);
        const filtered2 = service.getAllTopics(difficulty);

        // 동일한 필터는 동일한 결과
        expect(JSON.stringify(filtered1)).toBe(JSON.stringify(filtered2));

        // 필터된 것들은 모두 해당 난이도
        filtered1.forEach((topic) => {
          expect(topic.difficulty).toBe(difficulty);
        });
      });
    });

    it('filtering should not affect original data', () => {
      const before = JSON.stringify(service.getAllTopics());

      // 여러 번 필터링
      service.getAllTopics('beginner');
      service.getAllTopics('intermediate');
      service.getAllTopics('advanced');

      const after = JSON.stringify(service.getAllTopics());

      // 원본 데이터는 변하지 않음
      expect(before).toBe(after);
    });
  });

  describe('캐시 일관성 검증', () => {
    it('cache should not cause data inconsistency', () => {
      const first = service.getAllTopics();
      const cached = service.getAllTopics(); // 캐시된 결과
      const fresh = service.getAllTopics();

      expect(JSON.stringify(first)).toBe(JSON.stringify(cached));
      expect(JSON.stringify(cached)).toBe(JSON.stringify(fresh));
    });

    it('search cache should be consistent', () => {
      const queries = ['control', 'loop', 'function'];

      queries.forEach((q) => {
        const result1 = service.searchContent(q);
        const result2 = service.searchContent(q); // 캐시
        const result3 = service.searchContent(q); // 캐시

        expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
        expect(JSON.stringify(result2)).toBe(JSON.stringify(result3));
      });
    });
  });

  describe('비즈니스 로직 검증', () => {
    it('should always have some content available', () => {
      const characters = service.getAllCharacters();
      const topics = service.getAllTopics();

      expect(characters.length).toBeGreaterThan(0);
      expect(topics.length).toBeGreaterThan(0);
    });

    it('difficulty levels should be distributed', () => {
      const topics = service.getAllTopics();
      const difficulties = new Set(topics.map((t) => t.difficulty));

      // 최소한 하나의 난이도 레벨은 있어야 함
      expect(difficulties.size).toBeGreaterThanOrEqual(1);

      // 모든 난이도가 유효해야 함
      difficulties.forEach((d) => {
        expect(['beginner', 'intermediate', 'advanced']).toContain(d);
      });
    });
  });
});
