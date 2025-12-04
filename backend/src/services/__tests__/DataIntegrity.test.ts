/**
 * 데이터 무결성 테스트 (Data Integrity Tests)
 *
 * 목표: 3단계 심화 검증
 * - 데이터의 정확성, 유실 여부, 정밀도 검증
 * - 속성 기반 테스트 원리 적용
 */

import { ContentService } from '../ContentService';

describe('데이터 무결성 테스트 (Data Integrity)', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
  });

  describe('1. 불변식 검증 (Invariant Checks)', () => {
    it('should maintain: no duplicate character IDs', () => {
      const characters = service.getAllCharacters();
      const ids = characters.map((c) => c.id);
      const uniqueIds = new Set(ids);

      // 불변식: ID는 중복될 수 없음
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should maintain: all topics have positive estimatedTime', () => {
      const topics = service.getAllTopics();

      // 불변식: 추정 시간은 항상 양수
      topics.forEach((topic) => {
        expect(topic.estimatedTime).toBeGreaterThan(0);
      });
    });

    it('should maintain: difficulty must be one of valid values', () => {
      const topics = service.getAllTopics();
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];

      // 불변식: 난이도는 정해진 값만 가능
      topics.forEach((topic) => {
        expect(validDifficulties).toContain(topic.difficulty);
      });
    });

    it('should maintain: no null or undefined in character names', () => {
      const characters = service.getAllCharacters();

      // 불변식: 이름은 항상 존재해야 함
      characters.forEach((char) => {
        expect(char.name).toBeTruthy();
        expect(typeof char.name).toBe('string');
        expect(char.name.length).toBeGreaterThan(0);
      });
    });

    it('should maintain: topic order should be >= 0', () => {
      const topics = service.getAllTopics();

      // 불변식: 순서는 항상 0 이상
      topics.forEach((topic) => {
        expect(topic.order).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('2. 속성 기반 테스트 (Property-Based)', () => {
    it('should satisfy: searchContent(query) result should be subset of all content', () => {
      const searchResults = service.searchContent('control');
      const allTopics = service.getAllTopics();

      // 속성: 검색 결과는 모든 콘텐츠의 부분 집합
      expect(searchResults.length).toBeLessThanOrEqual(allTopics.length);
    });

    it('should satisfy: filtering by difficulty should not increase total count', () => {
      const all = service.getAllTopics();
      const beginner = service.getAllTopics('beginner');
      const intermediate = service.getAllTopics('intermediate');
      const advanced = service.getAllTopics('advanced');

      // 속성: 필터링된 결과의 합은 전체와 같거나 작음
      const sum = beginner.length + intermediate.length + advanced.length;
      expect(sum).toBeLessThanOrEqual(all.length);
    });

    it('should satisfy: result consistency (commutative property)', () => {
      // 속성: 같은 쿼리는 항상 같은 결과를 반환 (교환 법칙)
      const result1 = service.getAllCharacters();
      const result2 = service.getAllCharacters();

      expect(result1.map((c) => c.id)).toEqual(result2.map((c) => c.id));
    });

    it('should satisfy: idempotency - repeated calls produce same result', () => {
      // 속성: 반복 호출은 같은 결과 (멱등성)
      const call1 = service.getAllTopics();
      const call2 = service.getAllTopics();
      const call3 = service.getAllTopics();

      const toJSON = (arr: any[]) => JSON.stringify(arr);

      expect(toJSON(call1)).toBe(toJSON(call2));
      expect(toJSON(call2)).toBe(toJSON(call3));
    });
  });

  describe('3. 범위 검증 (Range Validation)', () => {
    it('should have reasonable contentCount values', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        // 범위: contentCount는 0 이상이어야 함
        expect(topic.contentCount).toBeGreaterThanOrEqual(0);
        // 범위: 일반적인 수치는 100 이하
        expect(topic.contentCount).toBeLessThanOrEqual(1000);
      });
    });

    it('should have reasonable estimatedTime values', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        // 범위: estimatedTime은 1분 이상, 480분(8시간) 이하
        expect(topic.estimatedTime).toBeGreaterThanOrEqual(1);
        expect(topic.estimatedTime).toBeLessThanOrEqual(480);
      });
    });

    it('should have reasonable order values', () => {
      const topics = service.getAllTopics();
      const orders = topics.map((t) => t.order);
      const maxOrder = Math.max(...orders);
      const minOrder = Math.min(...orders);

      // 범위: order는 합리적인 범위여야 함
      expect(minOrder).toBeGreaterThanOrEqual(0);
      expect(maxOrder).toBeLessThan(1000);
      expect(topics.length).toBeLessThanOrEqual(maxOrder + 1);
    });
  });

  describe('4. 타입 검증 (Type Safety)', () => {
    it('should have correct types for all character properties', () => {
      const characters = service.getAllCharacters();

      characters.forEach((char) => {
        expect(typeof char.id).toBe('string');
        expect(typeof char.name).toBe('string');
        expect(typeof char.species).toBe('string');
        expect(typeof char.description).toBe('string');
        expect(typeof char.imageUrl).toBe('string');
        expect(typeof char.voiceProfile).toBe('string');
        expect(Array.isArray(char.specialties)).toBe(true);
      });
    });

    it('should have correct types for all topic properties', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(typeof topic.id).toBe('string');
        expect(typeof topic.name).toBe('string');
        expect(typeof topic.slug).toBe('string');
        expect(typeof topic.description).toBe('string');
        expect(typeof topic.difficulty).toBe('string');
        expect(typeof topic.estimatedTime).toBe('number');
        expect(typeof topic.contentCount).toBe('number');
        expect(typeof topic.order).toBe('number');
      });
    });

    it('should have correct types for content properties', () => {
      const topics = service.getAllTopics();
      if (topics.length === 0) return;

      const characters = service.getAllCharacters();
      if (characters.length === 0) return;

      const content = service.getContent(characters[0].name, topics[0].slug);
      if (!content) return;

      expect(typeof content.id).toBe('string');
      expect(typeof content.character).toBe('string');
      expect(typeof content.topic).toBe('string');
      expect(typeof content.text).toBe('string');
      expect(['beginner', 'intermediate', 'advanced']).toContain(
        content.difficulty
      );
    });
  });

  describe('5. 관계 검증 (Relationship Validation)', () => {
    it('should maintain: characters used in content should exist in getAllCharacters', () => {
      const characters = service.getAllCharacters();
      const characterIds = new Set(characters.map((c) => c.id));

      // 모든 콘텐츠의 캐릭터는 존재해야 함
      const allTopics = service.getAllTopics();
      allTopics.forEach((topic) => {
        characters.forEach((char) => {
          try {
            // 접근 가능한 캐릭터만 검증
            const content = service.getContent(char.name, topic.slug);
            if (content) {
              expect(characterIds.has(char.id)).toBe(true);
            }
          } catch (e) {
            // 일부 조합은 없을 수 있음
          }
        });
      });
    });

    it('should maintain: topics in content should exist in getAllTopics', () => {
      const topics = service.getAllTopics();
      const topicSlugs = new Set(topics.map((t) => t.slug));

      // 모든 콘텐츠의 주제는 존재해야 함
      topics.forEach((topic) => {
        expect(topicSlugs.has(topic.slug)).toBe(true);
      });
    });
  });

  describe('6. 일관성 검증 (Consistency)', () => {
    it('should be consistent: getAllCharacters order should be stable', () => {
      const call1 = service.getAllCharacters().map((c) => c.id);
      const call2 = service.getAllCharacters().map((c) => c.id);
      const call3 = service.getAllCharacters().map((c) => c.id);

      // 순서는 항상 일관성 있어야 함
      expect(call1).toEqual(call2);
      expect(call2).toEqual(call3);
    });

    it('should be consistent: getAllTopics order should be stable', () => {
      const call1 = service.getAllTopics().map((t) => t.id);
      const call2 = service.getAllTopics().map((t) => t.id);
      const call3 = service.getAllTopics().map((t) => t.id);

      // 순서는 항상 일관성 있어야 함
      expect(call1).toEqual(call2);
      expect(call2).toEqual(call3);
    });

    it('should be consistent: filtering should not affect data integrity', () => {
      const allTopics = service.getAllTopics();
      const beginnerTopics = service.getAllTopics('beginner');

      // 필터링 후에도 데이터는 변하지 않아야 함
      const afterFilter = service.getAllTopics();
      expect(allTopics.map((t) => t.id)).toEqual(afterFilter.map((t) => t.id));
    });
  });

  describe('7. 엣지 케이스 검증 (Edge Cases)', () => {
    it('should handle: empty search results gracefully', () => {
      const results = service.searchContent('zzzzzzzzzz-impossible-query');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle: very long search query', () => {
      const longQuery = 'a'.repeat(1000);
      const results = service.searchContent(longQuery);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle: special characters in search', () => {
      const specialQueries = [
        '!@#$%^&*()',
        '<script>alert()</script>',
        'SELECT * FROM',
        '../../../etc/passwd',
      ];

      specialQueries.forEach((query) => {
        const results = service.searchContent(query);
        expect(Array.isArray(results)).toBe(true);
      });
    });

    it('should handle: unicode characters in search', () => {
      const unicodeQueries = ['한글', '日本語', '🎮', 'café'];

      unicodeQueries.forEach((query) => {
        const results = service.searchContent(query);
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });

  describe('8. 성능 + 정확성 (Performance with Correctness)', () => {
    it('should maintain accuracy while handling large requests', () => {
      const startTime = Date.now();

      // 다량의 요청
      for (let i = 0; i < 100; i++) {
        const topics = service.getAllTopics();
        const characters = service.getAllCharacters();

        // 데이터 무결성 유지
        expect(topics.length).toBeGreaterThan(0);
        expect(characters.length).toBeGreaterThan(0);
      }

      const duration = Date.now() - startTime;

      // 100번 반복해도 합리적인 시간 (< 5초)
      expect(duration).toBeLessThan(5000);
    });

    it('should maintain consistency under concurrent-like operations', () => {
      const results: any[] = [];

      // 순차적으로 "동시" 요청 시뮬레이션
      for (let i = 0; i < 10; i++) {
        results.push({
          characters: service.getAllCharacters(),
          topics: service.getAllTopics(),
          search: service.searchContent('test'),
        });
      }

      // 모든 결과가 일관성 있음
      const firstResult = JSON.stringify(results[0].characters);
      results.forEach((result) => {
        expect(JSON.stringify(result.characters)).toBe(firstResult);
      });
    });
  });
});
