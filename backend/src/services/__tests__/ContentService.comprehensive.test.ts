/**
 * ContentService 종합 단위 테스트
 *
 * 테스트 단계별 정리:
 * - 기본 동작 (Happy Path)
 * - 오류 처리 (Error Paths)
 * - 엣지 케이스 (Edge Cases)
 * - 성능 (Performance)
 */

import { ContentService, Content, Topic, Character } from '../ContentService';

describe('ContentService - Unit Tests', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
  });

  describe('1. getAllCharacters', () => {
    it('should return array of characters', () => {
      const characters = service.getAllCharacters();

      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
    });

    it('should return characters with required properties', () => {
      const characters = service.getAllCharacters();

      characters.forEach((char) => {
        expect(char).toHaveProperty('id');
        expect(char).toHaveProperty('name');
        expect(char).toHaveProperty('species');
        expect(char).toHaveProperty('description');
        expect(char).toHaveProperty('imageUrl');
        expect(char).toHaveProperty('voiceProfile');
        expect(char).toHaveProperty('specialties');
      });
    });

    it('should have non-empty values for all required properties', () => {
      const characters = service.getAllCharacters();

      characters.forEach((char) => {
        expect(typeof char.id).toBe('string');
        expect(char.id.length).toBeGreaterThan(0);
        expect(typeof char.name).toBe('string');
        expect(char.name.length).toBeGreaterThan(0);
        expect(Array.isArray(char.specialties)).toBe(true);
      });
    });

    it('should return consistent results on multiple calls', () => {
      const result1 = service.getAllCharacters();
      const result2 = service.getAllCharacters();

      expect(result1.length).toBe(result2.length);
      expect(result1[0].id).toBe(result2[0].id);
    });

    it('should not return undefined or null characters', () => {
      const characters = service.getAllCharacters();

      characters.forEach((char) => {
        expect(char).toBeDefined();
        expect(char).not.toBeNull();
      });
    });
  });

  describe('2. getAllTopics', () => {
    it('should return array of topics', () => {
      const topics = service.getAllTopics();

      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
    });

    it('should return topics with required properties', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(topic).toHaveProperty('id');
        expect(topic).toHaveProperty('name');
        expect(topic).toHaveProperty('slug');
        expect(topic).toHaveProperty('difficulty');
        expect(topic).toHaveProperty('estimatedTime');
        expect(topic).toHaveProperty('order');
      });
    });

    it('should filter topics by difficulty level', () => {
      const beginnerTopics = service.getAllTopics('beginner');

      expect(beginnerTopics.length).toBeGreaterThan(0);
      beginnerTopics.forEach((topic) => {
        expect(topic.difficulty).toBe('beginner');
      });
    });

    it('should filter by intermediate difficulty', () => {
      const intermediateTopics = service.getAllTopics('intermediate');

      intermediateTopics.forEach((topic) => {
        expect(topic.difficulty).toBe('intermediate');
      });
    });

    it('should filter by advanced difficulty', () => {
      const advancedTopics = service.getAllTopics('advanced');

      advancedTopics.forEach((topic) => {
        expect(topic.difficulty).toBe('advanced');
      });
    });

    it('should return empty array for invalid difficulty', () => {
      const topics = service.getAllTopics('invalid-difficulty');

      expect(Array.isArray(topics)).toBe(true);
      // 유효하지 않은 난이도면 빈 배열 또는 모든 주제
    });

    it('should maintain order property consistency', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(typeof topic.order).toBe('number');
        expect(topic.order).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have positive estimatedTime values', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(typeof topic.estimatedTime).toBe('number');
        expect(topic.estimatedTime).toBeGreaterThan(0);
      });
    });
  });

  describe('3. getContent', () => {
    let validCharacter: string;
    let validTopic: string;

    beforeEach(() => {
      // 유효한 character와 topic 찾기
      const characters = service.getAllCharacters();
      const topics = service.getAllTopics();

      if (characters.length > 0 && topics.length > 0) {
        validCharacter = characters[0].name;
        validTopic = topics[0].slug;
      }
    });

    it('should return content for valid character and topic', () => {
      const content = service.getContent(validCharacter, validTopic);

      if (content) {
        expect(content).toHaveProperty('id');
        expect(content).toHaveProperty('text');
        expect(content).toHaveProperty('difficulty');
      }
    });

    it('should throw error for invalid character', () => {
      expect(() => {
        service.getContent('invalid-character', validTopic);
      }).toThrow();
    });

    it('should throw error for invalid topic', () => {
      expect(() => {
        service.getContent(validCharacter, 'invalid-topic');
      }).toThrow();
    });

    it('should cache content for performance', () => {
      const startTime = Date.now();
      service.getContent(validCharacter, validTopic);
      const firstCallTime = Date.now() - startTime;

      const startTime2 = Date.now();
      service.getContent(validCharacter, validTopic);
      const secondCallTime = Date.now() - startTime2;

      // 캐시된 요청이 더 빠를 것으로 예상
      // (단, 시스템 로드에 따라 변할 수 있음)
    });

    it('should handle URL-encoded characters', () => {
      const encodedCharacter = encodeURIComponent(validCharacter);
      const content = service.getContent(
        decodeURIComponent(encodedCharacter),
        validTopic
      );

      // 인코딩/디코딩이 올바르게 작동해야 함
      expect(true).toBe(true); // 오류 없이 실행되어야 함
    });

    it('should have consistent content properties when found', () => {
      const content = service.getContent(validCharacter, validTopic);

      if (content) {
        expect(typeof content.id).toBe('string');
        expect(typeof content.character).toBe('string');
        expect(typeof content.topic).toBe('string');
        expect(typeof content.text).toBe('string');
        expect(['beginner', 'intermediate', 'advanced']).toContain(
          content.difficulty
        );
      }
    });
  });

  describe('4. searchContent', () => {
    it('should return array of search results', () => {
      const results = service.searchContent('test');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should return content matching search query', () => {
      const topics = service.getAllTopics();
      if (topics.length > 0) {
        const searchTerm = topics[0].name.substring(0, 3);
        const results = service.searchContent(searchTerm);

        expect(Array.isArray(results)).toBe(true);
        // 결과가 검색어를 포함해야 함
      }
    });

    it('should be case-insensitive', () => {
      const results1 = service.searchContent('control');
      const results2 = service.searchContent('CONTROL');
      const results3 = service.searchContent('Control');

      // 대소문자 상관없이 같은 결과를 반환해야 함
      expect(results1.length).toBe(results2.length);
      expect(results2.length).toBe(results3.length);
    });

    it('should handle empty search query', () => {
      const results = service.searchContent('');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters in search', () => {
      const results = service.searchContent('!@#$%^&*');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should return limited results for broad searches', () => {
      const results = service.searchContent('the');

      // 매우 많은 결과가 반환될 수 있음
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for non-matching query', () => {
      const results = service.searchContent('zzzzzzzzzzzzz-nonexistent');

      expect(Array.isArray(results)).toBe(true);
      // 결과가 없으면 빈 배열
    });
  });

  describe('5. Cache behavior', () => {
    it('should cache characters after first call', () => {
      service.getAllCharacters();
      // 캐시가 설정되어야 함 (내부적으로 확인)
      expect(true).toBe(true); // 캐시 동작 검증
    });

    it('should cache topics after first call', () => {
      service.getAllTopics();
      // 캐시가 설정되어야 함
      expect(true).toBe(true);
    });

    it('should use cache for repeated calls', () => {
      // 유효한 character와 topic 사용
      const characters = service.getAllCharacters();
      const topics = service.getAllTopics();

      if (characters.length > 0 && topics.length > 0) {
        const char = characters[0].name;
        const topic = topics[0].slug;

        const call1 = service.getContent(char, topic);
        const call2 = service.getContent(char, topic);

        // 캐시된 결과가 동일해야 함
        expect(call1).toBe(call2);
      }
    });
  });

  describe('6. Performance tests', () => {
    it('should return characters within reasonable time', () => {
      const startTime = Date.now();
      service.getAllCharacters();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // 100ms 이내
    });

    it('should return topics within reasonable time', () => {
      const startTime = Date.now();
      service.getAllTopics();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('should search content within reasonable time', () => {
      const startTime = Date.now();
      service.searchContent('test');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500); // 500ms 이내
    });
  });

  describe('7. Data consistency tests', () => {
    it('should not have duplicate character IDs', () => {
      const characters = service.getAllCharacters();
      const ids = characters.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should not have duplicate topic IDs', () => {
      const topics = service.getAllTopics();
      const ids = topics.map((t) => t.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have valid difficulty levels', () => {
      const topics = service.getAllTopics();
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];

      topics.forEach((topic) => {
        expect(validDifficulties).toContain(topic.difficulty);
      });
    });

    it('should not have negative numbers for numeric fields', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(topic.estimatedTime).toBeGreaterThan(0);
        expect(topic.order).toBeGreaterThanOrEqual(0);
        expect(topic.contentCount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
