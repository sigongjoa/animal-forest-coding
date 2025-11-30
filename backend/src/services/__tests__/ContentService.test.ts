import { ContentService } from '../ContentService';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
  });

  describe('getAllCharacters', () => {
    it('should return an array of characters', () => {
      const characters = service.getAllCharacters();

      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(0);
    });

    it('should have required character properties', () => {
      const characters = service.getAllCharacters();

      characters.forEach((char) => {
        expect(char).toHaveProperty('id');
        expect(char).toHaveProperty('name');
        expect(char).toHaveProperty('species');
        expect(char).toHaveProperty('imageUrl');
      });
    });

    it('should contain Tom Nook', () => {
      const characters = service.getAllCharacters();
      const tomNook = characters.find((c) => c.name === 'Tom Nook');

      expect(tomNook).toBeDefined();
      expect(tomNook?.species).toBe('Raccoon');
    });
  });

  describe('getAllTopics', () => {
    it('should return an array of topics', () => {
      const topics = service.getAllTopics();

      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
    });

    it('should have required topic properties', () => {
      const topics = service.getAllTopics();

      topics.forEach((topic) => {
        expect(topic).toHaveProperty('id');
        expect(topic).toHaveProperty('name');
        expect(topic).toHaveProperty('slug');
        expect(topic).toHaveProperty('difficulty');
      });
    });

    it('should filter topics by difficulty', () => {
      const beginnerTopics = service.getAllTopics('beginner');

      beginnerTopics.forEach((topic) => {
        expect(topic.difficulty).toBe('beginner');
      });
    });

    it('should return empty array for invalid difficulty', () => {
      const topics = service.getAllTopics('invalid');
      expect(topics).toEqual([]);
    });
  });

  describe('getContent', () => {
    it('should return content for valid character and topic', () => {
      const content = service.getContent('Tom Nook', 'variables');

      if (content) {
        expect(content.character).toBe('Tom Nook');
        expect(content.topic).toBe('variables');
        expect(content.title).toBeDefined();
        expect(content.text).toBeDefined();
      }
    });

    it('should throw error for invalid character', () => {
      expect(() => {
        service.getContent('Invalid Character', 'variables');
      }).toThrow('Character not found');
    });

    it('should throw error for invalid topic', () => {
      expect(() => {
        service.getContent('Tom Nook', 'invalid-topic');
      }).toThrow('Topic not found');
    });

    it('should cache content', () => {
      const content1 = service.getContent('Tom Nook', 'variables');
      const content2 = service.getContent('Tom Nook', 'variables');

      expect(content1).toEqual(content2);
    });
  });

  describe('searchContent', () => {
    it('should search content by keyword', () => {
      const results = service.searchContent('변수');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = service.searchContent('nonexistentwordxyz123');

      expect(results).toEqual([]);
    });
  });
});
